import { _decorator, Component, director, Node, resources, Sprite, SpriteComponent, screen, sys, tween, Prefab, instantiate, Tween, utils, macro, Canvas, ProgressBar, Vec3, game, CCBoolean } from 'cc';
import { PlayerData } from '../../Utils/PlayerData';
import { MConfigs, TYPE_GAME } from '../../Configs/MConfigs';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { ChangeSceneSys } from '../../Common/ChangeSceneSys';
import { FBInstantManager } from '../../Utils/facebooks/FbInstanceManager';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { MConsolLog } from '../../Common/MConsolLog';
import { TutorialSys } from '../TutorialSys';
import { DataEventsSys } from '../DataEventsSys';
import { ReadDataJson, ReadJsonOptimized } from '../../ReadDataJson';
import { DataLobbyJsonSys } from '../DataLobbyJsonSys';
import { DataLeaderboardSys } from '../DataLeaderboardSys';
import { ClockGameSys } from '../../ClockGameSys';
import { CaculTimeEvents2 } from '../LobbyScene/CaculTimeEvents2';
import { GameManager } from '../GameManager';
import { SoundSys } from '../../Common/SoundSys';
import { JSON_GAME_MANAGER_TOUR, LANGUAGE, M_COLOR, TYPE_CURRENCY, TYPE_EVENT_GAME, TYPE_GAME_PLAY_TOURNAMENT, TYPE_QUEST_DAILY } from '../../Utils/Types';
import { IDataLeaderboardByContextIds, IDataTourFromServer, IInfoLeaderboardByContextId, ServerPegasus } from '../../Utils/server/ServerPegasus';
import { ConfigLogEvent } from '../../LogEvent/ConfigLogEvent';
import { LogEventManager } from '../../LogEvent/LogEventManager';
import { ResourceUtils } from '../../Utils/ResourceUtils';
import { ReadMapJson } from '../../MJson/ReadMapJson';
import { Utils } from '../../Utils/Utils';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { DataItemSys } from '../DataItemSys';
import { LanguageManager_i18n } from '../../Languege/LanguageManager_i18n';
import { CurrencySys } from '../CurrencySys';
import { DataPackSys } from '../../DataBase/DataPackSys';
import { DataSpinSys } from '../../DataBase/DataSpinSys';
import { DataSeasonPassSys } from '../../DataBase/DataSeasonPassSys';
import { DataLoginRewardSys } from '../../DataBase/DataLoginRewardSys';
import { DataLevelPassSys } from '../../DataBase/DataLevelPassSys';
import { PrizeSys } from '../../DataBase/PrizeSys';
import { DataBuildingSys } from '../../DataBase/DataBuildingSys';
import { DataInfoPlayer } from '../DataInfoPlayer';
import { DataFriendJoinedSys } from '../../DataBase/DataFriendJoinedSys';
import { DataShopSys } from '../DataShopSys';
import { DataTrailsSys } from '../../DataBase/DataTrailsSys';
import { DataDailyQuestSys } from '../../DataBase/DataDailyQuestSys';
import { DataLogEventSys } from '../../LogEvent/DataLogEventSys';
import { DataWeeklySys } from '../../DataBase/DataWeeklySys';
import { DataPiggySys } from '../../DataBase/DataPiggySys';
import { DataDashRush } from '../DataDashRush';
import { DataSpeedRace } from '../../DataBase/DataSpeedRace';
import { DataEndlessTreasureSys } from '../../DataBase/DataEndlessTreasureSys';
import { DataLevelProgressionSys } from '../../DataBase/DataLevelProgressionSys';
import { DataTreasureTrailSys } from '../../DataBase/DataTreasureTrailSys';
import { DataSkyLiftSys } from '../../DataBase/DataSkyLiftSys';
import { RegisterKeyBoard } from '../../Cheat/RegisterKeyBoard';
import { DataHalloweenSys } from '../../DataBase/DataHalloweenSys';
import { DataPackBlackFriday } from '../../DataBase/DataPackBlackFriday';
import { DataChristmasSys } from '../../DataBase/DataChristmasSys';
import { DataLightRoad_christ } from '../../DataBase/DataLightRoad_christ';
import { DataHatRace_christ } from '../../DataBase/DataHatRace_christ';
import { GlobalErrorHandler } from '../../BuildGame/Utils/CatchBug';
import { PokiSDKManager } from '../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

@ccclass('LoadingSceneSys')
export class LoadingSceneSys extends Component {
    @property(Sprite) spPB: Sprite;
    @property(CCBoolean) activeHlw: boolean = false;
    @property(CCBoolean) activeChirstmas: boolean = false;
    @property(CCBoolean) activeBlackFridays: boolean = false;
    @property(CCBoolean) isCheat: boolean = false;
    // @property(Prefab) prefabCanvasLoading: Prefab;

