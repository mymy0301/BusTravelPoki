/**
 * type
 */

import { Color, Enum, Vec3, Node, SpriteFrame } from 'cc';
import { DayDailyInfo } from "../SerilazationData/DayDailyInfo";
import { Utils } from './Utils';
import { IDataPlayer_LEADERBOARD } from './server/ServerPegasus';

type DataModeGame = {
    TotalPlayed: number,
    TotalWon: number,
    BestScore: number,
    AverageScore: number,
    BestTime: number,
    AverageTime: number;
};

export type { DataModeGame };


/**
 * enum type
 */
enum GameMusicDisplay {
    MUSIC_BACKGROUND_LOOBY = "mainscreen",
    MUSIC_BACKGROUND_LOOBY_CHRIST = "mainscreen_christ",
    MUSIC_BACKGROUND_CHRIST = "gameplay_christ",
    MUSIC_BACKGROUND_GAMEPLAY = "gameplay"
}

enum LanguagesName {
    VN = "vi",
    EN = "en"
}

enum GameSoundEffect {
    CLICK = "audio/TapButton",
    POP_DIALOG = "audio/pop_dialog",
    CONFETII = 'audio/confetii',
    CAR_LEAVE_BUS_STOP = 'audio/CarLeaveBusStop',           // âm thanh này là âm thanh tiền
    CONSTRUCTOR_UNLOCKED = 'audio/area_unlocked',
    SOUND_LOSE = 'audio/sound_lose',
    UNLOCK_SLOT_CAR = 'audio/unlock_slot_car',
    SOUND_HELI = 'audio/heli',
    CAR_COLLIDE_CAR = 'audio/car_collide_car',
    SOUND_UNLOCK_EVENT = 'audio/unlock_event',
    UI_CLICK_SWEEP = 'audio/ui_click_sweep',

    // âm thanh chưa chuẩn đang copy tạm sang để không lỗi code
    SOUND_RECEIVE_ITEM_DONE = 'audio/sound_receive_done',//'audio/sound_receive_done',
    CHEST_CLAIM = 'audio/chest_claim',
    EFFECT_LEVEL_DONE_LOBBY = 'audio/effect_level_done_lobby',
    JACK_POT_DONE = "audio/jackpot_done",
    STAR_GEN_COLLECT_LOBBY = 'audio/star_gen_collect_lobby',
    STAR_COLLECT_LOBBY = 'audio/star_collect_lobby',//'audio/star_collect_lobby',
    JACK_POT_LOOP_2 = "audio/reward_spin",

    SOUND_BUILD = 'audio/SoundBuilding',
    SOUND_COLLECTCOINS = 'audio/collectCoins',
    SOUND_REWARDS_SHOW = 'audio/rewards',//'audio/rewards',
    SOUND_REWARDS = 'audio/rewards2',//'audio/rewards',
    SOUND_DIALOG_OPEN = 'audio/Dialog_Open',
    SOUND_DIALOG_CLOSE = 'audio/Dialog_Close',

    SOUND_OPEN_UI_TARGET = 'audio/Dialog_Open',//Wind
    SOUND_CLOSE_UI_TARGET = 'audio/Dialog_Close',//Wind
    SOUND_GOAL_COMPLETE = 'audio/goal_complete',
    SOUND_LEVEL_COMPLETED = 'audio/level_completed',
    SOUND_BUY_SUCCESS = 'audio/Buy_Success',
    SOUND_CLAIM_COINS = 'audio/Claim_Coins',
    SOUND_CLAIM_COINS2 = 'audio/Claim_Coins2',
    SOUND_PEEP = 'audio/Peep_Peep', //Trc khi hien man win
    SOUND_POPUP_FAILED = 'audio/Popup_Failed', //UI CONTINUE
    SOUND_PRAISE = 'audio/Praise', //Khen thưởng
    SOUND_HARD_LEVEL_OPEN = 'audio/Hard_Level',
    SOUND_BOOSTER_SHUFFLE = 'audio/Shuffle',
    SOUND_BOOSTER_SORT = 'audio/Sort',
    SOUND_BOOSTER_HELLICOPTER = 'audio/Helicopter2',
    SOUND_BOOSTER_HELLICOPTER_PICK = 'audio/Helicopter_Pick',
    SOUND_BOOSTER_HELLICOPTER_DROP = 'audio/Helicopter_Drop',
    SOUND_RUSH_BG = 'audio/Rush_Background',//Mở UIDashRush loop
    SOUND_RUSH_PROGRESS = 'audio/Rush_ProgressPlus',//Xe chạy chưa đến đích
    SOUND_RUSH_SPEED_RUN = 'audio/Rush_Speed_Run',//Có xe chạy đến đích
    SOUND_RUSH_WIN = 'audio/Rush_Win',//Thưởng quà
    SOUND_USE_BOOSTER = 'audio/Use_Booster',
    SOUND_COIN_APPEARS = 'audio/Coins_Appear',
}

enum VolumeSound {

}

enum LEVEL_PROPERTY_DATA {
    ID = '0',
    LEVEL = '1',
    TOTAL_NUMBER = '2',
    BLOCKS = '3',
    BLOCK_TYPE_NUM = '4'
}

enum CHALLENGE_PROPERTY_DATA {
    ID = '0',
    LEVEL_ID = '1'
}

enum TYPE_PRIZE {
    "VIP_SLOT",                     //0
    "SHUFFLE",                      //1
    "SORT",                         //2
    "MONEY",                        //3
    "TICKET",                       //4
    "TIME",                         //5
    "MAGNIFYING_GLASS",             //6
    "HAMMER",                       //7
    "DOUBLE_KEY_SEASON_PASS",       //8
    "BUILDING"                      //9
}

export function convertTYPE_PRIZEtoTYPE_ITEM(typePrize: TYPE_PRIZE): TYPE_ITEM {
    let typeItem: TYPE_ITEM = null;
    switch (typePrize) {
        case TYPE_PRIZE.SHUFFLE: typeItem = TYPE_ITEM.SHUFFLE; break;
        case TYPE_PRIZE.SORT: typeItem = TYPE_ITEM.SORT; break;
        case TYPE_PRIZE.VIP_SLOT: typeItem = TYPE_ITEM.VIP_SLOT; break;
        case TYPE_PRIZE.HAMMER: typeItem = TYPE_ITEM.HAMMER; break;
        case TYPE_PRIZE.MAGNIFYING_GLASS: typeItem = TYPE_ITEM.MAGNIFYING_GLASS; break;
        case TYPE_PRIZE.TIME: typeItem = TYPE_ITEM.TIME; break;
    }

    return typeItem
}

export function addPrizeToList(listA: IPrize[], listB: IPrize[]): IPrize[] {
    let result: IPrize[] = [];
    // Helper to add or update prize in result
    function addOrUpdate(prize: IPrize) {
        const found = result.find(
            p => p.typePrize === prize.typePrize && p.typeReceivePrize === prize.typeReceivePrize
        );
        if (found) {
            found.value += prize.value;
        } else {
            result.push(new IPrize(prize.typePrize, prize.typeReceivePrize, prize.value));
        }
    }

    // Loop both lists
    for (const prize of Utils.CloneListDeep(listA)) {
        addOrUpdate(prize);
    }
    for (const prize of Utils.CloneListDeep(listB)) {
        addOrUpdate(prize);
    }
    return result;
}

enum TOURNAMENT_TYPE {
    NORMAL_TIME,
    NO_LIMIT_RULE_DICE_TIME,
    PUZZLE_TIME,
    CLIMB_RANK
}

enum UI_END_GAME {
    TIME_UP,
    NO_MORE_SPACE,
    SETTING
}

enum UI_STAR_LEVEL_CHEST {
    STAR,
    LEVEL
}

enum TYPE_SPECIAL_LOBBY {
    SHOW_DAILY_CHALLENGE,
    SHOW_DONE_LEVEL,
    SHOW_TOURNAMENT
}

enum TYPE_UI_RECEIVE_PRIZE {
    TILE_RUSH
}

enum TYPE_RECEIVE {
    NUMBER,
    TIME_MINUTE,
    TIME_HOUR
}

enum TYPE_ITEM {
    VIP_SLOT,
    SHUFFLE,
    SORT,
    TIME,
    HAMMER,
    MAGNIFYING_GLASS
}
Enum(TYPE_ITEM);
export function ConvertTYPE_PRIZEToTYPE_ITEM(typePrize: TYPE_PRIZE) {
    switch (typePrize) {
        case TYPE_PRIZE.SHUFFLE: return TYPE_ITEM.SHUFFLE;
        case TYPE_PRIZE.VIP_SLOT: return TYPE_ITEM.VIP_SLOT;
        case TYPE_PRIZE.SORT: return TYPE_ITEM.SORT;
        default:
            return null;
    }
}
export function GetNameTypeItem(typeItem: TYPE_ITEM) {
    switch (typeItem) {
        case TYPE_ITEM.VIP_SLOT: return "VIP_SLOT";
        case TYPE_ITEM.SHUFFLE: return "SHUFFLE";
        case TYPE_ITEM.SORT: return "SORT";
        case TYPE_ITEM.TIME: return "TIME";
        case TYPE_ITEM.HAMMER: return "HAMMER";
        case TYPE_ITEM.MAGNIFYING_GLASS: return "MAGNIFYING_GLASS";
        default: return null;
    }
}

