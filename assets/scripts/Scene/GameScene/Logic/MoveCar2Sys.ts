import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, game, IPhysics2DContact, log, Node, PhysicsSystem2D, PolygonCollider2D, RigidBody2D, tween, Tween, UITransform, Vec2, Vec3 } from 'cc';
import { DIRECT_CAR, GameSoundEffect, GROUP_COLLIDER, IInfoWPosMoveCar, STATE_CAR, TAG_COLLIDER } from '../../../Utils/Types';
import { RoadSys } from './Road/RoadSys';
import { HoldPlaceCarSys } from './HoldPlaceCarSys';
import { ConveyorBeltSys } from './ConveyorBelt/ConveyorBeltSys';
import { MConfigs } from '../../../Configs/MConfigs';
import { GarageSys } from './GarageMini/GarageSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { SoundSys } from '../../../Common/SoundSys';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { ParkingCarSys } from './ParkingCarSys';
import { Utils } from '../../../Utils/Utils';
import { ColliderGaraSys } from './GarageMini/ColliderGaraSys';
const { ccclass, property } = _decorator;

@ccclass('MoveCar2Sys')
export class MoveCar2Sys {
    @property(PolygonCollider2D) polygonCheckCar: PolygonCollider2D;
    @property(RigidBody2D) rigiCar: RigidBody2D;
    @property(BoxCollider2D) boxCheckRoad: BoxCollider2D;
    private listSavePoint: IInfoWPosMoveCar[] = [];
    private indexSavePointMove: number = 0;
    private _wPosParking: Vec3 = Vec3.ONE;
    private _nParkingCar: Node = null;
    private _nCar: Node = null;

    private _cbUpdateVisualCar: CallableFunction = null;
    private _cbAfterMoveToTheGoal: CallableFunction = null;
    private _cbAfterMoveBackDone: CallableFunction = null;
    private _cbWhenCollider: CallableFunction = null;
    private _cbGetIdCar: CallableFunction = null;
    private _cbTurnOnParkingLeft: CallableFunction = null;
    private _cbGetIdConveyorBelt: CallableFunction = null;
    private _cbGetIdGarage: CallableFunction = null;
    private _cbCheckCarCanMoveThroughByIdCar: CallableFunction = null;
    private _cbUpdateVisualCarPrepareMoveToGate: CallableFunction = null;
    private _cbGetNumChildInGround: CallableFunction = null;
    private _cbUnlockCarKeyAndLock: CallableFunction = null;

    private _directionNow: DIRECT_CAR = DIRECT_CAR.BOTTOM;
    private _directCarWhenStart: DIRECT_CAR = DIRECT_CAR.TOP;
    private _priorityRoadNow: number = 999;
    private _idParking: number = 999;

    protected onDestroy(): void {
        this.unListenCollider();
    }

    public Init(cbUpdateVisualCar: CallableFunction, cbGetIdCar: CallableFunction, cbGetIdConveyorBelt: CallableFunction,
        cbGetIdGarage: CallableFunction, cbCheckCarCanMoveThroughByIdCar: CallableFunction, cbTurnOnParkingLeft: CallableFunction
        , cbUpdateVisualCarPrepareMoveToGate: CallableFunction, _cbGetNumChildInGround: CallableFunction, _cbUnlockCarKeyAndLock: CallableFunction
    ) {
        this._cbUpdateVisualCar = cbUpdateVisualCar;
        this._cbGetIdCar = cbGetIdCar;
        this._cbGetIdConveyorBelt = cbGetIdConveyorBelt;
        this._cbGetIdGarage = cbGetIdGarage;
        this._cbCheckCarCanMoveThroughByIdCar = cbCheckCarCanMoveThroughByIdCar;
        this._cbTurnOnParkingLeft = cbTurnOnParkingLeft;
        this._cbUpdateVisualCarPrepareMoveToGate = cbUpdateVisualCarPrepareMoveToGate;
        this._cbGetNumChildInGround = _cbGetNumChildInGround;
        this._cbUnlockCarKeyAndLock = _cbUnlockCarKeyAndLock;
    }

    public ResetData(needCallStopCar: boolean = true) {
        this.listSavePoint = [];
        this.indexSavePointMove = 0;
        if (needCallStopCar) {
            this.StopCar();
        }
    }

