import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { Utils } from '../Utils/Utils';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { CheatingSys } from '../Scene/CheatingSys';
const { ccclass, property } = _decorator;

@ccclass('TimeDoubleKeySeasonPassSys')
export class TimeDoubleKeySeasonPassSys {
    constructor() {
        clientEvent.on(MConst.EVENT_DOUBLE_KEY.ADD_TIME, this.AddMoreTime, this);
    }

    public SetUp() {
        let timeRemaining: number = 0;

        // if (CheatingSys.Instance.IsResetDataSeasonPass) {
        //     PlayerData.Instance._timeEndX2KeySeasonPass = -1;
        //     this.SaveDataSeasonPass();
        // }

        if (PlayerData.Instance._timeEndX2KeySeasonPass <= 0) {
            return;
        }

        const currentTime = Utils.getCurrTime();
        timeRemaining = PlayerData.Instance._timeEndX2KeySeasonPass - currentTime;
        // check state time remaining
        if (timeRemaining > 0) {
            // emit event to updateUI
            clientEvent.dispatchEvent(MConst.EVENT_DOUBLE_KEY.UPDATE_TIME_INFI, timeRemaining);
            this.RegisterUpdateTime();
        } else {
            clientEvent.dispatchEvent(MConst.EVENT_DOUBLE_KEY.END_TIME_INFI_WHEN_INIT);
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


        const curentTime: number = Utils.getCurrTime();
        let timeRemaining = PlayerData.Instance._timeEndX2KeySeasonPass - curentTime;
        // không được để trường hợp time remaing < 0
        if (timeRemaining < 0) { timeRemaining = 0; }
        PlayerData.Instance._timeEndX2KeySeasonPass = curentTime + timeRemaining + time;
        this.SaveDataSeasonPass();

        // emit event to updateUI
        clientEvent.dispatchEvent(MConst.EVENT_DOUBLE_KEY.UPDATE_TIME_INFI, timeRemaining + time);

        this.RegisterUpdateTime();
    }

    private RegisterUpdateTime() {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UnRegisterUpdateTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UpdateTime() {
        const currentTime = Utils.getCurrTime();
        const timeRemaining = PlayerData.Instance._timeEndX2KeySeasonPass - currentTime;

        // check state time remaining
        if (timeRemaining > 0) {
            // emit event to updateUI
            clientEvent.dispatchEvent(MConst.EVENT_DOUBLE_KEY.UPDATE_TIME_INFI, timeRemaining);
        } else {
            clientEvent.dispatchEvent(MConst.EVENT_DOUBLE_KEY.END_TIME_INFI_WHEN_RUNNING);
            this.UnRegisterUpdateTime();
        }
    }

    private SaveDataSeasonPass() {
        PlayerData.Instance.SaveEvent_SeasonPass();
    }

    private GetTimeRemaining(): number {
        const currentTime = Utils.getCurrTime();
        const timeRemaining = PlayerData.Instance._timeEndX2KeySeasonPass - currentTime;
        return timeRemaining;
    }

    private GetTimeRemainingFormatted(): string {
        const currentTime = Utils.getCurrTime();
        const timeRemaining = PlayerData.Instance._timeEndX2KeySeasonPass - currentTime;
        if (timeRemaining > 0) {
            return Utils.convertTimeLengthToFormat(timeRemaining);
        } else {
            return "00:00:00";
        }
    }

    //#region common
    public ForceStopAndResetTime(useSaveData: boolean = true) {
        this.UnRegisterUpdateTime();
        clientEvent.dispatchEvent(MConst.EVENT_DOUBLE_KEY.FORCE_STOP_TIME);
        PlayerData.Instance._timeEndX2KeySeasonPass = -1;
        if (useSaveData) {
            this.SaveDataSeasonPass();
        }
    }

    public IsDoublingKey() {
        const timeRemaining = this.GetTimeRemaining();
        return timeRemaining > 0;
    }
    //#endregion common
}