    private isPreloadSceneDone: boolean = false;
    private prepareLoadBundleDone: boolean = false;
    private checkTournamentDone: boolean = true;
    private checkPlayWithFriendDone: boolean = true;    // false
    private loadLanguageDone: boolean = true;           // false

    private dataOpponent: any;

    private readonly MAX_TIME_LOAD_SCENE = 10;
    private URLCanvas2 = "/Prefabs/Others/Canvas2";

    private callbackCheckIsNewUser: boolean = false;
    private loadBundleDone: boolean = false;

    private _jsonTourManager: JSON_GAME_MANAGER_TOUR = null;

    private _dataCustomSceneLobby: any = null;

    protected onLoad(): void {

        //#region Init data
        /**
         * ===============================================
         * B1: YOU can init Data Game in here
         * - the code below is example for init data
         */
        new PlayerData();
        new GameManager();
        new ClockGameSys();
        new ChangeSceneSys();
        new TutorialSys();
        new CurrencySys();
        new CaculTimeEvents2();
        new DataEventsSys();
        new PrizeSys();
        new ReadDataJson();
        new DataLobbyJsonSys();
        new DataLeaderboardSys();
        new GameManager();
        new ReadMapJson();
        new DataItemSys();
        new DataPackSys();
        new DataSpinSys();
        new DataSeasonPassSys();
        new DataLoginRewardSys();
        new DataLevelPassSys();
        new DataDailyQuestSys();
        new DataBuildingSys();
        new DataInfoPlayer();
        new DataFriendJoinedSys();
        new DataShopSys();              // this class used for get id bundle special like season pass , level pass
        new DataTrailsSys();
        new DataLogEventSys();
        new DataWeeklySys();
        new DataPiggySys();
        new DataDashRush();
        new DataSpeedRace();
        new DataEndlessTreasureSys();
        new DataLevelProgressionSys();
        new DataTreasureTrailSys();
        new DataSkyLiftSys();
        new DataHalloweenSys();
        new DataPackBlackFriday();
        new DataChristmasSys();
        new DataLightRoad_christ();
        new DataHatRace_christ();

        // support game
        GlobalErrorHandler.init();

        DataHalloweenSys.Instance.ForceChangeActivePack = !this.activeHlw;

        if (this.isCheat) {
            new RegisterKeyBoard();
            RegisterKeyBoard.Instance.RegisterForCheat();
        }
        /**
         * ===============================================
         */
        //#endregion Init data

        // get bot friend
        MConfigs.dataBotFriend = MConfigs.getTempListFriends();

        // clientEvent.on(MConst.PLAYFAB_REMOTE_CONFIG_SUCCESS, this.Config_Playfab_Success, this);
        clientEvent.on(MConst.FB_NOT_FOUND_DATA_SAVE, this.CheckCaseNeverPlayGame, this);           // this event will call first fb_ready_load
        clientEvent.on(MConst.POKI_INIT_SUCCESS, this.FBLoadDone, this);                                // this event call after fb not found data save
    }


    protected onDisable(): void {
        // clientEvent.off(MConst.PLAYFAB_REMOTE_CONFIG_SUCCESS, this.Config_Playfab_Success, this);
        clientEvent.off(MConst.POKI_INIT_SUCCESS, this.FBLoadDone, this);
        clientEvent.off(MConst.FB_NOT_FOUND_DATA_SAVE, this.CheckCaseNeverPlayGame, this);
    }


