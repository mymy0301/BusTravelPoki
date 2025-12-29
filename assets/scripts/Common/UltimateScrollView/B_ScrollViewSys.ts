import { _decorator, CCBoolean, CCFloat, Component, Enum, instantiate, Node, Prefab, Rect, ScrollView, Size, tween, UITransform, Vec2, Vec3, Widget, isValid } from 'cc';
import { B_ItemScrollViewSys } from './B_ItemScrollViewSys';
import { Utils } from '../../Utils/Utils';
import { AnimSpecial_1, AnimSpecial_2, GetTimeScrollFromXToY } from './Type_B_ScrollViewSys';
import { clientEvent } from '../../framework/clientEvent';
const { ccclass, property, requireComponent } = _decorator;

/**
 * Hiện đang chấp nhận bỏ qua một số trường hợp đặc biệt như là
 *      - tất cả các item đều có kích cỡ bằng nhau
 *      - không thể thay đổi dữ liệu một khi đã khởi tạo
 *      - chưa áp dụng cho scroll theo chiều ngang , theo thứ tự ngược lại
 */

export interface IScrollViewSys {
    SetUpItemData(nItem: Node, data: any, index: number,
        cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction, isUseAnim: boolean): void;
}

export interface IScrollAnchor {
    /**
     * Func này sẽ gửi toàn bộ dữ liệu mà scrollView hiện có để class đó xử lý tự lọc để chọn xem anchor sẽ hiển thị thông tin gì hoặc như nào 
     * */
    SetAnchorData(nAnchor: Node, dataAll: any): void
    /**
     * Func này sẽ trả về index data anchor => ta có thể tính toán xem có thêm đối tượng dưới cùng cho view trong trường hợp anchor che đi đối tượng hay không
     * @param dataShowing toàn bộ dữ liệu
     */
    GetIndexDataAnchor(dataShowing: any): number
}

export interface IScrollAnim {
    /**
    * Func này sẽ gửi toàn bộ dữ liệu mà dataReal của itemFake có để class đó xử lý tự lọc để chọn xem ItemFake sẽ hiển thị thông tin gì hoặc như nào 
    * */
    UpdateItemWhileScroll(nItemFake: Node, dataFake: any, dataReal: any, ratio: number): void;

    /**
    * Func này sẽ được gọi khi anim scroll kết thúc
    * */
    ScrollAnimDone(): void;
}

export enum TYPE_ANIM_SCROLL_SPECIAL {
    SPE_1
}

export interface paramAnimScroll_1 {
    dataOld: any;
    dataReal: any;
    indexItemOld: number;
    indexItemReal: number;
    dataItemReal: any;
    dataItemOld: any;
}

export enum VERTICAL_DIRECTION {
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
}
Enum(VERTICAL_DIRECTION)

@ccclass('Pram_BScrollViewSys')
export class Param_BScrollViewSys {
    //====================================================== popular
    @property({
        group: { id: 'B_ScrollView', name: 'B_ScrollView' },
        type: VERTICAL_DIRECTION
    })
    verticalDirection: VERTICAL_DIRECTION = VERTICAL_DIRECTION.TOP_TO_BOTTOM;

    @property({
        group: { id: 'B_ScrollView', name: 'B_ScrollView' },
        tooltip: "If true, items with higher indices will be displayed below/behind items with lower indices"
    })
    reverseSiblingIndex: boolean = false;

    @property({
        group: { id: 'B_ScrollView', name: 'B_ScrollView' },
        tooltip: "If true, you can scroll like pageView"
    })
    scrollLikePacgeView: boolean = false;

    //====================================================== custom size scrollView
    @property({ group: { id: 'B_ScrollView', name: 'B_ScrollView' } }) custom = false;
    @property({ group: { id: 'B_ScrollView', name: 'B_ScrollView' }, visible(this: Param_BScrollViewSys) { return this.custom; } })
    distanceMask: Vec2 = new Vec2(0, 20);

    @property({ group: { id: 'B_ScrollView', name: 'B_ScrollView' }, visible(this: Param_BScrollViewSys) { return this.custom; } })
    numItemDistanceShow: number = 2;

    @property({ group: { id: 'B_ScrollView', name: 'B_ScrollView' }, visible(this: Param_BScrollViewSys) { return this.custom; } })
    distanceVertical: Vec2 = new Vec2(0, 0);

    @property({ group: { id: 'B_ScrollView', name: 'B_ScrollView' }, visible(this: Param_BScrollViewSys) { return this.custom; } })
    paddingBottom: number = 0;

