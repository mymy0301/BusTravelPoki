import { _decorator, Component, game, Node, Vec3 } from 'cc';
import { COLOR_KEY_LOCK, convertNumberToColorKeyLock, ConvertSizeCarFromJson, ConvertSizeCarFromJsonToNumber, DIRECT_CAR, GameSoundEffect, GetMColorByNumber, GetNumberByMColor, ITypeCar, JsonCar, M_COLOR, SwitchDirectionCar, TYPE_CAR_SIZE } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('InfoCarSys')
export class InfoCarSys {
    private _dataCarInfo: JsonCar = null
    private _idCar: number = 0;
    private _numPassengerHave: number = 0;
    private _idConveyorBelt: number = -1; public get IDConveyorBelt(): number { return this._idConveyorBelt; }
    private _idGarage: number = -1; public get IDGarage(): number { return this._idGarage; }
    private _timeCarRemainingCallCooldown: number = 0;
    private _isStartedTime: boolean = false;
    private _directionCar: DIRECT_CAR = null;
    private _isCarLocking: boolean = false;

    public SetInfoCar(data: JsonCar, idCar: number) {
        // set data in here 
        this._dataCarInfo = data;
        this._idCar = idCar;
        this._directionCar = data.carDirection;
        this._isCarLocking = data.idCarKeyOfCarLock != null && data.idCarKeyOfCarLock >= 0;

        // set timeCar remaining
        this._timeCarRemainingCallCooldown = data.timeCarCallCoolDown != null ? data.timeCarCallCoolDown : -1;

        // unlisten time
        this.UnListenCallCooldown();

        this._isStartedTime = false;

    }

    public SetCarIdConveyorBelt(idConveyorBelt: number) {
        this._idConveyorBelt = idConveyorBelt;
    }

    public SetIdGarage(idGarage: number) {
        this._idGarage = idGarage;
    }

    public ResetData() {
        this._dataCarInfo = null;
        this._idCar = 0;
        this._numPassengerHave = 0;
        this._idConveyorBelt = -1;
        this._idGarage = -1;
        this._isStartedTime = false;
        this._isCarLocking = false;
        this.UnListenCallCooldown();
    }

    //#region func get
    public get idCar(): number {
        if (this._dataCarInfo == null) return null;
        return this._idCar;
    }

    public get direction(): DIRECT_CAR {
        if (this._dataCarInfo == null) return null;
        // return this._dataCarInfo.carDirection;
        return this._directionCar;
    }

    public get color(): number {
        if (this._dataCarInfo == null) return null;
        return this._dataCarInfo.carColor;
    }

    public get colorByMColor(): M_COLOR {
        if (this._dataCarInfo == null) return null;
        return GetMColorByNumber(this._dataCarInfo.carColor);
    }

    public get carSize(): TYPE_CAR_SIZE {
        if (this._dataCarInfo == null) return null;
        return ConvertSizeCarFromJson(this._dataCarInfo.carSize);
    }

    public get IsMysteryCar(): boolean {
        if (this._dataCarInfo == null || this._dataCarInfo == undefined || this._dataCarInfo.isMysteryCar == undefined) return false;
        return this._dataCarInfo.isMysteryCar;
    }

    public get IsTwoWayCar(): boolean {
        if (this._dataCarInfo == null || this._dataCarInfo == undefined || this._dataCarInfo.isTwoWayCar == undefined) return false;
        return this._dataCarInfo.isTwoWayCar;
    }

    public get IsCarAutoMoveForward(): boolean {
        if (this._dataCarInfo == null || this._dataCarInfo == undefined || this.colorByMColor != M_COLOR.REINDEER_CART) return false;
        return true;
    }

    public get IdCarLockOfCarKey(): number {
        if (this._dataCarInfo == null || this._dataCarInfo == undefined || this._dataCarInfo.idCarLockOfCarKey == undefined) return -1;
        return this._dataCarInfo.idCarLockOfCarKey;
    }

    public get IdCarKeyOfCarLock(): number {
        if (this._dataCarInfo == null || this._dataCarInfo == undefined || this._dataCarInfo.idCarKeyOfCarLock == undefined) return -1;
        return this._dataCarInfo.idCarKeyOfCarLock;
    }

    public SwitchDirectionCar() {
        this._directionCar = SwitchDirectionCar(this._directionCar);
    }

    public get getNumberPassengerInCar(): number {
        if (this._dataCarInfo == null) return null;

        let carSizeType: TYPE_CAR_SIZE = ConvertSizeCarFromJson(this._dataCarInfo.carSize);
        switch (carSizeType) {
            case TYPE_CAR_SIZE['4_CHO']: return 4;
            case TYPE_CAR_SIZE['6_CHO']: return 6;
            case TYPE_CAR_SIZE['10_CHO']: return 10;
        }
        // return ConvertSizeCarFromJsonToNumber(this._dataCarInfo.carSize);
    }

    public get getPosCar(): Vec3 {
        return new Vec3(this._dataCarInfo.carPosition.x, this._dataCarInfo.carPosition.y, 0).clone();
    }

    public get getDataCarInfo(): JsonCar {
        return this._dataCarInfo;
    }

