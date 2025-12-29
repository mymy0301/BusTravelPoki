/**
 * 
 * anhngoxitin01
 * Fri Nov 07 2025 12:01:20 GMT+0700 (Indochina Time)
 * DataHatRace_christ
 * db://assets/scripts/DataBase/DataHatRace_christ.ts
*
*/
import { _decorator, Component, Node, randomRange, randomRangeInt } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { Utils } from '../Utils/Utils';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { CONFIG_HAT_RACE, EVENT_HAT_RACE, GetTypeLevel_XMAX, InfoBot_HatRace, STATE_HAT_RACE, T_HR_BOT } from '../Scene/OtherUI/UIChristmasEvent/HatRace/TypeHatRace';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { IDataPlayer_LEADERBOARD } from '../Utils/server/ServerPegasus';
import { DataLeaderboardSys } from '../Scene/DataLeaderboardSys';
import { MConfigs } from '../Configs/MConfigs';
import { ReadDataJson } from '../ReadDataJson';
import { IPrize } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('DataHatRace_christ')
export class DataHatRace_christ {
    public static Instance: DataHatRace_christ = null;
    constructor() {
        if (DataHatRace_christ.Instance == null) {
            DataHatRace_christ.Instance = this;
        }
    }
    private _stateNow: STATE_HAT_RACE = STATE_HAT_RACE.END_EVENT; public get State() { return this._stateNow; }

