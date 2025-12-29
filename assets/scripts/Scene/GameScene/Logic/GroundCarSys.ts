import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame, Tween, UITransform, Vec2, Vec3 } from 'cc';
import { ConvertSizeCarFromJson, JsonCar, JsonGarage, JsonMapGame, JsonConveyorBelt, M_COLOR, STATE_CAR, TYPE_CAR_SIZE, STATE_CAR_MOVING, IsColorCanShuffle, STATE_PARKING_CAR, GetMColorByNumber } from '../../../Utils/Types';
import { CarSys } from './CarSys';
import { Utils } from '../../../Utils/Utils';
import { ConveyorBeltSys } from './ConveyorBelt/ConveyorBeltSys';
import { MConst } from '../../../Const/MConst';
import { GarageSys } from './GarageMini/GarageSys';
import { HoldPlaceCarSys } from './HoldPlaceCarSys';
import { clientEvent } from '../../../framework/clientEvent';
import { QueueCarCanMoveToGateSys } from './QueueCarCanMoveToGateSys';
const { ccclass, property } = _decorator;

@ccclass('GroundCarSys')
export class GroundCarSys extends Component {
    @property(Prefab) prefabCar4Cho: Prefab;
    @property(Prefab) prefabCar6Cho: Prefab;
    @property(Prefab) prefabCar10Cho: Prefab;
    @property(Prefab) prefabGarage: Prefab;
    @property(Prefab) prefabConveyorBelt: Prefab;
    @property(Prefab) pfCarReIndeerCart: Prefab;
    @property(Node) nMapCar: Node;
    @property(Node) nTempCar: Node;
    @property(Node) nSizeMapGroundCar: Node;
    @property(Node) nPlaceHolderCar: Node;
    @property(Node) nMapCar_2: Node;

    private _cbGetNParkingCarByState: CallableFunction = null;
    private _cbGetNParkingCarById: CallableFunction = null;
    private _cbGetNParkingVipSlot: CallableFunction = null;

    private _queueCarCanMoveToGate: QueueCarCanMoveToGateSys = null;

    private _autoIncreaseIdCar: number = 1; private GenIdCar(): number { return this._autoIncreaseIdCar++; }
    private _autoIncreaseIdConveyorBelt: number = 0; private GenIdConveyorBelt(): number { return this._autoIncreaseIdConveyorBelt++; }
    private _autoIncreaseIdGarage: number = 0; private GenIdGarage(): number { return this._autoIncreaseIdGarage++; }
    private listCar: Node[] = []; public GetListCar(): Node[] { return Utils.CloneListDeep(this.listCar); } public get ListCar() { return this.listCar; }
    private listConveyorBelt: Node[] = [];
    private listGarage: Node[] = [];

    private _scaleMap: number = 1;

    private _numCarsPreviouslyReadyTakePassengerStatus: number = 0;

    protected onEnable(): void {
        clientEvent.on(MConst.CONVEYOR_BELT_EVENT.CAR_MOVE_OUT, this.PauseAllBelt, this);
        clientEvent.on(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, this.ResumeAllBelt, this);
        clientEvent.on(MConst.CONVEYOR_BELT_EVENT.REMOVE_CAR_FROM_QUEUE, this.RemoveCarFromQueue, this);
        clientEvent.on(MConst.EVENT.MOVE_ALL_CAR_SAVE_TO_BACKGROUND, this.MoveAllCarSaveToGroundRight, this);

        clientEvent.on(MConst.EVENT_CAR.UPDATE_CAR_MYSTERY, this.UpdateCarMystery, this);
        clientEvent.on(MConst.EVENT_CAR.PLAY_EF_BLOCK_CAR_MOVE, this.UpdateEFCar, this);

        clientEvent.on(MConst.EVENT_CAR.TRIGGER_CAR_AUTO_MOVE_FORWARD, this.TriggerCarAutoMoveForward, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.CONVEYOR_BELT_EVENT.CAR_MOVE_OUT, this.PauseAllBelt, this);
        clientEvent.off(MConst.CONVEYOR_BELT_EVENT.RESUME_CONVEYOR_BELT, this.ResumeAllBelt, this);
        clientEvent.off(MConst.CONVEYOR_BELT_EVENT.REMOVE_CAR_FROM_QUEUE, this.RemoveCarFromQueue, this);
        clientEvent.off(MConst.EVENT.MOVE_ALL_CAR_SAVE_TO_BACKGROUND, this.MoveAllCarSaveToGroundRight, this);

        clientEvent.off(MConst.EVENT_CAR.UPDATE_CAR_MYSTERY, this.UpdateCarMystery, this);
        clientEvent.off(MConst.EVENT_CAR.PLAY_EF_BLOCK_CAR_MOVE, this.UpdateEFCar, this);

        clientEvent.off(MConst.EVENT_CAR.TRIGGER_CAR_AUTO_MOVE_FORWARD, this.TriggerCarAutoMoveForward, this);
    }

