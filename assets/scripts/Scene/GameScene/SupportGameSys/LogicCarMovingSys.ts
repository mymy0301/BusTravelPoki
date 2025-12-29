import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('LogicCarMovingSys')
export class LogicCarMovingSys extends Component {
    public static Instance: LogicCarMovingSys = null;

    protected onLoad(): void {
        if (LogicCarMovingSys.Instance == null) {
            LogicCarMovingSys.Instance = this;
        }
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_CAR.CAR_MOVING_TO_PARK, this.SetCarIsMoving, this);
        clientEvent.on(MConst.EVENT_CAR.CAR_MOVING_DONE, this.SetCarMovingDone, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetData, this);
    }

    protected onDisable(): void {
        LogicCarMovingSys.Instance = null;
        clientEvent.off(MConst.EVENT_CAR.CAR_MOVING_TO_PARK, this.SetCarIsMoving, this);
        clientEvent.off(MConst.EVENT_CAR.CAR_MOVING_DONE, this.SetCarMovingDone, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetData, this);
    }

    private ResetData() {
        this._listIdCarMoving = [];
    }

    //#region CAR MOVING
    private _listIdCarMoving = []; public get IsHasCarMoving() { return this._listIdCarMoving.length > 0; }
    private SetCarIsMoving(idCar: number) {
        this._listIdCarMoving.push(idCar);
    }
    private SetCarMovingDone(idCar: number) {
        if (this._listIdCarMoving.indexOf(idCar) == -1) { return; }
        this._listIdCarMoving.splice(this._listIdCarMoving.indexOf(idCar), 1);
    }
    //#endregion CAR MOVING


}