    public get getITypeCar(): ITypeCar {
        return {
            isCarMystery: this.IsMysteryCar != null && this.IsMysteryCar,
            isCarTwoWay: this.IsTwoWayCar != null && this.IsTwoWayCar,
            isCarKey: this.IdCarLockOfCarKey != null && this.IdCarLockOfCarKey >= 0,
            isCarLock: this.IsCarLocking,
            colorKeyLock: this.ColorKeyLock != null && this.ColorKeyLock,
            isCarFiretruck: this.colorByMColor == M_COLOR.FIRE_TRUCK,
            isCarAmbulance: this.colorByMColor == M_COLOR.AMBULANCE,
            isCarMilitary: this.colorByMColor == M_COLOR.MILITARY,
        }
    }

    public get ColorKeyLock(): COLOR_KEY_LOCK {
        return convertNumberToColorKeyLock(this._dataCarInfo.colorKey_Lock);
    }

    public get NumCarRemaingingCallCoolDown(): number {
        return this._dataCarInfo.numCarRemainingCallCoolDown;
    }

    public get IsCarLocking(): boolean {
        return this._isCarLocking;
    }

    public get CanTriggerAutoMoveForward(): boolean { return this.IsCarAutoMoveForward && this._dataCarInfo.listIdCarTrigger.length == 0; }

    /**
     * this func only call when unlocked from supLockCar
    */
    public set SetCarIsLocking(isLocking: boolean) { this._isCarLocking = isLocking; }

    public CanSort(): boolean {
        const colorCarNow = this.colorByMColor;
        return colorCarNow != M_COLOR.AMBULANCE && colorCarNow != M_COLOR.FIRE_TRUCK && colorCarNow != M_COLOR.REINDEER_CART;
    }

    public CanShuffle(): boolean {
        const colorCarNow = this.colorByMColor;
        return colorCarNow != M_COLOR.AMBULANCE && colorCarNow != M_COLOR.FIRE_TRUCK && !this.IsTwoWayCar && !this.IsCarLocking && colorCarNow != M_COLOR.REINDEER_CART;
    }

    public CanVip(): boolean {
        const colorCarNow = this.colorByMColor;
        return colorCarNow != M_COLOR.AMBULANCE && colorCarNow != M_COLOR.FIRE_TRUCK && !this.IsCarLocking && colorCarNow != M_COLOR.REINDEER_CART;
    }
    //#endregion func get
    //===========================================

    //===========================================
    //#region func set
    public SetMysteryCar(value: boolean) {
        this._dataCarInfo.isMysteryCar = value;
    }

    public SetIdCarLock(value: number) {
        this._dataCarInfo.idCarKeyOfCarLock = value;
    }
    //#endregion func set
    //===========================================


    public AddPassenger() {
        this._numPassengerHave += 1;
    }

    public IsFullSlot(): boolean {
        if (this._numPassengerHave == this.carSize) {
            return true;
        }
        return false;
    }

    public SetColorByMColor(carMColor: M_COLOR) {
        this._dataCarInfo.carColor = GetNumberByMColor(carMColor);
    }

    public GetNumberPassengerRemainingToMoveCar(): number {
        return this.getNumberPassengerInCar - this._numPassengerHave;
    }

    /**
     * Hàm này sẽ bắt đầu làm giảm thời gian của xe đối vs xe có thời gian đợi và gọi cooldown
     * @returns 
     */
    public StartReduceTimeCarRemainingCallCooldown() {
        if (this._timeCarRemainingCallCooldown <= 0 || this._isStartedTime) { return; }
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.ReduceTimeCallCooldown, this)) {
            this._isStartedTime = true;
            // console.log("start reduce time", this._timeCarRemainingCallCooldown);
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.ReduceTimeCallCooldown, this);
        }
    }

    /**
    * Hàm này sẽ bắt đầu làm giảm thời gian của xe đối vs xe sẽ gọi cooldown sau x xe
    * @returns 
    */
    public StartReduceTimeCarRemainingCallCooldown_2() {
        if (this._dataCarInfo.numCarRemainingCallCoolDown <= 0 || this._isStartedTime) { return; }
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.ReduceTimeCallCooldown, this)) {
            // emit add noti time
            clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_START_COOLDOWN, this.idCar, this._dataCarInfo);
            this._isStartedTime = true;
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.ReduceTimeCallCooldown, this);
        }
    }

    //============================================
    //#region time
    public UnListenCallCooldown() {
        // console.log("Off cooldown");
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.ReduceTimeCallCooldown, this);
    }

    private ReduceTimeCallCooldown() {
        this._timeCarRemainingCallCooldown -= 1;
        // console.log("reduce time", this._timeCarRemainingCallCooldown);
        if (this._timeCarRemainingCallCooldown == 0) {
            // console.log("emit noti");
            // unlisten callCooldown
            this.UnListenCallCooldown();
            // emit add noti time
            clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_START_COOLDOWN, this.idCar, this._dataCarInfo);
        }
    }
    //#endregion time
    //============================================

    //============================================
    //#region ReindeerCart
    public TryRemoveIdCarBlockToAutoMoveForward(idCar: number) {
        if (this._dataCarInfo.listIdCarTrigger) {
            const index = this._dataCarInfo.listIdCarTrigger.indexOf(idCar);
            if (index !== -1) {
                this._dataCarInfo.listIdCarTrigger.splice(index, 1);
            }
        }
    }
    //#endregion ReindeerCart
    //============================================
}