    private isDecreasePosMapFrenzy: boolean = false;
    async SetUp(dataMap: JsonMapGame, queueCarCanMoveToGateSys: QueueCarCanMoveToGateSys
        , cbGetNParkingCarByState: CallableFunction, cbGetNParkingCarById: CallableFunction, cbGetNParkingVipSlot: CallableFunction,
        needAutoScale: boolean = false) {

        // set cb
        this._queueCarCanMoveToGate = queueCarCanMoveToGateSys;
        this._cbGetNParkingCarById = cbGetNParkingCarById;
        this._cbGetNParkingCarByState = cbGetNParkingCarByState;
        this._cbGetNParkingVipSlot = cbGetNParkingVipSlot;


        /**
         * ================================================================
         * ================================================================
         * NOTE NOT GOOD ONLY USE FOR MAP FRENZY
         * ================================================================
         * ================================================================
         */
        // check the scale of map first than set to same it
        // this code below is just use for map frenzy
        if (needAutoScale) {
            if (!this.isDecreasePosMapFrenzy) {
                this.nMapCar_2.position = this.nMapCar.position = this.nMapCar.position.clone().add3f(0, -40, 0);
                this.isDecreasePosMapFrenzy = true;
            }

            const heightMapTrue: number = this.nSizeMapGroundCar.getComponent(UITransform).height;
            const heightMapSet: number = this.nMapCar.getComponent(UITransform).height;
            const maxPosYReach: number = (heightMapTrue - heightMapSet / 2) - 20;
            const minPosXReach: number = - this.nMapCar.getComponent(UITransform).width / 2 + 20;
            const minPosYReach: number = -heightMapSet / 2 + 50;
            const scaleChoice = GetScaleMap(dataMap, minPosXReach, maxPosYReach, minPosYReach, heightMapTrue);
            this.nMapCar_2.scale = this.nMapCar.scale = this.nPlaceHolderCar.scale = Vec3.ONE.clone().multiplyScalar(scaleChoice);
            this._scaleMap = scaleChoice;

            // console.log("scale map", scaleChoice);
        }

        /**
         * ================================================================
         * ================================================================
         */

        // init car first
        for (let i = 0; i < dataMap.CarInfo.length; i++) {
            const jsonCar: JsonCar = dataMap.CarInfo[i];
            let nCar: Node = this.GenCar(jsonCar, true, this.nMapCar).nCar;
            nCar.getComponent(CarSys).EmitToInitPlaceHoldCar();
        }

        // init garage
        if (dataMap.GarageInfo != null && dataMap.GarageInfo.length > 0) {
            for (let i = 0; i < dataMap.GarageInfo.length; i++) {
                const jsonGarage: JsonGarage = dataMap.GarageInfo[i];
                let nGarage: Node = this.GenGarage(jsonGarage);
            }
        }

        // init Conveyor Belt third
        if (dataMap.ConveyorBeltInfo != null && dataMap.ConveyorBeltInfo.length > 0) {
            for (let i = 0; i < dataMap.ConveyorBeltInfo.length; i++) {
                const jsonConveyorBelt: JsonConveyorBelt = dataMap.ConveyorBeltInfo[i];
                let nConveyorBelt: Node = this.GenConveyorBelt(jsonConveyorBelt);
            }
        }
    }

    private IncreaseCarsWasReadyTakePassenger() {
        this._numCarsPreviouslyReadyTakePassengerStatus += 1;
        this.TryCallTimeCooldown();
    }

    // #region INIT CAR
    /**
     * 
     * @param jsonCar 
     * @param needPushToListCar if it affected by swap color car => you need to add it to the list car 
     * @param parent 
     * @returns 
     */
    private GenCar(jsonCar: JsonCar, needPushToListCar: boolean, parent: Node = this.nMapCar): { nCar: Node, idCar: number } {
        // tiếp tục genIdCar vì xe trong garage và belt ở những lvFrenzy không có id car => ta cần gọi genIdCar ở đây để khi có xe trong belt hoặc garage thì vẫn sẽ có id
        this.GenIdCar();
        const idCar = jsonCar.idCar;
        let carSize: TYPE_CAR_SIZE = ConvertSizeCarFromJson(jsonCar.carSize);
        let nCar: Node = this.InitNCar(carSize, GetMColorByNumber(jsonCar.carColor) == M_COLOR.REINDEER_CART);
        nCar.active = true;
        nCar.setParent(parent);
        nCar.getComponent(CarSys).RegisterCb(
            this._cbGetNParkingCarByState, this.GetListCarReadyToMove.bind(this), this._cbGetNParkingCarById,
            this._cbGetNParkingVipSlot, this.SetParentCarToGround.bind(this), this.CheckCarCanMoveThroughByIdCar.bind(this),
            this.GetCarById.bind(this),
            this._queueCarCanMoveToGate.SetIdCarReadyToMove.bind(this._queueCarCanMoveToGate),   // phương thức này được dùng để set id car đã sẵn sàng di chuyển vào trong danh sách hàng đợi
            this.UpdateQueuePassWaitCar.bind(this),
            this.UpdateQueueWhenCarParking.bind(this),
            this.UpdateCarMystery.bind(this),
            () => { return this._scaleMap; },
            this.GetNumChildInGround.bind(this),
            this.SwitchWayAllCarTwoWay.bind(this),
            this.UnlockCarByKey.bind(this),
            this.IncreaseCarsWasReadyTakePassenger.bind(this),
            this.TriggerCarAutoMoveForward.bind(this)
        );
        nCar.getComponent(CarSys).Init(jsonCar, idCar, this.nMapCar);
        if (needPushToListCar) {
            this.listCar.push(nCar);
        }
        return { nCar: nCar, idCar: idCar };
    }

