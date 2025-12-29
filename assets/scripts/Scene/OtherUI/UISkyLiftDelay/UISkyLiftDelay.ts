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
import { CONFIG_SL } from '../UISkyLift/TypeSkyLift';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { Utils } from '../../../Utils/Utils';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UISkyLiftDelay')
export class UISkyLiftDelay extends UIBaseSys {
    @property(Label) lbTime: Label;
    @property(Label) lbContent: Label;
    private _isCloseByBtnClose: boolean = false;
    //==========================================
    //#region base
    protected onEnable(): void {
        super.onEnable();
        this._isCloseByBtnClose = false;
    }

    protected onDisable(): void {
        this.UnRegisterTime();
    }

    public async PrepareDataShow(): Promise<void> {
        // this.lbContent.string = `The Sky Lift is closed!`;
        this.UpdateTime();
        this.RegisterTime();
    }

    public async UICloseDone(): Promise<void> {
        if (this._isCloseByBtnClose) {
            clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
        }
    }
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
    private UpdateTime() {
        let time = -1;
        time = DataSkyLiftSys.Instance.GetTimeDisplay_Delay();
        if (time <= 0) {
            this.UnRegisterTime();
            this.lbTime.string = 'FINISHED';
        } else {
            const timeString = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = timeString;
        }
    }

    private UnRegisterTime() { clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this); }
    private RegisterTime() { clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this); }
    //#endregion time
    //==========================================

    //==========================================
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISkyLiftDelay");

        this._isCloseByBtnClose = true;
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SKY_LIFT_DELAY, 1);
    }
    //#endregion btn
    //==========================================
}