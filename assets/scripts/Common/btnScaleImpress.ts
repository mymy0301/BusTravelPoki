import { _decorator, CCFloat, CCInteger, Component, Node, Tween, Vec3 } from 'cc';
import { AniTweenSys } from '../Utils/AniTweenSys';
const { ccclass, property } = _decorator;

@ccclass('btnScaleImpress')
export class btnScaleImpress extends Component {
    @property(CCFloat) timeScale: number = 0.75;
    @property(CCFloat) timeDelay: number = 0.3;
    @property(Vec3) scaleStart: Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) scaleEnd: Vec3 = new Vec3(1.1, 1.1, 1.1);

    start() {
        AniTweenSys.scaleBtnToImpress(this.node, this.timeScale, this.timeDelay, this.scaleStart, this.scaleEnd);
    }

    protected onDestroy(): void {
        AniTweenSys.StopTween(this.node);
    }
}


