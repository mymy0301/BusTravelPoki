import { _decorator, CCBoolean, Component, Layout, Node, Prefab, Rect, ScrollView, UITransform, Vec2 } from 'cc';
import { Utils } from '../Utils/Utils';
import { ItemScrollViewBase } from './ItemScrollViewBase';
import { MConsolLog } from './MConsolLog';
import { UIBaseSys } from './UIBaseSys';
const { ccclass, property } = _decorator;

enum STATE_SCROLL_VIEW {
    LOADING_DATA,
    LOAD_IMAGE,
    NOTHING
}

export interface IMyScrollView {
    AddItemsToScrollView(out: (data: any[]) => void): Promise<void>;
    SetDataWhenInitNewItem(item: Node, index: number, data: any): Promise<void>;
}

@ccclass('ScrollViewBase')
export class ScrollViewBase extends UIBaseSys {

    @property(Node) protected contentSV: Node;
    @property(Node) protected viewSV: Node;
    @property(ScrollView) protected scroll: ScrollView;
    @property(Node) protected BlockScrollView: Node;

    @property({ tooltip: "vertical: true | horizontal: false" }) protected typeScrollViewVertical: boolean = true;

    private isDeleteAfterNothing = true;
    private _stateScrollViewBase: STATE_SCROLL_VIEW = STATE_SCROLL_VIEW.NOTHING;
    private iMyScrollView: IMyScrollView;
    private infoData: any[] = [];

    override async Close(typeClose?: number): Promise<void> {
        this.ChangeState(STATE_SCROLL_VIEW.NOTHING);
        await super.Close(typeClose);
    }

    protected InitScrollView(iMyScrollView: IMyScrollView, isDeleteAfterNothing: boolean = true) {
        this.iMyScrollView = iMyScrollView;
        this.isDeleteAfterNothing = isDeleteAfterNothing;
    }

    override async PrepareDataShow(): Promise<void> {
        this.ChangeState(STATE_SCROLL_VIEW.LOADING_DATA);
        await super.PrepareDataShow();
    }

    private async ChangeState(state: STATE_SCROLL_VIEW) {
        // MConsolLog.Log("xxxxxxxxchange state: " + state);

        this._stateScrollViewBase = state;

        switch (this._stateScrollViewBase) {
            case STATE_SCROLL_VIEW.LOADING_DATA:
                // MConsolLog.Log("change state loading data");

                if (this.typeScrollViewVertical) {
                    this.scroll.scrollToTop();
                } else {
                    this.scroll.scrollToLeft();
                }

                await this.MCallbackLoadingData();
                // just load data
                this.BlockScrollView.active = true;
                await this.iMyScrollView.AddItemsToScrollView((data: any[]) => {
                    this.infoData = Array.from(data);
                });

                // init data
                await Utils.delay(10);
                this.scroll.node.on("scrolling", this.OptimizeScrollView, this);
                this.OptimizeScrollView();
                await this.ChangeState(STATE_SCROLL_VIEW.LOAD_IMAGE);
                break;
            case STATE_SCROLL_VIEW.LOAD_IMAGE:
                // await Utils.delay(5 * 1000);
                // MConsolLog.Log("change state loading image");
                await this.MCallbackPreloadingImage();
                // add load scroll listen optimize
                this.BlockScrollView.active = false;
                await this.MCallbackLoadingImage();
                break;
            case STATE_SCROLL_VIEW.NOTHING:
                // MConsolLog.Log("change state nothing");
                await this.MCallbackNothing();
                // unload scroll listen optimize 
                this.BlockScrollView.active = true;
                this.scroll.node.off("scrolling", this.OptimizeScrollView, this);
                // clear data
                if (this.isDeleteAfterNothing) {
                    this.contentSV.removeAllChildren();
                }
                break;
            default: break;
        }
    }

    public OptimizeScrollView() {
        let view = this.viewSV.getComponent(UITransform);
        var viewRect;
        if (this.typeScrollViewVertical) {
            // vertical
            viewRect = new Rect(- view.width / 2, -this.contentSV.position.y - view.height / 2, view.width, view.height);
        } else {
            viewRect = new Rect(- this.contentSV.position.x - view.width / 2, - view.height / 2, view.width, view.height);
        }

        this.MCustomOptimizeScrollView(viewRect);
    }

    /**
     * if you want add anchor view you can modife this func to show anchor view
     * @param viewRect 
     */
    MCustomOptimizeScrollView(viewRect: Rect): void {
        for (let i = 0; i < this.contentSV.children.length; i++) {
            const node = this.contentSV.children[i];
            if (!node.active) { continue; }
            const itemScrollViewBase = node.getComponent(ItemScrollViewBase);
            if (viewRect.intersects(node.getComponent(UITransform).getBoundingBox())) {
                itemScrollViewBase.Show();
            }
            else {
                itemScrollViewBase.Hide();
            }
        }
    }

    protected CountMaxNumItemNeedGen(heightItem: number): number {
        // remember some option value need careful : padding top , padding bottom
        let result = -1;
        /*logic
        height of view / (height item  + spacingY/X)
        */
        // need to check in two case
        let heightView = this.viewSV.getComponent(UITransform).contentSize.height;
        let spacing = this.contentSV.getComponent(Layout).spacingY;
        result = Math.floor(heightView / (heightItem + spacing)) + 2;               // +2 up and down
        MConsolLog.Log("number num item need to gen for this scroll : " + result);
        return result;
    }

    /**
     * 
     * @param index 
     * @param time 
     * @param out return isScrollToTop
     */
    protected async scrollToIndex(index: number, time: number = 0, out?: (isScrollToTop: boolean) => void) {
        const heightItem = this.contentSV.children[0].getComponent(UITransform).height;
        const LayoutCom = this.contentSV.getComponent(Layout);
        const spacingY = LayoutCom.spacingY;
        const paddingTop = LayoutCom.paddingTop;

        let posYItem = index * heightItem + (index - 1) * spacingY + paddingTop;
        const halfHeightView = this.viewSV.getComponent(UITransform).height / 2.0;
        let offSetMoveTo = posYItem - halfHeightView;
        // MConsolLog.Log(posYItem, halfHeightView, offSetMoveTo);

        if (offSetMoveTo <= 0) {
            this.scroll.scrollToTop(time);
            if (out != null) { out(true); }
        } else {
            this.scroll.scrollToOffset(new Vec2(0, offSetMoveTo), time);
            if (out != null) { out(false); }
        }

        await Utils.delay(time * 1000);
    }

    async MCallbackPreloadingImage() { }
    async MCallbackLoadingData() { }
    async MCallbackLoadingImage() { }
    async MCallbackNothing() { }
}


