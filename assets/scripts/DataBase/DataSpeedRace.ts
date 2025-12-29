import { _decorator, random, randomRange, randomRangeInt } from 'cc';
import { InfoBot_SpeedRace, InfoItemProgressSR, IPrize, SR_TypeBot, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE } from '../Utils/Types';
import { Utils } from '../Utils/Utils';
import { PlayerData } from '../Utils/PlayerData';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { MConfigs } from '../Configs/MConfigs';
import { clientEvent } from '../framework/clientEvent';
import { IDataPlayer_LEADERBOARD } from '../Utils/server/ServerPegasus';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { DataLeaderboardSys } from '../Scene/DataLeaderboardSys';
import { CONFIG_SR, STATE_SPEED_RACE } from '../Scene/OtherUI/UISpeedRace/TypeEventSpeedRace';
import { DataEventsSys } from '../Scene/DataEventsSys';
const { ccclass, property } = _decorator;


@ccclass('DataSpeedRace')
export class DataSpeedRace {
    public static Instance: DataSpeedRace = null;

    constructor() {
        if (DataSpeedRace.Instance == null) {
            DataSpeedRace.Instance = this;
        }
    }

    private _stateNow: STATE_SPEED_RACE = STATE_SPEED_RACE.END_EVENT; public get GetState() { return this._stateNow; }

    //=================================
    //#region logic 
    private UpdateProgressBot(isWin: boolean, canSaveData: boolean, canIncreaseScorePlayer: boolean = true): boolean {
        function CheckLogicAndIncreaseBotProgress(botCheck: InfoBot_SpeedRace, isWin: boolean, X: number, Y: number) {
            let progressIncrease = 0;
            switch (true) {
                case botCheck.type == "A" && isWin && X < 4:
                    progressIncrease = randomRangeInt(Y * 0.7, Y * 1.1);
                    break;
                case botCheck.type == "B" && isWin && X < 4:
                    progressIncrease = randomRangeInt(Y * 0.3, Y * 0.7);
                    break;
                case botCheck.type == "C" && isWin && X < 4:
                    progressIncrease = randomRangeInt(0, 5);
                    break;
                case botCheck.type == "A" && !isWin && X < 4:
                    progressIncrease = 0;
                    break;
                case botCheck.type == "B" && !isWin && X < 4:
                    progressIncrease = randomRangeInt(0, 10);
                    break;
                case botCheck.type == "C" && !isWin && X < 4:
                    progressIncrease = randomRangeInt(0, 5);
                    break;
                // next
                case botCheck.type == "A" && isWin && X >= 4:
                    progressIncrease = randomRangeInt(Y * 0.8, Y * 1.1);
                    break;
                case botCheck.type == "B" && isWin && X >= 4:
                    progressIncrease = randomRangeInt(Y * 0.5, Y * 0.8);
                    break;
                case botCheck.type == "C" && isWin && X >= 4:
                    progressIncrease = randomRangeInt(0, 10);
                    break;
                case botCheck.type == "A" && !isWin && X >= 4:
                    progressIncrease = randomRangeInt(0, 5);
                    break;
                case botCheck.type == "B" && !isWin && X >= 4:
                    progressIncrease = randomRangeInt(0, 10);
                    break;
                case botCheck.type == "C" && !isWin && X >= 4:
                    progressIncrease = randomRangeInt(0, 5);
                    break;
            }

            // console.log(progressIncrease);
            botCheck.progress += progressIncrease;
        }

        // if (this.IsShowResultTime() || this.IsEndEvent()) {
        // return false;
        // }

        let hasDataUpdate: boolean = false;

        const player = PlayerData.Instance.SR_listPlayerJoin.filter(bot => bot.id == MConfigFacebook.Instance.playerID)[0];

        if (player == null) { return; }

        // === update progress player
        let progressIncrease: number = 0;
        if (isWin && canIncreaseScorePlayer) {
            progressIncrease = CONFIG_SR.SR_MULTIPLIER[PlayerData.Instance.SR_winStreak];
            PlayerData.Instance.SR_winStreak += 1;
            if (PlayerData.Instance.SR_winStreak > CONFIG_SR.SR_MULTIPLIER.length - 1) { PlayerData.Instance.SR_winStreak = CONFIG_SR.SR_MULTIPLIER.length - 1 }
            PlayerData.Instance.SR_progressPlayer += progressIncrease;
            player.progress = PlayerData.Instance.SR_progressPlayer;
            hasDataUpdate = true;
        } else {
            progressIncrease = CONFIG_SR.SR_MULTIPLIER[PlayerData.Instance.SR_winStreak];
        }

        // increase bot
        PlayerData.Instance.SR_listPlayerJoin.filter(bot => bot.id != MConfigFacebook.Instance.playerID).forEach(bot => {
            CheckLogicAndIncreaseBotProgress(bot, isWin, PlayerData.Instance.SR_numJoined, progressIncrease);
        })

        // sorter rank all bot
        PlayerData.Instance.SR_listPlayerJoin = this.SortData(PlayerData.Instance.SR_listPlayerJoin);

        // ==== save data ======
        PlayerData.Instance.SaveEvent_SpeedRace(hasDataUpdate && canSaveData);

        return hasDataUpdate;
    }

