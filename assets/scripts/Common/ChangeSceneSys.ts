import { _decorator, Camera, Component, director, Node, Game } from 'cc';
import { MConst } from '../Const/MConst';
import { FBInstantManager } from '../Utils/facebooks/FbInstanceManager';
import { SoundSys } from './SoundSys';
import { GameMusicDisplay, M_COLOR, TYPE_CAR_SIZE } from '../Utils/Types';
import { MConfigResourceUtils } from '../Utils/MConfigResourceUtils';
import { clientEvent } from '../framework/clientEvent';
import { ReadMapLobbyJson } from '../MJson/ReadMapLobbyJson';
import { GameManager } from '../Scene/GameManager';
import { TYPE_GAME } from '../Configs/MConfigs';
import { ReadMapJson } from '../MJson/ReadMapJson';
import { DataBuildingSys } from '../DataBase/DataBuildingSys';
import { DataInfoPlayer } from '../Scene/DataInfoPlayer';
import { MConfigs } from 'db://assets/scripts/Configs/MConfigs';
import { Utils } from '../Utils/Utils';
import { ResourceUtils } from '../Utils/ResourceUtils';
import { DataLevelProgressionSys } from '../DataBase/DataLevelProgressionSys';
import { LogEventManager } from '../LogEvent/LogEventManager';
import { GetLevelChristGame } from '../Scene/OtherUI/UIChristmasEvent/TypeChristmasEvent';
import { DataChristmasSys } from '../DataBase/DataChristmasSys';
import { PokiSDKManager } from '../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

export enum TYPE_SCENE_USING {
    LOADING,
    LOBBY,
    GAME
}

function GetNameSceneByType(typeScene: TYPE_SCENE_USING): string {
    switch (typeScene) {
        case TYPE_SCENE_USING.LOADING: return "Loading";
        case TYPE_SCENE_USING.LOBBY: return "Lobby";
        case TYPE_SCENE_USING.GAME: return "Game";
        default: return "not know";
    }
}
@ccclass('ChangeSceneSys')
export class ChangeSceneSys {

    public static Instance: ChangeSceneSys = null;

    private readonly EVENT_CHANGE_MAT = {
        TURN_ON_TRANSITIONS: 'TURN_ON_TRANSITIONS',
        TURN_OFF_TRANSITIONS: 'TURN_OFF_TRANSITIONS',
        DONE_TRANSITIONS_TURN_ON: 'DONE_TRANSITIONS_TURN_ON',
        DONE_TRANSITIONS_TURN_OFF: 'DONE_TRANSITIONS_TURN_OFF',
        TURN_ON_TRANSITIONS_NOW: 'TURN_ON_TRANSITIONS_NOW',
    };

    private type_scene_using: TYPE_SCENE_USING = TYPE_SCENE_USING.LOADING;
    private tempScenePreload: string = null;
    private dataCustom: any = null;
    private _oldSceneShowing: TYPE_SCENE_USING = null;

    private _timeStartChangeScene: number = -1;
    private _timeEndChangeScene: number = -1;

    constructor() {
        if (ChangeSceneSys.Instance == null) {
            ChangeSceneSys.Instance = this;
        }
        director.on(ChangeSceneSys.Instance.EVENT_CHANGE_MAT.DONE_TRANSITIONS_TURN_ON, this.doneAnimTurnOnLoadScene, this);
        director.on(ChangeSceneSys.Instance.EVENT_CHANGE_MAT.DONE_TRANSITIONS_TURN_OFF, this.doneAnimTurnOffLoadScene, this);
    }

    public static async ChangeFromLoadingToScene(nameScene: string, dataCustom: any = null) {
        ChangeSceneSys.Instance._timeStartChangeScene = Date.now();

        const self = ChangeSceneSys.Instance;

        if (self.tempScenePreload != null) { return; }
        self.tempScenePreload = nameScene;
        self.dataCustom = dataCustom;

        director.emit(self.EVENT_CHANGE_MAT.TURN_ON_TRANSITIONS_NOW);


        // =============================================================================================
        // if player move to lobby => call hide banner
        switch (nameScene) {
            case MConst.NAME_SCENE.LOBBY:
                FBInstantManager.Instance.Hide_BannerAd();
                break;
            case MConst.NAME_SCENE.GAME:
                // load asset to play that game

                // check type game to load asset suit with each game
                switch (true) {
                    case GameManager.Instance.TypeGamePlay == TYPE_GAME.TUTORIAL:
                        FBInstantManager.Instance.Hide_BannerAd();
                        break;
                }
                break;
        }
        // save old scene showing
        self._oldSceneShowing = self.type_scene_using;
        // =============================================================================================


        // =============================================================================================
        /**
         * load bundle effect
         */
        MConfigResourceUtils.TryPreLoadBundleEffect();

    }

