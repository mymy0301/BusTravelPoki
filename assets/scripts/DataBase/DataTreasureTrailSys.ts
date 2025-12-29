import { _decorator } from 'cc';
import { InfoBot_TreasureTrail, IParamLogEventInGame, IPrize, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE } from '../Utils/Types';
import { Utils } from '../Utils/Utils';
import { PlayerData } from '../Utils/PlayerData';
import { CONFIG_TT, EVENT_TT, STATE_TT } from '../Scene/OtherUI/UITreasureTrail/TypeTreasureTrail';
import { randomListOfTheRangeWithNotSameValue, randomWithSeed, shuffleArrayWithSeed } from '../framework/randomSeed';
import { ReadDataJson } from '../ReadDataJson';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { IDataPlayer_LEADERBOARD } from '../Utils/server/ServerPegasus';
import { DataLeaderboardSys } from '../Scene/DataLeaderboardSys';
import { MConfigs } from '../Configs/MConfigs';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { DataEventsSys } from '../Scene/DataEventsSys';
import { LogEventManager } from '../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Mon Aug 11 2025 11:51:46 GMT+0700 (Indochina Time)
 * DataTreasureTrailSys
 * db://assets/scripts/DataBase/DataTreasureTrailSys.ts
 *
 */

@ccclass('DataTreasureTrailSys')
export class DataTreasureTrailSys {
    public static Instance: DataTreasureTrailSys = null;
    constructor() {
        if (DataTreasureTrailSys.Instance == null) {
            DataTreasureTrailSys.Instance = this;
            clientEvent.on(EVENT_TT.FORCE_END, this.ForceEnd, this);
            clientEvent.on(EVENT_TT.FORCE_WAIT_TO_JOIN, this.ForceWaitToJoin, this);
        }
    }

