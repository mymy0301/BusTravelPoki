import { _decorator, Component, Node, Vec2, Vec3, Button, EventTouch } from 'cc';
import { ConvertSizeCarFromJsonToNumber, DIRECT_CAR, GameSoundEffect, GetMColorByNumber, GetNameDirectionCar, GetNumberByMColor, ITypeCar, JsonCar, M_COLOR, NAME_SUP_VI_CAR, STATE_CAR, STATE_CAR_MOVING, STATE_PARKING_CAR, TYPE_CAR_SIZE, TYPE_ITEM } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { InfoCarSys } from './InfoCarSys';
import { VisualCarSys } from './VisualCarSys';
import { ParkingCarSys } from './ParkingCarSys';
import { LogicItemInGame } from './ItemInGame/LogicItemInGame';
import { InfoCustomForColliderCar } from './InfoCustomForColliderCar';
import { MoveCar2Sys } from './MoveCar2Sys';
import { Utils } from '../../../Utils/Utils';
import { CustomRayCastCheck } from '../../../Utils/CustomRayCastCheck';
import { MyDrawSys } from '../../../Utils/MyDrawSys';
import { MConfigs } from '../../../Configs/MConfigs';
import { EffectCarSys } from './EffectCarSys';
import { ListSmokeCarSys } from '../Smoke/ListSmokeCarSys';
import { SmokeCarSys } from '../Smoke/SmokeCarSys';
import { SoundSys } from '../../../Common/SoundSys';
import { GarageSys } from './GarageMini/GarageSys';
import { ConveyorBeltSys } from './ConveyorBelt/ConveyorBeltSys';
import { HoldPlaceCarSys } from './HoldPlaceCarSys';
import { EffectHelicopterSys } from './Helicopter/EffectHelicopterSys';
import { ListEmotions } from './ListEmotions';
import { DataTrailsSys } from '../../../DataBase/DataTrailsSys';
import { TrailCarSys } from '../Trail/TrailCarSys';
import { TypeTrail } from '../Trail/TypeTrail';
import { SaveStepGameSys } from './SaveStepGameSys';
import { EVENT_TUT_GAME } from '../../OtherUI/UITutorialInGame/TypeTutorialInGame';
import { SupCarLock } from './Car/SupCarLock/SupCarLock';
import { SupCarPolice } from './Car/SupCarPolice/SupCarPolice';
import { SupCarFireTruck } from './Car/SupCarFireTruck/SupCarFireTruck';
import { SupCarAmbulance } from './Car/SupCarAmbulance/SupCarAmbulance';
import { SupCarMilitary } from './Car/SupCarMilitary/SupCarMilitary';
import { SupCarTwoWay2 } from './Car/SupCarTwoWay/SupCarTwoWay2';
const { ccclass, property } = _decorator;

@ccclass('CarSys')
export class CarSys extends Component {
    @property(VisualCarSys) visualCarSys: VisualCarSys;
    @property(MoveCar2Sys) moveCar2Sys: MoveCar2Sys;
    @property(EffectCarSys) EffCarSys: EffectCarSys;
    @property(TrailCarSys) trailCarSys: TrailCarSys;
    @property(Node) nBtnClick: Node;

    private _stateCar: STATE_CAR = null; public get StateCar(): STATE_CAR { return this._stateCar; }
    private _stateCarMoving: STATE_CAR_MOVING = STATE_CAR_MOVING.NONE; public get StateCarMoving(): STATE_CAR_MOVING { return this._stateCarMoving; }
    private _infoCar: InfoCarSys = new InfoCarSys(); public get InfoCar(): InfoCarSys { return this._infoCar; }
    private _idParkingCar: number = -1; public get idParkingCar(): number { return this._idParkingCar; }

    private _cbGetNParkingCar: CallableFunction = null;
    private _cbGetNParkingCarById: CallableFunction = null;
    private _cbGetNParkingVipSlot: CallableFunction = null;
    private _cbGetCarById: CallableFunction = null;
    private _cbCheckCarCanMoveThroughByIdCar: CallableFunction = null;
    private _cbSetIdCarQueueReady: CallableFunction = null;
    private _cbTryEmitCarMoveOutParking: CallableFunction = null;
    private _cbUpdateQueueWhenCarParking: CallableFunction = null;
    private _cbUpdateCarMystery: CallableFunction = null;
    private _cbGetScaleMap: CallableFunction = null;
    private _cbGetNumChildInGround: CallableFunction = null;
    private _cbSwitchWayCarTwoWay: CallableFunction = null;
    private _cbTriggerCarAutoMoveForward: CallableFunction = null;
    private _cbUnlockCarByKey: CallableFunction = null;
    private _cbIncreaseCarChangeStateReadyTakePassenger: CallableFunction = null;
    private _nMapCar: Node = null;
    private _baseWPosCarBeforeParking: Vec3 = Vec3.ZERO;
    private _nSmokeCar: Node = null;

    private _listIdCarBlockMystery: number[] = [];

    protected onLoad(): void {
        this.node.on(MConst.EVENT.UPDATE_DATA_CAR_IN_CONVEYOR_BELT, this.UpdateDataCarInConveyorBelt, this);
        this.EffCarSys.Init(this.GetIdCar.bind(this), () => { return this.InfoCar.IsMysteryCar }, this.GetState.bind(this));
    }

    protected onEnable(): void {
        if (!this.nBtnClick.hasEventListener(Node.EventType.TOUCH_START, this.TryMoveCarForParking, this)) {
            this.nBtnClick.on(Node.EventType.TOUCH_START, this.TryMoveCarForParking, this);
        }
    }

    protected onDisable(): void {
        this.UnSheduleAutoMoveOutParking();
        this.nBtnClick.off(Node.EventType.TOUCH_START, this.TryMoveCarForParking, this);
    }



    protected onDestroy(): void {
        this.node.off(MConst.EVENT.UPDATE_DATA_CAR_IN_CONVEYOR_BELT, this.UpdateDataCarInConveyorBelt, this);
    }

    public ChangeStateCarMoving(stateCarMoving: STATE_CAR_MOVING) {
        this._stateCarMoving = stateCarMoving;
        this.TriggerChangeStateCarMove();
    }

