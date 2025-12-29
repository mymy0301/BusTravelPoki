import { _decorator, Component, Node } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { LogEventManager } from '../LogEvent/LogEventManager';
import { WithFriendDataInfo } from '../WithFriend/WithFriendDataInfo';
import { CHEAT_CODE, CheatingSys } from './CheatingSys';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { DataLogEventSys } from '../LogEvent/DataLogEventSys';
import { DataDashRush } from './DataDashRush';
import { DataSpeedRace } from '../DataBase/DataSpeedRace';
import { DataEventsSys } from './DataEventsSys';
import { TYPE_EVENT_GAME } from '../Utils/Types';
import { DataSkyLiftSys } from '../DataBase/DataSkyLiftSys';
import { DataTreasureTrailSys } from '../DataBase/DataTreasureTrailSys';
import { ReadDataJson } from '../ReadDataJson';
import { DataPiggySys } from '../DataBase/DataPiggySys';
import { DataShopSys } from './DataShopSys';
import { CONFIG_SP } from './OtherUI/UISeasonPass/TypeSeasonPass';
import { CONFIG_LP } from './OtherUI/UILevelPass/TypeLevelPass';
import { DataHatRace_christ } from '../DataBase/DataHatRace_christ';
const { ccclass, property } = _decorator;

@ccclass('DataInfoPlayer')
export class DataInfoPlayer {
    public static Instance: DataInfoPlayer = null;

    constructor() {
        if (DataInfoPlayer.Instance == null) {
            window.addEventListener(CHEAT_CODE.CHEAT_RESET_DATA, this.ResetData);
            DataInfoPlayer.Instance = this;
        }
    }

    public GetNumWin(): number {
        return PlayerData.Instance._levelPlayer;
    }

    public GetNumFirstTryWin(): number {
        return PlayerData.Instance._numWinFirstTry;
    }

    public GetNumLose(): number {
        return PlayerData.Instance._numLose;
    }

    public GetNumTotal(): number {
        return PlayerData.Instance._levelPlayer + PlayerData.Instance._numLose;
    }

    public GetRaceWon(): number {
        return PlayerData.Instance._raceWon;
    }

    public GetCityCompleted(): number {
        return PlayerData.Instance._building_indexMap - 1;
    }

    public GetLeaguesWon(): number {
        return PlayerData.Instance._leaguesWon;
    }

    public GetNewSkin(): number {
        // NOTE hàm này sẽ trả về thuộc tính skin của người chơi được để trong customs
        return 0;
    }

    public GetWinRate(): number {
        const total: number = PlayerData.Instance._levelPlayer + PlayerData.Instance._numLose;
        let result = parseFloat((PlayerData.Instance._levelPlayer / total * 100).toFixed(2));
        return result;
    }

    public GetStreakLose() {
        return PlayerData.Instance._streakLose;
    }

    public GetStreakWin() {
        return PlayerData.Instance._bestWinStreak;
    }

    public WinAGame(needSaveGame: boolean = true) {
        let isFirstTryWin: boolean = PlayerData.Instance._isWinFirstTry;
        if (isFirstTryWin) {
            PlayerData.Instance._numWinFirstTry += 1;
        }
        // reset data
        PlayerData.Instance._isWinFirstTry = true;
        PlayerData.Instance._streakLose = 0;
        PlayerData.Instance._streakWin += 1;
        if (PlayerData.Instance._streakWin > PlayerData.Instance._bestWinStreak) {
            PlayerData.Instance._bestWinStreak = PlayerData.Instance._streakWin;
        }

        // log event 
        DataLogEventSys.Instance.WinLevel();

        // save data
        if (needSaveGame) {
            PlayerData.Instance.SaveInfoPlayer();
        }
    }

