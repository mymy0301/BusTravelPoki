import { _decorator, CCString, Component, Node } from 'cc';
import { clientEvent } from './framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from './Const/MConst';
import { Utils } from './Utils/Utils';
const { ccclass, property } = _decorator;

/**
 * This class is used to handle time event
 * EVENT LISTENER:
 *          + EVENT_CLOCK_ON_TICK from ClockSys 
 *          + EVENT_ADD_TIME from ITimeEventSys
 *          + EVENT_FORCE_STOP_TIME from ITimeEventSys
 * EVENT EMIT
 *          + EVENT_UPDATE_TIME from ITimeEventSys
 *          + EVENT_END_TIME_WHEN_INIT from ITimeEventSys
 *          + EVENT_END_TIME_WHEN_RUNNING from ITimeEventSys
 */

@ccclass('TimeEventSys')
export class TimeEventSys {
    private _ITimeEventSys: ITimeEventSys = null;

    //#region private func
    public InitClass(ITimeEventSys: ITimeEventSys) {
        this._ITimeEventSys = ITimeEventSys;
        clientEvent.on(this._ITimeEventSys.nameEventAddTime, this.AddMoreTime, this);
        clientEvent.on(this._ITimeEventSys.nameEventForceStopTime, this.ForceStopAndResetTime, this);

        this.SetUp();
    }

    public SetUp() {
        let timeRemaining: number = 0;
        let timeLengthCheck: number = -1;

        if (this._ITimeEventSys.GetTimeStart() < 0) {
            return;
        }

        // cacul time remaining
        timeLengthCheck = this._ITimeEventSys.GetTimeLength();
        timeRemaining = this.GetTimeRemaining();


        // check state time remaining
        if (timeRemaining <= timeLengthCheck && timeRemaining >= 0) {
            // emit event to updateUI
            clientEvent.dispatchEvent(this._ITimeEventSys.nameEventUpdateTime, timeRemaining);
            this.RegisterUpdateTime();
        } else {
            clientEvent.dispatchEvent(this._ITimeEventSys.nameEventEndTimeWhenInit);
            this.UnRegisterUpdateTime();
        }
    }

    /**
     * 
     * @param time second
     */
    private AddMoreTime(time: number) {
        /**
         * save the time UtilNow()
         * add more time
         */
        this.UnRegisterUpdateTime();

        const timeRemaining = this.GetTimeRemaining();
        this._ITimeEventSys.SetTimeLength(timeRemaining > 0 ? timeRemaining + time : time, false);
        this._ITimeEventSys.SetTimeStart(Utils.getCurrTime(), false);

        this._ITimeEventSys.SaveData();

        // emit event to updateUI
        clientEvent.dispatchEvent(this._ITimeEventSys.nameEventUpdateTime, timeRemaining + time);

        this.RegisterUpdateTime();
    }

    private RegisterUpdateTime() {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UnRegisterUpdateTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UpdateTime() {
        const timeRemaining = this.GetTimeRemaining();
        const timeLengthCheck = this._ITimeEventSys.GetTimeLength();

        // check state time remaining
        if (timeRemaining <= timeLengthCheck && timeRemaining > 0) {
            // emit event to updateUI
            clientEvent.dispatchEvent(this._ITimeEventSys.nameEventUpdateTime, timeRemaining);
        } else {
            clientEvent.dispatchEvent(this._ITimeEventSys.nameEventEndTimeWhenRunning);
            this.UnRegisterUpdateTime();
        }
    }
    //#endregion private func

    //#region common
    public async ForceStopAndResetTime(useSaveData: boolean = true) {
        this.UnRegisterUpdateTime();
        await this._ITimeEventSys.ResetData();
        if (useSaveData) {
            this._ITimeEventSys.SaveData();
        }
    }

    public GetTimeRemaining(): number {
        let timeStart = this._ITimeEventSys.GetTimeStart();
        let timeLengthCheck = this._ITimeEventSys.GetTimeLength();
        if (timeStart < 0 || timeLengthCheck < 0) {
            return -1;
        }
        const timeRemaining: number = timeStart + timeLengthCheck - Utils.getCurrTime();
        return timeRemaining;
    }
    //#endregion common
}

export interface ITimeEventSys {
    nameEventUpdateTime: string;
    nameEventEndTimeWhenRunning: string;
    nameEventEndTimeWhenInit: string;
    nameEventForceStopTime: string;
    nameEventAddTime: string;
    SaveData(): void;
    GetTimeLength(): number;
    SetTimeLength(timeSet: number, needSave: boolean): void;
    GetTimeStart(): number;
    SetTimeStart(timeSet: number, needSave: boolean): void;
    ResetData(): Promise<void>;
};