    public static async ChangeSceneTo(nameScene: string, dataCustom: any = null) {
        const self = ChangeSceneSys.Instance;
        self._timeStartChangeScene = Date.now();


        if (self.tempScenePreload != null) { return; }
        self.tempScenePreload = nameScene;
        self.dataCustom = dataCustom;

        director.emit(self.EVENT_CHANGE_MAT.TURN_ON_TRANSITIONS);

        clientEvent.dispatchEvent(MConst.FB_CLEAR_ALL_NOTI);

        // =============================================================================================
        // if player move to lobby => call hide banner
        switch (nameScene) {
            case MConst.NAME_SCENE.LOBBY:
                FBInstantManager.Instance.Hide_BannerAd();
                break;
            case MConst.NAME_SCENE.GAME:
                // load asset to play that game

                // check type game to load asset suit with each game
                switch (true) {
                    case GameManager.Instance.TypeGamePlay == TYPE_GAME.TUTORIAL:
                        FBInstantManager.Instance.Hide_BannerAd();
                        break;
                }
                break;
        }
        //     // try make player to solo
        //     FBInstantManager.Instance.resetContextForced((error: Error | null, success: string) => {
        //         if (success == MConst.FB_CALLBACK_SUCCESS) {
        //             console.log("change to SOLO success");
        //         }
        //     });
        // hide banner
        // =============================================================================================

        // save old scene showing
        self._oldSceneShowing = self.type_scene_using;

        // =============================================================================================
        /**
         * if player move from game to lobby => show interstitial instead of transitions
         * in case can not load ad => show load interstitial normal
         */
        let isWatchingAds: boolean = false;
        const valid1 = self.type_scene_using == TYPE_SCENE_USING.GAME && nameScene == MConst.NAME_SCENE.LOBBY
        const valid2 = (!MConfigs.isMobile && GameManager.Instance.levelPlayerNow > MConfigs.LEVEL_CAN_SHOW_INTER_PC) || (MConfigs.isMobile)

        if (valid1 && valid2) {
            isWatchingAds = true;
            // FBInstantManager.Instance.Show_InterstitialAdAsync("back_to_lobby", (error: Error | null, success: string) => {
            //     isWatchingAds = false;
            // });
            PokiSDKManager.Instance.Show_InterstitialAdAsync("back_to_lobby", (error: Error | null, success: string) => {
                isWatchingAds = false;
            });
        }

        await Utils.WaitReceivingDone(() => !isWatchingAds);
        // =============================================================================================


        // =============================================================================================
        /**
         * load bundle effect
         */
        MConfigResourceUtils.TryPreLoadBundleEffect();
        // =============================================================================================

        // this check change scene to log
        if (nameScene == MConst.NAME_SCENE.GAME) {
            // switch(MConfigs.TYPE_GAME_PLAYING){
            //     case TYPE_GAME.NORMAL: LogEventManager.logEvent(LogEventManager.EVENT.TOUCH_PLAY); break;
            //     case TYPE_GAME.TOURNAMENT: 
            //         LogEventManager.logEvent(LogEventManager.EVENT.TOUCH_TOURNAMENT);
            //         LogEventManager.logEvent(LogEventManager.EVENT.TOURNAMENT_JOIN); 
            //         break;
            //     case TYPE_GAME.VS: LogEventManager.logEvent(LogEventManager.EVENT.TOUCH_SOLO); break;
            // }
        }
    }

    public static async JustTurnOnLoadScene() {
        const self = ChangeSceneSys.Instance;
        director.emit(self.EVENT_CHANGE_MAT.TURN_ON_TRANSITIONS);
    }

    public static async JustTurnOffLoadScene() {
        const self = ChangeSceneSys.Instance;
        director.emit(self.EVENT_CHANGE_MAT.TURN_OFF_TRANSITIONS);
    }

