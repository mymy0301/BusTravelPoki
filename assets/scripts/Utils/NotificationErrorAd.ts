import { _decorator, Component, Label, Node, Tween, tween, Vec3 } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import * as i18n from 'db://i18n/LanguageData';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('NotificationErrorAd')
export class NotificationErrorAd extends Component {
    @property(Label) lbNotification: Label;
    @property(Node) bg: Node;
    @property(Node) block: Node;


    protected start(): void {
        this.node.active = false;
        clientEvent.on(MConst.FB_SHOW_NOTIFICATION, this.LogNotification, this);
        clientEvent.on(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, this.LogNotificationNoBlock, this);
        clientEvent.on(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, this.NotificationInGame, this);
        clientEvent.on(MConst.FB_CLEAR_ALL_NOTI, this.ClearAllNoti, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.FB_SHOW_NOTIFICATION, this.LogNotification, this);
        clientEvent.off(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, this.LogNotificationNoBlock, this);
        clientEvent.off(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, this.NotificationInGame, this);
        clientEvent.off(MConst.FB_CLEAR_ALL_NOTI, this.ClearAllNoti, this);
    }

    private LogNotification(notification: string) {
        if (notification == null || notification == '' || notification == undefined) {
            notification = 'No ads are available right \nnow. Please try again later.';
        }
        this.lbNotification.string = notification;

        // stop tween
        Tween.stopAllByTarget(this.bg);

        // set pos
        this.node.active = true;
        this.bg.scale = Vec3.ZERO;
        this.bg.position = new Vec3(0, 300, 0);
        this.bg.active = this.lbNotification.node.active = this.block.active = true;

        tween(this.bg)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'smooth' })
            .delay(1)
            .to(0.3, { position: new Vec3(0, 1000) }, { easing: 'sineIn' })
            .call(() => { this.node.active = false })
            .start();
    }

    private LogNotificationNoBlock(notification: string) {
        if (notification == null || notification == '' || notification == undefined) {
            notification = i18n.t("NOTI_NO_AD");
        }
        this.lbNotification.string = notification;

        // stop tween
        Tween.stopAllByTarget(this.bg);

        // set pos
        this.node.active = true;
        this.bg.scale = Vec3.ZERO;
        this.bg.position = new Vec3(0, 300, 0);
        this.bg.active = this.lbNotification.node.active = true;
        this.block.active = false;

        tween(this.bg)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'smooth' })
            .delay(1)
            .to(0.3, { position: new Vec3(0, 1000) }, { easing: 'sineIn' })
            .call(() => { this.node.active = false })
            .start();
    }

    private NotificationInGame(notification: string) {
        if (notification == null || notification == '' || notification == undefined) {
            notification = i18n.t("NOTI_NO_AD");
        }
        this.lbNotification.string = notification;

        // stop tween
        Tween.stopAllByTarget(this.bg);

        // set pos
        this.node.active = true;
        this.bg.scale = new Vec3(1, 0, 0);
        this.bg.active = this.lbNotification.node.active = true;
        this.block.active = false;

        // get the height screen game
        let truePosWantToShow = 209 * Utils.getRightScaleSizeWindow(); // 257 là khoảng cách đo được trong game ở màn 720x1280
        this.bg.position = new Vec3(0, truePosWantToShow, 0);

        tween(this.bg)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'smooth' })
            .delay(1)
            .to(0.3, { scale: new Vec3(1, 0, 0) }, { easing: 'sineIn' })
            .call(() => { this.node.active = false })
            .start();
    }

    private ClearAllNoti() {
        this.node.active = false;
    }
}