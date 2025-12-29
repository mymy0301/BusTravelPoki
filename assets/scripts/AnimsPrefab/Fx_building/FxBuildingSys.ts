import { _decorator, Component, Node, Vec3 } from 'cc';
import { EVENT_FX_BUILDING_PLAY, EVENT_FX_BUILDING_STOP_FORCE, Type_FxBuilding } from './Type_FxBuilding';
import { clientEvent } from '../../framework/clientEvent';
import { M_ERROR } from '../../Configs/MConfigError';
import { EffectsSys, TYPE_EFFECT_SKELETON } from '../../Scene/GameScene/EffectsSys';
import { AnimFxBuilding } from '../AnimFxBuilding';
import { Utils } from '../../Utils/Utils';
import { AnimFxBuilding_2 } from '../AnimFxBuilding_2';
import { MConfigs } from '../../Configs/MConfigs';
const { ccclass, property } = _decorator;


/**
 * class này có nhiệm vụ là gen effect từ class EffectSys và chạy effect tại chính node này
 * nếu không tìm thấy class EffectSys thì sẽ return
 */

@ccclass('FxBuildingSys')
export class FxBuildingSys extends Component {
    @property({ type: Type_FxBuilding }) private typeFxBuilding: Type_FxBuilding = Type_FxBuilding.UI_COIN_SHOP;
    @property({ tooltip: 'có thể có hoặc không \n nếu không có thì lúc gọi emit ko được bỏ trống wPos', type: Node }) private nWPosEfPlay: Node = null;
    @property({ type: TYPE_EFFECT_SKELETON }) typeEfSkeleton: TYPE_EFFECT_SKELETON = TYPE_EFFECT_SKELETON.FX_BUILDING;
    private listEfPlaying: Node[] = [];