    private CheckCarCanMoveThroughByIdCar(idCarCheck: number) {
        let nCar: Node = this.listCar.find(element => element.getComponent(CarSys) != null && element.getComponent(CarSys).InfoCar.idCar == idCarCheck);
        if (nCar != null) {
            return nCar.getComponent(CarSys).StateCarMoving == STATE_CAR_MOVING.MOVING_TO_THE_PARK;
        }
        return false;
    }

    private SetParentCarToGround(nCar: Node, siblingIndex: number = -1) {
        nCar.setParent(this.nMapCar);
        if (siblingIndex != -1) {
            nCar.setSiblingIndex(siblingIndex);
        }
    }

    private GetListCarReadyToMove(): Node[] {
        const arrayCheck = Array.from(this.listCar);
        return arrayCheck.filter(element => element != undefined && element != null && element.getComponent(CarSys).GetState() == STATE_CAR.READY_TO_MOVE);
    }

    public GetAllCarCanPickUpPassenger(): Node[] {
        const arrayCheck = Array.from(this.listCar);
        return arrayCheck.filter(element => element != undefined && element != null && element.getComponent(CarSys).GetState() == STATE_CAR.READY_TO_PICK_UP_PASSENGER);
    }

    public RegisterClickCarMystery() {
        for (const car of this.listCar) {
            car.getComponent(CarSys).RegisterCarsBlockMystery();
        }
    }

    public UpdateCarMystery(idCar: number) {
        this.listCar.forEach(car => {
            car.getComponent(CarSys).UnlockCarMystery(idCar);
        })
    }

    public UpdateEFCar(idCar, vecOtherMove: Vec2) {
        this.listCar.find(car => car.getComponent(CarSys).InfoCar.idCar == idCar)?.getComponent(CarSys).EffCarSys.PlayEfBlockCarMove(idCar, vecOtherMove);
    }

    public GetNumChildInGround(): number {
        return this.nMapCar.children.length;
    }

    // public TryStartTimeAllCars() {
    //     this.listCar.forEach(item => {
    //         if (item != null) {
    //             item.getComponent(CarSys).InfoCar.StartReduceTimeCarRemainingCallCooldown();
    //         }
    //     })
    // }

    public TryCallTimeCooldown() {
        this.listCar.forEach(item => {
            if (item != null) {
                const comCar = item.getComponent(CarSys);
                if (comCar.InfoCar.NumCarRemaingingCallCoolDown == this._numCarsPreviouslyReadyTakePassengerStatus
                    && (comCar.StateCar == STATE_CAR.READY_TO_MOVE || (comCar.StateCar == STATE_CAR.MOVING && comCar.StateCarMoving == STATE_CAR_MOVING.MOVING_TO_THE_BLOCK))
                ) {
                    comCar.InfoCar.StartReduceTimeCarRemainingCallCooldown_2();
                }
            }
        })
    }

    private SwitchWayAllCarTwoWay() {
        this.listCar.forEach(item => {
            if (item != null) {
                item.getComponent(CarSys).TrySwitchWayCar();
            }
        })
    }

    private TriggerCarAutoMoveForward(idCarRemove: number = -1) {
        return;
        for (const item of this.listCar) {
            if (item != null) {
                const carCom = item.getComponent(CarSys);
                if (carCom.InfoCar.IsCarAutoMoveForward && carCom.StateCar == STATE_CAR.READY_TO_MOVE) {
                    // call remove id
                    if (idCarRemove >= 0) {
                        carCom.InfoCar.TryRemoveIdCarBlockToAutoMoveForward(idCarRemove);
                    }

                    // check can trigger auto move
                    if (carCom.InfoCar.CanTriggerAutoMoveForward) {
                        const nParking = this._cbGetNParkingCarByState(STATE_PARKING_CAR.EMPTY);
                        // console.warn("Trigger Car",);

                        // kiểm tra còn chỗ đỗ xe ko
                        if (nParking != null) {
                            carCom.TryCarAutoMoveForward(idCarRemove);
                        } else {
                            // console.error("OPsosapdoasdkaksdasdasd");
                            break;
                        }
                    }
                }
            }
        }
    }

    private UnlockCarByKey(idCarLock: number, wPosCarKey: Vec3) {
        const nCarLock: Node = this.GetCarById(idCarLock);
        nCarLock.getComponent(CarSys).UnlockCarByKey(wPosCarKey);
    }
    // #endregion INIT CAR

    //#region INIT GARAGE
    private GenGarage(jsonGarage: JsonGarage): Node {
        let nGarage: Node = instantiate(this.prefabGarage);
        const idGarage: number = this.GenIdGarage();
        nGarage.name = `Garage_${idGarage}_${jsonGarage.direction}`;
        nGarage.setParent(this.nMapCar);
        const posGarage = new Vec3(jsonGarage.garagePosition.x, jsonGarage.garagePosition.y, 0);
        nGarage.worldPosition = Utils.ConvertPosToWorldOfANode(this.nMapCar.worldPosition.clone(), posGarage.clone(), MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS * this.nMapCar.scale.x);
        nGarage.getComponent(GarageSys).Init(jsonGarage, idGarage, this.GenCar.bind(this), this.SetIdGarageToCar.bind(this),
            this.GetIdCarByGarage.bind(this), this.RegisterClickCar.bind(this), () => { return this._scaleMap });
        this.listGarage.push(nGarage);

        (async () => {
            await Utils.delay(1 * 1000); // NOT GOOD BUT YOU NEED TO WAIT TO ENSURE ALL THE CAR IN MAP WAS SET CORRECTLY
            nGarage.getComponent(GarageSys).TryGenCarForce();
        })()
        return nGarage;
    }

