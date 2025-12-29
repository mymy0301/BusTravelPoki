import { _decorator } from 'cc';
import { PlayerSave } from './PlayerSave';
import { MConst } from '../Const/MConst';
import { DataLobbyJson, DecodeInfoBot_DashRush, DecodeInfoBot_SpeedRace, DecodeInfoBot_TreasureTrail, EncodeInfoBot_DashRush, EncodeInfoBot_SpeedRace, IGroupEventSave, EncodeInfoBot_TreasureTrail, InfoBot_DashRush, InfoBot_SpeedRace, InfoBot_TreasureTrail, InfoEventData, InfoPack, InfoPackEndlessTreasure, jsonDataLobby, jsonInfoEventData, JsonListIGroupEventSave, LANGUAGE, readJsonDataLobby, readJsonInfoEventData, ReadJsonListIGroupEventSave, TYPE_CURRENCY, TYPE_EVENT_GAME, TYPE_ITEM, TYPE_RESOURCE } from './Types';
import { MConsolLog } from '../Common/MConsolLog';
import { ItemGameInfo } from '../SerilazationData/ItemGameInfo';
import { FBInstantManager } from './facebooks/FbInstanceManager';
import { clientEvent } from '../framework/clientEvent';
import { LIFE_ConvertDataToJson, LIFE_ConvertJsonToData } from './ResourcesJson';
import { MConfigs } from '../Configs/MConfigs';
import { LEVEL_TUT_IN_GAME } from '../Scene/OtherUI/UITutorialInGame/TypeTutorialInGame';
import { ConfigLogEvent } from '../LogEvent/ConfigLogEvent';
import { CONFIG_LPr } from '../Scene/OtherUI/UILevelProgression/TypeLevelProgress';
import { MConfigFacebook } from '../Configs/MConfigFacebook';
import { CONFIG_SL } from '../Scene/OtherUI/UISkyLift/TypeSkyLift';
import { Utils } from './Utils';
import { CONFIG_LR_CHRIST } from '../Scene/OtherUI/UIChristmasEvent/LightRoad/TypeLightRoad';
import { DecodeInfoBot_HatRace, EncodeInfoBot_HatRace, InfoBot_HatRace } from '../Scene/OtherUI/UIChristmasEvent/HatRace/TypeHatRace';
const { ccclass, property } = _decorator;



/**
 * XIN HÃY LƯU Ý MỖI KHI BẠN BỔ SUNG THÊM DỮ LIỆU
 * THỨ NHẤT: 
 *      - Nếu dùng lại key lưu dữ liệu cũ xin hãy hạn chế hoặc tuyệt đối đừng xóa dữ liệu cữ của key đấy nếu không sẽ bị đọc json có thể sai lệch
 *      - Nếu muốn thêm dữ liệu trong cùng một key xin hãy luôn thêm vào dưới cùng chứ không thêm vào đầu hoặc giữa các thông tin cũ
 * THỨ HAI:
 *      - Trong trường hợp bạn muốn bổ sung hẳn một dữ liệu riêng thì hãy thêm một key mới và code lưu dữ liệu mới
 *      - hiện tại ko có thời gian note thêm nếu ai đó có thời gian xin hãy bổ sung thêm note đoạn này hướng dẫn thêm key mới.
 */

@ccclass('PlayerData')
export class PlayerData {
    public static Instance: PlayerData;

    constructor() {
        if (PlayerData.Instance == null) {
            PlayerData.Instance = this;
            clientEvent.on(MConst.FB_UPDATE_DATA_PLAYER, this.setDataFromFacebook, this);
        }
    }

    public Save() {
        this.SaveData(null, null);
    }

    public SetData(
        // basic param
        dataTutorial: any = null, infoPlayer: any = null, settingStatus: any = null, dataResources: any = null,
        dataCurrency: any = null, dataLobbyJson: any = null, dataPack: any = null, dataTournament: any = null,
        dataBuilding: any = null, dataCustoms: any = null, dataWeekly: any = null,
        // data event
        dataEventLoginReward: any = null, dataEventSpin: any = null, dataEventLevelPass: any = null,
        dataEventSeasonPass: any = null, dataEventFriendJoined: any = null, dataEventDailyQuest: any = null,
        dataEventPiggyBank: any = null, dataEventDashRush: any = null,
        dataEventSpeedRace: any = null, dataEventEndlessTreasure: any = null,
        dataEventLevelProgress: any = null, dataEventTreasureTrail: any = null,
        dataEventSkyLift: any = null,
        // log event
        dataLogEvent: any = null,
        // group event
        dataGroupEvents: any = null,
        // more events
        dataHlw: any = null,
        dataXMax: any = null,
        dataXMaxLR: any = null,
        dataXMaxHR: any = null,
        dataPackBF: any = null,
    ) {
        //===========================================
        //                  basic param
        //===========================================
        this.ReadJsonTut(dataTutorial);
        this.ReadJsonInfoPlayer(infoPlayer);
        this.ReadJsonSetting(settingStatus);
        this.ReadJsonResource(dataResources);
        this.ReadJsonCurrency(dataCurrency);
        this.ReadJsonDataLobby(dataLobbyJson);
        this.ReadJsonPack(dataPack);
        this.ReadJsonTournament(dataTournament);
        this.ReadJsonBuilding(dataBuilding);
        this.ReadJsonCustoms(dataCustoms);
        this.ReadJsonWeekly(dataWeekly);
        //===========================================
        //                  data event
        //===========================================
        this.ReadEvent_LoginReward(dataEventLoginReward);
        this.ReadEvent_Spin(dataEventSpin);
        this.ReadEvent_LevelPass(dataEventLevelPass);
        this.ReadEvent_SeasonPass(dataEventSeasonPass);
        this.ReadEvent_FriendJoined(dataEventFriendJoined);
        this.ReadEvent_DailyQuest(dataEventDailyQuest);
        this.ReadEvent_PiggyBank(dataEventPiggyBank);
        this.ReadEvent_DashRush(dataEventDashRush);
        this.ReadEvent_SpeedRace(dataEventSpeedRace);
        this.ReadEvent_EndlessTreasure(dataEventEndlessTreasure);
        this.ReadEvent_LevelProgression(dataEventLevelProgress);
        this.ReadEvent_TreasureTrail(dataEventTreasureTrail);
        this.ReadEvent_SkyLift(dataEventSkyLift);
        //===========================================
        //                  log event
        //===========================================
        this.ReadLogEvent(dataLogEvent);

        //===========================================
        //                  group event
        //===========================================
        this.ReadListEventGroups(dataGroupEvents);

        //===========================================
        //                  more events
        //===========================================
        this.ReadEvent_HLW(dataHlw);
        this.ReadEvent_Christmas(dataXMax);
        this.ReadEvent_LightRoad(dataXMaxLR);
        this.ReadEvent_HatRace(dataXMaxHR);
        this.ReadPackBlackFriday(dataPackBF);

        //===========================================
        //                  log data
        //===========================================
        // #region log data
        // console.log(this._levelPlayer);
        // console.log(this._numLose);
        // console.log(this._numWinFirstTry);
        // console.log(this._isWinFirstTry);
        // console.log(this._streakLose);
        // console.log(this._streakWin);
        // console.log(this._timeFirstPlayGame);
        // console.log(this._canShowAds);

        // console.log(this._soundEffStatus);
        // console.log(this._musicStatus);
        // console.log(this._vibrationStatus);
        // console.log(this._langueUser);
        // console.log(this._version);

        // console.log(this._currency);

        // console.log(this._isPlayedTutorial);
        // console.log(this._isReceiveItemTut);
        // console.log(this._isPlayTutorialEvent);

        // console.log(this._life);
        // console.log(this._lastTimeSaveLife);
        // console.log(this._timeInfinityLife);
        // console.log(this._lastTimeSaveInfinityLife);

        // console.log(this._infoItemSort);
        // console.log(this._infoItemShuffle);
        // console.log(this._infoItemVipSlot);

        // console.log(this._listIdTourWasClaimed);

        // console.log(this._dataLobbyJson);

        // console.log(this._infoEventSpin);
        // console.log(this._isUseFreeSpin);

        // read pack
        // console.log(this._listPacksWorking);
        // #endregion log data
    }