    public async ChangeState(state: STATE_CAR, registerClickOnReadyToMove: boolean = true) {
        // Update new State    

        this._stateCar = state;
        this.visualCarSys.HideArrow(this.InfoCar.getITypeCar);

        switch (state) {
            case STATE_CAR.READY_TO_MOVE:
                // show arrow suitable with visualCar
                this.visualCarSys.ShowArrow(this.InfoCar.getITypeCar);
                this.visualCarSys.UpdateVisualCarMoveWithDirection(this.InfoCar.getITypeCar,
                    this._infoCar.colorByMColor, this._infoCar.direction, this._infoCar.carSize);
                //register click car
                registerClickOnReadyToMove ? this.RegisterEventClickCar() : this.UnRegisterEventClickCar();
                break;
            case STATE_CAR.MOVING:
                clientEvent.dispatchEvent(EVENT_TUT_GAME.CAR_START_MOVE);
                this.UnRegisterEventClickCar();
                break;
            case STATE_CAR.READY_TO_PICK_UP_PASSENGER:
                // console.log("===========set car ready to pick up", this.node.name);

                this._cbUpdateQueueWhenCarParking();
                this._cbIncreaseCarChangeStateReadyTakePassenger();
                this.visualCarSys.UpdateVisualCarPickUp(this._infoCar.colorByMColor, this._infoCar.carSize);
                clientEvent.dispatchEvent(MConst.EVENT.READY_TO_PICK_UP_PASSENGER_CAR, this._infoCar.idCar);
                break;
            case STATE_CAR.READY_TO_DEPART:
                this._cbSetIdCarQueueReady(this._infoCar.idCar);
                // kiểm tra xem có sử dụng tính năng này hay không?
                // nếu ko thì change state luôn sang move to the gate 
                if (MConfigs.IS_WAIT_MOVE_CAR_SAME_TIME) {
                    // ở đây để tránh trường hợp bị lỗi ở khâu tính toán đợi xe cùng xuất bến 
                    // => ta sẽ bổ sung thêm code có thời gian đợi để tự động xuất bến khi đã đủ người trên xe
                    this.ScheduleAutoMoveOutParking();

                    this._cbTryEmitCarMoveOutParking();
                } else {
                    this.ChangeState(STATE_CAR.MOVE_TO_THE_GATE);
                }
                break;
            case STATE_CAR.MOVE_TO_THE_GATE:
                this.node.setSiblingIndex(999);
                if (MConfigs.IS_WAIT_MOVE_CAR_SAME_TIME) { this.UnSheduleAutoMoveOutParking(); }

                const nParkingCar: Node = this._cbGetNParkingCarById(this._idParkingCar);
                const comParkingCar: ParkingCarSys = nParkingCar.getComponent(ParkingCarSys);
                comParkingCar.TryChangeToEmptyState();
                const wPosParkingIn: Vec3 = comParkingCar.wPosParkingIn1.clone();
                const listWPosMoveToGate: Vec3[] = [comParkingCar.wPosGate.clone()];
                //play sound
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CAR_LEAVE_BUS_STOP);

                clientEvent.dispatchEvent(MConst.EVENT.SHOW_EFFECT_CAR_FULL, this.node.worldPosition);
                //play anim coin receive when car done
                const listWPosPassSit: Vec3[] = this.visualCarSys.getListWPosPassSitInCar();
                clientEvent.dispatchEvent(MConst.EVENT.RECEIVE_LIST_COIN_AT_LIST_WPOS, listWPosPassSit);
                // emit to remove car out of list car in listParkingCar
                clientEvent.dispatchEvent(MConst.EVENT_PARKING.REMOVE_CAR_OUT_LIST_PARKING, this._idParkingCar);
                this.ChangeStateCarMoving(STATE_CAR_MOVING.MOVING_TO_THE_GATE);

                // if has smoke turn it on 
                if (this._nSmokeCar != null) {
                    this._nSmokeCar.getComponent(SmokeCarSys).StartSmoke(this.node);
                }

                // increase combo
                clientEvent.dispatchEvent(MConst.EVENT_TEXT_COMBO.INCREASE_COMBO);

                // move car out
                /**
                 * Đoạn code chỉnh angle dưới đây cần phải có vì trong trường hợp xe đỗ ở vip => code có xoay xe node một góc nhất định => để thẳng hàng với cái thảm
                 * do đó cần đoạn code chỉnh angle về 0 trước khi TransferPassengers để tránh config vs json anim lui xe.
                 */
                this.visualCarSys.visualPickUpPass.node.angle = 0;
                clientEvent.dispatchEvent(EVENT_TUT_GAME.CAR_MOVE_TO_GATE);
                await this.moveCar2Sys.TransferPassengers(this.node, wPosParkingIn, listWPosMoveToGate);
                this.ChangeStateCarMoving(STATE_CAR_MOVING.NONE);
                this.ChangeState(STATE_CAR.MOVE_TO_THE_GATE_DONE);
                break;
            case STATE_CAR.MOVE_TO_THE_GATE_DONE:
                // reUse smoke car
                if (this._nSmokeCar != null) {
                    ListSmokeCarSys.Instance.ReUseObject(this._nSmokeCar);
                }

                // emit event to end game or do something else
                clientEvent.dispatchEvent(MConst.EVENT.BUS_MOVE_OUT_TO_THE_GATE, this._infoCar.idCar, this._infoCar.getNumberPassengerInCar);
                this.UpdateVisualMoveOutCarToTheGate();
                clientEvent.dispatchEvent(MConst.EVENT.CHECK_WIN_GAME);
                clientEvent.dispatchEvent(EVENT_TUT_GAME.CAR_MOVE_TO_GATE_DONE);
                break;
        }
    }

    public GetState(): STATE_CAR {
        return this._stateCar;
    }

    public ResetData() {
        this._stateCar = null;
        this._stateCarMoving = STATE_CAR_MOVING.NONE;
        this.InfoCar.ResetData();
        this.visualCarSys.ResetData();
        this.moveCar2Sys.ResetData();
        this._idParkingCar = -1;
        this._cbGetNParkingCar = null;
        this._cbGetNParkingCarById = null;
        this._cbGetNParkingVipSlot = null;
        this._baseWPosCarBeforeParking = Vec3.ZERO;
        this._listIdCarBlockMystery = [];

        // reuse smoke car
        if (this._nSmokeCar != null) {
            ListSmokeCarSys.Instance.ReUseObject(this._nSmokeCar);
        }
        this._nSmokeCar = null;
    }

    public RegisterEventClickCar() {
        this.nBtnClick.active = true;
    }

    public UnRegisterEventClickCar() {
        this.nBtnClick.active = false;
    }

    public TryEmitFullSlot() {
        if (this.visualCarSys.IsMaxPassengerTurnOn() && this.StateCar == STATE_CAR.READY_TO_PICK_UP_PASSENGER) {
            this.ChangeState(STATE_CAR.READY_TO_DEPART);
        }
    }

    //#region SetUp jsonCar
    public RegisterCb(cbGetNParkingCar: CallableFunction, cbGetListCarReadyToMove: CallableFunction, cbGetNParkingCarById: CallableFunction,
        cbGetNParkingVipSlot: CallableFunction, cbSetParentCarToGround: CallableFunction,
        cbCheckCarCanMoveThroughByIdCar: CallableFunction, cbGetCarById: CallableFunction,
        cbSetIdCarQueueReady: CallableFunction,
        cbTryEmitCarMoveOutParking: CallableFunction, cbUpdateQueueWhenCarParking: CallableFunction, cbUpdateCarMystery: CallableFunction,
        cbGetScaleMap: CallableFunction, cbGetNumChildInGround: CallableFunction, cbSwitchWayCarTwoWay: CallableFunction,
        cbUnlockCarByKey: CallableFunction, cbIncreaseCarChangeStateReadyTakePassenger: CallableFunction,
        cbTriggerCarAutoMoveForward: CallableFunction) {
        this._cbGetNParkingCar = cbGetNParkingCar;
        this._cbGetNParkingCarById = cbGetNParkingCarById;
        this._cbGetNParkingVipSlot = cbGetNParkingVipSlot;
        this._cbGetCarById = cbGetCarById;
        this._cbCheckCarCanMoveThroughByIdCar = cbCheckCarCanMoveThroughByIdCar;
        this._cbSetIdCarQueueReady = cbSetIdCarQueueReady;
        this._cbTryEmitCarMoveOutParking = cbTryEmitCarMoveOutParking;
        this._cbUpdateQueueWhenCarParking = cbUpdateQueueWhenCarParking;
        this._cbUpdateCarMystery = cbUpdateCarMystery;
        this._cbGetScaleMap = cbGetScaleMap;
        this._cbGetNumChildInGround = cbGetNumChildInGround;
        this._cbSwitchWayCarTwoWay = cbSwitchWayCarTwoWay;
        this._cbUnlockCarByKey = cbUnlockCarByKey;
        this._cbIncreaseCarChangeStateReadyTakePassenger = cbIncreaseCarChangeStateReadyTakePassenger;
        this._cbTriggerCarAutoMoveForward = cbTriggerCarAutoMoveForward;
    }

    public async Init(jsonCarInit: JsonCar, idCar: number, nMapCar: Node) {

        this._infoCar.SetInfoCar(jsonCarInit, idCar);

        this._nMapCar = nMapCar;

        const newWPos: Vec3 = Utils.ConvertPosToWorldOfANode(nMapCar.worldPosition.clone(), this.InfoCar.getPosCar, MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS * nMapCar.scale.x);
        let mColorCar: M_COLOR = GetMColorByNumber(jsonCarInit.carColor);
        this.visualCarSys.Init(mColorCar, this.InfoCar.getNumberPassengerInCar, this.node, this._infoCar.getITypeCar);
        this.TriggerInInitVisual(mColorCar, this.InfoCar.getNumberPassengerInCar, this.node, this._infoCar.getITypeCar);

        let registerClick: boolean = true;

        // if car is not mystery => hide the mystery
        // console.log("show mystery car", jsonCarInit.isMysteryCar);
        if (jsonCarInit.isMysteryCar != undefined && jsonCarInit.isMysteryCar == true) {
            this.visualCarSys.UpdateUIMysteryCar(this.InfoCar.direction, this.InfoCar.carSize);
            this.visualCarSys.ShowMysteryCar();
            // registerClick = false;
        } else {
            this.visualCarSys.HideMysteryCar();
        }

        this.node.worldPosition = newWPos;
        this.ChangeState(STATE_CAR.READY_TO_MOVE, registerClick);

        this.TryAutoUpdateVisualCarSelf(this._infoCar.direction);

        this.UpdateWPosCarBase();

        this.moveCar2Sys.Init(this.TryAutoUpdateVisualCarSelf.bind(this), this.GetIdCar.bind(this),
            this.GetIdConveyerBelt.bind(this), this.GetIdGarage.bind(this), this._cbCheckCarCanMoveThroughByIdCar,
            this.visualCarSys.ShowVisualCarLeft.bind(this.visualCarSys),
            this.UpdateVisualPrepareMoveOutCarToTheGate.bind(this),
            this._cbGetNumChildInGround,
            this.UnlockKeyLock.bind(this)
        );

        this.UpdateNameCar();

        // update trail car
        if (DataTrailsSys.Instance != null) {
            const idTrailChoice = DataTrailsSys.Instance.GetIdTrailChoice();
            this.trailCarSys.TurnOnTrail(idTrailChoice);
        }

        // init visual support car
        this.visualCarSys.visualArrowCar.Init();

        // init visual support car
        this.InitVisualSupUI();

        this.TriggerInitCar();
    }

    private InitVisualSupUI() {
        switch (true) {
            case this.InfoCar.IsCarLocking && this.InfoCar.IdCarKeyOfCarLock >= 0:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.LOCK_CAR);
                const nSupCarLock = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.LOCK_CAR);
                if (nSupCarLock == null) { console.error("something wrong nSubCarLock"); }
                nSupCarLock.getComponent(SupCarLock).SetUp(this.InfoCar.direction, this.InfoCar.carSize, this.InfoCar.ColorKeyLock);
                break;
            case this.InfoCar.IsTwoWayCar:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.TWO_WAY_CAR);
                const nSupTwoWayCar = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.TWO_WAY_CAR);
                if (nSupTwoWayCar == null) { console.error("something wrong nSupTwoWayCar"); }
                // nSupTwoWayCar.getComponent(SupCarTwoWay).SetStateIdle(this.InfoCar.direction, this.InfoCar.carSize);
                nSupTwoWayCar.getComponent(SupCarTwoWay2).Init(this.InfoCar.direction, this.InfoCar.carSize);
                break;
            case this.InfoCar.colorByMColor == M_COLOR.POLICE:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.POLICE);
                const nSupPolice = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.POLICE);
                if (nSupPolice == null) { console.error("something wrong nSupPolice"); }
                nSupPolice.getComponent(SupCarPolice).LoadImgLight(this.InfoCar.direction);
                break;
            case this.InfoCar.colorByMColor == M_COLOR.FIRE_TRUCK:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.FIRE_TRUCK);
                const nSupFireTruck = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.FIRE_TRUCK);
                if (nSupFireTruck == null) { console.error("something wrong nSupFireTruck"); }
                nSupFireTruck.getComponent(SupCarFireTruck).ChangeLight(this.InfoCar.direction);
                break;
            case this.InfoCar.colorByMColor == M_COLOR.AMBULANCE:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.AMBULANCE);
                const nSupAmbulance = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.AMBULANCE);
                if (nSupAmbulance == null) { console.error("something wrong nSupAmbulance"); }
                nSupAmbulance.getComponent(SupCarAmbulance).LoadImgLight(this.InfoCar.direction);
                break;
            case this.InfoCar.colorByMColor == M_COLOR.MILITARY:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.MILITARY);
                const nSupMilitary = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.MILITARY);
                if (nSupMilitary == null) { console.error("something wrong nSupMilitary"); }
                nSupMilitary.getComponent(SupCarMilitary).LoadImgLight(this.InfoCar.direction);
                break;
        }
    }

    private InitVisualSupUIAfterShuffleColor() {
        switch (true) {
            case this.InfoCar.colorByMColor == M_COLOR.POLICE:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.POLICE);
                const nSupPolice = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.POLICE);
                if (nSupPolice == null) { console.error("something wrong nSupPolice"); }
                else {
                    nSupPolice.getComponent(SupCarPolice).LoadImgLight(this.InfoCar.direction, true);
                    nSupPolice.active = true;
                }
                break;
            case this.InfoCar.colorByMColor == M_COLOR.MILITARY:
                this.visualCarSys.visualSupportCar.GenUISuitableWithCar(NAME_SUP_VI_CAR.MILITARY);
                const nSupMilitary = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.MILITARY);
                if (nSupMilitary == null) { console.error("something wrong nSupMilitary"); }
                else {
                    nSupMilitary.getComponent(SupCarMilitary).LoadImgLight(this.InfoCar.direction, true);
                    nSupMilitary.active = true;
                }
                break;
        }
    }

    public UpdateDataCarInConveyorBelt(jsonCarInit: JsonCar) {
        this._infoCar.SetInfoCar(jsonCarInit, this._infoCar.idCar);
        this.visualCarSys.Init(GetMColorByNumber(jsonCarInit.carColor), ConvertSizeCarFromJsonToNumber(jsonCarInit.carSize), this.node, this._infoCar.getITypeCar);
        this.TriggerInInitVisual(GetMColorByNumber(jsonCarInit.carColor), ConvertSizeCarFromJsonToNumber(jsonCarInit.carSize), this.node, this._infoCar.getITypeCar);
        this.TryAutoUpdateVisualCarSelf(this._infoCar.direction);
        this.UpdateNameCar();
    }

    private UpdateNameCar() {
        this.node.name = `car_${this.InfoCar.idCar}_${GetNameDirectionCar(this.InfoCar.direction)}_${this.InfoCar.carSize}_${this.InfoCar.colorByMColor}`;
    }
    //#endregion SetUp jsonCar

    //#region func car move
    private UpdateWPosCarBase() {
        // save the base world position if the car moving => it can be move back
        this._baseWPosCarBeforeParking = this.node.worldPosition.clone();
    }

    private async TryMoveCarForParking() {
        // console.log("click car", this.InfoCar.idCar);

        SaveStepGameSys.Instance.AddStep(this.GetIdCar());

        //NOTE - trong trường hợp xe đang khóa thì sẽ ko thể click dc
        if (this.InfoCar.IsCarLocking && this.InfoCar.IdCarKeyOfCarLock >= 0) {
            const nSupLockCar = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.LOCK_CAR);
            nSupLockCar.getComponent(SupCarLock).AnimLock()
            return;
        }

        // emit to try start time
        clientEvent.dispatchEvent(MConst.EVENT.START_TIME_GAME);

        const self = this;

        // callback of the car
        function CbWhenCarMoveBackDone() {
            self.moveCar2Sys.unListenCollider();
            self._idParkingCar = -1;
            if (self.InfoCar.IDConveyorBelt != -1) {
                self.node.setParent(tempParentNow, true);
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, this.InfoCar.IDConveyorBelt, this.GetIdCar());
            } else {
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, this.InfoCar.IDConveyorBelt, -1);
            }
            self.ChangeState(STATE_CAR.READY_TO_MOVE);
            self.ChangeStateCarMoving(STATE_CAR_MOVING.NONE);

            clientEvent.dispatchEvent(MConst.EVENT_TUTORIAL_GAME.TUTORIAL.RE_STEP);
        }

        function CbWhenCarMoveToTheGoal() {
            self.moveCar2Sys.unListenCollider();
            if (self.InfoCar.IDConveyorBelt != -1) {
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, self.InfoCar.IDConveyorBelt, self.GetIdCar(), true);
            } else {
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, self.InfoCar.IDConveyorBelt, -1);
            }

            clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_END_COOLDOWN, self.InfoCar.idCar);

            // clientEvent.dispatchEvent(MConst.EVENT_GARAGE.TRY_GEN_CAR_AFTER_A_CAR_MOVE_DONE, self.InfoCar.idCar);
            // emit to add car to the list car in listParkingCar
            clientEvent.dispatchEvent(MConst.EVENT_PARKING.ADD_CAR_TO_LIST_PARKING, self._idParkingCar, self.node);
            // emit to logicInGame that car is moving done
            clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_MOVING_DONE, self.InfoCar.idCar);

            self.ChangeState(STATE_CAR.READY_TO_PICK_UP_PASSENGER);
            self.EmitToDestroyPlaceHoldCar();
            self.ChangeStateCarMoving(STATE_CAR_MOVING.NONE);

            if (self._nSmokeCar != null) {
                self._nSmokeCar.getComponent(SmokeCarSys).PauseSmoke();
            }
        }

        function CbWhenCollider(wPosCollider: Vec3) {
            self.moveCar2Sys.unListenCollider();
            // emit to show sp collider
            clientEvent.dispatchEvent(MConst.EVENT_COLLIDER.CAR_CAR, wPosCollider.clone());
            let nParkingCar: Node = self._cbGetNParkingCarById(self._idParkingCar);
            nParkingCar.getComponent(ParkingCarSys).ChangeState(STATE_PARKING_CAR.EMPTY);
        }

        //===================================================================================
        //===================================================================================
        //===================================================================================
        //===================================================================================
        //===================================================================================
        //===================================================================================

        this.ChangeState(STATE_CAR.MOVING);

        // if the car is in the conveyor belt
        // set to the map to move it successful
        const tempParentNow: Node = this.node.parent;
        if (this.InfoCar.IDConveyorBelt != -1) {
            this.node.setParent(this._nMapCar, true);
        }

        // there are 2 case will appear in here
        //======== case 1: When use item vip slot ===============
        if (LogicItemInGame.Instance.GetItemTypeUsing() == TYPE_ITEM.VIP_SLOT) {
            clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.USE_VIP_SLOT_SUCCESS);
            clientEvent.dispatchEvent(MConst.EVENT.BUS_MOVING_TO_PARK, this.InfoCar.idCar, this.InfoCar.colorByMColor, this.node.worldPosition.clone());
            const nVipSlot: Node = this._cbGetNParkingVipSlot();
            if (nVipSlot == null) {
                console.error("nVipSlot == null");
            }
            else {
                // unlock car mystery
                if (this._cbUpdateCarMystery != null) { this._cbUpdateCarMystery(this.InfoCar.idCar) }

                nVipSlot.getComponent(ParkingCarSys).ChangeState(STATE_PARKING_CAR.USING_VIP);
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.USE_DONE_ITEM, TYPE_ITEM.VIP_SLOT);
                this._idParkingCar = nVipSlot.getComponent(ParkingCarSys).idParkingCar;
                const infoPlaceCarVip = nVipSlot.getComponent(ParkingCarSys).GetWPosPlaceCarVip(this.InfoCar.carSize);
                // emit to check can use btn shuffle any more
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_SHUFFLE);
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_VIP);

                // check is car in belt => stop belt and wait it done
                if (this.InfoCar.IDConveyorBelt != -1) {
                    clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.CAR_MOVE_OUT, this.InfoCar.IDConveyorBelt, this.GetIdCar());
                    clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.REMOVE_CAR_FROM_QUEUE, this.InfoCar.IDConveyorBelt, this.GetIdCar());
                } else {
                    this.EmitToDestroyPlaceHoldCar();
                }

                // call cb switch car direction 
                this._cbSwitchWayCarTwoWay();

                // call triggerCarMoveForward
                this._cbTriggerCarAutoMoveForward(this.InfoCar.idCar);

                EffectHelicopterSys.Instance.MoveHelicopter_2(this.node, infoPlaceCarVip,
                    () => {
                        // code ở đoạn này sẽ xoay góc xe , vì vậy hãy nhớ chỉnh lại góc khi xe rời bến
                        this.visualCarSys.visualPickUpPass.node.angle = infoPlaceCarVip.angle;
                        this.TryAutoUpdateVisualCarSelf(DIRECT_CAR.TOP_LEFT, true);
                        clientEvent.dispatchEvent(MConst.EVENT_GARAGE.TRY_GEN_CAR_AFTER_A_CAR_MOVE_DONE, self.InfoCar.idCar);
                    },
                    () => {
                        this.moveCar2Sys.SetNParkingCar(nVipSlot);
                        // turn off visual car mystery if had
                        this.visualCarSys.nVisualMystery.active = false;

                        this.UnlockKeyLock();

                        // const wPosParkingCar: Vec3 = nVipSlot.worldPosition.clone();
                        // await this.moveCar2Sys.MoveToVipParking(this.node, wPosParkingCar, 27, 0.5);

                        CbWhenCarMoveToTheGoal();
                    },
                );
                return;
            }
        }

        //======== case 2: When click car in normal case ========

        // get the parking and try move car to there
        let nParkingCar: Node = this._cbGetNParkingCar(STATE_PARKING_CAR.EMPTY);
        if (nParkingCar == null) {
            this.ChangeState(STATE_CAR.READY_TO_MOVE);
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.NO_PLACE_PARKING);

            // if (this.InfoCar.IDConveyorBelt != -1) {
            //     clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.CAR_MOVE_OUT, this.InfoCar.IDConveyorBelt, this.GetIdCar());
            // }

            if (self.InfoCar.IDConveyorBelt != -1) {
                self.node.setParent(tempParentNow, true);
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, this.InfoCar.IDConveyorBelt, this.GetIdCar());
            } else {
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, this.InfoCar.IDConveyorBelt, -1);
            }

            return;
        }
        this._idParkingCar = nParkingCar.getComponent(ParkingCarSys).idParkingCar;

        //=============== case when car in conveyor belt ===============
        // set the car to the nMapCar
        // => then send back to the item conveyor belt if can not move
        if (this.InfoCar.IDConveyorBelt != -1) {
            clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.CAR_MOVE_OUT, this.InfoCar.IDConveyorBelt, this.GetIdCar());
        } else {
            clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.CAR_MOVE_OUT, this.InfoCar.IDConveyorBelt, -1);
        }


        // check car can move to the parking space now or not
        const wPosRoot: Vec3 = this.node.worldPosition.clone();
        if (!this.CanMoveCarForward(wPosRoot)) {
            this.ChangeStateCarMoving(STATE_CAR_MOVING.MOVING_TO_THE_BLOCK);
        }

        if (this._stateCarMoving == STATE_CAR_MOVING.NONE) {
            // unlock car mystery
            if (this._cbUpdateCarMystery != null) { this._cbUpdateCarMystery(this.InfoCar.idCar) }
            this.ChangeStateCarMoving(STATE_CAR_MOVING.MOVING_TO_THE_PARK);
        }

        if (this._stateCarMoving == STATE_CAR_MOVING.MOVING_TO_THE_PARK) {
            // emit car is moving
            clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_MOVING_TO_PARK, this.InfoCar.idCar);
            clientEvent.dispatchEvent(MConst.EVENT.BUS_MOVING_TO_PARK, this.InfoCar.idCar, this.InfoCar.colorByMColor, this.node.worldPosition.clone());

            // emit to check can use btn shuffle any more
            clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_SHUFFLE);
            clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_VIP);

            // add a smoke car to this node
            // check type trail is default or not , if default => add smoke
            if (DataTrailsSys.Instance != null && DataTrailsSys.Instance.GetIdTrailChoice() == TypeTrail.DEFAULT) {
                let nSmokeCar: Node = ListSmokeCarSys.Instance.InitObject();
                if (nSmokeCar != null) {
                    // nSmokeCar.setParent(this.node, true);
                    nSmokeCar.position = Vec3.ZERO;
                    nSmokeCar.setSiblingIndex(0);
                    this._nSmokeCar = nSmokeCar;
                    this._nSmokeCar.getComponent(SmokeCarSys).StartSmoke(this.node);
                }
            }

            // play sound
            // SoundSys.Instance.playSoundEffect(GameSoundEffect.CAR_MOVE_TO_BUS_STOP);
        }

        // just move carForward
        const wPosParkingCar: Vec3 = nParkingCar.worldPosition.clone();
        // chỉ đăng ký event nếu như xe di chuyển về vạch đích
        if (this._stateCarMoving == STATE_CAR_MOVING.MOVING_TO_THE_PARK) {
            nParkingCar.getComponent(ParkingCarSys).ChangeState(STATE_PARKING_CAR.USING);
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.ONLY_ONE_PARKING);
            this.moveCar2Sys.registerListenColliderWithoutCheckAnotherCar();
            clientEvent.dispatchEvent(MConst.EVENT_GARAGE.TRY_GEN_CAR_AFTER_A_CAR_MOVE_DONE, self.InfoCar.idCar);
            clientEvent.dispatchEvent(EVENT_TUT_GAME.CAR_START_MOVE_TO_THE_PARKING);
            // check car in belt to remove out the queue
            if (this.InfoCar.IDConveyorBelt != -1) {
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.REMOVE_CAR_FROM_QUEUE, this.InfoCar.IDConveyorBelt, self.InfoCar.idCar);
            } else {
                clientEvent.dispatchEvent(MConst.CONVEYOR_BELT_EVENT.REMOVE_CAR_FROM_QUEUE, this.InfoCar.IDConveyorBelt, -1);
            }
            this._cbSwitchWayCarTwoWay();
            this._cbTriggerCarAutoMoveForward(this.InfoCar.idCar);
        } else {
            this.moveCar2Sys.registerListenColliderWithoutCheckRoad();
        }

        const idParking = nParkingCar.getComponent(ParkingCarSys).idParkingCar;

        this.moveCar2Sys.UpdateCallBackMove(CbWhenCarMoveBackDone.bind(this), CbWhenCarMoveToTheGoal.bind(this), CbWhenCollider.bind(this));
        this.EffCarSys.ScaleCarWhenClick();
        this.moveCar2Sys.MoveToTheParking(this.node, this.InfoCar.direction, wPosParkingCar, nParkingCar, idParking);
        this.InfoCar.UnListenCallCooldown();
    }

    public TryAutoUpdateVisualCarSelf(directionCar: DIRECT_CAR, isCarOpen: boolean = false) {
        // console.log("11111", directionCar, isCarOpen);


        this.visualCarSys.UpdateVisualCarMoveWithDirection(this.InfoCar.getITypeCar,
            this.InfoCar.colorByMColor, directionCar, this.InfoCar.carSize, isCarOpen);
        // update collider car
        const listConnerUpdate: Vec3[] = InfoCustomForColliderCar.GetListConner(this.InfoCar.carSize, directionCar, this.InfoCar.colorByMColor);
        let listNewPoint: Vec2[] = listConnerUpdate.map(vec3 => new Vec2(vec3.x, vec3.y));
        this.moveCar2Sys.polygonCheckCar.points = listNewPoint;
    }

    private GetIdCar(): number { return this._infoCar.idCar; }
    private GetIdConveyerBelt(): number { return this._infoCar.IDConveyorBelt; }
    private GetIdGarage(): number { return this._infoCar.IDGarage; }
    //#endregion func car move
    //#endregion func check car block

    private UpdateVisualMoveOutCarToTheGate() {
        this.node.active = false;
    }

    protected UpdateVisualPrepareMoveOutCarToTheGate() {
        this.visualCarSys.HideVisualPassInCarAndShowVisualNormal(this.InfoCar.colorByMColor, this.InfoCar.carSize);

        // There is a 60% chance that a happy emotion will appear
        let changeShowEmotion = Math.random();
        if (changeShowEmotion < 0.6) {
            ListEmotions.Instance.ShowEmotionsOnCar(this.visualCarSys.nEmotion);
        }
    }

    public ChangeColorByMColor(mColor: M_COLOR, autoUpdateVisualSup: boolean = false) {
        // trong trường hợp là xe có sup thì ta phải reUseSup đi
        // còn đối với những xe sau khi đổi màu có sup mới thì ta cần phải thêm sup vào

        //=============== check màu xe ban đầu ===============================
        const colorRoot = this.InfoCar.colorByMColor;
        switch (colorRoot) {
            case M_COLOR.POLICE: case M_COLOR.MILITARY:
                this.visualCarSys.visualSupportCar.ClearAllVisualSub();
                break;
        }

        this.InfoCar.SetColorByMColor(mColor);
        this.visualCarSys.UpdateVisualCarMoveWithDirection(this.InfoCar.getITypeCar,
            mColor, this.InfoCar.direction, this.InfoCar.carSize);
        this.visualCarSys.UpdateSfPassPickUp(mColor);

        //=====================================================================
        if (autoUpdateVisualSup) {
            this.InitVisualSupUIAfterShuffleColor();
        }
    }

    public EmitToInitPlaceHoldCar() {
        // update collider car
        const listConnerUpdate: Vec3[] = InfoCustomForColliderCar.GetListConner(this.InfoCar.carSize, this.InfoCar.direction, this.InfoCar.colorByMColor);
        const listNewPoint: Vec2[] = listConnerUpdate.map(vec3 => new Vec2(vec3.x, vec3.y));
        clientEvent.dispatchEvent(MConst.EVENT.INIT_HOLD_PLACE_CAR, this.InfoCar.idCar, this._baseWPosCarBeforeParking.clone(), listNewPoint);
    }

    private EmitToDestroyPlaceHoldCar() {
        clientEvent.dispatchEvent(MConst.EVENT.REMOVE_HOLD_PLACE_CAR, this.InfoCar.idCar);
    }

    /**
     * we will use the 3 ray cast to forward to check the car can move or not
       2 case is get from the 4 point collider of the car
       and 1 case is middle of the car and the midpoint between 2 points of the forward cars
     * @param wPosRoot 
     * @returns 
     */
    private CanMoveCarForward(wPosRoot: Vec3): boolean {
        if (!CheckCarCanMoveForwardByPoint(
            InfoCustomForColliderCar.GetTopPointLeft(this.InfoCar.carSize, this.InfoCar.direction, this._cbGetScaleMap(), this.InfoCar.colorByMColor)
            , this.InfoCar.direction
            , wPosRoot
            , this._cbGetCarById.bind(this))) {
            return false;
        }
        // get the point right
        if (!CheckCarCanMoveForwardByPoint(
            InfoCustomForColliderCar.GetTopPointRight(this.InfoCar.carSize, this.InfoCar.direction, this._cbGetScaleMap(), this.InfoCar.colorByMColor)
            , this.InfoCar.direction
            , wPosRoot
            , this._cbGetCarById.bind(this))) {
            return false;
        }
        // get the point middle
        if (!CheckCarCanMoveForwardByPoint(InfoCustomForColliderCar.GetTopPointMidCar(this.InfoCar.carSize, this.InfoCar.direction, this.InfoCar.colorByMColor), this.InfoCar.direction, wPosRoot, this._cbGetCarById.bind(this))) {
            return false;
        }
        return true;
    }


    //===================================================
    //#region logic with booster
    public CanSort() {
        return this.InfoCar.CanSort();
    }

    public CanShuffle() {
        const valid1 = this.InfoCar.CanShuffle();
        const valid2 = this.StateCar == STATE_CAR.READY_TO_MOVE;
        return valid1 && valid2;
    }

    public CanVip() {
        return this.InfoCar.CanVip();
    }


    //#endregion logic with booster
    //===================================================

    // #region car mystery
    public async RegisterCarsBlockMystery() {
        if (this._infoCar.IsMysteryCar == undefined || !this._infoCar.IsMysteryCar) { return; }

        // shout rayCast forward and save their id CarBlock
        const wPosRoot: Vec3 = this.node.worldPosition.clone();
        const PosTopPointLeft: Vec3 = InfoCustomForColliderCar.GetTopPointLeft(this.InfoCar.carSize, this.InfoCar.direction, this._cbGetScaleMap(), this.InfoCar.colorByMColor);
        const PosTopPointRight: Vec3 = InfoCustomForColliderCar.GetTopPointRight(this.InfoCar.carSize, this.InfoCar.direction, this._cbGetScaleMap(), this.InfoCar.colorByMColor);
        const PosTopPointMid: Vec3 = InfoCustomForColliderCar.GetTopPointMidCar(this.InfoCar.carSize, this.InfoCar.direction, this.InfoCar.colorByMColor);
        const listCarBlock: Node[] = [];
        const listCarBlockLeft = ShoutRayCast(PosTopPointLeft, this.InfoCar.direction, wPosRoot, false).listNCollider;
        const listCarBlockRight = ShoutRayCast(PosTopPointRight, this.InfoCar.direction, wPosRoot, false).listNCollider;
        const listCarBlockMid = ShoutRayCast(PosTopPointMid, this.InfoCar.direction, wPosRoot, false).listNCollider;
        listCarBlock.push(...listCarBlockLeft.filter(x => listCarBlock.indexOf(x) == -1));
        listCarBlock.push(...listCarBlockRight.filter(x => listCarBlock.indexOf(x) == -1));
        listCarBlock.push(...listCarBlockMid.filter(x => listCarBlock.indexOf(x) == -1));

        // save all the id car block
        this._listIdCarBlockMystery = listCarBlock.filter(x => x != null).map(x => x.getComponent(CarSys).GetIdCar());

        // unlock mystery car if no car block mặc dù theo degisn là xe đấy là xe ?
        if (this._listIdCarBlockMystery.length <= 0) {
            await this.UnlockCarMystery(this.InfoCar.idCar);
        }
    }

    public async UnlockCarMystery(idCar: number) {

        if (this.InfoCar.idCar == idCar) {
            this._listIdCarBlockMystery = [];
            this.InfoCar.SetMysteryCar(false);
            await this.UnlockCarMysteryDone(true);
        } else {
            if (this._listIdCarBlockMystery.length > 0) {
                const indexCarBlock: number = this._listIdCarBlockMystery.indexOf(idCar);
                if (indexCarBlock != -1) {
                    this._listIdCarBlockMystery.splice(indexCarBlock, 1);
                    if (this._listIdCarBlockMystery.length == 0) {
                        // show the visual car mystery
                        // and register car can Click
                        this.InfoCar.SetMysteryCar(false);
                        await this.UnlockCarMysteryDone();
                    }
                }
            }
        }
    }

    private async UnlockCarMysteryDone(isSelf: boolean = false) {
        await this.visualCarSys.UnlockCarMystery(this.InfoCar.direction, this.InfoCar.carSize, this.InfoCar.getITypeCar, this.InfoCar.colorByMColor);
        if (!isSelf && this._stateCarMoving == STATE_CAR_MOVING.NONE) {
            this.RegisterEventClickCar();
        }
    }
    // #endregion car mystery

    //================================================
    //#region car two way
    public async TrySwitchWayCar() {
        // chekc valid
        // 1: is two way car
        // 2: is not state move to end 
        if (this.InfoCar.IsTwoWayCar && this.StateCar == STATE_CAR.READY_TO_MOVE) {
            // switch arrow and direction car
            this.InfoCar.SwitchDirectionCar();
            const directionCheck = this.InfoCar.direction;
            // emit smoke
            const wPosSmoke = this.visualCarSys.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.TWO_WAY_CAR).getComponent(SupCarTwoWay2).spArrowFlash.node.worldPosition.clone();
            clientEvent.dispatchEvent(MConst.EVENT.PLAY_PARTICLE_SMOKE_CAR_TWO_WAY, wPosSmoke, this.InfoCar.direction);
            await Utils.delay(0.4 * 1000);
            if (this.InfoCar.direction == directionCheck) {
                this.SwitchWayCar();
            }
        }
    }

    private SwitchWayCar() {
        this.visualCarSys.UpdateSfArrowTwoWayCar(this._infoCar.direction, this._infoCar.carSize);
        this.visualCarSys.UpdateVisualCarMoveWithDirection(
            this.InfoCar.getITypeCar, this._infoCar.colorByMColor, this._infoCar.direction, this._infoCar.carSize
        )
    }
    //#endregion car two way
    //================================================

    //================================================
    //#region unlock car by key
    public async UnlockCarByKey(wPosCarKey: Vec3) {
        // update visual
        await this.visualCarSys.UnlockCarByKeyVisual(wPosCarKey.clone(), this.InfoCar.ColorKeyLock);
        // save new info
        this.InfoCar.SetCarIsLocking = false;
        // đưa xe về trạng thái bình thường
        this.visualCarSys.visualArrowCar.AutoUpdateArrow(this.InfoCar.direction, this.InfoCar.carSize, this.InfoCar.getITypeCar, this.InfoCar.colorByMColor);
        //emit to check can user booster shuffle
        clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_SHUFFLE);
    }

    private UnlockKeyLock() {
        const idCarUnlockByKey = this.InfoCar.IdCarLockOfCarKey;
        if (idCarUnlockByKey >= 0) {
            this._cbUnlockCarByKey(idCarUnlockByKey, this.visualCarSys.visualArrowCar.nArrow.worldPosition.clone());
        }
    }
    //#endregion unlock car by key
    //================================================

    //================================================
    //#region auto move car out parking
    private cbAutoMoveOutParking() {
        if (this._stateCar == STATE_CAR.READY_TO_DEPART) {
            this.ChangeState(STATE_CAR.MOVE_TO_THE_GATE);
        }
    }
    private ScheduleAutoMoveOutParking() {
        this.scheduleOnce(this.cbAutoMoveOutParking, MConfigs.TIME_SCHEDULE_AUTO_MOVE_TO_GATE)
    }

    private UnSheduleAutoMoveOutParking() {
        this.unschedule(this.cbAutoMoveOutParking);
    }
    //#endregion auto move car out parking
    //================================================

    //================================================
    //#region car ReindeerCart
    public async TryCarAutoMoveForward(idCarRemove: number) {
        // chekc valid
        // 1: is car auto move forward
        // 2: is not state move to end
        // ta sẽ giảm danh sách carId block
        if (idCarRemove >= 0) {
            this.InfoCar.TryRemoveIdCarBlockToAutoMoveForward(idCarRemove);
        }
        if (this.InfoCar.CanTriggerAutoMoveForward) {
            this.TryMoveCarForParking();
        }
    }
    //#endregion ReindeerCart
    //================================================

    //======================================
    //#region trigger
    protected TriggerCarReadyToMoveTheGround() { }
    protected TriggerInInitVisual(colorCar: M_COLOR, numPass: number, nCar: Node, iTypeCar: ITypeCar) { }
    protected TriggerInitCar() { }
    protected TriggerChangeStateCarMove() { }
    //#endregion trigger
}