    @property(Node) bg: Node = null;
    protected async start() {
        DataLogEventSys.Instance.SetSplashStartTime(Utils.getSecondNow());
        // console.log(screen.windowSize.width, screen.windowSize.height);
        // #region preload scene
        //==============================================================
        // load scene game
        // director.preloadScene(MConst.NAME_SCENE.LOBBY,
        //     (completeCount, totalCount, item) => {
        //         // console.log("lobby:", completeCount, totalCount);
        //     }, (err, screen) => {
        //         this.isPreloadSceneDone = true;
        //         this.MoveToNextScene();
        //         // pre load game scene

        //     });

        // director.preloadScene(MConst.NAME_SCENE.GAME, (completeCount, totalCount, item) => {
        //     // console.log("game:", completeCount, totalCount);
        // }, (err, screen) => {

        // });
        //==============================================================
        // #endregion preload scene

        // #region tween progress
        //==============================================================
        this.spPB.fillRange = 0;
        const self = this;
        tween(this.spPB.node)
            .to(this.MAX_TIME_LOAD_SCENE, {}, {
                onUpdate(target, ratio) {
                    self.spPB.fillRange = ratio * 0.99;
                },
            })
            .start();
        //==============================================================
        // #endregion tween progress

        // #region load local or server base on test server or not
        //==============================================================
        // if (ServerPegasus.Instance.isTest) {
        //     PlayerData.Instance.ReadDataLocal();
        // }
        PlayerData.Instance.ReadDataLocal();
        //==============================================================
        // #endregion load local or server base on test server or not

        // #region language
        //==============================================================
        LanguageManager_i18n.Instance.setLanguage(LANGUAGE.EN);
        // LanguageManager.Instance.loadConfig2(() => { this.loadLanguageDone = true; });
        //==============================================================
        // #endregion language


        // #region init canvas 2
        //==============================================================
        // let canvas = instantiate(await ResourceUtils.loadPrefab(this.URLCanvas2));
        // canvas.setParent(director.getScene());
        //==============================================================
        // #endregion init canvas 2

        // #region load bundle + UI
        //==============================================================
        // this.loadBundle();
        // clientEvent.dispatchEvent(MConst.EVENT.START_LOAD_UI_RESOURCE);
        this.loadBundleNew();
        //==============================================================
        // #endregion load bundle + UI

        //#region update cheat
        DataBuildingSys.Instance.UpdateCheat();
        //#endregion update cheat
    }

    // #region func load bundle
    // private async loadBundle() {
    //     let loadBundle = new Promise<void>(async resolve => {
    //         await ResourceUtils.loadBundler(MConst.BUNDLE_RESOURCES);
    //         await ResourceUtils.loadBundler(MConst.BUNDLE_GAME);
    //         await ResourceUtils.loadBundler(MConst.BUNDLE);

    //         MConfigResourceUtils.LoadImageItems();
    //         MConfigResourceUtils.LoadImageItemsBig();
    //         // load event
    //         MConfigResourceUtils.LoadSeasonPass();
    //         resolve();
    //     })

    //     // await load bundle game + lobby
    //     await Promise.all([
    //         ResourceUtils.loadBundler(MConst.BUNDLE),
    //         ResourceUtils.loadBundler(MConst.BUNDLE_MAP_LOBBY),
    //         await loadBundle,
    //     ])

    //     this.prepareLoadBundleDone = true;
    // }

    private loadBundleNew() {
        Promise.all([
            ResourceUtils.loadBundler(MConst.BUNDLE_RESOURCES),
            ResourceUtils.loadBundler(MConst.BUNDLE_GAME),
            this.activeHlw && ResourceUtils.loadBundler(MConst.BUNDLE_HALLOWEEN),
            this.activeChirstmas && ResourceUtils.loadBundler(MConst.BUNDLE_CHIRSTMAS),
            FBInstantManager.Instance.Test && ResourceUtils.loadBundler(MConst.BUNDLE),
            ResourceUtils.loadBundler(MConst.BUNDLE_MAP_LOBBY),
            ResourceUtils.loadBundler(MConst.BUNDLE_EFFECT),
            ResourceUtils.loadBundler(MConst.BUNDLE_SOUND),
            ResourceUtils.loadBundler(MConst.BUNDLE_SCENES),
        ]).then(values => {
            // console.log(values);
            // this.preloadUI();
            this.preloadScenes();
            this.prepareLoadBundleDone = true;
            this.MoveToNextScene();
        });
    }

    // private preloadUI() {
    //     // console.log("preloadUIpreloadUIpreloadUIpreloadUIpreloadUI");
    //     let arrPromises = [];
    //     for (let i = 0; i < MConst.PATH.DIRECT_UI.length; i++) {

    //         let typeUI = MConst.PATH.DIRECT_UI[i];
    //         // console.log("Start:",typeUI.toString())
    //         arrPromises.push(ResourceUtils.loadPrefabUI(MConst.PATH.ROOT_PATH_UI + typeUI, (prefab) => {
    //             //    console.log("Finished:",typeUI.toString());                
    //         }));
    //     }

    //     arrPromises.push(MConfigResourceUtils.PreloadItemBig());
    //     arrPromises.push(MConfigResourceUtils.PreloadItemSmall());

    //     Promise.all(arrPromises).then((content) => {
    //         console.log(content);
    //     });
    // }

    private preloadScenes() {
        let arrPromises = [];
        // arrPromises.push(ResourceUtils.preLoadSceneBundle(MConst.NAME_SCENE.LOBBY, MConst.BUNDLE_SCENES, () => {
        //     console.log("Finished:", MConst.NAME_SCENE.LOBBY);
        // }));
        // arrPromises.push(ResourceUtils.preLoadSceneBundle(MConst.NAME_SCENE.GAME, MConst.BUNDLE_SCENES, () => {
        //     console.log("Finished:", MConst.NAME_SCENE.GAME);
        // }));
        // Promise.all(arrPromises).then((content) => {
        //     console.log(content);
        // });
    }


