/**
 * 
 * anhngoxitin01
 * Mon Sep 15 2025 14:01:19 GMT+0700 (Indochina Time)
 * ItemCheatLoop
 * db://assets/scripts/Cheat/UICheatEvents/ItemCheatLoop.ts
*
*/
import { _decorator, Component, EditBox, Label, Node } from 'cc';
import { getNameTypeEventGame, IGroupEvents } from '../../Utils/Types';
import { Utils } from '../../Utils/Utils';
import { clientEvent } from '../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ItemCheatLoop')
export class ItemCheatLoop extends Component {
    @property(Label) lbTitle: Label;
    @property(Label) lbEventShowing: Label;
    @property(Label) lbTime: Label;
    @property(EditBox) edbTime: EditBox;


    private _infoGroup: IGroupEvents = null;
    //==========================================
    //#region base
    protected onDisable(): void {
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
    public SetUp(infoGroup: IGroupEvents) {
        //---------------------------
        // cacual info to set
        this._infoGroup = infoGroup;
        let nameGroup = '';
        infoGroup.listEvents.forEach(event => {
            nameGroup += getNameTypeEventGame(event) + '-'
        });
        // remove last char
        nameGroup = nameGroup.slice(0, -1);

        let nameEventShowing: string = getNameTypeEventGame(infoGroup.listEvents[infoGroup.iSave.indexEventChecked]);
        this.lbEventShowing.string = `Event showing: ${nameEventShowing}`
        //---------------------------


        //---------------------------
        // set info
        this.lbTitle.string = nameGroup;
        this.UpdateTime();
        this.RegisterTime();
        //---------------------------
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region time
    private UpdateTime() {
        const timeRemaining = this._infoGroup.iSave.timeCanCheckNextEvent - Utils.getCurrTime();
        if (timeRemaining > 0) {
            this.lbTime.string = `Cooldown: ${Utils.convertTimeLengthToFormat_ForEvent(timeRemaining)}`;
        } else {
            this.lbTime.string = `Cooldown: Finish`;
            this.UnRegisterTime();
        }
    }

    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }
    //#endregion time
    //==========================================

    //==========================================
    //#region btn
    private onBtnRefresh() {
        this.SetUp(this._infoGroup);
    }
    private OnBtnChangeTime() {
        try {
            const input = this.edbTime.string;
            if (input == '') { throw ('empty input') }
            const timeChange = Number.parseInt(input);
            clientEvent.dispatchEvent(MConst.EVENT_GROUP_LOOP_EVENT.FORCE_CHANGE_TIME, this._infoGroup.iSave.idGroup, timeChange);
        } catch (e) {
            console.error(e);
        }
    }
    //#endregion btn
    //==========================================
}