import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LightPassSpin')
export class LightPassSpin extends Component {
    public Appear() {
        this.node.scale = Vec3.ZERO;
        this.node.active = true;
        const timeScale: number = 0.2;
        tween(this.node)
            .to(timeScale, { scale: Vec3.ONE })
            .start();
    }

    public DisAppear() {
        this.node.scale = Vec3.ZERO;
        this.node.active = false;
    }
}


