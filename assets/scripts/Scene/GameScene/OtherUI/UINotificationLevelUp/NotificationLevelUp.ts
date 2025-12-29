import { _decorator, Component, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { ArrowNotificationAnim } from './ArrowNotificationAnim';
const { ccclass, property } = _decorator;

@ccclass('NotificationLevelUp')
export class NotificationLevelUp extends Component {
    @property(Node) nVisual: Node;
    @property(Node) nBannerWarning: Node;
    @property([ArrowNotificationAnim]) arrNode: ArrowNotificationAnim[] = [];
    private _wPosBase: Vec3 = Vec3.ZERO;

    protected onLoad(): void {
        this.nVisual.getComponent(UIOpacity).opacity = 0;
        this._wPosBase = this.nBannerWarning.worldPosition.clone();
    }

    public PrepareShow() {
        Tween.stopAllByTarget(this.nBannerWarning);

        this.arrNode.forEach(item => {
            item.PrepareShow();
        })

        this.nVisual.getComponent(UIOpacity).opacity = 0;
        this.nVisual.active = false;
    }

    private Hide() {
        this.nVisual.getComponent(UIOpacity).opacity = 0;
        this.nVisual.active = false;
    }

    public Show(timeAnim: number = 3) {
        const self = this;
        this.nVisual.active = true;
        return new Promise<void>(resolve => {
            tween(this.nBannerWarning)
                .to(timeAnim / 3, { worldPosition: this._wPosBase.clone().add3f(0, 50, 0) }, {
                    onUpdate(target, ratio) {
                        self.nVisual.getComponent(UIOpacity).opacity = 255 * ratio;
                    }
                })
                .call(async () => {
                    this.arrNode = Utils.shuffleList(this.arrNode);
                    for (let i = 0; i < this.arrNode.length; i++) {
                        this.arrNode[i].Show();
                        await Utils.delay(0.2 * 1000);
                    }
                })
                .delay((timeAnim - timeAnim / 3))
                .call(() => {
                    this.Hide();
                    resolve();
                })
                .start();
        })

    }
}


