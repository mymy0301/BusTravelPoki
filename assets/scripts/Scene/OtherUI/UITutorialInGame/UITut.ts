import { _decorator, Component, Label, Node, RichText, Sprite, SpriteFrame, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_TUT_GAME } from './TypeTutorialInGame';
import { ConvertSizeCarToJsonBusFrenzy, DIRECT_CAR, M_COLOR, TYPE_CAR_SIZE, TYPE_PASSENGER_POSE } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { Utils } from '../../../Utils/Utils';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
const { ccclass, property } = _decorator;

@ccclass('UITut')
export class UITut extends Component {
    @property(Sprite) spCar4: Sprite;
    @property(Sprite) spCar6: Sprite;
    @property(Sprite) spCar10: Sprite;
    @property(Node) nArrow: Node;
    @property(Sprite) spPass4: Sprite;
    @property(Sprite) spPass6: Sprite;
    @property(Sprite) spPass10: Sprite;
    @property(Label) lbContent: Label;
    @property(RichText) rtContent: RichText;
    @property(Node) nVisual: Node;
    @property(Node) nBg: Node;
    @property(Node) nTempPass: Node;
    @property(Node) nTempCar: Node;

    @property(Node) nBlockGame: Node;

    @property({ group: { id: "Tut1", name: "Tut1" }, type: Sprite }) spCarTut_1: Sprite;
    @property({ group: { id: "Tut1", name: "Tut1" }, type: Sprite }) spArrowTut_1: Sprite;
    @property({ group: { id: "Tut1", name: "Tut1" }, type: Node }) nVisualTut_1: Node;

    @property({ group: { id: "Tut2", name: "Tut2" }, type: Node }) nVisualTut_2: Node;
    private readonly _posNVisualTut2: Vec3 = new Vec3(0, -370, 0);

    private readonly _posArrow4: Vec3 = new Vec3(-58.752, 61.657);
    private readonly _posArrow6: Vec3 = new Vec3(-62.044, 63.067);
    private readonly _posArrow10: Vec3 = new Vec3(-66.325, 63.067);

    private readonly _posLbContent4: Vec3 = new Vec3(29.136, 46.628);
    private readonly _posLbContent10: Vec3 = new Vec3(55.683, 46.628);

    private readonly _distanceShowTutY: number = -20;
    private readonly _timeShowTut: number = 0.3;
    private readonly _timeHideTut: number = 0.2;

    protected onLoad(): void {
        this.nVisual.active = false;
        this.nVisualTut_1.active = false;
        this.nVisualTut_2.active = false;
        this.nBg.active = false;
    }

    protected onEnable(): void {
        clientEvent.on(EVENT_TUT_GAME.SHOW_POP_UP_TUT_2, this.ShowTut_2, this);
        clientEvent.on(EVENT_TUT_GAME.SHOW_POP_UP_TUT_1, this.ShowTut_1, this);
        clientEvent.on(EVENT_TUT_GAME.SHOW_POP_UP_TUT, this.ShowTut, this);
        clientEvent.on(EVENT_TUT_GAME.HIDE_POP_UP_TUT, this.HideTut, this);
        clientEvent.on(EVENT_TUT_GAME.HIDE_BG, this.HideBg, this);
        clientEvent.on(EVENT_TUT_GAME.SHOW_BLOCK, this.ShowBLock, this);
        clientEvent.on(EVENT_TUT_GAME.HIDE_BLOCK, this.HideBlock, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_TUT_GAME.SHOW_POP_UP_TUT_2, this.ShowTut_2, this);
        clientEvent.off(EVENT_TUT_GAME.SHOW_POP_UP_TUT_1, this.ShowTut_1, this);
        clientEvent.off(EVENT_TUT_GAME.SHOW_POP_UP_TUT, this.ShowTut, this);
        clientEvent.off(EVENT_TUT_GAME.HIDE_POP_UP_TUT, this.HideTut, this);
        clientEvent.off(EVENT_TUT_GAME.HIDE_BG, this.HideBg, this);
        clientEvent.off(EVENT_TUT_GAME.SHOW_BLOCK, this.ShowBLock, this);
        clientEvent.off(EVENT_TUT_GAME.HIDE_BLOCK, this.HideBlock, this);
    }

    //==========================
    //#region func listen
    private HideTut() {
        const timeHide: number = this._timeHideTut;
        let visualChoice = null
        switch (true) {
            case this.nVisualTut_1.active: visualChoice = this.nVisualTut_1; break;
            case this.nVisualTut_2.active: visualChoice = this.nVisualTut_2; break;
            case this.nVisual.active: visualChoice = this.nVisual; break;
        }
        const opaVisual = visualChoice.getComponent(UIOpacity);
        this.HideTarget(timeHide, opaVisual, () => { visualChoice.active = false });
    }

