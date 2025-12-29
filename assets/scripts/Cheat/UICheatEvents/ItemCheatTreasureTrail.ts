/**
 * 
 * dinhquangvinhdev
 * Tue Sep 16 2025 10:37:58 GMT+0700 (Indochina Time)
 * ItemCheatSkyLift
 * db://assets/scripts/Cheat/UICheatEvents/ItemCheatSkyLift.ts
*
*/
import { _decorator, Component, EditBox, Label, Node } from 'cc';
import { Utils } from '../../Utils/Utils';
import { clientEvent } from '../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from '../../Const/MConst';
import { DataTreasureTrailSys } from '../../DataBase/DataTreasureTrailSys';
const { ccclass, property } = _decorator;

@ccclass('ItemCheatTreasureTrail')
export class ItemCheatTreasureTrail extends Component {
    @property(Label) lbTimeCooldown: Label;
    @property(Label) lbTimeDelay: Label;
    @property(EditBox) edbTimeCooldown: EditBox;
    @property(EditBox) edbTimeDelay: EditBox;
    //==========================================
    //#region base
    protected onDisable(): void {
        this.UnRegisterTime();
        this.UnRegisterTime_delay();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public SetUp() {
        this.UpdateTime();
        this.UpdateTime_delay();
        this.RegisterTime();
        this.RegisterTime_delay();
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region time
    private UpdateTime() {
        const timeRemaining = DataTreasureTrailSys.Instance.GetTimeDisplayCoolDown();
        if (timeRemaining <= 0) {
            this.lbTimeCooldown.string = `Cooldown: FINISH`;
            this.UnRegisterTime();
        } else {
            this.lbTimeCooldown.string = `Cooldown: ${Utils.convertTimeLengthToFormat_ForEvent(timeRemaining)}`;
        }
    }

    private UpdateTime_delay() {
        const timeRemaining = DataTreasureTrailSys.Instance.GetTimeDisplay_Delay();
        if (timeRemaining <= 0) {
            this.lbTimeDelay.string = `Delay: FINISH`;
            this.UnRegisterTime_delay();
        } else {
            this.lbTimeDelay.string = `Delay: ${Utils.convertTimeLengthToFormat_ForEvent(timeRemaining)}`;
        }
    }

    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private RegisterTime_delay() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime_delay, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime_delay, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UnRegisterTime_delay() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime_delay, this);
    }
    //#endregion time
    //==========================================

    //==========================================
    //#region btn
    private OnBtnChangeTimeCooldown() {
        try {
            const input = this.edbTimeCooldown.string;
            if (input == '') { throw ('empty input') }
            const timeChange = Number.parseInt(input);
            if (timeChange < 0) { throw (`time is negative`) }
            DataTreasureTrailSys.Instance.ForceChangeTimeCooldown(timeChange);
        } catch (e) {
            console.error(e);
        }
    }

    private OnBtnChangeTimeDelay() {
        try {
            const input = this.edbTimeDelay.string;
            if (input == '') { throw ('empty input') }
            const timeChange = Number.parseInt(input);
            if (timeChange < 0) { throw (`time is negative`) }
            DataTreasureTrailSys.Instance.ForceChangeTimeDelay(timeChange);
        } catch (e) {
            console.error(e);
        }
    }
    //#endregion btn
    //==========================================
}