    private GetVec2SuitWithDirectCar(directCar: DIRECT_CAR): Vec2 {
        let angle = MConfigs.angleCarMove * Math.PI / 180;

        switch (directCar) {
            case DIRECT_CAR.BOTTOM: return new Vec2(0, -1);
            case DIRECT_CAR.TOP: return new Vec2(0, 1);
            case DIRECT_CAR.LEFT: return new Vec2(-1, 0);
            case DIRECT_CAR.RIGHT: return new Vec2(1, 0);
            case DIRECT_CAR.BOTTOM_LEFT: return new Vec2(-1, - Math.tan(angle));
            case DIRECT_CAR.BOTTOM_RIGHT: return new Vec2(1, - Math.tan(angle));
            case DIRECT_CAR.TOP_LEFT: return new Vec2(-1, Math.tan(angle));
            case DIRECT_CAR.TOP_RIGHT: return new Vec2(1, Math.tan(angle));
        }
    }

    private GetRevertDirectCar(directCar: DIRECT_CAR): DIRECT_CAR {
        switch (directCar) {
            case DIRECT_CAR.BOTTOM: return DIRECT_CAR.TOP;
            case DIRECT_CAR.TOP: return DIRECT_CAR.BOTTOM;
            case DIRECT_CAR.LEFT: return DIRECT_CAR.RIGHT;
            case DIRECT_CAR.RIGHT: return DIRECT_CAR.LEFT;
            case DIRECT_CAR.BOTTOM_LEFT: return DIRECT_CAR.TOP_RIGHT;
            case DIRECT_CAR.BOTTOM_RIGHT: return DIRECT_CAR.TOP_LEFT;
            case DIRECT_CAR.TOP_LEFT: return DIRECT_CAR.BOTTOM_RIGHT;
            case DIRECT_CAR.TOP_RIGHT: return DIRECT_CAR.BOTTOM_LEFT;
        }
    }

    //#region func set callback
    public UpdateCallBackMove(cbAfterMoveBackDone, cbAfterMoveToTheGoal, cbWhenCollider) {
        this._cbAfterMoveBackDone = cbAfterMoveBackDone;
        this._cbAfterMoveToTheGoal = cbAfterMoveToTheGoal;
        this._cbWhenCollider = cbWhenCollider;
    }
    //#endregion func set callback

    //#region public func
    public registerListenCollider() {
        this.polygonCheckCar.on(Contact2DType.BEGIN_CONTACT, this.StopCarAndMoveBack, this);
        this.boxCheckRoad.on(Contact2DType.BEGIN_CONTACT, this.ChangeDirectionCar, this);
    }

    public registerListenColliderWithoutCheckAnotherCar() {
        this.boxCheckRoad.on(Contact2DType.BEGIN_CONTACT, this.ChangeDirectionCar, this);
    }

    public registerListenColliderWithoutCheckRoad() {
        this.polygonCheckCar.on(Contact2DType.BEGIN_CONTACT, this.StopCarAndMoveBack, this);
    }

    public unListenCollider() {
        this.polygonCheckCar.off(Contact2DType.BEGIN_CONTACT, this.StopCarAndMoveBack, this);
        this.boxCheckRoad.off(Contact2DType.BEGIN_CONTACT, this.ChangeDirectionCar, this);
    }

    public unListColliderWithAnotherCar() {
        this.polygonCheckCar.off(Contact2DType.BEGIN_CONTACT, this.StopCarAndMoveBack, this);
    }

    public SetNParkingCar(nParkingCar: Node) { this._nParkingCar = nParkingCar; }

    public async MoveToTheParking(nMove: Node, directCar: DIRECT_CAR, wPosParking: Vec3, nParkingCar: Node, idParking: number) {

        // reset list savePoint
        this._nCar = nMove;
        this._wPosParking = wPosParking;
        this._nParkingCar = nParkingCar;
        this.ResetData(false);
        this._priorityRoadNow = 999;
        this._idParking = idParking;
        this._directionNow = directCar;

        // add savePoint to move back
        let savePoint: IInfoWPosMoveCar = {
            wPos: this._nCar.worldPosition.clone(),
            directionMoveToPos: directCar
        }
        this.listSavePoint.push(savePoint);

        // move the car
        let vecMove: Vec2 = this.GetVec2SuitWithDirectCar(directCar);
        let powerMove: Vec2 = vecMove.clone().multiplyScalar(MConfigs.SPEED_MOVE_CAR);
        this.rigiCar.linearVelocity = powerMove;

        this.boxCheckRoad.enabled = false;
        this.boxCheckRoad.enabled = true;
    }

