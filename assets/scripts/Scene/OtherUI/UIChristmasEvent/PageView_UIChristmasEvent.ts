import { _decorator, Component, Layout, Mask, Node, PageView, tween, UIOpacity, Widget } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { Utils } from '../../../Utils/Utils';
import { MIndicatorChristmasEvent } from './MIndicatorChristmasEvent';
import { EVENT_CHRISTMAS_EVENT, PAGE_VIEW_CHRISTMAS_EVENT } from './TypeChristmasEvent';
import { PageLightRoad_UIChristmasEvent } from './PageLightRoad_UIChristmasEvent';
import { PageHatRace_UIChristmasEvent } from './PageHatRace_UIChristmasEvent';
import { PageItem } from '../../../Common/UltimatePageView/PageItem';
import { BgChristControl } from './BgChristControl';
const { ccclass, property } = _decorator;

/**
 * Logic của class này là chỉ có 3 page tồn tại đó là page trái , page đang show , page page phải
 * Nếu di chuyển sang page trái thì ta cần tìm cách bỏ page phải và lui về page trái sau đó thêm page phải mới
 * Nếu di chuyển sang phải thì ta cần 
 */

@ccclass('PageView_UIChristmasEvent')
export class PageView_UIChristmasEvent extends Component {
    @property(Node) pages: Node[] = [];
    @property(MIndicatorChristmasEvent) mIndicatorChristmasEvent: MIndicatorChristmasEvent;
    @property(Node) nView: Node;
    @property(Node) nContent: Node;
    @property(Node) nPageStart: Node;
    @property(BgChristControl) bgChristControl: BgChristControl;
    private _pvCom: PageView = null;
    private readonly timeSwapPage = 0.3;
    private _oldPage = PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD;

    protected onLoad(): void {
        // auto show the middle page
        this._pvCom = this.node.getComponent(PageView);
        this.node.on('scroll-ended', this.OnScrollEnd, this);
        this.node.on('scroll-began', this.OnPageBeganScroll, this);
        clientEvent.on(EVENT_CHRISTMAS_EVENT.CHANGE_PAGE, this.SetPageIndex, this);
        // this.nView.getComponent(Mask).enabled = true;

        // remove all pages
        this._pvCom.removeAllPages();

        // tắt tất cả widget của page , bật chế độ Layout của content , gọi cập nhật layout
        this.pages.forEach(page => {
            const widgetCom = page.getComponent(Widget);
            widgetCom.updateAlignment();
            widgetCom.enabled = false;
        })
        const comLayout = this.nContent.getComponent(Layout);
        comLayout.enabled = true;
        comLayout.updateLayout();
    }

    protected onDestroy(): void {
        this.node.off('scroll-ended', this.OnScrollEnd, this);
        this.node.off('scroll-began', this.OnPageBeganScroll, this);
        clientEvent.off(EVENT_CHRISTMAS_EVENT.CHANGE_PAGE, this.SetPageIndex, this);
    }

    protected start() {
        // this.JustActivePage(this._oldPage);
        // this.mIndicatorChristmasEvent.SetStart(this._oldPage);
        // const nPageChoice: Node = this.pages[this._oldPage];
        // this._pvCom.addPage(nPageChoice);
        // nPageChoice.getComponent(UIOpacity).opacity = 255;
        // nPageChoice.setSiblingIndex(0);
        // this._pvCom.enabled = false;
    }

    public PreloadUI(pageStart: PAGE_VIEW_CHRISTMAS_EVENT = null) {
        if (pageStart != null) this._oldPage = pageStart;
        this.pages[this._oldPage].getComponent(PageItem).CBPrepareShow();
    }

    public ActivePageWhenStart(pageStart: PAGE_VIEW_CHRISTMAS_EVENT = null) {
        if (pageStart != null) {
            this._oldPage = pageStart;
        }

        this.JustActivePage(this._oldPage);
        this.mIndicatorChristmasEvent.SetStart(this._oldPage);
        const nPageChoice: Node = this.pages[this._oldPage];
        this._pvCom.addPage(nPageChoice);
        nPageChoice.getComponent(UIOpacity).opacity = 255;
        nPageChoice.setSiblingIndex(0);
        this._pvCom.enabled = false;

        // depend page => light or unLightBg
        switch (this._oldPage) {
            case PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD:
                this.bgChristControl.AnimLightBg(true);
                break;
            case PAGE_VIEW_CHRISTMAS_EVENT.HAT_RACE:
                this.bgChristControl.AnimUnLightBg(true);
                break;
        }
    }

    private JustActivePage(indexPage: number) {
        this.pages.forEach(page => {
            page.getComponent(UIOpacity).opacity = 0;
        })
        this.pages[indexPage].getComponent(UIOpacity).opacity = 255;
        const pageShowCom = this.pages[this._oldPage].getComponent(PageItem);
        pageShowCom.TryCallDataUntilHaveData();
        pageShowCom.CBShowDone();
    }

