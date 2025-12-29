import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { MIndicatorShop_TabLine } from './MIndicatorShop_TabLine';
import { MIndicatorShop_FrameChoice } from './MIndicatorShop_FrameChoice';
import { ChangeSceneSys } from '../../../Common/ChangeSceneSys';
import { PAGE_VIEW_SHOP } from './TypeShop';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('MIndicatorShop')
export class MIndicatorShop extends Component {
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

        this.mIndicatorShop_TabLine.AutoUpdateNTab_After_WithIndexPageChoice(0);
    }

    public SetStart(indexPage: number) {
        if (indexPage < 0 || indexPage > this.listNIconTab.length - 1) { return; }

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

    async ChangeIndicator(indexNewPage: number, indexOldPage: number, timeScale: number) {
        if (indexNewPage == indexOldPage) { return; }

        const nIconChoice: Node = this.listNIconTab[indexNewPage];
        const nLbChoice: Node = this.listNLabelTab[indexNewPage];
        let posX = nIconChoice.position.x;

        // get property for old page
        const old_nIconPage: Node = this.listNIconTab[indexOldPage];
        const old_nLbPage: Node = this.listNLabelTab[indexOldPage];

        let posEndBgChoice = new Vec3(posX, this.posYFrameChoice, 0).clone();

        // scale icon old page to base
        this.AnimUnChoice(old_nIconPage, old_nLbPage, timeScale);

        // scale icon to choice
        this.AnimChoice(nIconChoice, nLbChoice, timeScale);

        // tween bg choice
        this.AnimBgChoice(indexOldPage, indexNewPage, timeScale, posEndBgChoice);
    }

    //#region Anim
    private AnimUnChoice(nIcon: Node, nLb: Node, timeScale: number) {
        if (nIcon == null) { return; }
        const scaleXIcon = nIcon.getScale().x;
        if (scaleXIcon > this.scaleIconUnChoice.x) {
            let timeScaleUnchoice = timeScale / (0.2 / (scaleXIcon - this.scaleIconUnChoice.x))
            Tween.stopAllByTarget(nIcon);
            Tween.stopAllByTarget(nLb);

            const posX = nIcon.position.x;

            tween(nIcon)
                .to(timeScaleUnchoice, { scale: this.scaleIconUnChoice, position: new Vec3(posX, this.posYIconUnChoice, 0) })
                .start();
            tween(nLb)
                .to(timeScaleUnchoice, { scale: this.scaleLbUnChoice, position: new Vec3(posX, this.posYLbUnChoice, 0) })
                .start();
        }
    }

    private AnimChoice(nIcon: Node, nLb: Node, timeScale: number) {
        const scaleXIcon = nIcon.getScale().x;
        if (scaleXIcon < 1) {
            let timeScaleUnchoice = timeScale / (0.2 / (1 - scaleXIcon))
            Tween.stopAllByTarget(nIcon);
            Tween.stopAllByTarget(nLb);

            const posX = nIcon.position.x;

            tween(nIcon)
                .to(timeScaleUnchoice, { scale: Vec3.ONE, position: new Vec3(posX, this.posYIconChoice, 0) })
                .start();
            tween(nLb)
                .to(timeScaleUnchoice, { scale: Vec3.ONE, position: new Vec3(posX, this.posYLbChoice, 0) })
                .start();
        }
    }

    private AnimBgChoice(indexOldPage: number, indexNewPage: number, timeScale: number, posEndBgChoice: Vec3) {
        Tween.stopAllByTarget(this.nbgChoice);
        // kiểm tra indexOldPage và indexNewPage
        // sẽ có 3 trường hợp cần phải thay ảnh
        // 1. indexOldPage == 0|3 và indexNewPage == 1|2
        // 2. indexOldPage == 0|3 và indexNewPage == 3|0
        // 3. indexOldPage == 1|2 và indexNewPage == 0|3
        switch (true) {
            case (indexOldPage == 0 || indexOldPage == 3) && (indexNewPage == 1 || indexNewPage == 2):
                tween(this.nbgChoice)
                    .call(() => {
                        this.mIndicatorShop_FrameChoice.ChangeVisualTab('MID');
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_Before_WithIndexPageChoice(indexNewPage);
                    })
                    .to(timeScale, { position: posEndBgChoice }, { easing: 'smooth' })
                    .call(() => {
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_After_WithIndexPageChoice(indexNewPage);
                    })
                    .start();
                break;
            case (indexOldPage == 0 || indexOldPage == 3) && (indexNewPage == 3 || indexNewPage == 0):
                tween(this.nbgChoice)
                    .call(() => {
                        this.mIndicatorShop_FrameChoice.ChangeVisualTab('MID');
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_Before_WithIndexPageChoice(indexNewPage);
                    })
                    .to(timeScale, { position: posEndBgChoice }, { easing: 'smooth' })
                    .call(() => {
                        this.mIndicatorShop_FrameChoice.ChangeVisualTab(indexNewPage == 0 ? 'LEFT' : 'RIGHT');
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_After_WithIndexPageChoice(indexNewPage);
                    })
                    .start();
                break;
            case (indexOldPage == 1 || indexOldPage == 2) && (indexNewPage == 0 || indexNewPage == 3):
                tween(this.nbgChoice)
                    .call(() => {
                        this.mIndicatorShop_FrameChoice.ChangeVisualTab('MID');
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_Before_WithIndexPageChoice(indexNewPage);
                    })
                    .to(timeScale, { position: posEndBgChoice }, { easing: 'smooth' })
                    .call(() => {
                        this.mIndicatorShop_FrameChoice.ChangeVisualTab(indexNewPage == 0 ? 'LEFT' : 'RIGHT');
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_After_WithIndexPageChoice(indexNewPage);
                    })
                    .start();
                break;
            case (indexOldPage == 1 || indexOldPage == 2) && (indexNewPage == 1 || indexNewPage == 2):
                tween(this.nbgChoice)
                    .call(() => {
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_Before_WithIndexPageChoice(indexNewPage);
                    })
                    .to(timeScale, { position: posEndBgChoice }, { easing: 'smooth' })
                    .call(() => {
                        this.mIndicatorShop_TabLine.AutoUpdateNTab_After_WithIndexPageChoice(indexNewPage);
                    })
                    .start();
                break;
        }


    }
    //#endregion Anim

    //#region btn
    private OnClickPackage() {
        LogEventManager.Instance.logButtonClick(`tab_package`, "UIShop");

        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP.PACKAGE, 1);
    }

    private OnClickDailyQuest() {
        LogEventManager.Instance.logButtonClick(`tab_daily_quest`, "UIShop");

        // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION, `Will coming soon`);
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP.DAILY_QUEST, 1);
    }

    private OnClickCoin() {
        LogEventManager.Instance.logButtonClick(`tab_coin`, "UIShop");

        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP.COIN, 1);
    }

    private OnClickSkipIts() {
        LogEventManager.Instance.logButtonClick(`tab_skip_ads`, "UIShop");

        // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION, `Will coming soon`);
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP.SKIP_ITS, 1);
    }
    //#endregion btn
}