    private SetIdGarageToCar(nCar: Node, idGarage: number) {
        nCar.getComponent(CarSys).InfoCar.SetIdGarage(idGarage);
    }

    private GetIdCarByGarage(listNCar: Node[]): number {
        for (let i = 0; i < listNCar.length; i++) {
            const nCar = listNCar[i];
            if (nCar != null && nCar.getComponent(HoldPlaceCarSys) != null) {
                const idCarBlock: number = nCar.getComponent(HoldPlaceCarSys).IdCar;
                const nCarBlock = this.GetCarById(idCarBlock);
                if (nCarBlock == null) {
                    console.error("wrong to get id car by garage", idCarBlock);
                    return -1;
                }
                const stateCar: STATE_CAR = nCarBlock.getComponent(CarSys).StateCar;
                const stateCarMoving: STATE_CAR_MOVING = nCarBlock.getComponent(CarSys).StateCarMoving;
                if (nCarBlock != null && stateCar == STATE_CAR.READY_TO_MOVE ||
                    (stateCar == STATE_CAR.MOVING && stateCarMoving == STATE_CAR_MOVING.MOVING_TO_THE_BLOCK)) {
                    return idCarBlock;
                }
            }
        }
        return -1;
    }

    private RegisterClickCar(nCar: Node, canClick: boolean) {
        if (canClick) {
            nCar.getComponent(CarSys).RegisterEventClickCar();
        } else {
            nCar.getComponent(CarSys).UnRegisterEventClickCar();
        }
    }
    //#endregion INIT GARAGE

    //#region INIT CONVEYOR BELT
    private GenConveyorBelt(jsonConveyorBelt: JsonConveyorBelt): Node {
        let nConveyorBelt: Node = instantiate(this.prefabConveyorBelt);
        const idConveyorBelt: number = this.GenIdConveyorBelt();
        nConveyorBelt.name = `ConveyorBelt_${idConveyorBelt}_${jsonConveyorBelt.direction}`;
        nConveyorBelt.setParent(this.nMapCar);
        const posConveyorBelt = new Vec3(jsonConveyorBelt.conveyorBeltPosition.x, jsonConveyorBelt.conveyorBeltPosition.y, 0);
        nConveyorBelt.worldPosition = Utils.ConvertPosToWorldOfANode(this.nMapCar.worldPosition.clone(), posConveyorBelt.clone(), MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS * this.nMapCar.scale.x);
        nConveyorBelt.getComponent(ConveyorBeltSys).Init(jsonConveyorBelt, idConveyorBelt, this.GenCar.bind(this), this.SetIdConveyorBeltToCar.bind(this));
        this.listConveyorBelt.push(nConveyorBelt);
        return nConveyorBelt;
    }

    private SetIdConveyorBeltToCar(nCar: Node, idConveyorBelt: number) {
        nCar.getComponent(CarSys).InfoCar.SetCarIdConveyorBelt(idConveyorBelt);
    }
    //#endregion INIT CONVEYOR BELT

    public ResetData() {
        this._cbGetNParkingCarById = null;
        this._cbGetNParkingCarByState = null;
        this._cbGetNParkingVipSlot = null;

        // reset auto Gen id Car
        this._autoIncreaseIdCar = 0;
        this._autoIncreaseIdGarage = 0;
        this._autoIncreaseIdConveyorBelt = 0;

        // reset car in the ground
        this.nTempCar.children.forEach(element => {
            Tween.stopAllByTarget(element);
            element.getComponent(CarSys).ResetData();
            this.ReUseNCar(element);
        });
        this.listCar.forEach(element => {
            Tween.stopAllByTarget(element);
            element.getComponent(CarSys).ResetData();
            this.ReUseNCar(element);
        })
        this.listCar = [];

        // reset ham xe
        this.listGarage.forEach(element => element.destroy()); // TODO not good
        this.listGarage = [];

        // reset the transmission
        this.listConveyorBelt.forEach(element => {
            // get all the car of list destroy first
            // than destory it_self
            element.getComponent(ConveyorBeltSys).ClearAll();
            // element.getComponent(ConveyorBeltSys).GetListNCar().forEach(car => car.destroy());
            element.destroy();
        }); // TODO not good
        this.listConveyorBelt = [];

        // other param
        this._numCarsPreviouslyReadyTakePassengerStatus = 0;
        this._mapSaveWhenChange = new Map();
    }

    public HasAnyCarCanSort(): boolean {
        // get list car has state is READY_TO_PICK_UP_PASSENGER
        const listNCar: Node[] = this.GetListNCarByState(STATE_CAR.READY_TO_PICK_UP_PASSENGER);
        const isAllCarValid: boolean = listNCar.every(nCar => nCar.getComponent(CarSys).CanSort());
        return isAllCarValid;
    }

    public HasAnyCarCanVip(): boolean {
        const listNCarValid: Node[] = this.GetListNCarByState(STATE_CAR.READY_TO_MOVE)
            .filter(car => car.getComponent(CarSys).CanVip());
        return listNCarValid.length > 0;
    }

    public GetCarByState(stateCar: STATE_CAR): Node {
        return this.listCar.filter(element => element != null && element.getComponent(CarSys).GetState() == stateCar)[0];
    }