    //====================================================== anim when scroll Item
    @property({ group: { id: 'AnimItemScrolling', name: 'AnimItemScrolling' } }) isUseAnimItemScrolling = false;

    //====================================================== anchor
    @property({ group: { id: 'Anchor', name: 'Anchor' } }) isUseAnchor = false;
    @property({ group: { id: 'Anchor', name: 'Anchor' }, visible(this: Param_BScrollViewSys) { return this.isUseAnchor; }, type: Node })
    nAnchor: Node = null;
    canCheckShowAnchor: boolean = this.isUseAnchor; // dùng để tạm dừng check show anchor

    //====================================================== Anim Scroll
    @property({ group: { id: 'AnimScroll', name: 'AnimScroll' } }) isAnimScroll = false;
    @property({ group: { id: 'AnimScroll', name: 'AnimScroll' }, visible(this: Param_BScrollViewSys) { return this.isAnimScroll; }, type: Node })
    nItemFake: Node = null;

    // @property({ visible(this: Param_BScrollViewSys) { return this.custom; } })
    // numItemShow: number = 0;
}

@ccclass('Pool_BScrollViewSys')
export class Pool_BScrollViewSys {
    @property(Prefab) pfItem: Prefab;
    @property(Prefab) pfHolder: Prefab;
    @property(Node) nTempItem: Node;
    @property(Node) nTempHolder: Node;
    private _listItemTemp: Node[] = [];

    public GetItem(): Node {
        if (this.nTempItem.children.length > 0) {
            return this._listItemTemp.pop();
        } else {
            let nItem = instantiate(this.pfItem) as Node;
            return nItem;
        }
    }

    public GetHolder(): Node {
        if (this.nTempHolder.children.length > 0) {
            return this._listItemTemp.pop();
        } else {
            let nHolder = instantiate(this.pfHolder) as Node;
            return nHolder;
        }
    }

    public ReUseItem(nItem: Node) {
        nItem.parent = this.nTempItem;
        nItem.active = false;
        this._listItemTemp.push(nItem);
    }

    public ReUseHolder(nHolder: Node) {
        nHolder.parent = this.nTempHolder;
        nHolder.active = false;
        this._listItemTemp.push(nHolder);
    }
}

@ccclass('B_ScrollViewSys')
@requireComponent(ScrollView)
export class B_ScrollViewSys extends Component {
    @property(Node) nContent: Node;
    @property(Node) nView: Node;
    @property(Node) nBlockView: Node;
    @property(Param_BScrollViewSys) param: Param_BScrollViewSys = new Param_BScrollViewSys();
    @property(Pool_BScrollViewSys) pool: Pool_BScrollViewSys = new Pool_BScrollViewSys();
    private _listIndexDataShowing: Set<number> = new Set();
    private _listNHolder: Node[] = []; public get ListHolder() { return this._listNHolder; }
    private _data: any[] = []; public get GetData() { return Utils.CloneListDeep(this._data); }
    private _sizeItem: Size = new Size(0, 0);
    private _boxMask: Rect = new Rect(0, 0);
    private _IScrollViewSys: IScrollViewSys = null;
    private _IScrollAnchor: IScrollAnchor = null;
    private _IScrollAnim: IScrollAnim = null;
    private _isInitFirstTime: boolean = false; public get IsInitFirstTime() { return this._isInitFirstTime; }
    private _scrollCom: ScrollView = null; private get ScrollCom() { return this._scrollCom; }

    // anchor
    private _indexDataAnchorInData = -1;


    //============================================
    //#region func Node
    protected onLoad(): void {
        this._scrollCom = this.node.getComponent(ScrollView);

        // init new item to get it size
        let tItem = this.pool.GetItem();
        this._sizeItem = tItem.getComponent(UITransform).contentSize;
        this.pool.ReUseItem(tItem);

        // set box mask
        let wPosMask = this.nView.worldPosition.clone();
        let sizeMask = this.nView.getComponent(UITransform).contentSize.clone();
        this._boxMask = new Rect(wPosMask.x, wPosMask.y, sizeMask.width + this.param.distanceMask.x, sizeMask.height + this.param.distanceMask.y);

        // luôn luôn tắt anchor lúc load
        if (this.param.isUseAnchor) {
            this.param.nAnchor.active = false;
        }
    }

