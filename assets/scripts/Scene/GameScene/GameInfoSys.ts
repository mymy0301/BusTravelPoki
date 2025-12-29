import { _decorator, Component, director, Node, tween, Tween, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { PlayerData } from '../../Utils/PlayerData';
import { DataEventsSys } from '../DataEventsSys';
import { DataLeaderboardSys } from '../DataLeaderboardSys';
import { DataInfoPlayer } from '../DataInfoPlayer';
import { LogEventManager } from '../../LogEvent/LogEventManager';
import { DataLobbyJson, M_COLOR, TYPE_EVENT_GAME, TYPE_LEVEL_NORMAL as TYPE_LEVEL_NORMAL, TYPE_QUEST_DAILY } from '../../Utils/Types';
import { DataSeasonPassSys } from '../../DataBase/DataSeasonPassSys';
import { MConfigs, TYPE_GAME } from '../../Configs/MConfigs';
import { GameManager } from '../GameManager';
import { DataLevelPassSys } from '../../DataBase/DataLevelPassSys';
import { DataBuildingSys } from '../../DataBase/DataBuildingSys';
import { AutoTimeInGameSys } from '../AutoTimeInGameSys';
import { CurrencySys } from '../CurrencySys';
import { LE_ID_MODE, LE_RESOURCE_CHANGE_change_type, LE_RESULT_END_LEVEL } from '../../LogEvent/TypeLogEvent';
import { DataLobbyJsonSys } from '../DataLobbyJsonSys';
import { SaveStepGameSys } from './Logic/SaveStepGameSys';
import { DataPiggySys } from '../../DataBase/DataPiggySys';
import { DataDashRush } from '../DataDashRush';
import { DataWeeklySys } from '../../DataBase/DataWeeklySys';
import { DataSpeedRace } from '../../DataBase/DataSpeedRace';
import { DataLevelProgressionSys } from '../../DataBase/DataLevelProgressionSys';
import { DataTreasureTrailSys } from '../../DataBase/DataTreasureTrailSys';
import { DataSkyLiftSys } from '../../DataBase/DataSkyLiftSys';
import { STATE_EVENT_LEVEL_PROGRESS } from '../OtherUI/UILevelProgression/TypeLevelProgress';
const { ccclass, property } = _decorator;

@ccclass('GameInfoSys')
export class GameInfoSys extends Component {
    public static Instance: GameInfoSys = null;

    private _numberStarHad: number = 0;
    private _numberCombo: number = 0;
    private _progressCombo: number = 0;
    private _numCarMoveOut: number = 0;
    private _numPassengerWasPickedUp: number = 0;
    public _autoTimeInGameSys: AutoTimeInGameSys = new AutoTimeInGameSys();
    public _numCarSameColorLevelProgress: number = 0;

    protected onLoad() {
        if (GameInfoSys.Instance == null) {
            GameInfoSys.Instance = this;
        }
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.RECEIVE_STAR_IN_GAME, this.ReceiveStar, this);
        clientEvent.on(MConst.EVENT_FEATURE_COMBO.ADD_COMBO, this.AddCombo, this);
        clientEvent.on(MConst.EVENT_FEATURE_COMBO.PAUSE_COMBO, this.PauseCombo, this);
        clientEvent.on(MConst.EVENT_FEATURE_COMBO.RESUME_COMBO, this.ResumeCombo, this);

        clientEvent.on(MConst.EVENT.BUS_MOVE_OUT_TO_THE_GATE, this.IncreaseNumCarMoveOutToTheGate, this);
        clientEvent.on(MConst.EVENT.BUS_MOVING_TO_PARK, this.IncreaseNumCarLevelProgerss, this);
    }

    protected onDisable(): void {
        GameInfoSys.Instance = null;
        this._autoTimeInGameSys.unRegisterEvent();
        clientEvent.off(MConst.EVENT.RECEIVE_STAR_IN_GAME, this.ReceiveStar, this)
        clientEvent.off(MConst.EVENT_FEATURE_COMBO.ADD_COMBO, this.AddCombo, this);
        clientEvent.off(MConst.EVENT_FEATURE_COMBO.PAUSE_COMBO, this.PauseCombo, this);
        clientEvent.off(MConst.EVENT_FEATURE_COMBO.RESUME_COMBO, this.ResumeCombo, this);

        clientEvent.off(MConst.EVENT.BUS_MOVE_OUT_TO_THE_GATE, this.IncreaseNumCarMoveOutToTheGate, this);
        clientEvent.off(MConst.EVENT.BUS_MOVING_TO_PARK, this.IncreaseNumCarLevelProgerss, this);
    }

    // #region self func
    private IncreaseNumCarMoveOutToTheGate(idCar: number, numPassengerPickedUp: number) {
        this._numCarMoveOut += 1;
        this._numPassengerWasPickedUp += numPassengerPickedUp;
    }

    private IncreaseNumCarLevelProgerss(idCar: number, colorCar: M_COLOR, wPos: Vec3) {
        const instanceLevelProgress = DataLevelProgressionSys.Instance;
        if (DataEventsSys.Instance != null && !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION) && instanceLevelProgress.STATE == STATE_EVENT_LEVEL_PROGRESS.JOINING) {
            const colorCarKey: M_COLOR = DataLevelProgressionSys.Instance.GetColorCarSuitForKey(DataLevelProgressionSys.Instance.GetIdEventNow());
            if (colorCarKey == colorCar) {
                this._numCarSameColorLevelProgress += 1;
                clientEvent.dispatchEvent(MConst.EVENT.PLAY_ANIM_PUMPKIN_BUS, wPos);
            }
        }
    }

    private ReceiveStar() {
        // this._numberStarHad += this._numberCombo;
        // bởi vì trong game này mỗi khi nhận 1 star thì chỉ +1 => ko add combo 
        // nếu như game bạn có sử dụng combo thì hãy sử dụng đoạn code được commnet ở trên

        this._numberStarHad += 1;
    }

    private AddCombo() {
        this._numberCombo += 1;
        this.runTimeNewCombo();
    }

    private PauseCombo() {
        Tween.stopAllByTarget(this.node);
    }

    private ResumeCombo() {
        const progressNow = this._progressCombo;
        if (progressNow == 0) return;
        const timeToResumeCombo = progressNow * MConst.TIME_TO_NEW_COMBO;
        const self = this;
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(timeToResumeCombo, {}, {
                onUpdate(target, ratio) {
                    self._progressCombo = 1 - ratio;
                },
            })
            .call(() => {
                self._numberCombo = 0;
                self._progressCombo = 0;
            })
            .start();
    }

    private runTimeNewCombo() {
        const timeToNewCombo = MConst.TIME_TO_NEW_COMBO;
        const self = this;
        this._progressCombo = 1;
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(timeToNewCombo, {}, {
                onUpdate(target, ratio) {
                    self._progressCombo = 1 - ratio;
                },
            })
            .call(() => {
                self._numberCombo = 0;
                self._progressCombo = 0;
            })
            .start();
    }

    //#endregion

    //#region common func

    public getNumCarPickedUp(): number {
        return this._numCarMoveOut;
    }

    public getNumPassengerPickedUp(): number {
        return this._numPassengerWasPickedUp;
    }

    public getNumBuilding(): number {
        return MConfigs.DEFAULT_BLOCK_RECEIVE_EACH_PASS_LEVEL;
    }

    public getNumCoin(): number {
        const typeGame = GameManager.Instance.TypeGamePlay;
        const levelPlayerNow = GameManager.Instance.GetLevelPlayerNow();
        const typeLevel = MConfigs.GetTypeLevel(levelPlayerNow);

        const coin = GetCoinSuitLevel(levelPlayerNow, typeLevel, typeGame);
        return coin;
    }

    public getNumCarLevelProgress(): number {
        return this._numCarSameColorLevelProgress;
    }

    public SetCombo(combo: number) {
        // console.log("num combo before save: ", combo);
        this._numberCombo = combo;
    }

    public AddCoinExtraUIWin(coinAfterAdd: number, coinAdd: number) {
        // add coin extra
        if (PlayerData.Instance._levelPlayer <= MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY) {
            CurrencySys.Instance.AddMoney(coinAfterAdd, 'coinExtra_uiWin', false, false, false);
        }
        // log event coin extra UIWin ở đây
        LogEventManager.Instance.logResource_change('COIN', LE_RESOURCE_CHANGE_change_type.ADD, `${coinAdd}`, 'coinExtra_uiWin');

        DataLobbyJsonSys.Instance.SaveNumCoin(coinAfterAdd, true);
    }

    public SavePassLevel_Tutorial(levelNew: number, totalCoin: number, totalBuilding: number) {
        const playerDataInstance = PlayerData.Instance;
        playerDataInstance._levelPlayer = levelNew;

        const numRetry: number = DataInfoPlayer.Instance.GetStreakLose();
        const timePlay: number = this._autoTimeInGameSys.GetTime();
        LogEventManager.Instance.logLevelEnd(0, LE_ID_MODE.NORMAL, numRetry, LE_RESULT_END_LEVEL.WIN, timePlay);
        LogEventManager.Instance.logLevelWin(0, LE_ID_MODE.NORMAL, numRetry);
        LogEventManager.Instance.logStepGame(0, "W", SaveStepGameSys.Instance.GetListStepToLog());

        DataInfoPlayer.Instance.WinAGame(false);

        // update dash Rush
        DataDashRush.Instance.UpdateData(true, false);

        // chúng ta gọi lưu data ở đây bởi vì chơi xong tut ko gọi về lobby mà gọi chơi game tiếp
        // save coin and building
        CurrencySys.Instance.AddMoney(totalCoin, 'passLevel_tutorial', false, false);
        DataBuildingSys.Instance.AddBlock(totalBuilding, false);

        // increase level week
        DataWeeklySys.Instance.IncreaseLevelWeek(false);

        // save pass tutorial
        PlayerData.Instance._isPlayedTutorial = true;
        PlayerData.Instance.SaveTut();

        DataEventsSys.Instance.UpdateStateForEvent();

        // call update manual in local 
        DataLeaderboardSys.Instance.UpdateInfoPlayer(playerDataInstance._levelPlayer);
        DataLeaderboardSys.Instance.UpdateBestScore(playerDataInstance._levelPlayer, MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD);
        DataLeaderboardSys.Instance.UpdateBestScore(playerDataInstance._levelPlayer, MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND);
        DataLeaderboardSys.Instance.UpdateBestScore(playerDataInstance._weekly_level_root, DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY);
    }

    /**
     * pass level type normal
     * @param levelNew 
     */
    public SavePassLevel_Normal(levelNew: number, totalCoin: number, totalBuilding: number) {

        //=======================================Log event==========================================
        const numRetry: number = DataInfoPlayer.Instance.GetStreakLose();
        const timePlay: number = this._autoTimeInGameSys.GetTime();
        LogEventManager.Instance.logLevelEnd(levelNew - 1, LE_ID_MODE.NORMAL, numRetry, LE_RESULT_END_LEVEL.WIN, timePlay);
        LogEventManager.Instance.logLevelWin(levelNew - 1, LE_ID_MODE.NORMAL, numRetry);
        LogEventManager.Instance.logStepGame(levelNew - 1, "W", SaveStepGameSys.Instance.GetListStepToLog());
        //=======================================Log event==========================================

        //======================================= save receive coin and building ===================
        DataLobbyJsonSys.Instance.SaveNumBuilding(totalBuilding, false);
        DataLobbyJsonSys.Instance.SaveNumCoin(totalCoin, false);

        // save coin and building
        if (levelNew <= MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY) {
            CurrencySys.Instance.AddMoney(DataLobbyJsonSys.Instance.GetNumCoin(), 'nextLevel', false, false);
            DataBuildingSys.Instance.AddBlock(DataLobbyJsonSys.Instance.GetNumBuilding(), false);
        }

        //==========================================================================================
        //==========================================================================================
        //====================================    LOGIC   ==========================================
        //==========================================================================================
        //==========================================================================================
        const playerDataInstance = PlayerData.Instance;
        playerDataInstance._levelPlayer = levelNew;

        DataInfoPlayer.Instance.WinAGame(false);

        const levelOld: number = levelNew - 1;
        const typeLevelOld: TYPE_LEVEL_NORMAL = MConfigs.GetTypeLevel(levelOld);
        // ================================ Season Pass =============================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            // check old level is valid to add more progress
            let keyReceive: number = 0;
            switch (true) {
                case typeLevelOld == TYPE_LEVEL_NORMAL.SUPER_HARD:
                    keyReceive = 5;
                    break;
                case typeLevelOld == TYPE_LEVEL_NORMAL.HARD:
                    keyReceive = 3;
                    break;
                case typeLevelOld == TYPE_LEVEL_NORMAL.NORMAL:
                    keyReceive = 1;
                    break;
            }

            DataSeasonPassSys.Instance.AddProgress(false, keyReceive);
        }

        // ================================ Level Pass =============================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PASS)) {
            DataLevelPassSys.Instance.AddProgress(false);
        }

        //================================ Daily Quest ==============================================
        // ||**DQ**||
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.WIN_NORMAL_GAME, 1);
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.WIN_STEAK_NORMAL_GAME, 1);

        //================================ PiggyBank ==============================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.PIGGY_BANK)) {
            DataLobbyJsonSys.Instance.CanPlayPiggy(true, false);
            const typeLevel = MConfigs.GetTypeLevel(levelOld);
            const baseCoin = GetCoinSuitLevel(levelOld, typeLevel);
            DataPiggySys.Instance.ReceiveCoinPiggy(baseCoin, false);
        }

        //================================ DashRush ==============================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.DASH_RUSH)) {
            if (DataDashRush.Instance.UpdateData(true, false)) {
                DataLobbyJsonSys.Instance.CanPlayDashRush(true, false);
            }
        }

        //================================ SpeedRace ===========================================
        const canUpdate: boolean = DataSpeedRace.Instance.UpdateData(true, false);
        if (!DataSpeedRace.Instance.IsEndEvent()) { DataLobbyJsonSys.Instance.CanPlaySpeedRace(true, false) }

        //================================ Level Progression ===========================================
        //update progress levelProgress
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION)) {
            DataLevelProgressionSys.Instance.IncreaseCar(GameManager.Instance.JsonPlayGame.LEVEL, false);
        }

        //================================ Treasure Trail ======================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
            DataTreasureTrailSys.Instance.TryIncreaseStreak(false);
        }

        //================================ Sky Lift ============================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SKY_LIFT)) {
            DataSkyLiftSys.Instance.IncreaseProgress(false);
        }

        //================================ Weekly ==============================================
        DataWeeklySys.Instance.IncreaseLevelWeek(false);

        // because saveDataStorage is save all the inform of game so just call one time
        playerDataInstance.SaveInfoPlayer();

        // call update manual in local 
        DataLeaderboardSys.Instance.UpdateInfoPlayer(playerDataInstance._levelPlayer);
        DataLeaderboardSys.Instance.UpdateBestScore(playerDataInstance._levelPlayer, MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD);
        DataLeaderboardSys.Instance.UpdateBestScore(playerDataInstance._levelPlayer, MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND);
        DataLeaderboardSys.Instance.UpdateBestScore(playerDataInstance._weekly_level_root, DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY);

        DataEventsSys.Instance.UpdateStateForEvent();
    }

    public SaveEndGameTournament(contextIdLeaderboard: string) {
        const numberStarHad = this.GetNumberStarHad();
        DataLeaderboardSys.Instance.UpdateBestScore(numberStarHad, contextIdLeaderboard);
    }

    public ResetData() {
        this._numCarMoveOut = 0;
        this._numberStarHad = 0;
        this._numPassengerWasPickedUp = 0;
        this._numCarSameColorLevelProgress = 0;
    }

    public GetNumberStarHad() {
        return this._numberStarHad;
    }

    public TryLogEventReplay(indexLevel: number) {
        if (!PlayerData.Instance._isWinFirstTry) {
            LogEventManager.Instance.logLevelReplay(indexLevel);
        }
    }
    //#endregion
}


function GetCoinSuitLevel(level: number, typeLevel: TYPE_LEVEL_NORMAL, typeGame = TYPE_GAME.NORMAL) {
    switch (true) {
        case typeGame == TYPE_GAME.NORMAL && typeLevel == TYPE_LEVEL_NORMAL.HARD && level > MConfigs.LEVEL_CAN_SHOW_UI:
            return 200;
        case typeGame == TYPE_GAME.NORMAL && typeLevel == TYPE_LEVEL_NORMAL.SUPER_HARD && level > MConfigs.LEVEL_CAN_SHOW_UI:
            return 300;
        default:
            return 100;
    }
}

