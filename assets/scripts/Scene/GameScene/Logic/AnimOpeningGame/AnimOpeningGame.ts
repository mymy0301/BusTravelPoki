import { _decorator, CCFloat, Component, Layout, Node, Size, Tween, tween, UIOpacity, Vec2, Vec3, Widget } from 'cc';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { GameManager } from '../../../GameManager';
import { TYPE_GAME } from 'db://assets/scripts/Configs/MConfigs';
const { ccclass, property } = _decorator;

export enum TYPE_SHOW {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT
}

@ccclass('AnimOpeningGame')
export class AnimOpeningGame extends Component {
    @property({ group: { name: "Top", id: '0' }, type: [Node] }) listNTop: Node[] = [];
    @property({ group: { name: "Bottom", id: '1' }, type: [Node] }) listNBottom: Node[] = [];
    @property({ group: { name: "Left", id: '2' }, type: [Node] }) listNLeft: Node[] = [];
    @property({ group: { name: "Right", id: '3' }, type: [Node] }) listNRight: Node[] = [];

    @property(Node) nReplayWithFriend: Node;

    @property(Layout) nLayoutBottom: Layout;

    @property(CCFloat) timeLongestOpening: number = 1;
    @property(CCFloat) timeMustDoneOpening: number = 0.8;
    @property(CCFloat) timeLongestHide: number = 0.8;
    @property(CCFloat) timeMustDoneHide: number = 0.5;
    @property(CCFloat) timeWaitDoneWhenTween: number = 0.2;

    private mapBaseWPosNTop: Map<string, Vec3> = new Map();
    private mapBaseWPosNBottom: Map<string, Vec3> = new Map();
    private mapBaseWPosNLeft: Map<string, Vec3> = new Map();
    private mapBaseWPosNRight: Map<string, Vec3> = new Map();
    private mapToWPosNTop: Map<string, Vec3> = new Map();
    private mapToWPosNBottom: Map<string, Vec3> = new Map();
    private mapToWPosNLeft: Map<string, Vec3> = new Map();
    private mapToWPosNRight: Map<string, Vec3> = new Map();

    public InitPosition() {
        let isFitHight: boolean = Utils.isFitHeight();
        let changeX: number = 0;
        let scaleWindow = Utils.getScaleWindow();
        if (isFitHight) {
            changeX = (scaleWindow - 1) * 720 / 2;
        }
        for (let i = 0; i < this.listNLeft.length; i++) {
            this.listNLeft[i].position = new Vec3(this.listNLeft[i].position.x - changeX, this.listNLeft[i].position.y, this.listNLeft[i].position.z);
        }

        for (let i = 0; i < this.listNRight.length; i++) {
            this.listNRight[i].position = new Vec3(this.listNRight[i].position.x + changeX, this.listNRight[i].position.y, this.listNRight[i].position.z);
        }
    }

    public PrepareToShowUp() {
        const SSDefault = Utils.getSizeDefault();
        const sizeScreen: Size = Utils.getSizeWindow();
        const distanceRange: number = (sizeScreen.width - SSDefault.width * (SSDefault.width < sizeScreen.width ? 1 : Utils.getRightScaleSizeWindow())) / 2;
        const widthScreenTrue: number = sizeScreen.width - distanceRange * 2;

        function prepareListData(listNode: Node[], mapBaseWPos: Map<string, Vec3>, mapToWPos: Map<string, Vec3>, type: 'Top' | 'Bottom' | 'Left' | 'Right') {
            listNode.forEach((nNode) => {
                nNode.getComponent(Widget)?.updateAlignment();
                
                const wPosNow: Vec3 = nNode.worldPosition.clone();
                mapBaseWPos.set(nNode.uuid, wPosNow.clone());
                // disable widget
                if (nNode.getComponent(Widget) != null) nNode.getComponent(Widget).enabled = false;
                switch (type) {
                    case 'Top': nNode.worldPosition = new Vec3(wPosNow.x, wPosNow.y + (sizeScreen.height - wPosNow.y) * 2, wPosNow.z); break;
                    case 'Bottom': nNode.worldPosition = new Vec3(wPosNow.x, -wPosNow.y, wPosNow.z); break;
                    case 'Left': nNode.worldPosition = new Vec3(wPosNow.x - (wPosNow.x - distanceRange) * 2, wPosNow.y, wPosNow.z); break;
                    case 'Right': nNode.worldPosition = new Vec3(widthScreenTrue + distanceRange + (widthScreenTrue + distanceRange - wPosNow.x), wPosNow.y, wPosNow.z); break;
                }
                mapToWPos.set(nNode.uuid, wPosNow.clone());
                // opacity
                if (nNode.getComponent(UIOpacity) != null) {
                    nNode.getComponent(UIOpacity).opacity = 0;
                }
            })
        }

        // active btn and update widget to get the right pos
        if (GameManager.Instance != null && GameManager.Instance.TypeGamePlay == TYPE_GAME.WITH_FRIEND) {
            this.nReplayWithFriend.active = true;
            this.nReplayWithFriend.getComponent(Widget).updateAlignment();
        }

        prepareListData(this.listNTop, this.mapBaseWPosNTop, this.mapToWPosNTop, 'Top');
        prepareListData(this.listNBottom, this.mapBaseWPosNBottom, this.mapToWPosNBottom, 'Bottom');
        prepareListData(this.listNLeft, this.mapBaseWPosNLeft, this.mapToWPosNLeft, 'Left');
        prepareListData(this.listNRight, this.mapBaseWPosNRight, this.mapToWPosNRight, 'Right');

        // turn off layout bottom
        this.nLayoutBottom.enabled = false;
    }