    protected onEnable(): void {
        this.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        if (this.param.scrollLikePacgeView) {
            this.node.on(ScrollView.EventType.SCROLL_ENDED, this.endScrolling, this);
        }

        // check if use anchor and was inited first time
        if (this._isInitFirstTime && this.param.isUseAnchor) {
            this.CheckCanShowAnchorFirstTime();
        }

        // check if use anim scroll => turn off item fake
        if (this.param.isAnimScroll) {
            this.param.nItemFake.active = false;
        }
    }

    protected onDisable(): void {
        this.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        this.node.off(ScrollView.EventType.SCROLL_ENDED, this.endScrolling, this);
    }
    //#endregion func Node
    //============================================

    //============================================
    //#region public func

    protected SetUp_interface(iScrollView: IScrollViewSys, iScrollAnchor: IScrollAnchor = null, iAnimScroll: IScrollAnim = null) {
        this._IScrollViewSys = iScrollView;
        this._IScrollAnchor = iScrollAnchor;
        this._IScrollAnim = iAnimScroll;
    }

    protected SetUp_data(data: any[]) {
        this._data = data;
    }

    private InsertNewHolder(index: number) {
        // -------- init node to hold place -------
        let nItemHolder = this.pool.GetHolder();
        nItemHolder.name = "holder_" + index;
        nItemHolder.parent = this.nContent;
        if (this.param.reverseSiblingIndex) {
            nItemHolder.setSiblingIndex(0);
        }
        // ---------- position item -------------
        let pos = this.GetPosItem(index);
        nItemHolder.position = pos;
        //----------- register event -----------
        nItemHolder.getComponent(B_ItemScrollViewSys).Register(
            this.pool.GetItem.bind(this.pool),
            this.pool.ReUseItem.bind(this.pool),
            this._IScrollViewSys.SetUpItemData.bind(this._IScrollViewSys),
            this.ShowAnchor.bind(this),
            this.HideAnchor.bind(this)
        )
        //------------ push to list -------------
        this._listNHolder.push(nItemHolder);
    }

    protected InitItemsFirstTime(fromIndex: number = -1) {

        this.nBlockView.active = true;

        // --------- init holder ----------------------
        for (let i = 0; i < this._data.length; i++) {
            this.InsertNewHolder(i);
        }
        //--------------------------------------------


        // --------------- anchor item ---------------
        if (this.param.isUseAnchor) {
            // set up data
            this._IScrollAnchor.SetAnchorData(this.param.nAnchor, this._data);
        }

        if (!this._isInitFirstTime) {
            this._isInitFirstTime = true;
            this._IScrollAnchor && this.CheckCanShowAnchorFirstTime();
        }
        //--------------------------------------------

        this.nBlockView.active = false;

        // --------------- update ContentSize -------------
        // Nếu như index data anchor >= 0
        // && tổng số item - tổng item show phải lớn hơn = 0 < vì nếu ít hơn ta ko cần cộng thêm do người chơi sẽ không cần phải kéo>
        // && vị trí indexAnchor ít tổng số item - tổng số item show < vì nếu data anchor nằm ở danh sách dưới cùng của giao diện hiển thị thì khi trượt xuống dưới cùng sẽ 
        //                                                           luôn ẩn anchor đi => không cần + 1 empty ở dưới>
        this.UpdateContentSizeAuto();
        // ------------------------------------------------

        // gọi scrolling 1 lần để update dữ liệu
        this.onScrolling();
    }

