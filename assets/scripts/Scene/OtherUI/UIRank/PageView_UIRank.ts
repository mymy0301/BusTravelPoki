import { _decorator, Component, Layout, Mask, Node, PageView, UIOpacity, Widget } from 'cc';
import { MIndicatorRank } from './MIndicatorRank';
import { EVENT_RANK_CHANGE_PAGE, EVENT_RANK_TURN_OFF_BLOCK_UI, EVENT_RANK_TURN_ON_BLOCK_UI, PAGE_VIEW_RANK } from './TypeRank';
import { clientEvent } from '../../../framework/clientEvent';
import { Utils } from '../../../Utils/Utils';
import { PageGlobal_UIRank } from './PageGlobal_UIRank';
import { PageWeekly_UIRank } from './PageWeekly_UIRank';
import { PageFriend_UIRank } from './PageFriend_UIRank';
const { ccclass, property } = _decorator;

/**
 * Logic của class này là chỉ có 3 page tồn tại đó là page trái , page đang show , page page phải
 * Nếu di chuyển sang page trái thì ta cần tìm cách bỏ page phải và lui về page trái sau đó thêm page phải mới
 * Nếu di chuyển sang phải thì ta cần 
 */

@ccclass('PageView_UIRank')
export class PageView_UIRank extends Component {
    @property(Node) pages: Node[] = [];
    @property(MIndicatorRank) mIndicatorRank: MIndicatorRank;
    @property(Node) nView: Node;
    @property(Node) nContent: Node;
    @property(Node) nPageStart: Node;
    @property(Node) nTime: Node;
    private _pvCom: PageView = null;
    private readonly timeSwapPage = 0.3;
    private _oldPage = PAGE_VIEW_RANK.WEEKLY;

    protected onLoad(): void {
        // auto show the middle page
        this._pvCom = this.node.getComponent(PageView);
        this.node.on('scroll-ended', this.OnScrollEnd, this);
        this.node.on('scroll-began', this.OnPageBeganScroll, this);
        clientEvent.on(EVENT_RANK_CHANGE_PAGE, this.SetPageIndex, this);
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
        clientEvent.off(EVENT_RANK_CHANGE_PAGE, this.SetPageIndex, this);
    }

    protected start() {
        this.JustActivePage(this._oldPage);
        this.mIndicatorRank.SetStart(this._oldPage);
        const nPageChoice: Node = this.pages[this._oldPage];
        this._pvCom.addPage(nPageChoice);
        nPageChoice.getComponent(UIOpacity).opacity = 255;
        nPageChoice.setSiblingIndex(0);
        this._pvCom.enabled = false;
        this.nTime.active = true;
    }

    private JustActivePage(indexPage: number) {
        this.pages.forEach(page => {
            page.getComponent(UIOpacity).opacity = 0;
        })
        this.pages[indexPage].getComponent(UIOpacity).opacity = 255;
        switch (this._oldPage) {
            case PAGE_VIEW_RANK.GLOBAL:
                this.pages[this._oldPage].getComponent(PageGlobal_UIRank).TryCallDataUntilHaveData();
                break;
            case PAGE_VIEW_RANK.WEEKLY:
                this.pages[this._oldPage].getComponent(PageWeekly_UIRank).TryCallDataUntilHaveData();
                break;
        }
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
            this.mIndicatorRank.ChangeIndicator(this._pvCom.getCurrentPageIndex(), this._oldPage, this.timeSwapPage);
        }
        this._isClickIndicator = false;
        this.HidePageScroll(this._tempIndexNewPage, this._oldPage);
    }

    private ShowPageScroll(indexNew: number, indexOld: number) {
        this.pages[indexNew].getComponent(UIOpacity).opacity = 255;
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
            case PAGE_VIEW_RANK.GLOBAL:
                this.pages[PAGE_VIEW_RANK.GLOBAL].getComponent(PageGlobal_UIRank).TryCallDataUntilHaveData();
                this.nTime.active = false;
                break;
            case PAGE_VIEW_RANK.WEEKLY:
                this.pages[PAGE_VIEW_RANK.WEEKLY].getComponent(PageWeekly_UIRank).TryCallDataUntilHaveData();
                this.nTime.active = true;
                break;
            case PAGE_VIEW_RANK.FRIEND:
                this.pages[PAGE_VIEW_RANK.FRIEND].getComponent(PageFriend_UIRank).TryCallDataUntilHaveData();
                this.nTime.active = false;
                break;
            default:
                break;
        }

        this._isClickIndicator = true;
        if (indexPage < 0 || indexPage > this.pages.length - 1) { return; }
        const typeMove: 'Left' | 'Right' = indexPage > this._oldPage ? 'Right' : 'Left';
        this._tempIndexNewPage = indexPage;
        this.mIndicatorRank.ChangeIndicator(indexPage, this._oldPage, this.timeSwapPage);
        this.OnPageBeganScroll();

        // show page to scroll
        this.ShowPageScroll(indexPage, this._oldPage);

        (async () => {
            clientEvent.dispatchEvent(EVENT_RANK_TURN_ON_BLOCK_UI);

            this._pvCom.enabled = true;
            this.AddPageLeftOrRight(this.pages[indexPage], typeMove);
            this._pvCom.scrollToPage(typeMove == 'Left' ? 0 : 1, this.timeSwapPage);
            await Utils.delay(this.timeSwapPage * 1000);
            this.RemovePage(this.pages[this._oldPage]);
            await Utils.delay(0.1 * 1000);
            this._pvCom.enabled = false;

            this._oldPage = indexPage;

            clientEvent.dispatchEvent(EVENT_RANK_TURN_OFF_BLOCK_UI);
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
}


