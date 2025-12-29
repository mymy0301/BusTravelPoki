import { _decorator, Component, Label, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_ENDLESS_TREASURE } from './TypeEventEndlessTreasure';
const { ccclass, property } = _decorator;

@ccclass('NotificationET')
export class NotificationET extends Component {
    @property(Label) lbNotification: Label;
    @property(Node) bg: Node;

    protected onEnable(): void {
        this.bg.active = false;
        clientEvent.on(EVENT_ENDLESS_TREASURE.NOTIFICATION, this.LogNotificationNoBlock, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_ENDLESS_TREASURE.NOTIFICATION, this.LogNotificationNoBlock, this);
    }

    private LogNotificationNoBlock(notification: string) {
        if (notification == null || notification == '' || notification == undefined) {
            notification = notification;
        }
        this.lbNotification.string = notification;
        const opaCom = this.bg.getComponent(UIOpacity);

        // stop tween
        Tween.stopAllByTarget(this.bg);

        // set pos
        this.bg.active = true;
        this.bg.position = new Vec3(0, -100, 0);
        this.bg.active = this.lbNotification.node.active = true;
        opaCom.opacity = 0;

        tween(this.bg)
            .to(0.3, { position: Vec3.ZERO }, {
                easing: 'smooth',
                onUpdate(target, ratio) {
                    opaCom.opacity = ratio * 255;
                },
            })
            .delay(2)
            .to(0.3, {}, {
                onUpdate(target, ratio) {
                    opaCom.opacity = (1 - ratio) * 255;
                },
            })
            .call(() => { this.bg.active = false })
            .start();
    }
}


