import { _decorator, Component, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UINotiOnlyOneParking')
export class UINotiOnlyOneParking extends Component {
    @property(Node) nVisual: Node;
    private readonly timeMoveOn: number = 0.2;
    private readonly timeDelay: number = 0.8; // root 0.5
    private readonly timeMoveOut: number = 0.2;
    private readonly distanceMoveOn: number = -10;
    private readonly distanceMoveOut: number = 100;

    public HideVisual() {
        Tween.stopAllByTarget(this.nVisual);
        this.nVisual.active = false;
    }

    public ShowNoti(cb: CallableFunction) {
        // check if num parking slot is == 1
        // show noti
        const posMoveOn = new Vec3(0, this.distanceMoveOn, 0);
        const opaCom = this.nVisual.getComponent(UIOpacity);

        Tween.stopAllByTarget(this.nVisual);

        // show noti
        opaCom.opacity = 0;
        this.nVisual.position = posMoveOn;
        this.nVisual.active = true;


        tween(this.nVisual)
            .to(this.timeMoveOn, { position: Vec3.ZERO }, {
                easing: 'smooth',
                onUpdate(target, ratio) {
                    opaCom.opacity = 255 * ratio;
                },
            })
            .delay(this.timeDelay)
            .to(this.timeMoveOut, {}, {
                onUpdate(target, ratio) {
                    opaCom.opacity = 255 * (1 - ratio);
                },
            })
            .call(() => {
                this.nVisual.active = false;
                cb && cb();
            })
            .start();
    }
}