    /**
     * @param data : data mới
     * @param useAnimWhenUpdate
     * @param autoActiveItem
     */
    protected UpdateData(data: any, useAnimWhenUpdate: boolean = false, autoActiveItem: boolean = false) {
        const lengthDifference = data.length - this._data.length;

        this._data = data;

        const isPopItem = true;

        if (lengthDifference < 0) {
            // remove index showing
            for (let i = 0, indexRemove = 0; i < Math.abs(lengthDifference); i++) {
                indexRemove = isPopItem ? this._listNHolder.length - 1 - i : i;
                this._listIndexDataShowing.delete(indexRemove);
            }

            // remove những holder đầu tiên cùng bằng số lượng mới thay đổi
            for (let i = 0; i < Math.abs(lengthDifference); i++) {
                if (isPopItem) {
                    this.pool.ReUseHolder(this._listNHolder.pop());
                } else {
                    this.pool.ReUseHolder(this._listNHolder.shift());
                }
            }
            // update lại contentView
            this.UpdateContentSizeAuto();
        } else if (lengthDifference > 0) {
            // thêm những holder dưới cùng bằng số lượng mới thay đổi
            this.InsertNewHolder(this._listNHolder.length);
            // update lại contentView
            this.UpdateContentSizeAuto();
        }

        // get all item showing => and call update again
        this._listIndexDataShowing.forEach(index => {
            try {
                const indexData = index;
                const dataShowing = this._data[index];
                const nItem = this._listNHolder[index].getComponent(B_ItemScrollViewSys).GetItemReuse();
                this._IScrollViewSys.SetUpItemData(
                    nItem,
                    dataShowing,
                    indexData,
                    this.ShowAnchor.bind(this),
                    this.HideAnchor.bind(this),
                    useAnimWhenUpdate
                )
                nItem.setPosition(Vec3.ZERO);

                if (autoActiveItem) {
                    nItem.active = true;
                }
            } catch (e) {
                console.error(e);
                console.warn(index);
            }
        })

        // update dataAnchor
        if (this._isInitFirstTime && this.param.isUseAnchor) {
            this._IScrollAnchor.SetAnchorData(this.param.nAnchor, this._data);
        }
    }

    public GetListNItemShowing(): Node[] {
        const listIndexShowing = this._listIndexDataShowing;
        let result: Node[] = []
        listIndexShowing.forEach(indexCheck => {
            const nHolder = this._listNHolder[indexCheck];
            const nItem = nHolder.getComponent(B_ItemScrollViewSys).GetItemReuse();
            result.push(nItem);
        })
        return result;
    }
    //#endregion public func
    //============================================

