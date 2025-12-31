import { _decorator, Component, Node } from 'cc';
import { Utils } from '../../Utils/Utils';
import { ClockGameSys } from '../../ClockGameSys';
import { PlayerData } from '../../Utils/PlayerData';
import { clientEvent } from '../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../Const/MConst';
import { InfoEventData, TYPE_EVENT_GAME } from '../../Utils/Types';
import { CONFIG_LP, EVENT_LEVEL_PASS } from '../OtherUI/UILevelPass/TypeLevelPass';
import { CONFIG_SP } from '../OtherUI/UISeasonPass/TypeSeasonPass';
const { ccclass, property } = _decorator;

enum STATE_EVENT_DELAY {
    IS_RUNNING,
    DELAYING
}

@ccclass('CaculTimeEvents2')
export class CaculTimeEvents2 {

    public static Instance: CaculTimeEvents2;

    private _idCBIntervalEventSeasonPass = { Value: -1 };
    private _idCBIntervalEventLevelPass = { Value: -1 };

    private _stateEventSeasonPass: STATE_EVENT_DELAY = STATE_EVENT_DELAY.DELAYING;
    private _stateEventLevelPass: STATE_EVENT_DELAY = STATE_EVENT_DELAY.DELAYING;

    constructor() {
        if (CaculTimeEvents2.Instance == null) {
            CaculTimeEvents2.Instance = this;

            clientEvent.on(MConst.EVENT_GAME.FORCE_GEN_EVENT, this.GenForceEvent, this);
            clientEvent.on(MConst.EVENT_GAME.PAUSE_TIME_EVENT, this.PauseTimeEvent, this);
        }
    }

    // #region funcs self
    private DecreaseTimeEvent(idIntervalCB: { Value: number }, typeEvent: TYPE_EVENT_GAME) {
        let timeEvent = this.GetTimeEvent(typeEvent);
        const stateEvent = this.GetStateEventDelay(typeEvent);
        // console.log("time decrease", timeEvent);

        // decrease time normal
        if (stateEvent == STATE_EVENT_DELAY.DELAYING) {
            // check id event was change to new id event
            let newId = this.GetIdEventNow(typeEvent);
            let oldId = this.GetIdEvent(typeEvent);
            // console.log("check newId and oldId", newId, oldId);
            if (newId != oldId) {
                // check time event was end
                this.UnRegisterTime(idIntervalCB);
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LEVEL_PASS, 2);
                // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_BUY_LEVEL_PASS, 1);
                clientEvent.dispatchEvent(EVENT_LEVEL_PASS.HIDE_ICON_EVENT, TYPE_EVENT_GAME.LEVEL_PASS);
            }
        }

