import { _decorator, Component, director, Label } from 'cc';
import { DataHalloweenSys } from '../../../DataBase/DataHalloweenSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { EnumReasonEndPack, InfoPack } from '../../../Utils/Types';
import * as I18n from 'db://i18n/LanguageData';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('IcEvent_PackHalloween')
export class IcEvent_PackHalloween extends Component {
    @property(Label) lbTime: Label;
    private _infoPackNow: InfoPack = null;

    //===============================================
    //#region base
    protected onEnable(): void {
        const infoPackNow = DataHalloweenSys.Instance.InfoPackHalloweenWorking;

        if (DataHalloweenSys.Instance.GetTimeRemain() <= 0 || infoPackNow == null) { this.node.active = false; return;}

        if (this._infoPackNow == null || (this._infoPackNow != null && infoPackNow.namePack == this._infoPackNow.namePack)) {
            this._infoPackNow = infoPackNow;
            if (!clientEvent.isOnEvent(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this)) {
                clientEvent.on(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this);
            }
            this.RegisterTime();
        } else {
            this.node.active = false;
        }
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this);
        this.UnRegisterTime();
    }
    //#endregion base
    //===============================================

    //===============================================
    //#region time
    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        }
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    private UpdateUITime() {
        const time = DataHalloweenSys.Instance.GetTimeRemain();
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
            this.node.active = false;
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }
    //#endregion time
    //===============================================

    //===============================================
    //#region listen
    private async onClickSelf() {
        if (this._infoPackNow == null) { return; }
        LogEventManager.Instance.logButtonClick(`pack_${this._infoPackNow.namePack}`, "home");
        director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);
        await MConfigResourceUtils.LoadSkeHalloween();
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_HALLOWEEN, 1);
    }

    private RemovePack(reasonRemovePack: EnumReasonEndPack, packId: string) {
        if (this.node == null) { return; }
        if (this._infoPackNow == null || this._infoPackNow.namePack == packId) {
            this.node.active = false;
        }
    }
    //#endregion listen
    //===============================================
}


