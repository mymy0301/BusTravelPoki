import { _decorator, CCFloat, CCInteger, Component, Node, tween, Tween, Vec3 } from 'cc';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { AUTO_SCALE_CUSTOM, TYPE_ANIM_AUTO_SCALE, TYPE_AUTO_SCALE } from './TypeAutoScale';
const { ccclass, property } = _decorator;

@ccclass('ReceiveAutoScale')
export class ReceiveAutoScale extends Component {
    @property({ group: { name: "CustomEffect", id: "CustomEffect" } }) needCustomEffect: boolean = false;
    @property({ group: { name: "CustomEffect", id: "CustomEffect" }, type: CCFloat, visible(this: ReceiveAutoScale) { return this.needCustomEffect; } }) timeScaleUp: number = 0.1;
    @property({ group: { name: "CustomEffect", id: "CustomEffect" }, type: CCFloat, visible(this: ReceiveAutoScale) { return this.needCustomEffect; } }) timeScaleDown: number = 0.1;
    @property({ group: { name: "CustomEffect", id: "CustomEffect" }, visible(this: ReceiveAutoScale) { return this.needCustomEffect; } }) scaleUp: Vec3 = new Vec3(1.1, 1.1, 1.1);
    @property({ group: { name: "CustomEffect", id: "CustomEffect" }, visible(this: ReceiveAutoScale) { return this.needCustomEffect; } }) scaleDown: Vec3 = new Vec3(1, 1, 1);
    @property({ type: TYPE_AUTO_SCALE }) typeAutoScale: TYPE_AUTO_SCALE = TYPE_AUTO_SCALE.BTN_BUILDING_LOBBY;

    @property(Node) nTargetScale: Node;
    @property({ type: TYPE_ANIM_AUTO_SCALE }) typeAnimAutoScale: TYPE_ANIM_AUTO_SCALE = TYPE_ANIM_AUTO_SCALE.KEEP_SCALE;
    @property(Vec3) baseScale: Vec3 = new Vec3(1, 1, 1);

    protected onEnable(): void {
        clientEvent.on(AUTO_SCALE_CUSTOM, this.scaleSelf, this);
    }

    protected onDisable(): void {
        clientEvent.off(AUTO_SCALE_CUSTOM, this.scaleSelf, this);
    }

    private scaleSelf(typeAutoScale: TYPE_AUTO_SCALE) {
        if (this.typeAutoScale != typeAutoScale) return;

        this.Scale(this.nTargetScale == null ? this.node : this.nTargetScale);
    }

    private Scale(target: Node) {
        switch (this.typeAnimAutoScale) {
            case TYPE_ANIM_AUTO_SCALE.KEEP_SCALE:
                Tween.stopAllByTarget(target);
                tween(target)
                    .to(this.timeScaleUp, { scale: this.scaleUp }, { easing: 'linear' })
                    .to(this.timeScaleDown, { scale: this.scaleDown }, { easing: 'linear' })
                    .union()
                    .repeat(2)
                    .start();
                break;
            case TYPE_ANIM_AUTO_SCALE.BASIC:
                Tween.stopAllByTarget(target);
                target.scale = this.baseScale;
                tween(target)
                    .to(this.timeScaleUp, { scale: this.scaleUp }, { easing: 'linear' })
                    .to(this.timeScaleDown, { scale: this.scaleDown }, { easing: 'linear' })
                    .start();
                break;
        }
    }
}