    private wasCalledLoadImageBlockAndBgFromBundle: boolean = false;
    /**
     * YOU must wait call fb done and load bundle done to load resources
     * because you will need data in PlayerData to know which bundle player is using
     */
    private async loadAssetNeedDataPlayer() {
        // console.log("check load asset need data player", this.prepareLoadBundleDone, this.fb_load_done, this.wasCalledLoadImageBlockAndBgFromBundle);

        if (this.prepareLoadBundleDone && this.fb_load_done && !this.wasCalledLoadImageBlockAndBgFromBundle) {
            this.wasCalledLoadImageBlockAndBgFromBundle = true;
            this.unschedule(this.loadAssetNeedDataPlayer);

            // /**
            // * Có thể sau sẽ chỉnh lại là sẽ chỉ load bundle game hoặc chỉ bundle map lobby không thôi
            // * Tuy nhiên hãy cân nhắc thật kĩ vì còn một vài trường hợp đặc biệt có thể xảy ra đó là người chơi 
            // *  +) Vào từ tournament
            // *  +) Chơi lần đầu tiên
            // *  +) Vào từ lời mời bạn bè
            // */
            // await Promise.all([
            //     // in game
            //     await MConfigResourceUtils.LoadImageMapLobby(PlayerData.Instance._levelPlayer),
            // ]);

            this.loadBundleDone = true;
            this.MoveToNextScene();
        }
    }
    // #endregion func load bundle

    // #region func listen event
    private CheckCaseNeverPlayGame(isNewUser: boolean) {
        /**
         * ** WARNING **
         * Not delete the code below
         * because we need save the data for new user
         */
        if (isNewUser) {
            PlayerData.Instance.Save()
        }

        GameManager.Instance.SetNewPlayer(isNewUser);
        this.callbackCheckIsNewUser = true;
        this.MoveToNextScene();
    }
    // #endregion func listen event

    // #region func FB load
    private fb_load_done: boolean = false;
    private FBLoadDone() {
        try {
            if (this.fb_load_done) return;
            this.fb_load_done = true;

            let needSaveData: boolean = false;

            const versionNow = PlayerData.Instance._version;

            //wait load done bundle
            this.schedule(this.loadAssetNeedDataPlayer, 1, macro.REPEAT_FOREVER, 0.1);

            // ================================================================
            //#region check is play with friend
            // this.CheckCurrentContextPlayWithFriend();
            //#endregion check is play with friend

            // ================================================================
            // #region Init data
            // Such as Init Bot for game , check life for player , read json game

            //#region DataPacks
            // DataPackSys.Instance.registerClockGame();
            DataPackSys.Instance.GetInfoPackFirstGame();
            //#endregion DataPacks

            if (Utils.isLowerVersion(versionNow, '1.5.2')) {
                // force update time seasonPass because you change the time
                const timeMaxEventSPLowerVersion = 60 * 60 * 24 * 14;
                const timeRemainEndEvent = CaculTimeEvents2.Instance.GetTimeEventBeforeInitEvent(TYPE_EVENT_GAME.SEASON_PASS, timeMaxEventSPLowerVersion);
                if (timeRemainEndEvent > 0 && timeRemainEndEvent < timeMaxEventSPLowerVersion) {
                    CaculTimeEvents2.Instance.ForceChangeTimeEvent(TYPE_EVENT_GAME.SEASON_PASS, timeRemainEndEvent);
                }
            }

            DataShopSys.Instance.CheckCanResetCoinFree();

            DataFriendJoinedSys.Instance.CheckCheatInvite();

            DataDashRush.Instance.TryUpdateDataPlayerInList();
            DataSpeedRace.Instance.TryUpdateDataPlayerInList();
            DataEndlessTreasureSys.Instance.TryUpdateDataPack();

            DataDailyQuestSys.Instance.GetListInfoItemDailyQuest();
            DataItemSys.Instance.ReadItemFromData();
            DataEventsSys.Instance.UpdateStateForEvent();
            DataEventsSys.Instance.InitListGroupEvents();

            // LifeSys2.Instance.SetUp(DataTilePassSys.Instance.IsActivePass() && DataTilePassSys.Instance.IsClaimPrizeAtLevel(0).premium && !CheatingSys.Instance.IsAutoReset8Life);


            /**
             * - Sẽ tùy vào từng trường hợp và logic của game mà đoạn code ở dưới sẽ thay đổi cho phù hợp
             * trong game này số tiền nhận thưởng sau khi qua một màn sẽ không được tự động lưu trong dữ liệu 
             * do đó cần phải manual update ở đoạn code này vì khi vào lobby ta skip anim nhận thưởng => mất phần thưởng
             * - building cũng tương tự coin
             * - Còn những đối tượng khác chưa check lại logic nên xin hãy note lại khi nào check lại dữ liệu
            */
            // Xin hãy đọc thêm đoạn chú thích cho function này để thêm chắc chắn trong quyết định sử dụng code dưới
            // // save json for lobby => this code below often used for receive prize that player not receive yet
            // DataLobbyJsonSys.Instance.SaveDataLobbyJson(
            //     PlayerData.Instance._starsEarned,
            //     PlayerData.Instance._levelPlayer,
            //     DataTileRushSys.Instance.getProgressNow(),
            //     PlayerData.Instance._infoEventTileChallenge.timeGen,
            //     PlayerData.Instance._infoEventTileChallenge.isEnd ? 0 : PlayerData.Instance._infoEventTileChallenge.progress,
            //     PlayerData.Instance._infoEventTilePass.progress,
            // )

            needSaveData = DataLobbyJsonSys.Instance.CheckDataLobbyAtLoad(
                (numCoin: number) => { CurrencySys.Instance.AddMoney(numCoin, 'passLevel_InLoading', false); },
                (numBuilding: number) => { DataBuildingSys.Instance.AddBlock(numBuilding, false); }
            )

            const progressLevelProgressNow = DataLevelProgressionSys.Instance.GetProgressNow();
            if (DataLobbyJsonSys.Instance.GetNumLevelProgress() < progressLevelProgressNow) {
                DataLobbyJsonSys.Instance.SaveLevelProgression(progressLevelProgressNow, false);
                needSaveData = true;
            }

            // update weekly id save
            DataWeeklySys.Instance.CompareAndUpdateSaveWeekly(false);

            // try update pack lose
            DataPackSys.Instance.TryResetAllPackLose(false);
            DataPackSys.Instance.UpdateLocalDataPack();

            // levelProgress
            const isPlayTutStateEvent = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
            DataLevelProgressionSys.Instance.UpdateStateEvent(isPlayTutStateEvent);

            // treasure trail
            DataTreasureTrailSys.Instance.UpdateStateEventFromLoad(DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.TREASURE_TRAIL));

            // sky lift
            DataSkyLiftSys.Instance.UpdateStateEventFromLoad(DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SKY_LIFT));

