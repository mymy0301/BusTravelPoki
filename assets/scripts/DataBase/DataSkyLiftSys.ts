/**
 * 
 * anhngoxitin01
 * Tue Aug 26 2025 10:31:38 GMT+0700 (Indochina Time)
 * DataSkyLiftSys
 * db://assets/scripts/DataBase/DataSkyLiftSys.ts
*
*/
import { _decorator } from 'cc';
import { CONFIG_SL, InfoFloorSkyLiftJSON, STATE_SL } from '../Scene/OtherUI/UISkyLift/TypeSkyLift';
import { ReadDataJson } from '../ReadDataJson';
import { PlayerData } from '../Utils/PlayerData';
import { Utils } from '../Utils/Utils';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { addIPrizeToList, IParamLogEventInGame, IPrize, TYPE_EVENT_GAME } from '../Utils/Types';
import { PrizeSys } from './PrizeSys';
import { LogEventManager } from '../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('DataSkyLiftSys')
export class DataSkyLiftSys {
    public static Instance: DataSkyLiftSys = null;
    constructor() {
        if (DataSkyLiftSys.Instance == null) {
            DataSkyLiftSys.Instance = this;
        }
    }

    private _stateDataSkyLift: STATE_SL = STATE_SL.LOCK; public get STATE() { return this._stateDataSkyLift; }
    private _listPrizeReceived: boolean[] = new Array(CONFIG_SL.MAX_PRIZE_HAS).fill(false);
    //==========================================
    //#region base
    public UpdateStateEventFromLoad(isEventUnlocked: boolean) {
        //NOTE - ở đây chỉ được phép thay đổi dữ liệu lưu ý ko được phép gọi hàm lưu data
        // kiểm tra thời gian của events
        // WAIT_TO_JOIN,
        //JOINING,

        const timeNow = Utils.getCurrTime()

        const isEndTime: boolean = PlayerData.Instance.SL_timeEnd <= timeNow;
        const isDelayTime: boolean = PlayerData.Instance.SL_timeDelay >= timeNow && timeNow >= PlayerData.Instance.SL_timeEnd;
        const isReceiveReward: boolean = PlayerData.Instance.SL_isReceiveReward;

        switch (true) {
            // case event đang lock <VD chưa unlock>
            case !isEventUnlocked:
                this.UpdateState(STATE_SL.LOCK);
                break;
            // case đang đợi nhận thưởng
            case !isReceiveReward && isEndTime:
                this.UpdateState(STATE_SL.WAIT_TO_RECEIVE);
                break;
            // case event đang delay
            case isDelayTime && isReceiveReward:
                this.UpdateState(STATE_SL.DELAY);
                break;
            // case đợi để join
            // kiểm tra đã nhận thưởng thì là đợi join again
            case !isDelayTime && isReceiveReward:
                this.UpdateState(STATE_SL.WAIT_TO_JOIN);
                break;
            // case đang join
            case !isReceiveReward && !isEndTime:
                this.UpdateState(STATE_SL.JOINING);
                break;
        }



        /// save lại những prize đã nhận thưởng
        this._listPrizeReceived = [...PlayerData.Instance.SL_listBoolReceivePrize];
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private GetIdFloorSavePointIfLose(progressCheck: number): number {
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();

        const infoFloor = listInfoCheck.find(infoCheck => infoCheck.progress <= progressCheck && infoCheck.isSavePoint);
        if (infoFloor == null) {
            return 0;
        } else {
            infoFloor.idFloor;
        }
    }

    private GetInfoFloorById(idFloor: number): InfoFloorSkyLiftJSON {
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();
        const infoFloor = listInfoCheck.find(infoCheck => infoCheck.idFloor == idFloor);
        return infoFloor;
    }

    private SetReceivedPrize(listIdFloor: number[], needSaveData: boolean = true) {
        // check depend idFloor to save index prize
        listIdFloor.forEach(idFCheck => {
            const indexSave = idFCheck - 1;
            if (indexSave >= 0) {
                PlayerData.Instance.SL_listBoolReceivePrize[indexSave] = true;
            }
        })
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_SkyLift();
        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    /**
     * func này sẽ trả về %progress sẽ set cho floor có id đấy
     * @param idFloor 
     * @param progressCheck 
     * @returns 
     */
    public GetProgressSetFromId(idFloor: number, progressCheck: number): number {
        if (idFloor == CONFIG_SL.MAX_PRIZE_HAS) return 0;

        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();
        const info_1: InfoFloorSkyLiftJSON = listInfoCheck.find(info => info.idFloor == idFloor);
        const info_2: InfoFloorSkyLiftJSON = listInfoCheck.find(info => info.idFloor == idFloor + 1);

        if (info_1 == null || info_2 == null) { return 0; }

        if (progressCheck < info_1.progress) { return 0; }

        return (progressCheck - info_1.progress) / (info_2.progress - info_1.progress);
    }

    public GetProgressOfFloorNow(idFloor: number, progressCheck: number): number {
        if (idFloor == CONFIG_SL.MAX_PRIZE_HAS) return 0;

        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();
        const info_1: InfoFloorSkyLiftJSON = listInfoCheck.find(info => info.idFloor == idFloor);

        if (info_1 == null) { return 0; }

        if (progressCheck < info_1.progress) { return 0; }

        return progressCheck - info_1.progress;
    }

    /**
     * this func will be called when read event first time
     * when anim UISkyLift done
     * when init new event
     */
    public UpdateProgressOld(needSaveData: boolean = true) {
        PlayerData.Instance.SL_old_progressPlayer = PlayerData.Instance.SL_progressPlayer;
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_SkyLift();
        }
    }

    public UpdateProgressOldForceMinusNow(numberMinus: number, needSaveData: boolean = false) {
        PlayerData.Instance.SL_old_progressPlayer = PlayerData.Instance.SL_progressPlayer - numberMinus;
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_SkyLift();
        }
    }

