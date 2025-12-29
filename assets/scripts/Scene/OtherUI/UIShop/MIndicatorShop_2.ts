import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { MIndicatorShop_TabLine } from './MIndicatorShop_TabLine';
import { MIndicatorShop_FrameChoice } from './MIndicatorShop_FrameChoice';
import { PAGE_VIEW_SHOP_2 } from './TypeShop';
const { ccclass, property } = _decorator;

@ccclass('MIndicatorShop_2')
export class MIndicatorShop_2 extends Component {
    @property(Node) listNIconTab: Node[] = [];
    @property(Node) listNLabelTab: Node[] = [];
    @property(MIndicatorShop_TabLine) mIndicatorShop_TabLine: MIndicatorShop_TabLine;
    @property(MIndicatorShop_FrameChoice) mIndicatorShop_FrameChoice: MIndicatorShop_FrameChoice;
    @property(Node) nbgChoice: Node;

    private readonly scaleIconUnChoice: Vec3 = Vec3.ONE.clone().multiplyScalar(0.9);
    private readonly scaleLbUnChoice: Vec3 = Vec3.ONE.clone().multiplyScalar(0.9);
    private readonly posYIconChoice: number = 30;
    private readonly posYIconUnChoice: number = 18;
    private readonly posYLbChoice: number = -25;
    private readonly posYLbUnChoice: number = -31
    private readonly posYFrameChoice: number = -20.72

    private _indexChoice: number = -1;


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

    public SetStart(indexPage: number) {
        if (indexPage < 0 || indexPage > this.listNIconTab.length - 1 || this._indexChoice == indexPage) { return; }

        this._indexChoice = indexPage;

        const nIconChoice: Node = this.listNIconTab[indexPage];
        const nLbChoice: Node = this.listNLabelTab[indexPage];
        let wPosX = nIconChoice.worldPosition.clone().x;
        let posX = nIconChoice.position.clone().x;

        // cacul wPos for bg Choice and icon Choice
        let posEndBgChoice = new Vec3(posX, this.posYFrameChoice, 0);

        // tween scale icon choice
        nIconChoice.scale = Vec3.ONE;
        nIconChoice.position = new Vec3(posX, this.posYIconChoice, 0);
        nLbChoice.position = new Vec3(posX, this.posYLbChoice, 0);

        // tween bg choice
        this.nbgChoice.position = posEndBgChoice;
    }

    ChangeIndicator(indexNewPage: number, indexOldPage: number, timeScale: number) {
        if (indexNewPage == indexOldPage) { return; }

        const nIconChoice: Node = this.listNIconTab[indexNewPage];
        const nLbChoice: Node = this.listNLabelTab[indexNewPage];
        let wPosX = nIconChoice.worldPosition.x;
        let posX = nIconChoice.position.x;
        const self = this;

        // get property for old page
        const old_nIconPage: Node = this.listNIconTab[indexOldPage];;
        const old_nLbPage: Node = this.listNLabelTab[indexOldPage];

        // cacul wPos for bg Choice and icon Choice
        // console.log(this.nbgChoice.position.clone());
        // console.log(nIconChoice.position.clone());

        let posEndBgChoice = new Vec3(posX, this.posYFrameChoice, 0).clone();

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

        function AnimBgChoice(indexOldPage: number, indexNewPage: number) {
            Tween.stopAllByTarget(self.nbgChoice);
            // kiểm tra indexOldPage và indexNewPage
            // chỉ có 2 trường hợp thay ảnh
            // 1. indexOldPage == 0 và indexNewPage == 1
            // 2. indexOldPage == 1 và indexNewPage == 0
            switch (true) {
                case (indexOldPage == 0 || indexOldPage == 1) && (indexNewPage == 1 || indexNewPage == 0):
                    tween(self.nbgChoice)
                        .call(() => {
                            self.mIndicatorShop_FrameChoice.ChangeVisualTab('MID');
                            self.mIndicatorShop_TabLine.AutoUpdateNTab_Before_WithIndexPageChoice(indexNewPage);
                        })
                        .to(timeScale, { position: posEndBgChoice }, { easing: 'smooth' })
                        .call(() => {
                            self.mIndicatorShop_FrameChoice.ChangeVisualTab(indexNewPage == 0 ? 'LEFT' : 'RIGHT');
                            self.mIndicatorShop_TabLine.AutoUpdateNTab_After_WithIndexPageChoice(indexNewPage);
                        })
                        .start();
                    break;
            }
        }

        // scale icon old page to base
        AnimUnChoice(old_nIconPage, old_nLbPage);

        // scale icon to choice
        AnimChoice(nIconChoice, nLbChoice);

        // tween bg choice
        AnimBgChoice(indexOldPage, indexNewPage);

        self._indexChoice = indexNewPage;
    }

    private OnClickDailyQuest() {
        // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION, `Will coming soon`);
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP_2.DAILY_QUEST, 2);
    }

    private OnClickCoin() {
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP_2.COIN, 2);
    }
}