    public GetCarByMovingState(stateMovingCar: STATE_CAR_MOVING): Node {
        return this.listCar.filter(element => element != null && element.getComponent(CarSys).StateCarMoving == stateMovingCar)[0];
    }

    public GetCarById(idCar: number): Node {
        let carInGround = this.listCar.filter(element => element != null && element.getComponent(CarSys).InfoCar.idCar == idCar)[0];
        if (carInGround == null) {
            for (let i = 0; i < this.listConveyorBelt.length; i++) {
                const belt = this.listConveyorBelt[i];
                let nCarBelt = belt.getComponent(ConveyorBeltSys).GetListNCar_NotMoveOut().filter(element => element != null && element.getComponent(CarSys).InfoCar.idCar == idCar)[0];
                if (nCarBelt != null) {
                    return nCarBelt;
                }
            }
        } else {
            return carInGround;
        }

        return null;
    }

    public GetListNCarByState(stateCar: STATE_CAR): Node[] {
        return this.listCar.filter(element => element != null && element.getComponent(CarSys).GetState() == stateCar);
    }

    public GetListNCarByListState(listStateCar: STATE_CAR[]): Map<STATE_CAR, Node[]> {
        let result = new Map<STATE_CAR, Node[]>();
        listStateCar.forEach(state => {
            result.set(state, []);
        })

        // loop
        this.listCar.forEach(car => {
            if (car != null) {
                const stateCheck = car.getComponent(CarSys).GetState();
                if (result.has(stateCheck)) {
                    result.get(stateCheck).push(car);
                }
            }
        })

        // loop all car in the belt which is out
        this.listConveyorBelt.forEach(belt => {
            const listCarMoveOut = belt.getComponent(ConveyorBeltSys).GetListNCar_MoveOut();
            listCarMoveOut.forEach(car => {
                if (car != null) {
                    const stateCheck = car.getComponent(CarSys).GetState();
                    if (result.has(stateCheck)) {
                        result.get(stateCheck).push(car);
                    }
                }
            })
        })


        return result;
    }

    public GetListNCarByListStateOfAllBelts(listStateCar: STATE_CAR[]): Map<STATE_CAR, Node[]> {
        let result = new Map<STATE_CAR, Node[]>();
        listStateCar.forEach(state => {
            result.set(state, []);
        })

        // loop the cars of belt
        this.listConveyorBelt.forEach(belt => {
            belt.getComponent(ConveyorBeltSys).GetListNCar_NotMoveOut().forEach(car => {
                const stateCheck = car.getComponent(CarSys).GetState();
                if (result.has(stateCheck)) {
                    result.get(stateCheck).push(car);
                }
            })
        })

        return result;
    }

    public HasAnyBelt(): boolean {
        return this.listConveyorBelt.length > 0;
    }

    //#region FUNC REUSE CAR
    private InitNCar(carSize: TYPE_CAR_SIZE, isCarReindeerCart: boolean): Node {

        // check car get is suit for carSize
        let nCheck = this.nTempCar.children[0];
        if (nCheck != null && nCheck.getComponent(CarSys).InfoCar.carSize == carSize) {
            return this.nTempCar.children[0];
        }

        switch (true) {
            case isCarReindeerCart: return instantiate(this.pfCarReIndeerCart);
            case carSize == TYPE_CAR_SIZE['4_CHO']: return instantiate(this.prefabCar4Cho);
            case carSize == TYPE_CAR_SIZE['6_CHO']: return instantiate(this.prefabCar6Cho);
            case carSize == TYPE_CAR_SIZE['10_CHO']: return instantiate(this.prefabCar10Cho);
        }

        return null;
    }

    private ReUseNCar(nCar: Node) {
        nCar.active = false;
        nCar.setParent(this.nTempCar);
    }
    //#endregion FUNC REUSE CAR

    // #region SORT PASSENGER
    public GetListNCarByListIdParkingCar(listIdParkingCar: number[]): Node[] {
        const result: Node[] = [];

        listIdParkingCar.forEach(id => {
            const carNode = this.listCar.find(car => car.getComponent(CarSys).idParkingCar === id && car.getComponent(CarSys).GetState() == STATE_CAR.READY_TO_PICK_UP_PASSENGER);
            if (carNode) {
                result.push(carNode);
            }
        });

        return result;
    }
    // #endregion SORT PASSENGER

    //#region SHUFFLE CAR

    public CheckHaveCarCanChangeColor(): boolean {
        // logic check have more than 1 car same size and different color
        let listNCarChangeColor: Node[] = this.listCar.filter(element => {
            const valid1 = element != null;
            const valid2 = element.getComponent(CarSys).CanShuffle();
            return valid1 && valid2;
        });
        const listSizeCarTotal: TYPE_CAR_SIZE[] = listNCarChangeColor.map(element => element.getComponent(CarSys).InfoCar.carSize);
        const setSizeCars = new Set(listSizeCarTotal);
        const listColorsSameSize: M_COLOR[][] = [];
        for (const typeSize of setSizeCars) {
            const listCarsSameSize: Node[] = listNCarChangeColor.filter(car => car.getComponent(CarSys).InfoCar.carSize == typeSize);
            const setColor: M_COLOR[] = listCarsSameSize
                .filter(car => IsColorCanShuffle(car.getComponent(CarSys).InfoCar.colorByMColor))
                .map(car => car.getComponent(CarSys).InfoCar.colorByMColor);
            const setColors = new Set(setColor);
            // console.log("check size", setColors, typeSize);
            if (setColors.size > 1) {
                listColorsSameSize.push(listCarsSameSize
                    .filter(car => IsColorCanShuffle(car.getComponent(CarSys).InfoCar.colorByMColor))
                    .map(car => car.getComponent(CarSys).InfoCar.colorByMColor)
                );
            }
        }
        // console.log(listNCarChangeColor);
        return listColorsSameSize.length > 0;
    }

