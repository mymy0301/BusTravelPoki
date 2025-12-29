import { _decorator, Component, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('Anim_hand')
export class Anim_hand extends AnimPrefabsBase {
    private readonly anim1 = `hand1`;
    private readonly anim2 = `hand2`;
    private readonly timeDelay = 0.5;

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_HAND.POINT_HAND_TO, this.pointHandToWPos, this);
        clientEvent.on(MConst.EVENT_HAND.HIDE_HAND, this.hideHand, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_HAND.POINT_HAND_TO, this.pointHandToWPos, this);
        clientEvent.off(MConst.EVENT_HAND.HIDE_HAND, this.hideHand, this);
    }

    private pointHandToWPos(wPos: Vec3, timePoint: number = 0.8, useOpacity: boolean = false) {
        const opaCom = this.MEffect.getComponent(UIOpacity);
        opaCom.opacity = !useOpacity ? 255 : 0;

        this.node.worldPosition = wPos;

        Tween.stopAllByTarget(opaCom);

        if (useOpacity) {
            tween(opaCom)
                .to(0.5, { opacity: 255 })
                .start();
        }

        this.PlayAnimLoopWithDelay(this.anim1, this.timeDelay, true);
    }

    private hideHand() {
        this.HideAnim();
    }
}


