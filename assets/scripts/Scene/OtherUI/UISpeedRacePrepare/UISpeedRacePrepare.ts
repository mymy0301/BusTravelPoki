import { _decorator, Component, Node, find } from 'cc';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { instanceOfIOpenUIBaseWithInfo, instanceOfIUIKeepTutAndReceiveLobby, IUIKeepTutAndReceiveLobby, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
const { ccclass, property } = _decorator;

@ccclass('UISpeedRacePrepare')
export class UISpeedRacePrepare extends UIBaseSys {
    private _isCloseByBtnClose: boolean = false;

    //=============================================
    //#region baseUI
    protected onEnable(): void {
        this._isCloseByBtnClose = false;
    }

    public async UICloseDone(): Promise<void> {
        // emit receive done
        if (this._dataCustom != null) {
            const dataCustom = this._dataCustom as any[];
            const canKeepReceiveLobby: IUIKeepTutAndReceiveLobby = dataCustom.find(data => instanceOfIUIKeepTutAndReceiveLobby(data));
            if (canKeepReceiveLobby != null) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }

        if (this._isCloseByBtnClose) {
            clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
        }
    }
    //#endregion baseUI
    //=============================================

    //=============================================
    //#region btn
    onBtnStart() {
        LogEventManager.Instance.logButtonClick(`start`, "UISpeedRacePrepare");
        const preDataCustom = this._dataCustom;
        this._dataCustom = null;
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SPEED_RACE_PREPARE, 1);
        DataSpeedRace.Instance.InitNewRound(true);

        let dataSend: any[] = [];
        if (preDataCustom != null) {
            const showInfoSpeedRace = preDataCustom.find(data => instanceOfIOpenUIBaseWithInfo(data));
            showInfoSpeedRace != null && dataSend.push(showInfoSpeedRace);
        }

        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.SPEED_RACE);
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPEED_RACE, 1, true, dataSend);
    }

    onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISpeedRacePrepare");

        this._isCloseByBtnClose = true;

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SPEED_RACE_PREPARE, 1);
    }
    //#endregion btn
    //=============================================
}


