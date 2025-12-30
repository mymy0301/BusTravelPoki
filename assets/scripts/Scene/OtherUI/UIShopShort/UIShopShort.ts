/**
 * 
 * anhngoxitin01
 * Thu Oct 30 2025 15:16:08 GMT+0700 (Indochina Time)
 * UIShopShort
 * db://assets/scripts/Scene/OtherUI/UIShopShort/UIShopShort.ts
*
*/
import { _decorator, Component, Node, Rect, ScrollView, Tween, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { MoneyUISys } from '../../../DataBase/Currency/MoneyUISys';
import { TicketUISys } from '../../../DataBase/Currency/TicketUISys';
import { LogicGenItemShop } from '../UIShop/LogicGenItemShop';
import { SuperUIAnimCustom } from '../SuperUIAnimCustom';
import { instanceOfDataCustomUIShop, MConfig_TypeShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../UIShop/TypeShop';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { MConfigs } from '../../../Configs/MConfigs';
import { CurrencySys } from '../../CurrencySys';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { ItemScrollViewBase } from '../../../Common/ItemScrollViewBase';
import { CurrencyUIBaseSys } from '../../../DataBase/Currency/CurrencyUIBaseSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { Utils } from '../../../Utils/Utils';
import { Shop_UIExpand } from './Shop_UIExpand';
const { ccclass, property } = _decorator;

@ccclass('UIShopShort')
export class UIShopShort extends UIBaseSys {
    @property(Node) viewSV: Node;
    @property(Node) contentSV: Node;
    @property(ScrollView) scrollView: ScrollView;
    @property(MoneyUISys) moneyUISys: MoneyUISys;
    @property(TicketUISys) ticketUISys: TicketUISys;
    @property(Node) nBlockShop: Node;
    @property(LogicGenItemShop) logicGenItemShop: LogicGenItemShop = new LogicGenItemShop();
    @property(SuperUIAnimCustom) superUIAnimCustom: SuperUIAnimCustom;
    @property(Shop_UIExpand) shopUIExpand: Shop_UIExpand;
    @property(Node) nBtnExpand: Node;

    private _oldIndexShop: number = PAGE_VIEW_SHOP.DAILY_QUEST;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SHOP.SCROLL_SHOP_LOBBY, this.ScrollShop, this);
        clientEvent.on(MConst.EVENT_SHOP.GET_WPOS_UI_COIN, this.GetWPosUICoin, this);
        clientEvent.on(MConst.EVENT_SHOP.GET_WPOS_UI_TICKET, this.GetWPosTicket, this);
        clientEvent.on(MConst.EVENT_SHOP.GET_UI_ANIM_CUSTOM_COM, this.GetUIAnimCustomCom, this);
        clientEvent.on(MConst.EVENT_SHOP.UPDATE_SCROLL_SHOP, this.UpdateScrollShop, this);

        //set data for scroll view
        this.scrollView.node.on("scrolling", this.OptimizeScrollView, this);
        this.scrollView.scrollToTop();
        this.OptimizeScrollView();
    }


    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SHOP.SCROLL_SHOP_LOBBY, this.ScrollShop, this);
        clientEvent.off(MConst.EVENT_SHOP.GET_WPOS_UI_COIN, this.GetWPosUICoin, this);
        clientEvent.off(MConst.EVENT_SHOP.GET_WPOS_UI_TICKET, this.GetWPosTicket, this);
        clientEvent.off(MConst.EVENT_SHOP.GET_UI_ANIM_CUSTOM_COM, this.GetUIAnimCustomCom, this);
        clientEvent.off(MConst.EVENT_SHOP.UPDATE_SCROLL_SHOP, this.UpdateScrollShop, this);
    }

    public async PrepareDataShow(): Promise<void> {
        // init UIExpand
        this.shopUIExpand.PrepareAnim();
        this.shopUIExpand.PlayAnimShow();
        this.scrollView.node.active = false;
        this.shopUIExpand.node.parent.getComponent(UIOpacity).opacity = 255;
        this.nBtnExpand.active = true;
        const listDataPackExpand = this.logicGenItemShop.GetInfoShopForExpand();
        this.shopUIExpand.TrySetDataPacks(listDataPackExpand.pack, listDataPackExpand.coin);
        this.shopUIExpand.node.parent.active = true;

        // init list root
        await this.InitShopWhenStart();

        // update UI 
        this.moneyUISys.SetUp(CurrencySys.Instance.GetMoney());
        this.ticketUISys.SetUp(CurrencySys.Instance.GetTicket());

        this.ScrollToPageWhenStart(PAGE_VIEW_SHOP.PACKAGE, 1);

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
    }

    private ScrollShop(indexItem: number, timeScroll: number = 0, type: 1 | 2) {
        if (indexItem < 0 || indexItem >= this.contentSV.children.length) {
            return;
        }

        let posYItem = this.contentSV.children[indexItem].position.y;
        let scrollOffSet = posYItem;

        scrollOffSet = this.logicGenItemShop.GetOffSetOfUI(indexItem, type);

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
    }
    //#endregion FUNC listen

    //#region button
    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIShop");

        // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SHOP_SHORT, 2);
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

        // const timeScrollTo: number = !force ? MConfig_TypeShop.TIME_SCROLL_INDICATOR : MConfig_TypeShop.TIME_SCROLL_INDICATOR + 0.2;
        const timeScrollTo: number = 0;
        // show block shop
        this.nBlockShop.active = true;
        this.ScrollShop(pageViewshop, timeScrollTo, type);
        await Utils.delay(timeScrollTo * 1000);
        this.nBlockShop.active = false;

        // udpate new oldIndex
        this._oldIndexShop = pageViewshop;
    }

    public async InitShopWhenStart(): Promise<boolean> {
        if (this._isInitFirstTime) {
            // gen UI again to make it right data
            this.logicGenItemShop.GenUIPack();
            this.logicGenItemShop.GenUICoin();
            this.logicGenItemShop.GenUIDailyQuest();
            this.logicGenItemShop.GenUITicket();

            await Utils.delay(MConfig_TypeShop.TIME_WAIT_INIT_SHOP_FIRST_TIME * 1000);
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
        }

        this.ChangePageShop(pageViewStart, type, true);
    }
    //#endregion ChangePageShop

    //=====================================================================
    //#region Expand
    private async BtnExpand() {
        this.shopUIExpand.node.parent.active = false;
        this.scrollView.node.active = true;
        this.nBtnExpand.active = false;

        this.logicGenItemShop.UpdateInfoShop();

        // chỉ anim pack và coin thôi là được
        this.nBlockShop.active = true;
        await this.logicGenItemShop.PlayAnimShow();
        this.nBlockShop.active = false;
    }
    //#endregion Expand
    //=====================================================================
}