import { _decorator, Component, Label, Node } from 'cc';
import { ItemColorBuild } from './ItemColorBuild';
import { TGroupBuild, TGroupToLogic } from '../../Utils/Types';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Fri Aug 22 2025 17:30:07 GMT+0700 (Indochina Time)
 * ListItemColorBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/ListItemColorBuild.ts
 *
 */

@ccclass('ListItemColorBuild')
export class ListItemColorBuild extends Component {
    @property(ItemColorBuild) listItemColorBuild: ItemColorBuild[] = [];
    @property(Label) lbTotalPass: Label;
    private _listColorSave: Map<number, { numColor: number, numCar: number }> = new Map();  // MCOlor - numColor , numCar
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUp(listTGroupToLogic: TGroupToLogic[]) {
        // filter all the passenger than add to the right item color build
        let mapColor: Map<number, { numColor: number, numCar: number, priority: number }> = new Map();  // color json - quality

        // console.log("Check 22222", ...listTGroupToLogic);

        listTGroupToLogic.forEach(tGroupCheck => {
            const colorCar: number = tGroupCheck.color;
            if (tGroupCheck.total != null && tGroupCheck.numCar != null) {
                mapColor.set(colorCar, { numColor: tGroupCheck.total, numCar: tGroupCheck.numCar, priority: tGroupCheck.priority });
            }
        })

        this.listItemColorBuild.forEach(itemColorBuild => {
            const key = itemColorBuild.idColor;
            const valueColorInMap = mapColor.get(key);
            if (valueColorInMap != null && valueColorInMap.numColor > 0) {

                const listTGroupBuild: TGroupBuild[] = listTGroupToLogic.find(tGroupCheck => tGroupCheck.color == key).listTGroup;
                if (listTGroupBuild != null) {
                    itemColorBuild.node.active = true;
                    itemColorBuild.SetUp(valueColorInMap.numColor, valueColorInMap.numCar, listTGroupBuild, valueColorInMap.priority);
                }
            }
            else {
                itemColorBuild.node.active = false;
            }
        })

        // sắp xếp lại danh sách theo màu nào có số lượng nhiều nhất lên trước
        const listSortHighest: ItemColorBuild[] = Utils.CloneListDeep(this.listItemColorBuild.filter(value => value.node.active)).sort((a, b) => b.NumColor - a.NumColor);
        listSortHighest.forEach((item, index) => {
            item.node.setSiblingIndex(index);
            item.SetBackground(index);
        })

        // save data
        this._listColorSave = mapColor;

        // console.log(this._listColorSave);

        // set label
        let totalPass = 0;
        mapColor.forEach(value => totalPass += value.numColor);
        this.lbTotalPass.string = `Total: ${totalPass}`;
    }

    public GetListPassenger(): TGroupToLogic[] {
        let listTGroupBuild: TGroupToLogic[] = [];

        this.listItemColorBuild.forEach(itemBuild => {
            try {
                if (itemBuild.node.active) {
                    const colorSave = this._listColorSave.get(itemBuild.idColor);

                    listTGroupBuild.push({
                        color: itemBuild.idColor,
                        total: colorSave.numColor,
                        numCar: colorSave.numCar,
                        listTGroup: itemBuild.listConfigColor.GetDataToExport(),
                        priority: itemBuild.PriorityColor
                    });
                }
            } catch (e) {
                console.error((e));
            }
        });

        return listTGroupBuild;
    }

    public Reset() {
        this.listItemColorBuild.forEach(item => {
            item.Reset()
        });
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn

    //#endregion btn
    //==========================================
}