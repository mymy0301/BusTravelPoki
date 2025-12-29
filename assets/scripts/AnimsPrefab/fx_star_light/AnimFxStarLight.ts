import { _decorator, Component, Node, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { AnimPrefabsBase } from '../AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimFxStarLight')
export class AnimFxStarLight extends AnimPrefabsBase {
    private _isPlayOnce = false;

    public PrepareAnim() {

        const opa = this.MEffect.getComponent(UIOpacity);
        if (opa == null) { return; }

        opa.opacity = 0;
    }

    public PlayAnimLightWithStarWithOpacity() {
        const opa = this.MEffect.getComponent(UIOpacity);
        if (opa == null) { return; }

        opa.opacity = 20;
        this.node.scale = new Vec3(0.5, 0.5, 0.5);
        tween(this.node)
            .to(0.2, { scale: new Vec3(3, 3, 3) })
            .start()

        tween(opa)
            .to(0.2, { opacity: 255 })
            .start();

        if (!this._isPlayOnce) {
            this.PlayAnim('light_star', true);
            this._isPlayOnce = true;
        }
    }

    public PlayAnimLightWithStarWithOpacity_2(timeAnim: number = 0.2) {
        const opa = this.MEffect.getComponent(UIOpacity);
        if (opa == null) { return; }

        opa.opacity = 20;
        this.PlayAnim('light_star', true);

        tween(opa)
            .to(timeAnim, { opacity: 255 })
            .start();
    }
}


