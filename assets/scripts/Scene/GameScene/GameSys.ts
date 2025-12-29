import { _decorator, Component, director, macro, Node, PhysicsSystem2D, randomRangeInt, warn, size, Pool, instantiate } from 'cc';
import { GameSoundEffect, GetMColorByNumber, IPopUpBuyItemInGame, IShowTTInGame, JsonCar, JsonMapGame, JsonPassenger, M_COLOR, NAME_SUP_VI_CAR, ParamNextStepTut, STATE_CAR, STATE_CAR_MOVING, STATE_GAME, STATE_PARKING_CAR, TYPE_CAR_SIZE, TYPE_ITEM, TYPE_LEVEL_NORMAL, TYPE_LOSE_GAME, TYPE_SPECIAL_LOBBY, TYPE_UI_SHARE, UI_END_GAME } from '../../Utils/Types';
import { clientEvent } from '../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../Const/MConst';
import { GameManager } from '../GameManager';
import { MConfigs, TYPE_GAME, TYPE_TUT } from '../../Configs/MConfigs';
import { GameInfoSys } from './GameInfoSys';
import { ReadMapJson } from '../../MJson/ReadMapJson';
import { GroundCarSys } from './Logic/GroundCarSys';
import { ListParkingCarSys } from './Logic/ListParkingCarSys';
import { ListPassengerSys } from './Logic/ListPassengerSys';
import { GameUISys } from './GameUISys';
import { Utils } from '../../Utils/Utils';
import { TutorialGameSys } from './TutorialGameSys';
import { LogicGenPassenger2 } from './Logic/LogicGenPassenger';
import { EffectHelicopterSys } from './Logic/Helicopter/EffectHelicopterSys';
import { LogicInGameSys } from './SupportGameSys/LogicInGameSys';
import { AnimOpeningGame, TYPE_SHOW } from './Logic/AnimOpeningGame/AnimOpeningGame';
import { HeaderInGameSys } from './OtherUI/HeaderInGameSys';
import { ChangeSceneSys } from '../../Common/ChangeSceneSys';
import { PlayerData } from '../../Utils/PlayerData';
import { ParamCustomUIWin, typeUIWin } from '../OtherUI/UIWin/Type_UIWin';
import { LogEventManager } from '../../LogEvent/LogEventManager';
import { LE_ID_MODE } from '../../LogEvent/TypeLogEvent';
import { DataInfoPlayer } from '../DataInfoPlayer';
import { CheatingSys } from '../CheatingSys';
import { ParamCustomUILose } from '../OtherUI/UILose/Type_UILose';
import { DataLeaderboardSys } from '../DataLeaderboardSys';
import { QueueCarCanMoveToGateSys } from './Logic/QueueCarCanMoveToGateSys';
import { IntroBoosterLevel } from './Tutorials/IntroBoosterLevel';
import { FBInstantManager } from '../../Utils/facebooks/FbInstanceManager';
import { CanvasLoadingSys } from '../../Utils/CanvasLoadingSys';
import { SaveStepGameSys } from './Logic/SaveStepGameSys';
import { UIOpeningGame } from './OtherUI/UIOpeningGame/UIOpeningGame';
import { ComboSys } from './Logic/ComboSys';
import { SoundSys } from '../../Common/SoundSys';
import { DataLevelProgressionSys } from '../../DataBase/DataLevelProgressionSys';
import { DataTreasureTrailSys } from '../../DataBase/DataTreasureTrailSys';
import { STATE_TT } from '../OtherUI/UITreasureTrail/TypeTreasureTrail';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { PoolGameSys } from '../LobbyScene/PoolGameSys';
import { DataChristmasSys } from '../../DataBase/DataChristmasSys';
import { DataLightRoad_christ } from '../../DataBase/DataLightRoad_christ';
import { DataHatRace_christ } from '../../DataBase/DataHatRace_christ';
import { GetLevelChristGame } from '../OtherUI/UIChristmasEvent/TypeChristmasEvent';
const { ccclass, property } = _decorator;

@ccclass('GameSys')
export class GameSys extends Component {
    public static Instance: GameSys;

    @property(GameInfoSys) gameInfoSys: GameInfoSys;
    @property(GroundCarSys) groundCarSys: GroundCarSys;
    @property(ListParkingCarSys) listParkingCarSys: ListParkingCarSys;
    @property(ListPassengerSys) listPassengerSys: ListPassengerSys;
    @property(LogicInGameSys) logicInGameSys: LogicInGameSys;
    @property(AnimOpeningGame) animOpeningGame: AnimOpeningGame;
    @property(HeaderInGameSys) headerInGameSys: HeaderInGameSys;
    @property(IntroBoosterLevel) introlBoosterLevel: IntroBoosterLevel;
    @property(UIOpeningGame) uiOpeningGame: UIOpeningGame;
    @property(Node) nGate: Node;

    private _stateGame: STATE_GAME = STATE_GAME.PREPARE;

    private _isHasTime: boolean = false;
    private queueCarCanMoveToGateSys: QueueCarCanMoveToGateSys = new QueueCarCanMoveToGateSys();

    private _comboSys: ComboSys = null;
    private _isAnimUnlockParking: boolean = false;

    private readonly TIME_DELAY_BEFORE_UI_WIN: number = 0;

    private _infoMapCheckTutNow: any = null;

