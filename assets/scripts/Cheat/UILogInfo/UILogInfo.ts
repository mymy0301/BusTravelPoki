/**
 * 
 * dinhquangvinhdev
 * Sat Sep 27 2025 09:18:49 GMT+0700 (Indochina Time)
 * UILogInfo
 * db://assets/scripts/Cheat/UILogInfo/UILogInfo.ts
*
*/
import { _decorator, Component, Label, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../Const/MConst';
import { Utils } from '../../Utils/Utils';
import { getTimeOffset } from '../../Utils/Time/time-offset';
import { PlayerSave } from '../../Utils/PlayerSave';
const { ccclass, property } = _decorator;

@ccclass('UILogInfo')
export class UILogInfo extends Component {
    @property(Label) lbTime: Label;
    @property(Node) nVisual: Node;
    //==========================================
    //#region base
    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_INFO, this.ShowVisual, this);
    }

    protected start(): void {
        this.UpdateTime();
        this.RegisterTime();
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_INFO, this.ShowVisual, this);
        this.UnRegisterTime();
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
    //#region listener
    private ShowVisual() {
        this.nVisual.active = !this.nVisual.active;
    }
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================

    //==========================================
    //#region time
    private UpdateTime() {
        let _dateNow = new Date();
        this.lbTime.string = `${_dateNow.toLocaleString()} _ ${getTimeOffset() / 1000}`;
    }

    private RegisterTime() {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }
    //#endregion time
    //==========================================
}