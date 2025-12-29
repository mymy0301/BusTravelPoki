import { _decorator, Component, input, Node } from 'cc';
import { MConfigs } from '../Configs/MConfigs';
import { PlayerData } from '../Utils/PlayerData';
import { CurrencySys } from '../Scene/CurrencySys';
const { ccclass, property } = _decorator;

export enum STATUS_PIGGY_PANK {
    Normal,
    Collecting,
    Full
}

@ccclass('DataPiggySys')
export class DataPiggySys {
    public static Instance: DataPiggySys = null;

    public readonly jsonPiggy = {
        MaxCoin: {
            IAP_1: 7500,
            IAP_2: 15000,
            IAP_3: 45000
        },
        Price: {
            IAP_1: 2.99,
            IAP_2: 5.99,
            IAP_3: 17.99
        }
    }

    private readonly multiplyScore: number = 5;

    constructor() {
        if (DataPiggySys.Instance == null) {
            DataPiggySys.Instance = this;
        }
    }

    //##############################################
    //#region GET
    public GetStatusPiggyNow(): STATUS_PIGGY_PANK {
        // compare the progress player and the maximum of each IAP Piggy Bank
        const iapChoice = this.GetIAPPiggyNow();
        const progressNow = this.GetProgressNow();
        const maxCoin = this.GetProgressMax(iapChoice);

        if (progressNow == 0) return STATUS_PIGGY_PANK.Normal;
        switch (iapChoice) {
            case MConfigs.IAP_PIGGY_BANK_1:
                return progressNow < maxCoin ? STATUS_PIGGY_PANK.Collecting : STATUS_PIGGY_PANK.Full;
            case MConfigs.IAP_PIGGY_BANK_2:
                return progressNow < maxCoin ? STATUS_PIGGY_PANK.Collecting : STATUS_PIGGY_PANK.Full;
            case MConfigs.IAP_PIGGY_BANK_3:
                return progressNow < maxCoin ? STATUS_PIGGY_PANK.Collecting : STATUS_PIGGY_PANK.Full;
        }

        return null;
    }

    public GetIAPPiggyNow(): string {
        const iapChoice = PlayerData.Instance._infoEventPiggyBank.id;

        switch (iapChoice) {
            case 0: return MConfigs.IAP_PIGGY_BANK_1;
            case 1: return MConfigs.IAP_PIGGY_BANK_2;
            case 2: return MConfigs.IAP_PIGGY_BANK_3;
        }
        return null;
    }

    public GetPricePiggyNow(iap: string): number {
        switch (iap) {
            case MConfigs.IAP_PIGGY_BANK_1: return this.jsonPiggy.Price.IAP_1;
            case MConfigs.IAP_PIGGY_BANK_2: return this.jsonPiggy.Price.IAP_2;
            case MConfigs.IAP_PIGGY_BANK_3: return this.jsonPiggy.Price.IAP_3;
        }

        return 9;
    }

    public GetProgressNow(): number {
        return PlayerData.Instance._infoEventPiggyBank.progress;
    }

    public GetProgressMax(iap: string): number {
        switch (iap) {
            case MConfigs.IAP_PIGGY_BANK_1: return this.jsonPiggy.MaxCoin.IAP_1;
            case MConfigs.IAP_PIGGY_BANK_2: return this.jsonPiggy.MaxCoin.IAP_2;
            case MConfigs.IAP_PIGGY_BANK_3: return this.jsonPiggy.MaxCoin.IAP_3;
        }
    }

    public IsShowYet() { return PlayerData.Instance.PB_isShowYetWhenFull; }

    public IsMaxCoinAndNotPopUpYet() {
        const isShowYet = this.IsShowYet();
        if (isShowYet) return false;

        const progressNow = this.GetProgressNow();
        const iapNow = this.GetIAPPiggyNow();
        const maxProgressNow = this.GetProgressMax(iapNow);

        if (progressNow == maxProgressNow && !isShowYet) {
            return true;
        }

        return false;
    }

    public GetPricePiggyPackById(iap: string): number {
        switch (iap) {
            case MConfigs.IAP_PIGGY_BANK_1: return this.jsonPiggy.MaxCoin.IAP_1;
            case MConfigs.IAP_PIGGY_BANK_2: return this.jsonPiggy.MaxCoin.IAP_2;
            case MConfigs.IAP_PIGGY_BANK_3: return this.jsonPiggy.MaxCoin.IAP_3;
        }
        return 0;
    }
    //#endregion GET
    //##############################################

    //##############################################
    //#region save
    public BuySuccessPiggyNow() {
        const IAP_Now = this.GetIAPPiggyNow();
        const maxCoin = this.GetProgressMax(IAP_Now);
        CurrencySys.Instance.AddMoney(maxCoin, "PiggyBank", false, false);
        PlayerData.Instance.PB_isShowYetWhenFull = false;
        PlayerData.Instance._infoEventPiggyBank.id += 1;
        if (PlayerData.Instance._infoEventPiggyBank.id == 3) { PlayerData.Instance._infoEventPiggyBank.id = 2; }
        PlayerData.Instance._infoEventPiggyBank.progress = 0;
        PlayerData.Instance.SaveEvent_PiggyBank();
    }

    public ReceiveCoinPiggy(numIncrease: number, needSaveData: boolean) {
        const IAP_Now = this.GetIAPPiggyNow();
        if (IAP_Now == null) { return; }

        if (PlayerData.Instance._levelPlayer > MConfigs.LEVEL_TUTORIAL_EVENT.PiggyBank) {
            PlayerData.Instance._infoEventPiggyBank.progress += numIncrease * this.multiplyScore;
            const maxProgress = this.GetProgressMax(IAP_Now)
            if (PlayerData.Instance._infoEventPiggyBank.progress >= maxProgress) {
                PlayerData.Instance._infoEventPiggyBank.progress = maxProgress;
            }
            PlayerData.Instance.SaveEvent_PiggyBank(needSaveData);
        }
    }

    public SavePopUpFull(needSaveData: boolean = true) {
        PlayerData.Instance.PB_isShowYetWhenFull = true;
        PlayerData.Instance.SaveEvent_PiggyBank(needSaveData);
    }
    //#endregion save
    //##############################################
}