    //=================================
    //#region streak
    public IncreaseStreakPlayer(needSaveData: boolean) {
        if (this._stateNow != STATE_HAT_RACE.JOINING) { return; }
        if (this.GetInfoPlayerNow() == null) { return; }
        const indexStreakNow = PlayerData.Instance.XMAX_HR_winStreak;
        PlayerData.Instance.XMAX_HR_progressPlayer += CONFIG_HAT_RACE.MULTIPLIER[indexStreakNow];
        PlayerData.Instance.XMAX_HR_winStreak = IncreaseStreak(PlayerData.Instance.XMAX_HR_winStreak);
        const infoPlayer = this.GetInfoPlayerNow();
        infoPlayer.progress = PlayerData.Instance.XMAX_HR_progressPlayer;
        PlayerData.Instance.XMAX_HR_listPlayerJoin = this.SortData(PlayerData.Instance.XMAX_HR_listPlayerJoin, true);

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_HatRace();
        }
    }
    public LoseStreakPlayer(needSaveData: boolean) {
        if (this._stateNow != STATE_HAT_RACE.JOINING) { return; }
        PlayerData.Instance.XMAX_HR_winStreak = 0;
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_HatRace();
        }
    }
    //#endregion streak

    //=============================================================
    //#region private
    private SortData(data: InfoBot_HatRace[], onlySort: boolean = false): InfoBot_HatRace[] {
        if (data == null || data.length == 0) { return [] }
        let dataDo = Utils.CloneListDeep(data);
        dataDo.sort((a, b) => b.progress - a.progress);
        // check if only sort
        if (onlySort) {
            dataDo.forEach((bot, index) => {
                bot.rank = index;
            });
            return dataDo;
        }
        // find and set player to special position based on progress
        let playerBot = dataDo.find(bot => bot.id == MConfigFacebook.Instance.playerID);
        const indexPlayerBot = dataDo.findIndex(bot => bot.id == MConfigFacebook.Instance.playerID);
        if (playerBot) {
            // remove player from current position
            playerBot = dataDo.splice(indexPlayerBot, 1)[0];

            // tìm vị trí phù hợp
            let targetIndex = dataDo.findIndex(bot => bot.progress <= playerBot.progress);
            if (targetIndex == -1) targetIndex = dataDo.length;

            if (targetIndex > 0) {
                // insert at new position
                dataDo.splice(targetIndex, 0, playerBot);
            } else if (targetIndex == 0 || targetIndex - 1 == 0) {
                dataDo.unshift(playerBot);
            }
        }

        dataDo.forEach((bot, index) => {
            bot.rank = index;
        });
        return dataDo;
    }

    private GenNewListBot(): InfoBot_HatRace[] {
        // thứ tự luôn là player , bot 1, bot 2 , ...
        let result: InfoBot_HatRace[] = [];

        let player = new InfoBot_HatRace();
        player.SetData(MConfigFacebook.Instance.playerID, MConfigFacebook.Instance.playerName, MConfigFacebook.Instance.playerPhotoURL, 0, 'None', 0, 0);
        result.push(player);

        // get data to random
        let fakePlayerGetByServer: IDataPlayer_LEADERBOARD[] = JSON.parse(JSON.stringify(DataLeaderboardSys.Instance.GetLeaderboard(DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY_PREVIOUS)));
        if (fakePlayerGetByServer == null || fakePlayerGetByServer.length < 5) {
            fakePlayerGetByServer = MConfigs.dataBotFriend;
        } else {
            // remove player
            fakePlayerGetByServer = fakePlayerGetByServer.filter(player => player.playerId != MConfigFacebook.Instance.playerID);
        }

        // random data 49 bot
        const dataBot: IDataPlayer_LEADERBOARD[] = Utils.randomListValueOfList(CONFIG_HAT_RACE.MAX_PLAYER_JOIN - 1, fakePlayerGetByServer);

        // gen bot
        for (let i = 0; i < CONFIG_HAT_RACE.MAX_PLAYER_JOIN - 1; i++) {
            let newBot = new InfoBot_HatRace();
            let idBot = '';
            let dataChoice: IDataPlayer_LEADERBOARD = dataBot[i];
            let typeBot: T_HR_BOT = 'None';
            idBot = `Bot${i}`;
            switch (true) {
                case i < CONFIG_HAT_RACE.NUM_BOT_TYPE_A:
                    typeBot = 'A';
                    break;
                case i < CONFIG_HAT_RACE.NUM_BOT_TYPE_A + CONFIG_HAT_RACE.NUM_BOT_TYPE_B:
                    typeBot = 'B';
                    break;
                case i < CONFIG_HAT_RACE.NUM_BOT_TYPE_A + CONFIG_HAT_RACE.NUM_BOT_TYPE_B + CONFIG_HAT_RACE.NUM_BOT_TYPE_C:
                    typeBot = 'C';
                    break;
            }

            newBot.SetData(idBot, dataChoice.name, dataChoice.avatar, 0, typeBot, 0, i + 1);
            result.push(newBot);
        }

        return result;
    }
    //#endregion private

    //=============================================================
    //#region public list player
    public LoadDataFromLoad(needSaveData: boolean = false) {
        // trong trường hợp user đã tham gia nhwung vì lý do nào đó , không có dữ liệu do đọc ghi dữ liệu bị sai thì ta sẽ xóa toàn bộ dữ liệu lưu cho trạng thái của event về 0
        if (PlayerData.Instance.XMAX_HR_listPlayerJoin != null && PlayerData.Instance.XMAX_HR_listPlayerJoin.length > 0) {
            // add info player because we no save player data in this list
            let indexPlayer = PlayerData.Instance.XMAX_HR_listPlayerJoin.findIndex(bot => bot.id == '');

            if (indexPlayer != -1) {
                let dataPlayer = PlayerData.Instance.XMAX_HR_listPlayerJoin[indexPlayer];
                PlayerData.Instance.XMAX_HR_progressPlayer = dataPlayer.progress;
                PlayerData.Instance.XMAX_HR_listPlayerJoin.splice(indexPlayer, 1);
                // ko save ở đây vì để đợi những phần sau laod xong mới save
            }

            let newPlayer = new InfoBot_HatRace();
            newPlayer.name = MConfigFacebook.Instance.playerName;
            newPlayer.id = MConfigFacebook.Instance.playerID;
            newPlayer.avatar = MConfigFacebook.Instance.playerPhotoURL;
            newPlayer.rank = indexPlayer;
            newPlayer.levelReach = PlayerData.Instance.XMAX_HR_level;
            newPlayer.streak = PlayerData.Instance.XMAX_HR_winStreak;
            newPlayer.progress = PlayerData.Instance.XMAX_HR_progressPlayer;
            newPlayer.type = 'None';

            // add new player
            PlayerData.Instance.XMAX_HR_listPlayerJoin.push(newPlayer);

            PlayerData.Instance.XMAX_HR_listPlayerJoin = this.SortData(PlayerData.Instance.XMAX_HR_listPlayerJoin);
            // console.log("===========Sort=============");
        }

        // console.log("check: ", PlayerData.Instance.XMAX_HR_listPlayerJoin.length);

        this.AutoIncreaseScoreOffline(false);

        this.UpdateStateEvent();

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_HatRace();
        }
    }

    public InitNewRound(needSaveData: boolean, timeLimited: number) {
        PlayerData.Instance.XMAX_HR_id += 1;
        const timeNow = Utils.getCurrTime()
        const timeRemainEndEvent = timeNow + CONFIG_HAT_RACE.MAX_TIME_EVENT;
        const timeLimitedCheck = timeNow + timeLimited;
        PlayerData.Instance.XMAX_HR_timeEnd = timeLimited > 0 && timeLimitedCheck < timeRemainEndEvent ? timeLimitedCheck : timeRemainEndEvent;
        PlayerData.Instance.XMAX_HR_oldProgressPlayer = 0;
        PlayerData.Instance.XMAX_HR_progressPlayer = 0;
        PlayerData.Instance.XMAX_HR_previousWinStreak = 0;
        PlayerData.Instance.XMAX_HR_winStreak = 0;
        PlayerData.Instance.XMAX_HR_listPlayerJoin = this.GenNewListBot();
        PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_A = Utils.getCurrTime();
        PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_B = Utils.getCurrTime();
        PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_C = Utils.getCurrTime();
        PlayerData.Instance.XMAX_HR_level = 0;
        PlayerData.Instance.XMAX_HR_isReceiveReward = false;
        this.UnRegisterClock();
        this.RegisterClock();
        PlayerData.Instance.SaveEvent_HatRace(needSaveData);

        this.UpdateStateEvent(STATE_HAT_RACE.JOINING);

        // emit new event
        clientEvent.dispatchEvent(EVENT_HAT_RACE.UPDATE_TIME);
        clientEvent.dispatchEvent(EVENT_HAT_RACE.TRY_CHANGE_TITLE);
    }

    public GetInfoPlayerNow(needSortData: boolean = false): InfoBot_HatRace {
        let data = PlayerData.Instance.XMAX_HR_listPlayerJoin;
        if (needSortData) {
            data = this.SortData(PlayerData.Instance.XMAX_HR_listPlayerJoin, true);
        }
        const player = data.find(bot => bot.id == MConfigFacebook.Instance.playerID)
        return player;
    }

    public GetListBotBeforeAnimUI() {
        let dataBot = Utils.CloneListDeep(PlayerData.Instance.XMAX_HR_listPlayerJoin);
        dataBot = this.SortData(dataBot);
        return dataBot;
    }
    //#endregion public list player

    //=============================================================
    //#region public other
    public GetRankPlayerNow(): number {
        const infoPlayerNow = this.GetInfoPlayerNow();
        if (infoPlayerNow != null) {
            return infoPlayerNow.rank;
        } else {
            return 0;
        }
    }
    public IsPlayTut() { return PlayerData.Instance.XMAX_HR_isPlayTut; }
    public SetPlayTut(newState: boolean, needSaveData: boolean = true) { PlayerData.Instance.XMAX_HR_isPlayTut = newState; if (needSaveData) { PlayerData.Instance.SaveEvent_HatRace() } }
    public GetProgressForPlayAnimUI() { return PlayerData.Instance.XMAX_HR_oldProgressPlayer; }
    public SetProgressForPlayAnimUI(progressNew: number, needSaveData: boolean = true) {
        PlayerData.Instance.XMAX_HR_oldProgressPlayer = progressNew;
        PlayerData.Instance.SaveEvent_HatRace(needSaveData);
    }
    public UpdateListData(needSaveData: boolean = false) {
        PlayerData.Instance.XMAX_HR_listPlayerJoin = this.SortData(PlayerData.Instance.XMAX_HR_listPlayerJoin, true);
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_Christmas();
        }
    }

    public UpdateProgressPlayer() {
        // const infoPlayer = this.GetInfoPlayerNow();
        // if (infoPlayer == null) { return; }
        // infoPlayer.progress = PlayerData.Instance.XMAX_HR_progressPlayer;
        // PlayerData.Instance.XMAX_HR_listPlayerJoin = this.SortData(PlayerData.Instance.XMAX_HR_listPlayerJoin);
    }

    public GetIndexMutilplyForPlayAnimUI() { return PlayerData.Instance.XMAX_HR_previousWinStreak; }
    public SetIndexMutilplyForPlayAnimUI(index: number, needSaveData: boolean = true) { PlayerData.Instance.XMAX_HR_previousWinStreak = index; PlayerData.Instance.SaveEvent_HatRace(needSaveData); }

    public GetIndexMutilply() { return PlayerData.Instance.XMAX_HR_winStreak; }
    public GetIndexOldMutilply() { return PlayerData.Instance.XMAX_HR_previousWinStreak; }
    public UpdateIndexMultiply() { PlayerData.Instance.XMAX_HR_previousWinStreak = PlayerData.Instance.XMAX_HR_winStreak; PlayerData.Instance.SaveEvent_HatRace(); }
    public CanShowPopUpRewardAtHome() { return !PlayerData.Instance.XMAX_HR_isReceiveReward && (this.IsShowResultTime() || this.IsEndEvent()) }
    public IsReceivePrizeSummery() { return PlayerData.Instance.XMAX_HR_isReceiveReward }
    public SetReceivePrizeSummery(needSaveData: boolean) { PlayerData.Instance.XMAX_HR_isReceiveReward = true; if (needSaveData) { PlayerData.Instance.SaveEvent_HatRace(needSaveData); } }
    public GetPrizeRank(rank: number): IPrize[] {
        // rank is index
        const listPrize = ReadDataJson.Instance.GetDataPrizeRankHatRace();
        if (rank < 3) { return listPrize[rank]; }
        else if (rank >= listPrize.length) { return null; }
        else { return listPrize[rank]; }
    }
    public GetMutiplyScoreSuitWithProgress(index: number): number { return CONFIG_HAT_RACE.MULTIPLIER[index]; }
    public GetTimeDisplay(): number { return PlayerData.Instance.XMAX_HR_timeEnd - Utils.getCurrTime(); }
    //#endregion public other

    //=============================================================
    //#region score
    public AutoIncreaseScore(canCallUpdateStateEvent: boolean = true) {
        // kiểm tra xem thời gian lưu cuối đã đến thời hạn chưa?
        // nếu đã qua thời gian tăng điểm => tăng điểm , set lại thời gian tăng điểm

        const isValidNotInTimeIncreaseScore = this.IsShowResultTime() || this.IsEndEvent()

        if (isValidNotInTimeIncreaseScore) {
            this.UnRegisterClock();
            canCallUpdateStateEvent && this.UpdateStateEvent();
            clientEvent.dispatchEvent(EVENT_HAT_RACE.UPDATE_UI_WHEN_END_TIME);
            clientEvent.dispatchEvent(EVENT_HAT_RACE.TRY_CHANGE_TITLE);
        }


        const timeNow = isValidNotInTimeIncreaseScore ? (PlayerData.Instance.XMAX_HR_timeEnd - CONFIG_HAT_RACE.TIME_SHOW_RESULT) : Utils.getCurrTime();
        const infoProgressNow = this.GetInfoPlayerNow();
        if (infoProgressNow == null) { return; }
        const progressPlayerNow = this.GetInfoPlayerNow().progress;
        let hasUpdateBotA, hasUpdateBotB, hasUpdateBotC = false;


        // try update bot A 
        const timePassBotA = timeNow - PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_A;
        if (timePassBotA >= CONFIG_HAT_RACE.TIME_INCREASE_BOT_A) {
            hasUpdateBotA = TryTriggerIncreaseScroleBot('A', PlayerData.Instance.XMAX_HR_listPlayerJoin.filter(bot => bot.type == 'A'), progressPlayerNow);
            if (hasUpdateBotA) { PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_A = timeNow; }
        }
        // try update bot B 
        const timePassBotB = timeNow - PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_B;
        if (timePassBotB >= CONFIG_HAT_RACE.TIME_INCREASE_BOT_B) {
            hasUpdateBotB = TryTriggerIncreaseScroleBot('B', PlayerData.Instance.XMAX_HR_listPlayerJoin.filter(bot => bot.type == 'B'), progressPlayerNow);
            if (hasUpdateBotB) { PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_B = timeNow; }
        }
        // try update bot C 
        const timePassBotC = timeNow - PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_C;
        if (timePassBotC >= CONFIG_HAT_RACE.TIME_INCREASE_BOT_C) {
            hasUpdateBotC = TryTriggerIncreaseScroleBot('C', PlayerData.Instance.XMAX_HR_listPlayerJoin.filter(bot => bot.type == 'C'), progressPlayerNow);
            if (hasUpdateBotC) { PlayerData.Instance.XMAX_HR_lastTimeIncreaseScore_C = timeNow; }
        }

        if (hasUpdateBotA || hasUpdateBotB || hasUpdateBotC) {
            PlayerData.Instance.SaveEvent_HatRace();
        }
    }

    public AutoIncreaseScoreOffline(needSaveData: boolean = false) {
        // kiểm tra nếu thời gian của hiện tại lớn hơn thời gian kết thúc event => lấy thời gian kết thúc <nhớ trừ thời gian display>
        // kiểm tra nếu thời gian của hiện tại nhở hơn thời gian kết thúc event => lấy thời gian hiện tại làm mốc để tính toán update điểm
        if (PlayerData.Instance.XMAX_HR_listPlayerJoin != null && PlayerData.Instance.XMAX_HR_listPlayerJoin.length == 0) { return; }

        const playData = PlayerData.Instance;
        const timeNow = Utils.getCurrTime();
        const timeEndEvent = playData.XMAX_HR_timeEnd - CONFIG_HAT_RACE.TIME_SHOW_RESULT;
        let timeReach = timeNow < timeEndEvent ? timeNow : timeEndEvent;

        const progressPlayer = this.GetInfoPlayerNow().progress;
        let step = 0;
        let hasUpdate: boolean = false;

        // Bot A
        const timePassA = timeReach - playData.XMAX_HR_lastTimeIncreaseScore_A;
        const stackIncreaseScoreA = Math.floor(timePassA / (60 * 60));
        const listBotA = playData.XMAX_HR_listPlayerJoin.filter(bot => bot.type == 'A');
        while (step < stackIncreaseScoreA) {
            let anyChange = TryTriggerIncreaseScroleBot('A', listBotA, progressPlayer);
            if (!hasUpdate) { hasUpdate = anyChange; }
            step += 1;
        }

        //Bot B
        const timePassB = timeReach - playData.XMAX_HR_lastTimeIncreaseScore_B;
        const stackIncreaseScoreB = Math.floor(timePassB / (60 * 60));
        const listBotB = playData.XMAX_HR_listPlayerJoin.filter(bot => bot.type == 'B');
        while (step < stackIncreaseScoreB) {
            let anyChange = TryTriggerIncreaseScroleBot('B', listBotB, progressPlayer);
            if (!hasUpdate) { hasUpdate = anyChange; }
            step += 1;
        }

        //Bot C
        const timePassC = timeReach - playData.XMAX_HR_lastTimeIncreaseScore_C;
        const stackIncreaseScoreC = Math.floor(timePassC / (60 * 60));
        const listBotC = playData.XMAX_HR_listPlayerJoin.filter(bot => bot.type == 'C');
        while (step < stackIncreaseScoreC) {
            let anyChange = TryTriggerIncreaseScroleBot('C', listBotC, progressPlayer);
            if (!hasUpdate) { hasUpdate = anyChange; }
            step += 1;
        }

        if (hasUpdate && needSaveData) {
            PlayerData.Instance.SaveEvent_HatRace();
        }
    }
    //#endregion score

    //=============================================================
    //#region state
    public UpdateStateEvent(state: STATE_HAT_RACE = null) {
        if (this._stateNow == state) { return; }

        if (state == null) {
            // update status suit with the time check
            const timeNow = Utils.getCurrTime();

            switch (true) {
                case PlayerData.Instance.XMAX_LR_timeEnd < Utils.getCurrTime()
                    && !PlayerData.Instance.XMAX_HR_isReceiveReward
                    && PlayerData.Instance.XMAX_HR_timeEnd > timeNow:
                    state = STATE_HAT_RACE.WAIT_RECEIVE;
                    break;
                case PlayerData.Instance.XMAX_HR_timeEnd > timeNow && !PlayerData.Instance.XMAX_HR_isReceiveReward: state = STATE_HAT_RACE.JOINING; break;
                case this.IsShowResultTime(): state = STATE_HAT_RACE.WAIT_RECEIVE; break;
                case this.IsEndEvent(): state = STATE_HAT_RACE.END_EVENT; break;
                default:
                    state = STATE_HAT_RACE.END_EVENT;
                    break;
            }
        }

        // console.log("Check state: ", state);

        this._stateNow = state;
        switch (state) {
            case STATE_HAT_RACE.JOINING: this.RegisterClock(); break;
            case STATE_HAT_RACE.WAIT_RECEIVE: break;
            case STATE_HAT_RACE.END_EVENT: break;
        }
    }
    //#endregion state

    //=============================================================
    //#region time
    public IsEndEvent() {
        return PlayerData.Instance.XMAX_HR_timeEnd <= Utils.getCurrTime();
    }

    public IsShowResultTime() {
        const timeNow = Utils.getCurrTime();
        return PlayerData.Instance.XMAX_HR_timeEnd < timeNow && !PlayerData.Instance.XMAX_HR_isReceiveReward;
    }

    public GetTimeEndEvent(): number { return PlayerData.Instance.XMAX_HR_timeEnd - Utils.getCurrTime(); }

    private RegisterClock() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this);
        }
    }

    private UnRegisterClock() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this);
    }
    //#endregion time

    //=============================================================
    //#region cheat
    public CheatForceChangeProgress(progress: number) {
        PlayerData.Instance.XMAX_HR_oldProgressPlayer = progress;
        PlayerData.Instance.XMAX_HR_progressPlayer = progress;
        const listPlayerJoinNow = PlayerData.Instance.XMAX_HR_listPlayerJoin
        // sort data nếu có thể
        if (listPlayerJoinNow != null && listPlayerJoinNow.length > 1) {
            PlayerData.Instance.XMAX_HR_listPlayerJoin = this.SortData(listPlayerJoinNow);
        }
        PlayerData.Instance.SaveEvent_HatRace();
    }

    public CheatForceChangeStreak(newStreak: number) {
        PlayerData.Instance.XMAX_HR_winStreak = newStreak;
        PlayerData.Instance.XMAX_HR_previousWinStreak = newStreak;
        PlayerData.Instance.SaveEvent_HatRace();
    }

    public CheatAddScoreForBot(scoreAdd: number) {
        const listPlayerJoinNow = PlayerData.Instance.XMAX_HR_listPlayerJoin
        if (listPlayerJoinNow != null && listPlayerJoinNow.length > 1) {
            listPlayerJoinNow.forEach(bot => {
                if (bot.id != MConfigFacebook.Instance.playerID) {
                    bot.progress += scoreAdd;
                }
            })
            PlayerData.Instance.XMAX_HR_listPlayerJoin = this.SortData(listPlayerJoinNow);
            PlayerData.Instance.SaveEvent_HatRace();
        }
    }
    //#endregion cheat
}

