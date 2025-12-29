import { _decorator, Component, Node, Tween, tween, UIOpacity, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ArrowNotificationAnim')
export class ArrowNotificationAnim extends Component {
    private _wPosBase: Vec3 = Vec3.ZERO;

    protected onLoad(): void {
        this._wPosBase = this.node.getWorldPosition().clone();
    }

    public PrepareShow() {
        Tween.stopAllByTarget(this.node);
        this.node.getComponent(UIOpacity).opacity = 0;
        if (this._wPosBase != Vec3.ZERO) {
            this.node.worldPosition = this._wPosBase.clone();
        }
    }

    public Show(timeAnim: number = 1) {
        const self = this;
        tween(this.node)
            .parallel(
                tween(this.node).to(timeAnim, { worldPosition: this._wPosBase.clone().add3f(0, 100, 0) }),
                tween(this.node).to(timeAnim / 2, {}, {
                    onUpdate(target, ratio) {
                        self.node.getComponent(UIOpacity).opacity = 255 * ratio;
                    }
                })
            )
            .delay(timeAnim / 4)
            .to(timeAnim / 2, {}, {
                onUpdate(target, ratio) {
                    self.node.getComponent(UIOpacity).opacity = 255 * (1 - ratio);
                }
            })
            .start()
    }
}