    public ReadDataLocal() {
        MConsolLog.Log("Read data at local");

        let data = PlayerSave.getDataStorage();

        if (data == null) {
            this.SetData();
            return;
        }

        this.SetData(
            //data basic
            data[MConst.KEY_SAVE.TUTORIAL],
            data[MConst.KEY_SAVE.DATA_GAME],
            data[MConst.KEY_SAVE.SETTING_STATUS],
            data[MConst.KEY_SAVE.RESOURCES],
            data[MConst.KEY_SAVE.CURRENCY],
            data[MConst.KEY_SAVE.DATA_LOBBY_JSON],
            data[MConst.KEY_SAVE.PACKS],
            data[MConst.KEY_SAVE.DATA_TOURNAMENTS_CLAIMED],
            data[MConst.KEY_SAVE.DATA_INFO_BUIDING],
            data[MConst.KEY_SAVE.DATA_CUSTOMS],
            data[MConst.KEY_SAVE.DATA_WEEKLY],
            // data event
            data[MConst.KEY_SAVE.EVENT_IN_GAME.LOGIN_REWARD],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.SPIN],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PASS],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.SEASON_PASS],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.FRIEND_JOINED],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.DAILY_QUEST],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.PIGGY_BANK],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.DASH_RUSH],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.SPEED_RACE],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.ENDLESS_TREASURE],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PROGRESS],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.TREASURE_TRAIL],
            data[MConst.KEY_SAVE.EVENT_IN_GAME.SKY_LIFT],
            //log event
            data[MConst.KEY_SAVE.LOG_EVENT],
            // group event
            data[MConst.KEY_SAVE.DATA_EVENT_GROUP],
            // more events
            data[MConst.KEY_SAVE.HLW],
            data[MConst.KEY_SAVE.XMAX],
            data[MConst.KEY_SAVE.XMAX_EVENT_LR],
            data[MConst.KEY_SAVE.XMAX_EVENT_HR],
            data[MConst.KEY_SAVE.PACK_BF]
        );

    }

    /**
    * this func will convert the data player has to save on facebook
    */
    public getDataToSaveOnFacebook() {
        // convert json data game

        //===========================================
        //                  data game
        //===========================================
        const dataGame = this.SaveInfoPlayer(false);
        const dataTutorial = this.SaveTut(false);
        const settingStatus = this.SaveSettingStatus(false);
        const dataResources = this.SaveResources(false);
        const dataCurrency = this.SaveCurrency(false);
        const dataLobbyJson = this.SaveDataLobbyJson(false);
        const dataPack = this.SaveDataPack(false);
        const dataTournament = this.SaveTouranmentData(false);
        const dataBuilding = this.SaveBuilding(false);
        const dataCustoms = this.SaveCustoms(false);
        const dataWeekly = this.SaveWeekly(false);
        //===========================================
        //                  data event
        //===========================================

        const dataEventLoginReward = this.SaveEvent_LoginReward(false);
        const dataEventSpin = this.SaveEvent_Spin(false);
        const dataEventLevelPass = this.SaveEvent_LevelPass(false);
        const dataEventSeasonPass = this.SaveEvent_SeasonPass(false);
        const dataEventFriendJoined = this.SaveEvent_FriendJoined(false);
        const dataEventDailyQuest = this.SaveEvent_DailyQuest(false);
        const dataEventPiggyBank = this.SaveEvent_PiggyBank(false);
        const dataEventDashRush = this.SaveEvent_DashRush(false);
        const dataEventSpeedRace = this.SaveEvent_SpeedRace(false);
        const dataEventEndlessTreasure = this.SaveEvent_EndlessTreasure(false);
        const dataEventLevelProgression = this.SaveEvent_LevelProgression(false);
        const dataEventTreasureTrail = this.SaveEvent_TreasureTrail(false);
        const dataEventSkyLift = this.SaveEvent_SkyLift(false);
        //===========================================
        //                  log event
        //===========================================
        const dataLogEvent = this.SaveLogEvent(false);

        //===========================================
        //                  log event
        //===========================================
        const dataEventGroup = this.SaveListEventGroups(false);

        //===========================================
        //                  more event
        //===========================================
        const dataEventHlw = this.SaveEvent_HLW(false);
        const dataEventChirstmas = this.SaveEvent_Christmas(false);
        const dataEventXMaxLR = this.SaveEvent_LightRoad(false);
        const dataEventXMaxHR = this.SaveEvent_HatRace(false);
        const dataPackBF = this.SavePackBlackFriday(false);

        // convert to data facebook
        let data = {
            // basic
            [MConst.KEY_SAVE.TUTORIAL]: dataTutorial,
            [MConst.KEY_SAVE.DATA_GAME]: dataGame,
            [MConst.KEY_SAVE.SETTING_STATUS]: settingStatus,
            [MConst.KEY_SAVE.RESOURCES]: dataResources,
            [MConst.KEY_SAVE.CURRENCY]: dataCurrency,
            [MConst.KEY_SAVE.DATA_LOBBY_JSON]: dataLobbyJson,
            [MConst.KEY_SAVE.PACKS]: dataPack,
            [MConst.KEY_SAVE.DATA_TOURNAMENTS_CLAIMED]: dataTournament,
            [MConst.KEY_SAVE.DATA_INFO_BUIDING]: dataBuilding,
            [MConst.KEY_SAVE.DATA_CUSTOMS]: dataCustoms,
            [MConst.KEY_SAVE.DATA_WEEKLY]: dataWeekly,
            // event in game
            [MConst.KEY_SAVE.EVENT_IN_GAME.LOGIN_REWARD]: dataEventLoginReward,
            [MConst.KEY_SAVE.EVENT_IN_GAME.SPIN]: dataEventSpin,
            [MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PASS]: dataEventLevelPass,
            [MConst.KEY_SAVE.EVENT_IN_GAME.SEASON_PASS]: dataEventSeasonPass,
            [MConst.KEY_SAVE.EVENT_IN_GAME.FRIEND_JOINED]: dataEventFriendJoined,
            [MConst.KEY_SAVE.EVENT_IN_GAME.DAILY_QUEST]: dataEventDailyQuest,
            [MConst.KEY_SAVE.EVENT_IN_GAME.PIGGY_BANK]: dataEventPiggyBank,
            [MConst.KEY_SAVE.EVENT_IN_GAME.DASH_RUSH]: dataEventDashRush,
            [MConst.KEY_SAVE.EVENT_IN_GAME.SPEED_RACE]: dataEventSpeedRace,
            [MConst.KEY_SAVE.EVENT_IN_GAME.ENDLESS_TREASURE]: dataEventEndlessTreasure,
            [MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PROGRESS]: dataEventLevelProgression,
            [MConst.KEY_SAVE.EVENT_IN_GAME.TREASURE_TRAIL]: dataEventTreasureTrail,
            [MConst.KEY_SAVE.EVENT_IN_GAME.SKY_LIFT]: dataEventSkyLift,
            // log event
            [MConst.KEY_SAVE.LOG_EVENT]: dataLogEvent,
            [MConst.KEY_SAVE.DATA_EVENT_GROUP]: dataEventGroup,
            // more event
            [MConst.KEY_SAVE.HLW]: dataEventHlw,
            [MConst.KEY_SAVE.XMAX]: dataEventChirstmas,
            [MConst.KEY_SAVE.XMAX_EVENT_LR]: dataEventXMaxLR,
            [MConst.KEY_SAVE.XMAX_EVENT_HR]: dataEventXMaxHR,
            [MConst.KEY_SAVE.PACK_BF]: dataPackBF
        };

        MConsolLog.Warn("data was getted to save on facebook is ", data);
        return JSON.stringify(data);
    }

    public setDataFromFacebook(data: any) {
        if (data == null || data == undefined) {
            clientEvent.dispatchEvent(MConst.FB_READY_LOAD);
            return;
        }

        MConsolLog.Warn("data was saved on facebook is ", data);

        // basic
        let dataTutorial = data[MConst.KEY_SAVE.TUTORIAL];
        let infoPlayer = data[MConst.KEY_SAVE.DATA_GAME];
        let settingStatus = data[MConst.KEY_SAVE.SETTING_STATUS];
        let dataResources = data[MConst.KEY_SAVE.RESOURCES];
        let dataCurrency = data[MConst.KEY_SAVE.CURRENCY];
        let dataLobbyJson = data[MConst.KEY_SAVE.DATA_LOBBY_JSON];
        let dataPack = data[MConst.KEY_SAVE.PACKS];
        let dataTournament = data[MConst.KEY_SAVE.DATA_TOURNAMENTS_CLAIMED];
        let dataBuilding = data[MConst.KEY_SAVE.DATA_INFO_BUIDING]
        let dataCustoms = data[MConst.KEY_SAVE.DATA_CUSTOMS];
        let dataWeekly = data[MConst.KEY_SAVE.DATA_WEEKLY];
        // event in game
        let dataEventLoginReward = data[MConst.KEY_SAVE.EVENT_IN_GAME.LOGIN_REWARD];
        let dataEventSpin = data[MConst.KEY_SAVE.EVENT_IN_GAME.SPIN];
        let dataEventLevelPass = data[MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PASS];
        let dataEventSeasonPass = data[MConst.KEY_SAVE.EVENT_IN_GAME.SEASON_PASS];
        let dataEventFriendJoined = data[MConst.KEY_SAVE.EVENT_IN_GAME.FRIEND_JOINED];
        let dataEventDailyQuest = data[MConst.KEY_SAVE.EVENT_IN_GAME.DAILY_QUEST];
        let dataEventPiggyBank = data[MConst.KEY_SAVE.EVENT_IN_GAME.PIGGY_BANK];
        let dataEventDashRush = data[MConst.KEY_SAVE.EVENT_IN_GAME.DASH_RUSH];
        let dataEventSpeedRace = data[MConst.KEY_SAVE.EVENT_IN_GAME.SPEED_RACE];
        let dataEventEndlessTreasure = data[MConst.KEY_SAVE.EVENT_IN_GAME.ENDLESS_TREASURE];
        let dataEventLevelProgression = data[MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PROGRESS];
        let dataEventTreasureTrail = data[MConst.KEY_SAVE.EVENT_IN_GAME.TREASURE_TRAIL];
        let dataEventSkyLift = data[MConst.KEY_SAVE.EVENT_IN_GAME.SKY_LIFT];
        // log event
        let dataLogEvent = data[MConst.KEY_SAVE.LOG_EVENT];
        // event group
        let dataEventGroup = data[MConst.KEY_SAVE.DATA_EVENT_GROUP];
        // more events
        let dataEventHlw = data[MConst.KEY_SAVE.HLW];
        let dataEventChirstmas = data[MConst.KEY_SAVE.XMAX];
        let dataEventLightRoad = data[MConst.KEY_SAVE.XMAX_EVENT_LR];
        let dataEventHatRace = data[MConst.KEY_SAVE.XMAX_EVENT_HR];
        let dataPackBF = data[MConst.KEY_SAVE.PACK_BF];

        this.SetData(
            dataTutorial, infoPlayer, settingStatus, dataResources, dataCurrency, dataLobbyJson, dataPack, dataTournament, dataBuilding, dataCustoms, dataWeekly
            , dataEventLoginReward, dataEventSpin, dataEventLevelPass, dataEventSeasonPass, dataEventFriendJoined, dataEventDailyQuest, dataEventPiggyBank, dataEventDashRush
            , dataEventSpeedRace, dataEventEndlessTreasure, dataEventLevelProgression, dataEventTreasureTrail, dataEventSkyLift,
            dataLogEvent, dataEventGroup, dataEventHlw, dataEventChirstmas, dataEventLightRoad, dataEventHatRace, dataPackBF
        );

        clientEvent.dispatchEvent(MConst.FB_READY_LOAD);
    }

    //#region Daily Challenge
    public _infoEventDailyQuest: InfoEventData = new InfoEventData();
    public _dailyQuest_progressQuest: string = '';
    public _dailyQuest_listIsReceive: boolean[] = new Array(MConfigs.MAX_DAILY_QUEST_PER_DAY).fill(false);

    public SaveEvent_DailyQuest(needSaveData: boolean = true) {
        let keyJson = ``;
        keyJson = addStringToSaveData(keyJson, jsonInfoEventData(this._infoEventDailyQuest));
        keyJson = addStringToSaveData(keyJson, this._dailyQuest_progressQuest);
        keyJson = addStringToSaveData(keyJson, minimalistListBoolean(this._dailyQuest_listIsReceive), false);
        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.DAILY_QUEST, keyJson);
        }
        return keyJson;
    }

    private ReadEvent_DailyQuest(dataJson: any) {
        if (dataJson == null || dataJson == undefined) return;
        // console.log("data before split", dataJson);
        const listDailyQuest = dataJson.split(`|`);
        // console.log("data after split", listDailyQuest);
        if (listDailyQuest == null || listDailyQuest == undefined) return;
        if (listDailyQuest[0] != null) readJsonInfoEventData(this._infoEventDailyQuest, listDailyQuest[0]);
        if (listDailyQuest[1] != null) this._dailyQuest_progressQuest = listDailyQuest[1];
        if (listDailyQuest[2] != null) this._dailyQuest_listIsReceive = readMinimalistListBoolean(listDailyQuest[2]);

        // console.log("data after encode", this._dailyQuest_progressQuest);

    }
    //#endregion Daily Challenge

    //#region Tutorial
    public _isPlayedTutorial: boolean = false;
    public _isReceiveItemTut: boolean[] = new Array(Object.keys(LEVEL_TUT_IN_GAME).length / 2).fill(false);
    public _isPlayTutorialEvent: boolean[] = new Array(Object.keys(TYPE_EVENT_GAME).length).fill(false);
    public _isPlayTutorialBuilding: boolean = false;
    public _isReceiveAllItemTut_1: boolean = false;
    /**
     * remember call one of this code below before call this function to save right data
     * ```
     * ```
     * this._isPlayTutorialEvent[idx] = true;
     * ```
     * ```
     * this._isReceiveItemTut[idx] = true;
     * ```
     * ```
     * this._isPlayedTutorial = true;
     * @param needSaveData 
     * @returns JSON
     */
    public SaveTut(needSaveData: boolean = true) {
        let keyJson = ``;
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._isPlayedTutorial));
        keyJson = addStringToSaveData(keyJson, minimalistListBoolean(this._isReceiveItemTut));
        keyJson = addStringToSaveData(keyJson, minimalistListBoolean(this._isPlayTutorialEvent));
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._isPlayTutorialBuilding));
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._isReceiveAllItemTut_1), false);
        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.TUTORIAL, keyJson.toString());
        }

        return keyJson;
    }

    private ReadJsonTut(dataJson: any) {
        try {
            if (dataJson == null || dataJson == undefined) { return; }
            const listDataTut = dataJson.split("|");

            if (listDataTut[0] != null && listDataTut[0][0] != null) this._isPlayedTutorial = readMinimalistBoolean(listDataTut[0][0]);
            if (listDataTut[1] != null) this._isReceiveItemTut = readMinimalistListBoolean(listDataTut[1]);
            if (listDataTut[2] != null) {
                const resultOldEvent = readMinimalistListBoolean(listDataTut[2]);
                const distance = this._isPlayTutorialEvent.length - resultOldEvent.length;
                if (distance == 0 || distance < 0) {
                    this._isPlayTutorialEvent = resultOldEvent;
                } else {
                    this._isPlayTutorialEvent = [...resultOldEvent, ...new Array(distance).fill(false)]
                }
            };
            if (listDataTut[3] != null) this._isPlayTutorialBuilding = readMinimalistBoolean(listDataTut[3]);
            if (listDataTut[4] != null) this._isReceiveAllItemTut_1 = readMinimalistBoolean(listDataTut[4]);
        } catch (e) {
            console.error("Save tut wrong", e);
        }

        if (dataJson == null) { return; }
    }
    //#endregion Tutorial

    //#region Setting
    public _soundEffStatus: boolean = true;
    public _musicStatus: boolean = true;
    public _vibrationStatus: boolean = false;
    private _langueUser: LANGUAGE = LANGUAGE.EN;
    public _version: string = '0.0.1';
    /**
     * 
     * @param needSaveData 
     * @returns JSON
     */
    public SaveSettingStatus(needSaveData: boolean = true) {
        let keyJson = ``;

        // update version game
        this._version = MConfigs.VERSION_GAME_NOW;

        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._soundEffStatus));
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._musicStatus));
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._vibrationStatus));
        keyJson = addStringToSaveData(keyJson, this._langueUser.toString());
        keyJson = addStringToSaveData(keyJson, this._version.toString(), false);
        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.SETTING_STATUS, keyJson);
        }

        return keyJson;
    }
    private ReadJsonSetting(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }

        const parts = dataJson.split("|");
        if (parts[0] != null && parts[0] != undefined) this._soundEffStatus = readMinimalistBoolean(parts[0]);
        if (parts[1] != null && parts[2] != undefined) this._musicStatus = readMinimalistBoolean(parts[1]);
        if (parts[2] != null && parts[2] != undefined) this._vibrationStatus = readMinimalistBoolean(parts[2]);
        if (parts[3] != null && parts[3] != undefined) this._langueUser = parts[3];
        if (parts[4] != null && parts[4] != undefined) this._version = parts[4];

        // console.log("111111", this._langueUser, parts[3]);

    }
    //#endregion Setting

    //#region Resources
    // life    
    public _life: number = 5;
    public _lastTimeSaveLife: number = 0;
    public _timeInfinityLife: number = 0;
    public _lastTimeSaveInfinityLife: number = 0;

    // items
    public _infoItemSort: ItemGameInfo = new ItemGameInfo();
    public _infoItemShuffle: ItemGameInfo = new ItemGameInfo();
    public _infoItemVipSlot: ItemGameInfo = new ItemGameInfo();
    public _infoItemTime: ItemGameInfo = new ItemGameInfo();
    public _infoItemMagnifyingGlass: ItemGameInfo = new ItemGameInfo();
    public _infoItemHammer: ItemGameInfo = new ItemGameInfo();

    public _coinConsumed: number = 0;
    public _sortConsumed: number = 0;
    public _shuffleConsumed: number = 0;
    public _vipConsumed: number = 0;
    public _skipAdsConsumed: number = 0;

    public SaveResources(needSaveData: boolean = true) {
        let keyJson = ``;
        // =========================== life ==========================
        let dataLife = LIFE_ConvertDataToJson(this._life,
            this._timeInfinityLife,
            this._lastTimeSaveLife,
            this._lastTimeSaveInfinityLife
        )
        keyJson = addStringToSaveData(keyJson, dataLife);

        //============================ booster =======================
        let dataBoosterShuffle = this._infoItemShuffle.getJSONSave();
        let dataBoosterSort = this._infoItemSort.getJSONSave();
        let dataBoosterVipSlot = this._infoItemVipSlot.getJSONSave();
        let dataBoosterTime = this._infoItemTime.getJSONSave();
        let dataBoosterMagnifyingGlass = this._infoItemMagnifyingGlass.getJSONSave();
        let dataBoosterHammer = this._infoItemHammer.getJSONSave();
        keyJson = addStringToSaveData(keyJson, dataBoosterShuffle);
        keyJson = addStringToSaveData(keyJson, dataBoosterSort);
        keyJson = addStringToSaveData(keyJson, dataBoosterVipSlot);
        keyJson = addStringToSaveData(keyJson, dataBoosterTime);
        keyJson = addStringToSaveData(keyJson, dataBoosterMagnifyingGlass);
        keyJson = addStringToSaveData(keyJson, dataBoosterHammer);

        // add consumed data
        let dataConsumed = '';
        dataConsumed = addAnyToSaveData(dataConsumed, this._coinConsumed.toString(), true, ",");
        dataConsumed = addAnyToSaveData(dataConsumed, this._sortConsumed.toString(), true, ",");
        dataConsumed = addAnyToSaveData(dataConsumed, this._shuffleConsumed.toString(), true, ",");
        dataConsumed = addAnyToSaveData(dataConsumed, this._vipConsumed.toString(), true, ",");
        dataConsumed = addAnyToSaveData(dataConsumed, this._skipAdsConsumed.toString(), false);

        keyJson = addStringToSaveData(keyJson, dataConsumed, false);

        // console.log("resources", keyJson);


        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.RESOURCES, keyJson.toString());
        }

        return keyJson;
    }

    private ReadJsonResource(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }

        const parts = dataJson.split("|");
        //#region life
        if (parts[0] != null) {
            let dataLife = LIFE_ConvertJsonToData(parts[0]);
            this._life = dataLife.numLife;
            this._lastTimeSaveLife = dataLife.lastTimeSaveLife;
            this._timeInfinityLife = dataLife.timeInfinityLife;
            this._lastTimeSaveInfinityLife = dataLife.lastTimeSaveInfinityLife;
        }
        //#endregion life

        //#region booster
        if (parts[1] != null) { this._infoItemShuffle.convertJsonToData(parts[1]); }
        if (parts[2] != null) { this._infoItemSort.convertJsonToData(parts[2]); }
        if (parts[3] != null) { this._infoItemVipSlot.convertJsonToData(parts[3]); }
        if (parts[4] != null) { this._infoItemTime.convertJsonToData(parts[4]); }
        if (parts[5] != null) { this._infoItemMagnifyingGlass.convertJsonToData(parts[5]); }
        if (parts[6] != null) { this._infoItemHammer.convertJsonToData(parts[6]); }
        if (parts[7] != null && parts[7] != '') {
            try {
                let dataConsumed = parts[7].split(",");
                if (dataConsumed[0] != null && dataConsumed[0] != undefined && dataConsumed[0] != '') this._coinConsumed = Number.parseInt(dataConsumed[0]);
                if (dataConsumed[1] != null && dataConsumed[1] != undefined && dataConsumed[1] != '') this._sortConsumed = Number.parseInt(dataConsumed[1]);
                if (dataConsumed[2] != null && dataConsumed[2] != undefined && dataConsumed[2] != '') this._shuffleConsumed = Number.parseInt(dataConsumed[2]);
                if (dataConsumed[3] != null && dataConsumed[3] != undefined && dataConsumed[3] != '') this._vipConsumed = Number.parseInt(dataConsumed[3]);
                if (dataConsumed[4] != null && dataConsumed[4] != undefined && dataConsumed[4] != '') this._skipAdsConsumed = Number.parseInt(dataConsumed[4]);
            } catch (e) {
            }
        }
        //#endregion booster
    }
    //#endregion resources

    //#region Currency
    /**
     * =============== CURRENCY ========================
     * It follow order of the enum TYPE_CURRENCY
     * 1_money
     * 2_ticket
     */
    public _currency: number[] = new Array(Object.keys(TYPE_CURRENCY).length).fill(0);
    public SaveCurrency(needSaveData: boolean = true) {
        // để đảm bảo ko bao h lỗi
        this._currency.forEach(element => {
            if (element < 0) {
                element = 0;
            }
        })

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.CURRENCY, this._currency);
        }

        return this._currency;
    }
    private ReadJsonCurrency(dataJson: string) {
        if (dataJson == null || dataJson == undefined) { return; }

        this._currency = dataJson as any as number[];
    }
    //#endregion currency

    //#region Info player
    public _levelPlayer: number = 0;
    public _numLose: number = 0;
    public _numWinFirstTry: number = 0;
    public _isWinFirstTry: boolean = true;
    public _streakLose: number = 0;
    public _streakWin: number = 0;
    public _timeFirstPlayGame: number = 0;
    private _canShowAds: boolean = true; public get CanShowAds() { return this._canShowAds; } public SetCanShowAds(value: boolean) { this._canShowAds = value; }
    public _raceWon: number = 0;
    public _leaguesWon: number = 0;
    public _isChangeNameFirstTime: boolean = false;
    public _timeShopFreeAdsLastTime: number = 0;
    public _numShopFreeCoinAdsToday: number = 0;
    public _timeSaveCoinAdsToday: number = 0;
    public _isReceiveFreeCoinToday: boolean = false;
    public _infoPlayer_isReceivePrizeFollowPage: boolean = false;
    public _infoPlayer_isReceivePrizeJoinGroup: boolean = false;
    public _bestWinStreak: number = 0;
    public _isPlayingInGame: boolean = false;
    public _isPlayingInGameChrist: boolean = false;
    public _mapIAPWasBought: Map<string, number> = new Map();

    public SaveInfoPlayer(needSaveData: boolean = true) {
        let keyJson = ``;
        keyJson = addStringToSaveData(keyJson, this._levelPlayer);
        keyJson = addStringToSaveData(keyJson, this._numLose);
        keyJson = addStringToSaveData(keyJson, this._numWinFirstTry);
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._isWinFirstTry));
        keyJson = addStringToSaveData(keyJson, this._streakLose);
        keyJson = addStringToSaveData(keyJson, this._streakWin);
        keyJson = addStringToSaveData(keyJson, this._timeFirstPlayGame);
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._canShowAds));
        keyJson = addStringToSaveData(keyJson, this._raceWon);
        keyJson = addStringToSaveData(keyJson, this._leaguesWon);
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._canShowAds));
        keyJson = addStringToSaveData(keyJson, this._timeShopFreeAdsLastTime);
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._infoPlayer_isReceivePrizeFollowPage));
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._infoPlayer_isReceivePrizeJoinGroup));
        keyJson = addStringToSaveData(keyJson, this._numShopFreeCoinAdsToday);
        keyJson = addStringToSaveData(keyJson, this._timeSaveCoinAdsToday);
        keyJson = addStringToSaveData(keyJson, this._bestWinStreak);
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._isReceiveFreeCoinToday));
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._isPlayingInGame));
        // Convert _mapIAPWasBought to a string for saving
        const mapIAPWasBoughtStr = JSON.stringify(Array.from(this._mapIAPWasBought.entries()));
        keyJson = addStringToSaveData(keyJson, mapIAPWasBoughtStr);
        keyJson = addStringToSaveData(keyJson, minimalistBoolean(this._isPlayingInGameChrist), false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.DATA_GAME, keyJson);
        }

        return keyJson;
    }
    private ReadJsonInfoPlayer(dataJson: string) {
        if (dataJson == null || dataJson == undefined) { return; }

        const parts = dataJson.split("|");
        if (parts == null || parts == undefined) { return; }

        if (parts[0] != null) this._levelPlayer = Number.parseInt(parts[0]);
        if (parts[1] != null) this._numLose = Number.parseInt(parts[1]);
        if (parts[2] != null) this._numWinFirstTry = Number.parseInt(parts[2]);
        if (parts[3] != null) this._isWinFirstTry = readMinimalistBoolean(parts[3]);
        if (parts[4] != null) this._streakLose = Number.parseInt(parts[4]);
        if (parts[5] != null) this._streakWin = Number.parseInt(parts[5]);
        if (parts[6] != null) this._timeFirstPlayGame = Number.parseInt(parts[6]);
        if (parts[7] != null) this._canShowAds = readMinimalistBoolean(parts[7]);
        if (parts[8] != null) this._raceWon = Number.parseInt(parts[8]);
        if (parts[9] != null) this._leaguesWon = Number.parseInt(parts[9]);
        if (parts[10] != null) this._canShowAds = readMinimalistBoolean(parts[10]);
        if (parts[11] != null) this._timeShopFreeAdsLastTime = Number.parseInt(parts[11]);
        if (parts[12] != null) this._infoPlayer_isReceivePrizeFollowPage = readMinimalistBoolean(parts[12]);
        if (parts[13] != null) this._infoPlayer_isReceivePrizeJoinGroup = readMinimalistBoolean(parts[13]);
        if (parts[14] != null && parts[14] != '') this._numShopFreeCoinAdsToday = Number.parseInt(parts[14]);
        if (parts[15] != null && parts[15] != '') this._timeSaveCoinAdsToday = Number.parseInt(parts[15]);
        if (parts[16] != null && parts[16] != '') this._bestWinStreak = Number.parseInt(parts[16]);
        if (parts[17] != null && parts[17] != '') this._isReceiveFreeCoinToday = readMinimalistBoolean(parts[17]);
        if (parts[18] != null && parts[18] != '') this._isPlayingInGame = readMinimalistBoolean(parts[18]);
        if (parts[19] != null && parts[19] != '') {
            const parsedObj = JSON.parse(parts[19]);
            this._mapIAPWasBought = new Map<string, number>(parsedObj);
        }
        if (parts[20] != null && parts[20] != '') { this._isPlayingInGameChrist = readMinimalistBoolean(parts[20]) }
    }

    public setGlobalData_CurrLanguage(langue: LANGUAGE) {
        this._langueUser = langue;
        PlayerData.Instance.SaveSettingStatus();
    }

    public getGlobalData_CurrLanguage(): LANGUAGE {
        return this._langueUser;
    }
    //#endregion info player

    //#region Customs
    public _customs_trail_idChoice: string = "0";
    public _customs_trail_listProgressTrail: Map<string, number> = new Map<string, number>();

    public SaveCustoms(needSaveData: boolean = true): string {
        let keyJson = ``;
        //====================== trail ==================================
        let keyJsonTrail = ``;
        keyJsonTrail = addDataInSameEvent(keyJsonTrail, this._customs_trail_idChoice, false);
        keyJsonTrail = addDataInSameEvent(keyJsonTrail, JSON.stringify(this._customs_trail_listProgressTrail));

        keyJson = addStringToSaveData(keyJson, keyJsonTrail, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.DATA_CUSTOMS, keyJson);
        }

        return keyJson;
    }

    public ReadJsonCustoms(dataJson: string) {
        if (dataJson == null || dataJson == undefined || dataJson == "") { return; }
        const parts = dataJson.split("|");
        if (parts == null || parts == undefined || dataJson == "") { return; }

        // ============= trail ================
        const part_trail = parts[0];
        if (part_trail != null) {
            const data_trail = part_trail.split("-");
            if (data_trail != null && data_trail != undefined) {
                if (data_trail[0] != null && data_trail[0] != undefined && data_trail[0] != "") this._customs_trail_idChoice = data_trail[0];
                if (data_trail[1] != null && data_trail[1] != undefined && data_trail[1] != "{}") this._customs_trail_listProgressTrail = JSON.parse(data_trail[1]) as Map<string, number>;
            }
        }
    }
    //#endregion Customs

    //#region DataLobbyJson
    public _dataLobbyJson: DataLobbyJson = new DataLobbyJson();
    public SaveDataLobbyJson(needSaveData: boolean = true) {
        let keyJsonLobby = jsonDataLobby(this._dataLobbyJson);
        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.DATA_LOBBY_JSON, keyJsonLobby);
        }

        return keyJsonLobby;
    }
    private ReadJsonDataLobby(dataJson: any) {
        if (dataJson == null || dataJson == undefined || dataJson == "") { return; }

        this._dataLobbyJson = readJsonDataLobby(dataJson);
    }
    //#endregion DataLobbyJson

    //#region Friend joined
    public _listIdFriendJoined: string[] = [];

    public SaveEvent_FriendJoined(needSaveData: boolean = true) {
        let jsonFriendJoined = '';
        jsonFriendJoined = this._listIdFriendJoined.toString();

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.FRIEND_JOINED, jsonFriendJoined);
        }

        return jsonFriendJoined;
    }
    private ReadEvent_FriendJoined(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }

        this._listIdFriendJoined = dataJson.split(',').filter(x => x != '');
    }
    //#endregion Friend joined

    //#region Season Pass
    public _infoEventSeasonPass: InfoEventData = new InfoEventData();
    public _seasonPass_isActive: boolean = false;
    public _seasonPass_listPrizeFreeClaimed: boolean[] = new Array(MConfigs.MAX_PRIZE_SEASON_PASS).fill(false);
    public _seasonPass_listPrizePreniumClaimed: boolean[] = new Array(MConfigs.MAX_PRIZE_SEASON_PASS).fill(false);
    public _seasonPass_timeDistanceCustom: number = 0;
    public _timeEndX2KeySeasonPass: number = 0;
    public _SP_isReceivePrizeWhenEndEvent: boolean = false;
    public _SP_isReceveiveLastOldTypeSeasonPass: boolean = false;
    public _SP_isFinishEvent: boolean = false;
    public SaveEvent_SeasonPass(needSaveData: boolean = true) {
        let jsonEvent_SeasonPass = "";

        const infoEventSeasonPass = jsonInfoEventData(this._infoEventSeasonPass);
        const seasonPassIsActive = minimalistBoolean(this._seasonPass_isActive);
        const seasonPass_listPrizeFreeClaimed = minimalistListBoolean(this._seasonPass_listPrizeFreeClaimed);
        const seasonPass_listPrizePreniumClaimed = minimalistListBoolean(this._seasonPass_listPrizePreniumClaimed);
        const seasonPass_timeDistanceCustom = this._seasonPass_timeDistanceCustom;
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, infoEventSeasonPass, false);
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, seasonPassIsActive);
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, seasonPass_listPrizeFreeClaimed);
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, seasonPass_listPrizePreniumClaimed);
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, seasonPass_timeDistanceCustom.toString());
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, this._timeEndX2KeySeasonPass.toString());
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, minimalistBoolean(this._SP_isReceivePrizeWhenEndEvent));
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, minimalistBoolean(this._SP_isReceveiveLastOldTypeSeasonPass));
        jsonEvent_SeasonPass = addDataInSameEvent(jsonEvent_SeasonPass, minimalistBoolean(this._SP_isFinishEvent));

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.SEASON_PASS, jsonEvent_SeasonPass);
        }

        return jsonEvent_SeasonPass;
    }
    private ReadEvent_SeasonPass(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listDataSeasonPass: string[] = dataJson.split(`-`);
        if (listDataSeasonPass == null || listDataSeasonPass == undefined) { return; }

        if (listDataSeasonPass[0] != null) readJsonInfoEventData(this._infoEventSeasonPass, listDataSeasonPass[0]);
        if (listDataSeasonPass[1] != null) this._seasonPass_isActive = readMinimalistBoolean(listDataSeasonPass[1]);
        if (listDataSeasonPass[2] != null) this._seasonPass_listPrizeFreeClaimed = readMinimalistListBoolean(listDataSeasonPass[2]);
        if (listDataSeasonPass[3] != null) this._seasonPass_listPrizePreniumClaimed = readMinimalistListBoolean(listDataSeasonPass[3]);
        if (listDataSeasonPass[4] != null) this._seasonPass_timeDistanceCustom = Number.parseInt(listDataSeasonPass[4]);
        if (listDataSeasonPass[5] != null) this._timeEndX2KeySeasonPass = Number.parseInt(listDataSeasonPass[5]);
        if (listDataSeasonPass[6] != null && listDataSeasonPass[6] != undefined) this._SP_isReceivePrizeWhenEndEvent = readMinimalistBoolean(listDataSeasonPass[6]);
        if (listDataSeasonPass[7] != null && listDataSeasonPass[7] != undefined) this._SP_isReceveiveLastOldTypeSeasonPass = readMinimalistBoolean(listDataSeasonPass[7]);
        if (listDataSeasonPass[8] != null && listDataSeasonPass[8] != undefined) this._SP_isFinishEvent = readMinimalistBoolean(listDataSeasonPass[8]);
    }
    //#endregion Season Pass

    //#region Level Pass
    public _infoEventLevelPass: InfoEventData = new InfoEventData();
    public _levelPass_isActive: boolean = false;
    public _levelPass_listPrizeFreeClaimed: boolean[] = new Array(MConfigs.MAX_PRIZE_LEVEL_PASS).fill(false);
    public _levelPass_listPrizePreniumClaimed: boolean[] = new Array(MConfigs.MAX_PRIZE_LEVEL_PASS).fill(false);
    public _levelPass_timeDistanceCustom: number = 0;
    public _LP_isReceivePrizeWhenEndEvent: boolean = false;
    public _LP_isReceveiveLastOldTypeLevelPass: boolean = false;
    public _LP_isFinishEvent: boolean = false;
    public SaveEvent_LevelPass(needSaveData: boolean = true) {
        let jsonEvent_LevelPass = "";

        const infoEventLevelPass = jsonInfoEventData(this._infoEventLevelPass);
        const levelPassIsActive = minimalistBoolean(this._levelPass_isActive);
        const levelPass_listPrizeFreeClaimed = minimalistListBoolean(this._levelPass_listPrizeFreeClaimed);
        const levelPass_listPrizePreniumClaimed = minimalistListBoolean(this._levelPass_listPrizePreniumClaimed);
        const levelPass_timeDistanceCustom = this._levelPass_timeDistanceCustom;
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, infoEventLevelPass, false);
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, levelPassIsActive);
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, levelPass_listPrizeFreeClaimed);
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, levelPass_listPrizePreniumClaimed);
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, levelPass_timeDistanceCustom.toString());
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, minimalistBoolean(this._LP_isReceivePrizeWhenEndEvent));
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, minimalistBoolean(this._LP_isReceveiveLastOldTypeLevelPass));
        jsonEvent_LevelPass = addDataInSameEvent(jsonEvent_LevelPass, minimalistBoolean(this._LP_isFinishEvent));

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PASS, JSON.stringify(jsonEvent_LevelPass));
        }
        return jsonEvent_LevelPass;
    }

    private ReadEvent_LevelPass(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listDataLevelPass: string[] = dataJson.split(`-`);
        if (listDataLevelPass == null || listDataLevelPass == undefined || listDataLevelPass.length == 0) { return; }

        if (listDataLevelPass[0] != null) readJsonInfoEventData(this._infoEventLevelPass, listDataLevelPass[0]);
        if (listDataLevelPass[1] != null) this._levelPass_isActive = readMinimalistBoolean(listDataLevelPass[1]);
        if (listDataLevelPass[2] != null) this._levelPass_listPrizeFreeClaimed = readMinimalistListBoolean(listDataLevelPass[2]);
        if (listDataLevelPass[3] != null) this._levelPass_listPrizePreniumClaimed = readMinimalistListBoolean(listDataLevelPass[3]);
        if (listDataLevelPass[4] != null) this._levelPass_timeDistanceCustom = Number.parseInt(listDataLevelPass[4]);
        if (listDataLevelPass[5] != null && listDataLevelPass[5] != undefined) this._LP_isReceivePrizeWhenEndEvent = readMinimalistBoolean(listDataLevelPass[5]);
        if (listDataLevelPass[6] != null && listDataLevelPass[6] != undefined) this._LP_isReceveiveLastOldTypeLevelPass = readMinimalistBoolean(listDataLevelPass[6]);
        if (listDataLevelPass[7] != null && listDataLevelPass[7] != undefined) this._LP_isFinishEvent = readMinimalistBoolean(listDataLevelPass[7]);
    }
    //#endregion Level Pass

    //#region Spin
    public _infoEventSpin: InfoEventData = new InfoEventData();
    public _isUseFreeSpin: boolean = false;
    public _numUseAdsSpin: number = 0;
    public _isHasSpeItem: boolean = false;
    public _listPrizeSpinIsReceive: boolean[] = new Array(MConfigs.MAX_PRIZE_SPIN).fill(false);
    public _numPrizeSpecialCanReceive: number = 0;
    public _timeLastWatchAdsSpin: number = 0;
    public SaveEvent_Spin(needSaveData: boolean = true) {
        let jsonEvent_Spin: string = "";

        const infoEventSpin = jsonInfoEventData(this._infoEventSpin);
        jsonEvent_Spin = addDataInSameEvent(jsonEvent_Spin, infoEventSpin, false);
        jsonEvent_Spin = addDataInSameEvent(jsonEvent_Spin, minimalistBoolean(this._isUseFreeSpin));
        jsonEvent_Spin = addDataInSameEvent(jsonEvent_Spin, this._numUseAdsSpin.toString());
        jsonEvent_Spin = addDataInSameEvent(jsonEvent_Spin, minimalistBoolean(this._isHasSpeItem));
        jsonEvent_Spin = addDataInSameEvent(jsonEvent_Spin, minimalistListBoolean(this._listPrizeSpinIsReceive));
        jsonEvent_Spin = addDataInSameEvent(jsonEvent_Spin, this._numPrizeSpecialCanReceive.toString());
        jsonEvent_Spin = addDataInSameEvent(jsonEvent_Spin, this._timeLastWatchAdsSpin.toString());

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.SPIN, JSON.stringify(jsonEvent_Spin));
        }

        return jsonEvent_Spin;
    }

    private ReadEvent_Spin(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listDataSpin: string[] = dataJson.split(`-`);
        if (listDataSpin == null || listDataSpin == undefined || listDataSpin.length == 0) { return; }

        if (listDataSpin[0] != null) readJsonInfoEventData(this._infoEventSpin, listDataSpin[0]);
        if (listDataSpin[1] != null) this._isUseFreeSpin = readMinimalistBoolean(listDataSpin[1]);
        if (listDataSpin[2] != null) this._numUseAdsSpin = Number.parseInt(listDataSpin[2]);
        if (listDataSpin[3] != null) this._isHasSpeItem = readMinimalistBoolean(listDataSpin[3]);
        if (listDataSpin[4] != null) this._listPrizeSpinIsReceive = readMinimalistListBoolean(listDataSpin[4]);
        if (listDataSpin[5] != null) this._numPrizeSpecialCanReceive = Number.parseInt(listDataSpin[5]);
        if (listDataSpin[6] != null) this._timeLastWatchAdsSpin = Number.parseInt(listDataSpin[6]);
    }
    //#endregion Spin

    //#region LoginReward
    public _infoEventLoginReward: InfoEventData = new InfoEventData();
    public _loginReward_listPrize30Day: boolean[] = new Array(MConfigs.MAX_PRIZE_PROGRESS_LOGIN_REWARD).fill(false);
    public _loginReward_isReceivePrizeToDay: boolean = false;
    public _loginReward_progress30DayDaily: number = 0;           // thuộc tính này được dùng để lưu trữ lại tiến độ của người chơi mỗi khi họ điểm danh được thêm một ngày
    public SaveEvent_LoginReward(needSaveData: boolean = true) {
        let jsonEvent_LoginReward = "";
        const infoEventLoginReward = jsonInfoEventData(this._infoEventLoginReward);
        const listProgressLoginRewardReceived = minimalistListBoolean(this._loginReward_listPrize30Day);
        jsonEvent_LoginReward = addDataInSameEvent(jsonEvent_LoginReward, infoEventLoginReward, false);
        jsonEvent_LoginReward = addDataInSameEvent(jsonEvent_LoginReward, listProgressLoginRewardReceived);
        jsonEvent_LoginReward = addDataInSameEvent(jsonEvent_LoginReward, minimalistBoolean(this._loginReward_isReceivePrizeToDay));
        jsonEvent_LoginReward = addDataInSameEvent(jsonEvent_LoginReward, this._loginReward_progress30DayDaily.toString());

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.LOGIN_REWARD, JSON.stringify(jsonEvent_LoginReward));
        }

        return jsonEvent_LoginReward;
    }

    private ReadEvent_LoginReward(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        let listData = dataJson.split(`-`);
        if (listData == null || listData == undefined || listData.length < 0) return;
        if (listData[0] != null || listData[0] == undefined) readJsonInfoEventData(this._infoEventLoginReward, listData[0]);
        if (listData[1] != null || listData[1] == undefined) this._loginReward_listPrize30Day = readMinimalistListBoolean(listData[1]);
        if (listData[2] != null || listData[2] == undefined) this._loginReward_isReceivePrizeToDay = readMinimalistBoolean(listData[2]);
        if (listData[3] != null || listData[3] == undefined) this._loginReward_progress30DayDaily = Number.parseInt(listData[3]);
    }
    //#endregion LoginReward

    //#region PiggyBank
    public _infoEventPiggyBank: InfoEventData = new InfoEventData();
    public PB_isShowYetWhenFull: boolean = false;

    public SaveEvent_PiggyBank(needSaveData: boolean = true) {
        let jsonEvent_PiggyBank = "";

        const infoEventPiggyBank = jsonInfoEventData(this._infoEventPiggyBank);
        jsonEvent_PiggyBank = addDataInSameEvent(jsonEvent_PiggyBank, infoEventPiggyBank, false);
        jsonEvent_PiggyBank = addDataInSameEvent(jsonEvent_PiggyBank, minimalistBoolean(this.PB_isShowYetWhenFull));

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.PIGGY_BANK, JSON.stringify(jsonEvent_PiggyBank));
        }

        return jsonEvent_PiggyBank;
    }

    private ReadEvent_PiggyBank(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        let listData = dataJson.split(`-`);
        if (listData == null || listData == undefined || listData.length < 0) return;
        if (listData[0] != null || listData[0] == undefined) readJsonInfoEventData(this._infoEventPiggyBank, listData[0]);
        if (listData[1] != null || listData[1] == undefined) this.PB_isShowYetWhenFull = readMinimalistBoolean(listData[1]);
    }
    //#endregion PiggyBank

    //#region DashRush
    public DR_timeEnd = 0;  // tại sao lại lưu time end chứ không pahir time start vì nếu giả sử như sau này mình sửa thời gian limit thì thời gian kết thúc của event đang hoạt động sẽ không bị ảnh hưởng
    public DR_isPlayedInfo: boolean = false;
    public DR_numJoined: number = 0;
    public DR_listPlayerJoin: InfoBot_DashRush[] = [];
    public DR_lastTimePlayerIncreaseScore: number = 0;
    public DR_cacheOldScore: Map<string, number> = new Map();
    public DR_timeDelay: number = 0;
    public DR_canInit: boolean = true;

    public SaveEvent_DashRush(needSaveData: boolean = true) {
        let jsonDashRush = '';

        // console.log(this.DR_listPlayerJoin.map(item => item.progress));
        const fileSaveCache = this.DR_cacheOldScore.size == 0 ? null : JSON.stringify(Array.from(this.DR_cacheOldScore));


        jsonDashRush = addStringToSaveData(jsonDashRush, this.DR_timeEnd);
        jsonDashRush = addStringToSaveData(jsonDashRush, minimalistBoolean(this.DR_isPlayedInfo));
        jsonDashRush = addStringToSaveData(jsonDashRush, this.DR_numJoined);
        jsonDashRush = addStringToSaveData(jsonDashRush, EncodeInfoBot_DashRush(this.DR_listPlayerJoin));
        jsonDashRush = addStringToSaveData(jsonDashRush, this.DR_lastTimePlayerIncreaseScore);
        jsonDashRush = addStringToSaveData(jsonDashRush, fileSaveCache);
        jsonDashRush = addStringToSaveData(jsonDashRush, this.DR_timeDelay);
        jsonDashRush = addStringToSaveData(jsonDashRush, this.DR_canInit, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.DASH_RUSH, jsonDashRush);
        }

        return jsonDashRush;
    }

    public ReadEvent_DashRush(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split('|');
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null && listData[0] != '') this.DR_timeEnd = parseInt(listData[0]);
        if (listData[1] != null && listData[1] != '') this.DR_isPlayedInfo = readMinimalistBoolean(listData[1]);
        if (listData[2] != null && listData[2] != '') this.DR_numJoined = parseInt(listData[2]);
        if (listData[3] != null && listData[3] != '') { this.DR_listPlayerJoin = DecodeInfoBot_DashRush(listData[3]); }
        if (listData[4] != null && listData[4] != '') { this.DR_lastTimePlayerIncreaseScore = parseInt(listData[4]); }
        if (listData[5] != null && listData[5] != '') { this.DR_cacheOldScore = new Map<string, number>(JSON.parse(listData[5])); }
        if (listData[6] != null && listData[6] != '') { this.DR_timeDelay = parseInt(listData[6]); }
        if (listData[7] != null && listData[7] != '') { this.DR_canInit = readMinimalistBoolean(listData[7]); }
    }
    //#endregion DashRush

    //#region SpeedRace
    public SR_timeEnd = 0;  // tại sao lại lưu time end chứ không pahir time start vì nếu giả sử như sau này mình sửa thời gian limit thì thời gian kết thúc của event đang hoạt động sẽ không bị ảnh hưởng
    public SR_lastTimePlayerIncreaseScore = 0;
    public SR_isPlayedInfo: boolean = false;
    public SR_numJoined: number = 0;
    public SR_listPlayerJoin: InfoBot_SpeedRace[] = [];
    public SR_previousProgressBeforeOpenUI: number = 0;
    public SR_previousWinStreak: number = 0;
    public SR_winStreak: number = 0;
    public SR_listPrizeClaimed: boolean[] = [];
    public SR_isReceivePrizeSummary: boolean = true;
    public SR_progressPlayer: number = 0;

    private isResetDataSR: boolean = false;

    public SaveEvent_SpeedRace(needSaveData: boolean = true) {
        let jsonSpeedRace = '';
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, this.SR_timeEnd);
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, this.SR_lastTimePlayerIncreaseScore);
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, minimalistBoolean(this.SR_isPlayedInfo));
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, this.SR_numJoined);
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, this.SR_winStreak);
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, this.SR_previousProgressBeforeOpenUI);
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, this.SR_previousWinStreak);
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, minimalistListBoolean(this.SR_listPrizeClaimed));
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, EncodeInfoBot_SpeedRace(this.SR_listPlayerJoin, ['', MConfigFacebook.Instance.playerID]));
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, minimalistBoolean(this.SR_isReceivePrizeSummary));
        jsonSpeedRace = addStringToSaveData(jsonSpeedRace, this.SR_progressPlayer, false);

        if (this.isResetDataSR) {
            this.isResetDataSR = false;
            jsonSpeedRace = '';
        }

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.SPEED_RACE, jsonSpeedRace);
        }

        return jsonSpeedRace;
    }

    public ReadEvent_SpeedRace(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split('|');
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null && listData[0] != '') this.SR_timeEnd = parseInt(listData[0]);
        if (listData[1] != null && listData[1] != '') this.SR_lastTimePlayerIncreaseScore = parseInt(listData[1]);
        if (listData[2] != null && listData[2] != '') this.SR_isPlayedInfo = readMinimalistBoolean(listData[2]);
        if (listData[3] != null && listData[3] != '') this.SR_numJoined = parseInt(listData[3]);
        if (listData[4] != null && listData[4] != '') this.SR_winStreak = parseInt(listData[4]);
        if (listData[5] != null && listData[5] != '') this.SR_previousProgressBeforeOpenUI = parseInt(listData[5]);
        if (listData[6] != null && listData[6] != '') this.SR_previousWinStreak = parseInt(listData[6]);
        if (listData[7] != null && listData[7] != '') this.SR_listPrizeClaimed = readMinimalistListBoolean(listData[7]);
        if (listData[8] != null && listData[8] != '') this.SR_listPlayerJoin = DecodeInfoBot_SpeedRace(listData[8]);
        if (listData[9] != null && listData[9] != '') this.SR_isReceivePrizeSummary = readMinimalistBoolean(listData[9]);
        if (listData[10] != null && listData[10] != '') this.SR_progressPlayer = parseInt(listData[10]);
    }

    public ResetForceDataSpeedRace() {
        this.isResetDataSR = true;
        this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.SPEED_RACE, '');
    }
    //#endregion DashRush

    //#region EndlessTreasure
    public ET_id: number = 0;
    public ET_numPackUnlocked: number = 0;
    public ET_timeResetPack: number = 0;
    public SaveEvent_EndlessTreasure(needSaveData: boolean = true) {
        let jsonEndlessTreasure = '';
        jsonEndlessTreasure = addStringToSaveData(jsonEndlessTreasure, this.ET_numPackUnlocked.toString());
        jsonEndlessTreasure = addStringToSaveData(jsonEndlessTreasure, this.ET_timeResetPack.toString());
        jsonEndlessTreasure = addStringToSaveData(jsonEndlessTreasure, this.ET_id.toString(), false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.ENDLESS_TREASURE, jsonEndlessTreasure);
        }

        return jsonEndlessTreasure;
    }
    public ReadEvent_EndlessTreasure(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split('|');
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null && listData[0] != '') { this.ET_numPackUnlocked = parseInt(listData[0]) }
        if (listData[1] != null && listData[1] != '') { this.ET_timeResetPack = parseInt(listData[1]) }
        if (listData[2] != null && listData[2] != '') { this.ET_id = parseInt(listData[2]) }
    }
    //#endregion EndlessTreasure

    //#region Level Progression
    public LPr_id: number = 0;
    public LPr_timeEnd: number = 0;
    public LPr_progress: number = 0;
    public LPr_prizeClaimed: boolean[] = new Array(CONFIG_LPr.MAX_PRIZE_LEVEL_PROGRESSION).fill(false);
    public LPr_isReceivedPrizeWhenEndEvent: boolean = true;
    public LPr_timeDistanceCustom: number = 0;

    public SaveEvent_LevelProgression(needSaveData: boolean = true) {
        let jsonEvent_LevelProgress = "";

        const LPr_id = this.LPr_id.toString();
        const LPr_timeEnd = this.LPr_timeEnd.toString();
        const LPr_progress = this.LPr_progress.toString();;
        const LPr_prizeClaimed = minimalistListBoolean(this.LPr_prizeClaimed);
        const LPr_isReceivedPrizeWhenEndEvent = minimalistBoolean(this.LPr_isReceivedPrizeWhenEndEvent);
        const LPr_timeDistanceCustom = this.LPr_timeDistanceCustom.toString();
        jsonEvent_LevelProgress = addDataInSameEvent(jsonEvent_LevelProgress, LPr_id, false);
        jsonEvent_LevelProgress = addDataInSameEvent(jsonEvent_LevelProgress, LPr_timeEnd);
        jsonEvent_LevelProgress = addDataInSameEvent(jsonEvent_LevelProgress, LPr_progress);
        jsonEvent_LevelProgress = addDataInSameEvent(jsonEvent_LevelProgress, LPr_prizeClaimed);
        jsonEvent_LevelProgress = addDataInSameEvent(jsonEvent_LevelProgress, LPr_isReceivedPrizeWhenEndEvent);
        jsonEvent_LevelProgress = addDataInSameEvent(jsonEvent_LevelProgress, LPr_timeDistanceCustom);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.LEVEL_PROGRESS, JSON.stringify(jsonEvent_LevelProgress));
        }
        return jsonEvent_LevelProgress;
    }

    private ReadEvent_LevelProgression(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listDataLevelProgression: string[] = dataJson.split(`-`);
        if (listDataLevelProgression == null || listDataLevelProgression == undefined || listDataLevelProgression.length == 0) { return; }

        if (listDataLevelProgression[0] != null && listDataLevelProgression[0] != undefined) this.LPr_id = Number.parseInt(listDataLevelProgression[0]);
        if (listDataLevelProgression[1] != null && listDataLevelProgression[1] != undefined) this.LPr_timeEnd = Number.parseInt(listDataLevelProgression[1]);
        if (listDataLevelProgression[2] != null && listDataLevelProgression[2] != undefined) this.LPr_progress = Number.parseInt(listDataLevelProgression[2]);
        if (listDataLevelProgression[3] != null && listDataLevelProgression[3] != undefined) this.LPr_prizeClaimed = readMinimalistListBoolean(listDataLevelProgression[3]);
        if (listDataLevelProgression[4] != null && listDataLevelProgression[4] != undefined) this.LPr_isReceivedPrizeWhenEndEvent = readMinimalistBoolean(listDataLevelProgression[4]);
        if (listDataLevelProgression[5] != null && listDataLevelProgression[5] != undefined) {
            try {
                this.LPr_timeDistanceCustom = parseInt(listDataLevelProgression[5]);
            } catch (e) {
                this.LPr_timeDistanceCustom = 0;
            }
        }
    }
    //#endregion Level Progression

    //#region Treasure Trail
    public TT_id: number = 0;
    public TT_timeEnd: number = 0;  // tại sao lại lưu time end chứ không pahir time start vì nếu giả sử như sau này mình sửa thời gian limit thì thời gian kết thúc của event đang hoạt động sẽ không bị ảnh hưởng
    public TT_isPlayedTut: boolean = false;
    public TT_infoBot: InfoBot_TreasureTrail[] = [];
    public TT_streakPlayer: number = 0;
    public TT_streakPlayer_old: number = 0;
    public TT_isReceivePrizeSummary: boolean = true;
    public TT_listAvatar: string[] = [];
    public TT_isLose: boolean = false;
    public TT_canInit: boolean = true;
    public TT_numWin: number = 0;

    public SaveEvent_TreasureTrail(needSaveData: boolean = true) {
        let jsonTreasureTrail = '';
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, this.TT_id);
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, this.TT_timeEnd);
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, minimalistBoolean(this.TT_isPlayedTut));
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, this.TT_streakPlayer);
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, JSON.stringify(this.TT_listAvatar));
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, minimalistBoolean(this.TT_isReceivePrizeSummary));
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, this.TT_streakPlayer_old);
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, minimalistBoolean(this.TT_isLose));
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, minimalistBoolean(this.TT_canInit));
        jsonTreasureTrail = addStringToSaveData(jsonTreasureTrail, this.TT_numWin, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.TREASURE_TRAIL, jsonTreasureTrail);
        }

        return jsonTreasureTrail;
    }

    public ReadEvent_TreasureTrail(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split('|');
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null && listData[0] != '') this.TT_id = parseInt(listData[0]);
        if (listData[1] != null && listData[1] != '') this.TT_timeEnd = parseInt(listData[1]);
        if (listData[2] != null && listData[2] != '') this.TT_isPlayedTut = readMinimalistBoolean(listData[2]);
        if (listData[3] != null && listData[3] != '') this.TT_streakPlayer = parseInt(listData[3]);
        if (listData[4] != null && listData[4] != '') this.TT_listAvatar = JSON.parse(listData[4]);
        if (listData[5] != null && listData[5] != '') this.TT_isReceivePrizeSummary = readMinimalistBoolean(listData[5]);
        if (listData[6] != null && listData[6] != '') this.TT_streakPlayer_old = parseInt(listData[6]);
        if (listData[7] != null && listData[7] != '') this.TT_isLose = readMinimalistBoolean(listData[7]);
        if (listData[8] != null && listData[8] != '') this.TT_canInit = readMinimalistBoolean(listData[8]);
        if (listData[9] != null && listData[9] != '') this.TT_numWin = parseInt(listData[9]);
    }
    //#endregion Treasure Trail

    //#region SkyLift
    public SL_id: number = 0;
    public SL_timeEnd: number = 0;
    public SL_timeDelay: number = 0;
    public SL_isPlayedTut: boolean = false;
    public SL_isReceiveReward: boolean = true;
    public SL_progressPlayer: number = 0;
    public SL_old_progressPlayer: number = 0;
    public SL_listBoolReceivePrize: boolean[] = new Array(CONFIG_SL.MAX_PRIZE_HAS).fill(false);

    public SaveEvent_SkyLift(needSaveData: boolean = true) {
        let jsonSkyLift = '';
        jsonSkyLift = addStringToSaveData(jsonSkyLift, this.SL_id);
        jsonSkyLift = addStringToSaveData(jsonSkyLift, this.SL_timeEnd);
        jsonSkyLift = addStringToSaveData(jsonSkyLift, minimalistBoolean(this.SL_isPlayedTut));
        jsonSkyLift = addStringToSaveData(jsonSkyLift, this.SL_progressPlayer);
        jsonSkyLift = addStringToSaveData(jsonSkyLift, this.SL_old_progressPlayer);
        jsonSkyLift = addStringToSaveData(jsonSkyLift, minimalistListBoolean(this.SL_listBoolReceivePrize));
        jsonSkyLift = addStringToSaveData(jsonSkyLift, minimalistBoolean(this.SL_isReceiveReward));
        jsonSkyLift = addStringToSaveData(jsonSkyLift, this.SL_timeDelay, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.EVENT_IN_GAME.SKY_LIFT, jsonSkyLift);
        }

        return jsonSkyLift;
    }

    public ReadEvent_SkyLift(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split('|');
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null && listData[0] != '') this.SL_id = parseInt(listData[0]);
        if (listData[1] != null && listData[1] != '') this.SL_timeEnd = parseInt(listData[1]);
        if (listData[2] != null && listData[2] != '') this.SL_isPlayedTut = readMinimalistBoolean(listData[2]);
        if (listData[3] != null && listData[3] != '') this.SL_progressPlayer = parseInt(listData[3]);
        if (listData[4] != null && listData[4] != '') this.SL_old_progressPlayer = parseInt(listData[4]);
        if (listData[5] != null && listData[5] != '') this.SL_listBoolReceivePrize = readMinimalistListBoolean(listData[5]);
        if (listData[6] != null && listData[6] != '') this.SL_isReceiveReward = readMinimalistBoolean(listData[6]);
        if (listData[7] != null && listData[7] != '') this.SL_timeDelay = parseInt(listData[7]);
    }
    //#endregion SkyLift

    //#region Light road
    public XMAX_LR_id: number = 0;
    public XMAX_LR_timeEnd: number = 0;
    public XMAX_LR_timeDelay: number = 0;
    public XMAX_LR_isPlayTut: boolean = false;
    public XMAX_LR_isPlayTut_level: boolean = false;
    public XMAX_LR_isReceiveReward: boolean = true;
    public XMAX_LR_progressPlayer: number = 0;  // level player reach
    public XMAX_LR_oldProgressPlayer: number = 0;
    public XMAX_LR_progressPlayer_listBoolReceivePrize: boolean[] = new Array(CONFIG_LR_CHRIST.MAX_PRIZE).fill(false);
    public XMAX_LR_year_init: number = 0;

    public SaveEvent_LightRoad(needSaveData: boolean = true) {
        let jsonLightRoad = '';
        jsonLightRoad = addStringToSaveData(jsonLightRoad, this.XMAX_LR_id);
        jsonLightRoad = addStringToSaveData(jsonLightRoad, this.XMAX_LR_timeEnd);
        jsonLightRoad = addStringToSaveData(jsonLightRoad, this.XMAX_LR_timeDelay);
        jsonLightRoad = addStringToSaveData(jsonLightRoad, minimalistBoolean(this.XMAX_LR_isPlayTut));
        jsonLightRoad = addStringToSaveData(jsonLightRoad, minimalistBoolean(this.XMAX_LR_isReceiveReward));
        jsonLightRoad = addStringToSaveData(jsonLightRoad, this.XMAX_LR_progressPlayer);
        jsonLightRoad = addStringToSaveData(jsonLightRoad, this.XMAX_LR_oldProgressPlayer);
        jsonLightRoad = addStringToSaveData(jsonLightRoad, minimalistListBoolean(this.XMAX_LR_progressPlayer_listBoolReceivePrize));
        jsonLightRoad = addStringToSaveData(jsonLightRoad, minimalistBoolean(this.XMAX_LR_isPlayTut_level));
        jsonLightRoad = addStringToSaveData(jsonLightRoad, this.XMAX_LR_year_init, false)

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.XMAX_EVENT_LR, jsonLightRoad);
        }

        return jsonLightRoad;
    }

    public ReadEvent_LightRoad(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split('|');
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null && listData[0] != '') this.XMAX_LR_id = parseInt(listData[0]);
        if (listData[1] != null && listData[1] != '') this.XMAX_LR_timeEnd = parseInt(listData[1]);
        if (listData[2] != null && listData[2] != '') this.XMAX_LR_timeDelay = parseInt(listData[2]);
        if (listData[3] != null && listData[3] != '') this.XMAX_LR_isPlayTut = readMinimalistBoolean(listData[3]);
        if (listData[4] != null && listData[4] != '') this.XMAX_LR_isReceiveReward = readMinimalistBoolean(listData[4]);
        if (listData[5] != null && listData[5] != '') this.XMAX_LR_progressPlayer = parseInt(listData[5]);
        if (listData[6] != null && listData[6] != '') this.XMAX_LR_oldProgressPlayer = parseInt(listData[6]);
        if (listData[7] != null && listData[7] != '') this.XMAX_LR_progressPlayer_listBoolReceivePrize = readMinimalistListBoolean(listData[7]);
        if (listData[8] != null && listData[8] != '') this.XMAX_LR_isPlayTut_level = readMinimalistBoolean(listData[8]);
        if (listData[9] != null && listData[9] != '') this.XMAX_LR_year_init = parseInt(listData[9]);
    }
    //#endregion Light road

    //#region HatRace
    public XMAX_HR_id: number = 0;
    public XMAX_HR_timeEnd: number = 0;
    public XMAX_HR_timeDelay: number = 0;
    public XMAX_HR_isPlayTut: boolean = false;
    public XMAX_HR_isReceiveReward: boolean = true;
    public XMAX_HR_oldProgressPlayer: number = -1;
    public XMAX_HR_progressPlayer: number = 0;
    public XMAX_HR_previousWinStreak: number = 0;
    public XMAX_HR_winStreak: number = 0;
    public XMAX_HR_listPlayerJoin: InfoBot_HatRace[] = [];
    public XMAX_HR_lastTimeIncreaseScore_A: number = 0;
    public XMAX_HR_lastTimeIncreaseScore_B: number = 0;
    public XMAX_HR_lastTimeIncreaseScore_C: number = 0;
    public XMAX_HR_level: number = 0;

    public SaveEvent_HatRace(needSaveData: boolean = true) {
        let jsonHatRace = '';
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_id);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_timeEnd);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_timeDelay);
        jsonHatRace = addStringToSaveData(jsonHatRace, minimalistBoolean(this.XMAX_HR_isPlayTut));
        jsonHatRace = addStringToSaveData(jsonHatRace, minimalistBoolean(this.XMAX_HR_isReceiveReward));
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_oldProgressPlayer);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_progressPlayer);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_previousWinStreak);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_winStreak);
        jsonHatRace = addStringToSaveData(jsonHatRace, EncodeInfoBot_HatRace(this.XMAX_HR_listPlayerJoin, ['', MConfigFacebook.Instance.playerID]));
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_lastTimeIncreaseScore_A);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_lastTimeIncreaseScore_B);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_lastTimeIncreaseScore_C);
        jsonHatRace = addStringToSaveData(jsonHatRace, this.XMAX_HR_level, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.XMAX_EVENT_LR, jsonHatRace);
        }

        return jsonHatRace;
    }

    public ReadEvent_HatRace(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split('|');
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null && listData[0] != '') this.XMAX_HR_id = parseInt(listData[0]);
        if (listData[1] != null && listData[1] != '') this.XMAX_HR_timeEnd = parseInt(listData[1]);
        if (listData[2] != null && listData[2] != '') this.XMAX_HR_timeDelay = parseInt(listData[2]);
        if (listData[3] != null && listData[3] != '') this.XMAX_HR_isPlayTut = readMinimalistBoolean(listData[3]);
        if (listData[4] != null && listData[4] != '') this.XMAX_HR_isReceiveReward = readMinimalistBoolean(listData[4]);
        if (listData[5] != null && listData[5] != '') this.XMAX_HR_oldProgressPlayer = parseInt(listData[5]);
        if (listData[6] != null && listData[6] != '') this.XMAX_HR_progressPlayer = parseInt(listData[6]);
        if (listData[7] != null && listData[7] != '') this.XMAX_HR_previousWinStreak = parseInt(listData[7]);
        if (listData[8] != null && listData[8] != '') this.XMAX_HR_winStreak = parseInt(listData[8]);
        if (listData[9] != null && listData[9] != '') this.XMAX_HR_listPlayerJoin = DecodeInfoBot_HatRace(listData[9]);
        if (listData[10] != null && listData[10] != '') this.XMAX_HR_lastTimeIncreaseScore_A = parseInt(listData[10]);
        if (listData[11] != null && listData[11] != '') this.XMAX_HR_lastTimeIncreaseScore_B = parseInt(listData[11]);
        if (listData[12] != null && listData[12] != '') this.XMAX_HR_lastTimeIncreaseScore_C = parseInt(listData[12]);
        if (listData[13] != null && listData[13] != '') this.XMAX_HR_level = parseInt(listData[13]);
    }
    //#endregion HatRace
    //===================================================================



    //===================================================================
    //#region groupEvents
    public GR_listEventGroups: IGroupEventSave[] = [];
    /**
     * Hàm này chỉ được gọi trong class PlayerData và một class save của DataEventSys quản lý
     * không được phép gọi trong hàm khác
     * @param needSaveData 
     * @returns 
     */
    public SaveListEventGroups(needSaveData: boolean = true) {
        const jsonListEventGroup: string = JsonListIGroupEventSave(PlayerData.Instance.GR_listEventGroups);

        let jsonListEventGroups = "";
        jsonListEventGroups = addDataInSameEvent(jsonListEventGroups, jsonListEventGroup, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.DATA_EVENT_GROUP, JSON.stringify(jsonListEventGroups));
        }
        return jsonListEventGroups;
    }

    private ReadListEventGroups(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listDataListEventGroup: string[] = dataJson.split(`-`);
        if (listDataListEventGroup == null || listDataListEventGroup == undefined || listDataListEventGroup.length == 0) { return; }

        this.GR_listEventGroups = ReadJsonListIGroupEventSave(listDataListEventGroup[0]);
    }
    //#endregion groupEvents
    //===================================================================

    //#region Pack
    public _listPacksWorking: InfoPack[] = [];
    public _listPackLose: InfoPack[] = [];
    public _lastTimeSavePackLose: number = 0;

    public SaveDataPack(needSaveData: boolean = true) {
        /**
         * logic to save data in here
         * char `|` used for split each pack with other
         * char `-` used for split each param with other params in same pack
         * char `+` used for split each prize with other prizes in same pack
         * char `?` used for split data pack and other data custom in this game about pack
         */

        function addPack(root: string, dataNew: string, needSplit: boolean = true): string { return root += `${needSplit ? "|" : ``}${dataNew}`; }
        // function addDataCustomPack(root: string, dataNew: string, needSplit: boolean = true): string { return root += `${needSplit ? "?" : ``}${dataNew}`; }

        let resultJson: string = '';

        // add data pack normal IAP
        let resultPackIAP: string = '';
        for (let i = 0; i < this._listPacksWorking.length; i++) {
            const jsonPack = this._listPacksWorking[i].JsonData();
            // console.log("pack", i, resultJson, jsonPack);
            resultPackIAP += addPack(resultJson, jsonPack, i > 0);
        }
        resultJson = addAnyToSaveData(resultJson, resultPackIAP, true, "#");

        // add data pack lose
        resultJson = addAnyToSaveData(resultJson, this._lastTimeSavePackLose.toString(), true, "#");

        let resultJsonLose: string = '';
        for (let i = 0; i < this._listPackLose.length; i++) {
            const jsonPack = this._listPackLose[i].JsonData();
            resultJsonLose = addPack(resultJsonLose, jsonPack, i > 0);
        }
        resultJson = addAnyToSaveData(resultJson, resultJsonLose, false);

        // NOTE - trước đây ở code cũ đã từng có lần cache thêm dữ liệu ở đây => do đó tuyệt đối ko thêm bất cứ biến nào vào đây nữa
        // hãy tạo key khác để lưu lại nếu vẫn liên quan đến pack

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.PACKS, JSON.stringify(resultJson));
        }

        return resultJson;
    }

    public _listTempPack: InfoPack[] = [];
    private ReadJsonPack(dataJson: string) {
        /**
         * ===========================================================================================================================================================
         * ===========================================================================================================================================================
         * =================== NOTE: please read carefully about note + code in function SaveDataPack before you change something in here ============================
         * ===========================================================================================================================================================
         * ===========================================================================================================================================================
         */

        if (dataJson == null || dataJson == undefined || dataJson == "") { return; }

        const listData = dataJson.split("#");

        if (listData == null || listData == undefined || listData.length <= 0) return;

        // === read data pack normal IAP ===
        if (listData[0] != null && listData[0] != undefined && listData[0] != "") {
            // read data pack
            let listInfoPack: string[] = listData[0].split(`|`);
            if (listInfoPack == null || listInfoPack == undefined || listInfoPack.length <= 0) return;

            this._listPacksWorking = [];

            // console.log("listInfoCustomPack", listInfoCustomPack);
            // console.log("listInfoPack", listInfoPack);

            for (let i = 0; i < listInfoPack.length; i++) {
                const infoPack: string = listInfoPack[i];
                const pack = new InfoPack();
                pack.readDataFromJson_OfPlayer(infoPack);
                this._listTempPack.push(pack);

            }
        }

        // === read time save pack lose ===
        if (listData[1] != null && listData[1] != undefined && listData[1] != "") {
            this._lastTimeSavePackLose = Number.parseInt(listData[1]);
        }

        // === read data pack lose ===
        if (listData[2] != null && listData[2] != undefined && listData[2] != "") {
            // read data pack
            let listInfoPack: string[] = listData[2].split(`|`);
            if (listInfoPack == null || listInfoPack == undefined || listInfoPack.length <= 0) return;

            this._listPackLose = [];

            for (let i = 0; i < listInfoPack.length; i++) {
                const infoPack: string = listInfoPack[i];
                const pack = new InfoPack();
                pack.readDataFromJson_OfPlayer(infoPack);
                this._listPackLose.push(pack);
            }
        }

        // NOTE - trước đây ở code cũ đã từng có lần cache thêm dữ liệu ở đây => do đó tuyệt đối ko thêm bất cứ biến nào vào đây nữa
        // hãy tạo key khác để lưu lại nếu vẫn liên quan đến pack
    }
    //#endregion Pack

    //#region hlw
    public _hlw_timeInitPack: number = 0;
    public _hlw_indexPack: number = 0;
    public _hlw_isActive: boolean = true;

    private ReadEvent_HLW(dataJson: string) {
        if (dataJson == null || dataJson == undefined || dataJson == "") { return; }

        const listData = dataJson.split("#");

        if (listData == null || listData == undefined || listData.length <= 0) return;
        // === pack halloween ===
        const dataHalloween = listData[0];
        if (dataHalloween != null && dataHalloween != undefined && dataHalloween != "") {
            try {
                const timeInitPackHalloween = Number.parseInt(dataHalloween);
                this._hlw_timeInitPack = timeInitPackHalloween;
            } catch (e) {
                console.error(e);
            }
        }

        const indexPackHalloween = listData[1];
        if (indexPackHalloween != null && indexPackHalloween != undefined && indexPackHalloween != "") {
            try {
                const indexPackHalloweenSave = Number.parseInt(indexPackHalloween);
                this._hlw_indexPack = indexPackHalloweenSave;
            } catch (e) {
                console.error(e);
            }
        }

        const isActiveHalloween = listData[2];
        if (isActiveHalloween != null && isActiveHalloween != undefined && isActiveHalloween != "") {
            try {
                const isActiveHalo = readMinimalistBoolean(isActiveHalloween);
                this._hlw_isActive = isActiveHalo;
            } catch (e) {
                console.error(e);
            }
        }
    }

    public SaveEvent_HLW(needSaveData: boolean = true) {
        let resultJson: string = '';

        // add time initPack halloween
        resultJson = addAnyToSaveData(resultJson, this._hlw_timeInitPack.toString(), true, "#");
        resultJson = addAnyToSaveData(resultJson, this._hlw_indexPack.toString(), true, "#");
        resultJson = addAnyToSaveData(resultJson, minimalistBoolean(this._hlw_isActive), false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.HLW, JSON.stringify(resultJson));
        }

        return resultJson;
    }
    //#endregion hlw

    //#region christmas
    public _xmax_typeLogicPack: number = -1;
    public _xmax_timeRemainPack: number = 0;
    public _xmax_timeReInitPack: number = 0;
    public _xmax_indexPack: number = 0;
    public _xmax_isActive: boolean = true;
    public _xmax_year_init: number = 0;
    private ReadEvent_Christmas(dataJson: string) {
        if (dataJson == null || dataJson == undefined || dataJson == "") { return; }

        const listData = dataJson.split("#");

        if (listData == null || listData == undefined || listData.length <= 0) return;

        const typeLogicPack = listData[0];
        if (typeLogicPack != null && typeLogicPack != undefined && typeLogicPack != "") {
            try {
                const result = Number.parseInt(typeLogicPack);
                this._xmax_typeLogicPack = result;
            } catch (e) {
                console.error(e);
            }
        }

        const timeRemainPack = listData[1];
        if (timeRemainPack != null && timeRemainPack != undefined && timeRemainPack != "") {
            try {
                const result = Number.parseInt(timeRemainPack);
                this._xmax_timeRemainPack = result;
            } catch (e) {
                console.error(e);
            }
        }

        const timeReInitPack = listData[2];
        if (timeReInitPack != null && timeReInitPack != undefined && timeReInitPack != "") {
            try {
                const result = Number.parseInt(timeReInitPack);
                this._xmax_timeReInitPack = result;
            } catch (e) {
                console.error(e);
            }
        }

        const indexPack = listData[3];
        if (indexPack != null && indexPack != undefined && indexPack != "") {
            try {
                const result = Number.parseInt(indexPack);
                this._xmax_indexPack = result;
            } catch (e) {
                console.error(e);
            }
        }

        const isActive = listData[4];
        if (isActive != null && isActive != undefined && isActive != "") {
            try {
                const result = readMinimalistBoolean(isActive);
                this._xmax_isActive = result;
            } catch (e) {
                console.error(e);
            }
        }

        const yearInit = listData[5];
        if (yearInit != null && yearInit != undefined && yearInit != "") {
            try {
                const result = parseInt(yearInit);
                this._xmax_year_init = result;
            } catch (e) {
                console.error(e);
            }
        }
    }

    public SaveEvent_Christmas(needSaveData: boolean = true) {
        let resultJson = '';
        // add time initPack chritsmas
        resultJson = addAnyToSaveData(resultJson, this._xmax_typeLogicPack.toString(), true, "#");
        resultJson = addAnyToSaveData(resultJson, this._xmax_timeRemainPack.toString(), true, "#");
        resultJson = addAnyToSaveData(resultJson, this._xmax_timeReInitPack.toString(), true, "#");
        resultJson = addAnyToSaveData(resultJson, this._xmax_indexPack.toString(), true, "#");
        resultJson = addAnyToSaveData(resultJson, minimalistBoolean(this._xmax_isActive), true, "#");
        resultJson = addAnyToSaveData(resultJson, this._xmax_year_init.toString(), false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.XMAX, JSON.stringify(resultJson));
        }

        return resultJson;
    }
    //#endregion christmas

    //#region BlackFriday
    public _listTimeBoughtPackBlackFriday: number[] = [];
    public _cachePackBlackFriday: { time: number, idPack: string } = null;

    public ReadPackBlackFriday(dataJson: string) {
        if (dataJson == null || dataJson == undefined || dataJson == "") { return; }

        const listData = dataJson.split("#");

        // === pack black friday ===
        const listTimeBoughtBlackFriday = listData[0];
        if (listTimeBoughtBlackFriday != null && listTimeBoughtBlackFriday != undefined && listTimeBoughtBlackFriday != "") {
            try {
                this._listTimeBoughtPackBlackFriday = JSON.parse(listTimeBoughtBlackFriday);
            } catch (e) {
                this._listTimeBoughtPackBlackFriday = [];
                console.error(e);
            }
        }

        const cachePackBlackkFriday = listData[1];
        if (cachePackBlackkFriday != null && cachePackBlackkFriday != undefined && cachePackBlackkFriday != "") {
            try {
                const dataCache = cachePackBlackkFriday.split(":")
                this._cachePackBlackFriday = {
                    time: Number.parseInt(dataCache[0]),
                    idPack: dataCache[1]
                }
            } catch (e) {

                console.error(e);
            }
        }
    }

    public SavePackBlackFriday(needSaveData: boolean = true) {
        let resultJson = '';
        resultJson = addAnyToSaveData(resultJson, JSON.stringify(this._listTimeBoughtPackBlackFriday), true, "#");
        resultJson = addAnyToSaveData(resultJson, this._cachePackBlackFriday != null ? `${this._cachePackBlackFriday.time}:${this._cachePackBlackFriday.idPack}` : null, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.PACK_BF, JSON.stringify(resultJson));
        }

        return resultJson;
    }
    //#endregion BlackFriday

    //#region tournament
    public _listIdTourWasClaimed: string[] = [];

    /**
    * 
    * @param idTour id tournament on facebook
    */
    public SaveIdTourWasClaimed(idTour: string = null, needSaveData: boolean = true) {
        if (idTour != null) {
            this._listIdTourWasClaimed.push(idTour);
        }
        this.SaveTouranmentData(needSaveData);
    }

    public SaveTouranmentData(needSave: boolean = true) {
        let jsonTour = JSON.stringify(this._listIdTourWasClaimed);

        if (needSave) {
            this.SaveData(MConst.KEY_SAVE.DATA_TOURNAMENTS_CLAIMED, jsonTour);
        }

        return jsonTour;
    }

    private ReadJsonTournament(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        this._listIdTourWasClaimed = JSON.parse(dataJson) as string[];
    }
    //#endregion tournament

    //#region building
    public _building_indexMap: number = 1;
    public _building_progressConstructorNow: number = 0;
    public _buidling_numConstructorUnlock: number = 0;
    public _building_numItemBuildingHave: number = 0;
    public _building_isReceivedPrizeTotal: boolean = false;

    public SaveBuilding(needSaveData: boolean = true): string {
        let jsonProgressMap = '';
        jsonProgressMap = addStringToSaveData(jsonProgressMap, this._building_indexMap.toString());
        jsonProgressMap = addStringToSaveData(jsonProgressMap, this._building_progressConstructorNow.toString());
        jsonProgressMap = addStringToSaveData(jsonProgressMap, this._buidling_numConstructorUnlock.toString());
        jsonProgressMap = addStringToSaveData(jsonProgressMap, this._building_numItemBuildingHave.toString());
        jsonProgressMap = addStringToSaveData(jsonProgressMap, minimalistBoolean(this._building_isReceivedPrizeTotal), false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.DATA_INFO_BUIDING, jsonProgressMap);
        }

        return jsonProgressMap;
    }

    public ReadJsonBuilding(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split(`|`);
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null) this._building_indexMap = parseInt(listData[0]);
        if (listData[1] != null) this._building_progressConstructorNow = parseInt(listData[1]);
        if (listData[2] != null) this._buidling_numConstructorUnlock = parseInt(listData[2]);
        if (listData[3] != null) this._building_numItemBuildingHave = parseInt(listData[3]);
        if (listData[4] != null) this._building_isReceivedPrizeTotal = readMinimalistBoolean(listData[4]);
    }
    //#endregion building

    //#region weekly
    public _weekly_list_idClaimed: string[] = [];
    public _weekly_level_root: number = 0;
    public _weekly_id: string = "";
    public SaveWeekly(needSaveData: boolean = true) {
        let jsonWeekly = '';
        jsonWeekly = addStringToSaveData(jsonWeekly, JSON.stringify(this._weekly_list_idClaimed));
        jsonWeekly = addStringToSaveData(jsonWeekly, this._weekly_level_root.toString());
        jsonWeekly = addStringToSaveData(jsonWeekly, this._weekly_id, false);

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.DATA_WEEKLY, jsonWeekly);
        }

        return jsonWeekly;
    }
    public ReadJsonWeekly(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }
        const listData = dataJson.split(`|`);
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null) this._weekly_list_idClaimed = JSON.parse(listData[0]) as string[];
        if (listData[1] != null && listData[1] != '') this._weekly_level_root = parseInt(listData[1]);
        if (listData[2] != null && listData[2] != '') this._weekly_id = listData[2];
    }
    //#endregion weekly

    //#region LogEvent
    public _adRewardWatch: number = 0;
    public _adInterWatch: number = 0;
    public _logCampID: string = "";
    public _logAdsetID: string = "";
    public _logAdID: string = "";
    public _logTourID: string = "";
    public _isPaidUser: boolean = false;

    public SaveLogEvent(needSaveData: boolean = true): string {
        let jsonLogEvent = '';
        jsonLogEvent = addStringToSaveData(jsonLogEvent, this._adRewardWatch.toString());
        jsonLogEvent = addStringToSaveData(jsonLogEvent, this._adInterWatch.toString());
        jsonLogEvent = addStringToSaveData(jsonLogEvent, this._logCampID);//JSON.stringify(this._arrLogCampIDs)
        jsonLogEvent = addStringToSaveData(jsonLogEvent, this._logAdsetID);// JSON.stringify(this._arrLogAdsetIDs)
        jsonLogEvent = addStringToSaveData(jsonLogEvent, this._logAdID);// JSON.stringify(this._arrLogAdIDs)
        jsonLogEvent = addStringToSaveData(jsonLogEvent, this._logTourID);// JSON.stringify(this._arrLogTourIDs)

        if (needSaveData) {
            this.SaveData(MConst.KEY_SAVE.LOG_EVENT, jsonLogEvent);
        }

        return jsonLogEvent;
    }

    public ReadLogEvent(dataJson: any) {
        if (dataJson == null || dataJson == undefined) { return; }

        const listData = dataJson.split(`|`);
        if (listData == null || listData == undefined || listData.length == 0) return;

        if (listData[0] != null) this._adRewardWatch = parseInt(listData[0]);
        if (listData[1] != null) this._adInterWatch = parseInt(listData[1]);
        if (listData[2] != null) this._logCampID = listData[2];
        if (listData[3] != null) this._logAdsetID = listData[3];
        if (listData[4] != null) this._logAdID = listData[4];
        if (listData[5] != null) this._logTourID = listData[5];

        ConfigLogEvent.Instance.log_CAMP_ID = this._logCampID;
        ConfigLogEvent.Instance.log_ADSET_ID = this._logAdsetID;
        ConfigLogEvent.Instance.log_ADS_ID = this._logAdID;
        ConfigLogEvent.Instance.log_TOUR_ID = this._logTourID;
        if (ConfigLogEvent.Instance.log_CAMP_ID && ConfigLogEvent.Instance.log_CAMP_ID.length > 0) {
            ConfigLogEvent.Instance.isPaidUser = true;
        }

        if (ConfigLogEvent.Instance.log_ADSET_ID && ConfigLogEvent.Instance.log_ADSET_ID.length > 0) {
            ConfigLogEvent.Instance.isPaidUser = true;
        }

        if (ConfigLogEvent.Instance.log_ADS_ID && ConfigLogEvent.Instance.log_ADS_ID.length > 0) {
            ConfigLogEvent.Instance.isPaidUser = true;
        }

    }

    //#endregion LogEvent

    //#region save for id ads
    public SaveCampID(logCampID: string) {
        this._logCampID = logCampID;
        this.SaveLogEvent();
    }

    public SaveAdsetID(logAdsetID: string) {
        this._logAdsetID = logAdsetID;
        this.SaveLogEvent();
    }

    public SaveAdsID(logAdsID: string) {
        this._logAdID = logAdsID;
        this.SaveLogEvent();
    }

    public SaveTourID(logTourID: string) {
        this._logTourID = logTourID;
        this.SaveLogEvent();
    }
    //#endregion

    //#region FUNC SAVE DATA
    private SaveData(key: string, value: any) {
        // if (FBInstantManager.Instance.Test) {
        //     PlayerSave.saveDataStorageNoKeyOnLocal(this.getDataToSaveOnFacebook());
        // } else {
        //     FBInstantManager.Instance.SetDataPlayer_222(this.getDataToSaveOnFacebook());
        // }

        if (this.mySaveInterval) {
            clearInterval(this.mySaveInterval);
        }

        this.mySaveInterval = setInterval(() => this.SaveDataInterval(), 200);
    }

    mySaveInterval = null;
    private SaveDataInterval() {
        // console.log("-------------------SaveDataInterval----------------------");
        clearInterval(this.mySaveInterval);
        this.mySaveInterval = null;
        if (FBInstantManager.Instance.Test) {
            PlayerSave.saveDataStorageNoKeyOnLocal(this.getDataToSaveOnFacebook());
        } else {
            FBInstantManager.Instance.SetDataPlayer_222(this.getDataToSaveOnFacebook());
        }
    }

    public ResetData() {
        if (FBInstantManager.Instance.Test) {
            PlayerSave.removeDataStorageNoKeyOnLocal();
        } else {
            FBInstantManager.Instance.SetDataPlayer_222("");
        }
    }
    //#endregion
}