    private OnPageBeganScroll() {
        // MConsolLog.Log("call on page began scroll");
        for (let i = 0; i < this.pages.length; i++) {
            this.pages[i].getComponent(UIOpacity).opacity = 255;
        }
    }

    private OnScrollEnd() {
        // MConsolLog.Log("call on scroll end");
        if (!this._isClickIndicator) {
            this.mIndicatorChristmasEvent.ChangeIndicator(this._pvCom.getCurrentPageIndex(), this._oldPage, this.timeSwapPage);
        }
        this._isClickIndicator = false;
        this.HidePageScroll(this._tempIndexNewPage, this._oldPage);
    }

    private ShowPageScroll(indexNew: number, indexOld: number) {
        this.pages[indexNew].getComponent(UIOpacity).opacity = 0;
        this.pages[indexOld].getComponent(UIOpacity).opacity = 255;
    }

    private HidePageScroll(indexNew: number, indexOld: number) {
        this.pages[indexNew].getComponent(UIOpacity).opacity = 255;
        this.pages[indexOld].getComponent(UIOpacity).opacity = 0;
    }

    private _isClickIndicator = false;
    private _tempIndexNewPage: number = 0;
    private SetPageIndex(indexPage: number) {
        if (indexPage == this._oldPage) { return; }

        //===============================================
        // custom listen and emit in here
        //===============================================
        switch (indexPage) {
            case PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD:
                this.pages[PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD].getComponent(PageLightRoad_UIChristmasEvent).TryCallDataUntilHaveData();
                break;
            case PAGE_VIEW_CHRISTMAS_EVENT.HAT_RACE:
                this.pages[PAGE_VIEW_CHRISTMAS_EVENT.HAT_RACE].getComponent(PageHatRace_UIChristmasEvent).TryCallDataUntilHaveData();
                break;
            default:
                break;
        }

        this._isClickIndicator = true;
        if (indexPage < 0 || indexPage > this.pages.length - 1) { return; }
        const typeMove: 'Left' | 'Right' = indexPage > this._oldPage ? 'Right' : 'Left';
        this._tempIndexNewPage = indexPage;
        this.mIndicatorChristmasEvent.ChangeIndicator(indexPage, this._oldPage, this.timeSwapPage);
        this.OnPageBeganScroll();

        // show page to scroll
        this.ShowPageScroll(indexPage, this._oldPage);

        (async () => {
            clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.BLOCK_UI, true);

            // tween bg change color
            // depend page => light or unLightBg
            switch (indexPage) {
                case PAGE_VIEW_CHRISTMAS_EVENT.LIGHT_ROAD:
                    this.bgChristControl.AnimLightBg(false, this.timeSwapPage);
                    break;
                case PAGE_VIEW_CHRISTMAS_EVENT.HAT_RACE:
                    this.bgChristControl.AnimUnLightBg(false, this.timeSwapPage);
                    break;
            }

            const pageClose: Node = this.pages[this._oldPage];
            const pageShow: Node = this.pages[indexPage]

            this._pvCom.enabled = true;
            this.AddPageLeftOrRight(pageShow, typeMove);
            this._pvCom.scrollToPage(typeMove == 'Left' ? 0 : 1, this.timeSwapPage);
            tween(pageClose.getComponent(UIOpacity))
                .call(() => { pageClose.getComponent(PageItem).CBPrepareClose() })
                .to(this.timeSwapPage, { opacity: 0 }, { easing: 'expoOut' })
                .call(() => { pageClose.getComponent(PageItem).CBCloseDone(); })
                .start();
            tween(pageShow.getComponent(UIOpacity))
                .call(() => { pageShow.getComponent(PageItem).CBPrepareShow(); })
                .to(this.timeSwapPage, { opacity: 255 }, { easing: 'expoIn' })
                .call(() => { pageShow.getComponent(PageItem).CBShowDone(); })
                .start();
            await Utils.delay(this.timeSwapPage * 1000);
            this.RemovePage(this.pages[this._oldPage]);
            await Utils.delay(0.1 * 1000);
            this._pvCom.enabled = false;

            this._oldPage = indexPage;

            clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.BLOCK_UI, false);
        })();
    }

    private AddPageLeftOrRight(nPageNew: Node, type: 'Left' | 'Right') {
        const indexPage: number = type == 'Left' ? 0 : 1;
        this._pvCom.insertPage(nPageNew, indexPage);
        if (type == 'Left') {
            this._pvCom.scrollToPage(1, 0);
        }
        nPageNew.setSiblingIndex(indexPage);
    }

    private RemovePage(nPageRemove: Node) {
        this._pvCom.removePage(nPageRemove);
        this._pvCom.scrollToPage(0, 0);
    }

    public getPageIndexNow(): number {
        return this._oldPage;
    }

    public RegisterCb(...args: any[]) {
        this.pages.forEach(page => page.getComponent(PageItem).RegisterCb(...args))
    }
}