    /**
     * This code was deprecated, please use EffectHelicopterSys
     * @param nMove 
     * @param wPosVipParking 
     * @param timeRotate 
     * @param timeMove 
     * @returns 
     * @deprecated
     */
    public MoveToVipParking(nMove: Node, wPosVipParking: Vec3, timeRotate: number, timeMove: number) {
        this._nCar = nMove;
        Tween.stopAllByTarget(this._nCar);
        return new Promise<void>(resolve => {
            tween(this._nCar)
                .to(timeMove, { worldPosition: wPosVipParking })
                .call(() => {
                    resolve();
                })
                .start();
        })
    }

    public async TransferPassengers(nCarMove: Node, wPosParkingOut: Vec3, wPosMoveToGate: Vec3[]) {
        // in this case we just move to the road than move to the right to reach gate => you can check to suit with each level , you can add json for each level to transfer
        //================================== PREPARE MOVE CAR ================================
        // First move car to wPos prepare to transfer passenger 
        // Second move car to wPos Gate

        // stop all the tween
        Tween.stopAllByTarget(nCarMove);
        this._nCar = nCarMove;
        this.listSavePoint = [];

        //C1:
        // this.listSavePoint.push({ wPos: wPosParkingOut, directionMoveToPos: DIRECT_CAR.BOTTOM_RIGHT })

        //C2
        await this.MoveOutParking();

        this._cbUpdateVisualCarPrepareMoveToGate();

        for (let i = 0; i < wPosMoveToGate.length; i++) {
            this.listSavePoint.push({ wPos: wPosMoveToGate[i], directionMoveToPos: DIRECT_CAR.RIGHT });
        }
        this.listSavePoint.reverse();
        this.indexSavePointMove = this.listSavePoint.length - 1;
        await this.MoveCarBackPreviousSavePoint(false);
    }
    //#endregion public func