    private _mapListBot: Map<number, InfoBot_TreasureTrail[][]> = new Map();
    private _state: STATE_TT = STATE_TT.WAIT_TO_JOIN; public get STATE() { return this._state; }
    //==========================================
    //#region private
    public GetListBotByStage(stage: number): InfoBot_TreasureTrail[] {
        if (stage < 0) { return null; }

        const numWin = PlayerData.Instance.TT_numWin;

        // check save file
        if (this._mapListBot.get(numWin) != null && this._mapListBot.get(numWin)[stage] != null) {
            return this._mapListBot.get(numWin)[stage];
        }

        let numPlayerRemaining: number = 0;

        // get num player in this state
        if (numWin < CONFIG_TT.NUM_CONFIG_BOT_REMAIN) {
            numPlayerRemaining = ReadDataJson.Instance.GetConfigRemainBotTreasureTrail()[numWin][stage];
        } else {
            const rateState = ReadDataJson.Instance.GetRateRemainBotTreasureTrail()[stage];
            numPlayerRemaining = randomWithSeed(numWin.toString(), rateState.min, rateState.max);
        }

        // console.warn("11111", numWin, numPlayerRemaining);

        // random the player
        // Tạo danh sách các số từ 1 đến 100
        const allBotIndexes: number[] = Array.from({ length: 99 }, (_, i) => i + 1);
        let listIndexBot: number[] = randomListOfTheRangeWithNotSameValue(numWin.toString(), numPlayerRemaining, allBotIndexes);

        // filter bot has
        const allBots: InfoBot_TreasureTrail[] = Utils.CloneListDeep(PlayerData.Instance.TT_infoBot);
        let resultInfoBot: InfoBot_TreasureTrail[] = allBots.filter((bot, index) => listIndexBot.includes(Number.parseInt(bot.id)));

        // add player
        let infoPlayer: InfoBot_TreasureTrail = new InfoBot_TreasureTrail();
        infoPlayer.SetData(CONFIG_TT.ID_PLAYER, MConfigFacebook.Instance?.playerPhotoURL);
        resultInfoBot.push(infoPlayer);

        resultInfoBot.sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id));

        // save data temp
        if (this._mapListBot.get(numWin) == null) {
            let listInfoEachStage: InfoBot_TreasureTrail[][] = [];
            listInfoEachStage[stage] = resultInfoBot;
            this._mapListBot.set(numWin, listInfoEachStage);
        } else {
            let listInfoEachStage = this._mapListBot.get(numWin);
            listInfoEachStage[stage] = resultInfoBot;
            this._mapListBot.set(numWin, listInfoEachStage);
        }

        return resultInfoBot;
    }

    private InitBots(listAvatar: string[]): InfoBot_TreasureTrail[] {
        // tạo ra 100 người bao gồm player

        // thứ tự luôn là player , bot 1, bot 2 , ...
        let result: InfoBot_TreasureTrail[] = [];

        let player = new InfoBot_TreasureTrail();
        player.SetData(CONFIG_TT.ID_PLAYER, MConfigFacebook.Instance.playerPhotoURL);
        result.push(player);

        // gen bot
        for (let i = 0; i < 99; i++) {
            let newBot = new InfoBot_TreasureTrail();
            let idBot = i + 1;
            const avatar = listAvatar[i % listAvatar.length];
            newBot.SetData(idBot.toString(), avatar);
            result.push(newBot);
        }

        LogEventManager.Instance.logEventStart(TYPE_EVENT_GAME.TREASURE_TRAIL, 0 , PlayerData.Instance.TT_id);

        return result;
    }

    private InitAvatar(): string[] {
        // get datato random
        let fakePlayerGetByServer: IDataPlayer_LEADERBOARD[] = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY_PREVIOUS));
        // console.log("111", fakePlayerGetByServer);
        if (fakePlayerGetByServer == null || fakePlayerGetByServer.length < 99) {
            fakePlayerGetByServer = MConfigs.dataBotFriend;
        } else {
            // remove player
            fakePlayerGetByServer = fakePlayerGetByServer.filter(player => player.playerId != MConfigFacebook.Instance.playerID);
        }

        let cloneAvatar: string[] = fakePlayerGetByServer.map(player => player.avatar).slice(0, CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI);
        return cloneAvatar;
    }

    public GetListBotNoPlayer(stage: number): InfoBot_TreasureTrail[] {
        const listBotByState: InfoBot_TreasureTrail[] = this.GetListBotByStage(stage);
        return listBotByState.filter(bot => bot.id != CONFIG_TT.ID_PLAYER);
    }

    public GetPlayer(): InfoBot_TreasureTrail {
        return PlayerData.Instance.TT_infoBot.find(bot => bot.id == CONFIG_TT.ID_PLAYER);
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region state event
    private UpdateState(state: STATE_TT) {
        const previousState = this._state;

        this._state = state;

        this.UnRegisterTime();
        this.UnRegisterTimeDelay();

        switch (this._state) {
            case STATE_TT.WAIT_TO_JOIN:
                if (previousState != this._state && DataEventsSys.Instance.IsEventShowingByLoop(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.TREASURE_TRAIL);
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.TREASURE_TRAIL);
                }
                break;
            case STATE_TT.JOINING:
                // register time in here => when time end => change state to lose if not win
                this.RegitsterTime();
                break;
            case STATE_TT.DELAY_LOSE:
                this.RegisterTime_delay();
                break;
        }
    }

    public UnlockEventByTut() {
        this.UpdateState(STATE_TT.WAIT_TO_JOIN);
    }
    //#endregion state event
    //==========================================

    //==========================================
    //#region public
    public GetListPathAvaBotShow_uiPrepare(stage: number): InfoBot_TreasureTrail[] {
        const listBotNoPlayer: InfoBot_TreasureTrail[] = this.GetListBotNoPlayer(stage);
        const infoPlayer: InfoBot_TreasureTrail = this.GetPlayer();
        listBotNoPlayer.push(infoPlayer);
        return listBotNoPlayer;
    }

    public UpdateStateEventFromLoad(isEventUnlocked: boolean) {
        //NOTE - ở đây chỉ được phép thay đổi dữ liệu lưu ý ko được phép gọi hàm lưu data
        // kiểm tra thời gian của events
        // WAIT_TO_JOIN,
        //JOINING,
        //WIN,
        //LOSE,

        const isEndTime: boolean = PlayerData.Instance.TT_timeEnd <= Utils.getCurrTime();
        const isDelayTime: boolean = PlayerData.Instance.TT_timeEnd + CONFIG_TT.TIME_REPEAT_EVENT > Utils.getCurrTime();
        const isReceiveReward: boolean = PlayerData.Instance.TT_isReceivePrizeSummary;
        const streakWinPlayer: number = PlayerData.Instance.TT_streakPlayer;
        const isLosing: boolean = PlayerData.Instance.TT_isLose;
        const canReInit: boolean = PlayerData.Instance.TT_canInit;

        switch (true) {
            // case event đang lock <VD chưa unlock>
            case !isEventUnlocked:
                this.UpdateState(STATE_TT.LOCK);
                // console.log("🚀", 1)
                break;
            // case win
            // chưa nhận thưởng và streak của player = 7
            case !isReceiveReward && streakWinPlayer == 7 && !isLosing:
                this.UpdateState(STATE_TT.WIN);
                PlayerData.Instance.TT_infoBot = this.InitBots(PlayerData.Instance.TT_listAvatar);
                // console.log("🚀", 5)
                break;
            // case event đang delay lose
            case isDelayTime && isReceiveReward && isLosing:
                this.UpdateState(STATE_TT.DELAY_LOSE);
                // console.log("🚀", 2)
                break;
            // case event đang delay win
            case isReceiveReward && !isLosing && !canReInit:
                this.UpdateState(STATE_TT.DELAY_WIN);
                // console.log("🚀", 3)
                break;
            // case đợi để join
            // kiểm tra đã nhận thưởng thì là đợi join again
            case !isDelayTime && isReceiveReward:
                this.UpdateState(STATE_TT.WAIT_TO_JOIN);
                // console.log("🚀", 4)
                break;
            // case lose
            // chưa nhận thưởng và streak của player chưa hoàn thành
            // hoặc đã thua
            case (!isReceiveReward && streakWinPlayer < CONFIG_TT.LEVEL_PLAY && isEndTime) || (!isReceiveReward && isLosing):
                this.UpdateState(STATE_TT.LOSE);
                PlayerData.Instance.TT_infoBot = this.InitBots(PlayerData.Instance.TT_listAvatar);
                // console.log("🚀", 6)
                break;
            // case đang join
            // kiểm tra chưa kết thúc event và chuỗi chiến thắng của người chơi > 0 , tức là nếu người chơi mất chuỗi thì sẽ streak của user sẽ là -1;
            case !isReceiveReward && !isEndTime && streakWinPlayer >= 0 && !isLosing:
                this.UpdateState(STATE_TT.JOINING);
                PlayerData.Instance.TT_infoBot = this.InitBots(PlayerData.Instance.TT_listAvatar);
                break;
        }
    }

    public GetTimeDisplay(): number {
        if (PlayerData.Instance.TT_timeEnd <= 0) return -1;
        return PlayerData.Instance.TT_timeEnd - Utils.getCurrTime();
    }

    public InitEvent(needSaveData: boolean = true) {
        const timeNow = Utils.getCurrTime();

        // tăng id , init danh sách mới , set up thời gian ở đây
        PlayerData.Instance.TT_id += 1;
        PlayerData.Instance.TT_streakPlayer = 0;
        PlayerData.Instance.TT_streakPlayer_old = 0;
        PlayerData.Instance.TT_timeEnd = timeNow + CONFIG_TT.TIME_EVENT; // chỉ lưu đến thời điểm kết thúc event
        PlayerData.Instance.TT_listAvatar = this.InitAvatar();
        PlayerData.Instance.TT_infoBot = this.InitBots(PlayerData.Instance.TT_listAvatar);
        PlayerData.Instance.TT_isReceivePrizeSummary = false;
        PlayerData.Instance.TT_isLose = false;
        PlayerData.Instance.TT_canInit = true;

        PlayerData.Instance.SaveEvent_TreasureTrail(needSaveData);

        // change stage event
        this.UpdateState(STATE_TT.JOINING);

        // emit update time for item event
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.TREASURE_TRAIL);
    }

    public IsPlayTutEvent(): boolean {
        return PlayerData.Instance.TT_isPlayedTut;
    }

    public SetPlayTutEvent(newStage: boolean, needSaveData: boolean = true) {
        PlayerData.Instance.TT_isPlayedTut = newStage;
        PlayerData.Instance.SaveEvent_TreasureTrail(needSaveData);
    }

    public TryIncreaseStreak(needSaveData: boolean = true) {
        // check user vẫn còn thời gian?
        // check user đang chơi?
        const streakNow = PlayerData.Instance.TT_streakPlayer;
        if (this.STATE == STATE_TT.JOINING && this.GetTimeDisplay() > 0 && streakNow < CONFIG_TT.LEVEL_PLAY) {
            // // cheat
            // if (PlayerData.Instance.TT_streakPlayer == 0) {
            //     this._stageBefore = 6;
            //     this._stageNow = 7;
            //     PlayerData.Instance.TT_streakPlayer = CONFIG_TT.LEVEL_PLAY;
            //     this.UpdateState(STATE_TT.WIN);
            // }

            PlayerData.Instance.TT_streakPlayer_old = streakNow;
            PlayerData.Instance.TT_streakPlayer += 1;

            if (PlayerData.Instance.TT_streakPlayer == CONFIG_TT.LEVEL_PLAY && !PlayerData.Instance.TT_isReceivePrizeSummary) {
                PlayerData.Instance.TT_canInit = false;
                this.UpdateState(STATE_TT.WIN);
            }
        }

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_TreasureTrail(needSaveData);
        }
    }

    public UpdateStreakOldNow(needSaveData: boolean = false) {
        PlayerData.Instance.TT_streakPlayer_old = PlayerData.Instance.TT_streakPlayer;
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_TreasureTrail();
        }
    }

    /**
     * This func will be call when used data to show UI
     */
    public SaveSTAGE(needSaveData: boolean = false) {
        PlayerData.Instance.TT_streakPlayer_old = PlayerData.Instance.TT_streakPlayer;
        if (!needSaveData) {
            PlayerData.Instance.SaveEvent_TreasureTrail();
        }
    }

    public CanShowUIAtHome() {
        switch (true) {
            case this.STATE == STATE_TT.WIN || this.STATE == STATE_TT.LOSE:
                return true;
            case this.STATE == STATE_TT.JOINING && PlayerData.Instance.TT_streakPlayer > PlayerData.Instance.TT_streakPlayer_old:
                return true;
        }
        return false;
    }

    public SaveReceivePrizeDone(needSaveData: boolean = true) {
        PlayerData.Instance.TT_isReceivePrizeSummary = true;
        // chỉnh lại thời gian của event để cho khớp với thời gian delay
        PlayerData.Instance.TT_timeEnd = Utils.getCurrTime();
        // update trạng thái event về delay
        this.UpdateState(PlayerData.Instance.TT_isLose ? STATE_TT.DELAY_LOSE : STATE_TT.DELAY_WIN);
        if (!PlayerData.Instance.TT_isLose) { PlayerData.Instance.TT_numWin += 1; }
        PlayerData.Instance.SaveEvent_TreasureTrail(needSaveData);
    }

    public LoseGame(needSaveData: boolean) {
        if (this.STATE == STATE_TT.JOINING) {
            PlayerData.Instance.TT_isLose = true;
            this.UpdateState(STATE_TT.LOSE);
            if (needSaveData) {
                PlayerData.Instance.SaveEvent_TreasureTrail();
            }
        }
    }

    public GetPrizeReceiveWin(): IPrize[] {
        const listBotRemain = this.GetListBotByStage(CONFIG_TT.LEVEL_PLAY);
        if (listBotRemain == null || listBotRemain.length == 0) { return null; }
        const totalCoinReceive: number = Math.floor(CONFIG_TT.PRIZE_WIN / listBotRemain.length);
        return [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, totalCoinReceive)]
    }

    public get ProgressNow() { return PlayerData.Instance.TT_streakPlayer; }
    public get ProgressOld() { return PlayerData.Instance.TT_streakPlayer_old; }

    public GetParamToLogThisEvent(): IParamLogEventInGame {
        return {
            idEvent: TYPE_EVENT_GAME.TREASURE_TRAIL,
            num_play_event: PlayerData.Instance.TT_id,
            progress_event: PlayerData.Instance.TT_streakPlayer
        };
    }

    public IsReceiveReward() { return PlayerData.Instance.TT_isReceivePrizeSummary; }

    public GetIdEvent() { return PlayerData.Instance.TT_id; }
    //#endregion public
    //==========================================

    //==========================================
    //#region time
    private RegitsterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private RegisterTime_delay() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this);
        }
    }

    private UnRegisterTime() { clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this); }
    private UnRegisterTimeDelay() { clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this); }

    private UpdateTime() {
        // check is end time of event
        const timeNow: number = Utils.getCurrTime();
        const isEndTimeEvent = PlayerData.Instance.TT_timeEnd <= timeNow;
        const isEndTimeEventLoop = DataEventsSys.Instance.GetTimeGroupEventRemain(TYPE_EVENT_GAME.TREASURE_TRAIL, 1) < 0;
        if (isEndTimeEvent || isEndTimeEventLoop) {
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
            if (this.STATE == STATE_TT.JOINING && PlayerData.Instance.TT_streakPlayer < CONFIG_TT.LEVEL_PLAY && !PlayerData.Instance.TT_isReceivePrizeSummary) {
                this.UpdateState(STATE_TT.LOSE);
            }
        }
    }

    private UpdateTimeDelay() {
        // check is end time of event
        const timeNow: number = Utils.getCurrTime();
        const isEndTimeEventDelay = PlayerData.Instance.TT_timeEnd + CONFIG_TT.TIME_REPEAT_EVENT <= timeNow;
        const isEndTimeEventLoop = DataEventsSys.Instance.GetTimeGroupEventRemain(TYPE_EVENT_GAME.TREASURE_TRAIL, 1) < 0;
        if (isEndTimeEventDelay || isEndTimeEventLoop) {
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this);
            if (this.STATE == STATE_TT.DELAY_LOSE) {
                this.UpdateState(STATE_TT.WAIT_TO_JOIN);
            }
        }
    }

    public GetTimeDisplayCoolDown(): number {
        if (PlayerData.Instance.TT_isReceivePrizeSummary) { return - 1 }
        return PlayerData.Instance.TT_timeEnd - Utils.getCurrTime();
    }

    public GetTimeDisplay_Delay(): number {
        if (!PlayerData.Instance.TT_isReceivePrizeSummary) { return -1; }
        return PlayerData.Instance.TT_timeEnd + CONFIG_TT.TIME_REPEAT_EVENT - Utils.getCurrTime();
    }
    //#endregion time
    //==========================================

    //==========================================
    //#region listen
    private ForceEnd(needSaveData: boolean = true) {
        if (this.STATE == STATE_TT.JOINING) {
            PlayerData.Instance.TT_isLose = true;
            console.log("call in this case");
            this.UpdateState(STATE_TT.LOSE);
        }

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_TreasureTrail();
        }
    }

    private ForceWaitToJoin(needSaveData: boolean = true) {
        PlayerData.Instance.TT_streakPlayer = 0;
        PlayerData.Instance.TT_streakPlayer_old = 0;
        PlayerData.Instance.TT_timeEnd = 0; // chỉ lưu đến thời điểm kết thúc event
        // PlayerData.Instance.TT_isReceivePrizeSummary = false;
        PlayerData.Instance.TT_isLose = false;
        PlayerData.Instance.TT_canInit = true;
        this.UpdateState(STATE_TT.WAIT_TO_JOIN);
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_TreasureTrail();
        }
    }
    //#endregion listen
    //==========================================


    //==========================================
    //#region cheat
    public ForceChangeTimeCooldown(time: number) {
        if (!PlayerData.Instance.TT_isReceivePrizeSummary) {
            PlayerData.Instance.TT_timeEnd = Utils.getCurrTime() + time;
            PlayerData.Instance.SaveEvent_TreasureTrail();
        }
    }

    public ForceChangeTimeDelay(time: number) {
        if (PlayerData.Instance.TT_isReceivePrizeSummary) {
            PlayerData.Instance.TT_timeEnd = Utils.getCurrTime() - CONFIG_TT.TIME_REPEAT_EVENT + time;
            PlayerData.Instance.SaveEvent_TreasureTrail();
        }
    }
    //#endregion cheat
    //==========================================


    //==========================================
    //#region Test
    public Test_Temp_Bot() {
        let listBot: InfoBot_TreasureTrail[] = Array.from({ length: 100 }, (_, index) => {
            return { id: index.toString(), avatar: "" } as InfoBot_TreasureTrail;
        });

        return listBot;
    }
    //#endreion Test
    //==========================================
}