enum TYPE_UI_NOTIFICATION {
    BUY_PASS,
}

//NOTE ko được phép bỏ bớt đi một phần nào trong này
enum TYPE_EVENT_GAME {
    SEASON_PASS,        //0
    SPIN,               //1
    INVITE_FRIEND,      //2
    LOGIN_REWARD,       //3
    LEVEL_PASS,         //4
    DAILY_CHALLENGE,    //5
    BUILDING,           //6
    PVP,                //7
    PIGGY_BANK,         //8
    DASH_RUSH,          //9
    SPEED_RACE,         //10
    ENDLESS_TREASURE,   //11
    LEVEL_PROGRESSION,  //12
    SEASON_PASS_2,      //13
    TREASURE_TRAIL,     //14
    SKY_LIFT,           //15
    CHRISTMAS_EVENT     //16
}
Enum(TYPE_EVENT_GAME);

export function getNameTypeEventGame(type: TYPE_EVENT_GAME) {
    switch (type) {
        case TYPE_EVENT_GAME.DAILY_CHALLENGE: return "daily_challenge";
        case TYPE_EVENT_GAME.LEVEL_PASS: return "level_pass";
        case TYPE_EVENT_GAME.PVP: return "pvp";
        case TYPE_EVENT_GAME.PIGGY_BANK: return "piggy_bank";
        case TYPE_EVENT_GAME.BUILDING: return "building";
        case TYPE_EVENT_GAME.SPIN: return "spin";
        case TYPE_EVENT_GAME.SEASON_PASS: return "season_pass";
        case TYPE_EVENT_GAME.INVITE_FRIEND: return "invite_friend";
        case TYPE_EVENT_GAME.LOGIN_REWARD: return "login_reward";
        case TYPE_EVENT_GAME.DASH_RUSH: return "dash_rush";
        case TYPE_EVENT_GAME.SPEED_RACE: return "speed_race";
        case TYPE_EVENT_GAME.TREASURE_TRAIL: return "treasure_trail";
        case TYPE_EVENT_GAME.SKY_LIFT: return "sky_lift";
        case TYPE_EVENT_GAME.ENDLESS_TREASURE: return "endless treasure";
        case TYPE_EVENT_GAME.LEVEL_PROGRESSION: return "level progress";
        case TYPE_EVENT_GAME.CHRISTMAS_EVENT: return "christmas_event";
        default: return null;
    }
}

enum TYPE_RECEIVE_PRIZE_LOBBY {
    FINISH_MAP_LOBBY,
    FINISH_BUILDING_LOBBY,
    SHOP_PACK,
    SHOP_COIN,
    SHOP_SKIP_ITS,
    SPIN,
    DAILY_LOGIN,
    TOURNAMENT,
    LOGIN_REWARD,
    SEASON_PASS_CHEST,
    SEASON_PASS_LIST_PRIZE,
    LEVEL_PASS_CHEST,
    LEVEL_PASS_LIST_PRIZE,
    PACK,
    WEEKLY,
    INVITE_FRIEND,
    DASH_RUSH,
    SPEED_RACE,
    ENDLESS_TREASURE,
    LEVEL_PROGRESSION_END_TIME,
    FINISH_BUILDING_CONSTRUCTOR_LOBBY,
    HAT_RACE,
    LIGHT_ROAD
}

enum STATE_ITEM_PRIZE_RIDE_UP {
    CAN_NOT_BE_RECEIVED,
    CAN_BE_RECEIVED,
    RECEIVED
}

enum STATE_UI_END {
    UI_PHASE,   // show UI Phase
    UI_LEVEL_FAILED,   // show UI Level Failed
    UI_OUT_OF_LIVES,   // show UI Out of lives
}

enum STATE_GAME {
    PREPARE,
    OPENING,
    PLAYING,
    PAUSE,
    LOSE_GAME,
    WIN_GAME
}

enum TYPE_CURRENCY {
    MONEY,
    TICKET
}

enum TYPE_LOSE_GAME {
    OVER_TIME,
    NO_MORE_MOVES,
    CAR_OVER_TIME
}

enum TYPE_RESOURCE {
    LIFE,
    ITEM_SORT,
    ITEM_SHUFFLE,
    ITEM_VIP_SLOT
}

enum TYPE_LEVEL_NORMAL {
    NORMAL,
    HARD,
    SUPER_HARD
}


export { LanguagesName, GameMusicDisplay, GameSoundEffect, VolumeSound as VolumnSound, TYPE_PRIZE, TOURNAMENT_TYPE };
export { LEVEL_PROPERTY_DATA, CHALLENGE_PROPERTY_DATA };
export { UI_END_GAME, UI_STAR_LEVEL_CHEST };
export { TYPE_SPECIAL_LOBBY, TYPE_UI_RECEIVE_PRIZE, TYPE_RECEIVE, TYPE_UI_NOTIFICATION, TYPE_ITEM, TYPE_EVENT_GAME, TYPE_RECEIVE_PRIZE_LOBBY };
export { STATE_ITEM_PRIZE_RIDE_UP, STATE_UI_END, STATE_GAME, TYPE_LEVEL_NORMAL };

// base game
export { TYPE_CURRENCY, TYPE_RESOURCE, TYPE_LOSE_GAME };

Enum(TYPE_CURRENCY);
Enum(TYPE_RESOURCE);

export enum LANGUAGE {
    EN = 'en',
    VI = 'vi'
}

export interface IPopUpBuyItemInGame {
    typeItemBuy: TYPE_ITEM,
}

export class DataItemTileRush {
    indexRank: number;
    id: string;
    name: string;
    pathAvatar: string;
    numTiles: number;
    isPlayer: boolean = false;
}

export class DataItemTileRace {
    index: number;
    indexAvatarUrl: number;
    indexName: number;
    progress: number;
}

export class InfoEventData {
    id: number = 0;
    timeGen: number = 0;
    progress: number = 0;
    wasClaimed: boolean = true;
    isEnd: boolean = true;
    timeX2End: number = 0;
}
export function jsonInfoEventData(data: InfoEventData) {
    return `${data.id},${data.timeGen},${data.progress},${data.wasClaimed ? 't' : 'f'},${data.isEnd ? 't' : 'f'},${data.timeX2End}`;
}

export function readJsonInfoEventData(dataOut: InfoEventData, jsonInput: string) {
    let listData: string[] = jsonInput.split(",");
    if (listData[0] != null && listData[0] != undefined) dataOut.id = Number.isNaN(Number.parseInt(listData[0])) ? 0 : Number.parseInt(listData[0]);
    if (listData[1] != null && listData[1] != undefined) dataOut.timeGen = Number.isNaN(Number.parseInt(listData[1])) ? 0 : Number.parseInt(listData[1]);
    if (listData[2] != null && listData[2] != undefined) dataOut.progress = Number.isNaN(Number.parseInt(listData[2])) ? 0 : Number.parseInt(listData[2]);
    if (listData[3] != null && listData[3] != undefined) dataOut.wasClaimed = listData[3] == "t";
    if (listData[4] != null && listData[4] != undefined) dataOut.isEnd = listData[4] == "t";
    if (listData[5] != null && listData[5] != undefined) dataOut.timeX2End = listData[5] == "" ? 0 : Number.parseInt(listData[5]);
}


export class InfoTournamentData {
    levels: number[] = [];
    rewards: IPrize[][] = [];
}

//#region Invite friend
export enum STATE_ITEM_PRIZE_INVITE_FRIEND {
    LOCK,
    UNLOCK,
    CLAIMED
}
export class InfoPrizeFriendJoined {
    values: IPrize[] = [];
    NumFriend: number;
}
//#endregion Invite friend

//#region SeasonPass
export class InfoPrizeSeasonPass {
    index: number = 0;
    maxKey: number = 0;
    values: IPrize[] = [];
}
//#endregion SeasonPass

//#rengion LevelPass
export class InfoPrizePass {
    index: number = 0;
    maxStars: number = 0;
    listItemsPassFree: IPrize[] = [];
    listItemsPassPremium: IPrize[] = [];
}
//#endregion LevelPass

// #region LoginReward
export class InfoProgressLoginReward {
    progress: number = 0;
    listPrize: IPrize[] = [];
}
// #endregion LoginReward

//==========================================
//#region group events

/**
 * timeDelayEvents && timeDelayEvents luôn có kích thước bằng listEvents
 */
export interface IGroupEvents {
    iSave: IGroupEventSave;
    listEvents: TYPE_EVENT_GAME[];
    listCbCheckNextEvent: Array<() => boolean>;
    listCbGetTimeNextEvent: Array<() => number>;
    cbNewIndexOfNextLoop: (groupCheck: IGroupEvents) => { indexEventNew: number, timeRemainNew: number, numLoopWasPass: number };
    listCbBeforeNextEvent?: Array<() => void>;
    listCbAfterNextEvent?: Array<(...args) => void>;
    listCbAfterUpdateListEventWorking?: Array<() => void>;
    logicCanShowOtherEventButLock?: (numLoop: number, listEvent: TYPE_EVENT_GAME[], indexEventShowing: number) => TYPE_EVENT_GAME[];
    cbCheckEventBeforeUpdataGroup?: (iSave: IGroupEventSave, listEvents: TYPE_EVENT_GAME[]) => void;
}
export interface IGroupEventSave {
    idGroup: number;
    indexEventChecked: number;
    numLoop: number;
    timeCanCheckNextEvent: number;
    isCheckFirstTime: boolean;
}

