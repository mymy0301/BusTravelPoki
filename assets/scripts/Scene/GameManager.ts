import { _decorator, Component, director, macro, Node, randomRangeInt } from 'cc';
import { MConst } from '../Const/MConst';
import { JSON_GAME_MANAGER_TOUR, TYPE_ITEM, TYPE_LEVEL_NORMAL, TYPE_QUEST_DAILY } from '../Utils/Types';
import { DataLobbyJsonSys } from './DataLobbyJsonSys';
import { PlayerData } from '../Utils/PlayerData';
import { ChangeSceneSys } from '../Common/ChangeSceneSys';
import { DayDailyInfo } from '../SerilazationData/DayDailyInfo';
import { Utils } from '../Utils/Utils';
import { DataLeaderboardSys } from './DataLeaderboardSys';
import { MConfigs, TYPE_GAME } from '../Configs/MConfigs';
import { DataSeasonPassSys } from '../DataBase/DataSeasonPassSys';
import { clientEvent } from '../framework/clientEvent';
import { DataDashRush } from './DataDashRush';
import { DataSpeedRace } from '../DataBase/DataSpeedRace';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager {
    public static Instance: GameManager = null;
    constructor() {
        if (GameManager.Instance == null) {
            GameManager.Instance = this;
        }
    }
    // public static get Instance(): GameManager {
    //     if (this._instance) {
    //         return this._instance;
    //     }
    //     this._instance = new GameManager();
    //     return this._instance;
    // }

    private _isNewPlayer: boolean = false;

    private _typeGamePlaying: TYPE_GAME = TYPE_GAME.NORMAL;

    private _JSON_ALL_TYPE_GAME = {
        DASH_RUSH_CACHE: null,
        SPEED_RACE_CACHE: null
    }

    private _JSON_GAME = {
        "LEVEL": 0,
        "TIME": 0,
        "NUM_LOSE": 0,
        TYPE_ITEM_SUPPORT: []
    }

    private _JSON_PLAY_TOURNAMENT = {
        "LEVEL": 0,
        "TIME": 0
    }

    private _JSON_PLAY_CHRISTMAS = {
        "LEVEL": 0,
    }

    private _JSON_PREPARE_PLAY_GAME = {
        "LEVEL": 0,
        "STAR": 0,
        "MONEY": 0,
        "LIFE": 0,
        "KEY_BATTLE_PASS": 0,
        "TILE_RUSH": 0,
        "TILE_RACE": 0
    };

    private _MODE_GAME = {
        DAILY_CHALLENGE: {
            id: 0,
            dayInfoPlay: new DayDailyInfo(),
            numQuestionMark: 0
        },
        TOURNAMENT: new JSON_GAME_MANAGER_TOUR()
    };

    //#region CONFIG_GAME
    public async SetConfigGame(type: TYPE_GAME) {
        director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);

        this._typeGamePlaying = type;

        switch (type) {
            case TYPE_GAME.NORMAL:
                break;
            case TYPE_GAME.DAILY_CHALLENGE:
                break;
            case TYPE_GAME.TUTORIAL:
                break;
            case TYPE_GAME.WITH_FRIEND:
                break;
            case TYPE_GAME.CHRISTMAS:
                break;
            default: break;
        }

        director.emit(MConst.EVENT.BLOCK_UI.HIDE_UI_LOADING);
    }
    //#endregion common

    //#region PREPARE_PLAY_GAME
    public async PreparePlayNormal(level: number, time: number, listItemSupport: TYPE_ITEM[]) {
        // check level player play is > 20 and %10 % 5 will reduce the time
        if ((level + 1) >= 20) {
            if ((level + 1) % 10 == 0) {
                time += MConst.REDUCE_TIME_SUPPER_HARD;
            } else if ((level + 1) % 5 == 0) {
                time += MConst.REDUCE_TIME_HARD;
            }
        }

        this._JSON_GAME["LEVEL"] = level;
        this._JSON_GAME["TIME"] = time;
        this._JSON_GAME["TYPE_ITEM_SUPPORT"] = listItemSupport;
        this._JSON_GAME["NUM_LOSE"] = PlayerData.Instance._streakLose;
        this._JSON_ALL_TYPE_GAME["DASH_RUSH_CACHE"] = DataDashRush.Instance.GetOldDataCache();
        this._JSON_ALL_TYPE_GAME["SPEED_RACE_CACHE"] = DataSpeedRace.Instance.GetOldDataCache();

        await this.SetConfigGame(TYPE_GAME.NORMAL);
        await DataLobbyJsonSys.Instance.SaveDataLobbyJson();
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.GAME);

        // ||**DQ**||
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.PLAY_NORMAL_GAME, 1);
    }

    public async PreparePlayWithFriend() {
        this._JSON_ALL_TYPE_GAME["DASH_RUSH_CACHE"] = DataDashRush.Instance.GetOldDataCache();
        await this.SetConfigGame(TYPE_GAME.WITH_FRIEND);
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.GAME);
    }

    public async PreparePlayWithFriendFromLoading() {
        this._JSON_ALL_TYPE_GAME["DASH_RUSH_CACHE"] = DataDashRush.Instance.GetOldDataCache();
        await this.SetConfigGame(TYPE_GAME.WITH_FRIEND);
        ChangeSceneSys.ChangeFromLoadingToScene(MConst.NAME_SCENE.GAME);
    }

    public async PreparePlayNormalFromLoading(level: number, time: number, listItemSupport: TYPE_ITEM[]) {
        // check level player play is > 20 and %10 % 5 will reduce the time
        if ((level + 1) >= 20) {
            if ((level + 1) % 10 == 0) {
                time += MConst.REDUCE_TIME_SUPPER_HARD;
            } else if ((level + 1) % 5 == 0) {
                time += MConst.REDUCE_TIME_HARD;
            }
        }

        this._JSON_GAME["LEVEL"] = level;
        this._JSON_GAME["TIME"] = time;
        this._JSON_GAME["TYPE_ITEM_SUPPORT"] = listItemSupport;
        this._JSON_GAME["NUM_LOSE"] = PlayerData.Instance._streakLose;
        this._JSON_ALL_TYPE_GAME["DASH_RUSH_CACHE"] = DataDashRush.Instance.GetOldDataCache();
        this._JSON_ALL_TYPE_GAME["SPEED_RACE_CACHE"] = DataSpeedRace.Instance.GetOldDataCache();

        await this.SetConfigGame(TYPE_GAME.NORMAL);
        await DataLobbyJsonSys.Instance.SaveDataLobbyJson();
        ChangeSceneSys.ChangeFromLoadingToScene(MConst.NAME_SCENE.GAME);

        // ||**DQ**||
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.PLAY_NORMAL_GAME, 1);
    }

    public async PreparePlayTutorial() {
        this._JSON_GAME["LEVEL"] = 1;
        this._JSON_GAME["TIME"] = MConst.DEFAULT_TIME_PLAY_NORMAL_TUTORIAL_ITEM;
        this._JSON_GAME["TYPE_ITEM_SUPPORT"] = [];
        this._JSON_GAME["NUM_LOSE"] = PlayerData.Instance._streakLose;
        await this.SetConfigGame(TYPE_GAME.TUTORIAL);
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.GAME);
    }

    public async PreparePlayTutorialFromLoading() {
        this._JSON_GAME["LEVEL"] = 1;
        this._JSON_GAME["TIME"] = MConst.DEFAULT_TIME_PLAY_NORMAL_TUTORIAL_ITEM;
        this._JSON_GAME["TYPE_ITEM_SUPPORT"] = [];
        this._JSON_GAME["NUM_LOSE"] = PlayerData.Instance._streakLose;
        await this.SetConfigGame(TYPE_GAME.TUTORIAL);
        ChangeSceneSys.ChangeFromLoadingToScene(MConst.NAME_SCENE.GAME);
    }

    public async PreparePlayDailyChallenge(dayDailyInfo: DayDailyInfo, listItemSupport: TYPE_ITEM[]) {
        const idChallenge = Utils.getDayOfYearUTC(dayDailyInfo.day, dayDailyInfo.month, dayDailyInfo.year);
        const numQuestionMark = randomRangeInt(10, 15);
        this._MODE_GAME.DAILY_CHALLENGE = {
            id: idChallenge,
            dayInfoPlay: dayDailyInfo,
            numQuestionMark: numQuestionMark
        };
        this._JSON_GAME.TIME = MConst.DEFAULT_TIME_PLAY_DAILY_CHALLENGE;
        this._JSON_GAME.TYPE_ITEM_SUPPORT = listItemSupport;
        await this.SetConfigGame(TYPE_GAME.DAILY_CHALLENGE);
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.GAME);
    }

    public async PreparePlayTournament(tournamentJson: JSON_GAME_MANAGER_TOUR) {
        this._MODE_GAME.TOURNAMENT = tournamentJson;
        this._JSON_PLAY_TOURNAMENT.LEVEL = 1;
        this._JSON_PLAY_TOURNAMENT.TIME = 0;
        this._JSON_ALL_TYPE_GAME["DASH_RUSH_CACHE"] = DataDashRush.Instance.GetOldDataCache();
        await this.SetConfigGame(TYPE_GAME.TOURNAMENT);
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.GAME);
    }

    public async PreparePlayTournamentFromLoading(tournamentJson: JSON_GAME_MANAGER_TOUR) {
        this._MODE_GAME.TOURNAMENT = tournamentJson;
        this._JSON_PLAY_TOURNAMENT.LEVEL = 1;
        this._JSON_PLAY_TOURNAMENT.TIME = 0;
        this._JSON_ALL_TYPE_GAME["DASH_RUSH_CACHE"] = DataDashRush.Instance.GetOldDataCache();
        await this.SetConfigGame(TYPE_GAME.TOURNAMENT);
        ChangeSceneSys.ChangeFromLoadingToScene(MConst.NAME_SCENE.GAME);
    }

    public async PreparePlayChristmas() {
        this._JSON_PLAY_CHRISTMAS["LEVEL"] = PlayerData.Instance.XMAX_LR_progressPlayer + 1;

        await this.SetConfigGame(TYPE_GAME.CHRISTMAS);
        await DataLobbyJsonSys.Instance.SaveDataLobbyJson();
        ChangeSceneSys.ChangeSceneTo(MConst.NAME_SCENE.GAME);
    }
    //#endregion PREPARE_PLAY_GAME

    //#region RESET_GAME
    public async ResetGameNormal(listItemSupport: TYPE_ITEM[], numberKey: number = 0) {
        this.PreparePlayNormal(this._JSON_GAME.LEVEL, this._JSON_GAME.TIME, listItemSupport);
    }

    public async ResetGameDailyChallenge(listItemSupport: TYPE_ITEM[]) {
        this.PreparePlayDailyChallenge(this._MODE_GAME.DAILY_CHALLENGE.dayInfoPlay, listItemSupport);
    }
    //#endregion

    //#region get
    public get TypeGamePlay() {
        return this._typeGamePlaying;
    }

    public get JsonPreparePlayGame() {
        return this._JSON_PREPARE_PLAY_GAME;
    }

    public get JsonPlayGame() {
        return this._JSON_GAME;
    }

    public get JsonPlayTournament() {
        return this._JSON_PLAY_TOURNAMENT;
    }

    public get JsonPlayChristmas() {
        return this._JSON_PLAY_CHRISTMAS;
    }

    public get JsonAllTypeGame() {
        return this._JSON_ALL_TYPE_GAME;
    }

    public get IsNewPlayer() {
        return this._isNewPlayer;
    }

    public get ModeGame() {
        return this._MODE_GAME;
    }

    public get levelPlayerNow() {
        return PlayerData.Instance._levelPlayer;
    }
    //#endregion

    //#region set
    public UpdateNumLoseInJson() {
        this._JSON_GAME.NUM_LOSE = PlayerData.Instance._streakLose;
    }

    public SetNewPlayer(isNewPlayer: boolean) {
        this._isNewPlayer = isNewPlayer;
    }
    //#endregion

    //#region FUNC CHANGE LV JSON
    public ChangeLevelJson(level: number) {
        this._JSON_GAME.LEVEL = level;
    }

    public ChangeTimeJson(time: number) {
        this._JSON_GAME.TIME = time;
    }

    public UpdateDashRushCache() {
        this._JSON_ALL_TYPE_GAME["DASH_RUSH_CACHE"] = DataDashRush.Instance.GetOldDataCache();
    }
    public UpdateSpeedRaceCache() {
        this._JSON_ALL_TYPE_GAME["SPEED_RACE_CACHE"] = DataSpeedRace.Instance.GetOldDataCache();
    }
    //#endregion

    //#region common
    public GetLevelPlayerNow(): number {
        return PlayerData.Instance._levelPlayer;
    }

    public GetTimeSuitLevelNormal(levelCheck: number): number {
        if (levelCheck <= MConfigs.LEVEL_TUTORIAL_ITEM.BOOSTER_TIME) {
            return MConst.DEFAULT_TIME_PLAY_NORMAL_TUTORIAL_ITEM;
        }
        return MConst.DEFAULT_TIME_PLAY_NORMAL;
    }

    public CheckIsInContextTournament(contextId: string): boolean {
        if (contextId == null) return false;

        const infoTournament = DataLeaderboardSys.Instance.GetInfoLeaderboardByContextId(contextId);

        if (infoTournament != null && infoTournament.contextId == contextId && infoTournament.expireTime > (Utils.getCurrTime() + 60)) {
            return true;
        }

        return false;
    }


    //#endregion common

    //#region cheat
    public CHEAT_LEVEL(level) {
        PlayerData.Instance._levelPlayer = level;
        PlayerData.Instance._isPlayedTutorial = true;
        PlayerData.Instance.Save();
    }
    //#endregion cheat

}