    private async doneAnimTurnOnLoadScene() {
        // console.error("doneAnimTurnOnLoadScene");
        async function playMusicBackground(nameSound: GameMusicDisplay) {
            await MConfigResourceUtils.TryPreloadBundleSoundBackground();
            SoundSys.Instance.playMusic(nameSound);
        }
        /**
         * load dữ liệu cần thiết cho scene trước khi load scene
         * Bởi vì bạn có thể vô tình load gì đó cần resource ngay trong onLoad của class trong scene
         * Do đó cần load dữ liệu cần thiết
         */
        const indexMapNow = DataBuildingSys.Instance.GetIndexMapNow();
        const indexConstrucUnlock = DataBuildingSys.Instance.GetIndexConstructorUnlockNow();

        // console.log("tempScenePreload", this.tempScenePreload);
        let dataMap;
        let levelRead = -1;
        switch (this.tempScenePreload) {
            case MConst.NAME_SCENE.GAME:
                const dateStartLoad = Date.now();
                // console.log("StartTime load game",Date.now());

                switch (GameManager.Instance.TypeGamePlay) {
                    case TYPE_GAME.NORMAL: case TYPE_GAME.TUTORIAL:
                        levelRead = MConfigs.GetLevelGame(GameManager.Instance.JsonPlayGame.LEVEL);
                        // load json map
                        const timeStartLoadJsonMap = Date.now();
                        dataMap = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
                        const timeEndLoadJsonMap = Date.now();
                        LogEventManager.Instance.logTimeLoadJsonMap(levelRead, timeEndLoadJsonMap - timeStartLoadJsonMap);
                        let setCar = ReadMapJson.Instance.ConvertDataMapToMapTypeCar(dataMap);
                        let isHasLoadMystery = dataMap.CarInfo.find(element => { return element.isMysteryCar }) != null;
                        // load image
                        const timeStartLoadImgCar = Date.now();
                        await Promise.all([
                            MConfigResourceUtils.LoadImageFlash("Flash1"),
                            MConfigResourceUtils.LoadPfSupMap(dataMap)
                        ])
                        MConfigResourceUtils.LoadAllImageCar(null);
                        const timeEndLoadImgCar = Date.now();
                        LogEventManager.Instance.logTimeLoadImageCar(levelRead, timeEndLoadImgCar - timeStartLoadImgCar);
                        break;
                    case TYPE_GAME.TOURNAMENT:
                        let listSetCar: any[] = [];
                        for (let i = 0; i < GameManager.Instance.ModeGame.TOURNAMENT.levels.length; i++) {
                            levelRead = MConfigs.GetLevelGame(GameManager.Instance.ModeGame.TOURNAMENT.levels[i]);
                            dataMap = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
                            let setCar = ReadMapJson.Instance.ConvertDataMapToMapTypeCar(dataMap);
                            listSetCar.push(setCar);
                            // let isHasLoadMystery = dataMap.CarInfo.find(element => { return element.isMysteryCar }) != null;
                            // await MConfigResourceUtils.LoadImageWhenChangeGame(indexMapNow, setCar, GameManager.Instance.TypeGamePlay, isHasLoadMystery);
                        }
                        await Promise.all([
                            MConfigResourceUtils.LoadImageFlash("Flash1"),
                            MConfigResourceUtils.LoadPfSupMap(dataMap)
                        ])
                        MConfigResourceUtils.LoadAllImageCar(null);
                        break;
                    case TYPE_GAME.WITH_FRIEND:
                        levelRead = MConfigs.GetLevelGame(DataInfoPlayer.Instance.currWithFriendDataInfo.level);
                        dataMap = await ReadMapJson.Instance.ReadDataFromJson(levelRead);
                        // let setCarWithFriend = ReadMapJson.Instance.ConvertDataMapToMapTypeCar(dataMap);
                        // let isHasLoadMysteryWithFriend = dataMap.CarInfo.find(element => { return element.isMysteryCar }) != null;
                        // await MConfigResourceUtils.LoadImageWhenChangeGame(indexMapNow, setCarWithFriend, GameManager.Instance.TypeGamePlay, isHasLoadMysteryWithFriend);
                        await Promise.all([
                            MConfigResourceUtils.LoadImageFlash("Flash1"),
                            MConfigResourceUtils.LoadPfSupMap(dataMap)
                        ])
                        MConfigResourceUtils.LoadAllImageCar(null);
                        break;
                    case TYPE_GAME.CHRISTMAS:
                        levelRead = GetLevelChristGame(GameManager.Instance.JsonPlayChristmas.LEVEL);
                        dataMap = await ReadMapJson.Instance.ReadDataFromJson(levelRead, 'christ');
                        await Promise.all([
                            MConfigResourceUtils.LoadImageFlash("Flash1"),
                            MConfigResourceUtils.LoadPfSupMap(dataMap),
                            MConfigResourceUtils.LoadPfAnimReindeer()
                        ])
                        MConfigResourceUtils.LoadAllImageCar(null);
                        break;
                }

                const dateEndLoad = Date.now();

                // console.error("time load game", dateEndLoad - dateStartLoad);
                break;
            case MConst.NAME_SCENE.LOBBY:
                // console.log("StartTime load map lobby",Date.now());
                await ReadMapLobbyJson.Instance.LoadMap(indexMapNow, indexConstrucUnlock);

                // in the case comeback from game to home => trigger init load pack Christ once time
                DataChristmasSys.Instance.LoadPackFirstTime(true);
                // console.log("EndTime load map lobby",Date.now());
                // console.log("load map lobby done");
                break;
        }

        // director.loadScene(ChangeSceneSys.Instance.tempScenePreload, async () => {
        //     switch (this.tempScenePreload) {
        //         case MConst.NAME_SCENE.LOBBY:
        //             playMusicBackground(GameMusicDisplay.MUSIC_BACKGROUND_LOOBY);
        //             break;
        //         case MConst.NAME_SCENE.GAME:
        //             playMusicBackground(GameMusicDisplay.MUSIC_BACKGROUND_GAMEPLAY);
        //             break;
        //     }

        //     /**
        //      * You can do some logic or in here before turn off transitions
        //      * NOTE: lưu ý ở giai đoạn này typeSceneUsing là scene cũ không phải scene mới
        //      */
        //     switch (this.type_scene_using) {
        //         case TYPE_SCENE_USING.LOADING:
        //             /**
        //              * class PreloadUILobby listen this emit
        //              * Hãy chú ý rằng hiện tại trong code PreloadUILobby sau khi preload toàn bộ Prefab popUp trong resource xong thì sẽ tự destroy node
        //              * Do đó nếu bạn muốn nhét code load map vào trong class đấy và gọi trong scene using lobby thì cần phải chú ý điều đó
        //              */
        //             clientEvent.dispatchEvent(MConst.EVENT.RESUME_LOAD_UI_RESOURCE);
        //             break;
        //         case TYPE_SCENE_USING.LOBBY:
        //             /**
        //              * preload image map lobby
        //              * Hãy chú ý rằng hiện tại trong code UILobbySys ngay trong function onLoad sẽ auto load dữ liệu từ bundle map lobby
        //              * và cho đến khi người chơi load dữ liệu map xong thì ta mới tắt transitions 
        //              * Do đó nếu bạn muốn chuyển dữ liệu code thì xin hãy chú ý đến luồng dữ liệu được mô tả ở trên và ghi chú lại
        //              */
        //             const levelPlayer: number = GameManager.Instance.GetLevelPlayerNow();
        //             await MConfigResourceUtils.LoadImageMapLobby(levelPlayer);
        //             break;
        //     }

        //     // await Utils.delay(2 * 1000);

        //     switch (this.tempScenePreload) {
        //         case MConst.NAME_SCENE.LOBBY:
        //             // emit turn off change scene sau khi load xong item event ở lobby
        //             // trong code AnimLoadItemHomeSys
        //             break;
        //         default:
        //             director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF);
        //             break;
        //     }
        // });

        this.LoadandChangeScene();
    }

