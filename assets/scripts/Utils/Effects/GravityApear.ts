import { _decorator, CCFloat, Component, Node, Sprite, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from '../Utils';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('GravityApear')
@requireComponent(UIOpacity)
@disallowMultiple
export class GravityApear extends Component {
    @property(CCFloat) private speedApear: number = 1;
    @property(CCFloat) private speedInGravity: number = 2;
    @property(CCFloat) private distanceYPoint1: number = -100;
    @property(CCFloat) private distanceYPoint2: number = 50;
    @property(CCFloat) private distanceYPoint3: number = -50;

    private _basePos: Vec3 = null;

    protected onLoad(): void {
        this._basePos = this.node.position.clone();
    }

    protected onEnable(): void {
        this.stopTween();
        this.node.getComponent(UIOpacity).opacity = 0;
        const OpaCom = this.node.getComponent(UIOpacity);
        const posPoint1 = this._basePos.clone().add3f(0, this.distanceYPoint1, 0);
        const posPoint2 = this._basePos.clone().add3f(0, this.distanceYPoint2, 0);
        const posPoint3 = this._basePos.clone().add3f(0, this.distanceYPoint3, 0);
        this.node.position = posPoint1;
        tween(this.node)
            .to(this.speedApear, { position: posPoint2 }, {
                easing: 'smooth', onUpdate(target, ratio) {
                    OpaCom.opacity = 255 * ratio;
                },
            })
            .call(() => {
                tween(this.node)
                    .to(this.speedInGravity, { position: posPoint3 }, { easing: 'smooth' })
                    .to(this.speedInGravity, { position: posPoint2 }, { easing: 'smooth' })
                    .union()
                    .repeatForever()
                    .start();
            })
            .start();
    }

    protected onDisable(): void {
        this.stopTween();
    }

    protected onDestroy(): void {
        this.stopTween();
    }

    private stopTween() {
        Tween.stopAllByTarget(this.node);
    }
}