export function JsonListIGroupEventSave(input: IGroupEventSave[]): string {
    let result = '';
    input.forEach(iGroupCheck => {
        const jsonData = `${iGroupCheck.idGroup}_${iGroupCheck.indexEventChecked}_${iGroupCheck.numLoop}_${iGroupCheck.timeCanCheckNextEvent}_${iGroupCheck.isCheckFirstTime ? "t" : "f"}|`;
        result += jsonData;
    })
    if (result.endsWith("|")) {
        result = result.slice(0, -1);
    }
    return result;
}

export function ReadJsonListIGroupEventSave(input: string): IGroupEventSave[] {
    let result: IGroupEventSave[] = [];

    if (input == null || input == undefined || input.length == 0) { return result; }
    const listDataCheck: string[] = input.split("|");
    if (listDataCheck == null || listDataCheck == undefined || listDataCheck.length == 0) { return result; }
    listDataCheck.forEach(valueData => {
        const dataSplit: string[] = valueData.split("_");
        if (dataSplit != null && dataSplit != undefined && dataSplit.length > 0) {
            let iGroupNew: IGroupEventSave = {
                idGroup: Number.parseInt(dataSplit[0]),
                indexEventChecked: Number.parseInt(dataSplit[1]),
                numLoop: Number.parseInt(dataSplit[2]),
                timeCanCheckNextEvent: Number.parseInt(dataSplit[3]),
                isCheckFirstTime: dataSplit[4] != null && dataSplit[4] == "t" ? true : false
            }
            result.push(iGroupNew);
        }
    });

    return result;
}
//#endregion group events
//===========================================


// #region Lobby
export class DataLobbyJson {
    seasonPass: number = 0;
    levelPass: number = 0;
    numCoin: number = 0;
    numBuilding: number = 0;
    isReceivePiggyBank: boolean = false;
    isReceiveSpeedRace: boolean = false;
    isReceiveDashRush: boolean = false;
    levelProgress: number = 0;
}

export function jsonDataLobby(data: DataLobbyJson): string {
    return `${data.seasonPass},${data.levelPass},${data.numCoin},${data.numBuilding},${data.isReceivePiggyBank ? 't' : 'f'},${data.isReceiveSpeedRace ? 't' : 'f'},${data.isReceiveDashRush ? 't' : 'f'},${data.levelProgress}`;
}
export function readJsonDataLobby(data: string): DataLobbyJson {
    if (data == null || data == undefined) return new DataLobbyJson();
    let listData: string[] = data.split(",");
    if (listData == null || listData == undefined || listData.length == 0) { return new DataLobbyJson(); }
    let dataOut = new DataLobbyJson();
    if (listData[0] != null && listData[0] != undefined) dataOut.seasonPass = Number.parseInt(listData[0]);
    if (listData[1] != null && listData[1] != undefined) dataOut.levelPass = Number.parseInt(listData[1]);
    if (listData[2] != null && listData[2] != undefined) dataOut.numCoin = Number.parseInt(listData[2]);
    if (listData[3] != null && listData[3] != undefined) dataOut.numBuilding = Number.parseInt(listData[3]);
    if (listData[4] != null && listData[4] != undefined) dataOut.isReceivePiggyBank = listData[4] == 't';
    if (listData[5] != null && listData[5] != undefined) dataOut.isReceiveSpeedRace = listData[5] == 't';
    if (listData[6] != null && listData[6] != undefined) dataOut.isReceiveDashRush = listData[6] == 't';
    if (listData[7] != null && listData[7] != undefined) dataOut.levelProgress = Number.parseInt(listData[7]);

    return dataOut;
}
// #endregion Lobby

export interface IUIPopUpRemoveAds {
    isEmitContinue: boolean;
}

export interface IOpenUIDailyChallenge {
    iOpenUIBaseWithInfo: IOpenUIBaseWithInfo;
    dayOpenDone: DayDailyInfo;
}

export interface IOpenUIInviteFriend {
    iOpenUIBaseWithInfo: IOpenUIBaseWithInfo;
    isShowBtnClose: boolean;
}
export function instanceOfIOpenUIInviteFriend(object: any): object is IOpenUIInviteFriend {
    return object != null && 'isShowBtnClose' in object && 'iOpenUIBaseWithInfo' in object;
}

export interface IOpenUIBaseWithInfo {
    isShowInfo: boolean;
}
export function instanceOfIOpenUIBaseWithInfo(object: any): object is IOpenUIBaseWithInfo {
    return object != null && 'isShowInfo' in object;
}

export interface IUIKeepTutAndReceiveLobby {
    canKeepTutAndReceiveLobby: boolean;
}
export function instanceOfIUIKeepTutAndReceiveLobby(object: any): object is IUIKeepTutAndReceiveLobby {
    return object != null && 'canKeepTutAndReceiveLobby' in object;
}

//#region share ui
export interface IShareNormalData {
    level: number;
}

export interface IShareTournamentData {
    nameTournament: string;
    score: number;
    dataTop3: IDataPlayer_LEADERBOARD[];
    sfAvatarTop: SpriteFrame[];
}

export interface IShareAskLive {
    idFriend: string;
    idPlayerSendAsk: string;
    nameFriend: string;
    timeAskLive: number;
}

export interface IShareReceiveLive {
    idFriend: string;
    idPlayerSendReceive: string;
    nameFriend: string;
    timeReceiveLive: number;
}

export function instanceOfIShareAskLive(object: any): object is IShareAskLive {
    return 'timeAskLive' in object;
}

export function instanceOfIShareReceiveLive(object: any): object is IShareReceiveLive {
    return 'timeReceiveLive' in object;
}

export enum TYPE_UI_SHARE {
    NORMAL,
    INVITE,
    TOURNAMENT,
    WITH_FRIEND
}
//#endregion

//#region dailyQuest
export enum TYPE_QUEST_DAILY {
    LOGIN,
    SHARE,
    WIN_NORMAL_GAME,
    WIN_STEAK_NORMAL_GAME,
    USE_ITEM,
    FINISH_TOURNAMENT,
    PLAY_NORMAL_GAME,
    BUY_ITEM_BOOSTER,
    SPIN,
    INVITE_FRIEND,
    USE_ITEM_SORT,
    USE_ITEM_SHUFFLE,
    USE_ITEM_VIP_SLOT,
    BUILD_A_CONSTRUCTOR,
    PLAY_TOURNAMENT_GAME,
    WATCH_ADS,
    USE_COIN,
}

export enum STATUS_ITEM_QUEST {
    NOT_DONE,
    WAIT_TO_CLAIM,
    DONE
}

export class IInfoJsonDailyQuest {
    id: string;
    rank: number;
    nameQuest: string;
    maxProgress: number;
    typeQuest: TYPE_QUEST_DAILY;
    listPrize: IPrize[];
    progressNow: number;
    status: STATUS_ITEM_QUEST;

    public SetDataFromJson(dataJson: any, listPrizeGetFromJson: IPrize[]) {
        if (dataJson == null) return;

        this.id = dataJson.Id;
        this.rank = Number.parseInt(dataJson.Rank);
        this.nameQuest = dataJson.NameQuest;
        this.maxProgress = dataJson.MaxProgress;
        this.typeQuest = this.ConvertTypeQuestFromJson(dataJson.TypeQuest);
        this.listPrize = listPrizeGetFromJson;
        this.progressNow = 0;
        this.status = STATUS_ITEM_QUEST.NOT_DONE;
    }

    private ConvertTypeQuestFromJson(data: string): TYPE_QUEST_DAILY {
        let result: TYPE_QUEST_DAILY = null;
        switch (data) {
            case "LOGIN": result = TYPE_QUEST_DAILY.LOGIN; break;
            case "SHARE": result = TYPE_QUEST_DAILY.SHARE; break;
            case "WIN_NORMAL_GAME": result = TYPE_QUEST_DAILY.WIN_NORMAL_GAME; break;
            case "WIN_STEAK_NORMAL_GAME": result = TYPE_QUEST_DAILY.WIN_STEAK_NORMAL_GAME; break;
            case "USE_ITEM": result = TYPE_QUEST_DAILY.USE_ITEM; break;
            case "FINISH_TOURNAMENT": result = TYPE_QUEST_DAILY.FINISH_TOURNAMENT; break;
            case "PLAY_NORMAL_GAME": result = TYPE_QUEST_DAILY.PLAY_NORMAL_GAME; break;
            case "BUY_ITEM_BOOSTER": result = TYPE_QUEST_DAILY.BUY_ITEM_BOOSTER; break;
            case "SPIN": result = TYPE_QUEST_DAILY.SPIN; break;
            case "INVITE_FRIEND": result = TYPE_QUEST_DAILY.INVITE_FRIEND; break;
            case "USE_ITEM_SORT": result = TYPE_QUEST_DAILY.USE_ITEM_SORT; break;
            case "USE_ITEM_SHUFFLE": result = TYPE_QUEST_DAILY.USE_ITEM_SHUFFLE; break;
            case "USE_ITEM_VIP_SLOT": result = TYPE_QUEST_DAILY.USE_ITEM_VIP_SLOT; break;
            case "BUILD_A_CONSTRUCTOR": result = TYPE_QUEST_DAILY.BUILD_A_CONSTRUCTOR; break;
            case "PLAY_TOURNAMENT_GAME": result = TYPE_QUEST_DAILY.PLAY_TOURNAMENT_GAME; break;
            case "WATCH_ADS": result = TYPE_QUEST_DAILY.WATCH_ADS; break;
            case "USE_COIN": result = TYPE_QUEST_DAILY.USE_COIN; break;
        }
        return result;
    }