    //============================================
    //#region Scorlling
    protected async UnRegisterScrollAfterThatRegisterAngain(cb: CallableFunction) {
        const isRegistingScroll = this.node.hasEventListener(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        if (isRegistingScroll) { this.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this); }

        await cb()

        if (isRegistingScroll) { this.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this); }
    }

    private UpdateContentSizeAuto() {
        const totalItemShow = this.NumItemCanShow();
        const totalItemData = this._data.length;
        if (this._indexDataAnchorInData >= 0 && totalItemData - totalItemShow >= 0 && this._indexDataAnchorInData < totalItemData - totalItemShow) {
            this.UpdateContentSize(this._data.length + 1);
        } else {
            this.UpdateContentSize(this._data.length);
        }
    }

    private UpdateContentSize(numItem: number) {
        const oldSize = this.nContent.getComponent(UITransform).contentSize.clone();
        const nH = this._sizeItem.height * numItem + this.param.distanceVertical.y + this.param.paddingBottom;
        this.nContent.getComponent(UITransform).setContentSize(oldSize.width, nH);

        // Reset scroll position based on direction
        const scroll = this.ScrollCom;
        if (this.param.verticalDirection === VERTICAL_DIRECTION.TOP_TO_BOTTOM) {
            scroll.scrollToTop();
        } else {
            scroll.scrollToBottom();
        }
    }

    protected GetMiddleVisibleIndex(): number {
        let listIndexShowing = this.GetListIndexShowing();
        if (listIndexShowing.length === 0) return -1;
        return listIndexShowing[Math.floor(listIndexShowing.length / 2)];
    }

    protected onScrolling() {
        /**
         * Ở đây bạn có thể tối ưu vòng for bằng cách chỉ duyệt nhưng node nào có khả năng đang show trên màn hình mà thôi
         * như là tính pos hiện tại của content và số lượng item cần show => áng đc khoảng cần check
         */

        let listIndexShowing = this.GetListIndexShowing();

        // Duyet toan bo index dang dc show
        for (let i = 0; i < listIndexShowing.length; i++) {
            const indexHolder = listIndexShowing[i];

            // ============== check exception ========================
            if (indexHolder >= this._listNHolder.length || indexHolder < 0) continue;
            if (indexHolder >= this._data.length || indexHolder < 0) continue;

            const nHolder = this._listNHolder[indexHolder];
            const data = this._data[indexHolder];
            nHolder.getComponent(B_ItemScrollViewSys).TryShowItem(data, indexHolder, this.param.isUseAnimItemScrolling);

            // push index item show
            if (!this._listIndexDataShowing.has(indexHolder)) {
                this._listIndexDataShowing.add(indexHolder);
            }
        }

        // Hide items that are no longer visible
        for (const value of this._listIndexDataShowing) {
            if (listIndexShowing.indexOf(value) === -1) {
                this._listIndexDataShowing.delete(value);
                const nHolder = this._listNHolder[value];
                nHolder.getComponent(B_ItemScrollViewSys).HideItem();
            }
        }
    }

    private endScrolling() {
        // auto scroll to the index nearest
        const scroll = this.ScrollCom;
        const offSetNow = scroll.getScrollOffset();
        const indexNearest = this.GetIndexNearestPos(offSetNow.y);
        this.ScrollToIndex(indexNearest, false);
    }

    private GetIndexNearestPos(pos: number) {
        switch (true) {
            case this.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM:
                if (this.GetData.length > 0) {
                    const decreaseThePaddingItem = (pos + this.param.distanceVertical.y) / (this._sizeItem.y + this.param.distanceVertical.y);
                    let indexNearest = Math.round(decreaseThePaddingItem);
                    return indexNearest;
                }
                break;
            case this.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP:
                if (this.GetData.length > 0) {
                    const decreaseThePaddingItem = (Math.abs(pos) + this.param.distanceVertical.y) / (this._sizeItem.y + this.param.distanceVertical.y);
                    let indexNearest = Math.round(decreaseThePaddingItem);
                    return indexNearest;
                }
                break;
        }

        return -1;
    }

    public GetOffSetFromIndex(index: number) {
        return new Vec2(0, this._sizeItem.height * index);
    }

    public async ScrollToIndex(index: number, force: boolean, useAnimItemWhenScroll: boolean = true, timeScrollAuto: number = 0.5) {
        const scroll = this.ScrollCom;
        let isTurnOffAnimitemScroll = false;
        // check can play with anim item 
        if (!useAnimItemWhenScroll && this.param.isUseAnimItemScrolling) { this.param.isUseAnimItemScrolling = false; isTurnOffAnimitemScroll = true; }

        if (force) {
            this.UnRegisterScrollAfterThatRegisterAngain(() => {
                // scroll force to index
                scroll.scrollToOffset(new Vec2(0, this._sizeItem.height * index), 0, true);
                this.onScrolling();
            })
        } else {
            // scroll to index
            scroll.scrollToOffset(new Vec2(0, this._sizeItem.height * index), timeScrollAuto, true);
        }

        //turn on scroll item again
        await Utils.delay(timeScrollAuto * 1000);
        if (isTurnOffAnimitemScroll) { this.param.isUseAnimItemScrolling = true; }
    }

    private IsDisplayInMask(nItemCheck: Node): boolean {
        // get pos + cacul with size default 
        let wBox: Vec3 = nItemCheck.worldPosition.clone();
        let rectBox: Rect = new Rect(wBox.x, wBox.y, this._sizeItem.width, this._sizeItem.height);

        let isInside = this._boxMask.intersects(rectBox);
        return isInside;
    }

    private GetListIndexShowing(): number[] {
        const indexItemMidShowing = Math.round(this.IndexItemMidShowing());

        const numItemCanShow = this.NumItemCanShow();
        let generateCenteredSequence = this.generateCenteredSequence(numItemCanShow);

        generateCenteredSequence = generateCenteredSequence.map((x, i) => indexItemMidShowing + x);

        return generateCenteredSequence;
    }

    /**
     * Trong trường hợp item bị chừa ra một nửa thì vẫn tính là hiển thị được
     */
    private NumItemCanShow(): number {
        let result = this._boxMask.height / this._sizeItem.height;
        return result + this.param.numItemDistanceShow;
    }

    private IndexItemMidShowing(): number {
        const contentPosY = this.nContent.position.y;
        switch (this.param.verticalDirection) {
            case VERTICAL_DIRECTION.TOP_TO_BOTTOM:
                if (contentPosY < 0) return 0;
                return contentPosY / this._sizeItem.height;
            case VERTICAL_DIRECTION.BOTTOM_TO_TOP:
                if (contentPosY > 0) return 0;
                return Math.abs(contentPosY) / this._sizeItem.height;
        }
    }

    private generateCenteredSequence(n: number): number[] {
        const result: number[] = [];

        // Nếu n là số lẻ, đặt 0 ở giữa
        const start = Math.floor(-n / 2); // Tính giá trị bắt đầu

        for (let i = 0; i < n; i++) {
            result.push(start + i);
        }

        return result;
    }

    private GetPosItem(index: number): Vec3 {
        switch (this.param.verticalDirection) {
            case VERTICAL_DIRECTION.TOP_TO_BOTTOM:
                let posTTB = new Vec3(0, -this._sizeItem.height * (index + 0.5) + this.param.paddingBottom); // luôn + 1 nửa vì ta cần cách đoạn đầu tiên của danh sách
                return posTTB;
            case VERTICAL_DIRECTION.BOTTOM_TO_TOP:
                let posBTT = new Vec3(0, this._sizeItem.height * (index + 0.5) + this.param.paddingBottom); // Đổi dấu để phù hợp với hướng từ dưới lên trên
                return posBTT;
        }
    }
    //#endregion Scorlling
    //============================================

    //============================================
    //#region EndScroll
    private SetEndScroll(canEndScroll: boolean) {
        if (!this.param.scrollLikePacgeView) return;
        if (!canEndScroll) {
            this.node.off(ScrollView.EventType.SCROLL_ENDED, this.endScrolling, this);
        } else {
            if (!this.node.hasEventListener(ScrollView.EventType.SCROLL_ENDED, this.endScrolling, this)) {
                this.node.on(ScrollView.EventType.SCROLL_ENDED, this.endScrolling, this);
            }
        }
    }
    //#endregion EndScroll
    //============================================

    //============================================
    //#region anchor
    private CheckCanShowAnchorFirstTime() {
        if (!this._IScrollAnchor) return;

        // check can show anchor
        // lấy index anchor trong data => so sánh và check xem có show hay không
        this._indexDataAnchorInData = this._IScrollAnchor.GetIndexDataAnchor(this.GetData);
        if (this._indexDataAnchorInData > 0 && !this._listIndexDataShowing.has(this._indexDataAnchorInData)) {
            this.ShowAnchor();
        } else {
            this.HideAnchor();
        }
    }

    private ShowAnchor() {
        if (this.param.isUseAnchor && this.param.canCheckShowAnchor) {
            this.param.nAnchor.active = true;
        }
    }

    private HideAnchor() {
        if (this.param.isUseAnchor)
            this.param.nAnchor.active = false;
    }

    public SetCanShowAnchor(value: boolean) {
        this.param.canCheckShowAnchor = value;
        if (value) {
            // emit to check can show anchor
            this.CheckCanShowAnchorFirstTime();
        } else {
            // hide anchor
            this.HideAnchor();
        }
    }
    //#endregion anchor
    //============================================

    //============================================
    protected GetIndexScrollToMidder(index: number): number {
        const totalItemCanShow = this.NumItemCanShow();
        if (this.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && !this.param.reverseSiblingIndex) {
            return index + totalItemCanShow / 2;
        } else if (this.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && this.param.reverseSiblingIndex) {
            return index - (totalItemCanShow / 2 - 1.5);
        } else if (this.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && !this.param.reverseSiblingIndex) {
            return index - totalItemCanShow / 2;
        } else if (this.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && this.param.reverseSiblingIndex) {
            return index + totalItemCanShow / 2;
        } else {
            return index + 1;
        }
    }

    //#region AnimSpecial
    public async PlayAnimSpecial(typeAnim: TYPE_ANIM_SCROLL_SPECIAL, dataCustom: any) {
        if (!this.param.isAnimScroll || this._IScrollAnim == null) return;
        const self = this;

        //================== data before all anim ==================
        const dataCheck = dataCustom as paramAnimScroll_1;

        async function cbGetWPosItemOld() {
            self.param.nItemFake.worldPosition = self._listNHolder[dataCheck.indexItemOld].worldPosition.clone();
            await Utils.delay(0.05 * 1000);
            self.param.nItemFake.active = true;
        }
        function cbGetWPosItemNew() { return self._listNHolder[dataCheck.indexItemReal].worldPosition.clone(); }
        function cbSetDataFakeToFakeData() {
            self._IScrollViewSys.SetUpItemData(self.param.nItemFake, dataCheck.dataItemOld, -1, self.ShowAnchor.bind(self), self.HideAnchor.bind(self), false);
        }
        function cbHideTheItemOldIndex() {
            const nHolderOldItem = self._listNHolder[dataCheck.indexItemOld].getComponent(B_ItemScrollViewSys);
            nHolderOldItem.GetItemReuse().active = false;
        }
        async function cbMoveFake_1() {
            const wPosMidView = self.nView.worldPosition.clone().add3f(0, 100, 0);
            await new Promise<void>(resolve => {
                tween(self.param.nItemFake)
                    .to(0.5, { worldPosition: wPosMidView, scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'smooth' })
                    .call(() => { resolve() })
                    .start()
            });
        }
        async function cbMoveFake_2() {
            const numItemCanShow = self.NumItemCanShow();
            let min = Math.round(numItemCanShow / 2);
            let max = self._data.length - Math.floor(numItemCanShow / 2);
            const timeMove = 0.5;

            // nếu như index item nằm ngoài khoảng min max thì cần hai bước di chuyển
            if (dataCheck.indexItemReal < min || dataCheck.indexItemReal > max) {
                // thêm 50 để di chuyển đển vị trí đùn các item còn lại xuống dưới
                const posItemRight = self.GetPosItem(dataCheck.indexItemReal).add3f(0, 50, 0);
                const wPosItem = new Vec3();
                self.nContent.getComponent(UITransform).convertToWorldSpaceAR(posItemRight, wPosItem);
                await new Promise<void>(resolve => {
                    tween(self.param.nItemFake)
                        .to(timeMove, { worldPosition: wPosItem }, { easing: 'smooth' })
                        .call(() => { resolve() })
                        .start()
                });
            }
        }
        async function cbMoveAllItemShowSuitFake() {
            const time_Move = 0.5;
            const isMoveUp = IsMoveUp();
            self._listIndexDataShowing.forEach(index => {
                let newIndex: number = -1;
                if ((index - dataCheck.indexItemOld) * (index - dataCheck.indexItemReal) <= 0 && index != dataCheck.indexItemOld) {
                    if (self.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && !self.param.reverseSiblingIndex) {
                        newIndex = isMoveUp ? index - 1 : index + 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && self.param.reverseSiblingIndex) {
                        newIndex = isMoveUp ? index + 1 : index - 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && !self.param.reverseSiblingIndex) {
                        newIndex = isMoveUp ? index + 1 : index - 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && self.param.reverseSiblingIndex) {
                        newIndex = isMoveUp ? index - 1 : index + 1;
                    } else {
                        newIndex = isMoveUp ? index + 1 : index - 1;
                    }
                }
                // ============== check exception ========================
                if (newIndex >= self._listNHolder.length || newIndex < 0) return;
                if (newIndex >= self._data.length || newIndex < 0) return;

                // console.log(isMoveUp, newIndex);

                // get wPosSuitWithNewIndex
                // get itemReuse
                // move item Reuse to the wPosSuitWithNewIndex
                const posSuitWithNewIndex = self.GetPosItem(newIndex);
                const wPos = new Vec3();
                self.nContent.getComponent(UITransform).convertToWorldSpaceAR(posSuitWithNewIndex, wPos);
                const nItemReuse = self._listNHolder[index].getComponent(B_ItemScrollViewSys).GetItemReuse();
                tween(nItemReuse)
                    .to(time_Move, { worldPosition: wPos })
                    .start()
            })
            await Utils.delay(time_Move * 1000);
        }
        async function cbMoveAllItemShowSuitFake_InSameView() {
            const time_Move = 0.5;

            self._listIndexDataShowing.forEach(index => {
                let newIndex: number = -1;

                // just only the item in the rangle except the dataCheckOld
                if ((index - dataCheck.indexItemOld) * (index - dataCheck.indexItemReal) <= 0 && index != dataCheck.indexItemOld) {
                    if (self.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && !self.param.reverseSiblingIndex) {
                        newIndex = IsMoveUp() ? index - 1 : index + 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && self.param.reverseSiblingIndex) {
                        newIndex = IsMoveUp() ? index + 1 : index - 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && !self.param.reverseSiblingIndex) {
                        newIndex = IsMoveUp() ? index + 1 : index - 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && self.param.reverseSiblingIndex) {
                        newIndex = IsMoveUp() ? index - 1 : index + 1;
                    } else {
                        newIndex = IsMoveUp() ? index + 1 : index - 1;
                    }
                }

                // ============== check exception ========================
                if (newIndex >= self._listNHolder.length || newIndex < 0) return;
                if (newIndex >= self._data.length || newIndex < 0) return;

                // get wPosSuitWithNewIndex
                // get itemReuse
                // move item Reuse to the wPosSuitWithNewIndex
                const posSuitWithNewIndex = self.GetPosItem(newIndex);
                const wPos = new Vec3();
                self.nContent.getComponent(UITransform).convertToWorldSpaceAR(posSuitWithNewIndex, wPos);
                const nItemReuse = self._listNHolder[index].getComponent(B_ItemScrollViewSys).GetItemReuse();
                tween(nItemReuse)
                    .to(time_Move, { worldPosition: wPos })
                    .start()
            })

            await Utils.delay(time_Move * 1000);
            // move only items need to below 
        }

        async function cbScrollToIndexRight() {
            const timeScorll = GetTimeScrollFromXToY(dataCheck.indexItemOld, dataCheck.indexItemReal);
            // in time scroll => update rank to the right
            tween(self.param.nItemFake)
                .to(timeScorll, {}, {
                    onUpdate(target, ratio) {
                        self._IScrollAnim.UpdateItemWhileScroll(self.param.nItemFake, dataCheck.dataItemOld, dataCheck.dataItemReal, ratio);
                    },
                })
                .start()
            await self.ScrollToIndex(self.GetIndexScrollToMidder(dataCheck.indexItemReal), false, true, timeScorll)
        }
        function cbUpdateDataToRealData_noAnim() {
            self.UpdateData(dataCheck.dataReal, false, true);
        }
        function IsMoveUp(): boolean {
            return dataCheck.indexItemOld > dataCheck.indexItemReal;
        }


        //==========================================
        //==========================================
        //================== anim ==================
        //==========================================
        //==========================================
        this.nBlockView.active = true;
        switch (typeAnim) {
            case TYPE_ANIM_SCROLL_SPECIAL.SPE_1:
                this.SetCanShowAnchor(false);
                this.SetEndScroll(false);
                // trong trường hợp index mới nằm ngoài những index đang được hiển thị => thì ta sẽ chạy anim special 1
                // còn trong trường hợp index mới nằm cùng UI với index đang được hiển thị => thì ta sẽ chạy anim special 2

                let indexItemNeedScrollTo = this.GetIndexScrollToMidder(dataCheck.indexItemOld);
                if (Math.abs(dataCheck.indexItemOld - dataCheck.indexItemReal) < (this.NumItemCanShow() - this.param.numItemDistanceShow - 1)) {
                    if (self.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && !self.param.reverseSiblingIndex) {
                        indexItemNeedScrollTo = IsMoveUp() ? dataCheck.indexItemReal + 1 : dataCheck.indexItemOld + 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.TOP_TO_BOTTOM && self.param.reverseSiblingIndex) {
                        indexItemNeedScrollTo = IsMoveUp() ? dataCheck.indexItemReal - 1 : dataCheck.indexItemOld - 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && !self.param.reverseSiblingIndex) {
                        indexItemNeedScrollTo = IsMoveUp() ? dataCheck.indexItemReal - 1 : dataCheck.indexItemOld - 1;
                    } else if (self.param.verticalDirection == VERTICAL_DIRECTION.BOTTOM_TO_TOP && self.param.reverseSiblingIndex) {
                        indexItemNeedScrollTo = IsMoveUp() ? dataCheck.indexItemReal + 1 : dataCheck.indexItemOld + 1;
                    }

                    this.ScrollToIndex(indexItemNeedScrollTo, true, false);
                    await Utils.delay(1000);

                    await AnimSpecial_2(
                        this.param.nItemFake,
                        //============ before anim ==============
                        cbSetDataFakeToFakeData,
                        cbGetWPosItemOld,
                        cbGetWPosItemNew,
                        cbHideTheItemOldIndex,
                        //============ anim ==============
                        cbMoveFake_2,
                        cbMoveAllItemShowSuitFake_InSameView,
                        //============ after anim ==============
                        cbUpdateDataToRealData_noAnim
                    );
                } else {
                    this.ScrollToIndex(indexItemNeedScrollTo, true, false);
                    // console.log(indexItemNeedScrollTo);
                    await Utils.delay(1000);

                    await AnimSpecial_1(
                        this.param.nItemFake,
                        //============ before anim ==============
                        cbSetDataFakeToFakeData,
                        cbGetWPosItemOld,
                        cbGetWPosItemNew,
                        cbHideTheItemOldIndex,
                        cbMoveFake_1,
                        //============ anim ==============
                        cbScrollToIndexRight,
                        cbMoveFake_2,
                        cbMoveAllItemShowSuitFake,
                        //============ after anim ==============
                        cbUpdateDataToRealData_noAnim
                    );
                }

                // anim
                break;
        }

        // // call done
        await Utils.delay(0.1 * 1000);
        this.nBlockView.active = false;
        this.SetCanShowAnchor(true);
        this.SetEndScroll(true);
        self._IScrollAnim.ScrollAnimDone();
    }
    //#endregion AnimSpecial
    //============================================
}