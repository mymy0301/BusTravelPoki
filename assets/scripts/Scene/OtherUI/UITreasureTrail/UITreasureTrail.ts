/**
 * 
 * anhngoxitin01
 * Sat Aug 16 2025 20:21:13 GMT+0700 (Indochina Time)
 * UITreasureTrail
 * db://assets/scripts/Scene/OtherUI/UITreasureTrail/UITreasureTrail.ts
*
*/
import { _decorator, Component, Label, Node, tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { InfoBot_TreasureTrail, instanceOfIOpenUIBaseWithInfo, instanceOfIShowTTInGame, instanceOfIUIKeepTutAndReceiveLobby, IPrize, TYPE_EVENT_GAME, TYPE_PRIZE } from '../../../Utils/Types';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { Utils } from '../../../Utils/Utils';
import { CONFIG_TT, STATE_TT } from './TypeTreasureTrail';
import { AnimUITreasureTrail } from './AnimUITreasureTrail';
import { ListBotUITreasureTrail } from './ListBotUITreasureTrail';
import { UIResultTreasureTrail } from './UIResultTreasureTrail';
import { UITutTreasureTrail } from './UITutTreasureTrail';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { DataEventsSys } from '../../DataEventsSys';
const { ccclass, property } = _decorator;

@ccclass('UITreasureTrail')
export class UITreasureTrail extends UIBaseSys {
    @property(InfoUIBase) infoUIBase: InfoUIBase;
    @property(AnimUITreasureTrail) animUITreasureTrail: AnimUITreasureTrail;
    @property(ListBotUITreasureTrail) listBotUITreasureTrail: ListBotUITreasureTrail;
    @property(Label) lbTime: Label;
    @property(Node) nBlockUI: Node;
    @property(UIResultTreasureTrail) uiResultTreasureTrail: UIResultTreasureTrail;
    @property(UITutTreasureTrail) uiTutTreasureTrail: UITutTreasureTrail;
    @property(Node) nUITapToContinueWin: Node;

    /**tham số này được dùng để lưu trự tạm thời trạng thái của event khi xuất hiện để tránh trường hợp đang diễn hoạt anim nhwung event bị thay đổi tragnj thái đột ngột đẫn đến lỗi hiển thị*/
    private _stateEventNow: STATE_TT;
    private _stageBefore: number = -1;
    private _stageNow: number = -1;

    //==========================================
    //#region base
    public async PrepareDataShow(): Promise<void> {
        // hide the ui
        this.infoUIBase.node.active = false;
        // register bot
        this.uiResultTreasureTrail.listBotResultTT.RegisterPoolItem();

        // tap to continue
        this.nUITapToContinueWin.active = false;

        //===============================================================
        // save state event Now
        this._stateEventNow = DataTreasureTrailSys.Instance.STATE;
        switch (true) {
            case this._stateEventNow == STATE_TT.LOSE:
                DataTreasureTrailSys.Instance.SaveReceivePrizeDone();
                break;
            case this._stateEventNow == STATE_TT.WIN:
                const listPrizeReceive = DataTreasureTrailSys.Instance.GetPrizeReceiveWin();
                //save data
                PrizeSys.Instance.AddPrize(listPrizeReceive, "WinUITreasureTrail", false, false);
                DataTreasureTrailSys.Instance.SaveReceivePrizeDone();
                break;
        }
        this.PrepareSetUpUI();
    }

    public async UIShowDone(): Promise<void> {
        // // ===== check show info  ======
        // // check show anim
        // if (!DataTreasureTrailSys.Instance.IsPlayTutEvent()) {
        //     isShowingInfo = true;
        //     this.infoUIBase.Show();

        //     this.infoUIBase.registerCallback(() => {
        //         isShowingInfo = false;
        //     })
        // }

        // ===== show Tut in here =========
        let isShowingInfo: boolean = false;
        if (!DataTreasureTrailSys.Instance.IsPlayTutEvent()) {
            isShowingInfo = true;
            DataTreasureTrailSys.Instance.SetPlayTutEvent(true);
            await this.uiTutTreasureTrail.PlayeSeriTut();
            isShowingInfo = false;
        }
        await Utils.WaitReceivingDone(() => !isShowingInfo);

        // ===== check the UI to show =====
        //NOTE ở đây check delay lose + delay win vì trước khi preload đã cài đặt ở trạng thái delay lose vs delay win rùi
        switch (this._stateEventNow) {
            case STATE_TT.JOINING:
                if (this._stageBefore < this._stageNow) {
                    this.nBlockUI.active = true;
                    await this.PlayAnimShowNormal();
                    this.nUITapToContinueWin.active = true;
                    this.nBlockUI.active = false;
                }
                break;
            case STATE_TT.LOSE:
                await this.PlayAnimShowLose();
                this.animUITreasureTrail.ShowUILose();
                break;
            case STATE_TT.WIN:
                this.nBlockUI.active = true;
                await this.PlayAnimShowNormal();
                this.nBlockUI.active = false;

                // hiển thị UIResult
                this.uiResultTreasureTrail.Show();
                break;
        }
    }

    protected onEnable(): void {
        super.onEnable();

        // ẩn UIResult
        this.uiResultTreasureTrail.Hide();

        // register click continue
        this.uiResultTreasureTrail.SetUpCb(this.OnBtnTapContinueCongratulation.bind(this));
    }

    protected onDisable(): void {
        // hủy lệnh nghe thời gian
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }
    public async UICloseDone(): Promise<void> {
        // keep logic receive home
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            const dataKeepTut = this._dataCustom.find(dataAny => instanceOfIUIKeepTutAndReceiveLobby(dataAny))
            if (dataKeepTut != null) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }
        // keep logic tut event
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);


        // if is lose event => hide the icon home
        const stateEvent = DataTreasureTrailSys.Instance.STATE;
        if (stateEvent == STATE_TT.DELAY_LOSE || stateEvent == STATE_TT.DELAY_WIN) {
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.TREASURE_TRAIL);
        }

        // if it show in game => cb show next
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            const dataIShowTTInGame = this._dataCustom.find(dataAny => instanceOfIShowTTInGame(dataAny))
            dataIShowTTInGame != null && dataIShowTTInGame.cbClose != null && dataIShowTTInGame.cbClose();
        }
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private PrepareSetUpUI() {
        //===============================================================
        // registerTime
        this.RegisterTime();

        //===============================================================
        // init các đối tượng có thể show
        // lấy thông tin các bot show trong stage hiện tại
        let dataBotShow: InfoBot_TreasureTrail[] = [];
        this._stageBefore = DataTreasureTrailSys.Instance.ProgressOld;
        this._stageNow = DataTreasureTrailSys.Instance.ProgressNow;

        let stageChoice: number = -1;
        if (DataTreasureTrailSys.Instance.ProgressOld < 0 || DataTreasureTrailSys.Instance.ProgressOld >= DataTreasureTrailSys.Instance.ProgressNow) {
            // trong trường hợp stageBefore ko hợp lệ thì chỉ hiển thị UI chính xác số bot mà ta hiện có
            stageChoice = this._stageNow;
        } else {
            // trong trường hợp có stageBefore và stageNow hợp lệ tức là user win hoặc lose => có thể diễn hoạt
            stageChoice = this._stageBefore;
        }
        dataBotShow = DataTreasureTrailSys.Instance.GetListBotByStage(stageChoice);
        console.log("dataBotShow", dataBotShow);

        // save stage
        DataTreasureTrailSys.Instance.SaveSTAGE();

        // init bot 
        const wPosPlatform: Vec3 = this.animUITreasureTrail.GetWPosPlatform(stageChoice);
        this.listBotUITreasureTrail.node.worldPosition = wPosPlatform;
        this.listBotUITreasureTrail.SetUpData(dataBotShow);

        this.animUITreasureTrail.SetInfoBase(this._stageBefore, dataBotShow.length);

        //===============================================================
        // check suit state event to show UI suitable
        switch (this._stateEventNow) {
            case STATE_TT.JOINING:
                this.animUITreasureTrail.PrepareShowUINormal();
                break;
            case STATE_TT.LOSE:
                this.animUITreasureTrail.PrepareShowUILose();
                break;
            case STATE_TT.WIN:
                const listBots = DataTreasureTrailSys.Instance.GetListBotByStage(CONFIG_TT.LEVEL_PLAY);
                this.uiResultTreasureTrail.SetUp(listBots);
                break;
        }
    }


    private RegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        }
    }

    private UpdateUITime() {
        // const time = DataEventsSys.Instance.GetTimeGroupEventRemain(TYPE_EVENT_GAME.TREASURE_TRAIL, 1);
        const time = DataTreasureTrailSys.Instance.GetTimeDisplay();
        if (this == null || this.lbTime == null) { return; }
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }

    private async PlayAnimShowNormal() {
        this.nBlockUI.active = true;
        const numBotBefore: number = DataTreasureTrailSys.Instance.GetListBotByStage(this._stageBefore).length;
        const numBotAfter: number = DataTreasureTrailSys.Instance.GetListBotByStage(this._stageNow).length;
        let numBotAnimRemove: number = 5;
        if (numBotAfter < CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI) {
            numBotAnimRemove = numBotBefore - numBotAfter;
        }
        await this.animUITreasureTrail.AnimUINormal(this._stageBefore, this._stageNow, numBotBefore, numBotAfter, numBotAnimRemove);

        // reUse player not used any more
        this.listBotUITreasureTrail.ReUseListBots(numBotAnimRemove);
        this.nBlockUI.active = false;
    }

    private async PlayAnimShowLose() {
        this.nBlockUI.active = true;
        const numBotBefore: number = DataTreasureTrailSys.Instance.GetListBotByStage(this._stageNow).length;
        const numBotAfter: number = DataTreasureTrailSys.Instance.GetListBotByStage(this._stageNow + 1).length;
        let numBotAnimRemove: number = 5;
        if (numBotAfter < CONFIG_TT.NUM_BOT_LIMIT_SHOW_UI) {
            numBotAnimRemove = numBotBefore - numBotAfter;
        }
        await this.animUITreasureTrail.AnimLose(this._stageNow, this._stageNow + 1, numBotBefore, numBotAfter, numBotAnimRemove);

        // reUse player not used any more
        this.listBotUITreasureTrail.ReUseListBots(numBotAnimRemove);
        this.nBlockUI.active = false;
    }

    private async CloseUIAnim() {
        const timeAnim = 0.5;
        this.nVisual.active = false;
        tween(this.uiResultTreasureTrail.getComponent(UIOpacity))
            .to(timeAnim, { opacity: 0 })
            .start();
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    private OnBtnInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UITreasureTrail");
        this.infoUIBase.Show();
    }

    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UITreasureTrail");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TREASURE_TRAIL, 1);
    }

    private OnBtnContinue() {
        LogEventManager.Instance.logButtonClick(`tap_to_continue`, "UITreasureTrail");
        const paramTT = DataTreasureTrailSys.Instance.GetParamToLogThisEvent();
        if (paramTT != null) {
            LogEventManager.Instance.logEventEnd(TYPE_EVENT_GAME.TREASURE_TRAIL, paramTT.progress_event, paramTT.num_play_event);
        }
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TREASURE_TRAIL, 1);
    }

    private async OnBtnTapContinueCongratulation(wPosPrize: Vec3, listPrizeReceive: IPrize[]) {
        LogEventManager.Instance.logButtonClick(`tap_to_continue`, "UITreasureTrail");
        const paramTT = DataTreasureTrailSys.Instance.GetParamToLogThisEvent();
        if (paramTT != null) {
            LogEventManager.Instance.logEventEnd(TYPE_EVENT_GAME.TREASURE_TRAIL, paramTT.progress_event, paramTT.num_play_event);
        }

        this.nBlockUI.active = true;

        // call update UIItemEvent
        // clientEvent.dispatchEvent(MConst.EVENT_GAME.HIDE_EVENT, TYPE_EVENT_GAME.TREASURE_TRAIL);
        // call off listen update time
        clientEvent.dispatchEvent(MConst.EVENT_GAME.OFF_LISTEN_TIME, TYPE_EVENT_GAME.TREASURE_TRAIL);

        // close UIResultSlow
        this.CloseUIAnim();

        // gọi hiển thị tiền từ vị trí prize và bay vào UI
        if (listPrizeReceive[0].typePrize == TYPE_PRIZE.MONEY) {
            const numCoinReceive = listPrizeReceive[0].value;
            await UIReceivePrizeLobby.Instance.ReceiveCoin3D_HOME(wPosPrize, numCoinReceive);
        }

        // ở phần gọi cb này đã log event rùi
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TREASURE_TRAIL, 1);

        this.nBlockUI.active = false;
    }

    private OnBtnTapToContinueWin() {
        LogEventManager.Instance.logButtonClick(`tap_to_continue_win`, "UITreasureTrail");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TREASURE_TRAIL, 1);
    }
    //#endregion btn
    //==========================================

    // //==========================================
    // //#region test
    // public async Test_Start() {
    //     new DataTreasureTrailSys();
    //     new PlayerData();
    //     new ReadDataJson();
    //     PlayerData.Instance.TT_id = 1;
    //     PlayerData.Instance.TT_infoBot = DataTreasureTrailSys.Instance.Test_Temp_Bot();
    //     this._stageBefore = 0;
    //     this._stageNow = 0;

    //     await Utils.delay(0.5 * 1000);
    //     // init
    //     const tempBot = DataTreasureTrailSys.Instance.GetListBotByStage(this._stageNow);
    //     const wPosPlatform: Vec3 = this.animUITreasureTrail.GetWPosPlatform(this._stageNow);
    //     this.listBotUITreasureTrail.node.worldPosition = wPosPlatform;
    //     this.listBotUITreasureTrail.SetUpData(tempBot);

    //     //register bot
    //     this.uiResultTreasureTrail.listBotResultTT.RegisterPoolItem();
    // }

    // public async Test_Jump() {
    //     this._stageNow = this._stageBefore + 1;

    //     // call anim
    //     await this.PlayAnimShowNormal();
    //     this._stageBefore = this._stageNow;
    // }

    // public async Test_Lose() {
    //     //prepare anim
    //     this.animUITreasureTrail.PrepareShowUILose();

    //     //show UI
    //     this.animUITreasureTrail.ShowUILose();
    // }

    // public async Test_Win() {
    //     this._stageNow = this._stageBefore + 1;

    //     this.uiResultTreasureTrail.SetUp(DataTreasureTrailSys.Instance.GetListBotByStage(CONFIG_TT.LEVEL_PLAY));

    //     await this.PlayAnimShowNormal();
    //     this._stageBefore = this._stageNow;

    //     this.uiResultTreasureTrail.Show();
    // }

    // public async Test_Update() {
    //     const tempBot = DataTreasureTrailSys.Instance.GetListBotByStage(this._stageNow);
    //     const wPosPlatform: Vec3 = this.animUITreasureTrail.GetWPosPlatform(this._stageNow);
    //     this.listBotUITreasureTrail.node.worldPosition = wPosPlatform;
    //     this.listBotUITreasureTrail.SetUpData(tempBot);
    // }

    // public async Test_Tut() {
    //     await this.uiTutTreasureTrail.PlayeSeriTut();
    // }
    // //#endregion test
    // //==========================================
}