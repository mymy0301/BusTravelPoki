import { _decorator, Component, Label, Node } from 'cc';
import { ItemInfoGroupBuild } from './ItemInfoGroupBuild';
import { TGroupToLogic } from '../../Utils/Types';
import { Utils } from '../../Utils/Utils';
import { clientEvent } from '../../framework/clientEvent';
import { MConstBuildGame } from '../MConstBuildGame';
const { ccclass, property } = _decorator;

/**
 * 
 * anhngoxitin01
 * Sun Sep 07 2025 15:46:23 GMT+0700 (Indochina Time)
 * UIInfoGroupBuilding
 * db://assets/scripts/BuildGame/LogicBuildGroup/UIInfoGroupBuilding.ts
 *
 */

@ccclass('UIInfoGroupBuilding')
export class UIInfoGroupBuilding extends Component {
    @property(Label) lbTotalColor: Label;
    @property(ItemInfoGroupBuild) listItemInfoGroupBuild: ItemInfoGroupBuild[] = [];
    private _configSet: TGroupToLogic[] = [];
    private _total: number = 0;
    //==========================================
    //#region base
    protected onDisable(): void {
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.UDPATE_GROUP, this.UpdateInfo, this);
    }

    public SetUp(configSet: TGroupToLogic[]) {
        this._configSet = configSet;

        // ta sẽ chỉ hiển thị những xe có thông tin
        // cài đặt thông tin ở mức mặc định
        // sắp xếp lại danh sách theo màu nào có số lượng nhiều nhất lên trước

        let totalColor = 0;

        // ẩn toàn bộ item đi
        this.listItemInfoGroupBuild.forEach(item => item.node.active = false);

        // sort + setUp
        const listSortHighest: TGroupToLogic[] = Utils.CloneListDeep(configSet).sort((a, b) => a.total - b.total);
        listSortHighest.forEach((item, index) => {
            const infoSet = listSortHighest[index];
            const itemSet = this.listItemInfoGroupBuild.find(item => item.idColor == infoSet.color);
            totalColor += infoSet.total;
            if (itemSet != null) {
                itemSet.node.active = true;
                itemSet.node.setSiblingIndex(0);
                itemSet.SetUp(infoSet.total);
            }
        })

        // setUp lbTotal
        this._total = totalColor;
        this.lbTotalColor.string = `Total: ${totalColor}`;

        // update force with config setUp
        this._configSet.forEach(configColor => {
            let totalColorUsing = 0;
            configColor.listTGroup.forEach(tGroupCheck => {
                totalColorUsing += tGroupCheck.quality;
            })
            this.UpdateInfo(configColor.color, totalColorUsing);
        })

        if (!clientEvent.isOnEvent(MConstBuildGame.EVENT_BUILDING.UDPATE_GROUP, this.UpdateInfo, this)) {
            clientEvent.on(MConstBuildGame.EVENT_BUILDING.UDPATE_GROUP, this.UpdateInfo, this);
        }
    }

    public Reset() {
        this.SetUp(this._configSet);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public UpdateInfo(idColor: number, numColorUsing: number) {
        // tìm kiếm idColor
        const itemSuit = this.listItemInfoGroupBuild.find(item => item.idColor == idColor);
        const infoSuit = this._configSet.find(config => config.color == idColor);

        if (itemSuit != null && infoSuit != null) {
            itemSuit.SetUp(infoSuit.total - numColorUsing);
        }

        // set total
        let totalColorRemain = this._total;
        this.listItemInfoGroupBuild.filter(item => item.node.active).forEach(item => {
            totalColorRemain -= item.NumNow;
        })
        this.lbTotalColor.string = `Total: ${this._total - totalColorRemain}`;
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