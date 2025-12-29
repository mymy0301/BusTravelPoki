import { _decorator, CCBoolean, CCInteger, Component, director, instantiate, Layout, Node, Prefab, Rect, ScrollView, Size, tween, UITransform, Vec2, Vec3 } from 'cc';
import { Utils } from '../Utils/Utils';
import { ObjectPool } from '../Utils/ObjPool';
import { ItemScrollViewBase2 } from './ItemScrollViewBase2';
import { MConsolLog } from './MConsolLog';
import { UIBaseSys } from './UIBaseSys';
const { ccclass, property } = _decorator;

enum STATE_SCROLL_VIEW {
    LOADING_DATA,
    PLAY_ANIM_INDEX,
    LOAD_IMAGE,
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

export interface IMyScrollView {
    AddData(out: (data: any[]) => void): Promise<void>;
    SetDataWhenInitNewItem(item: Node, index: number, data: any): Promise<void>;
    SetDataWhenRecycleNewItem(item: Node, index: number, data: any): void;
}

export interface IScrollWithAnchorView {
    LogicCanSetDataAnchorView(nAnchor: Node, data: any, out: (hadPlayer: boolean) => void): Promise<void>;
    LogicShowAnchorView(nAnchor: Node, itemShowing: Map<number, Node>): boolean;
    LogicCanAddEmptyFixView(data: any, numberItemShowLastView: number): boolean;
}

export interface IScrollWithAnim {
    SetDataFakeData(nFakeData: Node, data: any): Promise<void>;
    LogicSetIndexFakeData(indexTrueData: number, listData: any): number;
    LogicSetIndexTrueData(listData: any): number;
    UpdateDataAfterAnimIndex(indexFalseData: number, listData: any): Promise<void>;
    GetNodeSameIndex(indexTrueData: number): Node;
}

export const EVENT_SCROLL_VIEW = {
    START_CHANGE_STATE: "EVENT_SCROLL_VIEW_START_CHANGE_STATE",
    END_CHANGE_STATE: "EVENT_SCROLL_VIEW_END_CHANGE_STATE",
};

@ccclass('ScrollViewBase2')
export class ScrollViewBase2 extends UIBaseSys {

    @property(Node) protected contentSV: Node;
    @property(Node) protected viewSV: Node;
    @property(ScrollView) protected scroll: ScrollView;
    @property(Node) protected BlockScrollView: Node;
    @property(Prefab) protected itemPrefab: Prefab;

    @property({ tooltip: "vertical: true | horizontal: false" }) protected typeScrollViewVertical = false;
    @property({ tooltip: "vertical: true | horizontal: false" }) protected topToBottom: boolean = true;

    @property({ group: "Custom layout", type: CCInteger }) private spacingX: number = 0;
    @property({ group: "Custom layout", type: CCInteger }) private spacingY: number = 0;
    @property({ group: "Custom layout", type: CCInteger }) private paddingTop: number = 0;
    @property({ group: "Custom layout", type: CCInteger }) private countShowItem: number = 0;

    @property({ group: "AnchorView" }) private isUseAnchorView: boolean = false;
    @property({ group: "AnchorView", type: Node }) protected nAnchorView: Node;
    @property({ group: "AnchorView", type: CCInteger }) protected numberItemLastView: number;

    @property({ group: "AnimMoveIndex" }) private isUseAnimMoveIndex: boolean = false;
    @property({ group: "AnimMoveIndex", type: Node }) protected nFakeData: Node;
    private _canPlayAnim: boolean = false;
    private indexFakeData: number = -1;
    private indexTrueData: number = -1;

    private posYStart: number = 0;
    private posXStart: number = 0;

    private _dataHasPlayer = false;
    private isDeleteAfterNothing = true;
    private _stateScrollViewBase: STATE_SCROLL_VIEW = STATE_SCROLL_VIEW.NOTHING;
    private _IMyScrollView: IMyScrollView = null;
    private _IScrollWithAnchorView: IScrollWithAnchorView;
    private _IScrollWithAnim: IScrollWithAnim;

    private sizeContent: Size = new Size();
    private sizeItem: Size = new Size();

    private inforData: any[] = []; public get InforData(): any[] { return this.inforData; }
    private itemsPool: ObjectPool;
    mapItemBoards: Map<number, Node> = new Map();