        // check end event
        if (timeEvent <= 0 && stateEvent == STATE_EVENT_DELAY.IS_RUNNING) {
            this.SetStateEventDelay(STATE_EVENT_DELAY.DELAYING, typeEvent);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.END_TIME_EVENT, typeEvent);
        }
    }

    private SetTimeForEvent(idIntervalCB: { Value: number }, typeEvent: TYPE_EVENT_GAME) {
        let timeResidualTime = 0;

        // set time for new event
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                timeResidualTime = this.GetResidualTime(CONFIG_SP.MAX_TIME_EVENT, CONFIG_SP.DELAY_TIME, PlayerData.Instance._seasonPass_timeDistanceCustom);
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                timeResidualTime = this.GetResidualTime(CONFIG_LP.MAX_TIME_EVENT, CONFIG_LP.DELAY_TIME, PlayerData.Instance._levelPass_timeDistanceCustom);
                break;
        }

        //register event from clock
        this.UnRegisterTime(idIntervalCB);
        idIntervalCB.Value = ClockGameSys.Instance.registerCallBack(
            () => { this.DecreaseTimeEvent(idIntervalCB, typeEvent) }
        );
    }

    private UnRegisterTime(idIntervalCB: { Value: number }) {
        if (idIntervalCB.Value != -1) {
            if (!ClockGameSys.Instance.unregisterCallBack(idIntervalCB.Value)) {
                // console.error("something wrong in CaculEndTimeEvents");
            }
        }
    }

    /**
     * Calculates the residual time based on the provided timeLongEvent and timeDelay.
     *
     * @param {number} timeLongEvent - The duration of the long event.
     * @param {number} timeDelay - The delay time for the event.
     * @return {number} The residual time calculated based on the current time, timeLongEvent, and timeDelay.
     */
    private GetResidualTime(timeLongEvent: number, timeDelay: number, timeDistanceCustom: number = 0) {
        const time = timeLongEvent - Math.floor((Utils.getCurrTime() + timeDistanceCustom) % (timeLongEvent + timeDelay))
        return time;
    }

    private ResetDataNewEvent(_infoEvent: InfoEventData, typeEvent: TYPE_EVENT_GAME) {
        // general settings < in this case timeGen like idEvent>
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                _infoEvent.timeGen = Math.floor((Utils.getCurrTime() + PlayerData.Instance._seasonPass_timeDistanceCustom) / (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME));
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                _infoEvent.timeGen = Math.floor((Utils.getCurrTime() + PlayerData.Instance._levelPass_timeDistanceCustom) / (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME));
                break;
        }

        this.SaveDataEvent(typeEvent);
    }

    private SaveDataEvent(typeEvent: TYPE_EVENT_GAME) {
        PlayerData.Instance.Save();
    }

    private GetIdEvent(typeEventGame: TYPE_EVENT_GAME) {
        switch (typeEventGame) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                return PlayerData.Instance._infoEventSeasonPass.timeGen;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                return PlayerData.Instance._infoEventLevelPass.timeGen;
        }
        return -1;
    }

    private GetIdEventNow(typeEvent: TYPE_EVENT_GAME): number {
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                return Math.floor((Utils.getCurrTime() + PlayerData.Instance._seasonPass_timeDistanceCustom) / (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME));
            case TYPE_EVENT_GAME.LEVEL_PASS:
                return Math.floor((Utils.getCurrTime() + PlayerData.Instance._levelPass_timeDistanceCustom) / (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME));
        }
        return -1;
    }
    // #endregion

    //#region public func
    public CheckCanResumeOrGenEvent(typeEvent: TYPE_EVENT_GAME) {

        let idIntervalCB = null;
        let infoEventPass: InfoEventData = null;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                idIntervalCB = this._idCBIntervalEventSeasonPass;
                infoEventPass = PlayerData.Instance._infoEventSeasonPass;
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                idIntervalCB = this._idCBIntervalEventLevelPass;
                infoEventPass = PlayerData.Instance._infoEventLevelPass;
                break;
        }

        const stateEventIsDelay = this.CheckStateEvent(typeEvent).isDelay;
        const oldIdEvent = this.GetIdEvent(typeEvent);
        const idEventNow = this.GetIdEventNow(typeEvent);

        // console.log("check data TilePass", oldIdEvent, idEventNow, stateEventIsDelay);

        // CASE 1: Gen time
        if (oldIdEvent != idEventNow && !stateEventIsDelay) {
            this.ResetDataNewEvent(infoEventPass, typeEvent);
            this.SetTimeForEvent(idIntervalCB, typeEvent);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.GEN_EVENT, typeEvent);
            this.SetStateEventDelay(STATE_EVENT_DELAY.IS_RUNNING, typeEvent);
            // console.log("🚀 Gen time")
        }
        // CASE 2: Resume time
        else if (oldIdEvent == idEventNow && !stateEventIsDelay) {
            this.SetTimeForEvent(idIntervalCB, typeEvent);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.RESUME_EVENT, typeEvent);
            this.SetStateEventDelay(STATE_EVENT_DELAY.IS_RUNNING, typeEvent);
            // console.log("🚀 Resume time")
        }
        // CASE 3: Delay time
        else if (oldIdEvent == idEventNow && stateEventIsDelay) {
            this.SetTimeForEvent(idIntervalCB, typeEvent);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.RESUME_EVENT, typeEvent);
            this.SetStateEventDelay(STATE_EVENT_DELAY.DELAYING, typeEvent);
            // console.log("🚀 Delay time")
        }
        // CASE 4: new event but it delay time
        else if (oldIdEvent != idEventNow && stateEventIsDelay) {
            this.ResetDataNewEvent(infoEventPass, typeEvent);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.RESUME_EVENT, typeEvent);
            this.SetStateEventDelay(STATE_EVENT_DELAY.DELAYING, typeEvent);
            // console.log("🚀 new event but it delay time")
        }
    }

    public IsEndEventBeforeCheckLogicToInitNewEvent(typeEvent: TYPE_EVENT_GAME): boolean {
        let idIntervalCB = null;
        let infoEventPass: InfoEventData = null;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                idIntervalCB = this._idCBIntervalEventSeasonPass;
                infoEventPass = PlayerData.Instance._infoEventSeasonPass;
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                idIntervalCB = this._idCBIntervalEventLevelPass;
                infoEventPass = PlayerData.Instance._infoEventLevelPass;
                break;
        }

        const stateEventIsDelay = this.CheckStateEvent(typeEvent).isDelay;
        const oldIdEvent = this.GetIdEvent(typeEvent);
        const idEventNow = this.GetIdEventNow(typeEvent);

        // console.log("check data TilePass", oldIdEvent, idEventNow, stateEventIsDelay);

        // CASE 1: Gen time
        if (oldIdEvent != idEventNow && !stateEventIsDelay) {
            return true;
        }
        // CASE 2: Resume time
        else if (oldIdEvent == idEventNow && !stateEventIsDelay) {
            return false;
        }
        // CASE 3: Delay time
        else if (oldIdEvent == idEventNow && stateEventIsDelay) {
            return true;
        }
        // CASE 4: new event but it delay time
        else if (oldIdEvent != idEventNow && stateEventIsDelay) {
            return true;
        }

        return false;
    }

    public GetTimeEventBeforeInitEvent(typeEvent: TYPE_EVENT_GAME, maxTimeEventSP: number = CONFIG_SP.MAX_TIME_EVENT): number {
        let timeResult: number = -1;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                timeResult = maxTimeEventSP - Math.floor((Utils.getCurrTime() + PlayerData.Instance._seasonPass_timeDistanceCustom) % (maxTimeEventSP + CONFIG_SP.DELAY_TIME));
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                timeResult = CONFIG_LP.MAX_TIME_EVENT - Math.floor((Utils.getCurrTime() + PlayerData.Instance._levelPass_timeDistanceCustom) % (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME));
                break;
        }

        return timeResult;
    }

    public GetTimeEventEndFromNow(typeEvent: TYPE_EVENT_GAME): number {
        let timeResult = -1;
        timeResult = Utils.getCurrTime() + this.GetTimeEventBeforeInitEvent(typeEvent);
        return timeResult;
    }

    public CheckStateEvent(typeEvent: TYPE_EVENT_GAME): { isDelay: boolean } {
        let residualTime: number;
        let idDelay: boolean;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                residualTime = this.GetResidualTime(CONFIG_SP.MAX_TIME_EVENT, CONFIG_SP.DELAY_TIME, PlayerData.Instance._seasonPass_timeDistanceCustom);
                idDelay = residualTime <= 0 && residualTime > -CONFIG_SP.DELAY_TIME;
                return { isDelay: idDelay };
            case TYPE_EVENT_GAME.LEVEL_PASS:
                residualTime = this.GetResidualTime(CONFIG_LP.MAX_TIME_EVENT, CONFIG_LP.DELAY_TIME, PlayerData.Instance._levelPass_timeDistanceCustom);
                // console.log("residualTime", residualTime);
                idDelay = residualTime <= 0 && residualTime > -CONFIG_LP.DELAY_TIME;
                return { isDelay: idDelay };
        }

        return null;
    }

    public GetTimeEvent(typeEvent: TYPE_EVENT_GAME): number {
        let timeResult = -1;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                if (this.GetStateEventDelay(typeEvent) == STATE_EVENT_DELAY.IS_RUNNING) {
                    timeResult = CONFIG_SP.MAX_TIME_EVENT - Math.floor((Utils.getCurrTime() + PlayerData.Instance._seasonPass_timeDistanceCustom) % (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME));
                }
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                if (this.GetStateEventDelay(typeEvent) == STATE_EVENT_DELAY.IS_RUNNING) {
                    timeResult = CONFIG_LP.MAX_TIME_EVENT - Math.floor((Utils.getCurrTime() + PlayerData.Instance._levelPass_timeDistanceCustom) % (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME));
                }
                break;
        }
        return timeResult;
    }

    public GetTimeDelay(typeEvent: TYPE_EVENT_GAME): number {
        let timeResult = -1;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                if (this.GetStateEventDelay(typeEvent) == STATE_EVENT_DELAY.DELAYING) {
                    timeResult = CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME - Math.floor((Utils.getCurrTime() + PlayerData.Instance._seasonPass_timeDistanceCustom) % (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME));
                }
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                if (this.GetStateEventDelay(typeEvent) == STATE_EVENT_DELAY.DELAYING) {
                    timeResult = CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME - Math.floor((Utils.getCurrTime() + PlayerData.Instance._levelPass_timeDistanceCustom) % (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME));
                }
                break;
        }
        return timeResult;
    }

    public GenForceEvent(typeEvent: TYPE_EVENT_GAME, distancenLoop: number = 0, needSaveData: boolean = true) {
        let numLoopEventReal: number;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                numLoopEventReal = Math.floor(Utils.getCurrTime() / (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME)) + distancenLoop;
                PlayerData.Instance._seasonPass_timeDistanceCustom = (numLoopEventReal + 1) * (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME) - Utils.getCurrTime();
                needSaveData && this.SaveDataEvent(typeEvent);
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                numLoopEventReal = Math.floor(Utils.getCurrTime() / (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME)) + distancenLoop;
                PlayerData.Instance._levelPass_timeDistanceCustom = (numLoopEventReal + 1) * (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME) - Utils.getCurrTime();
                needSaveData && this.SaveDataEvent(typeEvent);
                break;
        }
    }

    public ForceChangeTimeEvent(typeEvent: TYPE_EVENT_GAME, timeRemainToEnd: number) {
        let numLoopEventReal: number, timeRemain: number;
        const timeNow = Utils.getCurrTime();
        switch (typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS:
                numLoopEventReal = Math.floor(timeNow / (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME));
                timeRemain = (numLoopEventReal + 1) * (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME) - timeNow;
                PlayerData.Instance._levelPass_timeDistanceCustom = timeRemain + (CONFIG_LP.MAX_TIME_EVENT - timeRemainToEnd);
                this.ResetDataNewEvent(PlayerData.Instance._infoEventLevelPass, typeEvent);
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                numLoopEventReal = Math.floor(timeNow / (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME));
                timeRemain = (numLoopEventReal + 1) * (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME) - timeNow;
                PlayerData.Instance._seasonPass_timeDistanceCustom = timeRemain + (CONFIG_SP.MAX_TIME_EVENT - timeRemainToEnd);
                this.ResetDataNewEvent(PlayerData.Instance._infoEventSeasonPass, typeEvent);
                break;
        }
    }

    public ForceChangeTimeDelayEvent(typeEvent: TYPE_EVENT_GAME, timeRemainToEnd: number) {
        let numLoopEventReal: number, timeRemain: number;
        const timeNow = Utils.getCurrTime();
        switch (typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS:
                numLoopEventReal = Math.floor(timeNow / (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME));
                timeRemain = (numLoopEventReal + 1) * (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME) - timeNow;
                PlayerData.Instance._levelPass_timeDistanceCustom = timeRemain + (CONFIG_LP.MAX_TIME_EVENT + CONFIG_LP.DELAY_TIME - timeRemainToEnd);
                this.ResetDataNewEvent(PlayerData.Instance._infoEventLevelPass, typeEvent);
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                numLoopEventReal = Math.floor(timeNow / (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME));
                timeRemain = (numLoopEventReal + 1) * (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME) - timeNow;
                PlayerData.Instance._seasonPass_timeDistanceCustom = timeRemain + (CONFIG_SP.MAX_TIME_EVENT + CONFIG_SP.DELAY_TIME - timeRemainToEnd);
                this.ResetDataNewEvent(PlayerData.Instance._infoEventSeasonPass, typeEvent);
                break;
        }
    }
    //#endregion

    //#region func setStateEvent
    private SetStateEventDelay(stateEvent: STATE_EVENT_DELAY, type_event: TYPE_EVENT_GAME) {
        switch (type_event) {
            case TYPE_EVENT_GAME.SEASON_PASS: this._stateEventSeasonPass = stateEvent; break;
            case TYPE_EVENT_GAME.LEVEL_PASS: this._stateEventLevelPass = stateEvent; break;
        }
    }

    private GetStateEventDelay(type_event: TYPE_EVENT_GAME): STATE_EVENT_DELAY {
        let result: STATE_EVENT_DELAY = null;
        switch (type_event) {
            case TYPE_EVENT_GAME.SEASON_PASS: result = this._stateEventSeasonPass; break;
            case TYPE_EVENT_GAME.LEVEL_PASS: result = this._stateEventLevelPass; break;
        }
        return result;
    }
    //#endregion

    //#region func listen
    private PauseTimeEvent(typeEvent: TYPE_EVENT_GAME) {
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SEASON_PASS: this.UnRegisterTime(this._idCBIntervalEventSeasonPass); break;
            case TYPE_EVENT_GAME.LEVEL_PASS: this.UnRegisterTime(this._idCBIntervalEventLevelPass); break;
        }
    }
    //#endregion func listen
}