    public GetProgressString() {
        return `${this.progressNow}/${this.maxProgress}`;
    }

    public GetProgressForPb(): number { return this.progressNow / this.maxProgress; }
}
//#endregion dailyQuest

//#region christmas
export class InfoPackChristmasAFO {
    namePack: string;
    nameUI: string;
    allPack: { namePack: string , price: number, Prizes: IPrize[] }[];
    PriceTotal: string;
    numAvaliable: number;
    timeLimit: number;
    timeAutoReset: number;
    type: TypePack;
}
//#endregion christmas

//#region pack
export class InfoPackFromRootJson {
    namePack: string;
    nameUI: string;
    price: string;
    Prizes: IPrize[];
    Sale: number;
    numAvaliable: number;
    timeLimit: number;
    timeAutoReset: number;
    type: TypePack;
    isBestSellerRibbon: boolean;
}
export class InfoPack {
    namePack: string;
    nameUI: string;
    price: string
    Prizes: IPrize[] = [];
    Sale: number;
    numAvaliable: number;
    timeLimit: number; // this info will save the time end when init this pack
    timeAutoReset: number;
    type: TypePack;
    isBestSellerRibbon: boolean;

    public readDataFromJson_WhenInit(json: InfoPackFromRootJson) {
        this.namePack = json.namePack;
        this.nameUI = json.nameUI;
        this.price = json.price;
        this.Prizes = json.Prizes;
        this.Sale = json.Sale;
        this.numAvaliable = json.numAvaliable;
        this.timeLimit = Utils.getCurrTime() + json.timeLimit;
        this.timeAutoReset = json.timeAutoReset;
        this.type = json.type;
        this.isBestSellerRibbon = json.isBestSellerRibbon;
    }

    public JsonData(): string {
        let jsonPrize: string = this.Prizes.map(item => item.JsonData()).join(",");
        const namePackRight = this.switchIdPackNew_ToOld(this.namePack);
        if (jsonPrize == '')
            jsonPrize = '';
        return `${namePackRight}-${this.numAvaliable}-${this.timeLimit}-${this.type}`
    }

    public readDataFromJson_OfPlayer(json: any) {
        let data = json.split('-');
        switch (true) {
            case data != null && data.length == 4:
                this.namePack = this.switchIdPackOld_ToNew(data[0]);
                this.numAvaliable = parseInt(data[1]);
                this.timeLimit = parseInt(data[2]);
                this.type = data[3];
                break;
            case data != null && data.length == 7:
                this.namePack = this.switchIdPackOld_ToNew(data[0]);
                this.nameUI = data[1];
                this.Prizes = [];
                const listPrize = data[2].split(',');
                // check in case no prize
                if (listPrize != '') {
                    for (let i = 0; i < listPrize.length; i++) {
                        let prizeRead = new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 0);
                        // read prize from json
                        prizeRead.readDataFromJson(listPrize[i]);
                        this.Prizes.push(prizeRead);
                    }
                }
                this.Sale = parseInt(data[3]);
                this.numAvaliable = parseInt(data[4]);
                this.timeLimit = parseInt(data[5]);
                this.type = data[6];
                break;
        }
    }

    public switchIdPackOld_ToNew(nameInput: string) {
        switch (nameInput) {
            case 'p_1': return 'p_01';
            case 'p_2': return 'p_02';
            case 'p_3': return 'p_03';
            case 'td_1': return 'td_01';
            case 'h_1': return 'h_01';
            case 'sh_1': return 'sh_01';
            case 'sb_1': return 'sb_01';
            case 'mb_1': return 'mb_01';
            default: return nameInput;
        }
    }

    public switchIdPackNew_ToOld(nameInput: string) {
        switch (nameInput) {
            case 'p_01': return 'p_1';
            case 'p_02': return 'p_2';
            case 'p_03': return 'p_3';
            case 'td_01': return 'td_1';
            case 'h_01': return 'h_1';
            case 'sh_01': return 'sh_1';
            case 'sb_01': return 'sb_1';
            case 'mb_01': return 'mb_1';
            default: return nameInput;
        }
    }

    public copyDataFromPackSave(packSave: InfoPack) {
        this.namePack = packSave.namePack;
        this.numAvaliable = packSave.numAvaliable;
        this.timeLimit = packSave.timeLimit;
        this.type = packSave.type;
    }
}
export enum EnumNamePack {
    StartedPack = "p_01",
    GreateDealsPack_1 = "p_02",
    GreateDealsPack_2 = "p_03",
    TravelDeal = 'td_01',
    HardLevelOffer = 'h_01',
    SuperHardLevelOffer = 'sh_01',
}
Enum(EnumNamePack);
export function ConvertStringToEnumNamePack(namePack: string): EnumNamePack {
    switch (namePack) {
        case "p_01":
            return EnumNamePack.StartedPack;
        case "p_02":
            return EnumNamePack.GreateDealsPack_1;
        case "p_03":
            return EnumNamePack.GreateDealsPack_2;
        case "td_01":
            return EnumNamePack.TravelDeal;
        case "h_01":
            return EnumNamePack.HardLevelOffer;
        case "sh_01":
            return EnumNamePack.SuperHardLevelOffer;
    }
    return null;
}

export enum ENamePACK_UNLIMITED {
    SmallBundle = 'sb_01',
    MediumBundle = 'mb_01',
    LargeBundle = 'mb_02'
}

export type TypePack = 'IAP' | 'ADS' | 'IAP_INFINITY' | 'LOSE' | 'HALLOWEEN' | 'CHRISTMAS';
export enum EnumReasonEndPack {
    EndTime,
    InvalidNumAvailable,
    Force
};

export interface IUIPackDefault {
    isCallFromLobby: boolean;
}
export function instanceOfIUIPackDefault(object: any): object is IUIPackDefault {
    return 'isCallFromLobby' in object;
}
//#endregion pack

//#region read data Json
export class InfoItemBundleStore {
    idBundle: string = '';
    typeUI: number = 0;
    nameBundle: string = '';
    price: string = '';
    listItems: IPrize[] = [];
}

export class IPrize {
    typePrize: TYPE_PRIZE;
    typeReceivePrize: TYPE_RECEIVE;
    value: number;

    constructor(typePrize: TYPE_PRIZE, typeReceivePrize: TYPE_RECEIVE, value: number) {
        this.typePrize = typePrize;
        this.typeReceivePrize = typeReceivePrize;
        this.value = value;
    }

    public JsonData(): string {
        return `${this.typePrize}+${this.typeReceivePrize}+${this.value}`;
    }

    public readDataFromJson(json: string) {
        let data = json.split('+');
        this.typePrize = parseInt(data[0]);
        this.typeReceivePrize = parseInt(data[1]);
        this.value = parseInt(data[2]);
    }

    public GetStringValue(): string {
        switch (this.typeReceivePrize) {
            case TYPE_RECEIVE.NUMBER:
                return `${this.value}`;
            case TYPE_RECEIVE.TIME_MINUTE:
                return `${this.value}m`;
            case TYPE_RECEIVE.TIME_HOUR:
                return `${this.value}h`;
        }
    }

    public GetStringValue_2(): string {
        switch (this.typeReceivePrize) {
            case TYPE_RECEIVE.NUMBER:
                return `x${this.value}`;
            case TYPE_RECEIVE.TIME_MINUTE:
                return `${this.value}m`;
            case TYPE_RECEIVE.TIME_HOUR:
                return `${this.value}h`;
        }
    }
}

export function addIPrizeToList(listIPrizeRoot: IPrize[], listIPrizeAdd: IPrize[]): IPrize[] {
    // loop list iprize then if it has same typeReceive && sane typePrize + value
    // if not => just add iPrize to it
    for (let i = 0; i < listIPrizeAdd.length; i++) {
        let wasAddPrize: boolean = false;

        for (let j = 0; j < listIPrizeRoot.length; j++) {
            if (listIPrizeAdd[i].typeReceivePrize == listIPrizeRoot[j].typeReceivePrize && listIPrizeAdd[i].typePrize == listIPrizeRoot[j].typePrize) {
                listIPrizeRoot[j].value += listIPrizeAdd[i].value;
                // break nếu tìm thấy prize có thể add thêm
                wasAddPrize = true;
                break;
            }
        }

        // kiểm tra nếu chưa được thêm prize thì hãy add thêm vào cuối danh sách
        if (!wasAddPrize) {
            listIPrizeRoot.push(listIPrizeAdd[i]);
        }
    }

    return listIPrizeRoot;
}

export function FlatListListIPrize(dataIn: IPrize[][]): IPrize[] {
    const flatPrizes: IPrize[] = dataIn.flat();
    const prizeMap = new Map<string, number>();

    for (const prize of flatPrizes) {
        let tFlatPrize: string = `${prize.typePrize}_${prize.typeReceivePrize}`;
        if (prizeMap.has(tFlatPrize)) {
            prizeMap.set(tFlatPrize, prizeMap.get(tFlatPrize) + prize.value);
        } else {
            prizeMap.set(tFlatPrize, prize.value);
        }
    }

    let result: IPrize[] = [];
    prizeMap.forEach((value: number, key: string) => {
        const [typePrize, typeReceivePrize] = key.split('_');
        result.push(new IPrize(Number(typePrize), Number(typeReceivePrize), value));
    })

    console.log(result);

    return result;
}