//#region other func
function CheckCarCanMoveForwardByPoint(pointStartFromRoot: Vec3, directionCar: DIRECT_CAR, wPosRoot: Vec3, cbGetCarById: CallableFunction): boolean {
    const resultAfterRayCast: { wPointStart, listWPosEnd, listNCollider } = ShoutRayCast(pointStartFromRoot, directionCar, wPosRoot);

    // draw line check
    MyDrawSys.Instance.DrawLineWithTimeDisplay(resultAfterRayCast.wPointStart, resultAfterRayCast.listWPosEnd);

    let result = true;
    // console.log(resultAfterRayCast.listNCollider.map(x => x.getComponent(CarSys).StateCarMoving));
    // console.log("!1111111111", pointStartFromRoot, wPosRoot);



    for (const blockCar of resultAfterRayCast.listNCollider) {
        // console.log("blockCar", blockCar, blockCar.getComponent(HoldPlaceCarSys));

        if (blockCar != null) {
            if (blockCar.getComponent(HoldPlaceCarSys) != null && blockCar.active) {
                // check car has id is not moving to the park
                const nCar: Node = cbGetCarById(blockCar.getComponent(HoldPlaceCarSys).GetIdCar())
                if (nCar != null) {
                    const stateCarMoving: STATE_CAR_MOVING = nCar.getComponent(CarSys).StateCarMoving;
                    if (stateCarMoving == STATE_CAR_MOVING.NONE || stateCarMoving == STATE_CAR_MOVING.MOVING_TO_THE_BLOCK) {
                        // console.log("000000000", result);
                        result = false;
                    }
                }
            }
            if (blockCar.parent != null && blockCar.parent.getComponent(GarageSys) != null) {
                // console.log("1111111111", result);
                result = false;
            }
            if (blockCar.getComponent(ConveyorBeltSys) != null) {
                // console.log("22222222222", result);
                result = false;
            }
        }
    }
    return result;
}

function ShoutRayCast(pointStartFromRoot: Vec3, directionCar: DIRECT_CAR, wPosRoot: Vec3, justGetFirstBlock: boolean = true): { wPointStart: Vec3, listWPosEnd: Vec3[], listNCollider: Node[] } {
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

    let listCarBlock: Node[] = [];
    if (justGetFirstBlock) {
        listCarBlock.push(...CustomRayCastCheck.CheckAllCarBlock2(wPointStart.clone(), wPointEnd.clone()));
    } else {
        listCarBlock.push(...CustomRayCastCheck.CheckAllCarsBlock(wPointStart.clone(), wPointEnd.clone()));
    }

    return { wPointStart: wPointStart, listWPosEnd: [wPointEnd], listNCollider: listCarBlock };
}
//#endregion other func