    public LoseAGame(needSaveData: boolean = true) {
        PlayerData.Instance._isWinFirstTry = false;
        PlayerData.Instance._numLose += 1;
        PlayerData.Instance._streakLose += 1;
        PlayerData.Instance._streakWin = 0;

        // dash Rush
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.DASH_RUSH)) {
            DataDashRush.Instance.UpdateData(false, false);
        }

        // speedRace
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SPEED_RACE)) {
            DataSpeedRace.Instance.UpdateData(false, false);
        }

        // sky lift
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SKY_LIFT)) {
            DataSkyLiftSys.Instance.LoseGame(false);
        }

        // treasure trail
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
            DataTreasureTrailSys.Instance.LoseGame(false);
        }

        if (needSaveData) {
            PlayerData.Instance.SaveInfoPlayer();
        }
    }

    public LoseGameChrist(needSaveData: boolean = true) {
        DataHatRace_christ.Instance.LoseStreakPlayer(false);

        if (needSaveData) {
            PlayerData.Instance.SaveInfoPlayer();
        }
    }

    public IsReceivePrizeJoinGroup(): boolean {
        return PlayerData.Instance._infoPlayer_isReceivePrizeJoinGroup;
    }

    public ReceivePrizeJoinGroup_success(needSaveData: boolean = true) {
        PlayerData.Instance._infoPlayer_isReceivePrizeJoinGroup = true;
        if (needSaveData) {
            PlayerData.Instance.SaveInfoPlayer();
        }
    }

    public IsReceivePrizeFollowPage(): boolean {
        return PlayerData.Instance._infoPlayer_isReceivePrizeFollowPage;
    }

    public ReceivePrizeFollowPage_success(needSaveData: boolean = true) {
        PlayerData.Instance._infoPlayer_isReceivePrizeFollowPage = true;
        if (needSaveData) {
            PlayerData.Instance.SaveInfoPlayer();
        }
    }

    public IncreaseLeagueWin(needSaveData: boolean = true) {
        PlayerData.Instance._leaguesWon += 1;
        if (needSaveData) {
            PlayerData.Instance.SaveInfoPlayer();
        }
    }

    public WasBoughIAP(): boolean {
        return PlayerData.Instance._mapIAPWasBought.size > 0;
    }

    public TotalSpendingMoneyOfUser(): number {
        let result = 0;
        const readDataIns = ReadDataJson.Instance;
        // lấy dữ liệu từ id map trong info player => để tìm dữ liệu trong pack root => và cập nhật lại
        for (const item of PlayerData.Instance._mapIAPWasBought) {
            const idKey = item[0];
            const numBought = item[1];

            // check pack
            const packRoot = readDataIns.GetDataPacksFromRoot().find(pack => pack.namePack == idKey);
            if (packRoot != null) {
                result += Number.parseFloat(packRoot.price) * numBought;
                continue;
            }

            // check coin
            const packCoinRoot = readDataIns.GetDataShop_Coins().find(pack => pack.idBundle == idKey);
            if (packCoinRoot != null) {
                result += Number.parseFloat(packCoinRoot.price) * numBought;
                continue;
            }

            // check ticket
            const packTicketRoot = readDataIns.GetDataShop_Ticket().find(pack => pack.idBundle == idKey);
            if (packTicketRoot != null) {
                result += Number.parseFloat(packTicketRoot.price) * numBought;
                continue;
            }

            // check hlw
            const packHlwRoot = readDataIns.GetDataPacksHalloween().find(pack => pack.namePack == idKey);
            if (packHlwRoot != null) {
                result += Number.parseFloat(packHlwRoot.price) * numBought;
                continue;
            }

            // check black friday
            const packBlackFriday = readDataIns.GetDataPacksBlackFriday().find(pack => pack.namePack == idKey);
            if (packBlackFriday != null && idKey != "blackfriday_ads") {
                result += Number.parseFloat(packBlackFriday.price) * numBought;
                continue;
            }

            // check endlessTreasure
            const packET = readDataIns.GetDataEndlessTreasure().find(pack => pack.idBundle == idKey);
            if (packET != null) {
                result += packET.price * numBought;
                continue;
            }

            // check piggyBank
            const pricePiggy = DataPiggySys.Instance.GetPricePiggyPackById(idKey);
            if (pricePiggy > 0) {
                result += pricePiggy * numBought;
                continue;
            }

            // check lp và sp
            if (idKey == DataShopSys.Instance.getIdBundle('LevelPass')) {
                result += CONFIG_LP.PRICE_ACTIVE_PRENIUM * numBought;
            } else if (idKey == DataShopSys.Instance.getIdBundle('SeasonPass')) {
                result += CONFIG_SP.PRICE_ACTIVE_PRENIUM * numBought
            }
        }
        return result;
    }

    public WasBoughtPack(idPack: string): boolean { return PlayerData.Instance._mapIAPWasBought.get(idPack) != null; }

    public CachePackBought(idPack: string, numPackBought: number = 1) {
        let numWasBought: number = PlayerData.Instance._mapIAPWasBought.get(idPack);
        if (numWasBought == null || numWasBought < 0) {
            numWasBought = 0;
        }

        PlayerData.Instance._mapIAPWasBought.set(idPack, numWasBought + numPackBought);
    }

    //#region WITH FRIEND
    currWithFriendDataInfo: WithFriendDataInfo = null;
    //#endregion

    //#region CHEAT
    private ResetData(event: CustomEvent) {
        if (!CheatingSys.Instance.canCheatCode) return;
        PlayerData.Instance.ResetData();
        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Reset data successfully!\nPlease restart the game.");
    }
    //#endregion CHEAT
}


