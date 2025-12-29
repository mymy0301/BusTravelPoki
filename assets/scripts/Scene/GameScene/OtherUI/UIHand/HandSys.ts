import { _decorator, Component, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
const { ccclass, property } = _decorator;

@ccclass('HandSys')
export class HandSys extends Component {
    @property(Node) nHand: Node;
    @property(Node) nCircleTut: Node;

    protected onLoad(): void {
        if (this.nHand != null) this.nHand.active = false;
        if (this.nCircleTut != null) this.nCircleTut.active = false;
        clientEvent.on(MConst.EVENT_HAND.POINT_HAND_TO, this.pointHandToWPos, this);
        clientEvent.on(MConst.EVENT_HAND.HIDE_HAND, this.hideHand, this);
    }

    protected onDestroy(): void {
        if (this.nHand != null) {
            Tween.stopAllByTarget(this.nHand);
        }

        if (this.nCircleTut != null) {
            Tween.stopAllByTarget(this.nCircleTut);
        }
        clientEvent.off(MConst.EVENT_HAND.POINT_HAND_TO, this.pointHandToWPos, this);
        clientEvent.off(MConst.EVENT_HAND.HIDE_HAND, this.hideHand, this);
    }

    private pointHandToWPos(wPos: Vec3, timePoint: number = 0.8) {
        Tween.stopAllByTarget(this.nHand);
        this.nHand.active = false;
        const deviation = 20;
        const startWPos = wPos.clone().add3f(deviation, -deviation, 0);
        const endWPos = wPos.clone();
        this.nHand.setWorldPosition(startWPos);
        this.nHand.active = true;
        tween(this.nHand)
            .to(timePoint, { worldPosition: endWPos }, { easing: 'smooth' })
            .call(() => { this.AnimCircleTut(startWPos); })
            .to(timePoint, { worldPosition: startWPos }, { easing: 'smooth' })
            .union()
            .repeatForever()
            .start();
    }

    private hideHand() {
        this.nHand.active = false;
        Tween.stopAllByTarget(this.nHand);
    }


    private readonly maxOpa = 150;
    private readonly maxScaleCircle = new Vec3(4, 4, 4);
    private readonly timeCircleTut = 1;
    private readonly distance_circle_with_hand = new Vec3(-21.022, 32.348, 0);
    private AnimCircleTut(wPos: Vec3, customScaleCircleTut: Vec3 = this.maxScaleCircle, timeScale: number = this.timeCircleTut) {
        Tween.stopAllByTarget(this.nCircleTut);

        this.nCircleTut.setWorldPosition(wPos.clone().add(this.distance_circle_with_hand));

        this.nCircleTut.scale = new Vec3(0, 0, 0);
        const opa = this.nCircleTut.getComponent(UIOpacity);
        const self = this;
        this.nCircleTut.active = true;

        let tweenOpa_1 = tween(this.nCircleTut)
            .to(timeScale / 3, {}, {
                onUpdate(target, ratio) {
                    opa.opacity = self.maxOpa * ratio;
                },
            })
            .to(timeScale / 2, {}, {
                onUpdate(target, ratio) {
                    opa.opacity = self.maxOpa - self.maxOpa * ratio;
                },
            })

        tween(this.nCircleTut)
            .parallel(
                tween(this.nCircleTut).to(timeScale, { scale: customScaleCircleTut }, {
                    easing: 'quintOut',
                }),
                tweenOpa_1
            )
            .call(() => { this.nCircleTut.active = false; })
            .start();
    }
}


