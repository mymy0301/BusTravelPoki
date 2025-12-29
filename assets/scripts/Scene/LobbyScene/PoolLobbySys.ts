/**
 * 
 * anhngoxitin01
 * Mon Aug 18 2025 09:22:23 GMT+0700 (Indochina Time)
 * PoolLobbySys
 * db://assets/scripts/Scene/LobbyScene/PoolLobbySys.ts
*
*/
import { _decorator } from 'cc';
import { MPoolSys } from '../../Utils/MPoolSys';
const { ccclass, property } = _decorator;

@ccclass('PoolLobbySys')
export class PoolLobbySys extends MPoolSys {
    public static Instance: PoolLobbySys = null;
    //==========================================
    //#region base
    protected onLoad(): void {
        if (PoolLobbySys.Instance == null) {
            PoolLobbySys.Instance = this;
        }
    }

    public onDisable(): void {
        PoolLobbySys.Instance = null;
        super.onDisable();
    }
    //#endregion base
    //==========================================
}