    public async ShuffleColorCarInGround() {
        let listNCarChangeColor: Node[] = this.listCar.filter(element => {
            const valid1 = element != null;
            const valid2 = element.getComponent(CarSys).CanShuffle();
            return valid1 && valid2;
        });
        const listColorTotal: M_COLOR[] = listNCarChangeColor
            .filter(element => IsColorCanShuffle(element.getComponent(CarSys).InfoCar.colorByMColor))
            .map(element => element.getComponent(CarSys).InfoCar.colorByMColor);

        function filterListCar(input: Node[], typeCarSize: TYPE_CAR_SIZE): Node[] {
            let result: Node[] = input.filter(element => {
                const eleCom = element.getComponent(CarSys).InfoCar;
                return eleCom.carSize == typeCarSize && IsColorCanShuffle(eleCom.colorByMColor);
            })
            return result;
        }
        let listNCarChangeColorSize4: Node[] = filterListCar(listNCarChangeColor, TYPE_CAR_SIZE['4_CHO']);
        let listNCarChangeColorSize6: Node[] = filterListCar(listNCarChangeColor, TYPE_CAR_SIZE['6_CHO']);
        let listNCarChangeColorSize10: Node[] = filterListCar(listNCarChangeColor, TYPE_CAR_SIZE['10_CHO']);

        let listColorSuffleForCarSize4: M_COLOR[] = Utils.shuffleListForced(listNCarChangeColorSize4.map(element => element.getComponent(CarSys).InfoCar.colorByMColor));
        let listColorSuffleForCarSize6: M_COLOR[] = Utils.shuffleListForced(listNCarChangeColorSize6.map(element => element.getComponent(CarSys).InfoCar.colorByMColor));
        let listColorSuffleForCarSize10: M_COLOR[] = Utils.shuffleListForced(listNCarChangeColorSize10.map(element => element.getComponent(CarSys).InfoCar.colorByMColor));

        let listShuffle1: M_COLOR[] = Utils.shuffleList(listColorTotal);
        let listShuffle2: M_COLOR[] = Utils.shuffleList(listColorTotal);

        // change color of all car
        const timeWaitNextChangeColor: number = 0.3;

        listNCarChangeColor.forEach((element, index) => {
            element.getComponent(CarSys).ChangeColorByMColor(listShuffle1[index]);
        });
        await Utils.delay(timeWaitNextChangeColor * 1000);
        listNCarChangeColor.forEach((element, index) => {
            element.getComponent(CarSys).ChangeColorByMColor(listShuffle2[index]);
        });
        await Utils.delay(timeWaitNextChangeColor * 1000);

        listNCarChangeColorSize4.forEach((element, index) => {
            element.getComponent(CarSys).ChangeColorByMColor(listColorSuffleForCarSize4[index]);
        });
        listNCarChangeColorSize6.forEach((element, index) => {
            element.getComponent(CarSys).ChangeColorByMColor(listColorSuffleForCarSize6[index]);
        });
        listNCarChangeColorSize10.forEach((element, index) => {
            element.getComponent(CarSys).ChangeColorByMColor(listColorSuffleForCarSize10[index]);
        });
        await Utils.delay(timeWaitNextChangeColor / 4 * 1000);
    }