            // pack halloween
            try {
                DataHalloweenSys.Instance.LoadPackFirstTime(false);
            } catch (e) {
                LogEventManager.Instance.logTriggerBug(MConfigFacebook.Instance.playerID, e.code, e.message, 'loading_hlw_1');
            }

            // pack black friday
            try {
                if (this.activeBlackFridays) {
                    const needSaveDataCachePackBlackFriday = DataPackBlackFriday.Instance.InitPackCache()
                    if (needSaveDataCachePackBlackFriday) { needSaveData = true; }
                }
            } catch (e) {
                LogEventManager.Instance.logTriggerBug(MConfigFacebook.Instance.playerID , e.code, e.message, 'loading_blw_1');
            }


            //#region pack christmas
            try {
                // nếu như pack christmas có thể reInit thì ta phải reInit lại
                const validReInitPack = DataChristmasSys.Instance.ValidReInitLoopPack();
                if (validReInitPack) {
                    //force reset toàn bộ dữ liệu của data pack
                    needSaveData = true;
                    DataChristmasSys.Instance.InitNewLoopForce(false);
                }
                DataChristmasSys.Instance.LoadPackFirstTime();
                //#endregion pack christmas

                //#region LR + HR
                const validReInitEvent = DataLightRoad_christ.Instance.ValidTimeCanReInit();
                if (validReInitEvent && DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.CHRISTMAS_EVENT)) {
                    // force reset toàn bộ dữ liệu của hatRace và LightRoad sau đó tạo lại event mới
                    needSaveData = true;
                    DataLightRoad_christ.Instance.InitNewLoopForce(false);
                    // đối vưới event này thì ta sẽ init new event mới ngay sau khi force loop event
                    DataLightRoad_christ.Instance.InitNewEvent(false);
                }


                // event lightRoad
                DataLightRoad_christ.Instance.LoadDataFromLoad(false);

