import { _decorator, Component, Mask, Node, PageView, UIOpacity } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { MIndicatorLobby } from './MIndicatorLobby';
import { MConsolLog } from '../../Common/MConsolLog';
import { Utils } from '../../Utils/Utils';
import { PAGE_VIEW_LOBBY_NAME } from '../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('PageViewLobbySys')
export class PageViewLobbySys extends Component {
    @property(Node) pages: Node[] = [];
    @property(MIndicatorLobby) mIndicatorLobby: MIndicatorLobby;
    @property(Node) nView: Node;
    private _pvCom: PageView = null;
    private readonly timeSwapPage = 0.3;
    private oldPage = PAGE_VIEW_LOBBY_NAME.HOME;

    protected onLoad(): void {
        // auto show the middle page
        this._pvCom = this.node.getComponent(PageView);
        this.node.on('scroll-ended', this.OnScrollEnd, this);
        this.node.on('scroll-began', this.OnPageBeganScroll, this);
        clientEvent.on(MConst.EVENT.CHANGE_PAGE_LOBBY, this.SetPageIndex, this);
        this.nView.getComponent(Mask).enabled = true;
        this.node.getComponent(PageView).enabled = false;
    }

    protected onDestroy(): void {
        this.node.off('scroll-ended', this.OnScrollEnd, this);
        this.node.off('scroll-began', this.OnPageBeganScroll, this);
        clientEvent.off(MConst.EVENT.CHANGE_PAGE_LOBBY, this.SetPageIndex, this);
    }

    protected start() {
        // this.mIndicatorLobby.setWPosIcon();
        this.JustActivePage(this.oldPage);
        this.mIndicatorLobby.SetStart(PAGE_VIEW_LOBBY_NAME.HOME);
        this._pvCom.scrollToPage(PAGE_VIEW_LOBBY_NAME.HOME, 0);
    }

    private JustActivePage(indexPage: number) {
        this.pages.forEach(page => {
            page.getComponent(UIOpacity).opacity = 0;
        })
        this.pages[indexPage].getComponent(UIOpacity).opacity = 255;
    }

    private OnPageBeganScroll() {
        MConsolLog.Log("call on page began scroll");
        for (let i = 0; i < this.pages.length; i++) {
            this.pages[i].getComponent(UIOpacity).opacity = 255;
        }
    }

    private OnScrollEnd() {
        // MConsolLog.Log("call on scroll end");
        if (!this._isClickIndicator) {
            this.mIndicatorLobby.ChangeIndicator(this._pvCom.getCurrentPageIndex(), this.oldPage, this.timeSwapPage);
        }
        this._isClickIndicator = false;
        this.TryShowOrHidePage(this._pvCom.getCurrentPageIndex());
    }

    private TryShowOrHidePage(index: number): void {
        this.pages[index].getComponent(UIOpacity).opacity = 255;
        for (let i = 0; i < this.pages.length; i++) {
            if (i != index) {
                this.pages[i].getComponent(UIOpacity).opacity = 0;
            }
        }
    }

    private _isClickIndicator = false;
    private SetPageIndex(indexPage: number) {
        if (indexPage == this._pvCom.getCurrentPageIndex()) { return; }
        // custom listen and emit in here
        // if (indexPage == PAGE_VIEW_LOBBY_NAME.SOCIAL) {
        // clientEvent.dispatchEvent(MConst.EVENT_SOCIAL.TRY_UPDATE_DATA);
        // }

        this._isClickIndicator = true;
        if (indexPage < 0 || indexPage > this.pages.length - 1) { return; }
        this.oldPage = this._pvCom.getCurrentPageIndex();
        this.mIndicatorLobby.ChangeIndicator(indexPage, this.oldPage, this.timeSwapPage);
        this.OnPageBeganScroll();
        (async () => {
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            this.node.getComponent(PageView).enabled = true;
            this._pvCom.scrollToPage(indexPage, this.timeSwapPage);
            await Utils.delay(this.timeSwapPage * 1000);
            this.node.getComponent(PageView).enabled = false;
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        })();
    }

    public getPageIndexNow(): number {
        return this._pvCom.getCurrentPageIndex();
    }
}


