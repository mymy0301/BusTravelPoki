import { _decorator, Component, Node } from 'cc';
import { Utils } from '../Utils/Utils';
import { PlayerData } from '../Utils/PlayerData';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { ReadDataJson } from '../ReadDataJson';
import { FBInstantManager } from '../Utils/facebooks/FbInstanceManager';
import { MConfigs } from '../Configs/MConfigs';
import { CurrencySys } from './CurrencySys';
import { DataDailyQuestSys } from '../DataBase/DataDailyQuestSys';
const { ccclass, property } = _decorator;

@ccclass('DataShopSys')
export class DataShopSys {
    public static Instance: DataShopSys = null;

    constructor() {
        if (DataShopSys.Instance == null) {
            DataShopSys.Instance = this;
            clientEvent.on(MConst.IAP_INIT_SUCCESS, this.CheckIAP, this);
        }
    }

    public getIdBundle(type: 'SeasonPass' | 'LevelPass'): string {
        //remember check in JsonStore 
        switch (type) {
            case 'SeasonPass':
                return "season_pass";
            case 'LevelPass':
                return "level_pass";
        }
    }

    public CheckCanResetCoinFree() {
        const isNextDay = Utils.compareDateIsNextDayLocal(PlayerData.Instance._timeSaveCoinAdsToday);
        if (isNextDay) {
            PlayerData.Instance._timeSaveCoinAdsToday = Utils.getTimeToDayLocal();
            PlayerData.Instance._numShopFreeCoinAdsToday = 0;
            PlayerData.Instance._timeShopFreeAdsLastTime = 0;
            PlayerData.Instance._isReceiveFreeCoinToday = false;
            PlayerData.Instance.Save();
        }
    }


    public GetShopFreeLastTime(): number {
        return PlayerData.Instance._timeShopFreeAdsLastTime;
    }

    public GetNumShopFreeToPlay(): number {
        return PlayerData.Instance._numShopFreeCoinAdsToday;
    }

    public DeceareseNumShopFreeToPlay(needSaveData: boolean = true) {
        PlayerData.Instance._timeShopFreeAdsLastTime = Utils.getSecondNow();
        PlayerData.Instance._numShopFreeCoinAdsToday += 1;
        PlayerData.Instance.SaveInfoPlayer(needSaveData);
    }

    private CheckIAP() {
        let dataPackTicket = ReadDataJson.Instance.GetDataShop_Ticket();
        // init item ticket normal
        dataPackTicket.forEach(item => {
            if (FBInstantManager.Instance.checkHaveIAPPack_byProductID(item.idBundle)) {
                MConfigs.numIAPTicketHave += 1;
            }
        })
    }

    public IsReceiveCoinFreeToday(): boolean {
        return PlayerData.Instance._isReceiveFreeCoinToday;
    }

    public SetReceiveCoinFreeToday(needSaveData: boolean = true) {
        PlayerData.Instance._isReceiveFreeCoinToday = true;
        PlayerData.Instance.SaveInfoPlayer(needSaveData);
    }

    public CanShowNotiCoin(): boolean {
        try {
            const isReceiveCoinFreeToday = DataShopSys.Instance.IsReceiveCoinFreeToday();
            const hasTicket = CurrencySys.Instance.GetTicket() > 0;
            const inTimeRedeuceCoinAds = Utils.getSecondNow() >= DataShopSys.Instance.GetShopFreeLastTime() + MConfigs.TIME_COOLDOWN_COIN_ADS;
            return !isReceiveCoinFreeToday || hasTicket || inTimeRedeuceCoinAds;
        } catch (e) {
            console.error("wrong to check notiCoin");
            return false;
        }
    }

    public CanShowNotiQuest(): boolean {
        try {
            return DataDailyQuestSys.Instance.HasAnyQuestCanClaim();
        } catch (e) {
            console.error("wrong to check noti quest");
            return false;
        }
    }
}


