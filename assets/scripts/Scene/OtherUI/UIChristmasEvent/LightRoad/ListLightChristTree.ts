/**
 * 
 * anhngoxitin01
 * Tue Nov 25 2025 09:32:23 GMT+0700 (Indochina Time)
 * ListLightChristTree
 * db://assets/scripts/Scene/OtherUI/UIChristmasEvent/LightRoad/ListLightChristTree.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { LightChristTree } from './LightChristTree';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { DataLightRoad_christ } from 'db://assets/scripts/DataBase/DataLightRoad_christ';
import { CONFIG_LR_CHRIST } from './TypeLightRoad';
const { ccclass, property } = _decorator;

@ccclass('ListLightChristTree')
export class ListLightChristTree extends Component {
    @property([LightChristTree]) listLightChristTree: LightChristTree[] = [];


    //==========================================
    //#region base
    private _wasInited: boolean = false; public get WasInited(): boolean { return this._wasInited; }
    public async Init(progressTarget: number) {
        // NOTE đoạn code chỉ cho init một lần được dùng để tránh vc cập nhật lại màu của bóng đèn
        if (this._wasInited) { return; }
        this._wasInited = true;
        const indexLightNow = DataLightRoad_christ.Instance.GetIndexLight(progressTarget);
        this.listLightChristTree.forEach(light => { light.HideLight() });
        await MConfigResourceUtils.LoadLightBulb();
        this.listLightChristTree.forEach(light => { light.LoadRoot(); light.SetImageLight(indexLightNow) });
    }

    /**
     * có 2 case
     * // 1 là turn on toàn bộ
     * // 2 là chỉ turn on những đèn nào cần turn on
     * @param numLightHave 
     * @returns 
     */
    public TurnOnAll(numLightHave: number, type: 'all' | 'not') {
        const totalLight = this.listLightChristTree.length;
        let indexCheck = numLightHave % totalLight;

        // check is max progress
        if (numLightHave >= CONFIG_LR_CHRIST.MAX_PROGRESS) {
            this.listLightChristTree.forEach(light => light.ShowLight(true));
        } else {
            if (indexCheck == 0) {
                if (type == 'all') {
                    this.listLightChristTree.forEach(light => light.ShowLight(true));
                }
            }
            else {
                for (let i = 0; i < indexCheck; i++) {
                    this.listLightChristTree[i].ShowLight(true);
                }
            }
        }
    }

    public AnimTurnOnNextLight(): Promise<void> {
        for (let i = 0; i < this.listLightChristTree.length; i++) {
            const lightCheck = this.listLightChristTree[i];
            if (!lightCheck.IsOn) {
                return new Promise<void>(resolve => {
                    lightCheck.ShowLight(false, () => { resolve(); });
                })
            }
        }

        return null;
    }

    public IsLightAll() { return this.listLightChristTree.every(light => light.IsOn); }
    //#endregion base
}