    private ShowTut_2(color: M_COLOR, sizeCar: TYPE_CAR_SIZE, directCar: DIRECT_CAR, listPassenger: Node[], nCar: Node) {
        // show UITut_2
        this.nVisualTut_2.setPosition(this._posNVisualTut2.clone().add3f(0, this._distanceShowTutY, 0));
        const opaComVisual = this.nVisualTut_2.getComponent(UIOpacity);
        opaComVisual.opacity = 0;
        this.nVisualTut_2.active = true;

        //==================== anim =============================
        tween(this.nVisualTut_2)
            .to(this._timeShowTut, { position: this._posNVisualTut2 }, {
                onUpdate(target, ratio) {
                    opaComVisual.opacity = 255 * ratio;
                },
            })
            .start()
    }

    private ShowTut_1(color: M_COLOR, sizeCar: TYPE_CAR_SIZE, directCar: DIRECT_CAR, listPassenger: Node[], nCar: Node) {
        const pathSfCar = MConfigResourceUtils.GetPathCar(color, sizeCar, directCar, false);
        const pathArrow = MConfigResourceUtils.GetPathImageArrow(directCar);

        // load car
        MConfigResourceUtils.GetImageCarUntilLoad(pathSfCar, (path: string, sf: SpriteFrame) => {
            try {
                if (pathSfCar == path) {
                    this.spCarTut_1.spriteFrame = sf;
                }
            } catch (e) {

            }
        });

        // load arrow
        MConfigResourceUtils.GetImageArrowUntilLoad(pathArrow, (path: string, sf: SpriteFrame) => {
            try {
                if (pathArrow == path) {
                    this.spArrowTut_1.spriteFrame = sf;
                }
            } catch (e) {

            }
        })

        // show UITut_1
        this.nVisualTut_1.setPosition(new Vec3(0, this._distanceShowTutY, 0));
        const opaComVisual = this.nVisualTut_1.getComponent(UIOpacity);
        opaComVisual.opacity = 0;
        this.nVisualTut_1.active = true;

        //==================== set car and passenger ============
        this.SetPassAndCarToUITut(listPassenger, nCar);

        //==================== anim =============================
        // show bg
        const opaDefaultStart = 20
        const opaComBg = this.nBg.getComponent(UIOpacity);
        opaComBg.opacity = opaDefaultStart;
        this.nBg.active = true;

        tween(this.nVisualTut_1)
            .to(this._timeShowTut, { position: Vec3.ZERO }, {
                onUpdate(target, ratio) {
                    opaComVisual.opacity = 255 * ratio;
                    opaComBg.opacity = (255 - opaDefaultStart) * ratio + opaDefaultStart;
                },
            })
            .start()
    }