    protected onLoad(): void {
        if (GameSys.Instance == null) {
            GameSys.Instance = this;
            director.on("DONE_TRANSITIONS_TURN_OFF", this.DoneAnimTurnOffLoadScene, this);
            // init logic in game
            this.logicInGameSys.SetUpCb(this.ChangeStateGame.bind(this), this.GetStateGame.bind(this));
            this._comboSys = new ComboSys(); // init ComboSys

            // load banner ads if it not in this case
            if (GameManager.Instance.TypeGamePlay != TYPE_GAME.TUTORIAL && PlayerData.Instance.CanShowAds) {
                FBInstantManager.Instance.CanShowBanner = PlayerData.Instance.CanShowAds;
                FBInstantManager.Instance.Load_BannerAdAsync_SheduleOne(true);
            }
        }
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.RESET_GAME, this.setResetGame_From_ConfirmEnsurePopup, this);
        clientEvent.on(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
        clientEvent.on(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);
        clientEvent.on(MConst.EVENT.NEXT_LEVEL, this.NextLevel, this);
        clientEvent.on(MConst.EVENT.CHECK_WIN_GAME, this.CheckWinGame, this);
        clientEvent.on(MConst.EVENT.LOSE_GAME, this.LoseGame, this);
        clientEvent.on(MConst.EVENT.IS_ANIM_UNLOCK_PARKING, this.ChangeStatusUnlockParkingOfGame, this);
        clientEvent.on(MConst.EVENT.START_TIME_GAME, this.StartTimeGame, this);

        clientEvent.on(MConst.EVENT_GAME_SYS_CB.GET_STATE_GAME, this.GetStateGameCB, this);
        clientEvent.on(MConst.EVENT_GAME_SYS_CB.IS_CAR_MOVING, this.IsCarMoving_cb, this);
        clientEvent.on(MConst.EVENT_GAME_SYS_CB.IS_PASS_MOVING, this.IsPassMoving_cb, this);

        // save in game
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL:
                PlayerData.Instance._isPlayingInGame = true;
                PlayerData.Instance.Save();
                break;
            case TYPE_GAME.CHRISTMAS:
                PlayerData.Instance._isPlayingInGameChrist = true;
                PlayerData.Instance.Save();
                break;
        }
    }

    protected onDisable(): void {
        GameSys.Instance = null;
        this._comboSys.OnDestroy();
        director.off("DONE_TRANSITIONS_TURN_OFF", this.DoneAnimTurnOffLoadScene, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.setResetGame_From_ConfirmEnsurePopup, this);
        clientEvent.off(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
        clientEvent.off(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);
        clientEvent.off(MConst.EVENT.NEXT_LEVEL, this.NextLevel, this);
        clientEvent.off(MConst.EVENT.CHECK_WIN_GAME, this.CheckWinGame, this);
        clientEvent.off(MConst.EVENT.LOSE_GAME, this.LoseGame, this);
        clientEvent.off(MConst.EVENT.IS_ANIM_UNLOCK_PARKING, this.ChangeStatusUnlockParkingOfGame, this);
        clientEvent.off(MConst.EVENT.START_TIME_GAME, this.StartTimeGame, this);

        clientEvent.off(MConst.EVENT_GAME_SYS_CB.GET_STATE_GAME, this.GetStateGameCB, this);
        clientEvent.off(MConst.EVENT_GAME_SYS_CB.IS_CAR_MOVING, this.IsCarMoving_cb, this);
        clientEvent.off(MConst.EVENT_GAME_SYS_CB.IS_PASS_MOVING, this.IsPassMoving_cb, this);

        // save out game
        const typeGamePlaying = GameManager.Instance.TypeGamePlay
        switch (true) {
            case typeGamePlaying == TYPE_GAME.NORMAL && PlayerData.Instance._isPlayingInGame:
                PlayerData.Instance._isPlayingInGame = false;
                PlayerData.Instance.Save();
                break;
            case typeGamePlaying == TYPE_GAME.CHRISTMAS && PlayerData.Instance._isPlayingInGameChrist:
                PlayerData.Instance._isPlayingInGameChrist = false;
                PlayerData.Instance.Save();
                break;
        }
    }

    protected start(): void {
        this.animOpeningGame.InitPosition();

        // you can use this line code below if you want load game when it ready , not wait the anim change screen
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TOURNAMENT:
                MConfigs.timeStartNewLevel = -1;
                this.animOpeningGame.PrepareToShowUp();
                this.headerInGameSys.PrepareToShowUp();
                GameUISys.Instance.ShowInfoGroupTitleTournament(() => {
                    this.ChangeStateGame(STATE_GAME.PREPARE);
                });
                break;
            case TYPE_GAME.NORMAL:
                this.ChangeStateGame(STATE_GAME.PREPARE);
                MConfigs.timeStartNewLevel = Date.now();
                if (MConfigs.timeClickNextLevel > 0) {
                    const timeNextLevel = MConfigs.timeStartNewLevel - MConfigs.timeClickNextLevel;
                    LogEventManager.Instance.logTimeFromNextLevelToStartNewLevel(GameManager.Instance.levelPlayerNow, timeNextLevel);
                }
                break;
            default:
                MConfigs.timeStartNewLevel = -1;
                this.ChangeStateGame(STATE_GAME.PREPARE);
                break;
        }
        // gen helicopter
        EffectHelicopterSys.Instance.genHelicopter();
        // start PhysicSystem2D
        PhysicsSystem2D.instance.enable = true;
    }

    //#region func listen
    private GetStateGameCB(cbGetStateGame: CallableFunction) {
        cbGetStateGame(this.GetStateGame());
    }

    private IsCarMoving_cb(cb: CallableFunction) {
        let t1 = this.groundCarSys.GetCarByMovingState(STATE_CAR_MOVING.MOVING_TO_THE_BLOCK);
        let t2 = this.groundCarSys.GetCarByMovingState(STATE_CAR_MOVING.MOVING_TO_THE_GATE);
        let t3 = this.groundCarSys.GetCarByMovingState(STATE_CAR_MOVING.MOVING_TO_THE_PARK);

        cb((t1 != null || t2 != null || t3 != null));
    }

    private IsPassMoving_cb(cb: CallableFunction) {
        cb(this.listPassengerSys.IsMovingPassenger());
    }

    private DoneAnimTurnOffLoadScene() {
        // you can use this comment code if you want wait the anim change screen done then load game after
        // this.ChangeStateGame(STATE_GAME.PREPARE);
    }

    private setResetGame_From_ConfirmEnsurePopup() {
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL:
                // save info player
                DataInfoPlayer.Instance.LoseAGame();
                // update json in game manager
                GameManager.Instance.UpdateSpeedRaceCache();
                GameManager.Instance.UpdateDashRushCache();
                break;
            case TYPE_GAME.TOURNAMENT:
                GameManager.Instance.JsonPlayTournament.LEVEL = 1;

                GameUISys.Instance.groupInfoTournament.initTournament();
                this.animOpeningGame.PrepareToShowUp();
                this.headerInGameSys.PrepareToShowUp();

                GameUISys.Instance.ShowInfoGroupTitleTournament(() => {

                });
                break;
        }
        this.ResetGame(true);
    }

    private async ResetGame(isResetInfor: boolean = true) {
        // reset data 
        if (isResetInfor) {
            this.gameInfoSys.ResetData();
            // reset can watched ads to buy item
            this._isWatchAdsBuyItem = [false, false, false];
            this._isWatchAdsContinue = false;
            this._isWatchAdsUnlockSpot = false;
            this.listParkingCarSys.ClearCache();
        } else {
            this.listParkingCarSys.SaveCache();
        }

        this.listParkingCarSys.ResetData();
        this.listPassengerSys.ResetData();
        this.groundCarSys.ResetData();
        this.logicInGameSys.ResetData();
        this.queueCarCanMoveToGateSys.ResetData();

        // resumev sound bg < because when lose it pause >
        SoundSys.Instance.resumeMusic();

        // reset speed passenger
        MConfigs.SET_VEC_PASSENGER = MConfigs.DEFAULT_VEC_PASSENGER;

        // reset tut
        TutorialGameSys.Instance.ResetLogicTut();



        //stop hellicopter
        EffectHelicopterSys.Instance.StopHellicopter();

        // reset step game
        SaveStepGameSys.Instance.ResetSteps();

        await Utils.delay(0.2 * 1000);


        // load map again
        this.ChangeStateGame(STATE_GAME.PREPARE);
    }

    private ResumeGame() {
        clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_RESUME_COOLDOWN);
        this.ChangeStateGame(STATE_GAME.PLAYING);
        // check lose game
        this.logicInGameSys.CheckLoseGame();
        this.logicInGameSys.CallPickUpPassengerWhenHadNewCar();
    }

    private PauseGame() {
        this.ChangeStateGame(STATE_GAME.PAUSE);
    }

    /**
     * Xin hãy ghi nhớ add coin và building trong gameInfoSys
     * @param totalCoin 
     * @param buidling 
     */
    private NextLevel(totalCoin: number = 0, buidling: number = 0) {
        const nextLevel = GameManager.Instance.JsonPlayGame.LEVEL + 1;

        /**
        * This code below is test not use in real game
        */
        if (CheatingSys.Instance.hackMap) {
            GameManager.Instance.PreparePlayNormal(nextLevel, 0, []);
            return;
        }

        // check to next level
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                // keep play
                GameManager.Instance.PreparePlayNormal(nextLevel, 0, []);
                // ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY);
                break;
            case TYPE_GAME.NORMAL:
                // check to choice change scene
                if (nextLevel <= MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY) {
                    // keep play
                    GameManager.Instance.PreparePlayNormal(nextLevel, 0, []);
                } else {
                    // return lobby
                    ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.LOBBY, TYPE_SPECIAL_LOBBY.SHOW_DONE_LEVEL);
                }
                break;
            case TYPE_GAME.CHRISTMAS:
                console.error("đang làm dở nhớ làm tiếp đoạn này hẹ hệhejhehehehehehe");
                break;
        }
    }

    private PreviousLevel() {
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL:
                if (GameManager.Instance.JsonPlayGame.LEVEL - 1 >= 0) {
                    GameManager.Instance.PreparePlayNormal(GameManager.Instance.JsonPlayGame.LEVEL - 1, 0, []);
                }
                break;
        }
    }

    private CheckWinGame() {
        const isNoMorePassenger: boolean = this.listPassengerSys.IsNoMorePassenger();
        const isAllPassengerPickedUp: boolean = this.listPassengerSys.IsAddPassengerMoveToGate();

        // console.log("check case win game", isNoMorePassenger, isAllPassengerPickedUp, this.listPassengerSys.GetNumPassengerPickedUp(), this.listPassengerSys.GetTotalPassenger());

        if (isNoMorePassenger && isAllPassengerPickedUp) {
            this.ChangeStateGame(STATE_GAME.WIN_GAME);
        }
    }

    private StartTimeGame() {
        this.headerInGameSys.StartTime();
    }
    //#endregion func listen

    //#region FUNC STATE GAME
    public async ChangeStateGame(state: STATE_GAME, dataCustom: any = null) {
        // ==================== valid ========================
        switch (true) {
            case this._stateGame == state && state == STATE_GAME.LOSE_GAME:
                return;
            case this._stateGame == state && state == STATE_GAME.WIN_GAME:
                return;
        }

        const self = this;
        // console.log("ChangeStateGame", state);
        this._stateGame = state;
        const levelPlayerNow = GameManager.Instance.levelPlayerNow;

        if (this._infoMapCheckTutNow == null && [TYPE_GAME.NORMAL, TYPE_GAME.TUTORIAL, TYPE_GAME].includes(GameManager.Instance.TypeGamePlay)) {
            this._infoMapCheckTutNow = await this.GetInfoMapForCheckTut();
        }

        switch (state) {
            case STATE_GAME.PREPARE:
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
                // ======================= check with all type game ==============
                // check to hide ads
                if (MConfigs.numIAPTicketHave > 0) {
                    if (!PlayerData.Instance.CanShowAds) {
                        GameUISys.Instance.OnBuyNoAdsSuccessful();
                    }
                } else {
                    GameUISys.Instance.HideUIAds();
                }

                //============================= check special each type ===============
                switch (GameManager.Instance.TypeGamePlay) {
                    case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL:
                        clientEvent.dispatchEvent(MConst.EVENT_PASSENGERS.HIDE_NUM_PASSENGER);
                        if (GameManager.Instance.JsonPlayGame.LEVEL <= MConfigs.LEVEL_CAN_SHOW_UI) {
                            GameUISys.Instance.HideUIShop();
                        }
                        this.animOpeningGame.PrepareToShowUp();
                        this.headerInGameSys.PrepareToShowUp();
                        this.uiOpeningGame.Prepare_TargetFirstGame();
                        this.uiOpeningGame.Prepare_WarningHardLevel();

                        // check to hide btn tut
                        if (IntroBoosterLevel.CheckCanShowPopUpTut(levelPlayerNow, this._infoMapCheckTutNow)) {
                            this.introlBoosterLevel.ShowUI_before_intro(levelPlayerNow);
                        } else {
                            this.introlBoosterLevel.ShowUI_after_intro(levelPlayerNow);
                        }

                        this.NewGame();
                        break;
                    case TYPE_GAME.TOURNAMENT:
                        // this.animOpeningGame.PrepareToShowUp();
                        // this.headerInGameSys.PrepareToShowUp();
                        // if (IntroBoosterLevel.CheckCanShowPopUpTut(levelPlayerNow, this._infoMapCheckTutNow)) {
                        //     this.introlBoosterLevel.ShowUI_before_intro(levelPlayerNow);
                        // } else {
                        // }
                        this.introlBoosterLevel.ShowUI_after_intro(999);
                        this.NewGame();
                        break;
                    case TYPE_GAME.WITH_FRIEND:
                        this.animOpeningGame.PrepareToShowUp();
                        this.headerInGameSys.PrepareToShowUp();
                        // if (IntroBoosterLevel.CheckCanShowPopUpTut(levelPlayerNow, this._infoMapCheckTutNow)) {
                        //     this.introlBoosterLevel.ShowUI_before_intro(levelPlayerNow);
                        // } else {
                        // }
                        this.introlBoosterLevel.ShowUI_after_intro(999);
                        this.NewGame();
                        break;
                    case TYPE_GAME.CHRISTMAS:
                        clientEvent.dispatchEvent(MConst.EVENT_PASSENGERS.HIDE_NUM_PASSENGER);
                        this.animOpeningGame.PrepareToShowUp();
                        this.headerInGameSys.PrepareToShowUp();
                        this.introlBoosterLevel.ShowUI_after_intro(999);
                        this.uiOpeningGame.Prepare_TargetFirstGame();
                        this.NewGame();
                        break;
                    case TYPE_GAME.DAILY_CHALLENGE:
                        break;
                }
                break;
            case STATE_GAME.OPENING:
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);
                let isShowPopUpTut = false;

                // hiển thị popUpTut
                switch (GameManager.Instance.TypeGamePlay) {
                    case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL:
                        isShowPopUpTut = this.introlBoosterLevel.TryShowPopUpTut(levelPlayerNow, this._infoMapCheckTutNow, () => { isShowPopUpTut = false });
                        if (isShowPopUpTut) {
                            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                        }
                        break;
                    case TYPE_GAME.TOURNAMENT:
                        break;
                    case TYPE_GAME.WITH_FRIEND:
                        break;
                    case TYPE_GAME.CHRISTMAS:
                        isShowPopUpTut = this.introlBoosterLevel.TryShowPopUpTutChrist(() => { isShowPopUpTut = false; });
                        if (isShowPopUpTut) {
                            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                        }
                        break;
                }

                // check type game play : normal or daily
                switch (GameManager.Instance.TypeGamePlay) {
                    case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL:
                        if (isShowPopUpTut) {
                            await Utils.WaitReceivingDone(() => !isShowPopUpTut);
                        }

                        // show btn intro after anim done
                        this.introlBoosterLevel.ShowUI_after_intro(levelPlayerNow);

                        this.ChangeStateGame(STATE_GAME.PLAYING);
                        break;
                    case TYPE_GAME.DAILY_CHALLENGE:
                        clientEvent.dispatchEvent(MConst.EVENT.START_PLAY_GAME);
                        break;
                    case TYPE_GAME.TOURNAMENT:
                        clientEvent.dispatchEvent(MConst.EVENT.START_PLAY_GAME);

                        this.ChangeStateGame(STATE_GAME.PLAYING);
                        break;
                    case TYPE_GAME.WITH_FRIEND:
                        clientEvent.dispatchEvent(MConst.EVENT.START_PLAY_GAME);
                        this.ChangeStateGame(STATE_GAME.PLAYING);
                        break;
                    case TYPE_GAME.CHRISTMAS:
                        if (isShowPopUpTut) { await Utils.WaitReceivingDone(() => !isShowPopUpTut); }
                        // show btn intro after anim done
                        this.introlBoosterLevel.ShowUI_after_intro(999);
                        clientEvent.dispatchEvent(MConst.EVENT.START_PLAY_GAME);
                        this.ChangeStateGame(STATE_GAME.PLAYING);
                        break;
                }
                break;
            case STATE_GAME.PLAYING:
                // preload all ui need  
                GameUISys.Instance.PreloadAllUINeed();

                // this.groundCarSys.TryStartTimeAllCars();
                this.groundCarSys.TryCallTimeCooldown();

                // in this game this inly call when passenger move out all and ready to get into the car
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);

                switch (GameManager.Instance.TypeGamePlay) {
                    case TYPE_GAME.NORMAL: break;
                    case TYPE_GAME.DAILY_CHALLENGE: break;
                    case TYPE_GAME.TOURNAMENT: break;
                    case TYPE_GAME.WITH_FRIEND: break;
                    case TYPE_GAME.CHRISTMAS: break;
                }
                break;
            case STATE_GAME.PAUSE:
                clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_PAUSE_COOLDOWN);
                break;
            case STATE_GAME.LOSE_GAME:
                this.headerInGameSys.PauseTime();

                // =========== maybe you need stop force something in here such as hint
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

                // =========== show ui in here
                // check type lose game
                // if lose game because no more place car in parking but player not unlock all parking car => show UIUnlockParkingFirst then so LoseGame after
                // it not => show UI Lose

                if (dataCustom != null && dataCustom[0] != null) {
                    const timeWaitNoti_noParking = 1.5;
                    switch (dataCustom[0]) {
                        case TYPE_LOSE_GAME.CAR_OVER_TIME:
                            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.END_TIME);
                            await Utils.delay(timeWaitNoti_noParking * 1000);
                            await this.ShowUILose();
                            break;
                        case TYPE_LOSE_GAME.NO_MORE_MOVES:
                            let nParkingCarLockNormal = this.listParkingCarSys.GetNParkingCarByStateParking(STATE_PARKING_CAR.LOCK_NORMAL);
                            if (nParkingCarLockNormal != null) {
                                clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.NO_PLACE_PARKING);
                                await Utils.delay(timeWaitNoti_noParking * 1000);

                                // emit để pause 
                                this.ShowLoseGame();
                            } else {
                                clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.NO_PLACE_PARKING);
                                await Utils.delay(timeWaitNoti_noParking * 1000);
                                await this.ShowUILose();
                            }
                            break;
                    }
                }

                //=============
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                break;
            case STATE_GAME.WIN_GAME:
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_PEEP);
                this.headerInGameSys.PauseTime();

                // maybe you need stop force something in here such as hint
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

                // wait anim unlock in here first
                await Utils.WaitReceivingDone(() => { return !this._isAnimUnlockParking });

                // call turn off all UI
                let waitUICloseDone = false;
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_ALL_UI_SHOWING, 1, () => {
                    waitUICloseDone = true;
                });

                // đợi đến khi close hết Ui rồi mới chạy logic tiếp
                await Utils.WaitReceivingDone(() => { return waitUICloseDone; });

                // play anim opening game
                await this.animOpeningGame.AnimHideUIGame();

                // Type Level
                let typeUIWin: typeUIWin = 'Normal';
                const levelNow = GameManager.Instance.JsonPlayGame.LEVEL;
                const totalCoin = GameInfoSys.Instance.getNumCoin();
                const totalBuidling = GameInfoSys.Instance.getNumBuilding();
                const nextLevel = GameManager.Instance.JsonPlayGame.LEVEL + 1;

                let jsonCustom: ParamCustomUIWin = null;
                switch (GameManager.Instance.TypeGamePlay) {
                    case TYPE_GAME.TUTORIAL:
                        typeUIWin = 'Normal';

                        // get the json param when open ui win and pass to uiWin
                        jsonCustom = {
                            level: levelNow,
                            time: GameInfoSys.Instance._autoTimeInGameSys.GetTime(),
                            car: GameInfoSys.Instance.getNumCarPickedUp(),
                            passenger: GameInfoSys.Instance.getNumPassengerPickedUp(),
                            building: totalBuidling,
                            coin: totalCoin,
                            typeUI: typeUIWin
                        }

                        // save pass level
                        GameInfoSys.Instance.SavePassLevel_Tutorial(nextLevel, totalCoin, totalBuidling);

                        await Utils.delay(this.TIME_DELAY_BEFORE_UI_WIN * 1000);
                        // show ui in here
                        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_WIN, 1, true, jsonCustom);


                        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                        break;
                    case TYPE_GAME.NORMAL:
                        const typeLevelGame = MConfigs.GetTypeLevel(GameManager.Instance.GetLevelPlayerNow());
                        switch (typeLevelGame) {
                            case TYPE_LEVEL_NORMAL.NORMAL: typeUIWin = 'Normal'; break;
                            case TYPE_LEVEL_NORMAL.HARD: typeUIWin = 'Hard'; break;
                            case TYPE_LEVEL_NORMAL.SUPER_HARD: typeUIWin = 'SupperHard'; break;
                        }

                        // get the json param when open ui win and pass to uiWin
                        jsonCustom = {
                            level: levelNow,
                            time: GameInfoSys.Instance._autoTimeInGameSys.GetTime(),
                            car: GameInfoSys.Instance.getNumCarPickedUp(),
                            passenger: GameInfoSys.Instance.getNumPassengerPickedUp(),
                            building: totalBuidling,
                            coin: totalCoin,
                            typeUI: typeUIWin
                        }

                        // save pass level
                        PlayerData.Instance._isPlayingInGame = false;
                        GameInfoSys.Instance.SavePassLevel_Normal(nextLevel, totalCoin, totalBuidling);

                        await Utils.delay(this.TIME_DELAY_BEFORE_UI_WIN * 1000);
                        // show ui in here
                        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_WIN, 1, true, jsonCustom);

                        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
                        break;
                    case TYPE_GAME.CHRISTMAS:
                        PlayerData.Instance._isPlayingInGameChrist = false;

                        LogEventManager.Instance.logLevelWin(GameManager.Instance.JsonPlayChristmas.LEVEL, LE_ID_MODE.CHRIST, 0);
                        // tăng lv nữa
                        DataLightRoad_christ.Instance.IncreaseProgress(1, false);
                        DataHatRace_christ.Instance.IncreaseStreakPlayer(true);
                        // show UI win christmas
                        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_WIN_CHIRSTMAS, 1);
                        break;
                    case TYPE_GAME.TOURNAMENT:
                        this.NextMapTournament();
                        break;
                    case TYPE_GAME.WITH_FRIEND:
                        if (DataInfoPlayer.Instance.currWithFriendDataInfo.senderID == FBInstantManager.Instance.getID()) {
                            DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore = this.headerInGameSys.timeInGameWithFriendSys.GetTimeWithFriend();
                            this.updateContextWithFriend();
                        } else {
                            DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore = this.headerInGameSys.timeInGameWithFriendSys.GetTimeWithFriend();
                            this.updateContextWithFriend();
                        }

                        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_WIN_WITHFRIEND, 2, true);
                        break;
                }
                break;
        }
    }

    private async ShowUILose() {
        // save info player
        if (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL) {
            // lose game
            DataInfoPlayer.Instance.LoseAGame();
        }

        // play anim opening game
        await this.animOpeningGame.AnimHideUIGame();

        // get the json param when open ui win and pass to uiWin
        let jsonCustom: ParamCustomUILose = {
            time: GameInfoSys.Instance._autoTimeInGameSys.GetTime(),
            car: GameInfoSys.Instance.getNumCarPickedUp(),
            passenger: GameInfoSys.Instance.getNumPassengerPickedUp(),
        }

        // filter theo type gamePlay
        switch (true) {
            case GameManager.Instance.TypeGamePlay == TYPE_GAME.CHRISTMAS:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LOSE, 1);
                break;
            default:
                // trong trường hợp thua TreasureTrail thì ta sẽ phải show Treasure trail trước rồi mới đến UILose
                switch (true) {
                    case DataTreasureTrailSys.Instance.STATE == STATE_TT.LOSE:
                        const dataCustom: IShowTTInGame = {
                            cbClose: () => {
                                // show UILose
                                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LOSE, 1, true, jsonCustom);
                            }
                        }
                        // show UI TreasureTrail
                        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TREASURE_TRAIL, 1, true, [dataCustom]);
                        break;
                    // trường hợp default
                    default:
                        // then show UI Lose
                        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LOSE, 1, true, jsonCustom);
                        break;
                }
                break;
        }
    }

    private async ShowUIOpening() {
        // if has time => you can play anim for time
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL: case TYPE_GAME.NORMAL:
                if (this._isHasTime) {
                    this.animOpeningGame.AnimOpenObj(this.headerInGameSys.timeInGameSys.node, TYPE_SHOW.TOP);
                    // this.headerInGameSys.timeInGameSys.node.active = true;
                }

                // if (GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_SHOW_UI) {
                // play anim show UI
                await this.animOpeningGame.AnimOpeningGame();
                // }
                break;
            case TYPE_GAME.TOURNAMENT:
                if (this._isHasTime) {
                    this.animOpeningGame.AnimOpenObj(this.headerInGameSys.timeInGameSys.node, TYPE_SHOW.TOP);
                    // this.headerInGameSys.timeInGameSys.node.active = true;
                }
                await this.animOpeningGame.AnimOpeningGame();
                break;
            case TYPE_GAME.WITH_FRIEND:
                if (this._isHasTime) {
                    this.animOpeningGame.AnimOpenObj(this.headerInGameSys.timeInGameSys.node, TYPE_SHOW.TOP);
                    // this.headerInGameSys.timeInGameSys.node.active = true;
                }
                await this.animOpeningGame.AnimOpeningGame();
                break;
            case TYPE_GAME.CHRISTMAS:
                if (this._isHasTime) {
                    this.animOpeningGame.AnimOpenObj(this.headerInGameSys.timeInGameSys.node, TYPE_SHOW.TOP);
                    // this.headerInGameSys.timeInGameSys.node.active = true;
                }
                await this.animOpeningGame.AnimOpeningGame();
                break;
        }
    }

    private ShowLoseGame() {
        // console.timeEnd("ShowLoseGame");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_ALL_UI_SHOWING);
        const wPosUnlockParking = this.listParkingCarSys.GetWPosParkingCarUnlock();
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_CONTINUE, 1, true, wPosUnlockParking);
        clientEvent.dispatchEvent(MConst.EVENT_CAR.CAR_PAUSE_COOLDOWN);
    }

    async updateContextWithFriend() {
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(DataInfoPlayer.Instance.currWithFriendDataInfo, TYPE_UI_SHARE.WITH_FRIEND, (base64Image: string) => {
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                if (base64Image.length > 0) {
                    // console.log(base64Image);
                    FBInstantManager.Instance.UpdateContext_WithFriend(base64Image, DataInfoPlayer.Instance.currWithFriendDataInfo, (err, succ) => { });
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }
    }

    private LoseGame(typeLose: TYPE_LOSE_GAME, forceLose: boolean = false) {
        if (forceLose) {
            this.ChangeStateGame(STATE_GAME.LOSE_GAME, [typeLose]);
            return;
        }
        if (this._stateGame != STATE_GAME.PLAYING) { return; }
        this.ChangeStateGame(STATE_GAME.LOSE_GAME, [typeLose]);
    }

    private WinGame(forceWin: boolean = false) {
        if (forceWin) {
            this.ChangeStateGame(STATE_GAME.WIN_GAME);
            return;
        }
        if (this._stateGame != STATE_GAME.PLAYING) { return; }
        this.ChangeStateGame(STATE_GAME.WIN_GAME);
    }
    //#endregion FUNC STATE GAME
    //===========================================================================

    //===========================================================================
    //#region wait anim other
    private ChangeStatusUnlockParkingOfGame(isAnimDone: boolean) {
        this._isAnimUnlockParking = isAnimDone;
    }
    //#endregion wait anim other
    //===========================================================================

    //===========================================================================
    //#region tut
    private RegisterTut() {
        const insTut = TutorialGameSys.Instance;
        /**WARNING :Please do not delete any thing in code below if you not ensure it make right */
        insTut.RegisterSpecialCbInGame(
            this.groundCarSys.GetCarById.bind(this.groundCarSys),
            this.groundCarSys.GetCarByState.bind(this.groundCarSys),
            () => this.listPassengerSys.LineUsing.ListPassenger,   // bởi vì trong chế độ tut luôn đảm bảo chỉ có 1 line nên đảm bảo code này ko sao
            this.groundCarSys.GetListNCarByState.bind(this.groundCarSys),
            () => { return this.groundCarSys.ListCar }
        );
    }

    private InitTutForGameTutorial() {
        const insTut = TutorialGameSys.Instance;
        if (insTut.GetLogicTut() != null || GameManager.Instance.TypeGamePlay != TYPE_GAME.TUTORIAL) return;
        // init tut
        insTut.InitTut(MConst.EVENT_TUTORIAL_GAME.MAX_STEP.TUTORIAL, TYPE_TUT.TUTORIAL_1);
        this.RegisterTut();
        insTut.CallWhenInitTut();
    }

    private InitTutForGameNormalLv2() {
        const insTut = TutorialGameSys.Instance;
        // init tut
        insTut.InitTut(MConst.EVENT_TUTORIAL_GAME.MAX_STEP.LEVEL2, TYPE_TUT.TUTORIAL_2);
        this.RegisterTut();
        insTut.CallWhenInitTut();
    }
    //#endregion tut
    //===========================================================================

    //#region self func
    private async NewGame() {
        // reset combo sound in here
        //** Sample code **/
        // SoundSys.Instance.resetSoundEffectComboMerge();

        // init map
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                await this.InitMapTutorial();
                LogEventManager.Instance.logLevelStart(0, LE_ID_MODE.NORMAL, 0);
                this.ChangeStateGame(STATE_GAME.OPENING);
                break;
            case TYPE_GAME.NORMAL:
                await this.InitMapNormal();
                const numRetry = DataInfoPlayer.Instance.GetStreakLose();
                LogEventManager.Instance.logLevelStart(GameManager.Instance.JsonPlayGame.LEVEL, LE_ID_MODE.NORMAL, numRetry);
                this.ChangeStateGame(STATE_GAME.OPENING);
                break;
            case TYPE_GAME.DAILY_CHALLENGE:
                await this.InitMapDailyChallenge();
                break;
            case TYPE_GAME.WITH_FRIEND:
                await this.InitMapWithFriend();
                this.ChangeStateGame(STATE_GAME.OPENING);
                break;
            case TYPE_GAME.TOURNAMENT:
                // this.indexStartMapTournament = randomRangeInt(5, MConfigs.MAX_LEVEL_NORMAL);
                await this.InitMapTournament();
                this.ChangeStateGame(STATE_GAME.OPENING);
                break;
            case TYPE_GAME.CHRISTMAS:
                await this.InitMapChirst();
                this.ChangeStateGame(STATE_GAME.OPENING);
                break;
        }
    }

    private async LoadMapGameBase(dataMap: JsonMapGame, levelRead: number, idLinePassInit: number, cbShowTarget: CallableFunction = null) {
        // console.log("LoadMapGameBase", dataMap, levelRead);
        switch (true) {
            case GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL && dataMap.Time != null && dataMap.Time > 0:
                this._isHasTime = true;
                this.headerInGameSys.ChangeTime(dataMap.Time);
                GameInfoSys.Instance._autoTimeInGameSys.SetUpTime(0);
                break;
            case GameManager.Instance.TypeGamePlay == TYPE_GAME.TOURNAMENT && dataMap.Time != null && dataMap.Time > 0:
                this.headerInGameSys.ChangeTime(0);
                GameInfoSys.Instance._autoTimeInGameSys.SetUpTime(0);
                break;
            case GameManager.Instance.TypeGamePlay == TYPE_GAME.WITH_FRIEND:
                this.headerInGameSys.ChangeTime(0);
                GameInfoSys.Instance._autoTimeInGameSys.SetUpTime(0);
                break;
            default:
                this.headerInGameSys.HideTime();
                GameInfoSys.Instance._autoTimeInGameSys.SetUpTime(0);
                break;
        }

        // tạo một danh sách rootDataMapCarInfo
        // danh sách sẽ bao gồm cả xe trên sân và xe trong gara và xe trong băng truyền
        let rootDatamapCarInfo: JsonCar[] = Array.from(dataMap.CarInfo);
        rootDatamapCarInfo.push(...dataMap.GarageInfo.map(infoGara => infoGara.cars).flat());
        rootDatamapCarInfo.push(...dataMap.ConveyorBeltInfo.map(infoGara => infoGara.cars).flat());

        // console.log(rootDatamapCarInfo);

        // sort the data through the id car
        rootDatamapCarInfo.sort((a, b) => a.idCar - b.idCar);

        dataMap.CarInfo = ReSiblingJsonCar(dataMap.CarInfo);

        // set visual item in here
        await this.listParkingCarSys.SetUp(dataMap.ParkingSpaceInit, this.nGate.worldPosition.clone());

        // gen ground car
        let isMapFrenzy: boolean = false;
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.CHRISTMAS:
                isMapFrenzy = true;
                break;
            default:
                isMapFrenzy = levelRead == 14 || levelRead >= 20;
                break;
        }
        await this.groundCarSys.SetUp(dataMap, this.queueCarCanMoveToGateSys,
            this.listParkingCarSys.GetNParkingCarByStateParking.bind(this.listParkingCarSys),
            this.listParkingCarSys.GetNParkingCarById.bind(this.listParkingCarSys),
            this.listParkingCarSys.GetNParkingCarVipSlot.bind(this.listParkingCarSys),
            isMapFrenzy
        );

        // init passenger 
        const dataPassenger: number[] = dataMap.GuestColor;
        GameUISys.Instance.SetGamePreparePlayNormal(dataPassenger.length);

        let mapPassenger: number[] = dataPassenger;
        mapPassenger = LogicGenPassenger2(dataMap.Group, Array.from(rootDatamapCarInfo), JSON.parse(JSON.stringify(dataMap.GuestColor)),
            GameManager.Instance.JsonPlayGame.NUM_LOSE,
            DataInfoPlayer.Instance.WasBoughIAP()
        );

        const dataInitPassenger: JsonPassenger[] = mapPassenger.map((color: number) => MConfigs.ConvertDataToJsonPassenger(color));
        await this.listPassengerSys.Init(this.queueCarCanMoveToGateSys, dataInitPassenger, idLinePassInit);

        cbShowTarget && await cbShowTarget();

        // init id for debug pass
        dataInitPassenger.forEach((pass, index) => pass.id = index);

        // move crew
        let listPromisePassMove: Promise<void>[] = [];
        switch (GameManager.Instance.TypeGamePlay) {
            // case TYPE_GAME.CHRISTMAS:
            //     listPromisePassMove.push(this.listPassengerSys.MoveTheCrewForward_open_christ(MConfigs.speedPassMoveWhenInitGame));
            //     break;
            default:
                listPromisePassMove.push(this.listPassengerSys.MoveTheCrewForward(MConfigs.speedPassMoveWhenInitGame));
                break;
        }
        await Promise.all(listPromisePassMove);

        // register click for car mystery
        this.groundCarSys.RegisterClickCarMystery();
    }

    private _loadMapFirstTime: boolean = false;
    private async InitMapNormal() {
        // let listPass = [];
        // for (let i = 1; i <= MConfigs.MAX_LEVEL_NORMAL; i++) {
        //     // log data
        //     const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromJson(i);
        //     listPass.push(dataMap.GuestColor.length);
        // }
        // console.log(...listPass);
        let levelRead = MConfigs.GetLevelGame(GameManager.Instance.JsonPlayGame.LEVEL);
        // console.log("level game:", levelRead);
        const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
        this.uiOpeningGame.SetUpPrepare_Anim_TargetFirstGame(dataMap.GuestColor.length);

        await this.RegisterPoolSubVisualCar(dataMap);

        const maxPlaceStandPass = this.listPassengerSys.LineUsing.GetMaxPlaceStand();
        const timeShowTarget = this.uiOpeningGame.GetTimeAnim_TargetFirstGame() + this.uiOpeningGame.GetTimeWaitShowOpening();
        const timeWaitToInitShowUIOpening = MConfigs.speedPassMoveWhenInitGame * (maxPlaceStandPass - 2) + timeShowTarget;
        // opening UI
        (async () => {
            await Utils.delay(timeWaitToInitShowUIOpening * 1000);

            // ========== check lv to init tut =============
            switch (GameManager.Instance.JsonPlayGame.LEVEL) {
                case 2:
                    // init tut for level 2
                    this.InitTutForGameNormalLv2();
                    break;
            }

            // =============== show UIOpening ==============
            this.ShowUIOpening();
        })();

        await this.LoadMapGameBase(dataMap, levelRead, 0,
            async () => {
                // show delay first
                if (!this._loadMapFirstTime) {
                    this._loadMapFirstTime = true;
                    await Utils.delay(this.uiOpeningGame.GetTimeWaitShowOpening() * 1000);
                }

                // show warning
                const typeLevelGame = MConfigs.GetTypeLevel(GameManager.Instance.JsonPlayGame.LEVEL);
                if (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL && (typeLevelGame == TYPE_LEVEL_NORMAL.HARD || typeLevelGame == TYPE_LEVEL_NORMAL.SUPER_HARD)) {
                    await this.uiOpeningGame.PlayAnim_WarningHardLevel();
                }

                // show target first game
                this.uiOpeningGame.SetUpPrepare_Anim_TargetFirstGame(this.listPassengerSys.GetTotalPassenger())
                await this.uiOpeningGame.PlayAnim_TargetFirstGame();
                GameUISys.Instance.uiSignUpNumPassenger.ShowNumPassenger();
            });
    }

    private async InitMapWithFriend() {
        let levelRead = MConfigs.GetLevelGame(DataInfoPlayer.Instance.currWithFriendDataInfo.level);
        const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
        this.uiOpeningGame.SetUpPrepare_Anim_TargetFirstGame(dataMap.GuestColor.length);

        this.RegisterPoolSubVisualCar(dataMap);

        const maxPlaceStandPass = this.listPassengerSys.LineUsing.GetMaxPlaceStand();
        const timeWaitToInitShowUIOpening = MConfigs.speedPassMoveWhenInitGame * (maxPlaceStandPass - 2);
        // opening UI
        (async () => {
            await Utils.delay(timeWaitToInitShowUIOpening * 1000);
            this.ShowUIOpening();
        })();


        await this.LoadMapGameBase(dataMap, levelRead, 0);
    }

    private async InitMapDailyChallenge() {
        // read map data in here
    }

    private async InitMapTutorial() {
        const maxPlaceStandPass = this.listPassengerSys.LineUsing.GetMaxPlaceStand();
        // NOTE : ta cần phải set up số lượng passenger trước khi gọi lấy thời gian anim target first game
        this.uiOpeningGame.SetUpPrepare_Anim_TargetFirstGame(24);  // NOT GOOD
        const timeAnimTarget = this.uiOpeningGame.GetTimeAnim_TargetFirstGame() + this.uiOpeningGame.GetTimeWaitShowOpening();
        const timeWaitToInitTut = MConfigs.speedPassMoveWhenInitGame * (maxPlaceStandPass - 2) + timeAnimTarget;

        // init tut for game
        (async () => {
            await Utils.delay(timeWaitToInitTut * 1000);
            this.InitTutForGameTutorial();
        })();

        // read map data in here
        await this.InitMapNormal();

    }

    private async InitMapChirst() {
        let levelRead = GetLevelChristGame(GameManager.Instance.JsonPlayChristmas.LEVEL);
        MConfigs.GetLevelGame(GameManager.Instance.JsonPlayGame.LEVEL);
        const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromJson(levelRead, 'christ');
        this.RegisterPoolSubVisualCar(dataMap);

        const maxPlaceStandPass = this.listPassengerSys.LineUsing.GetMaxPlaceStand();
        const timeShowTarget = this.uiOpeningGame.GetTimeAnim_TargetFirstGame() + this.uiOpeningGame.GetTimeWaitShowOpening();
        const timeWaitToInitShowUIOpening = MConfigs.speedPassMoveWhenInitGame * (maxPlaceStandPass - 2) + timeShowTarget;;
        // opening UI
        (async () => {
            await Utils.delay(timeWaitToInitShowUIOpening * 1000);
            this.ShowUIOpening();
        })();

        await this.LoadMapGameBase(dataMap, levelRead, 0,
            async () => {
                // show delay first
                if (!this._loadMapFirstTime) {
                    this._loadMapFirstTime = true;
                    await Utils.delay(this.uiOpeningGame.GetTimeWaitShowOpening() * 1000);
                }

                // show target first game
                this.uiOpeningGame.SetUpPrepare_Anim_TargetFirstGame(this.listPassengerSys.GetTotalPassenger(), 'christ');
                await this.uiOpeningGame.PlayAnim_TargetFirstGame();
                GameUISys.Instance.uiSignUpNumPassenger.ShowNumPassenger();
            }
        );
    }

    private async InitMapTournament() {
        // console.log("InitMapTournament");
        // console.log(GameManager.Instance.JsonPlayTournament.LEVEL);
        // console.log(GameManager.Instance.ModeGame.TOURNAMENT);
        let levelRead = MConfigs.GetLevelGame(GameManager.Instance.ModeGame.TOURNAMENT.levels[GameManager.Instance.JsonPlayTournament.LEVEL - 1]);
        const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
        this.uiOpeningGame.SetUpPrepare_Anim_TargetFirstGame(dataMap.GuestColor.length);

        this.RegisterPoolSubVisualCar(dataMap);

        let maxPlaceStandPass = 0;
        maxPlaceStandPass = this.listPassengerSys.LineUsing.GetMaxPlaceStand();
        const timeWaitToInitShowUIOpening = MConfigs.speedPassMoveWhenInitGame * (maxPlaceStandPass - 2);
        // opening UI
        (async () => {
            await Utils.delay(timeWaitToInitShowUIOpening * 1000);
            this.ShowUIOpening();
        })();

        await this.LoadMapGameBase(dataMap, levelRead, 0);
    }

    private async NextMapTournament() {
        // console.log("NextMapTournament");
        if (GameManager.Instance.JsonPlayTournament.LEVEL < GameManager.Instance.ModeGame.TOURNAMENT.levels.length) {
            GameManager.Instance.JsonPlayTournament.LEVEL++;

            GameUISys.Instance.groupInfoTournament.initTournament();

            // console.log(GameManager.Instance.JsonPlayTournament.LEVEL);
            // console.log(GameManager.Instance.ModeGame.TOURNAMENT);
            this.ResetGame(false);
            // let levelRead = GameManager.Instance.ModeGame.TOURNAMENT.levels[GameManager.Instance.JsonPlayTournament.LEVEL -1];
            // const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromJson(levelRead);

            // await this.LoadMapGameBase(dataMap, levelRead);
            // this.ChangeStateGame(STATE_GAME.OPENING);
        } else {
            // console.log("Finish Tournament");
            let timePlay: number = this.headerInGameSys.timeInGameTournamentSys.GetTimeTournament();
            const contextIdTournament: string = GameManager.Instance.ModeGame.TOURNAMENT.context_tournament;
            DataLeaderboardSys.Instance.UpdateScoreTournament(-timePlay, contextIdTournament);
            let jsonCustom = {
                score: timePlay
            }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_WIN_TOURNAMENT, 2, true, jsonCustom);
        }
    }

    private async RegisterPoolSubVisualCar(dataMap: JsonMapGame) {
        // check in case is car need sub visual => try register it in pool
        // loop all car on ground <now in game we just need load on ground is enough> if after that it need more => you can add code to check more here

        const dataInfoSup = MConfigResourceUtils.CheckSupCar(dataMap);

        async function InitPool(nameSupViCar: NAME_SUP_VI_CAR) {
            const pfSub = await MConfigResourceUtils.GetPfSupVisualCar(nameSupViCar);
            if (pfSub == null || PoolGameSys.Instance == null) { return; }
            const poolSup = new Pool(() => instantiate(pfSub), 0);
            PoolGameSys.Instance.RegisterPool(nameSupViCar, poolSup);
        }

        let listPromise = [];
        if (dataInfoSup.isHasCarPolice) { listPromise.push(InitPool(NAME_SUP_VI_CAR.POLICE)); }
        if (dataInfoSup.isHasCarMiliTary) { listPromise.push(InitPool(NAME_SUP_VI_CAR.MILITARY)); }
        if (dataInfoSup.isHasCarAmbulance) { listPromise.push(InitPool(NAME_SUP_VI_CAR.AMBULANCE)); }
        if (dataInfoSup.isHasFireTruck) { listPromise.push(InitPool(NAME_SUP_VI_CAR.FIRE_TRUCK)); }
        if (dataInfoSup.isHasCarLock) { listPromise.push(InitPool(NAME_SUP_VI_CAR.LOCK_CAR)); }
        if (dataInfoSup.isHasCarTwoWay) { listPromise.push(InitPool(NAME_SUP_VI_CAR.TWO_WAY_CAR)); }

        await Promise.all(listPromise);
    }

    //#endregion self func

    //#region common func
    public GetStateGame(): STATE_GAME {
        return this._stateGame;
    }
    //#endregion common func

    //#region check watchAds buy item
    private _isWatchAdsBuyItem: boolean[] = [false, false, false];
    private _isWatchAdsContinue: boolean = false;
    private _isWatchAdsUnlockSpot: boolean = false;
    public CheckWatchedAdsBuyItem(typeItem: TYPE_ITEM): boolean {
        switch (typeItem) {
            case TYPE_ITEM.SORT: return this._isWatchAdsBuyItem[0];
            case TYPE_ITEM.SHUFFLE: return this._isWatchAdsBuyItem[1];
            case TYPE_ITEM.VIP_SLOT: return this._isWatchAdsBuyItem[2];
        }
    }

    public CheckWatchedAdsContinue() {
        return this._isWatchAdsContinue;
    }

    public CheckWatchedAdsUnlockSpot() {
        return this._isWatchAdsUnlockSpot;
    }

    public SetWatchedAdsBuyItem(typeItem: TYPE_ITEM) {
        switch (typeItem) {
            case TYPE_ITEM.SORT: this._isWatchAdsBuyItem[0] = true; break;
            case TYPE_ITEM.SHUFFLE: this._isWatchAdsBuyItem[1] = true; break;
            case TYPE_ITEM.VIP_SLOT: this._isWatchAdsBuyItem[2] = true; break;
        }
    }

    public SetWatchedAdsContinue() {
        return this._isWatchAdsContinue = true;
    }

    public SetWatcedAdsUnlockSpot() {
        return this._isWatchAdsUnlockSpot = true;
    }
    //#endregion check watchAds buy item


    private async GetInfoMapForCheckTut(): Promise<{ hasCarLock: boolean, hasCarTwoWay: boolean, hasAmbulance: boolean, hasFireTruck: boolean, hasPolice: boolean, hasMilitary: boolean }> {
        let levelInput = 0;
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL: levelInput = GameManager.Instance.JsonPlayGame.LEVEL; break;
            case TYPE_GAME.WITH_FRIEND: levelInput = DataInfoPlayer.Instance.currWithFriendDataInfo.level; break;
            case TYPE_GAME.TOURNAMENT: levelInput = GameManager.Instance.ModeGame.TOURNAMENT.levels[0]; break;
        }
        let levelRead = MConfigs.GetLevelGame(levelInput);
        const dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
        const hasCarLock = (dataMap.CarInfo.findIndex((v, i) => v.idCarKeyOfCarLock != null && v.idCarKeyOfCarLock >= 0)) >= 0
        const hasCarTwoWay = (dataMap.CarInfo.findIndex((v, i) => v.isTwoWayCar != null && v.isTwoWayCar)) >= 0
        const hasCarAmbulance = (dataMap.CarInfo.findIndex((v, i) => { const mColorCar = GetMColorByNumber(v.carColor); return mColorCar == M_COLOR.AMBULANCE })) >= 0;
        const hasFireTruck = (dataMap.CarInfo.findIndex((v, i) => { const mColorCar = GetMColorByNumber(v.carColor); return mColorCar == M_COLOR.FIRE_TRUCK })) >= 0;
        const hasPolice = (dataMap.CarInfo.findIndex((v, i) => { const mColorCar = GetMColorByNumber(v.carColor); return mColorCar == M_COLOR.POLICE })) >= 0;
        const hasMilitary = (dataMap.CarInfo.findIndex((v, i) => { const mColorCar = GetMColorByNumber(v.carColor); return mColorCar == M_COLOR.MILITARY })) >= 0;

        return {
            hasCarLock: hasCarLock,
            hasCarTwoWay: hasCarTwoWay,
            hasAmbulance: hasCarAmbulance,
            hasFireTruck: hasFireTruck,
            hasPolice: hasPolice,
            hasMilitary: hasMilitary
        }
    }
}

function ReSiblingJsonCar(data: JsonCar[]): JsonCar[] {
    data.sort((a, b) => {
        const aPos = a.carPosition;
        const bPos = b.carPosition;

        // Sắp xếp theo trục y trước (TopLeft là y lớn hơn), sau đó theo trục x (x nhỏ hơn sẽ ở trước)
        if (aPos.y !== bPos.y) {
            return bPos.y - aPos.y;  // y lớn hơn sẽ được xếp trước
        } else {
            return aPos.x - bPos.x;  // x nhỏ hơn sẽ được xếp trước
        }
    });
    return data;
}