    public InitNewEvent(needSaveData: boolean = true) {
        const timeNow = Utils.getCurrTime();

        PlayerData.Instance.SL_id += 1;
        PlayerData.Instance.SL_listBoolReceivePrize = new Array(CONFIG_SL.MAX_PRIZE_HAS).fill(false);
        PlayerData.Instance.SL_progressPlayer = 0;
        PlayerData.Instance.SL_timeEnd = timeNow + CONFIG_SL.TIME_LONG_EVENT;
        PlayerData.Instance.SL_timeDelay = timeNow + CONFIG_SL.TIME_LONG_EVENT + CONFIG_SL.TIME_DELAY_EVENT;
        PlayerData.Instance.SL_isReceiveReward = false;
        PlayerData.Instance.SL_old_progressPlayer = 0;


        this.UpdateState(STATE_SL.JOINING);

        this.UpdateProgressOld();
        this.UpdateListPrizeReceived();
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.SKY_LIFT);

        // log event
        LogEventManager.Instance.logEventStart(TYPE_EVENT_GAME.SKY_LIFT, 0, PlayerData.Instance.SL_id);

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_SkyLift();
        }
    }

    /**
     * func này được gọi khi win hoặc lose ở chế độ normal
     * @param isWin 
     * @param needSaveData 
     * @returns 
     */
    public IncreaseProgress(needSaveData: boolean = true) {
        if (this.STATE != STATE_SL.JOINING) { return; }

        if (PlayerData.Instance.SL_progressPlayer < CONFIG_SL.MAX_PROGRESS) {
            PlayerData.Instance.SL_progressPlayer += 1;

            if (needSaveData) {
                PlayerData.Instance.SaveEvent_SkyLift();
            }
            return;
        }
    }

    public GetNumSeparateById(idFloor: number): number {
        if (idFloor == CONFIG_SL.MAX_PRIZE_HAS) { return 0; }
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();
        // console.log(idFloor);
        // console.log(listInfoCheck);

        const info_1: InfoFloorSkyLiftJSON = listInfoCheck.find(info => info.idFloor == idFloor);
        const info_2: InfoFloorSkyLiftJSON = listInfoCheck.find(info => info.idFloor == (idFloor + 1));

        return info_2.progress - info_1.progress - 1;
    }

    public GetIndexFloorProgressFromXToY(progressX: number, progressY: number): number {
        if (progressX <= 0 || progressX > CONFIG_SL.MAX_PROGRESS) { return 0; }
        if (progressY <= 0 || progressY > CONFIG_SL.MAX_PROGRESS) { return 0; }
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();

        let indexFloorX = 0, indexFloorY = 0;
        for (let i = 0; i < listInfoCheck.length; i++) {
            const infoCheck = listInfoCheck[i];
            if (infoCheck.progress >= progressX) {
                indexFloorX = i;
            }
            if (infoCheck.progress >= progressY) {
                indexFloorY = i;
            }
        }

        return (indexFloorX + indexFloorY) / 2;
    }

    public GetIndexFloorProgress(progress: number): number {
        if (progress <= 0 || progress > CONFIG_SL.MAX_PROGRESS) { return 0; }
        if (progress == CONFIG_SL.MAX_PROGRESS) return CONFIG_SL.MAX_PRIZE_HAS;
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();

        for (let i = 0; i < listInfoCheck.length; i++) {
            const infoCheck = listInfoCheck[i];
            if (infoCheck.progress >= progress) {
                return i;
            }
        }

        return 0;
    }

    public GetIndexFloorReach(progress: number): number {
        if (progress <= 0 || progress > CONFIG_SL.MAX_PROGRESS) { return 0; }
        if (progress == CONFIG_SL.MAX_PROGRESS) return CONFIG_SL.MAX_PRIZE_HAS;
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();

        for (let i = 0; i < listInfoCheck.length; i++) {
            const infoCheck = listInfoCheck[i];
            if (infoCheck.progress == progress) {
                return i;
            }
        }

        return -1;
    }

    public LoseGame(needSaveGame: boolean = true) {
        if (this.STATE != STATE_SL.JOINING) { return; }

        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();
        const indexSavePoint: number = this.GetIndexSavePoint();
        const infoSave = listInfoCheck[indexSavePoint];
        PlayerData.Instance.SL_progressPlayer = infoSave.progress;

        if (needSaveGame) {
            PlayerData.Instance.SaveEvent_SkyLift();
        }
    }

    public GetIndexSavePoint(): number {
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();
        let indexSavePoint: number = 0;

        for (let i = 0; i < listInfoCheck.length; i++) {
            const infoCheck = listInfoCheck[i];
            if (infoCheck.isSavePoint && infoCheck.progress <= this.ProgressNow) {
                indexSavePoint = i;
            }
            if (infoCheck.progress > this.ProgressNow) { break; }
        }

        return indexSavePoint;
    }

    public IsIndexIsSavePoint(progressCheck: number): boolean {
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();

        for (let i = 0; i < listInfoCheck.length; i++) {
            const infoCheck = listInfoCheck[i];
            if (infoCheck.isSavePoint && infoCheck.progress == progressCheck) {
                return true;
            }
        }

        return false;

    }

    public TryEndGameByFullScore(waitToReceiveOrDelay: boolean, needSaveData: boolean = true) {
        if (DataSkyLiftSys.Instance.ProgressNow == CONFIG_SL.MAX_PROGRESS) {
            // khi player đã đạt max scroll thì ta sẽ chỉnh delay time
            // và emit event để ẩn icon ở home đi

            this.UpdateState(waitToReceiveOrDelay ? STATE_SL.WAIT_TO_RECEIVE : STATE_SL.DELAY);

            // force end time
            if (this.GetTimeDisplay() > 0) {
                PlayerData.Instance.SL_timeDelay = Utils.getCurrTime() + CONFIG_SL.TIME_DELAY_EVENT;
                // force end time event
                PlayerData.Instance.SL_timeEnd = Utils.getCurrTime();
            }


            if (needSaveData) {
                PlayerData.Instance.SaveEvent_SkyLift();
            }
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.HIDE_EVENT, TYPE_EVENT_GAME.SKY_LIFT);
        }
    }

    public UpdateStateAfterContinueUI(needSaveData: boolean = true) {
        // force end time
        if (this.GetTimeDisplay() > 0) {
            PlayerData.Instance.SL_timeDelay = Utils.getCurrTime() + CONFIG_SL.TIME_DELAY_EVENT;
            // force end time event
            PlayerData.Instance.SL_timeEnd = Utils.getCurrTime();
        }

        if (this.GetTimeDisplay_Delay() > 0) {
            this.UpdateState(STATE_SL.DELAY);
        } else {
            this.UpdateState(STATE_SL.WAIT_TO_JOIN);
        }

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_SkyLift();
        }

        // clientEvent.dispatchEvent(MConst.EVENT_GAME.HIDE_EVENT, TYPE_EVENT_GAME.SKY_LIFT);
    }

    public TryReceivePrize(needSaveData: boolean = true) {

        const indexFloorReach = this.GetIndexFloorReach(this.ProgressNow);
        const indexFloorOld = this.GetIndexFloorProgress(this.ProgressOld);
        if (indexFloorReach == -1) { return; }

        let listIndexFloorPrize: number[] = new Array((indexFloorReach + 1) - indexFloorOld).fill(0).map((value, _i) => indexFloorOld + _i);
        let listPrizeReceive: IPrize[] = [];
        let listIdFloor: number[] = [];
        listIndexFloorPrize.forEach(indexFloor => {
            const infoFloor = this.GetInfoFloorById(indexFloor);
            listIdFloor.push(infoFloor.idFloor);
            listPrizeReceive = addIPrizeToList(listPrizeReceive, infoFloor.listPrize);
        })

        this.SetReceivedPrize(listIdFloor, false);

        // kiểm tra đã nhận thưởng chưa
        if (DataSkyLiftSys.Instance.IsReceivePrizeClone(indexFloorReach)) { return; }
        PrizeSys.Instance.AddPrize(listPrizeReceive, "SkyLift", needSaveData, true);
    }

    public IsReceivePrizeClone(idFloor: number) {
        const indexSave = idFloor - 1;
        if (indexSave < 0) { return false; }
        return this._listPrizeReceived[indexSave];
    }

    public IsReachPlatform(): boolean {
        const listInfoCheck = ReadDataJson.Instance.GetDataSkyLift();
        const progressPlayerNow = this.ProgressNow;
        for (let i = 0; i < listInfoCheck.length; i++) {
            const infoCheck = listInfoCheck[i];
            if (infoCheck.progress == progressPlayerNow) {
                return true;
            }
        }

        return false;
    }
    /**
     * func này sẽ gọi sau khi increase progress
     */
    public UpdateListPrizeReceived() { this._listPrizeReceived = [...PlayerData.Instance.SL_listBoolReceivePrize]; }
    public get ProgressOld() { return PlayerData.Instance.SL_old_progressPlayer; }
    public get ProgressNow() { return PlayerData.Instance.SL_progressPlayer; }
    public get IsPlayTutInfo() { return PlayerData.Instance.SL_isPlayedTut; }
    public SetPlayTutInfo(state: boolean, needSaveData: boolean = true) { PlayerData.Instance.SL_isPlayedTut = state; if (needSaveData) { PlayerData.Instance.SaveEvent_SkyLift(); } }
    public get GetDataJson(): InfoFloorSkyLiftJSON[] { return ReadDataJson.Instance.GetDataSkyLift(); }
    public SetReceivePrizeEndEvent() { PlayerData.Instance.SL_isReceiveReward = true; }

    public GetParamToLogThisEvent(): IParamLogEventInGame {
        return {
            idEvent: TYPE_EVENT_GAME.SKY_LIFT,
            num_play_event: PlayerData.Instance.SL_id,
            progress_event: PlayerData.Instance.SL_progressPlayer
        };
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region state
    public UpdateState(newState: STATE_SL) {
        const oldState = this._stateDataSkyLift;

        this._stateDataSkyLift = newState;
        this.UnRegisterTime();
        this.UnRegisterTimeDelay();

        switch (true) {
            case oldState == STATE_SL.DELAY && newState == STATE_SL.WAIT_TO_JOIN:
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.SKY_LIFT);
                break;
        }


        switch (this._stateDataSkyLift) {
            case STATE_SL.JOINING:
                this.RegisterTime();
                break;
            case STATE_SL.DELAY:
                this.RegisterTimeDelay();
                break;
        }
    }
    //#endregion state
    //==========================================

    //==========================================
    //#region time
    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private RegisterTimeDelay() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UnRegisterTimeDelay() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this);
    }

    private UpdateTime() {
        // check is end time
        const timeNow: number = Utils.getCurrTime();
        if (PlayerData.Instance.SL_timeEnd <= timeNow) {
            this.UnRegisterTime();
            if (this.STATE == STATE_SL.JOINING) {
                // set time to the end of the day
                this.UpdateState(STATE_SL.WAIT_TO_RECEIVE);
            }
        }
    }

    private UpdateTimeDelay() {
        // check is end time
        const timeNow: number = Utils.getCurrTime();
        if (PlayerData.Instance.SL_timeDelay <= timeNow) {
            this.UnRegisterTimeDelay();
            if (this.STATE == STATE_SL.DELAY) {
                // set time to the end of the day
                this.UpdateState(STATE_SL.WAIT_TO_JOIN);
            }
        }
    }

    public GetTimeDisplay() {
        if (PlayerData.Instance.SL_isReceiveReward) { return -1; }
        const timeNow = Utils.getCurrTime();
        // console.log("Check time SL", PlayerData.Instance.ET_id, timeNow > PlayerData.Instance.SL_timeEnd);
        if (PlayerData.Instance.SL_id == 0
            || timeNow > PlayerData.Instance.SL_timeEnd) {
            return -1;
        } else {
            return PlayerData.Instance.SL_timeEnd - timeNow;
        }
    }

    public GetTimeDisplay_Delay(): number {
        // if (!PlayerData.Instance.SL_isReceiveReward) { return -1; }
        const timeNow = Utils.getCurrTime();
        const result = PlayerData.Instance.SL_timeDelay - timeNow;
        if (PlayerData.Instance.SL_timeDelay == 0 || result <= 0) {
            return -1;
        } else {
            return result;
        }
    }
    //#endregion time
    //==========================================


    //==========================================
    //#region cheat
    public ForceChangeTimeCooldown(time: number) {
        PlayerData.Instance.SL_timeEnd = Utils.getCurrTime() + time;
        PlayerData.Instance.SL_timeDelay = Utils.getCurrTime() + time + CONFIG_SL.TIME_DELAY_EVENT;
        PlayerData.Instance.SaveEvent_SkyLift();
    }

    public ForceChangeTimeDelay(time: number) {
        PlayerData.Instance.SL_timeDelay = Utils.getCurrTime() + time;
        PlayerData.Instance.SaveEvent_SkyLift();
    }
    //#endregion cheat
    //==========================================
}