    private ShowTut(color: M_COLOR, sizeCar: TYPE_CAR_SIZE, listPassenger: Node[], nCar: Node) {
        // console.log(listPassenger, nCar);

        const pathSfCar = MConfigResourceUtils.GetPathCar(color, sizeCar, DIRECT_CAR.LEFT, false);
        const pathPass = MConfigResourceUtils.GetPathPassengers(color, TYPE_PASSENGER_POSE.IDLE_TURN);

        // load car
        MConfigResourceUtils.GetImageCarUntilLoad(pathSfCar, (path: string, sf: SpriteFrame) => {
            try {
                if (pathSfCar == path) {
                    switch (sizeCar) {
                        case TYPE_CAR_SIZE['4_CHO']: this.spCar4.spriteFrame = sf; break;
                        case TYPE_CAR_SIZE['6_CHO']: this.spCar6.spriteFrame = sf; break;
                        case TYPE_CAR_SIZE['10_CHO']: this.spCar10.spriteFrame = sf; break;
                    }
                }
            } catch (e) {

            }
        });

        // load pass
        MConfigResourceUtils.GetImagePassengersUntilLoad(pathPass, (path: string, sf: SpriteFrame) => {
            try {
                if (pathPass == path) {
                    switch (sizeCar) {
                        case TYPE_CAR_SIZE['4_CHO']: this.spPass4.spriteFrame = sf; break;
                        case TYPE_CAR_SIZE['6_CHO']: this.spPass6.spriteFrame = sf; break;
                        case TYPE_CAR_SIZE['10_CHO']: this.spPass10.spriteFrame = sf; break;
                    }
                }
            } catch (e) {

            }
        })

        //==================== SetUp data =============================
        switch (sizeCar) {
            case TYPE_CAR_SIZE['4_CHO']:
                this.spCar4.node.active = true; this.spPass4.node.active = true;
                this.spCar6.node.active = false; this.spPass6.node.active = false;
                this.spCar10.node.active = false; this.spPass10.node.active = false;
                break;
            case TYPE_CAR_SIZE['6_CHO']:
                this.spCar4.node.active = false; this.spPass4.node.active = false;
                this.spCar6.node.active = true; this.spPass6.node.active = true;
                this.spCar10.node.active = false; this.spPass10.node.active = false;
                break;
            case TYPE_CAR_SIZE['10_CHO']:
                this.spCar4.node.active = false; this.spPass4.node.active = false;
                this.spCar6.node.active = false; this.spPass6.node.active = false;
                this.spCar10.node.active = true; this.spPass10.node.active = true;
                break;
        }

        const numPass = sizeCar == TYPE_CAR_SIZE['4_CHO'] ? 4 : (sizeCar == TYPE_CAR_SIZE['6_CHO'] ? 6 : 10);
        this.UpdateContentLb(numPass);
        this.UpdateContentRt(numPass);
        this.UpdateArrow(numPass);

        //==================== set car and passenger ============
        this.SetPassAndCarToUITut(listPassenger, nCar);

        //==================== anim =============================
        // show bg
        const opaDefaultStart = 20
        const opaComBg = this.nBg.getComponent(UIOpacity);
        opaComBg.opacity = opaDefaultStart;
        this.nBg.active = true;


        // show Visual
        this.nVisual.setPosition(new Vec3(0, this._distanceShowTutY, 0));
        const opaComVisual = this.nVisual.getComponent(UIOpacity);
        opaComVisual.opacity = 0;
        this.nVisual.active = true;

        tween(this.nVisual)
            .to(this._timeShowTut, { position: Vec3.ZERO }, {
                onUpdate(target, ratio) {
                    opaComVisual.opacity = 255 * ratio;
                    opaComBg.opacity = (255 - opaDefaultStart) * ratio + opaDefaultStart;
                },
            })
            .start()
    }

    private HideBg() {
        const timeHide = 0.1;
        const opaTargert = this.nBg.getComponent(UIOpacity);
        this.HideTarget(timeHide, opaTargert, () => { this.nBg.active = false });
    }

    private ShowBLock() { this.nBlockGame.active = true; }
    private HideBlock() { this.nBlockGame.active = false; }

    //#endregion func listen
    //==========================


    //===========================
    //#region self
    private HideTarget(timeHide, opaCom: UIOpacity, cbDone: CallableFunction = null) {
        tween(opaCom)
            .to(timeHide, { opacity: 0 })
            .call(() => { cbDone && cbDone() })
            .start()
    }

    private UpdateContentRt(numPeople: number) {
        this.rtContent.string = `<color=#1e2d8a>The CAR can carry <color=#2ea101>${numPeople} people</color> of the\nsame color</color>`;
    }

    private UpdateContentLb(numPeople: TYPE_CAR_SIZE) {
        switch (numPeople) {
            case 4: case 6:
                this.lbContent.node.position = this._posLbContent4;
                break;
            case 10:
                this.lbContent.node.position = this._posLbContent10;
                break;
        }
        this.lbContent.string = `= ${numPeople}`;
    }

    private UpdateArrow(numPeople: number) {
        switch (numPeople) {
            case 4:
                this.nArrow.position = this._posArrow4;
                break;
            case 6:
                this.nArrow.position = this._posArrow6;
                break;
            case 10:
                this.nArrow.position = this._posArrow10;
                break;
        }
    }

    private async SetPassAndCarToUITut(listPass: Node[], nCar: Node) {
        // thay đổi parent của pass lần lượt
        const timeDelayEachPassenger = 0.05;
        for (let indexPass = 0; indexPass < listPass.length; indexPass++) {
            await Utils.delay(timeDelayEachPassenger * 1000);
            const passChoice = listPass[indexPass];
            passChoice.setParent(this.nTempPass, true);
        }

        // thay đổi parent của car
        // scale xe một chút để xe dc ấn tượng hơn
        const scaleBase = nCar.scale.clone();
        const scaleEnd = scaleBase.clone().multiplyScalar(1.1);
        const timeCar: number = 0.1;

        nCar.setParent(this.nTempCar, true);
        await AniTweenSys.scaleBubble(nCar, timeCar / 2, timeCar / 2, scaleEnd, scaleBase, false);
    }
    //#endregion self
    //===========================
}


