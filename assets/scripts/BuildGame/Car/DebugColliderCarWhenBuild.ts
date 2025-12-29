import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, PolygonCollider2D, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConstBuildGame } from '../MConstBuildGame';
import { DIRECT_CAR, GROUP_COLLIDER, M_COLOR } from '../../Utils/Types';
import { UINotificationCarCollingBuild } from '../UI/UINotificationCarCollingBuild';
import { BuildCar } from './BuildCar';
import { InfoCustomForColliderCar } from '../../Scene/GameScene/Logic/InfoCustomForColliderCar';
import { MConfigs } from '../../Configs/MConfigs';
import { CustomRayCastCheck } from '../../Utils/CustomRayCastCheck';
import { MyDrawSys } from '../../Utils/MyDrawSys';
const { ccclass, property } = _decorator;

@ccclass('DebugColliderCarWhenBuild')
export class DebugColliderCarWhenBuild {
    @property(PolygonCollider2D) polygonColliderCheck: PolygonCollider2D;
    private _listIdCarColliding: number[] = [];
    private _listIdDefaultColliding: number[] = [];
    private _cbGetCarSize: CallableFunction = null;
    private _cbGetCarDirect: CallableFunction = null;
    private _cbGetCarMColor: () => M_COLOR = null;
    private _nCar: Node;

    public registerColliderCheck(nCar: Node, cbGetCarSize: CallableFunction, cbGetCarDirect: CallableFunction, cbGetCarMColor: () => M_COLOR) {
        // reset data
        this._listIdCarColliding = [];
        this._listIdDefaultColliding = [];

        // register event
        this.polygonColliderCheck.on(Contact2DType.BEGIN_CONTACT, this.EmitCarColliding, this);
        this.polygonColliderCheck.on(Contact2DType.END_CONTACT, this.EmitCarNotCollinding, this);

        this._nCar = nCar;
        this._cbGetCarSize = cbGetCarSize;
        this._cbGetCarDirect = cbGetCarDirect;
        this._cbGetCarMColor = cbGetCarMColor;
    }

    public unRegisterColliderCheck() {
        this.polygonColliderCheck.off(Contact2DType.BEGIN_CONTACT, this.EmitCarColliding, this);
        this.polygonColliderCheck.off(Contact2DType.END_CONTACT, this.EmitCarNotCollinding, this);
    }