export type IInfoPrizeSpin = {
    rate: number;
    listItem: IPrize[];
}
export type IInfoPrizeProgressSpin = {
    progress: number;
    listItem: IPrize[];
}

export class InfoPackEndlessTreasure {
    idBundle: string = '';
    price: number = 0;
    rewards: IPrize[] = [];
    isBought: boolean = false;

    public GetIndexBundle(): number {
        try {
            const numTextId = this.idBundle.slice(3);
            const index = Number.parseInt(numTextId);
            return index;
        } catch (e) {
            return -1;
        }
    }
}
//#endregion read data Json

//#region tut
export interface ParamNextStepTut {
    argBeforeNextStep: any,
    argDoStep: any
}
//#endregion tut

// #region map
export interface JsonMapGame {
    Time: number;
    LevelScaleFactor: number;
    ParkingSpaceInit: number;
    GuestColor: number[];
    CarInfo: JsonCar[];
    ConveyorBeltInfo: JsonConveyorBelt[];
    GarageInfo: JsonGarage[];
    Group: JsonGroup[];
}
export interface JsonGroup {
    typeUse: TYPE_USE_JSON_GROUP;
    numberLose: number;
    listGroups: number[][];
    dataCustom?: any;
}

export interface TGroupBuild {
    quality: number,
    startR: number,
    endR: number
}

export interface TGroupToLogic {
    color: number,
    total: number,
    listTGroup: TGroupBuild[],
    numCar?: number,
    priority: number
}

export function JSON_GroupBuild(groupBuild: TGroupBuild) {
    return `${groupBuild.quality}-${groupBuild.startR}-${groupBuild.endR}`;
}

export function JSON_TGroupToLogic(listTGroup: TGroupToLogic[]): string {
    function JsonEachGroup(tGroup: TGroupToLogic) {
        let listGroupBuild = '';
        tGroup.listTGroup.forEach(groupCheck => { listGroupBuild += JSON_GroupBuild(groupCheck) + "," })
        listGroupBuild = listGroupBuild.slice(0, listGroupBuild.length - 1);
        return `${tGroup.color}_${tGroup.total}_${listGroupBuild}_${tGroup.numCar}_${tGroup.priority}`;
    }

    let result: string = '';
    listTGroup.forEach(tGroup => {
        result += JsonEachGroup(tGroup) + "*";
    });
    result = result.slice(0, result.length - 1);
    return result;
}

export function UNJSON_TGroupToLogic(input: string): TGroupToLogic[] {
    if (input == null || input == "") { return null; }

    const listData: string[] = input.split('*');
    let result: TGroupToLogic[] = [];
    for (let i = 0; i < listData.length; i++) {
        const dataTGroupCheck = listData[i];
        const dataTGroup = dataTGroupCheck.split('_');
        if (dataTGroup[2] == null || dataTGroup[2] == '') { continue; }
        const listDataGroupBuild: string[] = dataTGroup[2].split(',');
        let listTGroupBuild: TGroupBuild[] = [];
        listDataGroupBuild.forEach(groupBuildCheck => {
            const dataGroupBuild = groupBuildCheck.split("-");
            listTGroupBuild.push({
                quality: Number.parseInt(dataGroupBuild[0]),
                startR: Number.parseInt(dataGroupBuild[1]),
                endR: Number.parseInt(dataGroupBuild[2])
            })
        })

        const color = Number.parseInt(dataTGroup[0]);
        const mColor: M_COLOR = GetMColorByNumber(color);
        const total = Number.parseInt(dataTGroup[1]);
        const numCar = dataTGroup[3] == null ? 0 : Number.parseInt(dataTGroup[3]);
        const priority = dataTGroup[4] == null ? GetPriorityDefaultByColor(mColor) : Number.parseInt(dataTGroup[4]);

        const infoTGroup: TGroupToLogic = {
            color: color,
            total: total,
            numCar: numCar,
            listTGroup: listTGroupBuild,
            priority: priority
        }

        result.push(infoTGroup);
    }

    return result;
}

export function GetPriorityDefaultByColor(color: M_COLOR): number {
    switch (color) {
        case M_COLOR.POLICE: case M_COLOR.MILITARY:
            return 1;
        case M_COLOR.AMBULANCE: case M_COLOR.FIRE_TRUCK:
            return 2;
        default:
            return 0;
    }
}

export enum TYPE_USE_JSON_GROUP {
    NOT_USE = 0,
    //priority = 2
    USE_FIRST = 1,                  // group này sẽ được ưu tiên sử dụng đầu tiên < nếu có > sau khi thua each lần thì sẽ chuyển đến các group tiếp theo
    //priority = 1
    USE_AFTER_LOSE_SOME_ROUND_FOR_NON_IAP = 2,   // group này sẽ được sử dụng sau khi user thua each lần đối với user chưa từng mua IAP
    //priority = 0
    USE_AFTER_LOSE_SOME_ROUND_FOR_IAP = 3,        // group này sẽ được sử dụng sau khi user thua each lần đối với user từng mua IAP
    //priority = ???
    NEW_LOGIC_SORT_DATA = 4
}

export function ConvertNameTypeUseJsonGroup(typeGroup: TYPE_USE_JSON_GROUP) {
    switch (typeGroup) {
        case TYPE_USE_JSON_GROUP.USE_FIRST: return 'gFirst';
        case TYPE_USE_JSON_GROUP.NOT_USE: return 'NotUse';
        case TYPE_USE_JSON_GROUP.USE_AFTER_LOSE_SOME_ROUND_FOR_NON_IAP: return 'gIAPNonLoseSomeRound';
        case TYPE_USE_JSON_GROUP.USE_AFTER_LOSE_SOME_ROUND_FOR_IAP: return 'gIAPLoseSomeRound';
        case TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA: return 'gSortPassLogic';
    }
    return null;
}
export interface JsonCar {
    idCar: number;
    carColor: number;
    carSize: number;
    carPosition: Vec3;
    carDirection: DIRECT_CAR;
    isMysteryCar: boolean;
    timeCarCallCoolDown?: number;
    numCarRemainingCallCoolDown?: number;
    timeCarCoolDown?: number;
    isTwoWayCar?: boolean;
    idCarKeyOfCarLock?: number;
    idCarLockOfCarKey?: number;
    colorKey_Lock?: number;
    listIdCarTrigger?: number[];
}

export interface JsonGarage {
    garagePosition: Vec3;
    cars: JsonCar[];
    direction: DIRECT_CAR;
}

export interface JsonConveyorBelt {
    conveyorBeltPosition: Vec3;
    cars: JsonCar[];
    direction: DIRECT_CAR;
}

export interface JsonPassenger {
    color: number;
    id?: number;
}

export enum COLOR_KEY_LOCK {
    BLUE = "Blue",
    GREEN = "Green",
    CYAN = "Cyan",
    ORANGE = "Orange",
    PINK = "Pink",
    PURPLE = "Purple",
    RED = "Red",
    YELLOW = "Yellow",
}

export function convertNumberToColorKeyLock(input: number): COLOR_KEY_LOCK {
    switch (input) {
        case 0: return COLOR_KEY_LOCK.BLUE;
        case 1: return COLOR_KEY_LOCK.GREEN;
        case 2: return COLOR_KEY_LOCK.CYAN;
        case 3: return COLOR_KEY_LOCK.ORANGE;
        case 4: return COLOR_KEY_LOCK.PINK;
        case 5: return COLOR_KEY_LOCK.PURPLE;
        case 6: return COLOR_KEY_LOCK.RED;
        case 7: return COLOR_KEY_LOCK.YELLOW;
        default: return null;
    }
}

export function convertColorKeyLockToNumber(input: COLOR_KEY_LOCK): number {
    switch (input) {
        case COLOR_KEY_LOCK.BLUE: return 0;
        case COLOR_KEY_LOCK.GREEN: return 1;
        case COLOR_KEY_LOCK.CYAN: return 2;
        case COLOR_KEY_LOCK.ORANGE: return 3;
        case COLOR_KEY_LOCK.PINK: return 4;
        case COLOR_KEY_LOCK.PURPLE: return 5;
        case COLOR_KEY_LOCK.RED: return 6;
        case COLOR_KEY_LOCK.YELLOW: return 7;
        default: return -1;
    }
}

export enum TYPE_CAR_SIZE {
    "4_CHO" = 4,
    "6_CHO" = 6,
    "10_CHO" = 10
}
Enum(TYPE_CAR_SIZE);

export function ConvertSizeCarFromJson(carSize: number): TYPE_CAR_SIZE {
    switch (carSize) {
        case 4: return TYPE_CAR_SIZE["4_CHO"];
        case 6: return TYPE_CAR_SIZE["6_CHO"];
        case 10: return TYPE_CAR_SIZE["10_CHO"];
    }
    return null;
}

export function ConvertJsonSizeBusFrenzyToSizeCar(size: number): TYPE_CAR_SIZE {
    switch (size) {
        case 0: return TYPE_CAR_SIZE["4_CHO"];
        case 1: return TYPE_CAR_SIZE["6_CHO"];
        case 2: return TYPE_CAR_SIZE["10_CHO"];
    }
}

