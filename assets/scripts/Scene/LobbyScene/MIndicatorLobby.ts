import { _decorator, Component, Label, Layout, Node, screen, Size, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { PAGE_VIEW_LOBBY_NAME } from '../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('MIndicatorLobby')
export class MIndicatorLobby extends Component {
    @property(Node) listNIconTab: Node[] = [];
    @property(Node) listNLabelTab: Node[] = [];
    @property(Node) nbgChoice: Node;

    private readonly scaleIconUnChoice: Vec3 = Vec3.ONE.clone().multiplyScalar(0.9);
    private readonly scaleLbUnChoice: Vec3 = Vec3.ONE.clone().multiplyScalar(0.9);
    private readonly posYIconChoice: number = 35;
    private readonly posYIconUnChoice: number = 10;
    private readonly posYLbChoice: number = -25;
    private readonly posYLbUnChoice: number = -31


    protected onLoad(): void {
        for (let i = 0; i < this.listNIconTab.length; i++) {
            const nIconTab = this.listNIconTab[i];
            const posNow = nIconTab.position.clone();
            nIconTab.scale = this.scaleIconUnChoice;
            nIconTab.position = new Vec3(posNow.x, this.posYIconUnChoice, 0);
        }

        for (let i = 0; i < this.listNLabelTab.length; i++) {
            const nLbTab = this.listNLabelTab[i];
            const posNow = nLbTab.position.clone();
            nLbTab.scale = this.scaleLbUnChoice;
            nLbTab.position = new Vec3(posNow.x, this.posYLbUnChoice, 0);
        }
    }

    protected start(): void {
        this.node.getComponent(Layout).updateLayout(true);

        const oldContentSize = this.nbgChoice.getComponent(UITransform).contentSize.clone();
        const newContentSize = new Size(this.listNIconTab[0].getParent().getComponent(UITransform).contentSize.clone().width + 20, oldContentSize.height);
        this.nbgChoice.getComponent(UITransform).contentSize = newContentSize;
    }

    public SetStart(indexPage: number) {
        if (indexPage < 0 || indexPage > this.listNIconTab.length - 1) { return; }

        const nIconChoice: Node = this.listNIconTab[indexPage];
        const nLbChoice: Node = this.listNLabelTab[indexPage];
        let wPosX = nIconChoice.worldPosition.clone().x;
        let posX = nIconChoice.position.clone().x;

        // cacul wPos for bg Choice and icon Choice
        let wPosEndBgChoice = new Vec3(wPosX, this.nbgChoice.worldPosition.y, 0);

        // tween scale icon choice
        nIconChoice.scale = Vec3.ONE;
        nIconChoice.position = new Vec3(posX, this.posYIconChoice, 0);
        nLbChoice.position = new Vec3(posX, this.posYLbChoice, 0);

        // tween bg choice
        this.nbgChoice.worldPosition = wPosEndBgChoice;
    }

    ChangeIndicator(indexNewPage: number, indexOldPage: number, timeScale: number) {
        const nIconChoice: Node = this.listNIconTab[indexNewPage];
        const nLbChoice: Node = this.listNLabelTab[indexNewPage];
        let wPosX = nIconChoice.worldPosition.x;
        const self = this;


        // get property for old page
        const old_nIconPage: Node = this.listNIconTab[indexOldPage];;
        const old_nLbPage: Node = this.listNLabelTab[indexOldPage];

        // cacul wPos for bg Choice and icon Choice
        let wPosEndBgChoice = new Vec3(wPosX, this.nbgChoice.worldPosition.y, 0);

        function AnimUnChoice(nIcon: Node, nLb: Node) {
            if (nIcon == null) { return; }
            const scaleXIcon = nIcon.getScale().x;
            if (scaleXIcon > self.scaleIconUnChoice.x) {
                let timeScaleUnchoice = timeScale / (0.2 / (scaleXIcon - self.scaleIconUnChoice.x))
                Tween.stopAllByTarget(nIcon);
                Tween.stopAllByTarget(nLb);

                const posX = nIcon.position.x;

                tween(nIcon)
                    .to(timeScaleUnchoice, { scale: self.scaleIconUnChoice, position: new Vec3(posX, self.posYIconUnChoice, 0) })
                    .start();
                tween(nLb)
                    .to(timeScaleUnchoice, { scale: self.scaleLbUnChoice, position: new Vec3(posX, self.posYLbUnChoice, 0) })
                    .start();
            }
        }

        function AnimChoice(nIcon: Node, nLb: Node) {
            const scaleXIcon = nIcon.getScale().x;
            if (scaleXIcon < 1) {
                let timeScaleUnchoice = timeScale / (0.2 / (1 - scaleXIcon))
                Tween.stopAllByTarget(nIcon);
                Tween.stopAllByTarget(nLb);

                const posX = nIcon.position.x;

                tween(nIcon)
                    .to(timeScaleUnchoice, { scale: Vec3.ONE, position: new Vec3(posX, self.posYIconChoice, 0) })
                    .start();
                tween(nLb)
                    .to(timeScaleUnchoice, { scale: Vec3.ONE, position: new Vec3(posX, self.posYLbChoice, 0) })
                    .start();
            }
        }

        // scale icon old page to base
        AnimUnChoice(old_nIconPage, old_nLbPage);

        // scale icon to choice
        AnimChoice(nIconChoice, nLbChoice);

        // tween bg choice
        Tween.stopAllByTarget(this.nbgChoice);
        tween(this.nbgChoice)
            .to(timeScale, { worldPosition: wPosEndBgChoice }, { easing: 'smooth' })
            .start();
    }

    private OnClickShop() {
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.SHOP);
    }

    private OnClickCustom() {
        // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION, `Will coming soon`);
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.CUSTOM);
    }

    private OnClickHome() {
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.HOME);
    }

    private OnClickRank() {
        // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION, `Will coming soon`);
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.RANK);
    }

    private OnClickTournament() {
        // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION, `Will coming soon`);
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.TOURNAMENT);
    }
}


