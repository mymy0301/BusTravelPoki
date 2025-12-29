import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimCoinSys')
export class AnimCoinSys extends AnimPrefabsBase {
    public PlayAnimCoin() {
        this.PlayAnim("coin", true);
    }

    public SetOpaEffectToZero() {
        this.MEffect.node.getComponent(UIOpacity).opacity = 0;
    }

    public async ShowCoinWithOpacity(time: number) {
        return new Promise<void>(resolve => {
            const opaCom = this.MEffect.node.getComponent(UIOpacity);

            tween(this.MEffect.node)
                .to(time, {}, {
                    onUpdate(target, ratio) {
                        opaCom.opacity = 255 * ratio;
                    },
                })
                .call(() => { resolve(); })
                .start();
        })
    }
}