export function ConvertSizeCarToJsonBusFrenzy(carSize: TYPE_CAR_SIZE): number {
    switch (carSize) {
        case TYPE_CAR_SIZE["4_CHO"]: return 0;
        case TYPE_CAR_SIZE["6_CHO"]: return 1;
        case TYPE_CAR_SIZE["10_CHO"]: return 2;
    }
}

export function ConvertSizeCarNumberToJsonBusFrenzy(carSize: TYPE_CAR_SIZE): number {
    switch (carSize) {
        case 4: return 0;
        case 6: return 1;
        case 10: return 2;
    }
}

export function ConvertSizeCarFromJsonToNumber(carSize: number): number {
    switch (carSize) {
        case 0: return 4;
        case 1: return 6;
        case 2: return 10;
    }
}

export function GetNameCarSize(carSize: TYPE_CAR_SIZE): string {
    switch (carSize) {
        case TYPE_CAR_SIZE["4_CHO"]: return "4_CHO";
        case TYPE_CAR_SIZE["6_CHO"]: return "6_CHO";
        case TYPE_CAR_SIZE["10_CHO"]: return "10_CHO";
    }
    return null;
}
// #endregion map

// #region parking + Car
export enum STATE_PARKING_CAR {
    EMPTY,
    LOCK_NORMAL,
    LOCK_VIP,
    USING_VIP,
    USING
}

export enum STATE_CAR {
    READY_TO_MOVE,
    MOVING,
    READY_TO_PICK_UP_PASSENGER,
    READY_TO_DEPART,
    MOVE_TO_THE_GATE_DONE,
    MOVE_TO_THE_GATE
}

export interface ITypeCar {
    isCarMystery: boolean,
    isCarTwoWay: boolean,
    isCarKey: boolean,
    isCarLock: boolean,
    colorKeyLock: COLOR_KEY_LOCK,
    isCarFiretruck: boolean,
    isCarAmbulance: boolean,
    isCarMilitary: boolean,
}

export enum STATE_CAR_MOVING {
    NONE,
    MOVING_TO_THE_PARK,
    MOVING_TO_THE_BLOCK,
    MOVING_TO_THE_GATE
}

export enum ROAD {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT
}

export interface IInfoWPosMoveCar {
    wPos: Vec3;
    directionMoveToPos: DIRECT_CAR;
}

export enum DIRECT_CAR {
    TOP,
    TOP_LEFT,
    LEFT,
    BOTTOM_LEFT,
    BOTTOM,
    BOTTOM_RIGHT,
    RIGHT,
    TOP_RIGHT
}
Enum(DIRECT_CAR);

export enum STATE_PLACE_STANDING_WAIT {
    EMPTY,
    LOCK
}

export enum M_COLOR {
    BLACK = "Black",
    BLUE = "Blue",
    GREEN = "Green",
    GRAY = "Gray",
    CYAN = "Cyan",
    ORANGE = "Orange",
    PINK = "Pink",
    PURPLE = "Purple",
    RED = "Red",
    YELLOW = "Yellow",
    POLICE = "Police",
    MILITARY = "Military",
    AMBULANCE = "Ambulance",
    FIRE_TRUCK = "FireTruck",
    REINDEER_CART = "ReindeerCart"
}

export function GetAngleSuitWithDirectionCar(directionCar: DIRECT_CAR): number {
    switch (directionCar) {
        case DIRECT_CAR.TOP: return 0;
        case DIRECT_CAR.TOP_LEFT: return 45;
        case DIRECT_CAR.LEFT: return 90;
        case DIRECT_CAR.BOTTOM_LEFT: return 135;
        case DIRECT_CAR.BOTTOM: return 180;
        case DIRECT_CAR.BOTTOM_RIGHT: return 225;
        case DIRECT_CAR.RIGHT: return 270;
        case DIRECT_CAR.TOP_RIGHT: return 315;
    }
}

export function GetNameDirectionCar(direction: DIRECT_CAR, isReverse: boolean = true): string {
    switch (direction) {
        case DIRECT_CAR.TOP: return "Top";
        case DIRECT_CAR.TOP_LEFT: return "TopLeft";
        case DIRECT_CAR.LEFT: return "Left";
        case DIRECT_CAR.BOTTOM_LEFT: return "BottomLeft";
        case DIRECT_CAR.BOTTOM: return "Down";
        case DIRECT_CAR.BOTTOM_RIGHT: return isReverse ? "BottomLeft" : "BottomRight";
        case DIRECT_CAR.RIGHT: return isReverse ? "Left" : "Right";
        case DIRECT_CAR.TOP_RIGHT: return isReverse ? "TopLeft" : "TopRight";
    }
    return null;
}

export function SwitchDirectionCar(direction: DIRECT_CAR): DIRECT_CAR {
    switch (direction) {
        case DIRECT_CAR.TOP: return DIRECT_CAR.BOTTOM;
        case DIRECT_CAR.BOTTOM: return DIRECT_CAR.TOP;
        case DIRECT_CAR.LEFT: return DIRECT_CAR.RIGHT;
        case DIRECT_CAR.RIGHT: return DIRECT_CAR.LEFT;
        case DIRECT_CAR.TOP_LEFT: return DIRECT_CAR.BOTTOM_RIGHT;
        case DIRECT_CAR.BOTTOM_RIGHT: return DIRECT_CAR.TOP_LEFT;
        case DIRECT_CAR.BOTTOM_LEFT: return DIRECT_CAR.TOP_RIGHT;
        case DIRECT_CAR.TOP_RIGHT: return DIRECT_CAR.BOTTOM_LEFT;
    }
    return null;
}

export function GetMColorByNumber(number: number): M_COLOR {
    switch (number) {
        case 1: return M_COLOR.BLACK;
        case 2: return M_COLOR.BLUE;
        case 3: return M_COLOR.GREEN;
        case 4: return M_COLOR.GRAY;
        case 5: return M_COLOR.CYAN;
        case 6: return M_COLOR.ORANGE;
        case 7: return M_COLOR.PINK;
        case 8: return M_COLOR.PURPLE;
        case 9: return M_COLOR.RED;
        case 10: return M_COLOR.YELLOW;
        case 11: return M_COLOR.POLICE;
        case 12: return M_COLOR.MILITARY;
        case 13: return M_COLOR.AMBULANCE;
        case 14: return M_COLOR.FIRE_TRUCK;
        case 15: return M_COLOR.REINDEER_CART;
    }
    return null;
}

export function GetColorForSpriteFromMColor(mColor: M_COLOR): Color {
    switch (mColor) {
        case M_COLOR.BLACK: return Color.BLACK;
        case M_COLOR.BLUE: return Color.BLUE;
        case M_COLOR.GREEN: return Color.GREEN;
        case M_COLOR.GRAY: return Color.GRAY;
        case M_COLOR.CYAN: return new Color(0, 122, 255);
        case M_COLOR.ORANGE: return new Color(255, 165, 0);
        case M_COLOR.PINK: return new Color(255, 192, 203);
        case M_COLOR.PURPLE: return new Color(128, 0, 128);
        case M_COLOR.RED: return Color.RED;
        case M_COLOR.YELLOW: return Color.YELLOW;
    }

    return Color.BLACK;
}

export function GetNumberByMColor(mColor: M_COLOR): number {
    switch (mColor) {
        case M_COLOR.BLACK: return 1;
        case M_COLOR.BLUE: return 2;
        case M_COLOR.GREEN: return 3;
        case M_COLOR.GRAY: return 4;
        case M_COLOR.CYAN: return 5;
        case M_COLOR.ORANGE: return 6;
        case M_COLOR.PINK: return 7;
        case M_COLOR.PURPLE: return 8;
        case M_COLOR.RED: return 9;
        case M_COLOR.YELLOW: return 10;
        case M_COLOR.POLICE: return 11;
        case M_COLOR.MILITARY: return 12;
        case M_COLOR.AMBULANCE: return 13;
        case M_COLOR.FIRE_TRUCK: return 14;
        case M_COLOR.REINDEER_CART: return 15;
    }
    return 0;
}

export function IsColorCanShuffle(mColor: M_COLOR): boolean {
    switch (mColor) {
        case M_COLOR.AMBULANCE: case M_COLOR.FIRE_TRUCK: case M_COLOR.REINDEER_CART:
            return false;
        default:
            return true;
    }
}

export enum TYPE_PASSENGER_POSE {
    IDLE = 1,
    RUN_DOWN_1 = 2,
    RUN_DOWN_2 = 3,
    IDLE_TURN = 4,
    RUN_TURN_1 = 5,
    RUN_TURN_2 = 6,
    SITTING = 7,
    SITTING_2 = 8,
}

export enum STATE_VISUAL_PASSENGER {
    IDLE_DOWN = 0,
    IDLE_TURN_LEFT = 1,
    IDLE_TURN_RIGHT = 2,
    MOVE_DOWN = 3,
    MOVE_LEFT = 4,
    MOVE_RIGHT = 5,
    MOVE_UP = 6,
}
Enum(STATE_VISUAL_PASSENGER);

export enum GROUP_COLLIDER {
    DEFAULT = 1 << 0,
    ROAD = 1 << 1,
    BOX_TRIGGER_ROAD = 1 << 2,
    CAR = 1 << 3,
};

export enum TAG_COLLIDER {
    DEFAULT,
    CONVEYOR_BELT,
    GARAGE,
}

