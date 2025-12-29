import { _decorator, Component, Layout, Mask, Node, PageView, tween, UIOpacity, Widget } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { Utils } from '../../Utils/Utils';
import { PAGE_VIEW_LOBBY_NAME } from '../../Utils/Types';
import { PageLobbyBase } from '../../Common/PageLobbyBase';
import { MIndicatorLobby_2 } from './MIndicatorLobby_2';
import { EVENT_TUT_LOBBY } from '../OtherUI/UITutorialInGame/TypeTutorialInLobby';
const { ccclass, property } = _decorator;

/**
 * Logic của class này là chỉ có 3 page tồn tại đó là page trái , page đang show , page page phải
 * Nếu di chuyển sang page trái thì ta cần tìm cách bỏ page phải và lui về page trái sau đó thêm page phải mới
 * Nếu di chuyển sang phải thì ta cần 
 */

@ccclass('PageViewLobbySys2')
export class PageViewLobbySys2 extends Component {
    @property(Node) pages: Node[] = [];
    @property(MIndicatorLobby_2) mIndicatorLobby_2: MIndicatorLobby_2;
    @property(Node) nView: Node;
    @property(Node) nContent: Node;
    @property(Node) nBlockScrollPage: Node;
    private _pvCom: PageView = null;
    private readonly timeSwapPage = 0.3;
    private _oldPage = PAGE_VIEW_LOBBY_NAME.HOME; public get GetPageShow() { return this._oldPage; }

    protected onLoad(): void {
        this._pvCom = this.node.getComponent(PageView);
        // this.nView.getComponent(Mask).enabled = true;
        // tắt tất cả widget của page , bật chế độ Layout của content , gọi cập nhật layout
        this.pages.forEach(page => {
            const widgetCom = page.getComponent(Widget);
            widgetCom.updateAlignment();
            widgetCom.enabled = false;
        })
        const comLayout = this.nContent.getComponent(Layout);
        comLayout.enabled = true;
        comLayout.updateLayout();

        // tắt block
        this.nBlockScrollPage.active = false;
    }

    protected onEnable(): void {
        // auto show the middle page
        this.node.on('scroll-began', this.OnPageBeganScroll, this);
        clientEvent.on(MConst.EVENT.CHANGE_PAGE_LOBBY, this.SetPageIndex, this);
    }

    protected onDisable(): void {
        this.node.off('scroll-began', this.OnPageBeganScroll, this);
        clientEvent.off(MConst.EVENT.CHANGE_PAGE_LOBBY, this.SetPageIndex, this);
    }

    protected start() {
        // remove all pages
        this.RemovePage(this.pages[PAGE_VIEW_LOBBY_NAME.SHOP]);
        this.RemovePage(this.pages[PAGE_VIEW_LOBBY_NAME.CUSTOM]);
        this.RemovePage(this.pages[PAGE_VIEW_LOBBY_NAME.RANK]);
        this.RemovePage(this.pages[PAGE_VIEW_LOBBY_NAME.TOURNAMENT]);

        this.JustActivePage(this._oldPage);
        this.mIndicatorLobby_2.ChoiceTabForce(this._oldPage);
        const nPageChoice: Node = this.pages[this._oldPage];
        this._pvCom.addPage(nPageChoice);
        nPageChoice.getComponent(UIOpacity).opacity = 255;
        nPageChoice.setSiblingIndex(0);
        this._pvCom.enabled = false;
    }

    private JustActivePage(indexPage: number) {
        this.pages.forEach(page => {
            page.getComponent(UIOpacity).opacity = 0;
        })
        this.pages[indexPage].getComponent(UIOpacity).opacity = 255;
    }

    private OnPageBeganScroll() {
        // MConsolLog.Log("call on page began scroll");
        for (let i = 0; i < this.pages.length; i++) {
            this.pages[i].getComponent(UIOpacity).opacity = 255;
        }
    }

    private ShowPageScroll(indexNew: number, indexOld: number) {
        this.pages[indexNew].getComponent(UIOpacity).opacity = 255;
        this.pages[indexOld].getComponent(UIOpacity).opacity = 255;
        tween(this.pages[indexOld].getComponent(UIOpacity)).to(this.timeSwapPage - 0.1, { opacity: 0 }).start();
    }

    private HidePageScroll(indexNew: number, indexOld: number) {
        this.pages[indexNew].getComponent(UIOpacity).opacity = 255;
        this.pages[indexOld].getComponent(UIOpacity).opacity = 0;
    }

    private _queueCallChangePage: number = 0; public get GetNumQueueCallChangePage() { return this._queueCallChangePage; }
    private SetPageIndex(indexPage: number, callFromTab: boolean = false) {

        if (indexPage == this._oldPage) { return; }
        // custom listen and emit in here
        // if (indexPage == PAGE_VIEW_LOBBY_NAME.SOCIAL) {
        // clientEvent.dispatchEvent(MConst.EVENT_SOCIAL.TRY_UPDATE_DATA);
        // }

        switch (indexPage) {
            case PAGE_VIEW_LOBBY_NAME.HOME:
                clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
                break;
        }

        this._queueCallChangePage += 1;
        if (indexPage < 0 || indexPage > this.pages.length - 1) { return; }
        const typeMove: 'Left' | 'Right' = indexPage > this._oldPage ? 'Right' : 'Left';
        this.mIndicatorLobby_2.ChoiceTab(indexPage);
        this.OnPageBeganScroll();

        // show page to scroll
        this.ShowPageScroll(indexPage, this._oldPage);

        (async () => {
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

            this._pvCom.enabled = true;
            this.AddPageLeftOrRight(this.pages[indexPage], typeMove);
            this._pvCom.scrollToPage(typeMove == 'Left' ? 0 : 1, this.timeSwapPage);

            const indexPageRemove = this._oldPage;
            this._oldPage = indexPage;
            await Utils.delay(this.timeSwapPage * 1000);

            // ============== onScrollEnd ==============
            this.HidePageScroll(indexPage, indexPageRemove);
            this.RemovePage(this.pages[indexPageRemove]);

            if (this._queueCallChangePage > 0) this._queueCallChangePage -= 1;
            if (this.GetNumQueueCallChangePage == 0) {
                this.mIndicatorLobby_2.ChoiceTab(indexPage);

                this._pvCom.enabled = false;

                // use PageLoadData when show
                const nPage = this.pages[indexPage];

                nPage.getComponent(PageLobbyBase).ShowPage(callFromTab);

                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            }
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
        // this._pvCom.scrollToPage(0, 0);
    }

    public getPageIndexNow(): number {
        return this._oldPage;
    }

    public GetPageByType(type: PAGE_VIEW_LOBBY_NAME) {
        if (type == null) return null;
        return this.pages[type];
    }
}


