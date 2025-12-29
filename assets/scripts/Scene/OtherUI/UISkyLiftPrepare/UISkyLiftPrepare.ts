/**
 * 
 * dinhquangvinhdev
 * Tue Sep 30 2025 11:43:53 GMT+0700 (Indochina Time)
 * UISkyLiftPrepare
 * db://assets/scripts/Scene/OtherUI/UISkyLiftDelay/UISkyLiftDelay.ts
*
*/
import { _decorator, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { IOpenNewEvent, STATE_SL } from '../UISkyLift/TypeSkyLift';
const { ccclass, property } = _decorator;

@ccclass('UISkyLiftPrepare')
export class UISkyLiftPrepare extends UIBaseSys {
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    //#endregion public
    //==========================================

    //==========================================
    //#region time
    //#endregion time
    //==========================================

    //==========================================
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISkyLiftPrepare");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SKY_LIFT_PREPARE, 1);
    }
    private OnBtnPlay() {
        LogEventManager.Instance.logButtonClick(`play`, "UISkyLiftPrepare");
        let dataCustom = [];

        switch (DataSkyLiftSys.Instance.STATE) {
            case STATE_SL.WAIT_TO_JOIN:
                let iOpenNewEvent: IOpenNewEvent = { openNewEvent: true }
                dataCustom = [iOpenNewEvent];
                DataSkyLiftSys.Instance.InitNewEvent();
                break;
        }

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SKY_LIFT_PREPARE, 1);
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SKY_LIFT, 1, true, dataCustom);
    }
    //#endregion btn
    //==========================================
}