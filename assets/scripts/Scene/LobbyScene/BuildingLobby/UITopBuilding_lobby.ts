import { _decorator, Component, Label, Node, NodeEventType, Prefab, Size, SpriteFrame, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { ObjectPool } from '../../../Utils/ObjPool';
import { IPrize, TYPE_PRIZE } from '../../../Utils/Types';
import { ItemPrizeBuildingSys } from './ItemPrizeBuildingSys';
const { ccclass, property } = _decorator;

@ccclass('UITopBuilding_lobby')
export class UITopBuilding_lobby extends Component {
    @property(Label) lbTitle: Label;
    @property(Label) lbTitleShadow: Label;
    @property(Prefab) pfItemPrize: Prefab;
    @property(Node) nLayout: Node;
    @property(Node) nTempPrize: Node;
    @property(Node) nBgListPrizes: Node;
    // @property(SpriteFrame) sfCoin: SpriteFrame;
    @property(Node) nSignItems: Node;
    private mObjPool: ObjectPool = new ObjectPool();

    @property(UIOpacity) uiOpacity: UIOpacity;

    private _prizeCoin: Node = null;
    private _prizeTicket: Node = null;
    private _listOtherPrize: Node[] = [];

    private readonly WIDTH_BG_LIST_ITEM_1: number = 230;
    private readonly WIDTH_BG_LIST_ITEM_2: number = 350;
    private readonly WIDTH_BG_LIST_ITEM_3: number = 470;

    protected onLoad(): void {
        this.mObjPool.InitObjectPool(this.nLayout, this.pfItemPrize);
        this.nLayout.on(NodeEventType.SIZE_CHANGED, this.ReSizeBgLayout, this);
    }

    protected onDestroy(): void {
        if (this.nLayout != null && this.nLayout.isValid) {
            this.nLayout.off(NodeEventType.SIZE_CHANGED, this.ReSizeBgLayout, this);
        }
    }

    public SetUpData(title: string, listPrize: IPrize[]) {
        //reset data first
        this.ResetData();

        this.lbTitle.string = title;
        this.lbTitleShadow.string = title;

        // set bg
        let widthSignItem = this.WIDTH_BG_LIST_ITEM_3;
        const oldSizeBgListItem = this.nSignItems.getComponent(UITransform).contentSize.clone();
        switch (listPrize.length) {
            case 1: widthSignItem = this.WIDTH_BG_LIST_ITEM_1; break;
            case 2: widthSignItem = this.WIDTH_BG_LIST_ITEM_2; break;
            case 3: widthSignItem = this.WIDTH_BG_LIST_ITEM_3; break;
        }
        this.nSignItems.getComponent(UITransform).contentSize = new Size(widthSignItem, oldSizeBgListItem.y);

        // init prize 
        for (let i = 0; i < listPrize.length; i++) {
            let nItem = this.InitObject();
            const prize = listPrize[i];

            switch (prize.typePrize) {
                case TYPE_PRIZE.MONEY:
                    nItem.getComponent(ItemPrizeBuildingSys).SetUp(listPrize[i]);
                    // nItem.getComponent(ItemPrizeBuildingSys).icItem.spriteFrame = this.sfCoin;
                    this._prizeCoin = nItem;
                    break;
                case TYPE_PRIZE.TICKET:
                    nItem.getComponent(ItemPrizeBuildingSys).SetUp(listPrize[i]);
                    this._prizeTicket = nItem;
                    break;
                default:
                    nItem.getComponent(ItemPrizeBuildingSys).SetUp(listPrize[i]);
                    this._listOtherPrize.push(nItem);
                    break;
            }

            nItem.parent = this.nLayout;
            nItem.active = true;
        }
    }

    public ResetData() {
        this.nLayout.children.forEach(item => this.ReUseObject(item));
        this._prizeCoin = null;
        this._prizeTicket = null;
        this._listOtherPrize = [];
    }

    public GetPrizeCoin(): Node {
        return this._prizeCoin;
    }

    public GetPrizeTicket(): Node {
        return this._prizeTicket;
    }

    public GetListOtherPrize(): Node[] {
        return this._listOtherPrize;
    }

    private ReSizeBgLayout() {
        // const oldTrans: Size = this.nBgListPrizes.getComponent(UITransform).contentSize.clone();
        // const newTrans: Size = this.nLayout.getComponent(UITransform).contentSize.clone();
        // this.nBgListPrizes.getComponent(UITransform).setContentSize(newTrans.width, oldTrans.height);
    }

    // #region object pool
    public InitObject(): Node {
        return this.mObjPool.GetObj();
    }

    public ReUseObject(objItem: Node) {
        try {
            this.mObjPool.ReUseObj3(objItem, this.nTempPrize);
        } catch (error) {

        }
    }
    // #endregion object pool

    public ShowGroup() {
        // console.log("ShowGroup");
        tween(this.uiOpacity).to(0.3, { opacity: 255 }).start();
    }

    public HideGroup() {
        // console.log("HideGroup");
        tween(this.uiOpacity).to(0.3, { opacity: 0 }).start();
    }
}