    override async Close(typeClose?: number, useCloseFunc: boolean = false): Promise<void> {
        this.ChangeState(STATE_SCROLL_VIEW.NOTHING);
        if (useCloseFunc) {
            await super.Close(typeClose);
        }
    }

    public ResetData() {
        this.ChangeState(STATE_SCROLL_VIEW.NOTHING);
    }

    protected InitScrollView(iMyScrollView: IMyScrollView, isDeleteAfterNothing: boolean = true) {
        // MConsolLog.Log("InitScrollView: ", this.node.name, iMyScrollView);

        this._IMyScrollView = iMyScrollView;
        this.isDeleteAfterNothing = isDeleteAfterNothing;
    }

    protected InitScrollViewWithAnchor(IScrollWithAnchorView: IScrollWithAnchorView) {
        this._IScrollWithAnchorView = IScrollWithAnchorView;
    }

    protected InitScrollWithIndexAnim(IScrollWithAnim: IScrollWithAnim) {
        this._IScrollWithAnim = IScrollWithAnim;
    }

    override async PrepareDataShow(): Promise<void> {
        if (this._IMyScrollView != null) {
            this.ChangeState(STATE_SCROLL_VIEW.LOADING_DATA);
        } else {
            // =============== in some case after you init and call the func show but you call this func before sys call onLoad in game ========================
            // =============== don't ask me why lifeCycle is not working here =================
            this._IMyScrollView = this.getInstanceiMyScollViewInterface();
            this.ChangeState(STATE_SCROLL_VIEW.LOADING_DATA);
        }

        await this.MPrepareDataShow();
        await super.PrepareDataShow();
    }

    private async ChangeState(state: STATE_SCROLL_VIEW) {
        this._stateScrollViewBase = state;

        // emit change state
        this.node.emit(EVENT_SCROLL_VIEW.START_CHANGE_STATE, state);

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
                await this.AddItemScrollView();

                // await this.iMyScrollView.AddItemsToScrollView();
                await Utils.delay(10);

                this.lastIndexPosCenter = this.LoadToIndexStart();

                // because some UI has implement this code has load when you change scene
                // break the code in this case
                if (this.scroll == null) { return; }
                this.scroll.node.on("scrolling", this.OptimizeScrollView, this);

                this.OptimizeScrollView();

                if (this.typeScrollViewVertical && !this.topToBottom) {
                    this.scrollToIndex(this.inforData.length - 1);
                    this.OptimizeScrollView();
                }

                this.ChangeState(STATE_SCROLL_VIEW.PLAY_ANIM_INDEX);
                break;

            case STATE_SCROLL_VIEW.PLAY_ANIM_INDEX:
                if (!this.isUseAnimMoveIndex || !this._canPlayAnim) {
                    this.MCallbackPlayAnimDone();

                    await this.ChangeState(STATE_SCROLL_VIEW.LOAD_IMAGE);
                    break;
                }

                //play logic anim
                await this.LogicPlayAnim();

                this.MCallbackPlayAnimDone();

                this.ChangeState(STATE_SCROLL_VIEW.LOAD_IMAGE);
                break;
            case STATE_SCROLL_VIEW.LOAD_IMAGE:
                // MConsolLog.Log("change state loading image");
                this.TryShowAnchorView();
                // load image
                await this.MCallbackPreloadingImage();
                // add load scroll listen optimize
                this.BlockScrollView.active = false;

                // load image all the player in the view
                this.mapItemBoards.forEach((item: Node, key: number) => {
                    item.getComponent(ItemScrollViewBase2).Show();
                });

                this.MCallbackLoadingImageDone();
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
                    this.inforData = [];
                    this.mapItemBoards.clear();
                    this.itemsPool = new ObjectPool();
                    this.itemsPool.InitObjectPool(this.contentSV, this.itemPrefab);
                } else {
                    this.contentSV.children.forEach(item => {
                        this.itemsPool.ReUseObj(item);
                    });
                    this.inforData = [];
                    this.mapItemBoards.clear();
                }
                break;
            default: break;
        }

