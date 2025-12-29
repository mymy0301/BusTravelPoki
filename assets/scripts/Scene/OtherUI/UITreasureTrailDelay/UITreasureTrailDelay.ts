/**
 * 
 * dinhquangvinhdev
 * Fri Sep 19 2025 09:22:19 GMT+0700 (Indochina Time)
 * UITreasureTrailDelay
 * db://assets/scripts/Scene/OtherUI/UITreasureTrailDelay/UITreasureTrailDelay.ts
*
*/
import { _decorator, Component, Label, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { STATE_TT } from '../UITreasureTrail/TypeTreasureTrail';
import { DataEventsSys } from '../../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UITreasureTrailDelay')
export class UITreasureTrailDelay extends UIBaseSys {
    @property(Label) lbContent: Label;
    @property(Label) lbTime: Label;
    private readonly contentFailed: string = 'You failed the challenge.\n';
    private readonly contentDefault: string = 'Next Treasure Trail will start in:';
    //==========================================
    //#region base
    public async PrepareDataShow(): Promise<void> {
        // content UI
        let content = this.contentDefault;
        if (DataTreasureTrailSys.Instance.STATE == STATE_TT.DELAY_LOSE) {
            content = this.contentFailed + this.contentDefault;
        }
        this.lbContent.string = content;

        // time
        this.UpdateTime();
        this.RegisterTime();
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT_GAME.OPEN_EVENT_BY_GROUP, this.EndCoolTimeByGroup, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_GAME.OPEN_EVENT_BY_GROUP, this.EndCoolTimeByGroup, this);
        this.UnRegisterTime();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region listen
    private EndCoolTimeByGroup(typeEventOff: TYPE_EVENT_GAME) {
        if (typeEventOff == TYPE_EVENT_GAME.TREASURE_TRAIL) {
            this.lbTime.string = "FINISHED";
            this.UnRegisterTime();
        }
    }
    //#endregion listen
    //==========================================

    //==========================================
    //#region time
    private UpdateTime() {
        let time = -1;
        const stateEvent = DataTreasureTrailSys.Instance.STATE;
        const isEventGoingOn = DataEventsSys.Instance.IsEventShowingByLoop(TYPE_EVENT_GAME.TREASURE_TRAIL);
        switch (true) {
            case isEventGoingOn && stateEvent == STATE_TT.DELAY_LOSE:
                time = DataTreasureTrailSys.Instance.GetTimeDisplay_Delay();
                break;
            case (isEventGoingOn && stateEvent == STATE_TT.DELAY_WIN) || !isEventGoingOn:
                time = DataEventsSys.Instance.GetTimeUntilUnlockNextEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
                break;
        }

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
    public OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UITreasureTrailDelay");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TREASURE_TRAIL_DELAY, 1);
    }
    //#endregion btn
    //==========================================
}