    protected onEnable(): void {
        this.RegisterManual();
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_FX_BUILDING_PLAY, this.PlayFxBuilding, this);
        clientEvent.off(EVENT_FX_BUILDING_PLAY, this.PlayFxBuilding_2, this);
        clientEvent.off(EVENT_FX_BUILDING_STOP_FORCE, this.StopForceBuilding, this);
    }

    public UnRegisterManual() {
        clientEvent.off(EVENT_FX_BUILDING_PLAY, this.PlayFxBuilding, this);
        clientEvent.off(EVENT_FX_BUILDING_PLAY, this.PlayFxBuilding_2, this);
        clientEvent.off(EVENT_FX_BUILDING_STOP_FORCE, this.StopForceBuilding, this);
    }

    public RegisterManual() {
        if (!clientEvent.isOnEvent(EVENT_FX_BUILDING_PLAY, this.PlayFxBuilding, this)) {
            switch (this.typeEfSkeleton) {
                case TYPE_EFFECT_SKELETON.FX_BUILDING:
                    clientEvent.on(EVENT_FX_BUILDING_PLAY, this.PlayFxBuilding, this);
                    break;
                case TYPE_EFFECT_SKELETON.FX_BUILDING_2:
                    clientEvent.on(EVENT_FX_BUILDING_PLAY, this.PlayFxBuilding_2, this);
                    break;
            }
        }

        if (!clientEvent.isOnEvent(EVENT_FX_BUILDING_STOP_FORCE, this.StopForceBuilding, this)) {
            clientEvent.on(EVENT_FX_BUILDING_STOP_FORCE, this.StopForceBuilding, this);
        }
    }

    isShowFxBuildingAvailable: boolean = true;

    public TIMENEXT_SHOW_FX_BUILDING: number = 0.15;
    private async PlayFxBuilding(type_FxBuilding: Type_FxBuilding, wPos: Vec3 = null, cbDone: CallableFunction = null, scaleCustom: Vec3 = null) {
        // console.log("PlayFxBuilding");
        if (!this.isShowFxBuildingAvailable) return;
        this.isShowFxBuildingAvailable = false;
        this.scheduleOnce(() => {
            this.isShowFxBuildingAvailable = true;
        }, this.TIMENEXT_SHOW_FX_BUILDING);
        if (type_FxBuilding != this.typeFxBuilding) { return; }

        try {

            const effectSys = EffectsSys.Instance.InitEff(TYPE_EFFECT_SKELETON.FX_BUILDING);
            this.listEfPlaying.push(effectSys);
            effectSys.parent = this.node;
            effectSys.active = true;
            effectSys.worldPosition = wPos == null && this.nWPosEfPlay != null ? this.nWPosEfPlay.worldPosition.clone() : wPos.clone();
            const fxBuildingCom = effectSys.getComponent(AnimFxBuilding);
            const timeAnim = fxBuildingCom.GetTimeAnim(fxBuildingCom.NameAnim);
            fxBuildingCom.PlayAnim(fxBuildingCom.NameAnim);
            await Utils.delay(timeAnim * 1000);
            // kiểm tra đã bị force stop hay không
            if (this.listEfPlaying.indexOf(effectSys) != -1) {
                EffectsSys.Instance.ReUseEff(TYPE_EFFECT_SKELETON.FX_BUILDING, effectSys);
                this.listEfPlaying.splice(this.listEfPlaying.indexOf(effectSys), 1);
                if (cbDone != null)
                    cbDone();
            }
        } catch (e) {
            console.error('error #%d', M_ERROR.FX_BUILDING, e);
        }
    }

    private StopForceBuilding(type_FxBuilding: Type_FxBuilding) {
        if (type_FxBuilding != this.typeFxBuilding) { return; }

        try {
            while (this.listEfPlaying.length > 0) {
                const indexChoice = 0;
                EffectsSys.Instance.ReUseEff(this.typeEfSkeleton, this.listEfPlaying[indexChoice]);
                this.listEfPlaying.splice(indexChoice, 1);
            }
        } catch (e) {
            console.error('error #%d', M_ERROR.FX_BUILDING);
        }
    }

    private async PlayFxBuilding_2(type_FxBuilding: Type_FxBuilding, wPos: Vec3 = null, cbDone: CallableFunction = null, scaleCustom: Vec3 = null) {
        if (type_FxBuilding != this.typeFxBuilding) { return; }

        try {
            const effectSys = EffectsSys.Instance.InitEff(TYPE_EFFECT_SKELETON.FX_BUILDING_2);
            this.listEfPlaying.push(effectSys);
            effectSys.parent = this.node;
            effectSys.active = true;
            effectSys.worldPosition = wPos == null && this.nWPosEfPlay != null ? this.nWPosEfPlay.worldPosition.clone() : wPos.clone();
            const fxBuildingCom = effectSys.getComponent(AnimFxBuilding_2);

            switch (true) {
                case scaleCustom != null: fxBuildingCom.particle.node.scale = scaleCustom; break;
                case type_FxBuilding == Type_FxBuilding.UI_BTN_PLAY_PAGE_HOME: fxBuildingCom.particle.node.scale = MConfigs.FX_BTN_LEVEL; break;
                default: fxBuildingCom.particle.node.scale = MConfigs.FX_DEFAULT; break;
            }

            const timeAnim = fxBuildingCom.GetTime() - 0.2;
            fxBuildingCom.Play();
            await Utils.delay(timeAnim * 1000);
            // kiểm tra đã bị force stop hay không
            if (this.listEfPlaying.indexOf(effectSys) != -1) {
                EffectsSys.Instance.ReUseEff(TYPE_EFFECT_SKELETON.FX_BUILDING_2, effectSys);
                this.listEfPlaying.splice(this.listEfPlaying.indexOf(effectSys), 1);
                if (cbDone != null)
                    cbDone();
            }
        } catch (e) {
            console.error('error #%d', M_ERROR.FX_BUILDING, e);
        }
    }
}


