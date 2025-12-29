/**
 * 
 * anhngoxitin01
 * Tue Oct 28 2025 10:39:03 GMT+0700 (Indochina Time)
 * AnimPumpkin
 * db://assets/scripts/Scene/GameScene/EffectPumpkins/AnimPumpkin.ts
*
*/
import { _decorator, AnimationComponent, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimPumpkin')
export class AnimPumpkin extends Component {
    @property(AnimationComponent) animCom: AnimationComponent;
    private readonly DISTANCE_ANIM_Y = 30;
    private readonly TIME: 0.5;

    private _cbOpenDone: CallableFunction = null;

    public Reset(wPos: Vec3) {
        this.node.worldPosition = wPos.clone().add3f(0, this.DISTANCE_ANIM_Y, 0);
        this.animCom.play("idle");
    }

    public async Play(cbDone: CallableFunction) {
        this.node.active = true;
        this._cbOpenDone = cbDone;
        this.animCom.play("open");
    }

    private DoneAnimOpen() {
        this._cbOpenDone && this._cbOpenDone();
        this._cbOpenDone = null;
    }
}