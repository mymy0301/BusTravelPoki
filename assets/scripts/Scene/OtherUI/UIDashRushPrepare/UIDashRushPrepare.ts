import { _decorator, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { DataDashRush } from '../../DataDashRush';
import { instanceOfIUIKeepTutAndReceiveLobby, IOpenUIBaseWithInfo, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { MConfigs } from '../../../Configs/MConfigs';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { CONFIG_DR } from '../UIDashRush/TypeDashRush';
import { DataEventsSys } from '../../DataEventsSys';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIDashRushPrepare')
export class UIDashRushPrepare extends UIBaseSys {
    @property(Label) lbTime: Label;
    @property(Label) lbContent: Label;
    private _isCloseByBtnClose: boolean = false;

    //=====================================
    //#region UIBase
    protected onLoad(): void {
        this.lbContent.string = `Dash Rush has started! Beat ${CONFIG_DR.DR_MAX_PROGRESS} levels\nbefore others to win amazing rewards!`
    }

    protected onEnable(): void {
        this._isCloseByBtnClose = false;
        this.lbTime.string = Utils.convertTimeLengthToFormat_ForEvent(CONFIG_DR.DR_MAX_TIME_EVENT);
    }

    protected onDisable(): void {
        // this.UnRegisterTime();
    }

    public async UICloseDone(): Promise<void> {
        if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
            clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
        }
        if (this._isCloseByBtnClose) {
            clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
        }
    }
    //#endregion UIBase
    //=====================================

    //==============================================
    //#region btn
    onBtnStart() {
        LogEventManager.Instance.logButtonClick(`start`, "UIDashRushPrepre");
        this._dataCustom = null;

        let dataCustom = null;

        if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
            clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            dataCustom = this._dataCustom;
            this._dataCustom = null;
        }
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_DASH_RUSH_PREPARE, 1);
        const isPlayerInfo = !DataDashRush.Instance.IsPlayInfo()
        DataDashRush.Instance.SetShowInfo(true, false);
        DataDashRush.Instance.InitNewRound(true);
        if (isPlayerInfo) {
            dataCustom = { isShowInfo: true }
        }

        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_DASH_RUSH, 1, true, dataCustom);
    }

    onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIDashRushPrepre");

        this._isCloseByBtnClose = true;
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_DASH_RUSH_PREPARE, 1);
    }
    //#endregion btn
    //==============================================
}