    private LoadandChangeScene() {
        async function playMusicBackground(nameSound: GameMusicDisplay) {
            await MConfigResourceUtils.TryPreloadBundleSoundBackground();
            SoundSys.Instance.playMusic(nameSound);
        }

        const timeStartLoadSceneBundle = Date.now();
        ResourceUtils.loadSceneBundle(this.tempScenePreload, MConst.BUNDLE_SCENES, async (err, path, scene) => {
            const timeEndLoadSceneBundle = Date.now();
            LogEventManager.Instance.logTimeLoadSceneBundle(this.tempScenePreload, timeEndLoadSceneBundle - timeStartLoadSceneBundle);

            if (err || scene == null) {
                this.LoadandChangeScene();
                console.log(err);
                return;
            }

            // try catch load scene again
            try {
                director.runScene(scene);
            } catch (e) {
                console.error(e);
                this.LoadandChangeScene();
                return;
            }

            switch (this.tempScenePreload) {
                case MConst.NAME_SCENE.LOBBY:
                    playMusicBackground(GameMusicDisplay.MUSIC_BACKGROUND_LOOBY);
                    break;
                case MConst.NAME_SCENE.GAME:
                    playMusicBackground(GameManager.Instance.TypeGamePlay == TYPE_GAME.CHRISTMAS ? GameMusicDisplay.MUSIC_BACKGROUND_CHRIST : GameMusicDisplay.MUSIC_BACKGROUND_GAMEPLAY);
                    break;
            }

            /**
             * You can do some logic or in here before turn off transitions
             * NOTE: lưu ý ở giai đoạn này typeSceneUsing là scene cũ không phải scene mới
             */
            switch (this.type_scene_using) {
                case TYPE_SCENE_USING.LOADING:
                    /**
                     * class PreloadUILobby listen this emit
                     * Hãy chú ý rằng hiện tại trong code PreloadUILobby sau khi preload toàn bộ Prefab popUp trong resource xong thì sẽ tự destroy node
                     * Do đó nếu bạn muốn nhét code load map vào trong class đấy và gọi trong scene using lobby thì cần phải chú ý điều đó
                     */
                    clientEvent.dispatchEvent(MConst.EVENT.RESUME_LOAD_UI_RESOURCE);
                    break;
                case TYPE_SCENE_USING.LOBBY:
                    /**
                     * preload image map lobby
                     * Hãy chú ý rằng hiện tại trong code UILobbySys ngay trong function onLoad sẽ auto load dữ liệu từ bundle map lobby
                     * và cho đến khi người chơi load dữ liệu map xong thì ta mới tắt transitions 
                     * Do đó nếu bạn muốn chuyển dữ liệu code thì xin hãy chú ý đến luồng dữ liệu được mô tả ở trên và ghi chú lại
                     */

                    if (DataLevelProgressionSys.Instance.IsReceiveAllPrize()) {
                        DataLevelProgressionSys.Instance.InitNewEvent();
                    }

                    const levelPlayer: number = GameManager.Instance.GetLevelPlayerNow();
                    await MConfigResourceUtils.LoadImageMapLobby(levelPlayer);
                    break;
            }

            // await Utils.delay(2 * 1000);

            switch (this.tempScenePreload) {
                case MConst.NAME_SCENE.LOBBY:
                    // emit turn off change scene sau khi load xong item event ở lobby
                    // trong code AnimLoadItemHomeSys
                    break;
                default:
                    director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF);
                    break;
            }
        });
    }

    private doneAnimTurnOffLoadScene() {
        const self = ChangeSceneSys.Instance;

        self._timeEndChangeScene = Date.now();
        const timeLongChangeScene = self._timeEndChangeScene - self._timeStartChangeScene;
        LogEventManager.Instance.logTimeChangeScene(GetNameSceneByType(self.type_scene_using), self.tempScenePreload, timeLongChangeScene);

        self.UpdateSceneUsing(self.tempScenePreload);
        director.emit(MConst.EVENT.LOAD_SCENE_DONE, self.tempScenePreload);
        self.tempScenePreload = null;
    }

    private UpdateSceneUsing(name_scene) {
        let self = ChangeSceneSys.Instance;

        switch (name_scene) {
            case MConst.NAME_SCENE.LOBBY: self.type_scene_using = TYPE_SCENE_USING.LOBBY; break;
            case MConst.NAME_SCENE.GAME: self.type_scene_using = TYPE_SCENE_USING.GAME; break;
            default: break;
        }
    }

    public GetDataCustom() { return this.dataCustom }
    public GetTypeSceneUsing() { return this.type_scene_using; }
    public GetOldTypeSceneUsing() { return this._oldSceneShowing; }
    public GetNameUISceneUsing() {
        switch (this.type_scene_using) {
            case TYPE_SCENE_USING.GAME: return "SceneGame";
            case TYPE_SCENE_USING.LOBBY: return "SceneLobby";
            case TYPE_SCENE_USING.LOADING: return "SceneLoading";
            default: return null;
        }
    }
}


