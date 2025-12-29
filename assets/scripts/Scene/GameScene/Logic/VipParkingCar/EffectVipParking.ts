import { _decorator, Component, instantiate, Node, Vec3 } from 'cc';
import { AnimItemBooster } from 'db://assets/scripts/AnimsPrefab/Anim_item_booster/AnimItemBooster';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { ResourceUtils } from 'db://assets/scripts/Utils/ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('EffectVipParking')
export class EffectVipParking extends Component {
    private _skeletonVip: Node = null;
    
    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_VIP_PARKING.INIT, this.InitSkeletonVipSlot, this);
        clientEvent.on(MConst.EVENT_VIP_PARKING.OPEN, this.OpenSkeletonVipSlot, this);
        clientEvent.on(MConst.EVENT_VIP_PARKING.CLOSE, this.CloseSkeletonVipSlot, this);
        clientEvent.on(MConst.EVENT_VIP_PARKING.CHANGE_STATE, this.ChangeStateSkeleton, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_VIP_PARKING.INIT, this.InitSkeletonVipSlot, this);
        clientEvent.off(MConst.EVENT_VIP_PARKING.OPEN, this.OpenSkeletonVipSlot, this);
        clientEvent.off(MConst.EVENT_VIP_PARKING.CLOSE, this.CloseSkeletonVipSlot, this);
        clientEvent.off(MConst.EVENT_VIP_PARKING.CHANGE_STATE, this.ChangeStateSkeleton, this);
    }

    public OpenSkeletonVipSlot() {
        this._skeletonVip.active = true;
        this._skeletonVip != null && this._skeletonVip.getComponent(AnimItemBooster).PlayAnimOpen_VipSlot();
    }

    public CloseSkeletonVipSlot() {
        this._skeletonVip != null && this._skeletonVip.getComponent(AnimItemBooster).PlayAnimClose_VipSlot();
    }

    public ChangeStateSkeleton(state: boolean) {
        if (this._skeletonVip != null) this._skeletonVip.active = state;
    }

    /**
     * Func này sẽ dc gọi khi layout của parent parking đã đc cập nhật trong class ListParkingCarSys
     * @param wPos 
     * @returns 
     */
    private async InitSkeletonVipSlot(wPos: Vec3) {
        if (this._skeletonVip != null) {
            this._skeletonVip.worldPosition = wPos;
            this._skeletonVip.active = false;
            return;
        }

        // init data
        ResourceUtils.load_Prefab_Bundle(MConst.PATH_PF_ANIM_ITEM_BOOSTER, MConst.BUNDLE_GAME, (err, path, prefab) => {
            if (err == null) {
                this._skeletonVip = instantiate(prefab);
                this._skeletonVip.parent = this.node;
                this._skeletonVip.worldPosition = wPos.clone();

                this._skeletonVip.active = false;
            }
        });
    }
}


