/**
 * 
 * dinhquangvinhdev
 * Mon Sep 15 2025 16:52:42 GMT+0700 (Indochina Time)
 * ItemCheatEventLP
 * db://assets/scripts/Cheat/UICheatEvents/ItemCheatEventLP.ts
*
*/
import { _decorator, Component, EditBox, Label, Node } from 'cc';
import { CaculTimeEvents2 } from '../../Scene/LobbyScene/CaculTimeEvents2';
import { TYPE_EVENT_GAME } from '../../Utils/Types';
import { Utils } from '../../Utils/Utils';
import { clientEvent } from '../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../Const/MConst';
import { DataSeasonPassSys } from '../../DataBase/DataSeasonPassSys';
import { EVENT_SEASON_PASS } from '../../Scene/OtherUI/UISeasonPass/TypeSeasonPass';
const { ccclass, property } = _decorator;

@ccclass('ItemCheatEventSP')
export class ItemCheatEventSP extends Component {
    @property(Label) lbTime: Label;
    @property(EditBox) edbTime: EditBox;
    @property(Label) lbTimeDelay: Label;
    @property(EditBox) edbTimeDelay: EditBox;

    //==========================================
    //#region base
    protected onDisable(): void {
        this.UnRegisterTime();
        this.UnRegisterTimeDelay();
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
        this.UpdateTimeDelay();

        this.RegisterTime();
        this.RegisterTimeDelay();
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region time
    private UpdateTime() {
        const timeRemaining = CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.SEASON_PASS);
        if (timeRemaining <= 0) {
            this.lbTime.string = `Cooldown: FINISH`;
            this.UnRegisterTime();
        } else {
            this.lbTime.string = `Cooldown: ${Utils.convertTimeLengthToFormat_ForEvent(timeRemaining)}`;
        }
    }
    private UpdateTimeDelay() {
        const timeRemaining = CaculTimeEvents2.Instance.GetTimeDelay(TYPE_EVENT_GAME.SEASON_PASS);
        if (timeRemaining <= 0) {
            this.lbTimeDelay.string = `Delay: FINISH`;
            this.UnRegisterTime();
        } else {
            this.lbTimeDelay.string = `Delay: ${Utils.convertTimeLengthToFormat_ForEvent(timeRemaining)}`;
        }
    }

    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }
    private RegisterTimeDelay() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }
    private UnRegisterTimeDelay() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTimeDelay, this);
    }
    //#endregion time
    //==========================================

    //==========================================
    //#region btn
    public OnBtnSetTime() {
        try {
            const input = this.edbTime.string;
            if (input == '') { throw ('empty input') }
            const timeChange = Number.parseInt(input);
            CaculTimeEvents2.Instance.ForceChangeTimeEvent(TYPE_EVENT_GAME.SEASON_PASS, timeChange);
        } catch (e) {
            console.error(e);
        }
    }

    public OnBtnSetTimeDelay() {
        try {
            const input = this.edbTimeDelay.string;
            if (input == '') { throw ('empty input') }
            const timeChange = Number.parseInt(input);
            CaculTimeEvents2.Instance.ForceChangeTimeDelayEvent(TYPE_EVENT_GAME.SEASON_PASS, timeChange);
        } catch (e) {
            console.error(e);
        }
    }

    public OnBtnCheatFullPrize() {
        DataSeasonPassSys.Instance.Test_Reach_FullProgress();
    }
    public OnBtnActivePrenium() {
        DataSeasonPassSys.Instance.ActiveSuccessSeasonPass();
        clientEvent.dispatchEvent(EVENT_SEASON_PASS.ACTIVE_SUCCESS_PASS);
    }
    //#endregion btn
    //==========================================
}