    private SortData(data: InfoBot_SpeedRace[], onlySort: boolean = false): InfoBot_SpeedRace[] {
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

    private GenNewListBot(): InfoBot_SpeedRace[] {
        // thứ tự luôn là player , bot 1, bot 2 , ...
        let result: InfoBot_SpeedRace[] = [];

        let player = new InfoBot_SpeedRace();
        player.SetData(MConfigFacebook.Instance.playerID, MConfigFacebook.Instance.playerName, MConfigFacebook.Instance.playerPhotoURL, 'A', 0, 0);
        result.push(player);

        // get datato random
        let fakePlayerGetByServer: IDataPlayer_LEADERBOARD[] = JSON.parse(JSON.stringify(DataLeaderboardSys.Instance.GetLeaderboard(DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY_PREVIOUS)));
        if (fakePlayerGetByServer == null || fakePlayerGetByServer.length < 5) {
            fakePlayerGetByServer = MConfigs.dataBotFriend;
        } else {
            // remove player
            fakePlayerGetByServer = fakePlayerGetByServer.filter(player => player.playerId != MConfigFacebook.Instance.playerID);
        }

        // random data 49 bot
        const dataBot: IDataPlayer_LEADERBOARD[] = Utils.randomListValueOfList(CONFIG_SR.SR_MAX_PLAYER_JOIN - 1, fakePlayerGetByServer);

        // gen bot
        for (let i = 0; i < CONFIG_SR.SR_MAX_PLAYER_JOIN - 1; i++) {
            let newBot = new InfoBot_SpeedRace();
            let idBot = '';
            let dataChoice: IDataPlayer_LEADERBOARD = dataBot[i];
            let typeBot: SR_TypeBot = 'A';
            idBot = `Bot${i}`;
            switch (true) {
                case i < CONFIG_SR.SR_NUM_PLAYER_TYPE_A:
                    typeBot = 'A';
                    break;
                case i < CONFIG_SR.SR_NUM_PLAYER_TYPE_B:
                    typeBot = 'B';
                    break;
                case i < CONFIG_SR.SR_NUM_PLAYER_TYPE_C:
                    typeBot = 'C';
                    break;
            }
            newBot.SetData(idBot, dataChoice.name, dataChoice.avatar, typeBot, i + 1, 0);
            result.push(newBot);
        }

        return result;
    }

    private RegisterClock() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this);
        }
    }

    private UnRegisterClock() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.AutoIncreaseScore, this);
    }
    //#endregion logic
    //=================================

    //=================================
    //#region get func
    public GetIndexBestScorePlayer(): number {
        let maxProgress = -1;
        let indexBestScore = -1;
        for (let i = 0; i < PlayerData.Instance.SR_listPlayerJoin.length; i++) {
            if (PlayerData.Instance.SR_listPlayerJoin[i].progress > maxProgress) {
                maxProgress = PlayerData.Instance.SR_listPlayerJoin[i].progress;
                indexBestScore = i;
            }
        }
        return indexBestScore;
    }

    public IsPlayerWin(): boolean {
        let playerWin: InfoBot_SpeedRace = PlayerData.Instance.SR_listPlayerJoin[this.GetIndexBestScorePlayer()];
        return playerWin.id == MConfigFacebook.Instance.playerID;
    }

    public IsEndEvent() {
        return PlayerData.Instance.SR_timeEnd <= Utils.getCurrTime();
    }

    public IsShowResultTime() {
        const timeNow = Utils.getCurrTime();
        return (PlayerData.Instance.SR_timeEnd - CONFIG_SR.SR_TIME_SHOW_RESULT) <= timeNow && PlayerData.Instance.SR_timeEnd > timeNow;
    }

    /**
     * This func will return null if time is out
     * @returns 
     */
    public GetTimeDisplay(): number {
        if ((PlayerData.Instance.SR_timeEnd - CONFIG_SR.SR_TIME_SHOW_RESULT) <= 0) return -1;
        return (PlayerData.Instance.SR_timeEnd - CONFIG_SR.SR_TIME_SHOW_RESULT) - Utils.getCurrTime();
    }

    public UpdateData(isWin: boolean = true, canSaveData: boolean): boolean {
        // console.log("state game:", this._stateNow);
        if (this._stateNow == STATE_SPEED_RACE.END_EVENT || this._stateNow == STATE_SPEED_RACE.WAIT_RECEIVE) { return; }
        if (!isWin) { PlayerData.Instance.SR_winStreak = 0; }
        // update data
        return this.UpdateProgressBot(isWin, canSaveData);
    }

    public InitNewRound(needSaveData: boolean) {
        PlayerData.Instance.SR_numJoined += 1;
        PlayerData.Instance.SR_timeEnd = Utils.getCurrTime() + CONFIG_SR.SR_MAX_TIME_EVENT;
        PlayerData.Instance.SR_previousProgressBeforeOpenUI = 0;
        PlayerData.Instance.SR_previousWinStreak = 0;
        PlayerData.Instance.SR_winStreak = 0;
        PlayerData.Instance.SR_progressPlayer = 0;
        PlayerData.Instance.SR_listPrizeClaimed = new Array(CONFIG_SR.DATA_PRIZE_PROGRESS.length).fill(false);
        PlayerData.Instance.SR_listPlayerJoin = this.GenNewListBot();
        PlayerData.Instance.SR_lastTimePlayerIncreaseScore = Utils.getCurrTime();
        PlayerData.Instance.SR_isReceivePrizeSummary = false;
        this.UnRegisterClock();
        this.RegisterClock();
        PlayerData.Instance.SaveEvent_SpeedRace(needSaveData);

        this.UpdateStateEvent(STATE_SPEED_RACE.JOINING);

        // emit new event
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.SPEED_RACE);
        clientEvent.dispatchEvent(CONFIG_SR.TRY_CHANGE_TITLE);

        this.RegisterTime();
    }

    public GetDataBot(): InfoBot_SpeedRace[] {
        return PlayerData.Instance.SR_listPlayerJoin;
    }

    public GetPrizeRank(rank: number): IPrize[] {
        const dataPrize = CONFIG_SR.DATA_PRIZE_RANK;
        if (rank >= dataPrize.length) { return null; }
        return dataPrize[rank];
    }

    public GetIndexPrizeProgress(progress: number): { previous: number, next: number } {
        if (progress < 0) { return null; }
        const indexPrizeSuit = CONFIG_SR.DATA_PRIZE_PROGRESS.findIndex(item => item.progress > progress);
        if (indexPrizeSuit == -1) {
            // case max progress
            return { previous: CONFIG_SR.DATA_PRIZE_PROGRESS.length - 1, next: -1 }
        } else if (indexPrizeSuit == 0) {
            return { previous: -1, next: 0 }
        } else {
            return { previous: indexPrizeSuit - 1, next: indexPrizeSuit }
        }
    }

    public GetPrizeProgress(progress: number): { previous: IPrize[], next: IPrize[] } {
        if (progress < 0) { return null; }
        const indexPrizeSuit = this.GetIndexPrizeProgress(progress);
        if (indexPrizeSuit == null) { return null; }
        const prizePrevious: IPrize[] = indexPrizeSuit.previous == -1 ? null : CONFIG_SR.DATA_PRIZE_PROGRESS[indexPrizeSuit.previous].prizes;
        const prizeNext: IPrize[] = indexPrizeSuit.next == -1 ? null : CONFIG_SR.DATA_PRIZE_PROGRESS[indexPrizeSuit.next].prizes;
        return { previous: prizePrevious, next: prizeNext }
    }

    public GetListPrizeReceiveFromProgressToProgress(previousProgress: number, newProgress: number): { listPrizeReceive: IPrize[], nextPrize: IPrize } {
        if (previousProgress < 0 || newProgress < 0) { return null; }
        const indexPrizeOld = this.GetIndexPrizeProgress(previousProgress);
        const indexPrizeNew = this.GetIndexPrizeProgress(newProgress);
        let listPrizeReceive = [];
        for (let i = indexPrizeOld.next; i <= indexPrizeNew.previous; i++) {
            listPrizeReceive.push(CONFIG_SR.DATA_PRIZE_PROGRESS[i].prizes[0]);
        }
        return { listPrizeReceive: listPrizeReceive, nextPrize: CONFIG_SR.DATA_PRIZE_PROGRESS[indexPrizeNew.next].prizes[0] };
    }

    public GetAllPrizeProgress(): InfoItemProgressSR[] {
        return CONFIG_SR.DATA_PRIZE_PROGRESS;
    }

    /**
     * 
     * @returns index + 1
     */
    public GetRankPlayerNow(): number {
        return this.GetInfoPlayerNow().rank;
    }

    public IsPlayInfo() {
        return PlayerData.Instance.SR_isPlayedInfo;
    }

    public SetShowInfo(canShowInfo: boolean, needSaveData: boolean = true) {
        PlayerData.Instance.SR_isPlayedInfo = canShowInfo;
        PlayerData.Instance.SaveEvent_SpeedRace(needSaveData);
    }

    public TryUpdateDataPlayerInList() {
        // trong trường hợp user đã tham gia nhwung vì lý do nào đó , không có dữ liệu do đọc ghi dữ liệu bị sai thì ta sẽ xóa toàn bộ dữ liệu lưu cho trạng thái của event về 0
        if (PlayerData.Instance.SR_listPlayerJoin != null && PlayerData.Instance.SR_listPlayerJoin.length > 0) {
            // add info player because we no save player data in this list
            let indexPlayer = PlayerData.Instance.SR_listPlayerJoin.findIndex(bot => bot.id == '');

            if (indexPlayer != -1) {
                let dataPlayer = PlayerData.Instance.SR_listPlayerJoin[indexPlayer];
                PlayerData.Instance.SR_progressPlayer = dataPlayer.progress;
                PlayerData.Instance.SR_listPlayerJoin.splice(indexPlayer, 1);
                // ko save ở đây vì để đợi những phần sau laod xong mới save
            }

            let newPlayer = new InfoBot_SpeedRace();
            newPlayer.name = MConfigFacebook.Instance.playerName;
            newPlayer.id = MConfigFacebook.Instance.playerID;
            newPlayer.avatar = MConfigFacebook.Instance.playerPhotoURL;
            newPlayer.rank = indexPlayer;
            newPlayer.progress = PlayerData.Instance.SR_progressPlayer;
            newPlayer.type = "A";

            // add new player
            PlayerData.Instance.SR_listPlayerJoin.push(newPlayer);

            PlayerData.Instance.SR_listPlayerJoin = this.SortData(PlayerData.Instance.SR_listPlayerJoin);
            // console.log("===========Sort=============");
        }

        // console.log("check: ", ...PlayerData.Instance.SR_listPlayerJoin);

        this.AutoIncreaseScore(false);

        this.UpdateStateEvent();
    }

    public UpdateStateEvent(state: STATE_SPEED_RACE = null) {
        if (this._stateNow == state) { return; }

        if (state == null) {
            // update status suit with the time check
            const timeNow = Utils.getCurrTime();
            // console.log(timeNow, PlayerData.Instance.SR_timeEnd);

            switch (true) {
                case (PlayerData.Instance.SR_timeEnd - CONFIG_SR.SR_TIME_SHOW_RESULT) > timeNow: state = STATE_SPEED_RACE.JOINING; break;
                case this.IsShowResultTime(): state = STATE_SPEED_RACE.WAIT_RECEIVE; break;
                case this.IsEndEvent(): state = STATE_SPEED_RACE.END_EVENT; break;
                default:
                    state = STATE_SPEED_RACE.END_EVENT;
                    break;
            }
        }

        // console.log("Check state: ", state);

        this._stateNow = state;
        switch (state) {
            case STATE_SPEED_RACE.JOINING: case STATE_SPEED_RACE.WAIT_RECEIVE:
                this.RegisterTime();
                break;
            case STATE_SPEED_RACE.END_EVENT:
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SPEED_RACE);
                break;
        }
    }

    public GetMutiplyScoreSuitWithProgress(index: number): number {
        switch (index) {
            case 0: return 1;
            case 1: return 5;
            case 2: return 10;
            case 3: return 20;
            case 4: return 100;
        }
        return 0;
    }

    public GetInfoPlayerNow(needSortData: boolean = false): InfoBot_SpeedRace {
        let data = PlayerData.Instance.SR_listPlayerJoin;
        if (needSortData) {
            data = this.SortData(PlayerData.Instance.SR_listPlayerJoin, true);
        }
        const player = data.find(bot => bot.id == MConfigFacebook.Instance.playerID)
        return player;
    }

    public GetProgressToDisplay(progressCheck: number = -1): { totalPrevious: number, totalNext: number, progressNow: number, percent: number } {
        if (progressCheck == -1) {
            const infoPlayerNow = this.GetInfoPlayerNow();
            progressCheck = infoPlayerNow.progress;
        }

        const dataProgress = this.GetIndexPrizeProgress(progressCheck);
        // if any wrong the progress will be max
        if (dataProgress == null || dataProgress.next == -1)
            return {
                totalPrevious: CONFIG_SR.DATA_PRIZE_PROGRESS[CONFIG_SR.DATA_PRIZE_PROGRESS.length - 1].progress,
                totalNext: CONFIG_SR.DATA_PRIZE_PROGRESS[CONFIG_SR.DATA_PRIZE_PROGRESS.length - 1].progress,
                progressNow: progressCheck,
                percent: 1
            };
        const totalProgressToNextPrize = CONFIG_SR.DATA_PRIZE_PROGRESS[dataProgress.next].progress;
        const totalProgressPreviousPrize = dataProgress.previous == -1 ? 0 : CONFIG_SR.DATA_PRIZE_PROGRESS[dataProgress.previous].progress;
        const percentProgress = (progressCheck - totalProgressPreviousPrize) / (totalProgressToNextPrize - totalProgressPreviousPrize);
        return {
            totalPrevious: totalProgressPreviousPrize,
            totalNext: totalProgressToNextPrize,
            progressNow: progressCheck,
            percent: percentProgress
        };

    }

    public GetIndexBotWithProgress(progress: number, data: InfoBot_SpeedRace[]): number {
        const result = data.findIndex(bot => bot.progress <= progress);
        return result == -1 ? data.length - 1 : result;
    }

    public GetProgressForPlayAnimUI() { return PlayerData.Instance.SR_previousProgressBeforeOpenUI; }
    public SetProgressForPlayAnimUI(progressNew: number, needSaveData: boolean = true) { PlayerData.Instance.SR_previousProgressBeforeOpenUI = progressNew; PlayerData.Instance.SaveEvent_SpeedRace(needSaveData); }

    public GetIndexMutilplyForPlayAnimUI() { return PlayerData.Instance.SR_previousWinStreak; }
    public SetIndexMutilplyForPlayAnimUI(index: number, needSaveData: boolean = true) { PlayerData.Instance.SR_previousWinStreak = index; PlayerData.Instance.SaveEvent_SpeedRace(needSaveData); }

    public GetIndexMutilply() { return PlayerData.Instance.SR_winStreak; }

    public GetListBotBeforeAnimUI() {
        // const progressPlayerBeforeAnim = this.GetProgressForPlayAnimUI();
        let dataBot = Utils.CloneListDeep(PlayerData.Instance.SR_listPlayerJoin);
        // if (progressPlayerBeforeAnim == -1) {
        //     return this.SortData(dataBot, true);;
        // }
        // const infoPlayerNow = this.GetInfoPlayerNow();
        // if (infoPlayerNow.progress == progressPlayerBeforeAnim) {
        //     return this.SortData(dataBot, true);
        // }
        // let playerScore = dataBot.find(bot => bot.id == MConfigFacebook.Instance.playerID);
        // playerScore.progress = progressPlayerBeforeAnim;
        dataBot = this.SortData(dataBot);
        return dataBot;
    }

    public IsClaimedPrizeProgress(index: number) { return PlayerData.Instance.SR_listPrizeClaimed[index] }
    public HasAnyPrizeProgressCanClaim() {
        const dataPrizeCanClaim = this.GetIndexProgressPlayerReachNow();
        const indexPrizeNotReceiveYet = PlayerData.Instance.SR_listPrizeClaimed
            .filter((valueType, index) => index < dataPrizeCanClaim.indexReached)
            .findIndex(value => !value);
        return indexPrizeNotReceiveYet != -1;
    }
    public GetAllPrizeProgressCanClaim(): IPrize[] {
        let result: IPrize[] = [];
        const dataPrizeCanClaim = this.GetIndexProgressPlayerReachNow();
        const listDataPrize = this.GetAllPrizeProgress();

        for (let i = 0; i < (dataPrizeCanClaim.infoPrizeNext != null ? dataPrizeCanClaim.indexReached : CONFIG_SR.DATA_PRIZE_PROGRESS.length); i++) {
            const prizeCheck = listDataPrize[i];
            const isClaimed = PlayerData.Instance.SR_listPrizeClaimed[i];
            if (!isClaimed) {
                prizeCheck.prizes.forEach(prize => {
                    const existing = result.find(p => p.typePrize === prize.typePrize && p.typeReceivePrize === prize.typeReceivePrize);
                    if (existing) {
                        existing.value += prize.value;
                    } else {
                        result.push(new IPrize(prize.typePrize, prize.typeReceivePrize, prize.value));
                    }
                });
            }
        }

        return result;
    }

    public ClaimPrizeProgress(index: number, needSaveData: boolean = true) { PlayerData.Instance.SR_listPrizeClaimed[index] = true; PlayerData.Instance.SaveEvent_SpeedRace(needSaveData); }
    public GetIndexProgressPlayerReachNow(): { progressNow: number, indexReached: number, infoPrizeNext: InfoItemProgressSR } {
        const infoPlayerNow = this.GetInfoPlayerNow();
        if (infoPlayerNow == null) return null;

        const progressPlayerNow = infoPlayerNow.progress;
        let indexReach = -1;
        for (let i = 0; i < CONFIG_SR.DATA_PRIZE_PROGRESS.length; i++) {
            const prizeCheck = CONFIG_SR.DATA_PRIZE_PROGRESS[i];
            if (prizeCheck.progress > progressPlayerNow) {
                indexReach = i;
                break;
            }
        }

        if (indexReach == -1) {
            // max score
            return { progressNow: progressPlayerNow, indexReached: CONFIG_SR.DATA_PRIZE_PROGRESS.length - 1, infoPrizeNext: null }
        } else {
            return { progressNow: progressPlayerNow, indexReached: indexReach == 0 ? -1 : indexReach, infoPrizeNext: CONFIG_SR.DATA_PRIZE_PROGRESS[indexReach] }
        }

    }
    public GetPercentProgressWithIndex(index: number): number {
        const dataProgressNow = this.GetIndexProgressPlayerReachNow();
        if (dataProgressNow == null) { return 0; }

        switch (true) {
            case index == 0 && dataProgressNow.indexReached == -1:
                // case tiến độ đầu tiên
                return dataProgressNow.progressNow / dataProgressNow.infoPrizeNext.progress;
            case index < dataProgressNow.indexReached:
                // case đã pass
                return 1;
            case index == dataProgressNow.indexReached && dataProgressNow.infoPrizeNext != null:
                // case đang trong tiến trình
                const totalProgressNow = CONFIG_SR.DATA_PRIZE_PROGRESS[index - 1].progress;
                // console.log("222222", index, dataProgressNow);
                return (dataProgressNow.progressNow - totalProgressNow) / (dataProgressNow.infoPrizeNext.progress - totalProgressNow);
            case index == dataProgressNow.indexReached && dataProgressNow.infoPrizeNext == null:
                return 1;
            default:
                return 0;
        }
    }

    public CanShowPopUpRewardAtHome() { return !PlayerData.Instance.SR_isReceivePrizeSummary && (this.IsShowResultTime() || this.IsEndEvent()) }
    public IsReceivePrizeSummery() { return PlayerData.Instance.SR_isReceivePrizeSummary }
    public SetReceivePrizeSummery(needSaveData: boolean) { PlayerData.Instance.SR_isReceivePrizeSummary = true; PlayerData.Instance.SaveEvent_SpeedRace(needSaveData); }

    public CanPlayAnimIncreaseProgressIcon(progressOld: number, progressNew: number): boolean {
        const indexProgressOld = this.GetIndexPrizeProgress(progressOld);
        const indexProgressNew = this.GetIndexPrizeProgress(progressNew);
        return indexProgressNew.next > indexProgressOld.next // case normal
            || (indexProgressNew.next == -1 && indexProgressOld.next > 0); // case max level
    }
    //#endregion get func
    //==================================

    //==================================
    //#region registerTime
    public RegisterTime() {
        clientEvent.dispatchEvent(CONFIG_SR.TRY_CHANGE_TITLE);
        if (this.GetTimeDisplay() <= 0) {
            return;
        }
        this.RegisterClock();
    }
    //#endregion registerTime
    //==================================

    //==================================
    //#region Increase score
    public AutoIncreaseScore(canCallUpdateStateEvent: boolean = true) {
        // kiểm tra xem thời gian lưu cuối đã đến thời hạn chưa?
        // nếu đã qua thời gian tăng điểm => tăng điểm , set lại thời gian tăng điểm

        const isValidNotInTimeIncreaseScore = this.IsShowResultTime() || this.IsEndEvent()

        if (isValidNotInTimeIncreaseScore) {
            this.UnRegisterClock();
            canCallUpdateStateEvent && this.UpdateStateEvent();
            clientEvent.dispatchEvent(CONFIG_SR.UPDATE_UI_WHEN_END_TIME);
            clientEvent.dispatchEvent(CONFIG_SR.TRY_CHANGE_TITLE);
        }

        const timeNow = isValidNotInTimeIncreaseScore ? (PlayerData.Instance.SR_timeEnd - CONFIG_SR.SR_TIME_SHOW_RESULT) : Utils.getCurrTime();
        const timePass = timeNow - PlayerData.Instance.SR_lastTimePlayerIncreaseScore;


        if (timePass >= CONFIG_SR.SR_TIME_AUTO_INCREASE_SCORE) {
            const numLoop = Math.floor(timePass / CONFIG_SR.SR_TIME_AUTO_INCREASE_SCORE)
            PlayerData.Instance.SR_lastTimePlayerIncreaseScore = timeNow;
            let wasSaveData: boolean = false;
            for (let i = 0; i < numLoop; i++) {
                wasSaveData = this.UpdateProgressBot(true, i == numLoop - 1, false) && !wasSaveData;
            }
            // trong trường hợp ko có save data thì mới gọi save thời gian 
            PlayerData.Instance.SaveEvent_SpeedRace(!wasSaveData);
            PlayerData.Instance.SR_listPlayerJoin = this.SortData(PlayerData.Instance.SR_listPlayerJoin);
        }
    }

    //#endregion Increase score
    //==================================


    //==================================
    //#region cache
    public GetOldDataCache(): number {
        // check state if event is unlock
        if (!DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SPEED_RACE)) { return null; }
        if (this._stateNow == STATE_SPEED_RACE.JOINING) { return this.GetIndexMutilply() }
    }
    //#endregion cache
    //==================================
}




