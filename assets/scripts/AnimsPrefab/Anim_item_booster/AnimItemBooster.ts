import { _decorator, Component, Node } from 'cc';
import { AnimPrefabsBase } from '../AnimPrefabBase';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

enum NameAnimIconBooster {
    VIP_SLOT_open = "VIP1",
    VIP_SLOT_idle = "VIP_idle",
    VIP_SLOT_close = "VIP2",
    SHUFFLE_open = "binhxit"
}

@ccclass('AnimItemBooster')
export class AnimItemBooster extends AnimPrefabsBase {
    public async PlayAnimOpen_VipSlot() {
        this.PlayAnim(NameAnimIconBooster.VIP_SLOT_open, false);
        await Utils.delay(this.GetTimeAnim(NameAnimIconBooster.VIP_SLOT_open) * 1000);
    }

    public async PlayAnimClose_VipSlot() {
        this.PlayAnim(NameAnimIconBooster.VIP_SLOT_close, false);
        await Utils.delay(this.GetTimeAnim(NameAnimIconBooster.VIP_SLOT_close) * 1000);
    }

    public async PlayAnimShuffle() {
        this.PlayAnim(NameAnimIconBooster.SHUFFLE_open, false);
        await Utils.delay(this.GetTimeAnim(NameAnimIconBooster.SHUFFLE_open) * 1000);
    }
}