export interface ConfigPosPassJsonCar {
    SizeCar: TYPE_CAR_SIZE;
    ListPosPassenger: Vec3[];
    ListPosPassengerLeft: Vec3[];
    IsReindeerCart?: boolean;
}

export enum NAME_SUP_VI_CAR {
    POLICE = "SupCarPolice",
    MILITARY = "SupCarMilitary",
    AMBULANCE = "SupCarAmbulance",
    FIRE_TRUCK = "SupCarFireTruck",
    LOCK_CAR = "SupCarLock",
    TWO_WAY_CAR = "SupCarTwoWay"
}
// #endregion parking + Car

//#region emotions
export enum TYPE_EMOTIONS {
    ANGRY = "emoji_01",
    MAD = "emoji_02",
    LOVE = "emoji_03",
    KISS = "emoji_04",
    SAD = "emoji_05",
    DISAPPOINTED = "emoji_06",
    CRY = "emoji_07",
    CONFUSED = "emoji_08",
    THINKING = "emoji_09",
    BIG_SMILE = "emoji_10",
    SUNGLASSES = "emoji_11",
    SHOCKED = "emoji_12",
}

export enum TYPE_EMOTIONS_ANIM {
    CRY = "emoji1",
    ANGRY = "emoji2",
    MAD = "emoji3",
    SUPER_ANGRY = "enoji4",
    HEART = "emoji5",
    KISS = "emoji6",
    SAD = "emoji7",
    TIRED = "emoji8",
    STUPID = "emoji9",
    BIG_SMILE = "emoji10",
    SUNGLASSES = "emoji11",
    BIG_EYE = "emoji12"
}
//#endregion emotions

//#region Tournament
export interface IJsonPrizeLeaderboard {
    prize1: string;
    prize2: string;
    prize3: string;
}
export function instanceOfIJsonPrizeLeaderboard(object: any): object is IJsonPrizeLeaderboard {
    return 'prize3' in object;
}

export enum TYPE_GAME_PLAY_TOURNAMENT {
    BASIC
}

export class JSON_GAME_MANAGER_TOUR {
    id_leaderboard: string = "";
    name_leaderboard: string = "";
    tournament_id: string = "";
    context_tournament: string = "";
    levels: number[] = [];
    rewards: IPrize[][] = [];
    type: TYPE_GAME_PLAY_TOURNAMENT = TYPE_GAME_PLAY_TOURNAMENT.BASIC;
}
//#endregion Tournament

//===========================
//#region DashRush
export class InfoBot_DashRush {
    public id: string = '';
    public name: string = "";
    public avatar: string = '';
    public progress: number = 0;

    public SetData(id: string, name: string, avatar: string, progress: number) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.progress = progress;
    }

    public EncodeData(): string {
        return `${this.id}_${this.name}_${this.avatar}_${this.progress}`;
    }

    public EncodeDataPlayer(): string {
        return `___${this.progress}`;
    }

    public DecodeData(data: string) {
        if (data == '' || data == null) { return; }

        const infoDecode = data.split('_');
        if (infoDecode == null) { return; }
        this.id = infoDecode[0];
        this.name = infoDecode[1];
        this.avatar = infoDecode[2];
        this.progress = Number.parseInt(infoDecode[3]);
    }
}

export function DecodeInfoBot_DashRush(dataJson: string): InfoBot_DashRush[] {
    if (dataJson == null) { return []; }

    // split data
    let listBot = dataJson.split('*');
    if (listBot.length == 0) { return [] }

    // add player
    let infoPlayer = new InfoBot_DashRush();
    listBot.push()

    let result: InfoBot_DashRush[] = [];
    listBot.forEach(dataBot => {
        let newBot = new InfoBot_DashRush();
        newBot.DecodeData(dataBot);
        result.push(newBot);
    })

    return result;
}

export function EncodeInfoBot_DashRush(data: InfoBot_DashRush[]): string {
    if (data == null || data.length == 0 || data.find(item => item.id == null || item.id == '')) { return ''; }

    let result: string = '';

    data.forEach((player, index) => {
        let jsonPlayer = ""
        if (index == 0) {
            jsonPlayer = `${player.EncodeDataPlayer()}*`
        }
        else if (index != data.length - 1) {
            jsonPlayer = `${player.EncodeData()}*`;
        } else {
            jsonPlayer = `${player.EncodeData()}`;
        }
        result += jsonPlayer;
    })

    return result;
}
//#endregion DashRush
//===========================

//===========================
//#region SpeedRace
export type SR_TypeBot = 'A' | 'B' | 'C';
export class InfoBot_SpeedRace {
    public id: string = '';
    public name: string = "";
    public avatar: string = '';
    public progress: number = 0;
    public rank: number = 0;
    public type: SR_TypeBot = 'A';

    public SetData(id: string, name: string, avatar: string, type: SR_TypeBot, rank: number, progress: number) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.type = type;
        this.rank = rank;
        this.progress = progress;
    }

    public EncodeData(): string {
        return `${this.id}_${this.name}_${this.avatar}_${this.type}_${this.rank}_${this.progress}`;
    }

    public EncodeDataPlayer(): string {
        return `_____${this.progress}`;
    }

    public DecodeData(data: string) {
        if (data == '' || data == null) { return; }

        const infoDecode = data.split('_');
        if (infoDecode == null) { return; }
        this.id = infoDecode[0];
        this.name = infoDecode[1];
        this.avatar = infoDecode[2];
        this.type = infoDecode[3] as SR_TypeBot;
        this.rank = Number.parseInt(infoDecode[4]);
        this.progress = Number.parseInt(infoDecode[5]);
    }
}

export function DecodeInfoBot_SpeedRace(dataJson: string): InfoBot_SpeedRace[] {
    if (dataJson == null) { return []; }

    // split data
    let listBot = dataJson.split('*');
    if (listBot.length == 0) { return [] }

    let result: InfoBot_SpeedRace[] = [];
    listBot.forEach(dataBot => {
        let newBot = new InfoBot_SpeedRace();
        newBot.DecodeData(dataBot);
        result.push(newBot);
    })

    return result;
}

export function EncodeInfoBot_SpeedRace(data: InfoBot_SpeedRace[], idPlayer: string[]): string {
    if (data == null || data.length == 0 || data.find(item => item.id == null || item.id == '')) { return ''; }

    let result: string = '';

    let dataSave = Utils.CloneListDeep(data); // sort data
    // sort data
    dataSave.sort((a, b) => b.progress - a.progress);

    for (let index = 0; index < dataSave.length; index++) {
        let jsonPlayer = ""
        const player = dataSave[index];
        if (!idPlayer.includes(player.id)) {
            jsonPlayer = `${player.EncodeData()}*`;
        }

        result += jsonPlayer;
    }

    // Remove trailing '*' if present
    if (result.endsWith('*')) {
        result = result.slice(0, -1);
    }

    return result;
}

export interface InfoItemProgressSR {
    index: number,
    progress: number
    prizes: IPrize[],
}
//#endregion SpeedRace
//===========================

//===========================
//#region TreasureTrail
export class InfoBot_TreasureTrail {
    public id: string = '';   // id 0 luôn là player
    public avatar: string = '';

    public SetData(id: string, avatar: string) {
        this.id = id;
        this.avatar = avatar;
    }

    public EncodeData(): string {
        return `${this.id}_${this.avatar}`;
    }

    public DecodeData(dataInput: string) {
        try {
            if (dataInput == '' || dataInput == null) { return; }

            const infoDecode = dataInput.split('_');
            if (infoDecode == null) { return; }
            this.id = infoDecode[0];
            this.avatar = infoDecode[1];
        } catch (e) {
            console.error(e);
        }
    }
}

export function DecodeInfoBot_TreasureTrail(dataJson: string): InfoBot_TreasureTrail[] {
    if (dataJson == null) { return []; }

    // split data
    let listBot = dataJson.split('*');
    if (listBot.length == 0) { return [] }

    let result: InfoBot_TreasureTrail[] = [];
    listBot.forEach(dataBot => {
        let newBot = new InfoBot_TreasureTrail();
        newBot.DecodeData(dataBot);
        result.push(newBot);
    })

    return result;
}

export function EncodeInfoBot_TreasureTrail(data: InfoBot_TreasureTrail[]): string {
    if (data == null || data.length == 0) { return ''; }

    let result: string = '';

    let dataSave = Utils.CloneListDeep(data); // copy data

    for (let index = 0; index < dataSave.length; index++) {
        let jsonPlayer = ""
        const player = dataSave[index];
        jsonPlayer = `${player.EncodeData()}*`;
        result += jsonPlayer;
    }

    // Remove trailing '*' if present
    if (result.endsWith('*')) {
        result = result.slice(0, -1);
    }

    return result;
}
//#endregion TreasureTrail
//===========================

export enum PAGE_VIEW_LOBBY_NAME {
    SHOP,
    CUSTOM,
    HOME,
    RANK,
    TOURNAMENT
}
Enum(PAGE_VIEW_LOBBY_NAME);

//#region BoosterItem
export enum STATE_BOOSTER_LOCK {
    LOCK,
    TUTORIAL,
    UNLOCK_TUTORIAL,
    UNLOCK_NO_CHOICE,
    UNLOCK_CHOICE,
    UNLOCK_INFINITY,
    UNLOCK_NO_MORE_ITEM
}
// #endregion BoosterItem

