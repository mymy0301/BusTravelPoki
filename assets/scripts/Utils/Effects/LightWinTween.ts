import { _decorator, CCFloat, Color, Component, Node, Sprite, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LightWinTween')
export class LightWinTween extends Component {
    @property(CCFloat) timeTransparent: number = 0.5;
    @property(CCFloat) distanceRatio: number = 100;
    @property(CCFloat) private speedRotate: number = 3;
    @property(Vec3) private eulerAngles: Vec3 = new Vec3(0, 0, -90);

    protected onDestroy(): void {
        Tween.stopAllByTarget(this.node);
    }

    public TransParent() {
        Tween.stopAllByTarget(this.node);

        const self = this;
        this.node.getComponent(Sprite).color = new Color(255, 255, 255, 255);
        tween(this.node)
            .parallel(
                tween().by(this.speedRotate, { eulerAngles: this.eulerAngles }),
                tween().sequence(
                    tween().to(this.timeTransparent, {}, {
                        onUpdate(target, ratio) {
                            self.node.getComponent(Sprite).color = new Color(255, 255, 255, 255 - self.distanceRatio * ratio);
                        },
                    }),
                    tween().to(this.timeTransparent, {}, {
                        onUpdate(target, ratio) {
                            self.node.getComponent(Sprite).color = new Color(255, 255, 255, (255 - self.distanceRatio) + self.distanceRatio * ratio);
                        },
                    })
                )
            )
            .union()
            .repeatForever()
            .start();
    }
}