    /**
     * this func used to move the ParkingPlace
     */
    private async MoveToTheLastPoint() {
        const nCar = this.polygonCheckCar.node;
        const speedCar: number = this.GetVec2SuitWithDirectCar(this._directionNow).multiplyScalar(MConfigs.SPEED_MOVE_CAR).lengthSqr();
        const wPosCarNow: Vec3 = nCar.worldPosition.clone();
        const dataCarMoveToParking = this._nParkingCar.getComponent(ParkingCarSys).GetListNodeAndAngleForCarMoveIn(wPosCarNow, this._directionNow);
        const timeMoveToPrepareParking: number = Vec3.distance(this._nCar.worldPosition.clone(), dataCarMoveToParking.listVec3[0]) / speedCar;
        const timeCarCrab: number = Vec3.distance(dataCarMoveToParking.listVec3[0], dataCarMoveToParking.listVec3[dataCarMoveToParking.listVec3.length - 1]) / speedCar;
        /* time Rotate To Right Angle When Moving To The Prepare Point Parking */
        const timeR: number = timeMoveToPrepareParking / 3;

        //call cb can unlock the car key and lock
        this._cbUnlockCarKeyAndLock();


        // chỉ update trong trường hợp left và right còn top thì không
        switch (dataCarMoveToParking.fromDirection) {
            case DIRECT_CAR.TOP:
                break;
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                this._cbUpdateVisualCar(this._directionNow, false);
                break;
        }

        // move to the prepare point
        // if (this._directionNow == DIRECT_CAR.RIGHT) {
        //    nCar.angle = angleWhenRotate;
        // } else if (this._directionNow == DIRECT_CAR.LEFT) {
        //    nCar.angle = -angleWhenRotate;
        // }
        await new Promise<void>(resolve => {
            tween(this.polygonCheckCar.node)
                .parallel(
                    tween().to(timeR, { angle: 0 }),
                    tween().to(timeMoveToPrepareParking, { worldPosition: dataCarMoveToParking.listVec3[0] })
                )
                .call(resolve)
                .start();
        })

        // change the visual car
        nCar.angle = 0;

        // gen time carCrab Left => remember the length of listVec3 is 10 and you need to gen same length with list time
        const spB = timeCarCrab / dataCarMoveToParking.listVec3.length;
        // const spB = 1;
        let stepIncreaseSpeed: number = 0;
        let listTimeCrab: number[] = [];
        for (let i = 0; i < dataCarMoveToParking.listVec3.length; i++) {
            listTimeCrab.push(spB + i * stepIncreaseSpeed);
        }

        /**
         * ================= Check in case TOP you use a type of move ===================
         * ================= In Left\Right you use Beizer move ==========================
         * 
         * 
         */

        switch (dataCarMoveToParking.fromDirection) {
            case DIRECT_CAR.TOP:
                listTimeCrab = [];
                // ở đây chỉ có 3 frame di chuyển xe thôi, xin hãy đọc thêm code trong function GetListNodeAndAngleForCarMoveIn để hiểu thêm tiến trình
                let listTween = [];
                // bật âm thanh xe phanh
                // SoundSys.Instance.playSoundEffect(GameSoundEffect.BRAKE_CAR);
                // thay frame ảnh xe mở nắp
                this._cbUpdateVisualCar(DIRECT_CAR.TOP_LEFT, true);

                // khởi tạo danh sách tween di chuyển
                for (let i = 0; i < dataCarMoveToParking.listVec3.length; i++) {
                    // tính thời gian
                    let timeTween = spB;
                    if (i < dataCarMoveToParking.listVec3.length - 1) {
                        timeTween = Vec3.distance(dataCarMoveToParking.listVec3[i], dataCarMoveToParking.listVec3[i + 1]) / speedCar;
                    }
                    // timeTween = 2;
                    // add tween move to
                    let tweenAnim = tween(this.polygonCheckCar.node)
                        .call(() => { nCar.angle = dataCarMoveToParking.listAngle[i]; })
                        .to(timeTween, { worldPosition: dataCarMoveToParking.listVec3[i] });
                    listTween.push(tweenAnim);
                }

                // anim tween
                await new Promise<void>(resolve => {
                    tween(this.polygonCheckCar.node)
                        .sequence(...listTween)
                        .call(() => resolve())
                        .start();
                })

                // add tween move to parking
                let timeToParking = Vec3.distance(dataCarMoveToParking.listVec3[dataCarMoveToParking.listVec3.length - 1], this._wPosParking) / speedCar;
                tween(this.polygonCheckCar.node)
                    .to(timeToParking, { worldPosition: this._wPosParking, angle: 0 })
                    .call(() => {
                        this.StopCar();
                        this._cbAfterMoveToTheGoal();
                    })
                    .start();
                break;
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                // move the car by bezier
                await AniTweenSys.TweenToListVec3_6(this.polygonCheckCar.node, dataCarMoveToParking.listVec3, dataCarMoveToParking.listAngle, listTimeCrab,
                    (index: number) => {
                        // ========== RIGHT ==============
                        // script 
                        // left true 1,2,3,4,5
                        // topLeft true 6,7,8,9
                        if (dataCarMoveToParking.fromDirection == DIRECT_CAR.RIGHT && index == 0) {
                            this._cbUpdateVisualCar(DIRECT_CAR.TOP_LEFT, true);
                            nCar.angle = dataCarMoveToParking.listAngle[index + 1];
                        } else if (dataCarMoveToParking.fromDirection == DIRECT_CAR.RIGHT && index == 5) {
                            // SoundSys.Instance.playSoundEffect(GameSoundEffect.BRAKE_CAR);
                            this._cbUpdateVisualCar(DIRECT_CAR.TOP_LEFT, true);
                        }

                        // ========== LEFT ===============
                        // script 
                        // right true 1,2,3
                        // topLeft true 7,8,9
                        if (dataCarMoveToParking.fromDirection == DIRECT_CAR.LEFT && index == 6) {
                            this._cbUpdateVisualCar(DIRECT_CAR.TOP_LEFT, true);
                            nCar.angle = dataCarMoveToParking.listAngle[index + 1];
                        }
                        else if (index == 7) {
                            // SoundSys.Instance.playSoundEffect(GameSoundEffect.BRAKE_CAR);
                        } else if (dataCarMoveToParking.fromDirection == DIRECT_CAR.LEFT && index == 7) {
                            this._cbUpdateVisualCar(DIRECT_CAR.TOP_LEFT, true);
                            nCar.angle = dataCarMoveToParking.listAngle[index + 1];
                        }
                    },
                );

                // move to the parking like normal
                tween(this.polygonCheckCar.node)
                    .to(listTimeCrab[listTimeCrab.length - 1] + 0.1, { worldPosition: this._wPosParking })
                    .call(() => {
                        this.StopCar();
                        this._cbAfterMoveToTheGoal();
                    })
                    .start();
                break;
        }
    }

