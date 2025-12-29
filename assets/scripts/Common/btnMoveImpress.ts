import { _decorator, CCFloat, CCInteger, Component, Node, tween, Tween, Vec3 } from 'cc';
import { AniTweenSys } from '../Utils/AniTweenSys';
const { ccclass, property } = _decorator;

@ccclass('btnMoveImpress')
export class btnMoveImpress extends Component {
    @property(CCFloat) timeMove : number = 0.3;
    @property(CCFloat) timeDelay : number = 0;
    @property(CCFloat) distanceMoveUp: number = 0;
    start() {
        this.node.active = true;
        this.node.scale = Vec3.ONE;
        const pos = this.node.position.clone();

        tween(this.node)
            .to(this.timeMove, { position: pos.clone().add3f(0,this.distanceMoveUp, 0) })
            .to(this.timeMove, { position: pos })
            .delay(this.timeDelay)
            .union()
            .repeatForever()
            .start();        
    }

    protected onDestroy(): void {
        AniTweenSys.StopTween(this.node);
    }
}