//=============================================================
//#region function
function TryTriggerIncreaseScroleBot(type: T_HR_BOT, listBotChange: InfoBot_HatRace[], progressPlayer: number): boolean {
    let hasUpdate: boolean = false;
    let minScoreCheck = 0;
    let maxScoreCheck = 0;

    function TrySimulationBotWin(bot: InfoBot_HatRace, minRate: number, maxRate: number, minRangeRate: number = 0, mixRangeRate: number = 100) {
        if (Utils.randomInRangeRate(minRate, maxRate, minRangeRate, mixRangeRate)) {
            bot.streak = IncreaseStreak(bot.streak);
            bot.levelReach += 1;
            bot.progress += bot.streak;
            hasUpdate = true;
        }
    }

    // filter danh sách theo type
    switch (type) {
        case 'A':
            minScoreCheck = progressPlayer - progressPlayer * 5 / 100;
            maxScoreCheck = progressPlayer + progressPlayer * 5 / 100;
            listBotChange.forEach(bot => {
                // kiểm tra điểm bot vs điểm người chơi
                const typeLevelBotNow = GetTypeLevel_XMAX(bot.levelReach);
                switch (true) {
                    case bot.progress < minScoreCheck:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 90, 100); break;
                            case 'HARD': TrySimulationBotWin(bot, 50, 60); break;
                        }
                        break;
                    case bot.progress > maxScoreCheck:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 60, 80); break;
                            case 'HARD': TrySimulationBotWin(bot, 30, 40); break;
                        }
                        break;
                    default:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 80, 100); break;
                            case 'HARD': TrySimulationBotWin(bot, 40, 50); break;
                        }
                        break;
                }
            })
            break;
        case 'B':
            minScoreCheck = progressPlayer - progressPlayer * 15 / 100;
            maxScoreCheck = progressPlayer - progressPlayer * 5 / 100;
            listBotChange.forEach(bot => {
                // kiểm tra điểm bot vs điểm người chơi
                const typeLevelBotNow = GetTypeLevel_XMAX(bot.levelReach);
                switch (true) {
                    case bot.progress < minScoreCheck:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 80, 90); break;
                            case 'HARD': TrySimulationBotWin(bot, 40, 50); break;
                        }
                        break;
                    case bot.progress > maxScoreCheck:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 50, 60); break;
                            case 'HARD': TrySimulationBotWin(bot, 20, 30); break;
                        }
                        break;
                    default:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 60, 80); break;
                            case 'HARD': TrySimulationBotWin(bot, 30, 40); break;
                        }
                        break;
                }
            })
            break;
        case 'C':
            minScoreCheck = progressPlayer - progressPlayer * 40 / 100;
            maxScoreCheck = progressPlayer - progressPlayer * 15 / 100;
            listBotChange.forEach(bot => {
                // kiểm tra điểm bot vs điểm người chơi
                const typeLevelBotNow = GetTypeLevel_XMAX(bot.levelReach);
                switch (true) {
                    case bot.progress < minScoreCheck:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 60, 80); break;
                            case 'HARD': TrySimulationBotWin(bot, 30, 40); break;
                        }
                        break;
                    case bot.progress > maxScoreCheck:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 30, 50); break;
                            case 'HARD': TrySimulationBotWin(bot, 10, 20); break;
                        }
                        break;
                    default:
                        switch (typeLevelBotNow) {
                            case 'NORMAL': TrySimulationBotWin(bot, 40, 60); break;
                            case 'HARD': TrySimulationBotWin(bot, 20, 30); break;
                        }
                        break;
                }
            })
            break;
    }

    return hasUpdate;
}

function IncreaseStreak(streak: number): number {
    streak += 1;
    if (streak >= CONFIG_HAT_RACE.MULTIPLIER.length - 1) {
        streak = CONFIG_HAT_RACE.MULTIPLIER.length - 1
    }

    return streak;
}
//#endregion function