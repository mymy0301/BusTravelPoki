import { _decorator, Component, Label, Node, ParticleSystem, Sprite, SpriteFrame, Tween, tween, UIOpacity, Vec2, Vec3 } from 'cc';
import { InfoBot_DashRush } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('VisualCarDashRush')
export class VisualCarDashRush extends Component {
    @property(Node) nNotification: Node;
    @property(Node) nLbNotifcation: Node;
    @property(Label) lbNotification: Label;
    @property(Sprite) spAvatar: Sprite;
    @property(Label) lbNameBot: Label;
    @property(Label) lbNameBot_shadow: Label;
    @property(ParticleSystem) particleSys: ParticleSystem;
    @property(Node) nPosSmoke: Node;
    private _timeShowNotification: number = 0.4;
    private _angelStart: number = 30;

    public PrepareMove(info: InfoBot_DashRush, startX: number) {
        Tween.stopAllByTarget(this.nNotification);
        Tween.stopAllByTarget(this.nLbNotifcation);
        Tween.stopAllByTarget(this.node);

        const self = this;

        // set value to default
        this.nNotification.active = false;
        this.nLbNotifcation.active = false;
        this.lbNotification.string = info.progress.toString();
        this.lbNameBot.string = info.name;
        this.lbNameBot_shadow.string = info.name;
        ResourceUtils.TryLoadImage(info.avatar, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == info.avatar && self.node != null && self.node.isValid) {
                self.spAvatar.spriteFrame = spriteFrame;
            }
        });

        this.nNotification.getComponent(UIOpacity).opacity = 0;
        this.nLbNotifcation.getComponent(UIOpacity).opacity = 0;
        this.nNotification.angle = this._angelStart;
        this.nLbNotifcation.angle = this._angelStart;

        const basePos = this.node.position.clone();
        this.node.position = new Vec3(startX, basePos.y, 0);

        this.particleSys.stop();
        this.particleSys.node.worldPosition = this.nPosSmoke.worldPosition.clone();
    }

    public MoveTo(endX: number, time: number) {
        // move car to the endX 
        const self = this;
        const posEnd = new Vec3(endX, this.node.position.clone().y);
        const openNotification = this.nNotification.getComponent(UIOpacity);
        const openNLbNotification = this.nLbNotifcation.getComponent(UIOpacity);
        this.nLbNotifcation.active = true;
        this.nNotification.active = true;
        this.particleSys.play();
        tween(this.node)
            .to(time, { position: posEnd }, {
                easing: "quadInOut",
                onUpdate(target, ratio) {
                    self.nLbNotifcation.worldPosition = self.nNotification.worldPosition.clone();
                    self.particleSys.node.worldPosition = self.nPosSmoke.worldPosition.clone();
                },
                onComplete(target) {
                    self.particleSys.stopEmitting();
                },
            })
            .call(() => {
                // after move done show the box noti
                tween(this.nNotification)
                    .parallel(
                        tween().to(this._timeShowNotification, { angle: 0 }, { easing: "backOut" }),
                        tween().to(this._timeShowNotification / 4, {}, {
                            easing: "backOut", onUpdate(target, ratio) {
                                openNotification.opacity = ratio * 255;
                            },
                        })
                    )
                    .start();
                tween(this.nLbNotifcation)
                    .parallel(
                        tween().to(this._timeShowNotification, { angle: 0 }, { easing: "backOut" }),
                        tween().to(this._timeShowNotification / 4, {}, {
                            easing: "backOut", onUpdate(target, ratio) {
                                openNLbNotification.opacity = ratio * 255;
                            },
                        })
                    )
                    .start();
            })
            .start()
    }

    public MoveByUpdate(endX: number, time: number, newProgress: number) {
        const self = this;
        const posEnd = new Vec3(endX, this.node.position.clone().y);
        const distanceCarMove = endX - this.node.position.x;
        const newPosOfLbNoti = this.nLbNotifcation.position.x + distanceCarMove;
        this.particleSys.play();

        tween(this.node)
            .to(time, { position: posEnd }, {
                easing: "quadInOut",
                onUpdate(target, ratio) {
                    self.nLbNotifcation.worldPosition = self.nNotification.worldPosition.clone();
                    self.particleSys.node.worldPosition = self.nPosSmoke.worldPosition.clone();
                },
                onComplete(target) {
                    self.particleSys.stopEmitting();
                },
            })
            .start();

        // after move done show the box noti
        tween(this.nLbNotifcation)
            .to(time, { position: new Vec3(newPosOfLbNoti, self.nLbNotifcation.position.y, 0) })
            .call(() => { this.lbNotification.string = newProgress.toString(); })
            .start();
    }
}


