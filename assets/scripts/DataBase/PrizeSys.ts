import { _decorator, Component, Node } from 'cc';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE, TYPE_RECEIVE_PRIZE_LOBBY } from '../Utils/Types';
import { PlayerData } from '../Utils/PlayerData';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
import { CurrencySys } from '../Scene/CurrencySys';
import { DataItemSys } from '../Scene/DataItemSys';
const { ccclass, property } = _decorator;

@ccclass('PrizeSys')
export class PrizeSys {
    public static Instance: PrizeSys = null;
    constructor() {
        if (PrizeSys.Instance == null) {
            PrizeSys.Instance = this;
        }
    }


    /**
     * remember call this func will auto save game
     * @param iPrize 
     */
    public AddPrize(iPrize: IPrize[], reasonAddPrize: string, needSaveData: boolean = true, needEventUpdate: boolean = true) {
        let listOtherPrize = [];

        for (let i = 0; i < iPrize.length; i++) {
            let iPrizeCheck = iPrize[i];
            switch (iPrizeCheck.typePrize) {
                case TYPE_PRIZE.MONEY:
                    CurrencySys.Instance.AddMoney(iPrizeCheck.value, reasonAddPrize, needSaveData, needEventUpdate);
                    break;
                case TYPE_PRIZE.TICKET:
                    CurrencySys.Instance.AddTicket(iPrizeCheck.value, reasonAddPrize, needSaveData, needEventUpdate);
                    break;
                case TYPE_PRIZE.DOUBLE_KEY_SEASON_PASS:
                    let timeAddDoubleKey = iPrizeCheck.value;
                    if (iPrizeCheck.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE) {
                        timeAddDoubleKey *= 60;
                    } else if (iPrizeCheck.typeReceivePrize == TYPE_RECEIVE.TIME_HOUR) {
                        timeAddDoubleKey *= 60 * 24;
                    }
                    clientEvent.dispatchEvent(MConst.EVENT_DOUBLE_KEY.ADD_TIME, timeAddDoubleKey);
                    break;
                default:
                    listOtherPrize.push(iPrizeCheck);
                    break;
            }
        }

        // console.log("listPrize", listOtherPrize);

        DataItemSys.Instance.AddItemPrize(listOtherPrize, reasonAddPrize, needSaveData, true);
    }
}


