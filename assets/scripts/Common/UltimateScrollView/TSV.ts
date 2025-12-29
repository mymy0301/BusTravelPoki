import { _decorator, Component, Node } from 'cc';
import { B_ScrollViewSys, IScrollAnchor, IScrollViewSys } from './B_ScrollViewSys';
import { ItemUltimateSV } from './ItemUltimateSV';
const { ccclass, property } = _decorator;

@ccclass('TSV')
export class TSV extends B_ScrollViewSys implements IScrollViewSys, IScrollAnchor {

    protected onLoad(): void {
        super.onLoad();
        this.SetUp_interface(this, this);

        let tempData = new Array(1).fill(0).map((x, i) => i);
        this.SetUp_data(tempData);
    }

    SetUpItemData(nItem: Node, data: any, index: number,
        cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction, isUseAnim: boolean): void {
        nItem.getComponent(ItemUltimateSV).SetUpData_ItemUltimateSV(data, false, this.IsPlayer.bind(this), cbShowAnchor, cbHideAnchor);
    }

    SetAnchorData(nAnchor: Node, dataAll: any): void {
        for (let i = 0; i < dataAll.length; i++) {
            const dataCheck = dataAll[i];
            // check is player
            if (dataCheck === 20) {
                nAnchor.getComponent(ItemUltimateSV).SetUpData_ItemUltimateSV(dataCheck, true, this.IsPlayer.bind(this), null, null);
                break;
            }
        }
    }

    GetIndexDataAnchor(dataShowing: any): number {
        // check in data has player show
        const dataCheck = dataShowing as number[];
        let indexPlayer = dataCheck.findIndex(x => x === 20);
        return indexPlayer;
    }


    private IsPlayer(data: any): boolean {
        return data === 20;
    }

    public Test() {
        this.InitItemsFirstTime();
    }
}


