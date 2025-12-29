/**
 * 
 * dinhquangvinhdev
 * Mon Sep 15 2025 11:37:45 GMT+0700 (Indochina Time)
 * UICheatEvent
 * db://assets/scripts/Cheat/UICheatEvent.ts
*
*/
import { _decorator, Component, EditBox, Node } from 'cc';
import { ListItemCheatLoop } from './ListItemCheatLoop';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { getTimeOffset, setTimeOffset } from '../../Utils/Time/time-offset';
import { PlayerSave } from '../../Utils/PlayerSave';
import { PlayerData } from '../../Utils/PlayerData';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UICheatEvent')
export class UICheatEvent extends Component {
    @property(ListItemCheatLoop) listItemCheatLoop: ListItemCheatLoop;

    //==========================================
    //#region base
    protected onLoad(): void {
        // update time from data player
        setTimeOffset(this.getTimeOffsetFromData() * 1000);

        clientEvent.on(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_EVENTS, this.ShowSelf, this);
        this.node.active = false;
    }
    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_CHEAT.SHOW_UI_CHEAT_EVENTS, this.ShowSelf, this);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private ShowSelf() {
        this.node.active = true;
        this.listItemCheatLoop.SetUp();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region AddTime
    @property(EditBox) edbTimed: EditBox;
    @property(EditBox) edbTimeh: EditBox;
    @property(EditBox) edbTimem: EditBox;
    @property(EditBox) edbTimes: EditBox;
    public OnBtnAddTime() {
        try {
            const timed = Number.parseInt(this.edbTimed.string);
            const timeh = Number.parseInt(this.edbTimeh.string);
            const timem = Number.parseInt(this.edbTimem.string);
            const times = Number.parseInt(this.edbTimes.string);

            const totalTimeAdd = (timed != null && Number.isInteger(timed) ? timed * 60 * 60 * 24 : 0)
                + (timeh != null && Number.isInteger(timeh) ? timeh * 60 * 60 : 0)
                + (timem != null && Number.isInteger(timem) ? timem * 60 : 0)
                + (times != null && Number.isInteger(times) ? times : 0)

            const timeCache = PlayerSave.getDataLocal("TIME", false);
            const timeRight = timeCache + totalTimeAdd;
            setTimeOffset(timeRight * 1000);
            PlayerSave.saveDataLocal("TIME", timeRight, false);
        } catch (e) {
            console.error(e);
        }
    }

    private getTimeOffsetFromData(): number {
        const timeSave = PlayerSave.getDataLocal("TIME", false);
        if (Number.isInteger(timeSave)) {
            return timeSave;
        }
        return 0;
    }

    public OnBtnClearTime() {
        // call reload data
        PlayerSave.saveDataLocal("TIME", 0, false);
        location.reload();
    }

    public OnBtnAddTimeCustom(event: Event, dataCustom: any) {
        let timeSave = PlayerSave.getDataLocal("TIME", false);
        timeSave += Number.parseInt(dataCustom);
        setTimeOffset(timeSave * 1000);
        PlayerSave.saveDataLocal("TIME", timeSave, false);
    }

    public OnBtnCopyData() {
        const dataPlayerSave = PlayerData.Instance.getDataToSaveOnFacebook();
        Utils.copyData(dataPlayerSave);
    }
    //#endregion AddTime
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    onBtnClose() {
        this.node.active = false;
    }
    //#endregion btn
    //==========================================
}