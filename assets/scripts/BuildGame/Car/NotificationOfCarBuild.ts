import { _decorator, Component, Node, tween, Tween, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConstBuildGame } from '../MConstBuildGame';
const { ccclass, property } = _decorator;

@ccclass('NotificationOfCarBuild')
export class NotificationOfCarBuild {
    @property(Node) nNotification: Node;
    private IDCar: CallableFunction = null;

    onLoad(IDCar: CallableFunction): void {
        this.IDCar = IDCar;
        clientEvent.on(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_CAR_SAME_GROUP, this.NotificationSameGroup, this);
        clientEvent.on(MConstBuildGame.EVENT_BUILDING.SHOW_NOTIFICATION_CAR, this.ShowNotification, this);
        clientEvent.on(MConstBuildGame.EVENT_BUILDING.SHOW_NOTIFICATION_CAR_BLOCK, this.ShowNotificationBlockCar, this);
    }

    onDestroy(): void {
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_CAR_SAME_GROUP, this.NotificationSameGroup, this);
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.SHOW_NOTIFICATION_CAR, this.ShowNotification, this);
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.SHOW_NOTIFICATION_CAR_BLOCK, this.ShowNotificationBlockCar, this);
    }

    private NotificationSameGroup(listIdCarSameGroup: number[]) {
        // check if has id in there
        if (listIdCarSameGroup.indexOf(this.IDCar()) == -1) return;

        Tween.stopAllByTarget(this.nNotification);

        const timeShow: number = 2;
        this.nNotification.active = true;
        this.nNotification.scale = Vec3.ONE;
        tween(this.nNotification)
            .to(timeShow, { scale: Vec3.ZERO })
            .call(() => {
                this.nNotification.active = false;
                this.nNotification.scale = Vec3.ONE;
            })
            .start();
    }

    private ShowNotificationBlockCar(listIdCarBlock: number[]) {
        // check if has id in there
        if (listIdCarBlock.indexOf(this.IDCar()) == -1) return;

        Tween.stopAllByTarget(this.nNotification);

        const timeShow: number = 2;
        this.nNotification.active = true;
        this.nNotification.scale = Vec3.ONE;
        tween(this.nNotification)
            .to(timeShow, { scale: Vec3.ZERO })
            .call(() => {
                this.nNotification.active = false;
                this.nNotification.scale = Vec3.ONE;
            })
            .start();
    }

    private ShowNotification(idCar: number) {
        // console.log("call ", idCar);
        if (this.IDCar() != idCar) return;
        this.nNotification.active = true;
        this.nNotification.scale = Vec3.ONE;
    }

    public HideNotification() {
        this.nNotification.active = false;
    }
}