    public async ShuffleColorCarInGround_2() {
        let listNCarChangeColor: Node[][] = this.GetListShuffleCar();
        let listArr1CarChangeColor: Node[] = listNCarChangeColor.flat();

        function filterListCar(input: Node[], typeCarSize: TYPE_CAR_SIZE): Node[] {
            let result: Node[] = input.filter(element => {
                const eleCom = element.getComponent(CarSys).InfoCar;
                return eleCom.carSize == typeCarSize && IsColorCanShuffle(eleCom.colorByMColor);
            })
            return result;
        }
        let listNCarChangeColorSize4: Node[] = filterListCar(listArr1CarChangeColor, TYPE_CAR_SIZE['4_CHO']);
        let listNCarChangeColorSize6: Node[] = filterListCar(listArr1CarChangeColor, TYPE_CAR_SIZE['6_CHO']);
        let listNCarChangeColorSize10: Node[] = filterListCar(listArr1CarChangeColor, TYPE_CAR_SIZE['10_CHO']);

        let listColorSuffleForCarSize4: M_COLOR[] = Utils.shuffleListForced(listNCarChangeColorSize4.map(element => element.getComponent(CarSys).InfoCar.colorByMColor));
        let listColorSuffleForCarSize6: M_COLOR[] = Utils.shuffleListForced(listNCarChangeColorSize6.map(element => element.getComponent(CarSys).InfoCar.colorByMColor));
        let listColorSuffleForCarSize10: M_COLOR[] = Utils.shuffleListForced(listNCarChangeColorSize10.map(element => element.getComponent(CarSys).InfoCar.colorByMColor));

        let mapColorShuffleCarSize4: Map<number, M_COLOR> = new Map();
        let mapColorShuffleCarSize6: Map<number, M_COLOR> = new Map();
        let mapColorShuffleCarSize10: Map<number, M_COLOR> = new Map();

        // Build maps from car id to shuffled color for each car size
        listNCarChangeColorSize4.forEach((car, idx) => {
            mapColorShuffleCarSize4.set(car.getComponent(CarSys).InfoCar.idCar, listColorSuffleForCarSize4[idx]);
        });
        listNCarChangeColorSize6.forEach((car, idx) => {
            mapColorShuffleCarSize6.set(car.getComponent(CarSys).InfoCar.idCar, listColorSuffleForCarSize6[idx]);
        });
        listNCarChangeColorSize10.forEach((car, idx) => {
            mapColorShuffleCarSize10.set(car.getComponent(CarSys).InfoCar.idCar, listColorSuffleForCarSize10[idx]);
        });

        // ================== change color of all car ============================
        function GetTheRightColor(idCar: number): M_COLOR {
            let color4 = mapColorShuffleCarSize4.get(idCar);
            if (color4 != null) return color4;
            let color6 = mapColorShuffleCarSize6.get(idCar);
            if (color6 != null) return color6;
            let color10 = mapColorShuffleCarSize10.get(idCar);
            if (color10 != null) return color10;
            return null;
        }

        async function ChangeColorCar(nCar: Node, mColorLast: M_COLOR) {
            const timeDelayChangeCar: number = 0.05;
            const listColorCanShuffle: M_COLOR[] = [M_COLOR.BLUE, M_COLOR.BLACK, M_COLOR.CYAN, M_COLOR.GREEN, M_COLOR.ORANGE, M_COLOR.PINK];
            const resultShuffleColor = Utils.shuffleListForced(listColorCanShuffle);
            const comCar = nCar.getComponent(CarSys);

            // emit event
            clientEvent.dispatchEvent(MConst.EVENT.PLAY_EF_BLINH_SHUFFLE, nCar.worldPosition.clone());

            for (let i = 0; i < resultShuffleColor.length; i++) {
                const colorChoice = resultShuffleColor[i];
                comCar.ChangeColorByMColor(colorChoice);
                await Utils.delay(timeDelayChangeCar * 1000);
            }

            // change to the last color
            comCar.ChangeColorByMColor(mColorLast, true);
        }

        const timeWaitNextRecChangeColor: number = 0.2;
        let lastIndexRecHasCarToChange = -1;
        for (let i = listNCarChangeColor.length - 1; i >= 0; i--) {
            if (listNCarChangeColor[i].length > 0) {
                lastIndexRecHasCarToChange = i;
                break;
            }
        }
        // console.log(listNCarChangeColor.length, listNCarChangeColor);

        for (let indexRec = 0; indexRec < listNCarChangeColor.length; indexRec += 1) {
            const listCarInRec: Node[] = listNCarChangeColor[indexRec];
            for (let indexCar = 0; indexCar < listCarInRec.length; indexCar++) {
                const nCarCheck = listCarInRec[indexCar];
                const colorRight = GetTheRightColor(nCarCheck.getComponent(CarSys).InfoCar.idCar);
                if (colorRight == null) { continue; }
                ChangeColorCar(nCarCheck, colorRight);
            }

            // chỉ wait cho tới danh sách những rec có xe có thể swap
            if (indexRec <= (lastIndexRecHasCarToChange + 1)) {
                await Utils.delay(timeWaitNextRecChangeColor * 1000);
            }
        }
    }

    private GetListShuffleCar(): Node[][] {
        let result: Node[][] = [];
        let listCarCheck: Node[] = Array.from(this.listCar.filter(element => {
            const valid1 = element != null;
            const valid2 = element.getComponent(CarSys).CanShuffle();
            return valid1 && valid2;
        }));

        // === filter cho từng lô =========
        const diffX = 100;
        for (let x = 0; x < 2000; x += diffX) {
            let recCheck: Node[] = [];
            const lengthListCheck = listCarCheck.length;
            for (let indexCar: number = 0; indexCar < lengthListCheck; indexCar++) {
                const nCarCheck: Node = listCarCheck[indexCar];
                if (nCarCheck.worldPosition.x >= x && nCarCheck.worldPosition.x < (x + diffX)) {
                    recCheck.push(nCarCheck);
                }
            }

            // add result and remove element in the old list
            listCarCheck = listCarCheck.filter(element => !recCheck.includes(element))
            result.push(recCheck);
        }

        return result;
    }
    //#endregion SHUFFLE CAR

    //#region QUEUE
    private UpdateQueueWhenCarParking() {
        const listCarReadyPickUp = this.GetAllCarCanPickUpPassenger();
        this._queueCarCanMoveToGate.CheckCarCanPass(listCarReadyPickUp);
    }

