import { _decorator, CCBoolean, Component, Layout, Node, Prefab, Rect, ScrollView, UITransform } from 'cc';
import { MConsolLog } from './MConsolLog';
import { UIBaseSys } from './UIBaseSys';
const { ccclass, property } = _decorator;

enum STATE_SCROLL_VIEW_DELAY {
    LOADING_DATA,
    LOADING_DONE,
    NOTHING
}

const testDataFriend = [
    { player_id: 0, player_name: "Friend 0", player_photo: null },
    { player_id: 1, player_name: "Friend 1", player_photo: null },
    { player_id: 2, player_name: "Friend 2", player_photo: null },
    { player_id: 3, player_name: "Friend 3", player_photo: null },
    { player_id: 4, player_name: "Friend 4", player_photo: null },
    { player_id: 5, player_name: "Friend 5", player_photo: null },
];

export interface IMyScrollViewDelay {
    CustomOptimizeScrollView(viewRect: Rect): void;
}

@ccclass('ScrollViewDelayBase')
export class ScrollViewDelayBase extends UIBaseSys {

    @property(Node) protected contentSV: Node;
    @property(Node) protected viewSV: Node;
    @property(ScrollView) protected scroll: ScrollView;
    @property(Node) protected nLoading: Node;

    @property({ tooltip: "vertical: true | horizontal: false"}) protected typeScrollViewVertical: boolean = true;

    private isDeleteAfterNothing = true;
    private _stateScrollViewBase: STATE_SCROLL_VIEW_DELAY = STATE_SCROLL_VIEW_DELAY.NOTHING;
    private iMyScrollView: IMyScrollViewDelay;

    override async Close(typeClose?: number): Promise<void> {
        this.ChangeState(STATE_SCROLL_VIEW_DELAY.NOTHING);
        await super.Close(typeClose);
    }

    protected InitScrollView(iMyScrollViewDelay: IMyScrollViewDelay, isDeleteAfterNothing: boolean = true) {
        this.iMyScrollView = iMyScrollViewDelay;
        this.isDeleteAfterNothing = isDeleteAfterNothing;
    }

    override async PrepareDataShow(): Promise<void> {
        if (this.typeScrollViewVertical) {
            this.scroll.scrollToTop();
        } else {
            this.scroll.scrollToLeft();
        }
        await super.PrepareDataShow();
        MConsolLog.Log("call PrepareDataShow");
        this.ChangeState(STATE_SCROLL_VIEW_DELAY.LOADING_DATA);
    }

    /**
     * change loading data after prepare data show 
     *  change load done after callGetDatas
     * change load nothing when close UI
     * @param state 
     */
    protected async ChangeState(state: STATE_SCROLL_VIEW_DELAY) {
        this._stateScrollViewBase = state;

        switch (this._stateScrollViewBase) {
            case STATE_SCROLL_VIEW_DELAY.LOADING_DATA:
                MConsolLog.Log("change state loading data");
                // just load data
                this.nLoading.active = true;
                this.MCallGetDatas();
                this.scroll.node.on("scrolling", this.OptimizeScrollView, this);
                this.OptimizeScrollView();
                await this.MCallbackLoadingData();
                break;
            case STATE_SCROLL_VIEW_DELAY.LOADING_DONE:
                MConsolLog.Log("change state loading image");
                // add load scroll listen optimize
                this.nLoading.active = false;
                this.scroll.scrollToTop();
                // this.OptimizeScrollView();
                await this.MCallbackLoadingDone();
                break;
            case STATE_SCROLL_VIEW_DELAY.NOTHING:
                MConsolLog.Log("change state nothing");
                await this.MCallbackNothing();
                // unload scroll listen optimize 
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
        var viewRect :Rect;
        if (this.typeScrollViewVertical) {
            // vertical
            viewRect = new Rect(- view.width / 2, -this.contentSV.position.y - view.height / 2, view.width, view.height);
        } else {
            viewRect = new Rect(- this.contentSV.worldPosition.x - view.width / 2, - view.height / 2, view.width, view.height);
        }

        this.iMyScrollView.CustomOptimizeScrollView(viewRect);
    }


    //#region func override
    async MCallbackLoadingData() { }
    async MCallbackLoadingDone() { }
    async MCallbackNothing() { }
    /**
     * remember call await MAddItems when have data
     * and super when add all item to the content done*/
    async MCallGetDatas() {
        this.ChangeState(STATE_SCROLL_VIEW_DELAY.LOADING_DONE);
    }
    async MAddItems(dataItem: any) {
        this.nLoading.setSiblingIndex(this.contentSV.children.length - 1);
        this.contentSV.getComponent(Layout).updateLayout(true);
    }
    //#endregion
}


