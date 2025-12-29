/**
 * 
 * anhngoxitin01
 * Tue Oct 28 2025 10:32:23 GMT+0700 (Indochina Time)
 * EffectPumpkins
 * db://assets/scripts/Scene/GameScene/EffectPumpkins/EffectPumpkins.ts
*
*/
import { _decorator, Component, instantiate, Node, Pool, Prefab, Vec3 } from 'cc';
import { PoolGameSys } from '../../LobbyScene/PoolGameSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { M_COLOR } from '../../../Utils/Types';
import { AnimPumpkin } from './AnimPumpkin';
const { ccclass, property } = _decorator;
const NAME_POOL_PUMPKINS = "POOL_PUMPKINS";

@ccclass('EffectPumpkins')
export class EffectPumpkins extends Component {
    @property(Prefab) pfNPumpkins: Prefab;

    //==========================================
    //#region base
    protected start(): void {
        if (!PoolGameSys.Instance.IsRegisterPool(NAME_POOL_PUMPKINS)) {
            const newPool = new Pool(() => instantiate(this.pfNPumpkins), 0);
            PoolGameSys.Instance.RegisterPool(NAME_POOL_PUMPKINS, newPool);
        }
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.PLAY_ANIM_PUMPKIN_BUS, this.PlayAnimPumpkins, this);
    }
    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.PLAY_ANIM_PUMPKIN_BUS, this.PlayAnimPumpkins, this);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    private PlayAnimPumpkins(wPos: Vec3) {
        // check valid
        if (PoolGameSys.Instance == null || !PoolGameSys.Instance.IsRegisterPool(NAME_POOL_PUMPKINS)) { return; }

        // khởi tạo anim và bật nó lên
        const nAnimPumpkin = PoolGameSys.Instance.GetItemFromPool(NAME_POOL_PUMPKINS);
        const comAnim: AnimPumpkin = nAnimPumpkin.getComponent(AnimPumpkin);
        comAnim.Reset(wPos);
        nAnimPumpkin.setParent(this.node, true);
        comAnim.Play(() => {
            if (PoolGameSys.Instance == null || !PoolGameSys.Instance.IsRegisterPool(NAME_POOL_PUMPKINS)) { return; }
            nAnimPumpkin.active = false;
            PoolGameSys.Instance.PoolItem(nAnimPumpkin, NAME_POOL_PUMPKINS);
        });
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
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