    private async UpdateQueuePassWaitCar() {


        // logic ở đây là: kiểm tra xem đã có đủ 2 xe sẵn sàng di chuyển hay chưa? 
        // nếu đã có đủ 2 xe sẵn sàng di chuyển rùi thì sẽ lấy id của 2 xe đó và để ở trạng thái sẵn sàng di chuyển

        // tuy nhiên trong trường hợp đang set dữ liệu để xe đỗ vào thì ta sẽ đợi cho đến khi xét duyệt xong mới cho di chuyển

        // ta sử dụng try catch ở đây là vì async await ko bt lúc nào mới chạy xong
        try {
            await Utils.WaitReceivingDone(() => { return !this._queueCarCanMoveToGate._isUpdatingQueue })

            // lấy danh sách những xe đã sẵn sàng lăn bánh
            const listIdCarReady = this._queueCarCanMoveToGate.GetListIdCarReady();

            // nếu trong danh sách ở hàng đợi chỉ có 1 xe => cho lăn luôn
            // hoặc nếu danh sách lọc những xe sẵn sàng lăn bánh có nhiều hơn 2 xe thì cũng cho lăn luôn
            if (this._queueCarCanMoveToGate.GetListIdCarCanMove.length == 1 || listIdCarReady.length >= 2) {
                // cho xe chạy
                for (const idCar of listIdCarReady) {
                    let nCar = this.GetCarById(idCar);
                    const comCar = nCar.getComponent(CarSys);
                    if (comCar.StateCar == STATE_CAR.READY_TO_DEPART) {
                        this.GetCarById(idCar).getComponent(CarSys).ChangeState(STATE_CAR.MOVE_TO_THE_GATE);
                    }
                }

                // loại bõ những xe đã cho chạy
                this._queueCarCanMoveToGate.RemoveListIdCar(listIdCarReady);
            }
        } catch (e) {
            console.log(e);
        }

    }

    //#endregion QUEUE


    // #region ConveyorBelt
    public RemoveCarFromQueue(idBelt: number, idCar: number) {
        if (idBelt != -1 && idCar != -1) {
            const nBelt = this.listConveyorBelt.find(belt => belt.getComponent(ConveyorBeltSys).infoConveyorBelt.IDConveyorBelt == idBelt);
            nBelt.getComponent(ConveyorBeltSys).RemoveCarOutQueue(idCar);
        }
    }

    public PauseAllBelt(idBelt: number, idCar: number) {
        if (idCar == -1) {
            this.listConveyorBelt.forEach(belt => {
                belt.getComponent(ConveyorBeltSys).StopConveyorBelt();
            })
            return;
        }

        this.listConveyorBelt.forEach(belt => {
            belt.getComponent(ConveyorBeltSys).StopConveyorBelt();
            belt.getComponent(ConveyorBeltSys).CarMoveOut(idCar);
        })
    }

    public ResumeAllBelt(idBelt: number, idCar: number, moveSuccess: boolean = false) {
        let canResume: boolean = true;
        this.listConveyorBelt.forEach(belt => {
            if (!belt.getComponent(ConveyorBeltSys).CheckCanResumeBelt(idCar, moveSuccess)) {
                canResume = false;
            }
        })

        if (canResume) {
            this.listConveyorBelt.forEach(belt => {
                belt.getComponent(ConveyorBeltSys).ResumeConveyorBelt();
            });
        }
    }
    // #endregion ConeyorBelt

    //================================================
    //#region VIP
    private _mapSaveWhenChange: Map<number, Node> = new Map();   // indexSibling - Node
    public MoveAllCarToGround2WhenUsedVip() {
        // clear all old save
        this._mapSaveWhenChange = new Map();

        // filter all car on the ground but can not used vip
        let listNCarCanNotVip: Node[] = this.GetListNCarByState(STATE_CAR.READY_TO_MOVE)
            .filter(item => !item.getComponent(CarSys).CanVip());
        const listIndexEachCar: number[] = listNCarCanNotVip.map(car => car.getSiblingIndex());
        listNCarCanNotVip.forEach((ncar: Node, index: number) => {
            this._mapSaveWhenChange.set(listIndexEachCar[index], ncar);
            ncar.setParent(this.nMapCar_2);
        })
    }

    public MoveAllCarSaveToGroundRight() {
        this._mapSaveWhenChange.forEach((nCar: Node, siblingIndex: number) => {
            nCar.setParent(this.nMapCar);
            nCar.setSiblingIndex(siblingIndex);
        })
    }
    //#endregion VIP
    //================================================
}

function GetScaleMap(dataMap: JsonMapGame, minPosXReach: number, maxPosYReach: number, minPosYReach: number, heightMap: number): number {
    let result = dataMap.LevelScaleFactor == undefined ? 1 : dataMap.LevelScaleFactor;

    // console.log("000", dataMap.LevelScaleFactor, minPosXReach, maxPosYReach);

    let posChoice: Vec3 = new Vec3(999, minPosYReach, 0);
    // find the highest y and leftist x 
    for (const infoCar of dataMap.CarInfo) {
        const posCheck: Vec3 = new Vec3(infoCar.carPosition.x * result * MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS, infoCar.carPosition.y * result * MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS, 0);
        // console.log(posCheck, posChoice);
        if (posCheck.y > posChoice.y) {
            posChoice = posCheck;
        } else if (posCheck.y >= posChoice.y && posCheck.x < posChoice.x) {
            posChoice = posCheck;
        }
    }

    // check if posChoice 
    let ratioW: number = Math.abs(minPosXReach / posChoice.x);
    let ratioH: number = Math.abs(heightMap / (posChoice.y >= 0 ? heightMap + posChoice.y : posChoice.y));

    if (ratioW > 1 && ratioH > 1) {
        // console.log("1111", ratioH, ratioW, result);
        return result;
    } else if (ratioW < 1 && ratioW < result) {
        // console.log("2222", ratioH, ratioW, result);
        return ratioW;
    } else if (ratioH < 1 && ratioW > ratioH && ratioH < result) {
        // console.log("33333", ratioH, ratioW, result);
        return ratioH;
    }

    // console.log("44444", ratioH, ratioW, result);
    return result;
}


