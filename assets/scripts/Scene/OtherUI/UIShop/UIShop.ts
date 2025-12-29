import { _decorator, Component, instantiate, Node, Prefab, Rect, ScrollView, SpriteFrame, UITransform, Vec3, Vec2, Layout, Widget } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { MoneyUISys } from '../../../DataBase/Currency/MoneyUISys';
import { CurrencySys } from '../../CurrencySys';
import { TicketUISys } from '../../../DataBase/Currency/TicketUISys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { ItemScrollViewBase } from '../../../Common/ItemScrollViewBase';
import { LogicGenItemShop } from './LogicGenItemShop';
import { PAGE_VIEW_LOBBY_NAME } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
import { MIndicatorShop } from './MIndicatorShop';
import { CurrencyUIBaseSys } from '../../../DataBase/Currency/CurrencyUIBaseSys';
import { SuperUIAnimCustom } from '../SuperUIAnimCustom';
import { instanceOfDataCustomUIShop, MConfig_TypeShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from './TypeShop';
import { MIndicatorShop_2 } from './MIndicatorShop_2';
import { MConfigs } from '../../../Configs/MConfigs';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UIShop')
export class UIShop extends UIBaseSys {
    @property(Node) viewSV: Node;
    @property(Node) contentSV: Node;
    @property(ScrollView) scrollView: ScrollView;
    @property(MoneyUISys) moneyUISys: MoneyUISys;
    @property(TicketUISys) ticketUISys: TicketUISys;
    @property(Node) btnClose: Node;
    @property(Node) nBlockShop: Node;
    @property(MIndicatorShop) mIndicatorShop: MIndicatorShop;
    @property(MIndicatorShop_2) mIndicatorShop_2: MIndicatorShop_2;
    @property(LogicGenItemShop) logicGenItemShop: LogicGenItemShop = new LogicGenItemShop();
    @property(SuperUIAnimCustom) superUIAnimCustom: SuperUIAnimCustom;
    @property(Node) listNUIShopOnlyHome: Node[] = [];

    @property(Node) nIndicator_full: Node;
    @property(Node) nIndicator_2: Node;

    private _oldIndexShop: number = PAGE_VIEW_SHOP.DAILY_QUEST;

    private _canCheckScrollToPage: boolean = false;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SHOP.SCROLL_SHOP_LOBBY, this.ScrollShop, this);
        clientEvent.on(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, this.ChangePageShop, this);
        clientEvent.on(MConst.EVENT_SHOP.GET_WPOS_UI_COIN, this.GetWPosUICoin, this);
        clientEvent.on(MConst.EVENT_SHOP.GET_WPOS_UI_TICKET, this.GetWPosTicket, this);
        clientEvent.on(MConst.EVENT_SHOP.GET_UI_ANIM_CUSTOM_COM, this.GetUIAnimCustomCom, this);
        clientEvent.on(MConst.EVENT_SHOP.UPDATE_SCROLL_SHOP, this.UpdateScrollShop, this);

        //set data for scroll view
        this.scrollView.node.on("scrolling", this.OptimizeScrollView, this);
        this.scrollView.scrollToTop();
        this.OptimizeScrollView();

        // check IAP
        if (MConfigs.numIAPTicketHave > 0) {
            this.nIndicator_full.active = true;
            this.nIndicator_2.active = false;
        } else {
            this.nIndicator_full.active = false;
            this.nIndicator_2.active = true;
        }
    }


    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SHOP.SCROLL_SHOP_LOBBY, this.ScrollShop, this);
        clientEvent.off(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, this.ChangePageShop, this);
        clientEvent.off(MConst.EVENT_SHOP.GET_WPOS_UI_COIN, this.GetWPosUICoin, this);
        clientEvent.off(MConst.EVENT_SHOP.GET_WPOS_UI_TICKET, this.GetWPosTicket, this);
        clientEvent.off(MConst.EVENT_SHOP.GET_UI_ANIM_CUSTOM_COM, this.GetUIAnimCustomCom, this);
        clientEvent.off(MConst.EVENT_SHOP.UPDATE_SCROLL_SHOP, this.UpdateScrollShop, this);
    }

    public async PrepareDataShow(): Promise<void> {
        // check UI prepare show
        if (this._dataCustom != null && instanceOfDataCustomUIShop(this._dataCustom) && this._dataCustom.isActiveClose) {
            // only case in game
            if (this._dataCustom.isActiveClose) {
                this.listNUIShopOnlyHome.forEach(n => n.active = false);
                await this.InitShopWhenStart();
            }
            this.btnClose.active = this._dataCustom.isActiveClose;
            // auto load dữ liệu luôn
            this.ScrollToPageWhenStart(this._dataCustom.pageViewShop_ScrollTo, this.mIndicatorShop.node.active ? 1 : 2);
        } else if (this._dataCustom != null && instanceOfDataCustomUIShop(this._dataCustom) && !this._dataCustom.isActiveClose) {
            this.btnClose.active = false;
        }

        // update UI 
        this.moneyUISys.SetUp(CurrencySys.Instance.GetMoney());
        this.ticketUISys.SetUp(CurrencySys.Instance.GetTicket());

        // emit update noti shop
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_DAILY_INDICATOR);
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_COIN_INDICATOR);
    }

    public async UICloseDone() {
        // check trong trường hợp người chơi mở shop trong game + từ UIPopUPBuyItem
        if (this._dataCustom != null && instanceOfDataCustomUIShop(this._dataCustom) && this._dataCustom.isActiveClose) {
            if (this._dataCustom.canAutoResumeGame != undefined && this._dataCustom.canAutoResumeGame) {
                // check can resume game or not
                clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
            }
        }

        // trong trường hợp người chơi mở từ popUpUnlock parking + UIContinue
        if (this._dataCustom != null && instanceOfDataCustomUIShop(this._dataCustom) && this._dataCustom.isActiveClose && this._dataCustom.openUIAfterClose != null) {
            const dataCustomUI = this._dataCustom.dataCustom == null ? null : this._dataCustom.dataCustom;
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, this._dataCustom.openUIAfterClose, 1, true, dataCustomUI);
        }
    }

    //#region scrollView
    private OptimizeScrollView() {
        let view = this.viewSV.getComponent(UITransform);
        const posContentSV = this.contentSV.position.clone();
        var viewRect;
        viewRect = new Rect(- view.width / 2, -posContentSV.y - view.height / 2, view.width, view.height);

        for (let i = 0; i < this.contentSV.children.length; i++) {
            const node = this.contentSV.children[i];
            const itemScrollViewBase = node.getComponent(ItemScrollViewBase);
            if (viewRect.intersects(node.getComponent(UITransform).getBoundingBox())) {
                itemScrollViewBase.Show();
            }
            else {
                itemScrollViewBase.Hide();
            }
        }


        // check can emit event to change indicator
        if (this._canCheckScrollToPage) {
            const offSetContent = posContentSV.y - view.height / 2; // 10 is padding top trong content layout
            let typePageShow: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2 = this.logicGenItemShop.GetTypeUIDependOnOffset(offSetContent);
            // console.log("!", offSetContent, typePageShow);
            this.ChangePageShopWhenScrolling(typePageShow);
        }
    }

    private CheckCanEmitChangeIndicator(posContentSV: Vec3) {
        // lấy pos hiện tại của contentSV
        // so sánh bằng switch case để bt đc emit chuyển tab nào
        switch (true) {
            case posContentSV.y > 0:
                break;
        }
    }

    private ScrollShop(indexItem: number, timeScroll: number = 0, type: 1 | 2) {
        if (indexItem < 0 || indexItem >= this.contentSV.children.length) {
            return;
        }

        let posYItem = this.contentSV.children[indexItem].position.y;
        let scrollOffSet = posYItem;

        scrollOffSet = this.logicGenItemShop.GetOffSetOfUI(indexItem, type);

        this.DelayCheckScroll(timeScroll);
        this.scrollView.scrollToOffset(new Vec2(0, scrollOffSet), timeScroll);
        this.OptimizeScrollView();
    }
    //#endregion scrollView

    //#region FUNC listen
    private GetWPosTicket(cbGetWPos: CallableFunction): void {
        const wPosUICoin = this.ticketUISys.node.getComponent(CurrencyUIBaseSys).GetNIc().worldPosition.clone();
        cbGetWPos(wPosUICoin);
    }

    private GetWPosUICoin(cbGetWPos: CallableFunction): void {
        const wPosUICoin = this.moneyUISys.node.getComponent(CurrencyUIBaseSys).GetNIc().worldPosition.clone();
        cbGetWPos(wPosUICoin);
    }

    private GetUIAnimCustomCom(cbGetUIAnimCustomCom: CallableFunction) {
        cbGetUIAnimCustomCom(this.superUIAnimCustom);
    }

    private UpdateScrollShop() {
        // update scroll shop
        this.logicGenItemShop.UpdateDataHeight();

        const posContentSV = this.contentSV.position.clone();;
        const offSetContent = posContentSV.y - this.viewSV.getComponent(UITransform).height / 2; // 10 is padding top trong content layout
        let typePageShow: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2 = this.logicGenItemShop.GetTypeUIDependOnOffset(offSetContent);
        // console.log("!", offSetContent, typePageShow);
        this.ChangePageShopWhenScrolling(typePageShow);
    }
    //#endregion FUNC listen

    //#region button
    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIShop");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SHOP, 2);
    }

    private onBtnCoin() {
        LogEventManager.Instance.logButtonClick(`coin`, "UIShop");

        if (MConfigs.numIAPTicketHave > 0) {
            clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP.COIN, 1);
        } else {
            clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP_2.COIN, 2);
        }
    }

    private OnClickSkipIts() {
        LogEventManager.Instance.logButtonClick(`skip_ads`, "UIShop");

        // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION, `Will coming soon`);
        if (MConfigs.numIAPTicketHave > 0) {
            clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP.SKIP_ITS, 1);
        }
    }
    //#endregion button

    //#region ChangePageShop
    private async ChangePageShop(pageViewshop: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2, type: 1 | 2, force: boolean = false) {
        if (this._oldIndexShop == pageViewshop && !force) {
            return;
        }

        const timeScrollTo: number = !force ? MConfig_TypeShop.TIME_SCROLL_INDICATOR : MConfig_TypeShop.TIME_SCROLL_INDICATOR + 0.2;
        this._canCheckScrollToPage = !force;
        // show block shop
        this.nBlockShop.active = true;
        this.ScrollShop(pageViewshop, timeScrollTo, type);

        if (this.nIndicator_full.active) {
            this.mIndicatorShop.ChangeIndicator(pageViewshop, this._oldIndexShop, timeScrollTo);
        } else {
            if (typeof pageViewshop == typeof PAGE_VIEW_SHOP) {
                let pageViewShop_2: PAGE_VIEW_SHOP_2 = 0;
                switch (pageViewshop) {
                    case PAGE_VIEW_SHOP.COIN: pageViewShop_2 = PAGE_VIEW_SHOP_2.COIN; break;
                    case PAGE_VIEW_SHOP.DAILY_QUEST: pageViewShop_2 = PAGE_VIEW_SHOP_2.DAILY_QUEST; break;
                }
                this.mIndicatorShop_2.ChangeIndicator(pageViewShop_2, this._oldIndexShop, timeScrollTo);
            } else {
                this.mIndicatorShop_2.ChangeIndicator(pageViewshop, this._oldIndexShop, timeScrollTo);
            }
        }
        await Utils.delay(timeScrollTo * 1000);
        this.nBlockShop.active = false;

        // udpate new oldIndex
        this._oldIndexShop = pageViewshop;
        this._canCheckScrollToPage = true;
    }

    private ChangePageShopWhenScrolling(pageViewshop: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2) {
        if (pageViewshop == null || this._oldIndexShop == pageViewshop) {
            return;
        }

        const timeScrollTo: number = MConfig_TypeShop.TIME_SCROLL_INDICATOR;
        const oldIndex = this._oldIndexShop;

        // udpate new oldIndex
        this._oldIndexShop = pageViewshop;

        if (this.nIndicator_full.active) {
            this.mIndicatorShop.ChangeIndicator(pageViewshop, oldIndex, timeScrollTo);
        } else {
            if (typeof pageViewshop == typeof PAGE_VIEW_SHOP) {
                let pageViewShop_2: PAGE_VIEW_SHOP_2 = 0;
                switch (pageViewshop) {
                    case PAGE_VIEW_SHOP.COIN: pageViewShop_2 = PAGE_VIEW_SHOP_2.COIN; break;
                    case PAGE_VIEW_SHOP.DAILY_QUEST: pageViewShop_2 = PAGE_VIEW_SHOP_2.DAILY_QUEST; break;
                }
                this.mIndicatorShop_2.ChangeIndicator(pageViewShop_2, oldIndex, timeScrollTo);
            } else {
                this.mIndicatorShop_2.ChangeIndicator(pageViewshop, oldIndex, timeScrollTo);
            }
        }
    }

    public async InitShopWhenStart(): Promise<boolean> {
        if (this._isInitFirstTime) {
            // gen UI again to make it right data
            this.logicGenItemShop.GenUIPack();
            this.logicGenItemShop.GenUICoin();
            this.logicGenItemShop.GenUIDailyQuest();
            this.logicGenItemShop.GenUITicket();

            await Utils.delay(MConfig_TypeShop.TIME_WAIT_INIT_SHOP_FIRST_TIME * 1000);
            this._canCheckScrollToPage = true;
            this._isInitFirstTime = false;

            return true;
        }

        return false;
    }

    private _isInitFirstTime: boolean = true;
    /**
     * Func này sẽ được gọi nếu như auto load từ start của page
     * ```
     * ```
     * Hoặc gọi manual sau khi load xong UIShop. 
     * @param pageViewHome 
     * @returns 
     */
    public async ScrollToPageWhenStart(pageViewStart: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2, type: 1 | 2) {
        if (this._isInitFirstTime) {
            // change page to pageView you want
            if (this.nIndicator_full.active) {
                this.mIndicatorShop.SetStart(pageViewStart);
            } else {
                this.mIndicatorShop_2.SetStart(pageViewStart);
            }
        }

        this.ChangePageShop(pageViewStart, type, true);
    }
    //#endregion ChangePageShop

    //#region other func
    private async DelayCheckScroll(time: number) {
        if (time <= 0) { return; }
        this._canCheckScrollToPage = false;
        await Utils.delay(time * 1000);
        this._canCheckScrollToPage = true;
    }
    //#endregion other func
}


