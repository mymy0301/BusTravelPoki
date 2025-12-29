import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('B_ItemScrollViewSys')
export class B_ItemScrollViewSys extends Component {
    private cbInitItem: CallableFunction = null;
    private cbReUseItem: CallableFunction = null;
    private cbSetItemData: CallableFunction = null;
    private cbShowAnchor: CallableFunction = null;
    private cbHideAnchor: CallableFunction = null;
    // @property({group: {id: "B_ItemScrollViewSys", name: "B_ItemScrollViewSys"}}) isFake: boolean = false;

    private _itemReUse: Node = null;
    public GetItemReuse() { return this._itemReUse; }

    public Register(cb1, cb2, cb3, cb4, cb5) {
        this.cbInitItem = cb1;
        this.cbReUseItem = cb2;
        this.cbSetItemData = cb3;
        this.cbShowAnchor = cb4;
        this.cbHideAnchor = cb5;
    }

    public ForceSetItem(nItem: Node) {
        this._itemReUse = nItem;
    }

    /**
     * 
     * @param data 
     * @param index 
     * @param force true nếu update lại dữ liệu đang hiển thị 
     * @returns 
     */
    public TryShowItem(data: any, index: number, canUseAnimWhenScroll: boolean) {
        if (this._itemReUse != null) {
            return;
        }

        let nItem = this.cbInitItem();
        nItem.setParent(this.node);
        nItem.setPosition(0, 0);
        nItem.name = `item_${index}`;
        this.cbSetItemData(nItem, data, index, this.cbShowAnchor, this.cbHideAnchor, canUseAnimWhenScroll);
        this._itemReUse = nItem;
        this._itemReUse.active = true

        this.node.active = true;
    }

    public HideItem() {
        this.node.active = false;
        if (this._itemReUse == null) { return; }
        this.cbReUseItem(this._itemReUse);
        this._itemReUse = null;
    }
}