    /**
     * This func just can call once time on game until it destroy
     * @returns 
     */
    public async AnimOpeningGame() {
        //return valid node
        if (!this.node.isValid) { return; }

        const self = this;
        async function MoveListNode(listNode: Node[], mapBaseWPos: Map<string, Vec3>) {
            for (let i = 0; i < listNode.length; i++) {
                const nNode: Node = listNode[i];
                const opaCom: UIOpacity = nNode.getComponent(UIOpacity);

                // tween move up
                Tween.stopAllByTarget(nNode)
                tween(nNode)
                    .to(self.timeMustDoneOpening, { worldPosition: mapBaseWPos.get(nNode.uuid) }, {
                        easing: 'backOut',
                        onUpdate(target, ratio) {
                            if (opaCom != null) {
                                opaCom.opacity = ratio * 255;
                            }
                        },
                    })
                    .start();

                await Utils.delay((self.timeLongestOpening - self.timeMustDoneOpening) / listNode.length * 1000);
            }
        }

        MoveListNode(this.listNTop, new Map(this.mapBaseWPosNTop));
        MoveListNode(this.listNBottom, new Map(this.mapBaseWPosNBottom));
        MoveListNode(this.listNLeft, new Map(this.mapBaseWPosNLeft));
        MoveListNode(this.listNRight, new Map(this.mapBaseWPosNRight));

        await Utils.delay(this.timeLongestOpening * 1000);
    }


    /**
     * This func will be call in this case
     * 1. openShop
     * 2. WinGame
     * 3. Ensure Lose Game
     */
    public async AnimHideUIGame() {
        const self = this;
        async function MoveListNode(listNode: Node[], mapToWPos: Map<string, Vec3>) {
            for (let i = 0; i < listNode.length; i++) {
                const nNode: Node = listNode[i];
                const opaCom: UIOpacity = nNode.getComponent(UIOpacity);

                // tween move down
                Tween.stopAllByTarget(nNode)
                tween(nNode)
                    .to(self.timeMustDoneHide, { worldPosition: mapToWPos.get(nNode.uuid) }, {
                        easing: 'backIn',
                        onUpdate(target, ratio) {
                            if (opaCom != null) {
                                opaCom.opacity = (1 - ratio) * 255;
                            }
                        },
                    })
                    .start();

                await Utils.delay((self.timeLongestHide - self.timeMustDoneHide) / listNode.length * 1000);
            }
        }

        MoveListNode(this.listNTop, new Map(this.mapToWPosNTop));
        MoveListNode(this.listNBottom, new Map(this.mapToWPosNBottom));
        MoveListNode(this.listNLeft, new Map(this.mapToWPosNLeft));
        MoveListNode(this.listNRight, new Map(this.mapToWPosNRight));

        await Utils.delay(this.timeLongestHide * 1000);
    }

    private CaculateWPosOutScreen(wPosStart: Vec3, typeShow: TYPE_SHOW): Vec3 {
        const sizeScreen: Size = Utils.getSizeWindow();
        const distanceRange: number = (sizeScreen.width - Utils.getSizeDefault().width * Utils.getRightScaleSizeWindow()) / 2;
        const widthScreenTrue: number = sizeScreen.width - distanceRange * 2;

        function prepareListData(wPosNow: Vec3, type: TYPE_SHOW) {
            switch (type) {
                case TYPE_SHOW.TOP: return new Vec3(wPosNow.x, wPosNow.y + (sizeScreen.height - wPosNow.y) * 2, wPosNow.z); break;
                case TYPE_SHOW.BOTTOM: return new Vec3(wPosNow.x, -wPosNow.y, wPosNow.z); break;
                case TYPE_SHOW.LEFT: return new Vec3(wPosNow.x - (wPosNow.x - distanceRange) * 2, wPosNow.y, wPosNow.z); break;
                case TYPE_SHOW.RIGHT: return new Vec3(widthScreenTrue + distanceRange + (widthScreenTrue + distanceRange - wPosNow.x), wPosNow.y, wPosNow.z); break;
            }
        }

        return prepareListData(wPosStart, typeShow);
    }

    public async AnimOpenObj(nNode: Node, typeShow: TYPE_SHOW, timeAnim: number = this.timeMustDoneOpening) {
        const opaCom: UIOpacity = nNode.getComponent(UIOpacity);
        const wPosNow: Vec3 = nNode.worldPosition.clone();
        const wPosOut: Vec3 = this.CaculateWPosOutScreen(nNode.worldPosition.clone(), typeShow);

        // set the obj to wPosMoveOut
        opaCom.opacity = 0;
        nNode.worldPosition = wPosOut.clone();
        nNode.active = true;

        // tween move up
        Tween.stopAllByTarget(nNode)
        tween(nNode)
            .to(timeAnim, { worldPosition: wPosNow }, {
                easing: 'backOut',
                onUpdate(target, ratio) {
                    if (opaCom != null) {
                        opaCom.opacity = ratio * 255;
                    }
                },
            })
            .start();

        await Utils.delay(timeAnim * 1000);
    }

    public async AnimCloseObj(nNode: Node, typeShow: TYPE_SHOW, timeAnim: number = this.timeMustDoneHide) {
        const opaCom: UIOpacity = nNode.getComponent(UIOpacity);
        const wPosNow: Vec3 = nNode.worldPosition.clone();
        const wPosOut: Vec3 = this.CaculateWPosOutScreen(nNode.worldPosition.clone(), typeShow);


        // tween move down
        Tween.stopAllByTarget(nNode)
        tween(nNode)
            .to(timeAnim, { worldPosition: wPosOut }, {
                easing: 'backIn',
                onUpdate(target, ratio) {
                    if (opaCom != null) {
                        opaCom.opacity = (1 - ratio) * 255;
                    }
                },
            })
            .start();

        await Utils.delay(timeAnim * 1000);
    }
}


