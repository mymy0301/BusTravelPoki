import { _decorator, Component, instantiate, Layout, Node, Prefab, Size, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ListSubDashRush')
export class ListSubDashRush extends Component {
    @property(Prefab) pfItemDashRush: Prefab;
    // @property(Layout) layoutItem: Layout;

    private _listNItemDashRush: Node[] = [];
    private _sizeItem: Size = null;
    private readonly NUM_ITEM_DASH_RUSH: number = 5;

    //======================================    
    //#region Init
    public Init() {
        // this.TurnOffLayout();
        if (this._listNItemDashRush.length == 0) {
            for (let i = 1; i <= this.NUM_ITEM_DASH_RUSH; i++) {
                const nItemDashRush = instantiate(this.pfItemDashRush);
                nItemDashRush.name = `ItemDashRush_${i}`;
                const posItem = GetPosPlayeSuitRankDependOnLayout(i, 0, nItemDashRush.getComponent(UITransform).contentSize.clone());
                nItemDashRush.setParent(this.node);
                nItemDashRush.position = posItem;
                this._listNItemDashRush.push(nItemDashRush);

                if (this._sizeItem == null) {
                    this._sizeItem = nItemDashRush.getComponent(UITransform).contentSize.clone();
                }
            }
        } else {
            this._listNItemDashRush.forEach((item: Node, index: number) => {
                const posSet = GetPosPlayeSuitRankDependOnLayout(index + 1, 0, item.getComponent(UITransform).contentSize.clone());
                item.position = posSet;
            })
        }
    }
    //#endregion Init
    //======================================

    //======================================    
    //#region get func
    public GetListN() { return this._listNItemDashRush; }
    // public TurnOffLayout() { this.layoutItem.enabled = false; }
    public GetPosSuitRank(rank: number) {
        const resultPos = GetPosPlayeSuitRankDependOnLayout(rank, 0, this._sizeItem);
        return resultPos;
    }

    public SortIndex(listSiblingIndex: number[]) {
        this._listNItemDashRush.reverse().forEach((item: Node, index: number) => item.setSiblingIndex(listSiblingIndex[index]));
    }

    public SortIndexPlayer(indexNode: number) {
        this._listNItemDashRush[indexNode].setSiblingIndex(9999);
    }
    //#endregion get func
    //======================================    
}

function GetPosPlayeSuitRankDependOnLayout(rank: number, distanceNode: number, sizeNode: Size): Vec3 {
    switch (rank) {
        case 1: return new Vec3(sizeNode.x * 2 + distanceNode * 2, 0, 0);
        case 2: return new Vec3(sizeNode.x + distanceNode, 0, 0);
        case 3: return new Vec3(0, 0, 0);
        case 4: return new Vec3(-sizeNode.x - distanceNode, 0, 0);
        case 5: return new Vec3(-sizeNode.x * 2 - distanceNode * 2, 0, 0);
        default: return null;
    }
}