                // event hat race
                DataHatRace_christ.Instance.LoadDataFromLoad(false);
            } catch (e) {
                LogEventManager.Instance.logTriggerBug(MConfigFacebook.Instance.playerID ,e.code, e.message, 'loading_christ_1');
            }
            //#endregion LR + HR


            // forceUpdateEventAfterUpdateGroup()
            DataEventsSys.Instance.GetListEventCanShowThisSeasionAtSceneLobby(false);
            DataEventsSys.Instance.ForceUdpateEventFromLoading();

            // check case nếu thoát game khi đang chơi
            if (PlayerData.Instance._isPlayingInGame) {
                needSaveData = true;
                PlayerData.Instance._isPlayingInGame = false;

                // treasure trail
                DataTreasureTrailSys.Instance.LoseGame(false);
                // skyLift
                DataSkyLiftSys.Instance.LoseGame(false);
                // speedRace
                DataSpeedRace.Instance.UpdateData(false, false);
            }

            if (PlayerData.Instance._isPlayingInGameChrist) {
                needSaveData = true;

                PlayerData.Instance._isPlayingInGameChrist = false;

                // christmas hat race
                DataHatRace_christ.Instance.LoseStreakPlayer(false);
            }

            if (needSaveData) {
                // save data
                PlayerData.Instance.Save();
            }

            // check case nếu user 
            // #endregion Init data

            //data building
            if (DataBuildingSys.Instance.WasReceivePrizeButDataIsDone()) {
                DataBuildingSys.Instance.IncreaseNextMap(false);
                needSaveData = true;
            }

            // ================================================================
            // #region Update sound status
            // play sound sys
            SoundSys.Instance.updateStateSound(PlayerData.Instance._soundEffStatus, PlayerData.Instance._musicStatus);
            // #endregionUpdate sound status

            // =================================================================
            // #region call server
            // this.RunServer();
            // #endregion call server
            // ================================================================

            // =================================================================
            // #region pack halloween
            try {
                DataHalloweenSys.Instance.StartTime();
            } catch (e) {
                LogEventManager.Instance.logTriggerBug(MConfigFacebook.Instance.playerID ,e.code, e.message, 'loading_hlw_2');
            }
            // #endregion pack halloween
            // =================================================================

            // =================================================================
            // #region pack christmas
            try {
                DataChristmasSys.Instance.UpdateStateFromLoad();
            } catch (e) {
                LogEventManager.Instance.logTriggerBug(MConfigFacebook.Instance.playerID ,e.code, e.message, 'loading_christ_2');
            }
            // #endregion pack christmas
            // =================================================================


            // ================================================================
            // #region load banner ads
            // check in case player can show banner ads or inter ads
            FBInstantManager.Instance.HideBannerManual = PlayerData.Instance.CanShowAds;
            FBInstantManager.Instance.HideShowInter = PlayerData.Instance.CanShowAds;
            FBInstantManager.Instance.CanShowBanner = false;
            FBInstantManager.Instance.Load_BannerAdAsync_SheduleOne(true);
            // #endregion load banner ads
        } catch (e) {
            LogEventManager.Instance.logTriggerBug(MConfigFacebook.Instance.playerID ,e.code, e.message, 'loading_data')
        }
    }
    // #endregion func FB load

    // #region func check context
    typeSceneMoveTo: TYPE_GAME = null;
    private async CheckCurrentContextTournament() {
        // if (FBInstantManager.Instance.tournamentID == "" || FBInstantManager.Instance.tournamentID == null) {
        //     MConsolLog.Log("case not join from tournament");
        // } else {
        //     // console.log("check tournament ID", FBInstantManager.Instance.tournamentID);

        //     let tournamentJoined: IDataTourFromServer = DataLeaderboardSys.Instance.GetTournamentDataJsonContinuing(FBInstantManager.Instance.tournamentID);

        //     this.typeSceneMoveTo = TYPE_GAME.NORMAL;

        //     // just only check case tour of system
        //     if (tournamentJoined != null) {
        //         // case join tournament game
        //         // MConsolLog.Log("case join from tournament game");

        //         // console.log("check in case pass tournament", tournamentJoined);

        //         // await call leaderboard to get data
        //         let dataTournamentJoined: IDataLeaderboardByContextIds = await ServerPegasus.Instance.GetLeaderboardByContextIds([tournamentJoined.contextID]);
        //         if (dataTournamentJoined != null && dataTournamentJoined.success && dataTournamentJoined.data != null) { }
        //         const result: IInfoLeaderboardByContextId = dataTournamentJoined.data[0];
        //         const jsonData = JSON.parse(result.data);
        //         const listPrize = [];
        //         for (let i = 0; i < jsonData.rewards.length; i++) {
        //             const element = jsonData.rewards[i];
        //             let listPrizeCheck = ReadJsonOptimized(element);
        //             listPrize.push(listPrizeCheck);
        //         }
        //         console.warn("check result from server", result, jsonData, listPrize);


        //         // set config for that tournament
        //         this._jsonTourManager = new JSON_GAME_MANAGER_TOUR();
        //         this._jsonTourManager.id_leaderboard = result._id;
        //         this._jsonTourManager.context_tournament = result.contextId;
        //         this._jsonTourManager.tournament_id = result.tournamentId;
        //         this._jsonTourManager.name_leaderboard = result.name;
        //         this._jsonTourManager.levels = jsonData.levels;
        //         this._jsonTourManager.rewards = listPrize;

        //         this.typeSceneMoveTo = TYPE_GAME.TOURNAMENT;
        //         // console.log("check in case pass tournament", this.typeSceneMoveTo);
        //     }
        // }

        // this.checkTournamentDone = true;
        // this.MoveToNextScene();
    }

    private async CheckCurrentContextPlayWithFriend() {
        // const dataCheckFromMessage = FBInstantManager.Instance.getEntryPointData();

        // if (dataCheckFromMessage != null) {
        //     try {

        //     } catch (e) {
        //         // MConsolLog.Error(e);
        //         MConsolLog.Log("case not join from friend");
        //     }
        // } else {
        //     MConsolLog.Log("case not join from friend");
        // }

        // this.checkPlayWithFriendDone = true;
        // this.MoveToNextScene();
    }
    // #endregion func check context


    private _canInvokeMoveToNextScene = true;
    private MoveToNextScene() {
        // if (!this.isPreloadSceneDone) return;
        // console.log("check ",
        //     this.loadLanguageDone,
        //     this.checkTournamentDone,
        //     this.checkPlayWithFriendDone,
        //     this.callbackCheckIsNewUser,
        //     this.loadBundleDone,
        //     this._canInvokeMoveToNextScene);

        // if (!this.isPreloadSceneDone) return;
        if (!this.loadLanguageDone) return;
        if (!this.checkTournamentDone) return;
        if (!this.checkPlayWithFriendDone) return;
        if (!this.callbackCheckIsNewUser) return;
        if (!this.loadBundleDone) return;
        if (!this._canInvokeMoveToNextScene) return;

        if (this._canInvokeMoveToNextScene) { this._canInvokeMoveToNextScene = false; }

        PokiSDKManager.Instance.setGameLoadingFinished();
        // load bundle
        const indexMapNow = DataBuildingSys.Instance.GetIndexMapNow();
        MConfigResourceUtils.LoadMapBgGame(indexMapNow, 'Normal');

        // load next scene
        Tween.stopAllByTarget(this.spPB.node);
        this.spPB.fillRange = 1;

        // DataInfoPlayer.Instance.currWithFriendDataInfo = new WithFriendDataInfo();
        // DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore = 90;
        // DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore = 9999;
        // DataInfoPlayer.Instance.currWithFriendDataInfo.senderID = FBInstantManager.Instance.getID();
        // DataInfoPlayer.Instance.currWithFriendDataInfo.level = lodash.random(5,10);
        //#region LOG EVENT
        // =============================== ads , adset , camp ===============================
        if (ConfigLogEvent.Instance.campID_session && ConfigLogEvent.Instance.campID_session.length > 0) {
            if (!ConfigLogEvent.Instance.checkCampID(ConfigLogEvent.Instance.campID_session)) {
                ConfigLogEvent.Instance.addCampID(ConfigLogEvent.Instance.campID_session);

                LogEventManager.Instance.logCAMP_ID(ConfigLogEvent.Instance.campID_session);
            }
            ConfigLogEvent.Instance.isPaidUser = true;
        }

        if (ConfigLogEvent.Instance.adsetID_session && ConfigLogEvent.Instance.adsetID_session.length > 0) {
            if (!ConfigLogEvent.Instance.checkAdsetID(ConfigLogEvent.Instance.adsetID_session)) {
                ConfigLogEvent.Instance.addAdsetID(ConfigLogEvent.Instance.adsetID_session);

                LogEventManager.Instance.logADSET_ID(ConfigLogEvent.Instance.adsetID_session);
            }
            ConfigLogEvent.Instance.isPaidUser = true;
        }

        if (ConfigLogEvent.Instance.adsID_session && ConfigLogEvent.Instance.adsID_session.length > 0) {
            if (!ConfigLogEvent.Instance.checkAdsID(ConfigLogEvent.Instance.adsID_session)) {
                ConfigLogEvent.Instance.addAdsID(ConfigLogEvent.Instance.adsID_session);

                LogEventManager.Instance.logADS_ID(ConfigLogEvent.Instance.adsID_session);
            }
            ConfigLogEvent.Instance.isPaidUser = true;
        }

        // =============================== tournament ===============================

        if (ConfigLogEvent.Instance.tourID_session && ConfigLogEvent.Instance.tourID_session.length > 0) {
            if (!ConfigLogEvent.Instance.checkTourID(ConfigLogEvent.Instance.tourID_session)) {
                ConfigLogEvent.Instance.addTourID(ConfigLogEvent.Instance.tourID_session);

                LogEventManager.Instance.logTour_ID(ConfigLogEvent.Instance.adsID_session);
            }
        }

        if (this.typeSceneMoveTo == TYPE_GAME.TOURNAMENT) {
            LogEventManager.Instance.logTOUR_PLAY();
            LogEventManager.Instance.logTOUR_ID_PLAY(ConfigLogEvent.Instance.tourID_session);
            if (GameManager.Instance.IsNewPlayer) {
                LogEventManager.Instance.logTour_ID_NEWUSER(ConfigLogEvent.Instance.tourID_session);
                LogEventManager.Instance.logTOUR_FIRST_OPEN();
                LogEventManager.Instance.logTOUR_ID_FIRST_OPEN(ConfigLogEvent.Instance.tourID_session);
            }

        }

        //#endregion

        // check level player để hiển thị popUpSave data
        // if (GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY) {
        //     FBInstantManager.Instance.CreateShortcut();
        // }

        if (DataInfoPlayer.Instance.currWithFriendDataInfo != null) {
            this.typeSceneMoveTo = TYPE_GAME.WITH_FRIEND;
        } else {

            // Nếu người chơi chưa chơi tutorial thì bắt buộc phải chơi tutorial trước sau đó làm gì thì làm
            // hiện tại phần kiểm tra khi chơi xong tutorial là tournament hoặc chơi thường chưa làm
            if (!PlayerData.Instance._isPlayedTutorial) {
                // reset context to the SOLO
                // FBInstantManager.Instance.resetContextForced(() => { });
                this.typeSceneMoveTo = TYPE_GAME.TUTORIAL;
            }

            else if (GameManager.Instance.levelPlayerNow <= MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY) {
                // FBInstantManager.Instance.resetContextForced(() => { });
                this.typeSceneMoveTo = TYPE_GAME.NORMAL;
            }

        }
        // pause preload UI
        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_LOAD_UI_RESOURCE);

        // just only case player play tutorial so you can change to type game normal to direct screen
        // in the other case you will move player to the lobby
        switch (this.typeSceneMoveTo) {
            case TYPE_GAME.TUTORIAL:
                MConfigs.CAN_SHOW_INVITE_AT_LOBBY = false;
                GameManager.Instance.PreparePlayTutorialFromLoading();
                break;
            case TYPE_GAME.TOURNAMENT:
                GameManager.Instance.PreparePlayTournamentFromLoading(this._jsonTourManager);
                // ||**DQ**||
                clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.PLAY_TOURNAMENT_GAME, 1);
                break;
            case TYPE_GAME.NORMAL:
                // lấy dữ liệu của màn chơi đó
                const levelPlayer = GameManager.Instance.GetLevelPlayerNow();
                GameManager.Instance.PreparePlayNormalFromLoading(levelPlayer, 0, []);
                break;
            case TYPE_GAME.WITH_FRIEND:
                // lấy dữ liệu của màn chơi đó
                GameManager.Instance.PreparePlayWithFriendFromLoading();
                break;
            default:
                /**Sample**/
                ChangeSceneSys.ChangeFromLoadingToScene(MConst.NAME_SCENE.LOBBY, this._dataCustomSceneLobby);
                // GameManager.Instance.PreparePlayTutorial();
                break;
        }
    }

    //#region FUNC SERVER
    private async RunServer() {
        // ServerPegasus.Instance.SetUp(MConfigFacebook.Instance.playerID);
        // // call leaderboard tour is running
        // await DataLeaderboardSys.Instance.GetDataGameServer();
        // // this.CheckCurrentContextTournament();

        // (async () => {
        //     // just call in init player only for new player
        //     // if (GameManager.Instance.IsNewPlayer || !PlayerData.Instance._isJoinedServer) {
        //     let result = await ServerPegasus.Instance.InitPlayerInfo(MConfigFacebook.Instance.playerID,
        //         MConfigFacebook.Instance.playerName, MConfigFacebook.Instance.playerPhotoURL,
        //         MConfigFacebook.Instance.asId, PlayerData.Instance._levelPlayer > 0 ? PlayerData.Instance._levelPlayer : 1);
        //     // MConsolLog.Warn("Init player result: ", result == null ? null : result.valueOf());
        //     // call leaderboard
        //     DataLeaderboardSys.Instance.CallGetLeaderboardWeekly_Global();
        //     // get pre weekly
        //     DataWeeklySys.Instance.UpdateDirtyData();
        // })();

        // DataLeaderboardSys.Instance.CallGetLeaderboardTournaments();
    }
    //#endregion FUNC SERVER
}