//#region Lobby Map | BUILDING
export interface IMapLobbyJson {
    title: string;
    colorUp: string;
    colorDown: string;
    listConstructors: IObjConstructor[],
    listSubsMap: IObjSubsMap[],
    listPrize: IPrize[],
    posMap?: Vec3,
}

export interface ISupSke {
    pos: Vec3;
    scale?: Vec3;
    parent?: "top" | "bottom";
}

export type IObjConstructor = {
    index: number;
    title: string;
    pos: Vec3;
    posShadow: Vec3,
    scalePrepareBuild?: Vec3;
    scaleVisual?: Vec3;
    timeWaitBetweenTopAndBottom: number;
    maxBrickToUnlock: number;
    listSubConstructors: ISupObjConstructor[];
    posDefaultForBox: Vec3;
    canPlayAnimIdle?: boolean;
    canPlayAnimOpen?: boolean;
    siblingIndex: number;
    typePrepareBuild: 0 | 1 | 2;
    posPrepareBuild: Vec3;
    listSupSke: ISupSke[];
    scaleWhenZoom?: number;
    distanceWhenZoom?: Vec3;
    /*
    * param này sẽ không có trong json mà được ghi chú theo kiểu khác do đó xin hãy đọc lại json 
    * và gán lại giá trị này sao cho phù hợp với nội dung cần thiết
    */
    listPrize: IPrize[];
}

export type ISupObjConstructor = {
    index: number;
    pos: Vec3;
    scale: Vec3;
    namePrefab: string;
    locateParent?: 'top' | 'bottom';
    isShowFromStart?: boolean;
}

export type IObjSubsMap = {
    name: string;
    scale: Vec3;
    pos: Vec3;
    dataCustom?: any;
}

export type Building_cb_afterUnlockNewConstructor = (isUnlockFullMap: boolean, newConstructor?: Node, newNumBLockRemaining?: number) => void;
//#endregion Lobby Map

//#region UIQuit
export interface IShowTTInGame {
    cbClose: CallableFunction
}
export function instanceOfIShowTTInGame(object: any): object is IShowTTInGame {
    return object != null && 'cbClose' in object;
}
//#endregion UIQuit
export interface IParamLogEventInGame {
    idEvent: TYPE_EVENT_GAME,
    num_play_event: number,
    progress_event: number
}

export interface IParamLogLoseEventInGameIAP {
    streakSL: number,
    streakTT: number,
    typeEventGoingOn: TYPE_EVENT_GAME,
    numLoopEventGoingOn: number,
}

//#region INFO PLAYER FB
// export interface FBConnectedPlayer {
//     /**
//      * Get the id of the connected player.
//      *
//      * @returns The ID of the connected player
//      */
//     getID(): string;

//     /**
//      * Get the player's full name.
//      *
//      * @returns The player's full name
//      */
//     getName(): string | null;

//     /**
//      * Get the player's public profile photo.
//      *
//      * @returns A url to the player's public profile photo
//      */
//     getPhoto(): string | null;
// }

export class FriendDataInfo {
    id: string;
    name: string;
    photo: string;
}

export interface ITournament {
    // getID(): string | null;

    // joinAsync(tournamentID: string): Promise<void>;

    // postScoreAsync(score: number): Promise<void>;

    /**
     * The unique ID that is associated with this instant tournament.
     *
     * @returns A unique identifier for the instant tournament.
     */
    getID(): string;

    /**
     * The unique context ID that is associated with this instant tournament.
     *
     * @returns A unique identifier for the game context.
     */
    getContextID(): string;

    /**
     * Timestamp when the instant tournament ends. If the end time is in the past, then the instant tournament is already finished and has expired.
     *
     * @returns A unix timestamp of when the tournament will end.
     * @example
     * FBInstant.getTournamentAsync()
     *   .then((tournament) => {
     *     console.log(tournament.getEndTime());
     *   });
     */
    getEndTime(): number;

    /**
     * Title of the tournament provided upon the creation of the tournament.
     *
     * This is an optional field that can be set by creating the tournament using the FBInstant.tournament.createAsync() API.
     * @example
     * FBInstant.getTournamentAsync()
     *   .then((tournament) => {
     *     console.log(tournament.getTitle());
     *   });
     */
    getTitle(): string | undefined;

    /**
     * Payload of the tournament provided upon the creation of the tournament.
     *
     * This is an optional field that can be set by creating the tournament using the FBInstant.tournament.createAsync() API.
     */
    getPayload(): any;

    /**
    * Opens the tournament creation dialog if the player is not currently in a tournament session
    *
    * @param payload CreateTournamentPayload
    * @returns Promise<Tournament>
    * @throws INVALID_PARAM
    * @throws INVALID_OPERATION
    * @throws DUPLICATE_POST
    * @throws NETWORK_FAILURE
    */
    createAsync(payload: ICreateTournamentPayload): Promise<ITournament>;

    /**
     * Posts a player's score to Facebook.
     *
     * This API should only be called within a tournament context at the end of an activity (example: when the player doesn't have "lives" to continue the game).
     * This API will be rate-limited when called too frequently. Scores posted using this API should be consistent and comparable across game sessions.
     * For example, if Player A achieves 200 points in a session, and Player B achieves 320 points in a session, those two scores should be generated
     * from activities where the scores are fair to be compared and ranked against each other.
     *
     * @param score An integer value representing the player's score at the end of an activity.
     * @returns A promise that resolves when the score post is completed.
     * @throws INVALID_PARAM
     * @throws TOURNAMENT_NOT_FOUND
     * @throws NETWORK_FAILURE
     */
    postScoreAsync(score: number): Promise<void>;

    /**
     * Opens the reshare tournament dialog if the player is currently in a tournament session
     *
     * Posts a player’s score to Facebook, and renders a tournament share dialog if the player is currently in a tournament session.
     * The promise will resolve when the user action is completed.
     *
     * @param payload Specifies share content. See example for details.
     * @returns A promise that resolves if the tournament is shared, or rejects otherwise.
     * @throws INVALID_OPERATION
     * @throws TOURNAMENT_NOT_FOUND
     * @throws NETWORK_FAILURE
     * @throws USER_INPUT
     */
    shareAsync(payload: IShareTournamentPayload): Promise<void>;

    /**
     * Returns a list of eligible tournaments that can be surfaced in-game, including tournaments:
     *  1) the player has created;
     *  2) the player is participating in;
     *  3) the player's friends (who granted permission) are participating in.
     *
     * The instant tournaments returned are active. An instant tournament is expired if its end time is in the past.
     * For each instant tournament, there is only one unique context ID linked to it, and that ID doesn't change.
     *
     * @returns Promise<Tournament[]>
     * @throws NETWORK_FAILURE
     * @throws INVALID_OPERATION
     */
    getTournamentsAsync(): Promise<ITournament[]>;

    /**
     * Requests a switch into a specific tournament context. The promise will resolve when the game has switched into the specified context.
     *
     * @param tournamentID The Tournament ID of the desired context to switch into.
     * @returns A promise that resolves when the game has switched into the specified tournament context, or rejects otherwise.
     * @throws INVALID_OPERATION
     * @throws INVALID_PARAM
     * @throws SAME_CONTEXT
     * @throws NETWORK_FAILURE
     * @throws USER_INPUT
     * @throws TOURNAMENT_NOT_FOUND
     */
    joinAsync(tournamentID: string): Promise<void>;
}

/**
     * Represents settings used for FBInstant.tournament.createAsync
     */
interface ICreateTournamentPayload {
    /**
     * An integer value representing the player's score which will be the first score in the tournament.
     */
    initialScore: number;

    /**
     * An object holding optional configurations for the tournament.
     */
    config: ICreateTournamentConfig;

    /**
     * A blob of data to attach to the update.
     *
     * All game sessions launched from the update will be able to access this blob from the payload on the tournament.
     * Must be less than or equal to 1000 characters when stringified.
     */
    data?: any;
}

/**
 * Represents content used to reshare an Instant Tournament.
 */
interface IShareTournamentPayload {
    /**
     * An integer value representing the player's latest score.
     */
    score: number;
    /**
     * A blob of data to attach to the update. Must be less than or equal to 1000 characters when stringified.
     */
    data?: any;
}

/**
     * Represents the configurations used in creating an Instant Tournament.
     */
interface ICreateTournamentConfig {
    /**
     * Optional text title for the tournament.
     */
    title?: string;

    /**
     * Optional base64 encoded image that will be associated with the tournament and included in posts sharing the tournament.
     */
    image?: string;

    /**
     * Optional input for the ordering of which score is best in the tournament.
     * The options are 'HIGHER_IS_BETTER' or 'LOWER_IS_BETTER'. If not specified, the default is 'HIGHER_IS_BETTER'.
     */
    sortOrder?: m_TournamentSortOrder;

    /**
     * Optional input for the formatting of the scores in the tournament leaderboard.
     * The options are 'NUMERIC' or 'TIME'. If not specified, the default is 'NUMERIC'.
     */
    scoreFormat?: m_TournamentScoreFormat;

    /**
     * Optional input for setting a custom end time for the tournament.
     * The number passed in represents a unix timestamp. If not specified, the tournament will end one week after creation.
     */
    endTime?: number;
}
type m_TournamentSortOrder = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
type m_TournamentScoreFormat = "NUMERIC" | "TIME";
//#endregion