    private ChangeDirectionCar(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == GROUP_COLLIDER.ROAD) {

            const roadSys = otherCollider.node.getComponent(RoadSys);
            // get the direction road move to 
            const wPosCollider: Vec3 = selfCollider.node.worldPosition.clone();
            let directionOfRoad: DIRECT_CAR = roadSys.GetDirectionCarMoveIn(wPosCollider);

            // trong trường hợp hướng xe lên tuy nhiên lại collider vs road bottom thì ta sẽ bỏ qua trường hợp này và chỉ cho xe đi lên thôi
            if (roadSys.GetDirectionRoad() == DIRECT_CAR.BOTTOM && (this._directionNow == DIRECT_CAR.TOP || this._directionNow == DIRECT_CAR.TOP_LEFT || this._directionNow == DIRECT_CAR.TOP_RIGHT)) {
                return;
            }

            // trong trường hợp hướng xe đi sang hai bên nhưng lại collide trước với Bottom thì cũng bỏ qua
            if (roadSys.GetDirectionRoad() == DIRECT_CAR.BOTTOM
                && (this._directionNow == DIRECT_CAR.LEFT || this._directionNow == DIRECT_CAR.RIGHT)) {
                return;
            }

            // may be there is a case that you collider with road left or right first than the bottom 
            // or may be there is case that you collider with top road first than the left or right 
            if (this._priorityRoadNow < roadSys.priorityRoad) {
                return;
            }

            // NOTE In this game we will not have any obstacle when car move on road => just turn off collider with another car
            this.unListColliderWithAnotherCar();

            if (this._priorityRoadNow > roadSys.priorityRoad) {
                this._priorityRoadNow = roadSys.priorityRoad;
            }

            if (directionOfRoad == null) {
                this.StopCar();
                // WARNING this code is not good if the road end is not the right/left data
                this._directionNow = this._wPosParking.x < this._nCar.worldPosition.clone().x ? DIRECT_CAR.LEFT : DIRECT_CAR.RIGHT;
                // case you can move to the last point
                this.MoveToTheLastPoint();
                const numChildInGround = this._cbGetNumChildInGround();
                const newSiblingIndex = numChildInGround - this._idParking;
                this._nCar.setSiblingIndex(newSiblingIndex);
                return;

            } else {
                this._directionNow = directionOfRoad;
                // stop velocity
                this.rigiCar.linearVelocity = Vec2.ZERO;

                // set the wPosCar to right on the Road to make it feel like move forward
                const wPosCarNow: Vec3 = this._nCar.worldPosition.clone();
                const wPosRoadCheck: Vec3 = roadSys.node.worldPosition.clone();
                switch (this._directionNow) {
                    case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                        this._nCar.worldPosition = new Vec3(wPosCarNow.x, wPosRoadCheck.y, 0);
                        break;
                    case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM:
                        this._nCar.worldPosition = new Vec3(wPosRoadCheck.x, wPosCarNow.y, 0);
                        break;
                }
                // push new velocity
                const vecMove: Vec2 = this.GetVec2SuitWithDirectCar(this._directionNow);
                this.rigiCar.linearVelocity = vecMove.clone().multiplyScalar(MConfigs.SPEED_MOVE_CAR);
            }

            // save point
            this._cbUpdateVisualCar(this._directionNow);
            let savePoint: IInfoWPosMoveCar = {
                wPos: this._nCar.worldPosition.clone(),
                directionMoveToPos: this._directionNow
            }
            this.listSavePoint.push(savePoint);
        }
    }

    private StopCarAndMoveBack(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let needStopCar: boolean = false;
        const idCar: number = this._cbGetIdCar();
        let contactPoints: Vec2[] = contact.getWorldManifold().points;
        // console.log(contactPoints);
        // if (contactPoints.length > 0) {
        //     console.warn("idCarBlock", idCar, selfCollider.node.name, otherCollider.node.name);
        // }

        if (otherCollider.group == GROUP_COLLIDER.DEFAULT) {
            if (otherCollider.node.getComponent(HoldPlaceCarSys) != null && otherCollider.node.getComponent(HoldPlaceCarSys).GetIdCar() != idCar) {
                const idCarBlock: number = otherCollider.node.getComponent(HoldPlaceCarSys).GetIdCar()

                if (!this._cbCheckCarCanMoveThroughByIdCar(idCarBlock)) {
                    needStopCar = true;
                    clientEvent.dispatchEvent(MConst.EVENT_CAR.PLAY_EF_BLOCK_CAR_MOVE, idCarBlock, this.GetVec2SuitWithDirectCar(this._directionNow).clone());

                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_EFFECT_CAR_COLLIE, new Vec3(contactPoints[0].x, contactPoints[0].y, 0));
                }
                // } else if (otherCollider.group == GROUP_COLLIDER.DEFAULT && otherCollider.tag == TAG_COLLIDER.CONVEYOR_BELT) {
                //     if (this._cbGetIdConveyorBelt() == -1
                //         && otherCollider.node.getComponent(ConveyorBeltSys).infoConveyorBelt.IDConveyorBelt != this._cbGetIdConveyorBelt()) {
                //         needStopCar = true;
                //     }
            } else if (otherCollider.group == GROUP_COLLIDER.DEFAULT && otherCollider.tag == TAG_COLLIDER.GARAGE) {
                // console.log(this._cbGetIdGarage(), otherCollider.node.getComponent(GarageSys).InfoGarageSys.IDGarage);

                if (this._cbGetIdGarage() == -1
                    && otherCollider.node.getComponent(ColliderGaraSys).GetGaraSys().InfoGarageSys.IDGarage != this._cbGetIdGarage()) {
                    needStopCar = true;
                }
            }
        }

        // stop car
        if (needStopCar) {
            this._priorityRoadNow = 999;
            // SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CAR_HIT);
            SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CAR_COLLIDE_CAR);
            this.StopCar();
            // call back when collider
            this._cbWhenCollider(selfCollider.node.worldPosition.clone());

            // need to cacul again the time to move back
            this.MoveCarBackPreviousSavePoint();
        }
    }

    private MoveCarToSavePoint(infoSavePoint: IInfoWPosMoveCar) {
        const wPosCarNow: Vec3 = this._nCar.worldPosition.clone();
        const speedCar: number = this.GetVec2SuitWithDirectCar(infoSavePoint.directionMoveToPos).multiplyScalar(MConfigs.SPEED_MOVE_CAR_TO_GATE).lengthSqr();
        const timeMoveToSavePoint: number = Vec3.distance(wPosCarNow, infoSavePoint.wPos) / speedCar;
        this._cbUpdateVisualCar(infoSavePoint.directionMoveToPos);

        return new Promise<void>(resolve => {
            tween(this._nCar)
                .to(timeMoveToSavePoint, { worldPosition: infoSavePoint.wPos.clone() })
                .call(resolve)
                .start();
        })
    }

    private async MoveCarBackPreviousSavePoint(callWhenCarMoveInTheRoad: boolean = true) {
        for (let i = this.indexSavePointMove; i >= 0; i--) {
            const infoSavePoint: IInfoWPosMoveCar = this.listSavePoint[i];
            await this.MoveCarToSavePoint(infoSavePoint);
        }

        this.ResetData(false);
        if (callWhenCarMoveInTheRoad) {
            this._cbAfterMoveBackDone();
        }
    }

    private StopCar() {
        this.rigiCar.linearVelocity = Vec2.ZERO;
        this.unListenCollider();
        Tween.stopAllByTarget(this._nCar);
    }


    //#region move out parking
    public async MoveOutParking() {
        const self = this;
        /**
         * hoạt họa này sẽ được chia làm 2 phần
         * Phần 1 : 
         *      - xe sẽ lùi lại xe theo bezier và để mở khách p1: điểm đang đỗ , p2: điểm vào bến , p3: new Vec3(p1.x , p2.y)  , < nếu được thì tắt hiệu ứng trail ở bước này>
         *      - xe sẽ đóng nắp và đợi một khoảng thời gian ngắn sau đó phóng thẳng tới chỗ chở khách
         */

        const nCar = this.polygonCheckCar.node;
        const wPosParkingNow = nCar.worldPosition.clone();
        const dataCarMoveToParking = this._nParkingCar.getComponent(ParkingCarSys).GetListNodeAndAngleForCarMoveOut(wPosParkingNow);
        const numStepCar_TopLeft = dataCarMoveToParking.l_m1.length;
        const numStepCar_Left = dataCarMoveToParking.l_m2.length;
        const timeCarMove = 0.05;

        let listTween: Tween<Node>[] = [];
        for (let i = 0; i < numStepCar_TopLeft; i++) {
            const wPosEnd = dataCarMoveToParking.l_m1[i];
            const angleEnd = dataCarMoveToParking.angle_1[i];
            let tweencar = null;
            switch (i) {
                case 0:
                    tweencar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd, angle: angleEnd });
                    break;
                case 1:
                    tweencar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd, angle: angleEnd })
                        .call(() => {
                            this._cbUpdateVisualCar(DIRECT_CAR.TOP, false);
                            this.TriggerMoveOutParking_1();
                        });
                    break;
                case 2:
                    tweencar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd, angle: angleEnd });
                    break;
                default:
                    tweencar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd, angle: angleEnd });
                    break;
            }
            // if (i == 1) {
            //     tweencar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd })
            //         .call(() => {
            //            nCar.angle = angleEnd;
            //             this._cbUpdateVisualCar(DIRECT_CAR.TOP, false);
            //         });
            // } else {
            //     tweencar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd, angle: angleEnd });
            // }
            listTween.push(tweencar);
        }

        // đổi ảnh và set auto angle theo ảnh xe sau
        let tweenCarLast = tween(this.polygonCheckCar.node).call(() => {
            this._cbUpdateVisualCar(DIRECT_CAR.TOP_RIGHT, false);
            this.TriggerMoveOutParking_2();
            nCar.angle = dataCarMoveToParking.angle_2[0];
        })
        listTween.push(tweenCarLast);

        for (let i = 1; i < numStepCar_Left; i++) {
            const wPosEnd = dataCarMoveToParking.l_m2[i];
            const angleEnd = dataCarMoveToParking.angle_2[i];
            let tweenCar = null;
            if (i == 2) {
                tweenCar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd, angle: angleEnd })
                    .call(() => {
                        this._cbUpdateVisualCar(DIRECT_CAR.RIGHT, false);
                        this.TriggerMoveOutParking_3();
                    })
            } else {
                tweenCar = tween(this.polygonCheckCar.node).to(timeCarMove, { worldPosition: wPosEnd, angle: angleEnd });
            }
            listTween.push(tweenCar);
        }

        //============== debug ===============  
        // listTween.forEach((tweenAnim, index) => {
        //     tweenAnim.delay(2);
        // })


        await new Promise<void>(resolve => {
            // play sound car move out
            // SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CAR_LEAVE_PARK);

            tween(this.polygonCheckCar.node)
                .sequence(...listTween)
                .delay(MConfigs.TIME_WAIT_TO_MOVE_TO_THE_GATE)
                .call(() => {
                    resolve();
                })
                .start();
        })

    }
    //#endregion move out parking

    //===========================================
    //#region ovveride from carSys
    public RegisterCbTrigger(cbTMOP_1: CallableFunction, cbTMOP_2: CallableFunction, cbTMOP_3: CallableFunction) {
        this._cbTMOP_1 = cbTMOP_1;
        this._cbTMOP_2 = cbTMOP_2;
        this._cbTMOP_3 = cbTMOP_3;
    }

    private _cbTMOP_1: CallableFunction = null;
    private _cbTMOP_2: CallableFunction = null;
    private _cbTMOP_3: CallableFunction = null;
    protected TriggerMoveOutParking_1() { this._cbTMOP_1 && this._cbTMOP_1(); }
    protected TriggerMoveOutParking_2() { this._cbTMOP_2 && this._cbTMOP_2(); }
    protected TriggerMoveOutParking_3() { this._cbTMOP_3 && this._cbTMOP_3(); }
    //#endreion ovveride from carSys
}


