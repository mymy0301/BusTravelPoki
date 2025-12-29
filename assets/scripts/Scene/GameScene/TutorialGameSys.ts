import { _decorator, Component, Node } from 'cc';
import { TYPE_GAME, TYPE_TUT } from '../../Configs/MConfigs';
import { LogicTutTutorial } from './Tutorials/LogicTutTutorial';
import { M_COLOR, ParamNextStepTut } from '../../Utils/Types';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { GetCarHasSameColor } from '../../Hint/HintSys';
import { EVENT_TUT_GAME } from '../OtherUI/UITutorialInGame/TypeTutorialInGame';
import { CarSys } from './Logic/CarSys';
import { Utils } from '../../Utils/Utils';
import { InfoCarSys } from './Logic/InfoCarSys';
const { ccclass, property } = _decorator;

@ccclass('TutorialGameSys')
export class TutorialGameSys extends Component {
    public static Instance: TutorialGameSys = null;
    private _logicTut: LogicTutTutorial = null;
    private _typeTut: TYPE_TUT = null;

    protected onLoad(): void {
        if (TutorialGameSys.Instance == null) {
            TutorialGameSys.Instance = this;
        }
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_TUT_GAME.CAR_START_MOVE, this.CallWhenCarStartMove, this);
        clientEvent.off(EVENT_TUT_GAME.CAR_START_MOVE_TO_THE_PARKING, this.CallWhenCarStartMoveToParking, this);
        clientEvent.off(EVENT_TUT_GAME.CAR_MOVE_TO_PARKING_DONE, this.CallWhenCarMoveToParkingDone, this);
        clientEvent.off(EVENT_TUT_GAME.CAR_MOVE_TO_GATE_DONE, this.CallWhenCarMoveToGateDone, this);
        clientEvent.off(EVENT_TUT_GAME.CAR_MOVE_TO_GATE, this.CallWhenCarMoveToGate, this);

    }

    protected onDestroy(): void {
        TutorialGameSys.Instance = null;
        if (this._logicTut != null) {
            this._logicTut.Reset();
        }
    }

    //==============================================================================
    //#region self func
    public async InitTut(maxStep: number, typeTut: TYPE_TUT) {
        this._typeTut = typeTut;
        switch (this._typeTut) {
            case TYPE_TUT.TUTORIAL_1:
                this._logicTut = new LogicTutTutorial();
                this._logicTut.SetMaxStep(maxStep);
                this._logicTut.Init();

                clientEvent.on(EVENT_TUT_GAME.CAR_START_MOVE, this.CallWhenCarStartMove, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_START_MOVE_TO_THE_PARKING, this.CallWhenCarStartMoveToParking, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_MOVE_TO_PARKING_DONE, this.CallWhenCarMoveToParkingDone, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_MOVE_TO_GATE_DONE, this.CallWhenCarMoveToGateDone, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_MOVE_TO_GATE, this.CallWhenCarMoveToGate, this);
                break;
            case TYPE_TUT.TUTORIAL_2:
                this._logicTut = new LogicTutTutorial();
                this._logicTut.SetMaxStep(maxStep);
                this._logicTut.Init();

                clientEvent.on(EVENT_TUT_GAME.CAR_START_MOVE, this.CallWhenCarStartMove, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_START_MOVE_TO_THE_PARKING, this.CallWhenCarStartMoveToParking, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_MOVE_TO_PARKING_DONE, this.CallWhenCarMoveToParkingDone, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_MOVE_TO_GATE_DONE, this.CallWhenCarMoveToGateDone, this);
                clientEvent.on(EVENT_TUT_GAME.CAR_MOVE_TO_GATE, this.CallWhenCarMoveToGate, this);
                break;
        }
    }

    public ResetLogicTut() {
        this._typeTut = null;
        if (this._logicTut == null) return;

        this._logicTut.Reset();
        this._logicTut = null;
    }

    public GetLogicTut() { return this._logicTut; }
    //#endregion self func
    //==============================================================================


    //==============================================================================
    //#region support func
    public GetCarByMColor(colorCar: M_COLOR): { carHint: Node, carInfo: InfoCarSys } {
        const listCar: Node[] = this._cbGetCarOnGround();
        const carHint = GetCarHasSameColor(colorCar, listCar);
        if (carHint == null) { return null; }
        const infoCar = carHint.getComponent(CarSys).InfoCar;
        return {
            carHint: carHint,
            carInfo: infoCar
        };
    }
    //#endregion support func
    //==============================================================================



    //==============================================================================
    //#region other func call from any class in game scene
    private _cbGetCarById: CallableFunction = null;
    private _cbGetCarByState: CallableFunction = null;
    private _cbGetListCarByState: CallableFunction = null;
    private _cbGetListPassenger: CallableFunction = null;
    private _cbGetCarOnGround: CallableFunction = null;
    /**
     * This func used for register cb
     * WARNING :Please do not delete any thing in here if you not ensure it make right
     */
    public RegisterSpecialCbInGame(...args: any) {
        this._cbGetCarById = args[0];
        this._cbGetCarByState = args[1];
        this._cbGetListPassenger = args[2];
        this._cbGetListCarByState = args[3];
        this._cbGetCarOnGround = args[4];
    }

    public async CallWhenInitTut(paramNextStep: ParamNextStepTut = null, ...args: any) {
        if (this._logicTut == null || this._logicTut.Step > this._logicTut.GetMaxStep()) { return; }
        let dataCarHint: { carHint: Node, carInfo: InfoCarSys } = null
        let colorCar: M_COLOR = null;
        // NOTE : pls be careful about the case this._logicTut.Step == this._logicTut.GetMaxStep()
        switch (this._typeTut) {
            case TYPE_TUT.TUTORIAL_1:
                if (this._logicTut.Step == this._logicTut.GetMaxStep()) { break; }

                // console.log(this._logicTut.Step);
                switch (this._logicTut.Step) {
                    case 0: colorCar = M_COLOR.GREEN; break;
                    case 1: colorCar = M_COLOR.BLUE; break;
                    case 2: colorCar = M_COLOR.RED; break;
                    case 3: colorCar = M_COLOR.PURPLE; break;
                }

                dataCarHint = this.GetCarByMColor(colorCar);
                if (dataCarHint == null) { break; }

                // emit to show Tut
                clientEvent.dispatchEvent(EVENT_TUT_GAME.SHOW_BLOCK);
                clientEvent.dispatchEvent(EVENT_TUT_GAME.SHOW_POP_UP_TUT_1,
                    colorCar,
                    dataCarHint.carInfo.carSize,
                    dataCarHint.carInfo.direction,
                    (this._cbGetListPassenger() as Node[]).slice(0, dataCarHint.carInfo.getNumberPassengerInCar),
                    dataCarHint.carHint
                )

                paramNextStep = {
                    argBeforeNextStep: [],
                    argDoStep: [dataCarHint.carHint]
                }
                await this._logicTut.NextStep(paramNextStep);
                break;
            case TYPE_TUT.TUTORIAL_2:
                if (this._logicTut.Step != 0) { break; }

                // console.log(this._logicTut.Step);
                switch (this._logicTut.Step) {
                    case 0: colorCar = M_COLOR.GREEN; break;
                }

                dataCarHint = this.GetCarByMColor(colorCar);
                if (dataCarHint == null) { break; }

                // emit to show Tut
                // clientEvent.dispatchEvent(EVENT_TUT_GAME.SHOW_BLOCK);
                clientEvent.dispatchEvent(EVENT_TUT_GAME.SHOW_POP_UP_TUT_2,
                    colorCar,
                    dataCarHint.carInfo.carSize,
                    dataCarHint.carInfo.direction,
                    (this._cbGetListPassenger() as Node[]).slice(0, dataCarHint.carInfo.getNumberPassengerInCar),
                    dataCarHint.carHint
                )

                paramNextStep = {
                    argBeforeNextStep: [],
                    argDoStep: [dataCarHint.carHint]
                }
                await this._logicTut.NextStep(paramNextStep);
                break;
        }
    }

    public async CallWhenCarMoveToParkingDone(paramNextStep: ParamNextStepTut = null, ...args: any) {
        if (this._logicTut == null || this._logicTut.Step > this._logicTut.GetMaxStep()) { return; }
        // NOTE : pls be careful about the case this._logicTut.Step == this._logicTut.GetMaxStep()
        switch (this._typeTut) {
            case TYPE_TUT.TUTORIAL_1:
                break;
            case TYPE_TUT.TUTORIAL_2:
                break;
        }
    }

    public async CallWhenCarMoveToGateDone(paramNextStep: ParamNextStepTut = null, ...args: any) {
        if (this._logicTut == null || this._logicTut.Step > this._logicTut.GetMaxStep()) {
            switch (this._typeTut) {
                case TYPE_TUT.TUTORIAL_1:
                    break;
            }

            return;
        }
        // NOTE : pls be careful about the case this._logicTut.Step == this._logicTut.GetMaxStep()
        switch (this._typeTut) {
            case TYPE_TUT.TUTORIAL_1:
                break;
        }
    }

    public async CallWhenCarMoveToGate(paramNextStep: ParamNextStepTut = null, ...args: any) {
        if (this._logicTut == null || this._logicTut.Step > this._logicTut.GetMaxStep()) { clientEvent.dispatchEvent(EVENT_TUT_GAME.HIDE_BLOCK); return; }
        // NOTE : pls be careful about the case this._logicTut.Step == this._logicTut.GetMaxStep()
        switch (this._typeTut) {
            case TYPE_TUT.TUTORIAL_1:
                clientEvent.dispatchEvent(EVENT_TUT_GAME.HIDE_BG);
                await Utils.delay(0.5 * 1000);
                if (this._logicTut.Step == this._logicTut.GetMaxStep()) { break; }

                const listCar: Node[] = this._cbGetCarOnGround();
                let colorCar: M_COLOR = null;
                // console.log(this._logicTut.Step);
                switch (this._logicTut.Step) {
                    case 0: colorCar = M_COLOR.GREEN; break;
                    case 1: colorCar = M_COLOR.BLUE; break;
                    case 2: colorCar = M_COLOR.RED; break;
                    case 3: colorCar = M_COLOR.PURPLE; break;
                }
                const carHint = GetCarHasSameColor(colorCar, listCar);

                const infoCar = carHint.getComponent(CarSys).InfoCar;

                // console.log(infoCar.getNumberPassengerInCar, (this._cbGetListPassenger() as Node[]).slice(0, infoCar.getNumberPassengerInCar));

                // emit to show Tut
                clientEvent.dispatchEvent(EVENT_TUT_GAME.SHOW_POP_UP_TUT,
                    colorCar,
                    infoCar.carSize,
                    (this._cbGetListPassenger() as Node[]).slice(0, infoCar.getNumberPassengerInCar),
                    carHint
                )

                paramNextStep = {
                    argBeforeNextStep: [],
                    argDoStep: [carHint]
                }
                await this._logicTut.NextStep(paramNextStep);
                break;
        }
    }

    public async CallWhenCarStartMove(paramNextStep: ParamNextStepTut = null, ...args: any) {
        if (this._logicTut == null || this._logicTut.Step > this._logicTut.GetMaxStep()) { return; }
        // NOTE : pls be careful about the case this._logicTut.Step == this._logicTut.GetMaxStep()
        switch (this._typeTut) {
            case TYPE_TUT.TUTORIAL_1:
                clientEvent.dispatchEvent(EVENT_TUT_GAME.HIDE_POP_UP_TUT);
                clientEvent.dispatchEvent(MConst.EVENT_HAND.HIDE_HAND);
                break;
        }
    }

    public async CallWhenCarStartMoveToParking(paramNextStep: ParamNextStepTut = null, ...args: any) {
        if (this._logicTut == null || this._logicTut.Step > this._logicTut.GetMaxStep()) { return; }
        // NOTE : pls be careful about the case this._logicTut.Step == this._logicTut.GetMaxStep()
        switch (this._typeTut) {
            case TYPE_TUT.TUTORIAL_1:
                break;
            case TYPE_TUT.TUTORIAL_2:
                if (this._logicTut.Step == 1) {
                    // hide hand + bg + shadow
                    clientEvent.dispatchEvent(MConst.EVENT_HAND.HIDE_HAND);
                    // clientEvent.dispatchEvent(EVENT_TUT_GAME.HIDE_BG);
                    // clientEvent.dispatchEvent(EVENT_TUT_GAME.HIDE_BLOCK);
                } else if (this._logicTut.Step == this._logicTut.GetMaxStep()) {
                    // hide tut
                    clientEvent.dispatchEvent(EVENT_TUT_GAME.HIDE_POP_UP_TUT);
                }
                // increase step
                paramNextStep = {
                    argBeforeNextStep: [],
                    argDoStep: []
                }
                await this._logicTut.NextStep(paramNextStep);
                break;
        }
    }
    //#endregion other func call from any class in game scene
    //==============================================================================
}


