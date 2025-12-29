import { _decorator, Component, Node, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { M_ERROR } from '../../Configs/MConfigError';
import { EffectsSys, TYPE_EFFECT_SKELETON } from '../../Scene/GameScene/EffectsSys';
import { Utils } from '../../Utils/Utils';
import { EVENT_FX_UNLOCK_PARKING_PLAY, EVENT_FX_UNLOCK_PARKING_STOP_FORCE, Type_FxUnlockParking } from './Type_FxUnlockParking';
import { AnimFx_unlock_building } from '../AnimFx_unlock_building';
const { ccclass, property } = _decorator;


/**
 * class này có nhiệm vụ là gen effect từ class EffectSys và chạy effect tại chính node này
 * nếu không tìm thấy class EffectSys thì sẽ return
 */

@ccclass('FxUnlockParkingSys')
export class FxUnlockParkingSys extends Component {
    @property({ type: Type_FxUnlockParking }) private typeFx: Type_FxUnlockParking = Type_FxUnlockParking.UI_PARKING;
    @property({ tooltip: 'có thể có hoặc không \n nếu không có thì lúc gọi emit ko được bỏ trống wPos', type: Node }) private nWPosEfPlay: Node = null;
    @property({ type: TYPE_EFFECT_SKELETON }) typeEfSkeleton: TYPE_EFFECT_SKELETON = TYPE_EFFECT_SKELETON.FX_BUILDING;
    private listEfPlaying: Node[] = [];

    protected onLoad(): void {
        this.RegisterManual();
    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_FX_UNLOCK_PARKING_PLAY, this.PlayFx, this);
        clientEvent.off(EVENT_FX_UNLOCK_PARKING_STOP_FORCE, this.StopForceFxUnlockParking, this);
    }

    public UnRegisterManual() {
        clientEvent.off(EVENT_FX_UNLOCK_PARKING_PLAY, this.PlayFx, this);
        clientEvent.off(EVENT_FX_UNLOCK_PARKING_STOP_FORCE, this.StopForceFxUnlockParking, this);
    }

    public RegisterManual() {
        if (!clientEvent.isOnEvent(EVENT_FX_UNLOCK_PARKING_PLAY, this.PlayFx, this)) {
            switch (this.typeEfSkeleton) {
                case TYPE_EFFECT_SKELETON.FX_UNLOCK_PARKING:
                    clientEvent.on(EVENT_FX_UNLOCK_PARKING_PLAY, this.PlayFx, this);
                    break;
            }
        }

        if (!clientEvent.isOnEvent(EVENT_FX_UNLOCK_PARKING_STOP_FORCE, this.StopForceFxUnlockParking, this)) {
            clientEvent.on(EVENT_FX_UNLOCK_PARKING_STOP_FORCE, this.StopForceFxUnlockParking, this);
        }
    }

    private StopForceFxUnlockParking(type_Fx: Type_FxUnlockParking) {
        if (type_Fx != this.typeFx) { return; }

        try {
            while (this.listEfPlaying.length > 0) {
                const indexChoice = 0;
                EffectsSys.Instance.ReUseEff(this.typeEfSkeleton, this.listEfPlaying[indexChoice]);
                this.listEfPlaying.splice(indexChoice, 1);
            }
        } catch (e) {
            console.error('error #%d', M_ERROR.FX_UNLOCK_PARKING);
        }
    }

    private async PlayFx(type_Fx: Type_FxUnlockParking, wPos: Vec3 = null, cbDone: CallableFunction = null, scaleCustom: Vec3 = null) {

        if (type_Fx != this.typeFx) { return; }

        try {

            const effectSys = EffectsSys.Instance.InitEff(TYPE_EFFECT_SKELETON.FX_UNLOCK_PARKING);
            this.listEfPlaying.push(effectSys);
            effectSys.parent = this.node;
            effectSys.active = true;
            effectSys.worldPosition = wPos == null && this.nWPosEfPlay != null ? this.nWPosEfPlay.worldPosition.clone() : wPos.clone();
            const fxCom = effectSys.getComponent(AnimFx_unlock_building);
            const timeAnim = fxCom.GetTime() - 0.2;
            fxCom.Play();
            await Utils.delay(timeAnim * 1000);
            // kiểm tra đã bị force stop hay không
            if (this.listEfPlaying.indexOf(effectSys) != -1) {
                EffectsSys.Instance.ReUseEff(TYPE_EFFECT_SKELETON.FX_UNLOCK_PARKING, effectSys);
                this.listEfPlaying.splice(this.listEfPlaying.indexOf(effectSys), 1);
                if (cbDone != null)
                    cbDone();
            }
        } catch (e) {
            console.error('error #%d', M_ERROR.FX_UNLOCK_PARKING, e);
        }
    }
}


