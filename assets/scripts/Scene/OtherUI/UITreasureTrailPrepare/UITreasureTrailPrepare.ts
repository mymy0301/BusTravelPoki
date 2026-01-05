import { _decorator, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { Utils } from '../../../Utils/Utils';
import { CONFIG_TT } from '../UITreasureTrail/TypeTreasureTrail';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { VisualReadyToPlay } from './VisualReadyToPlay';
import { instanceOfIUIKeepTutAndReceiveLobby, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { PlayerData } from '../../../Utils/PlayerData';
import { ReadDataJson } from '../../../ReadDataJson';
import { MConsolLog } from '../../../Common/MConsolLog';
import { DataEventsSys } from '../../DataEventsSys';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Mon Aug 11 2025 11:23:28 GMT+0700 (Indochina Time)
 * UITreasureTrailPrepare
 * db://assets/scripts/Scene/OtherUI/UITreasureTrailPrepare/UITreasureTrailPrepare.ts
 *
 */

@ccclass('UITreasureTrailPrepare')
export class UITreasureTrailPrepare extends UIBaseSys {
    @property(Label) lbTime: Label;
    @property(Label) lbContent: Label;
    @property(VisualReadyToPlay) visualReadyToPlay: VisualReadyToPlay;
    private _isCloseByBtnClose: boolean = false;
    //==========================================
    //#region base
    protected onEnable(): void {
        super.onEnable();
        this._isCloseByBtnClose = false;
        this.visualReadyToPlay.Hide();
    }

    protected onDisable(): void {
    }

    public async PrepareDataShow(): Promise<void> {
        this.lbContent.string = `Treasure Trail has been started!\nBeat ${CONFIG_TT.LEVEL_PLAY} levels to complete the challenge`;
        this.lbTime.string = Utils.convertTimeLengthToFormat_ForEvent(CONFIG_TT.TIME_EVENT)
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
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UITreasureTrailPrepare");

        this._isCloseByBtnClose = true;
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TREASURE_TRAIL_PREPARE, 1);
    }

    private OnBtnStart() {
        LogEventManager.Instance.logButtonClick(`start`, "UITreasureTrailPrepare");

        //init new data
        DataTreasureTrailSys.Instance.InitEvent();

        this.nVisual.active = false;
        this.visualReadyToPlay.RegisterCbClose(() => {
            clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TREASURE_TRAIL_PREPARE, 1);
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TREASURE_TRAIL, 1);
        })
        this.visualReadyToPlay.PrepareShow();
        this.visualReadyToPlay.ShowUI();

    }
    //#endregion btn
    //==========================================

    // //==========================================
    // //#region test
    // public async TestVisualMatch() {
    //     new DataTreasureTrailSys();
    //     new PlayerData();
    //     new ReadDataJson();
    //     PlayerData.Instance.TT_id = 1;
    //     PlayerData.Instance.TT_infoBot = DataTreasureTrailSys.Instance.Test_Temp_Bot();

    //     await Utils.delay(0.5 * 1000);

    //     this.nVisual.active = false;
    //     this.visualReadyToPlay.RegisterCbClose(() => {
    //         MConsolLog.Log("click lcick");
    //     })
    //     this.visualReadyToPlay.PrepareShow();
    //     this.visualReadyToPlay.ShowUI();
    // }
    // //#endreigon test
    // //==========================================
}