import { _decorator, randomRange, find } from 'cc';
import { InfoBot_DashRush, IPrize, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE } from '../Utils/Types';
import { Utils } from '../Utils/Utils';
import { PlayerData } from '../Utils/PlayerData';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { MConfigs } from '../Configs/MConfigs';
import { DataLeaderboardSys } from './DataLeaderboardSys';
import { IDataPlayer_LEADERBOARD } from '../Utils/server/ServerPegasus';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { CONFIG_DR, STATE_DR, EVENT_DASH_RUSH } from './OtherUI/UIDashRush/TypeDashRush';
import { DataEventsSys } from './DataEventsSys';
const { ccclass, property } = _decorator;

@ccclass('DataDashRush')
export class DataDashRush {
    public static Instance: DataDashRush = null;

    constructor() {
        if (DataDashRush.Instance == null) {
            DataDashRush.Instance = this;
            clientEvent.on(EVENT_DASH_RUSH.FORCE_END, this.ForceEnd, this);
            clientEvent.on(EVENT_DASH_RUSH.FORCE_WAIT_TO_JOIN, this.ForceWaitToJoin, this);
        }
    }

    private _stateEvent: STATE_DR = STATE_DR.WAIT_TO_JOIN;

    //=================================
    //#region logic 
    private UpdateProgressBot(isWin: boolean, canSaveData: boolean, canIncreaseScorePlayer: boolean = true): boolean {
        const self = this;

        function SpecialReasonIncrease(botCheck: InfoBot_DashRush, player: InfoBot_DashRush): boolean {
            if (PlayerData.Instance.DR_numJoined <= 2 && botCheck.progress - 2 >= player.progress) {
                return false;
            }
            return true;
        }


        function CheckLogicBeforeIncreaseBotProgress(botCheck: InfoBot_DashRush, ratioCanIncreaseProgress) {
            return SpecialReasonIncrease(botCheck, player)
                && self.GetPlayerMaxScore() == null
                && randomRange(0, 10) <= ratioCanIncreaseProgress;
        }

        function CheckLimitScore(botCheck: InfoBot_DashRush) {
            if (botCheck.progress > CONFIG_DR.DR_MAX_PROGRESS) {
                botCheck.progress = CONFIG_DR.DR_MAX_PROGRESS;
            }
        }

        if (!this.CanShowTimeDashRush() || this.GetPlayerMaxScore() || PlayerData.Instance.DR_listPlayerJoin == null) {
            return false;
        }

        let hasDataUpdate: boolean = false;
        let isPlayerWin: boolean = false;

        const bot1 = PlayerData.Instance.DR_listPlayerJoin.filter(bot => bot.id == "Bot1")[0];
        const bot2 = PlayerData.Instance.DR_listPlayerJoin.filter(bot => bot.id == "Bot2")[0];
        const bot3 = PlayerData.Instance.DR_listPlayerJoin.filter(bot => bot.id == "Bot3")[0];
        const bot4 = PlayerData.Instance.DR_listPlayerJoin.filter(bot => bot.id == "Bot4")[0];
        const player = PlayerData.Instance.DR_listPlayerJoin.filter(bot => bot.id == MConfigFacebook.Instance.playerID)[0];

        // === update progress player
        if (isWin && canIncreaseScorePlayer) {
            player.progress += 1;
            CheckLimitScore(player);
            hasDataUpdate = true;
            isPlayerWin = player.progress == CONFIG_DR.DR_MAX_PROGRESS;
        }

        if (!isPlayerWin) {
            // in case player win => the bot will not increase
            if (isWin) {
                const botActions = [
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot1, 7)) { bot1.progress += 1; CheckLimitScore(bot1); hasDataUpdate = true; } },
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot2, 5)) { bot2.progress += 1; CheckLimitScore(bot2); hasDataUpdate = true; } },
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot3, 4)) { bot3.progress += 1; CheckLimitScore(bot3); hasDataUpdate = true; } },
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot4, 3)) { bot4.progress += 1; CheckLimitScore(bot4); hasDataUpdate = true; } }
                ];

                while (botActions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * botActions.length);
                    botActions[randomIndex]();
                    botActions.splice(randomIndex, 1);
                }
            } else {
                const botActions = [
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot1, 1.5)) { bot1.progress += 1; CheckLimitScore(bot1); hasDataUpdate = true; } },
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot2, 1.5)) { bot2.progress += 1; CheckLimitScore(bot2); hasDataUpdate = true; } },
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot3, 1.5)) { bot3.progress += 1; CheckLimitScore(bot3); hasDataUpdate = true; } },
                    () => { if (CheckLogicBeforeIncreaseBotProgress(bot4, 1.5)) { bot4.progress += 1; CheckLimitScore(bot4); hasDataUpdate = true; } }
                ];

                while (botActions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * botActions.length);
                    botActions[randomIndex]();
                    botActions.splice(randomIndex, 1);
                }
            }
        }

        // ==== update cacheBot ====
        this.CacheScoreBot(false);

        // ==== save data ======
        PlayerData.Instance.SaveEvent_DashRush(hasDataUpdate && canSaveData);

        // emit update UI
        if (hasDataUpdate) {
            // console.log("Update data bot");
            clientEvent.dispatchEvent(EVENT_DASH_RUSH.UPDATE_BOT_RACE);
            if (this.IsEndTime() || this.GetPlayerMaxScore() != null) {
                this.UpdateStateEvent(STATE_DR.WAIT_TO_RECEIVE_PRIZE);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
            }
            return true;
        }
    }

    private GenNewListBot(): InfoBot_DashRush[] {
        // thứ tự luôn là player , bot 1, bot 2 , ...
        let result: InfoBot_DashRush[] = [];

        let player = new InfoBot_DashRush();
        player.SetData(MConfigFacebook.Instance.playerID, MConfigFacebook.Instance.playerName, MConfigFacebook.Instance.playerPhotoURL, 0);
        result.push(player);

        // get datato random
        let fakePlayerGetByServer: IDataPlayer_LEADERBOARD[] = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY_PREVIOUS));
        // console.log("111", fakePlayerGetByServer);
        if (fakePlayerGetByServer == null || fakePlayerGetByServer.length < 5) {
            fakePlayerGetByServer = MConfigs.dataBotFriend;
        } else {
            // remove player
            fakePlayerGetByServer = fakePlayerGetByServer.filter(player => player.playerId != MConfigFacebook.Instance.playerID);
        }

        // random data 5 bot
        const dataBot: IDataPlayer_LEADERBOARD[] = Utils.randomListValueOfList(5, fakePlayerGetByServer);

        // 
        let testData = [6, 4, 2, 3, 4];
        // gen bot
        for (let i = 0; i < 4; i++) {
            let newBot = new InfoBot_DashRush();
            let idBot = '';
            let dataChoice: IDataPlayer_LEADERBOARD = dataBot[i];
            switch (i) {
                case 0: idBot = 'Bot1'; break;
                case 1: idBot = 'Bot2'; break;
                case 2: idBot = 'Bot3'; break;
                case 3: idBot = 'Bot4'; break;
            }
            newBot.SetData(idBot, dataChoice.name, dataChoice.avatar, 0);
            // newBot.progress = testData[i];
            result.push(newBot);
        }

        // set cache for bot
        result.forEach(bot => {
            PlayerData.Instance.DR_cacheOldScore.set(bot.id, bot.progress);
        })

        return result;
    }

    public GetMaxScore(): number {
        let maxScore = 0;
        PlayerData.Instance.DR_listPlayerJoin.forEach(bot => {
            if (bot.progress > maxScore) {
                maxScore = bot.progress;
            }
        });
        return maxScore;
    }
    //#endregion logic
    //=================================

    //=================================
    //#region state
    public UpdateStateEvent(newState: STATE_DR) {
        const stateBefore = this._stateEvent;
        this._stateEvent = newState;

        this.UnRegisterTimeDelay();
        this.UnRegisterTime();

        switch (this._stateEvent) {
            case STATE_DR.WAIT_TO_JOIN:
                if (stateBefore == STATE_DR.DELAY_LOSE || stateBefore == STATE_DR.DELAY_WIN) {
                    // emit update icon
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
                }
                break;
            case STATE_DR.DELAY_WIN:
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
                break;
            case STATE_DR.DELAY_LOSE:
                this.RegisterTimeDelay();
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
                break;
            case STATE_DR.JOINING:
                this.RegisterTime();
                break;
        }
    }

    public GetState(): STATE_DR { return this._stateEvent; }

    public TryAutoUpdateState() {
        const isHaveDataBot = PlayerData.Instance.DR_listPlayerJoin != null && PlayerData.Instance.DR_listPlayerJoin.length > 1;
        const isPlayerWin: boolean = this.IsPlayerWinCache();
        const isDelayTime: boolean = PlayerData.Instance.DR_timeDelay > Utils.getCurrTime();
        const isEndTime: boolean = this.IsEndTime();
        // check param to denpend which state event in here

        try {
            switch (true) {
                case isHaveDataBot && PlayerData.Instance.DR_timeDelay == 0 && !isEndTime:
                    // console.log("🚀🚀", 2)
                    this.UpdateStateEvent(STATE_DR.JOINING);
                    break;
                case isHaveDataBot && PlayerData.Instance.DR_timeDelay == 0 && isEndTime:
                    // console.log("🚀🚀", 3)
                    this.UpdateStateEvent(STATE_DR.WAIT_TO_RECEIVE_PRIZE);
                    break;
                case PlayerData.Instance.DR_timeDelay > 0 && isDelayTime && !isPlayerWin:
                    // console.log("🚀🚀", 4)
                    this.UpdateStateEvent(STATE_DR.DELAY_LOSE);
                    break;
                case PlayerData.Instance.DR_timeDelay == 0 && isPlayerWin:
                    // console.log("🚀🚀", 5)
                    this.UpdateStateEvent(STATE_DR.DELAY_WIN);
                    break;
                case !isHaveDataBot && PlayerData.Instance.DR_timeDelay == 0:
                    // console.log("🚀🚀", 1)
                    this.UpdateStateEvent(STATE_DR.WAIT_TO_JOIN);
                    break;
                default:
                    // console.log("🚀🚀", 7)
                    this.UpdateStateEvent(STATE_DR.WAIT_TO_JOIN);
                    break;
            }
        } catch (e) {

        }
    }
    //#endregion state
    //=================================

    //=================================
    //#region get func
    public GetPlayerMaxScore(): InfoBot_DashRush {
        // console.log(PlayerData.Instance.DR_listPlayerJoin.map(bto => bto.progress));
        if (PlayerData.Instance.DR_listPlayerJoin == null) { return null; }
        let botWin = PlayerData.Instance.DR_listPlayerJoin.find(bot => bot.progress == CONFIG_DR.DR_MAX_PROGRESS);
        return botWin;
    }

    public GetIndexBestScorePlayer(): number {
        let maxProgress = -1;
        let indexBestScore = -1;
        for (let i = 0; i < PlayerData.Instance.DR_listPlayerJoin.length; i++) {
            if (PlayerData.Instance.DR_listPlayerJoin[i].progress > maxProgress) {
                maxProgress = PlayerData.Instance.DR_listPlayerJoin[i].progress;
                indexBestScore = i;
            }
        }
        return indexBestScore;
    }

    public IsPlayerWin(): boolean {
        try {
            let playerWin: InfoBot_DashRush = PlayerData.Instance.DR_listPlayerJoin[this.GetIndexBestScorePlayer()];
            return playerWin != null && playerWin.progress == CONFIG_DR.DR_MAX_PROGRESS && playerWin.id == MConfigFacebook.Instance.playerID;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public IsPlayerWinCache(): boolean {
        if (PlayerData.Instance.DR_cacheOldScore == null) { return false; }
        const scorePlayer = PlayerData.Instance.DR_cacheOldScore.get(MConfigFacebook.Instance.playerID);
        if (scorePlayer == null) { return false; }
        if (scorePlayer == CONFIG_DR.DR_MAX_PROGRESS) { return true; }
    }

    public IsEndTime() {
        return PlayerData.Instance.DR_timeEnd < Utils.getCurrTime();
    }

    /**
     * This func will return null if time is out
     * @returns 
     */
    public GetTimeDisplay(): number {
        if (PlayerData.Instance.DR_timeEnd == 0 || this.GetPlayerMaxScore() != null) return -1;
        return PlayerData.Instance.DR_timeEnd - Utils.getCurrTime();
    }

    public UpdateData(isWin: boolean = true, canSaveData: boolean): boolean {
        // if no one win => can update data
        if (this.GetPlayerMaxScore() || this.IsEndTime()) { return false; }
        // update data
        this.UpdateProgressBot(isWin, canSaveData);
        return isWin;
    }

    public InitNewRound(needSaveData: boolean) {
        PlayerData.Instance.DR_numJoined += 1;
        PlayerData.Instance.DR_timeEnd = Utils.getCurrTime() + CONFIG_DR.DR_MAX_TIME_EVENT;
        PlayerData.Instance.DR_timeDelay = 0;
        this.ResetCache(false);
        PlayerData.Instance.DR_listPlayerJoin = this.GenNewListBot();
        PlayerData.Instance.DR_lastTimePlayerIncreaseScore = Utils.getCurrTime();
        this.CacheScoreBot(false);

        this.UpdateStateEvent(STATE_DR.JOINING);

        PlayerData.Instance.SaveEvent_DashRush(needSaveData);

        // emit new event
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
    }

    public GetDataBot(): InfoBot_DashRush[] {
        // // trong trường hợp ko có người chiến thắng mà đã hết h , random cho 1 con bot win luôn
        // if (this.IsEndTime() && this.GetPlayerMaxScore() == null
        //     && PlayerData.Instance.DR_listPlayerJoin != null && PlayerData.Instance.DR_listPlayerJoin[3] != null) {
        //     PlayerData.Instance.DR_listPlayerJoin[3].progress = CONFIG_DR.DR_MAX_PROGRESS;
        //     PlayerData.Instance.SaveEvent_DashRush();
        // }
        return PlayerData.Instance.DR_listPlayerJoin;
    }

    public GetPrize(): IPrize[] {
        return CONFIG_DR.DR_DATA_PRIZE;
    }

    public IsPlayInfo() {
        return PlayerData.Instance.DR_isPlayedInfo;
    }

    public SetShowInfo(canShowInfo: boolean, needSaveData: boolean = false) {
        PlayerData.Instance.DR_isPlayedInfo = canShowInfo;
        PlayerData.Instance.SaveEvent_DashRush(needSaveData);
    }

    public TryUpdateDataPlayerInList() {
        const isHaveDataBot = PlayerData.Instance.DR_listPlayerJoin != null && PlayerData.Instance.DR_listPlayerJoin.length > 0;

        if (isHaveDataBot) {
            // add player because we no save player data in this list
            let dataPlayer = PlayerData.Instance.DR_listPlayerJoin[0];
            dataPlayer.name = MConfigFacebook.Instance.playerName;
            dataPlayer.id = MConfigFacebook.Instance.playerID;
            dataPlayer.avatar = MConfigFacebook.Instance.playerPhotoURL;
        }

        this.TryAutoUpdateState();
    }

    public IsEndEventAndPlayerNotWin() {
        if (this.IsEndTime()) {
            return !this.IsPlayerWin();
        }

        return false;
    }

    public ResetData(needSaveData: boolean = true) {
        PlayerData.Instance.DR_listPlayerJoin = [];
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
        PlayerData.Instance.SaveEvent_DashRush(needSaveData);
    }

    public CanShowTimeDashRush(): boolean {
        return PlayerData.Instance.DR_listPlayerJoin.length > 1;
    }

    public IsJoiningDashRush(): boolean {
        // check valid
        const isJoiningDashRush: boolean = this.IsPlayInfo() && this.CanShowTimeDashRush();
        return isJoiningDashRush;
    }

    public UpdateTimeDelay(needSaveData: boolean = true) {
        PlayerData.Instance.DR_timeDelay = Utils.getCurrTime() + CONFIG_DR.TIME_DELAY;
        PlayerData.Instance.SaveEvent_DashRush(needSaveData);
    }

    public GetTimeDisplay_Delay(): number {
        return PlayerData.Instance.DR_timeDelay - Utils.getCurrTime();
    }
    //#endregion get func
    //==================================

    //=================================
    //#region cache bot
    public CacheScoreBot(needSaveData: boolean = true) {
        const infoBotNow = this.GetDataBot();
        if (infoBotNow.length > 0) {
            infoBotNow.forEach(bot => {
                PlayerData.Instance.DR_cacheOldScore.set(bot.id, bot.progress);
            })
            // save data
            PlayerData.Instance.SaveEvent_DashRush(needSaveData);
        }
    }

    /**
     * @returns Map<id , score>
     */
    public GetCloneCacheData(): Map<string, number> {
        return new Map<string, number>(JSON.parse(JSON.stringify(Array.from(PlayerData.Instance.DR_cacheOldScore))));
    }

    /**
     * Get the data suit for cache file
     * @returns 
     */
    public GetOldDataCache(): InfoBot_DashRush[] {
        const dataBotNow = DataDashRush.Instance.GetDataBot();
        const cacheNow = this.GetCloneCacheData();

        // console.log(cacheNow);

        // check valid
        if (dataBotNow == null || cacheNow == null || dataBotNow.length == 0 || cacheNow.size == 0) { return null; }

        // clone data
        let copyDataPlayer = JSON.parse(JSON.stringify(DataDashRush.Instance.GetDataBot())) as InfoBot_DashRush[];

        // update cache score
        cacheNow.forEach((value: number, key: string) => {
            // find through id => set score => sort the data
            // console.log(value, key);
            let bot = copyDataPlayer.find(bot => bot.id == key);
            if (bot != null) {
                bot.progress = value;
            }
        })

        return copyDataPlayer;
    }

    public ResetCache(needSaveData: boolean = true) {
        PlayerData.Instance.DR_cacheOldScore.clear();
        PlayerData.Instance.SaveEvent_DashRush(needSaveData);
    }
    //#endregion cache bot
    //=================================

    //==================================
    //#region registerTime
    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this);
        }
    }

    private UpdateTimeClockDelay() {
        const timeNow = Utils.getCurrTime();
        const isDelayTime = PlayerData.Instance.DR_timeDelay > timeNow;
        if (!isDelayTime) {
            this.UnRegisterTimeDelay();
            // chuyển sang wait to join
            // nếu như vẫn đang trong event loop mới có thể chuyển sang
            const stateEventNow = this._stateEvent;
            if (DataEventsSys.Instance.IsEventShowingByLoop(TYPE_EVENT_GAME.DASH_RUSH)
                && (stateEventNow == STATE_DR.DELAY_LOSE || stateEventNow == STATE_DR.DELAY_WIN)) {
                this.UpdateStateEvent(STATE_DR.WAIT_TO_JOIN);
            }

        }
    }

    private RegisterTimeDelay() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTimeClockDelay, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTimeClockDelay, this);
        }
    }

    private UnRegisterTimeDelay() { clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTimeClockDelay, this); }
    private UnRegisterTime() { clientEvent.off(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this); }
    //#endregion registerTime
    //==================================


    //==================================
    //#region Increase score
    public AutoIncreaseScore() {
        // kiểm tra xem thời gian lưu cuối đã đến thời hạn chưa?
        // nếu đã qua thời gian tăng điểm => tăng điểm , set lại thời gian tăng điểm
        if (this.GetPlayerMaxScore() != null) {
            // nếu như ko thể hiển thị thời gian thì ta sẽ hủy lắng nghe để giảm logic
            this.UnRegisterTime();
            return;
        }

        const timeNow = Utils.getCurrTime();
        const timePass = timeNow - PlayerData.Instance.DR_lastTimePlayerIncreaseScore;
        // console.log("check: ", timePass);

        if (timePass >= CONFIG_DR.DR_TIME_AUTO_INCREASE_SCORE) {
            const numLoop = Math.floor(timePass / CONFIG_DR.DR_TIME_AUTO_INCREASE_SCORE)
            PlayerData.Instance.DR_lastTimePlayerIncreaseScore = Utils.getCurrTime();
            let wasSaveData: boolean = false;
            for (let i = 0; i < numLoop; i++) {
                wasSaveData = this.UpdateProgressBot(true, i == numLoop - 1, false) && !wasSaveData;
            }

            // trong trường hợp ko có save data thì mới gọi save thời gian 
            PlayerData.Instance.SaveEvent_DashRush(!wasSaveData);
        }
    }

    //#endregion Increase score
    //==================================

    //==================================
    //#region force end
    private ForceEnd(needSaveData: boolean = true) {
        if (this.GetState() == STATE_DR.JOINING) {
            PlayerData.Instance.DR_timeEnd = Utils.getCurrTime();
            this.UnRegisterTime();
            // update state
            this.UpdateStateEvent(STATE_DR.WAIT_TO_RECEIVE_PRIZE);
        }
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_DashRush();
        }
    }

    private ForceWaitToJoin(needSaveData: boolean = true) {
        PlayerData.Instance.DR_timeEnd = 0;
        PlayerData.Instance.DR_timeDelay = 0;
        this.ResetCache(false);

        this.UpdateStateEvent(STATE_DR.WAIT_TO_JOIN);
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_DashRush();
        }
    }
    //#endregion force end
    //==================================


    //==================================
    //#region cheat
    public ForceChangeTimeCooldown(time: number) {
        PlayerData.Instance.DR_timeEnd = Utils.getCurrTime() + time;
        // ko update thời gian nữa để tránh tăng điểm
        this.UnRegisterTime();
        PlayerData.Instance.SaveEvent_DashRush();
    }

    public ForceChangeTimeDelay(time: number) {
        PlayerData.Instance.DR_timeDelay = Utils.getCurrTime() + time;
        // ko update thời gian nữa để tránh tăng điểm
        this.UnRegisterTime();
        PlayerData.Instance.SaveEvent_DashRush();
    }
    //#endregion cheat
    //==================================
}




