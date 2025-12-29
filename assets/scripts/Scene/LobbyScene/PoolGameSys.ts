/**
 * 
 * dinhquangvinhdev
 * Mon Aug 18 2025 09:22:23 GMT+0700 (Indochina Time)
 * PoolLobbySys
 * db://assets/scripts/Scene/LobbyScene/PoolLobbySys.ts
*
*/
import { _decorator } from 'cc';
import { MPoolSys } from '../../Utils/MPoolSys';
const { ccclass, property } = _decorator;

@ccclass('PoolGameSys')
export class PoolGameSys extends MPoolSys {
    public static Instance: PoolGameSys = null;
    //==========================================
    //#region base
    protected onLoad(): void {
        if (PoolGameSys.Instance == null) {
            PoolGameSys.Instance = this;
        }
    }

    public onDisable(): void {
        PoolGameSys.Instance = null;
        super.onDisable();
    }
    //#endregion base
    //==========================================
}