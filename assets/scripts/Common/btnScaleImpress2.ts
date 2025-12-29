import { _decorator, CCBoolean, CCFloat, CCInteger, Component, Node, tween, Tween, Vec3 } from 'cc';
import { AniTweenSys } from '../Utils/AniTweenSys';
const { ccclass, property } = _decorator;

@ccclass('btnScaleImpress2')
export class btnScaleImpress2 extends Component {
    @property(CCFloat) timeScale: number = 0.3;
    @property(CCFloat) timeDelay: number = 1;
    @property(Vec3) scale_1: Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) scale_2: Vec3 = new Vec3(1.1, 1.1, 1.1);
    @property(CCFloat) angle_1: number = 10;
    @property(CCFloat) angle_2: number = 0;
    @property(CCFloat) angle_3: number = -10;
    @property(CCFloat) angle_4: number = 0;
    start() {
        this.node.active = true;
        this.node.scale = Vec3.ONE;

        tween(this.node)
            .to(this.timeScale, { scale: this.scale_2, angle: this.angle_1 })
            .to(this.timeScale, { scale: this.scale_1, angle: this.angle_2 })
            .to(this.timeScale, { scale: this.scale_2, angle: this.angle_3 })
            .to(this.timeScale, { scale: this.scale_1, angle: this.angle_4 })
            .delay(this.timeDelay)
            .union()
            .repeatForever()
            .start();
    }

    protected onDestroy(): void {
        AniTweenSys.StopTween(this.node);
    }
}