    private EmitCarColliding(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        try {
            switch (otherCollider.group) {
                case GROUP_COLLIDER.CAR:
                    // emit to show notification collingCar
                    const idCarCollider: number = otherCollider.node.getComponent(BuildCar).IDCar;
                    this._listIdCarColliding.push(idCarCollider);
                    clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.SHOW_NOTIFICATION_CAR, idCarCollider);
                    break;
                case GROUP_COLLIDER.DEFAULT:
                    //NOTE add id collider obj default in listIdCollingDefault
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    private EmitCarNotCollinding(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        try {
            switch (otherCollider.group) {
                case GROUP_COLLIDER.CAR:
                    const indexIdCarCollinding: number = this._listIdCarColliding.indexOf(otherCollider.node.getComponent(BuildCar).IDCar);
                    if (indexIdCarCollinding >= 0) {
                        this._listIdCarColliding.splice(this._listIdCarColliding.indexOf(otherCollider.node.getComponent(BuildCar).IDCar), 1);
                    }
                    if (this._listIdCarColliding.length == 0 && this._listIdDefaultColliding.length == 0) {
                        selfCollider.getComponent(BuildCar).notificationOfCarBuild.HideNotification();
                    }
                    break;
            }
        } catch (e) {
            console.log(e);
        }
        //NOTE check with default object more
    }

    public ShoutRayCastCheckCarBlock() {
        const wPosRoot: Vec3 = this._nCar.worldPosition.clone();
        CheckWhichCarBlockForward(InfoCustomForColliderCar.GetTopPointLeft(this._cbGetCarSize(), this._cbGetCarDirect(), 1, this._cbGetCarMColor()), this._cbGetCarDirect(), wPosRoot)
        CheckWhichCarBlockForward(InfoCustomForColliderCar.GetTopPointRight(this._cbGetCarSize(), this._cbGetCarDirect(), 1, this._cbGetCarMColor()), this._cbGetCarDirect(), wPosRoot)
        CheckWhichCarBlockForward(InfoCustomForColliderCar.GetTopPointMidCar(this._cbGetCarSize(), this._cbGetCarDirect(), this._cbGetCarMColor()), this._cbGetCarDirect(), wPosRoot)
    }
}


function CheckWhichCarBlockForward(pointStartFromRoot: Vec3, directionCar: DIRECT_CAR, wPosRoot: Vec3) {
    const resultAfterRayCast: { wPointStart, listWPosEnd, listNCollider } = ShoutRayCast(pointStartFromRoot, directionCar, wPosRoot);

    // draw line check
    MyDrawSys.Instance.DrawLineWithTimeDisplay(resultAfterRayCast.wPointStart, resultAfterRayCast.listWPosEnd);

    let listIdBlockCar: number[] = [];
    for (const blockCar of resultAfterRayCast.listNCollider) {
        if (blockCar != null) {
            if (blockCar.getComponent(BuildCar) != null) {
                // check car has id is not moving to the park
                listIdBlockCar.push(blockCar.getComponent(BuildCar).IDCar)
            }
            // if (blockCar.getComponent(GarageSys) != null) {
            //     return false;
            // }
            // if (blockCar.getComponent(ConveyorBeltSys) != null) {
            //     return false;
            // }
        }
    }

    if (listIdBlockCar.length > 0) {
        clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.SHOW_NOTIFICATION_CAR_BLOCK, listIdBlockCar);
    }
}

function ShoutRayCast(pointStartFromRoot: Vec3, directionCar: DIRECT_CAR, wPosRoot: Vec3): { wPointStart: Vec3, listWPosEnd: Vec3[], listNCollider: Node[] } {
    const wPointStart: Vec3 = pointStartFromRoot.clone().add(wPosRoot);
    const distance: number = 500;
    const cscAngleMove: number = 1 / Math.cos(MConfigs.angleCarMove * Math.PI / 180);
    const secAngleMove: number = 1 / Math.sin(MConfigs.angleCarMove * Math.PI / 180);
    let wPointEnd: Vec3 = Vec3.ZERO;
    switch (directionCar) {
        case DIRECT_CAR.TOP: wPointEnd = wPointStart.clone().add3f(0, distance, 0); break;
        case DIRECT_CAR.LEFT: wPointEnd = wPointStart.clone().add3f(-distance, 0, 0); break;
        case DIRECT_CAR.RIGHT: wPointEnd = wPointStart.clone().add3f(distance, 0, 0); break;
        case DIRECT_CAR.BOTTOM: wPointEnd = wPointStart.clone().add3f(0, -distance, 0); break;
        case DIRECT_CAR.TOP_LEFT:
            wPointEnd = wPointStart.clone().add3f(-distance * secAngleMove, distance * cscAngleMove, 0);
            break;
        case DIRECT_CAR.BOTTOM_LEFT:
            wPointEnd = wPointStart.clone().add3f(-distance * secAngleMove, -distance * cscAngleMove, 0);
            break;
        case DIRECT_CAR.TOP_RIGHT:
            wPointEnd = wPointStart.clone().add3f(distance * secAngleMove, distance * cscAngleMove, 0);
            break;
        case DIRECT_CAR.BOTTOM_RIGHT:
            wPointEnd = wPointStart.clone().add3f(distance * secAngleMove, -distance * cscAngleMove, 0);
            break;
    }

    let listCarBlock: Node[] = CustomRayCastCheck.CheckAllCarBlockInBuild(wPointStart.clone(), wPointEnd.clone());

    return { wPointStart: wPointStart, listWPosEnd: [wPointEnd], listNCollider: listCarBlock };
}