        // emit change state done
        this.node.emit(EVENT_SCROLL_VIEW.END_CHANGE_STATE, state);
    }

    private async AddItemScrollView() {
        //logic
        /*
        trong iMyScrollView Add Items will add the data , call when init new item , call when recycle old item
        */

        /* ================== prepare for add items ================== */
        this._dataHasPlayer = false;
        if (this.isUseAnchorView) {
            this.nAnchorView.active = false;
        }
        if (this.itemsPool == null) {
            this.itemsPool = new ObjectPool();
            this.itemsPool.InitObjectPool(this.contentSV, this.itemPrefab);
        }
        this.contentSV.getComponent(Layout).enabled = false;

        this._canPlayAnim = this.isUseAnimMoveIndex;
        // MConsolLog.Log(Array.from(this.contentSV.children));
        /* ================== end prepare for add items ================== */

        // add data
        await this._IMyScrollView.AddData((data: any[]) => {
            this.inforData = Array.from(data);
        });

        // set data anim index
        if (this.isUseAnimMoveIndex) {
            this.nFakeData.active = false;
            this.indexFakeData = this.indexTrueData = -1;
            this.indexTrueData = this._IScrollWithAnim.LogicSetIndexTrueData(this.inforData);
            this.indexFakeData = this._IScrollWithAnim.LogicSetIndexFakeData(this.indexTrueData, this.inforData);

            if (this.indexFakeData == -1 || this.indexTrueData == -1) {
                // MConsolLog.Error("can't play anim index , something wrong");
                this._canPlayAnim = false;
            }
        }

        // init new item and add it to the pool
        // try gen first item to get height item for cacul
        let numberItem = this.inforData.length;
        if (numberItem == 0) {
            // MConsolLog.Warn("empty data"); 
            return;
        }
        if (this.contentSV.children.length == 0) {
            let firstItem = instantiate(this.itemPrefab);
            // set the data Scroll
            this.sizeItem = firstItem.getComponent(UITransform).contentSize.clone();
            firstItem.destroy();
        }

        // init items we need , init pool
        for (let i = 0; i < this.countShowItem; i++) {
            if (i < this.inforData.length) {
                let item = this.itemsPool.GetObj();
                item.name = "item " + i;
                item.setParent(this.contentSV);
                item.setPosition(this.getPosByIndex(i));
                let itemLeaderBoard: ItemScrollViewBase2 = item.getComponent(ItemScrollViewBase2);
                itemLeaderBoard.indexPos = i;
                this.mapItemBoards.set(i, item);
                const index = this.topToBottom ? i : this.countShowItem - i - 1;
                await this._IMyScrollView.SetDataWhenInitNewItem(item, index, this.inforData[i]);
                item.active = true;

                if (this._canPlayAnim && this.indexFakeData != -1 && i == this.indexFakeData) {
                    item.active = false;
                }
            }
        }

        // check if use anchor set data suit with anchor
        if (this.isUseAnchorView) {
            await this._IScrollWithAnchorView.LogicCanSetDataAnchorView(this.nAnchorView, this.inforData, (hadPlayer) => {
                this.numberItemLastView = this.CountMaxNumItemNeedGen();
                this._dataHasPlayer = hadPlayer;
            });
        }

        //update size content
        this.updateContentSV(numberItem);

        // update pos Start
        this.updatePosStart(true);

        await this.MCallbackAddItemDone();
    }

    private updateContentSV(numberItem: number) {
        // cacul for preapare update content size to suit with anchor

        if (this.isUseAnchorView && numberItem > this.countShowItem && this._dataHasPlayer) {
            // check index player not in the last item in the view
            if (this._IScrollWithAnchorView.LogicCanAddEmptyFixView(this.inforData, this.numberItemLastView)) {
                numberItem += 1;
            }
        }

        // update content size
        if (this.typeScrollViewVertical) {
            let heightContent = numberItem * this.sizeItem.height + (numberItem - 1) * this.spacingY + this.paddingTop;
            this.sizeContent = this.contentSV.getComponent(UITransform).contentSize.clone();
            this.contentSV.getComponent(UITransform).contentSize = new Size(this.sizeContent.width, heightContent);
            this.sizeContent.height = heightContent;
        } else {
            let widthContent = numberItem * this.sizeItem.width + (numberItem - 1) * this.spacingX;
            this.sizeContent = this.contentSV.getComponent(UITransform).contentSize.clone();
            this.contentSV.getComponent(UITransform).contentSize = new Size(widthContent, this.sizeContent.height);
            this.sizeContent.width = widthContent;
        }
    }

    private updatePosStart(isUpdatePos: boolean = true) {
        const uiTransformView = this.viewSV.getComponent(UITransform);
        if (this.typeScrollViewVertical) {
            this.posYStart = this.sizeContent.y / 2;
            if (isUpdatePos) { this.contentSV.position = new Vec3(0, uiTransformView.height / 2.0, 0); }
        } else {
            this.posXStart = -this.sizeContent.x / 2;
            if (isUpdatePos) { this.contentSV.position = new Vec3(- uiTransformView.width / 2.0, 0, 0); }
        }
    }

    public TryUpdateForced() {
        this.OptimizeScrollView(true);
    }

    lastIndexPosCenter: number = -1;
    private async OptimizeScrollView(useAwait: boolean = false) {
        if (useAwait) await Utils.delay(0.05 * 1000);
        let indexPosCenter: number = 0;
        if (this.typeScrollViewVertical) {
            indexPosCenter = Math.floor((this.contentSV.position.y - this.posYStart + this.sizeContent.height / 2)
                / (this.sizeItem.height + this.spacingY));
            if (this.lastIndexPosCenter == indexPosCenter) return;
            this.lastIndexPosCenter = indexPosCenter;
        } else {
            indexPosCenter = -Math.floor((this.contentSV.position.x - this.posXStart - this.sizeContent.width / 2 + this.sizeItem.width)
                / (this.sizeItem.width + this.spacingX));
            if (this.lastIndexPosCenter == indexPosCenter) return;
            this.lastIndexPosCenter = indexPosCenter;
        }
        if (useAwait) await Utils.delay(0.05 * 1000);

        // MConsolLog.Log("indexPosCenter:---------------------- " + indexPosCenter + " ----------------------------");
        let arrPoolItemsUsing = this.itemsPool.GetListObjPoolUsing();
        for (let i = 0; i < arrPoolItemsUsing.length; i++) {
            let item: ItemScrollViewBase2 = arrPoolItemsUsing[i].getComponent(ItemScrollViewBase2);
            if (item.indexPos < indexPosCenter - this.countShowItem / 2 || item.indexPos > indexPosCenter + this.countShowItem / 2) {
                // MConsolLog.Log("HIDE ITEM:" + item.indexPos);
                this.itemsPool.ReUseObj(item.node);
                item.Hide();
            }
        }

        const distentIndex = Math.floor(this.countShowItem / 2);
        if (useAwait) await Utils.delay(0.05 * 1000);

        for (let i = -distentIndex + (this.countShowItem % 2 == 0 ? -1 : 0); i < distentIndex + 1; i++) {
            let indexPos: number = i + indexPosCenter;
            // MConsolLog.Log("Check : i=" + i + "    indexPos=" + indexPos, "indexPosCenter=" + indexPosCenter);
            if (indexPos >= 0 && indexPos < this.inforData.length) {
                if (this.mapItemBoards.has(indexPos)) {
                    let item: ItemScrollViewBase2 = this.mapItemBoards.get(indexPos).getComponent(ItemScrollViewBase2);
                    if (!item.node.active) {
                        // special for anim index
                        if (this._stateScrollViewBase == STATE_SCROLL_VIEW.PLAY_ANIM_INDEX && (indexPos == this.indexFakeData || indexPos == this.indexTrueData)) { continue; }
                        item.Show();
                    }
                } else {
                    let itemRecycle = this.itemsPool.GetObj();
                    const baseCom = itemRecycle.getComponent(ItemScrollViewBase2);
                    this.mapItemBoards.delete(baseCom.indexPos);
                    if (indexPos < this.inforData.length) {
                        baseCom.node.setPosition(this.getPosByIndex(indexPos));
                        const index = this.topToBottom ? indexPos : this.inforData.length - indexPos - 1;
                        this._IMyScrollView.SetDataWhenRecycleNewItem(itemRecycle, index, this.inforData[indexPos]);
                        baseCom.indexPos = indexPos;
                        this.mapItemBoards.set(indexPos, itemRecycle);

                        // special for anim index
                        if (this._stateScrollViewBase == STATE_SCROLL_VIEW.PLAY_ANIM_INDEX && (indexPos == this.indexFakeData || indexPos == this.indexTrueData)) { continue; }
                        baseCom.Show();
                    }
                }
            }
        }

        // MConsolLog.Log(this.inforData);
        if (useAwait) await Utils.delay(0.05 * 1000);

        // check for show or hide anchor view
        this.TryShowAnchorView();
    }

    protected CountMaxNumItemNeedGen(): number {
        // remember some option value need careful : padding top , padding bottom
        let result = -1;
        /*logic
        height of view / (height item  + spacingY/X)
        */
        // need to check in two case
        let sizeView, sizeItem, spacing;
        if (this.typeScrollViewVertical) {
            sizeView = this.viewSV.getComponent(UITransform).height;
            sizeItem = this.sizeItem.height;
            spacing = this.spacingY;
        } else {
            sizeView = this.viewSV.getComponent(UITransform).width;
            sizeItem = this.sizeItem.width;
            spacing = this.spacingX;
        }

        result = Math.floor(sizeView / (sizeItem + spacing)) + 2;               // +2 up and down
        // MConsolLog.Log("number num item need to gen for this scroll : " + result, sizeItem, sizeView, spacing);
        return result;
    }

    /**
     * 
     * @param index 
     * @param time 
     * @param out return isScrollToTop
     */
    protected async scrollToIndex(index: number, time: number = 0, out?: (isScrollToTop: boolean) => void) {
        const posItem: Vec3 = this.getPosByIndex(index).clone().multiplyScalar(-1);

        let offSetMoveTo = 0;

        if (this.typeScrollViewVertical) {
            // case vertical
            const halfHeightView = this.viewSV.getComponent(UITransform).height / 2.0;
            offSetMoveTo = posItem.y - halfHeightView;
        } else {
            // case horizontal
            const halfWidthView = this.viewSV.getComponent(UITransform).width / 2.0;
            offSetMoveTo = posItem.x - halfWidthView;
        }

        // MConsolLog.Log("posItem : " + posItem + " | offsetMoveTo: " + offSetMoveTo);

        if (offSetMoveTo <= 0) {
            if (this.typeScrollViewVertical) { this.scroll.scrollToTop(time); }
            else { this.scroll.scrollToLeft(time); }

            if (out != null) { out(true); }
        } else {
            if (this.typeScrollViewVertical) { this.scroll.scrollToOffset(new Vec2(0, offSetMoveTo), time); }
            else { this.scroll.scrollToOffset(new Vec2(offSetMoveTo, 0), time); }

            if (out != null) { out(false); }
        }

        await Utils.delay(time * 1000);
    }

    getPosByIndex(_index: number): Vec3 {
        let result: Vec3 = Vec3.ZERO;
        if (this.typeScrollViewVertical) {
            let posY: number = -this.sizeItem.height / 2 - _index * (this.sizeItem.height + this.spacingY) - this.paddingTop;
            result = new Vec3(0, posY, 0);
        } else {
            let posX: number = this.sizeItem.width / 2 + _index * (this.sizeItem.width + this.spacingX);
            result = new Vec3(posX, 0, 0);
        }

        // MConsolLog.Log(result);
        return result;
    }

    private TryShowAnchorView() {
        // MConsolLog.Log(this.isUseAnchorView, this._stateScrollViewBase, this._dataHasPlayer);
        if (!this.isUseAnchorView || this._stateScrollViewBase != STATE_SCROLL_VIEW.LOAD_IMAGE || !this._dataHasPlayer) { return; }


        let canShowAnchorView = this._IScrollWithAnchorView.LogicShowAnchorView(this.nAnchorView, this.mapItemBoards);
        if (!canShowAnchorView) { this.HideAnchorView() };
        // MConsolLog.Log(canShowAnchorView);
        this.nAnchorView.active = canShowAnchorView;
    }

    private async LogicPlayAnim() {
        /*
        * Logic để có thể chạy đưuọc play Anim 
        * data pahri được sử lý trước bằng cách có sẵn fakeData và trueData
        * fakeData
        */

        if (!this._canPlayAnim || this.indexFakeData == -1 || this.indexTrueData == -1) {
            if (this.indexTrueData != -1) {
                this.scrollToIndex(this.indexTrueData);
            }
            return;
        }

        // turn on block UI
        this.BlockScrollView.active = true;

        // set data cho fakePlayer
        await this._IScrollWithAnim.SetDataFakeData(this.nFakeData, this.inforData[this.indexFakeData]);

        // co 2 case trong truong hop nay 
        // case 1 : index NewPlayer and indexOldPlayer is so far
        // case 2 : indexnewPlayer and indexOldPlayer is not so far < must cacul to know far how is it>

        //logic check case 
        // case 2 if index new player and index oldPlayer Subtraction < 10  => case 2 , else case 1
        const maxNumberItemNeedGen = this.CountMaxNumItemNeedGen();
        let typeAnim = -1;
        if (this.indexFakeData - this.indexTrueData >= maxNumberItemNeedGen - 3) {
            // =================== CASE 1 ====================
            // ===================Index is far==================
            await this.RunCase1();
            typeAnim = 1;

        } else {
            // =================== CASE 2 ======================
            // ===================Index is near==================
            await this.RunCase2();
            typeAnim = 2;
        }

        // update lại data và UI
        //#region ==================== update UI + data  =======================
        let itemTruePlayer = this.mapItemBoards.get(this.indexTrueData);

        if (itemTruePlayer != null) {
            itemTruePlayer.getComponent(ItemScrollViewBase2).Show();
        } else {
            // console.error("it is not fun in this case too");
        }
        this.nFakeData.active = false;

        // check type anim
        if (typeAnim == 2) {
            await this.UpdatePosItemBelowFakeData();
            // so may be in the case can not scroll => you need to reUse the fake node
            // if(this.mapItemBoards.has(this.indexFakeData)){
            //     let itemFakeData = this.mapItemBoards.get(this.indexFakeData).getComponent(ItemScrollViewBase2);
            //     this.itemsPool.ReUseObj(itemFakeData.node);
            //     itemFakeData.Hide();
            // }
        }

        // update data in local and in this scroll
        await this._IScrollWithAnim.UpdateDataAfterAnimIndex(this.indexFakeData, this.inforData);


        const numberItem = this.inforData.length;
        //update size content
        this.updateContentSV(numberItem);

        // update Pos Start
        this.updatePosStart(false);

        this.indexFakeData = this.indexTrueData = -1;

        this.lastIndexPosCenter = -1;
        //#endregion ==================== update UI + data =======================

        this.OptimizeScrollView();


        // turn off block UI
        this.BlockScrollView.active = false;
    }

    private async UpdatePosItemBelowFakeData() {
        const distanceIndex = Math.floor(this.countShowItem / 2);

        // reUse all the index below fakeData
        for (let indexPos = this.indexFakeData; indexPos < this.indexFakeData + distanceIndex; indexPos++) {
            if (this.mapItemBoards.has(indexPos)) {
                let item = this.mapItemBoards.get(indexPos);
                if (item != null) {
                    this.mapItemBoards.delete(indexPos);
                    this.itemsPool.ReUseObj(item);
                    item.getComponent(ItemScrollViewBase2).Hide();
                }
            }
        }
    }

    private async RunCase1() {
        //step 0 : scroll to the right place
        // scroll to the false player
        this.scrollToIndex(this.indexFakeData);
        this.OptimizeScrollView();

        await Utils.delay(100);

        // step 1: show nFakeData
        let nFakePlayer = this.mapItemBoards.get(this.indexFakeData);
        if (nFakePlayer != null) {
            nFakePlayer.active = false;
            this.nFakeData.worldPosition = nFakePlayer.worldPosition.clone();
        } else {
            this.nFakeData.worldPosition = this.viewSV.worldPosition.clone();
        }
        this.nFakeData.active = true;

        //time[0]
        await Utils.delay(1010);  // de nguoi choi co the nhin thay cai gi va hieu xem chuyen gi dang xay ra


        // MConsolLog.Log("end Step 1");

        // step 2: tween fakeData bigger
        const time2 = 0.5;
        tween(this.nFakeData)
            .to(time2, { scale: new Vec3(1.5, 1.5, 1.5) }, { easing: 'quintOut' })
            .start();

        await Utils.delay(time2 * 1000 + 10);

        // step 3: tween scroll up scroll
        const time3 = 1.5;
        let isScrollToTop = false;
        this.scrollToIndex(this.indexTrueData, time3, (misScrollToTop) => { isScrollToTop = misScrollToTop; });
        this.OptimizeScrollView();
        await Utils.delay(time3 * 1000);
        // MConsolLog.Log("end Step 3");

        // step 4: tween temp to index new player
        let time4 = 0.1;
        const time5 = 0.5;
        if (isScrollToTop) { time4 = 0.6; }
        const nTruePlayer = this.mapItemBoards.get(this.indexTrueData);
        // MConsolLog.Log(isScrollToTop);
        await new Promise<void>((resolve) => {
            tween(this.nFakeData)
                .to(time4, { worldPosition: nTruePlayer.worldPosition.clone() }, { easing: 'quintOut' })
                .to(time5, { scale: Vec3.ONE }, { easing: 'expoIn' })
                .call(() => {
                    // play sound 
                    // SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.RIGHT_PLACE_TOUR);
                    resolve();
                })
                .start();
        });
        // MConsolLog.Log("end Step 3");
    }

    private async RunCase2() {
        // step 0: scroll to the right place just scroll to the truePlayer because it alway on the top of view => you can see the false and true player in the same time
        // scroll to the false player
        let indexRight = (this.indexTrueData + this.indexFakeData) / 2.0;
        this.scrollToIndex(indexRight);
        this.OptimizeScrollView();

        await Utils.delay(100);

        // MConsolLog.Log(Array.from(this.mapItemBoards));
        let nFakePlayer = this.mapItemBoards.get(this.indexFakeData);
        let nTruePlayer = this.mapItemBoards.get(this.indexTrueData);
        if (nFakePlayer != null) {
            nFakePlayer.active = false;
            this.nFakeData.worldPosition = nFakePlayer.worldPosition.clone();
        } else {
            this.nFakeData.worldPosition = this.viewSV.worldPosition.clone();
        }
        if (nTruePlayer != null) {
            nTruePlayer.active = false;
        }
        this.nFakeData.active = true;

        // MConsolLog.Log(this.indexTrueData , this.indexFakeData);

        //time[0]
        await Utils.delay(1010);  // de nguoi choi co the nhin thay cai gi va hieu xem chuyen gi dang xay ra

        // step 1: tween fakeData bigger
        const time1 = 0.5;
        tween(this.nFakeData)
            .to(time1, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'quintOut' })
            .start();

        await Utils.delay(time1 * 1000 + 10);

        // step 1: tween temp to the index player
        // check in case not get indexTrueData ????? i don't know why it happend but you need to check all the node and get the right indexTrueData
        let tNTruePlayer = this.mapItemBoards.get(this.indexTrueData);
        if (this.mapItemBoards.get(this.indexTrueData) == null) {
            tNTruePlayer = this._IScrollWithAnim.GetNodeSameIndex(this.indexTrueData);
            this.mapItemBoards.set(this.indexTrueData, tNTruePlayer);
            // console.error("oh no it not fun");
        }

        const wPosTrueData = this.mapItemBoards.get(this.indexTrueData).worldPosition.clone();
        const time2 = 1.5;
        const time3 = 0.5;
        await new Promise<void>((resolve) => {
            tween(this.nFakeData)
                .to(time2, { worldPosition: wPosTrueData }, { easing: 'quintOut' })
                .to(time3, { scale: Vec3.ONE }, { easing: 'expoIn' })
                .call(() => {
                    // play sound 
                    // SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.RIGHT_PLACE_TOUR);
                    resolve();
                })
                .start();
        });
        // MConsolLog.Log("End Step 1");
    }

    protected getInstanceiMyScollViewInterface(): IMyScrollView { return null; }

    /**
     * this func need to call in MCallbackLoadingImageDone
     * this func will reset old data and set it again
     * @param data 
     */
    public ChangeDataToNew(data: any) {
        this.inforData = Array.from(data);
        this.ReloadDataView();
    }

    private ReloadDataView() {
        this.mapItemBoards.forEach((itemRecycle, index) => {
            if (itemRecycle.active) {
                this._IMyScrollView.SetDataWhenRecycleNewItem(itemRecycle, index, this.inforData[index]);
            }
        })
    }

    LoadToIndexStart(): number { return -1 }
    async MPrepareDataShow() { }
    async MCallbackAddItemDone() { }
    async MCallbackPreloadingImage() { }
    async MCallbackLoadingData() { }
    async MCallbackLoadingImageDone() { }
    async MCallbackNothing() { }
    async MCallbackPlayAnimDone() { }
    HideAnchorView() { }
}