function addDataInSameEvent(root: string, dataNew: string, needSplit: boolean = true): string { return root += `${needSplit ? "-" : ``}${dataNew}`; }

function addStringToSaveData(root: string, value: any, needSplit: boolean = true): string {
    return root += value + (needSplit ? "|" : ``);
}

function addAnyToSaveData(root: string, value: string, needSplit: boolean = true, symbol = ",") {
    return root += value + (needSplit ? symbol : ``);
}

function minimalistBoolean(value: boolean) { return value ? "t" : "f"; }
function readMinimalistBoolean(value: string) { return value == "t" ? true : false; }
function minimalistListBoolean(list: boolean[]): string { return list.map(value => value ? "t" : "f").join(""); }
function readMinimalistListBoolean(minimalString: string): boolean[] {
    // console.log("readMinimalistListBoolean", minimalString);
    return minimalString.split("").map(char => char === "t");
}
function minimalMap(mapCheck: Map<any, any>): string {
    let result = "";
    mapCheck.forEach((value: any, key: any) => {
        result += `${key.toString()}~${value.toString()}` + ";";
    })
    if (result.endsWith(";")) {
        result = result.slice(0, -1);
    }
    return result;
}

function readMinimalMap<tKey, tValue>(dataCheck: string): Map<tKey, tValue> {
    let result: Map<tKey, tValue> = new Map();
    const listElement: string[] = dataCheck.split(";");
    listElement.forEach(element => {
        const listKeyAndValue: string[] = element.split('~');
        result.set(listKeyAndValue[0] as tKey, listKeyAndValue[1] as tValue);
    });
    return result;
}


