import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('FX_popup')
export class FX_popup extends AnimPrefabsBase {
    public readonly name_anim = {
        "greatdeal_idle": "greatdeal_idle",
        "greatdeal_run": "greatdeal_run",
        "greatdeal_run_to_idle": "greatdeal_run_to_idle",
        "starterpack": "starterpack",
        "starterpack_idle": "starterpack_idle"
    }

    protected onDisable(): void {
        this.StopAnim();
    }

    public async PlayAnimApearStarterPack() {
        this.PlayAnim(this.name_anim.starterpack, false);
        this.AddAnim(this.name_anim.starterpack_idle, true);
    }

    public async PlayAnimGreatDealPack() {
        this.ShowAnim();
        this.MEffect.node.position = new Vec3(-500, 0, 0);
        const opaCom = this.MEffect.getComponent(UIOpacity);
        opaCom.opacity = 0;
        let timeAnim = this.GetTimeAnim(this.name_anim.greatdeal_run);
        // console.log(timeAnim);
        let posAnim = tween(this.MEffect.node).to(timeAnim, { position: Vec3.ZERO });
        let opacityAnim = tween(this.MEffect.node).to(timeAnim - 0.1, {}, {
            onUpdate(target, ratio) {
                opaCom.opacity = 255 * ratio;
            },
        });

        tween(this.MEffect.node)
            .parallel(posAnim, opacityAnim)
            .start();
        this.PlayAnim(this.name_anim.greatdeal_run, false);
        this.AddAnim(this.name_anim.greatdeal_run_to_idle, false);
        this.AddAnim(this.name_anim.greatdeal_idle, true);
    }
}


