import { _decorator, Component, Node } from 'cc';
import { TYPE_CURRENCY, TYPE_QUEST_DAILY } from '../Utils/Types';
import { PlayerData } from '../Utils/PlayerData';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { CheatingSys } from './CheatingSys';
import { LogEventManager } from '../LogEvent/LogEventManager';
import { LE_RESOURCE_CHANGE_change_type } from '../LogEvent/TypeLogEvent';
const { ccclass, property } = _decorator;

@ccclass('CurrencySys')
export class CurrencySys {
    public static Instance: CurrencySys = null;

    constructor() {
        if (CurrencySys.Instance == null) {
            CurrencySys.Instance = this;
        }
    }

    //#region base func
    private AddCurrency(typeChange: TYPE_CURRENCY, currencyNum: number, needSaveData: boolean = true, needCallUpdateUI: boolean = true): boolean {
        // check in case the decrease data is too much
        if (currencyNum < 0 && PlayerData.Instance._currency[typeChange] + currencyNum < 0) {
            return CheatingSys.Instance.isCheatingCurrency;
        }

        // check can emit to update dailyQuest or not
        if (currencyNum < 0) {
            if (typeChange == TYPE_CURRENCY.MONEY) {
                // ||**DQ**||
                clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.USE_COIN, -currencyNum);
            }
        }

        // update data
        PlayerData.Instance._currency[typeChange] += currencyNum;

        // check to logevent
        switch (typeChange) {
            case TYPE_CURRENCY.MONEY:
                LogEventManager.Instance.logCoin(PlayerData.Instance._currency[typeChange]);
                if (currencyNum < 0) {
                    PlayerData.Instance._coinConsumed += currencyNum;
                    LogEventManager.Instance.logCoinConsumed(PlayerData.Instance._coinConsumed);
                }
                break;
            case TYPE_CURRENCY.TICKET:
                LogEventManager.Instance.logSkipAds(PlayerData.Instance._currency[typeChange]);
                if (currencyNum < 0) {
                    PlayerData.Instance._skipAdsConsumed += currencyNum;
                    LogEventManager.Instance.logCoinConsumed(PlayerData.Instance._skipAdsConsumed);
                }
                break;
        }

        // save data
        if (needSaveData) {
            PlayerData.Instance.SaveCurrency();
        }
        if (needCallUpdateUI) {
            this.EmitUpdateUICurrency(typeChange, currencyNum);
        }
        return true;
    }

    public GetCurrency(typeCurrency: TYPE_CURRENCY): number {
        // console.log("11111", PlayerData.Instance._currency);
        return PlayerData.Instance._currency[typeCurrency];
    }

    public EmitUpdateUICurrency(typeChange: TYPE_CURRENCY, currencyNum: number) {
        switch (typeChange) {
            case TYPE_CURRENCY.MONEY:
                clientEvent.dispatchEvent(MConst.EVENT_CURRENCY.UPDATE_UI_MONEY, currencyNum);
                break;
            case TYPE_CURRENCY.TICKET:
                clientEvent.dispatchEvent(MConst.EVENT_CURRENCY.UPDATE_UI_TICKET, currencyNum);
                break;
        }
    }
    //#endregion base func

    //#region ticket
    /**
     * this func will add currency
     * ```
     * ```
     * You can use it to check or add data if you want
     * ```
     * ```
     * if true it will automat Use the currency and save data
     * @param ticket 
     * @param needSaveData 
     * @param needCallUpdateUI 
     * @returns do action success or not
     */
    public AddTicket(ticket: number, change_reason: string, needSaveData: boolean = true, needCallUpdateUI: boolean = true): boolean {
        // log event
        let typeAdd: LE_RESOURCE_CHANGE_change_type = LE_RESOURCE_CHANGE_change_type.ADD;
        if (ticket < 0) {
            typeAdd = LE_RESOURCE_CHANGE_change_type.SUB;
        }
        LogEventManager.Instance.logResource_change('TICKET', typeAdd, `${ticket}`, change_reason);

        // save data
        return this.AddCurrency(TYPE_CURRENCY.TICKET, ticket, needSaveData, needCallUpdateUI);
    }

    public GetTicket(): number {
        return this.GetCurrency(TYPE_CURRENCY.TICKET);
    }
    //#endregion ticket

    //#region money
    /**
     * this func will add currency
     * ```
     * ```
     * You can use it to check or add data if you want
     * ```
     * ```
     * if true it will automat Use the currency and save data
     * @param money 
     * @param needSaveData 
     * @param needCallUpdateUI 
     * @returns do action success or not
     */
    public AddMoney(money: number, change_reason: string, needSaveData: boolean = true, needCallUpdateUI: boolean = true, needLogEvent: boolean = true): boolean {
        // log event
        let typeAdd: LE_RESOURCE_CHANGE_change_type = LE_RESOURCE_CHANGE_change_type.ADD;
        if (needLogEvent) {
            if (money < 0) {
                typeAdd = LE_RESOURCE_CHANGE_change_type.SUB;
                LogEventManager.Instance.logCoinConsumed(money);
            }
            LogEventManager.Instance.logResource_change('COIN', typeAdd, `${money}`, change_reason);
        }


        return this.AddCurrency(TYPE_CURRENCY.MONEY, money, needSaveData, needCallUpdateUI);
    }

    public GetMoney(): number {
        return this.GetCurrency(TYPE_CURRENCY.MONEY);
    }
    //#endregion money
}


