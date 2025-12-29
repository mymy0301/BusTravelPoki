import { _decorator, Component, Label, Node, Prefab, ProgressBar, randomRangeInt, Size, Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec2, Vec3, Widget, find } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { addPrizeToList, instanceOfIUIKeepTutAndReceiveLobby, IUIKeepTutAndReceiveLobby, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import * as I18n from 'db://i18n/LanguageData';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { UISRListBot } from './UISRListBot';
import { SRProgressSys } from './SRProgressSys';
import { BubbleSys } from '../Others/Bubble/BubbleSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { CONFIG_SR, STATE_SPEED_RACE } from './TypeEventSpeedRace';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
const { ccclass, property } = _decorator;

@ccclass('UISpeedRace')
export class UISpeedRace extends UIBaseSys {
    @property(Label) lbTime: Label;
    @property(InfoUIBase) infoUIBase: InfoUIBase;
    @property(UISRListBot) listBot: UISRListBot;
    @property(SRProgressSys) srProgressSys: SRProgressSys;
    @property(BubbleSys) bubbleSys: BubbleSys;
    @property(Node) nBtnClaimPrizeSummery: Node;
    @property(Node) nBtnClose: Node;
    @property(Label) lbTextBtnClaim: Label;
    @property(Label) lbShadowTextBtnClaim: Label;

    @property({ group: { id: 'resource', name: 'resource' }, type: [SpriteFrame] }) listSfItem: SpriteFrame[] = [];
    @property({ group: { id: 'resource', name: 'resource' }, type: [SpriteFrame] }) listSfChest: SpriteFrame[] = [];

    @property({ group: { id: 'endTime', name: 'endTime' }, type: Label }) et_lbRank: Label;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Label }) et_lbNumPrize: Label;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Sprite }) et_spPrize: Sprite;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Sprite }) et_chest: Sprite;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Node }) et_light: Node;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Node }) et_nLbNoPrize: Node;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Node }) et_list_node_item: Node[] = [];

    @property({ group: { id: 'startTime', name: 'startTime' }, type: ProgressBar }) st_pbSpeedRace: ProgressBar;
    @property({ group: { id: 'startTime', name: 'startTime' }, type: Label }) st_lbProgress: Label;
    @property({ group: { id: 'startTime', name: 'startTime' }, type: Label }) st_lbNumPrize: Label;
    @property({ group: { id: 'startTime', name: 'startTime' }, type: Sprite }) st_spPrize: Sprite;

    @property(Node) listNHeaderInTime: Node[] = [];
    @property(Node) listNHeaderEndTime: Node[] = [];

    @property(Node) nNoti: Node;

    private _isAnimShowingUI: boolean = false;
    private _progressAnim: number = -1;

    private readonly widgetBottomWhenHaveBtn: number = 200;
    private readonly widgetBottomWhenNoBtn: number = 30;

    private readonly widgetBtmAnchorWhenHaveBtn: number = 0;
    private readonly widgetBtmAnchorWhenNoBtn: number = 14

    //==================================================
    //#region base UI
    public async PrepareDataShow(): Promise<void> {
        this.node.getComponent(UIOpacity).opacity = 255;

        this._isAnimShowingUI = true;
        const time = DataSpeedRace.Instance.GetTimeDisplay();
        if (time > 0) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        } else {
            this.UpdateUITime();
        }

        // update noti prize
        this.UpdateNotiPrize();

        this.infoUIBase.node.active = false;
        this.PrepareAnim();
    }

    public async PrepareDataClose(): Promise<void> {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    public async UIShowDone(): Promise<void> {
        if (!DataSpeedRace.Instance.IsPlayInfo()) {
            DataSpeedRace.Instance.SetShowInfo(true);
            this.infoUIBase.Show();
        }

        await this.AnimUI();


        // check is endTime , if end time show When EndTime , if not show UI suit
        if (!DataSpeedRace.Instance.IsShowResultTime()) {
            // case chưa end time
            this.ShowBottom(true);
        } else {
            // case đã end time
            this.UpdateUIWhenEndTime();
        }

        // check nếu như đang ko show info => tự động show ui nhận thưởng nếu có thể nhận thưởng

        if (!this.infoUIBase.node.active && DataSpeedRace.Instance.HasAnyPrizeProgressCanClaim()) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPEED_RACE_PROGRESS, 1);
        }
    }

    public async UICloseDone(): Promise<void> {
        // emit keep continue tut
        if (this._dataCustom != null) {
            const dataKeepTutAndReceive: IUIKeepTutAndReceiveLobby = this._dataCustom.find(data => instanceOfIUIKeepTutAndReceiveLobby(data));
            if (dataKeepTutAndReceive != null && dataKeepTutAndReceive.canKeepTutAndReceiveLobby) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
    }

    protected onEnable(): void {
        clientEvent.on(CONFIG_SR.UPDATE_NOTI_PRIZE, this.UpdateNotiPrize, this);
        clientEvent.on(CONFIG_SR.UPDATE_TEXT_BTN_SR, this.UpdateTextBtnSr, this);
    }

    protected start(): void {
        // set anchor view cho bubble notification để kích hoạt chế độ auto choice bubble
        this.bubbleSys.SetAnchorView(this.listBot.nView.worldPosition);
    }

    protected onDisable(): void {
        clientEvent.off(CONFIG_SR.UPDATE_UI_WHEN_END_TIME, this.UpdateUIWhenEndTime, this);
        clientEvent.off(CONFIG_SR.UPDATE_NOTI_PRIZE, this.UpdateNotiPrize, this);
        clientEvent.off(CONFIG_SR.UPDATE_TEXT_BTN_SR, this.UpdateTextBtnSr, this);
        this.bubbleSys.ForceClose();
    }
    //#endregion base UI
    //==================================================

    //=======================================
    //#region anim
    private PrepareAnim() {
        const progressBeforePlayAnim = DataSpeedRace.Instance.GetProgressForPlayAnimUI();
        // ===== Header ======
        const isEndEvent = DataSpeedRace.Instance.IsEndEvent();
        this.ShowHeader(false, isEndEvent);

        // save new Data
        this._progressAnim = -1;
        const infoPlayerNow = DataSpeedRace.Instance.GetInfoPlayerNow();
        if (infoPlayerNow != null) {
            if (progressBeforePlayAnim < infoPlayerNow.progress) {
                this._progressAnim = progressBeforePlayAnim;
                DataSpeedRace.Instance.SetProgressForPlayAnimUI(infoPlayerNow.progress, false);
                DataSpeedRace.Instance.SetIndexMutilplyForPlayAnimUI(DataSpeedRace.Instance.GetIndexMutilply())
            }
        }

        // ===== bottom =======
        const widgetCom = this.listBot.node.getComponent(Widget);
        const widgetAnchor = this.listBot.param.nAnchor.getComponent(Widget);
        if (DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.WAIT_RECEIVE || DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.END_EVENT) {
            this.UpdateTextBtnSr();
            this.nBtnClose.active = false;
            widgetCom.bottom = this.widgetBottomWhenHaveBtn;
            widgetAnchor.bottom = this.widgetBtmAnchorWhenHaveBtn;
        } else {
            this.nBtnClose.active = true;
            this.nBtnClaimPrizeSummery.active = false;
            widgetCom.bottom = this.widgetBottomWhenNoBtn;
            widgetAnchor.bottom = this.widgetBtmAnchorWhenNoBtn;
        }

        // =====  scrollView =========
        this.listBot.InitData();

        this.UpdateWidgetSv();
    }

    private async UpdateWidgetSv() {
        this.listBot.getComponent(Widget).updateAlignment();
        this.listBot.nView.getComponent(Widget).updateAlignment();
    }

    private async AnimUI() {
        if (!await this.listBot.AnimScroll(this._progressAnim)) {
            this.listBot.ScrollToPlayer();
        }
        // anim list bot
        this._isAnimShowingUI = false;

        // check if end time => call updateUI 
        // call listen update UI
        if (DataSpeedRace.Instance.IsShowResultTime()) {
            this.UpdateUIWhenEndTime();
        } else {
            this.RegisterListenUpdateUIReceive();
        }
    }

    private async ShowHeader(useAnim: boolean = false, isEndTime: boolean, progressCustom: number = -1) {
        //=======================
        // case not use anim
        if (!useAnim) {
            // ========= progress ===============
            let progressCheck = progressCustom > 0 ? progressCustom : DataSpeedRace.Instance.GetInfoPlayerNow().progress;
            const dataProgressNow = DataSpeedRace.Instance.GetProgressToDisplay(progressCheck);
            const dataPrize = DataSpeedRace.Instance.GetPrizeProgress(dataProgressNow.progressNow);
            this.st_pbSpeedRace.progress = dataProgressNow.percent;
            this.st_lbProgress.string = `${dataProgressNow.progressNow}/${dataProgressNow.totalNext}`;
            if (dataPrize != null && dataPrize.next != null) {
                const prizeDisplay = dataPrize.next[0];
                if (prizeDisplay != null) {
                    this.st_lbNumPrize.string = prizeDisplay.GetStringValue_2();
                    this.st_spPrize.spriteFrame = this.listSfItem[prizeDisplay.typePrize];
                }
            } else {
                // show the last prize can receive
                const listPrize = DataSpeedRace.Instance.GetAllPrizeProgress();
                const prizeDisplay = listPrize[listPrize.length - 1].prizes[0]; // get last prize can receive
                if (prizeDisplay != null) {
                    this.st_lbNumPrize.string = prizeDisplay.GetStringValue_2();
                    this.st_spPrize.spriteFrame = this.listSfItem[prizeDisplay.typePrize];
                }
            }


            // update data
            if (isEndTime) {
                // update progress and reward depend on the rank
                const infoPlayerNow = DataSpeedRace.Instance.GetInfoPlayerNow(true)
                this.et_lbRank.string = `#${infoPlayerNow.rank + 1}`;
                const rankPlayer = infoPlayerNow.rank;
                const prizeSuitRank = DataSpeedRace.Instance.GetPrizeRank(rankPlayer);


                switch (true) {
                    case prizeSuitRank != null && rankPlayer < 3:
                        this.et_chest.node.active = true;
                        this.et_light.active = true;
                        this.et_list_node_item.forEach(item => item.active = false);
                        this.et_nLbNoPrize.active = false;

                        this.et_chest.spriteFrame = this.listSfChest[rankPlayer];
                        break;
                    case prizeSuitRank != null:
                        this.et_chest.node.active = false;
                        this.et_light.active = true;
                        this.et_nLbNoPrize.active = false;
                        this.et_list_node_item.forEach(item => item.active = true);

                        const prizeDisplay = prizeSuitRank[0];
                        this.et_lbNumPrize.string = prizeDisplay.typePrize != TYPE_PRIZE.MONEY ? prizeDisplay.GetStringValue_2() : prizeDisplay.GetStringValue();
                        this.et_spPrize.spriteFrame = this.listSfItem[prizeDisplay.typePrize]
                        break;
                    default:
                        this.et_chest.node.active = false;
                        this.et_light.active = false;
                        this.et_list_node_item.forEach(item => item.active = false);
                        this.et_nLbNoPrize.active = true;
                        break;
                }

                this.listNHeaderInTime.forEach(item => item.active = !isEndTime);
                this.listNHeaderEndTime.forEach(item => {
                    // chỉ control những đối tượng còn lại , ngoài trừ chest và item đã dc control ở trên
                    if (item != this.et_chest.node && this.et_list_node_item.findIndex(check => check == item) == -1
                        && item != this.et_nLbNoPrize && item != this.et_light) {
                        item.active = isEndTime
                    }
                });
            } else {
                // ===== progress multiply ========
                this.srProgressSys.SetBig(DataSpeedRace.Instance.GetIndexMutilply())

                this.listNHeaderEndTime.forEach(item => item.active = isEndTime);
                this.listNHeaderInTime.forEach(item => item.active = !isEndTime);
            }
        }

        //====================
        // case use anim
        if (useAnim) {
            // chạy anim player move đến vị trí chính xác của họ
            this.listNHeaderEndTime.forEach(item => item.active = true);
            this.listNHeaderInTime.forEach(item => item.active = false);
            return;
        }
    }

    private ShowBottom(isUseAnim: boolean = false) {
        const statusEvent = DataSpeedRace.Instance.GetState
        const widgetCom = this.listBot.node.getComponent(Widget)
        const self = this;
        // check can show BtnClaim
        const isStatusCanShowEvent = statusEvent == STATE_SPEED_RACE.WAIT_RECEIVE || statusEvent == STATE_SPEED_RACE.END_EVENT;
        let canShowBtnClaim = !DataSpeedRace.Instance.IsReceivePrizeSummery() && DataSpeedRace.Instance.GetPrizeRank(DataSpeedRace.Instance.GetRankPlayerNow()) != null
        // console.log(canShowBtnClaim, DataSpeedRace.Instance.IsReceivePrizeSummery(), statusEvent);

        switch (true) {
            // case anim, nhận thưởng
            case isUseAnim && isStatusCanShowEvent:
                this.nBtnClose.active = false;

                // anim show btn
                tween(widgetCom)
                    .to(0.3, { bottom: this.widgetBottomWhenHaveBtn }, {
                        onUpdate(target, ratio) {
                            self.listBot.node.getComponent(Widget).updateAlignment();
                            self.listBot.nView.getComponent(Widget).updateAlignment();
                            self.listBot.param.nAnchor.getComponent(Widget).updateAlignment();
                        },
                    })
                    .start();
                if (!this.nBtnClaimPrizeSummery.active) {
                    const opaComBtnClaim = this.nBtnClaimPrizeSummery.getComponent(UIOpacity);
                    opaComBtnClaim.opacity = 0;
                    this.UpdateTextBtnSr();
                    this.nBtnClaimPrizeSummery.active = true;
                    tween(opaComBtnClaim)
                        .to(0.3, { opacity: 255 })
                        .start();
                }
                break;
            // case ko anim , ko nhận thưởng
            case !isUseAnim && !canShowBtnClaim && isStatusCanShowEvent:
                this.nBtnClose.active = true;
                this.nBtnClaimPrizeSummery.active = false;
                widgetCom.bottom = 0;
                widgetCom.updateAlignment();
                this.listBot.nView.getComponent(Widget).updateAlignment();
                break;
            // case có anim , nhận thưởng
            case !isUseAnim && canShowBtnClaim && isStatusCanShowEvent:
                this.UpdateTextBtnSr();
                this.nBtnClaimPrizeSummery.active = true;
                widgetCom.bottom = this.widgetBottomWhenHaveBtn;
                widgetCom.updateAlignment();
                this.listBot.nView.getComponent(Widget).updateAlignment();
                break;
        }
    }
    //#endregion anim
    //=======================================

    private UpdateUIWhenEndTime() {
        if (this._isAnimShowingUI) { return; }
        // cập nhật UI bằng cách thay header
        this.ShowHeader(false, true);
        this.ShowBottom(true);
    }

    private UpdateNotiPrize() {
        // check xem có prize nào để nhận thưởng hay không? nếu không có unactive noti đi
        const hasAnyPrizeCanReceive: boolean = DataSpeedRace.Instance.HasAnyPrizeProgressCanClaim();
        this.nNoti.active = hasAnyPrizeCanReceive;
    }


    /**
     * This func will be call in 2 case
     * Case1: click claim in progress UISrProgress
     * Case2: when call update UI if it end event
     */
    private UpdateTextBtnSr() {
        const hasAnyPrizeProgressNotReceiveYet = DataSpeedRace.Instance.HasAnyPrizeProgressCanClaim();
        const isReceivePrizeRank = DataSpeedRace.Instance.GetPrizeRank(DataSpeedRace.Instance.GetInfoPlayerNow().rank) != null;

        // chỉ khi nhận thưởng bởi rank mới có chữ claim
        if (isReceivePrizeRank) {
            this.lbTextBtnClaim.string = this.lbShadowTextBtnClaim.string = "Claim";
        } else {
            this.lbTextBtnClaim.string = this.lbShadowTextBtnClaim.string = "Try Again";
        }
    }

    //=======================================
    //#region self
    private UpdateUITime() {
        const time = DataSpeedRace.Instance.GetTimeDisplay();
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }

    private HideUI() {
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        const timeOpa = 0.2;
        tween(this.node.getComponent(UIOpacity))
            .to(timeOpa, { opacity: 0 })
            .call(() => {
                this.node.active = false;
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            })
            .start();
    }

    private ShowUI() {
        this.node.active = true;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        const timeOpa = 0.2;
        tween(this.node.getComponent(UIOpacity))
            .to(timeOpa, { opacity: 255 })
            .call(() => { clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY); })
            .start();
    }

    private RegisterListenUpdateUIReceive() {
        clientEvent.on(CONFIG_SR.UPDATE_UI_WHEN_END_TIME, this.UpdateUIWhenEndTime, this);
    }
    //#endregion self
    //=======================================

    //=======================================
    //#region btn
    private OnBtnInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UISpeedRace");
        this.infoUIBase.Show();
    }

    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISpeedRace");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SPEED_RACE, 2);
    }

    private OnBtnShowUIProgressPrize() {
        LogEventManager.Instance.logButtonClick(`progress`, "UISpeedRace");
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPEED_RACE_PROGRESS, 1);
    }

    private async OnBtnClaim() {
        LogEventManager.Instance.logButtonClick(`Claim`, "UISpeedRace");
        // emit show UIReceivePrize
        const rankPlayer = DataSpeedRace.Instance.GetRankPlayerNow();
        const listPrizeReceiveRank = DataSpeedRace.Instance.GetPrizeRank(rankPlayer);
        const listPrizeProgress = DataSpeedRace.Instance.GetAllPrizeProgressCanClaim();

        const resultPrize = addPrizeToList(Utils.CloneListDeep(listPrizeReceiveRank), Utils.CloneListDeep(listPrizeProgress));
        const statusNow = DataSpeedRace.Instance.GetState;
        // check 2 case in here
        // trong trường hợp đang trong thời gian chờ nhận thưởng => chỉ ẩn đi và sau khi nhận thưởng xong hiển thị lại
        // trong trường hợp đã kết thúc event => closeUI => nhận thưởng => hiển thị UIPrepareSpeedRace
        if (statusNow == STATE_SPEED_RACE.WAIT_RECEIVE || statusNow == STATE_SPEED_RACE.END_EVENT) {
            this.HideUI();
        }
        DataSpeedRace.Instance.SetReceivePrizeSummery(true);
        DataSpeedRace.Instance.UpdateStateEvent(STATE_SPEED_RACE.END_EVENT);
        clientEvent.dispatchEvent(CONFIG_SR.TRY_CHANGE_TITLE);
        if (resultPrize != null && resultPrize.length > 0) {
            PrizeSys.Instance.AddPrize(resultPrize, 'PrizeSpeedRank', true, false);
            await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SPEED_RACE, resultPrize, "PrizeSpeedRank", rankPlayer, null, "Speed Race");
        }

        const newStatusNow = DataSpeedRace.Instance.GetState;

        switch (true) {
            case newStatusNow == STATE_SPEED_RACE.WAIT_RECEIVE:
            //     this.ShowUI()
            //     this.ShowBottom()
            //     break;
            case newStatusNow == STATE_SPEED_RACE.END_EVENT:
                // close UI này và hiển thị UI prepare to speedRace
                const preDataCustom = this._dataCustom != null ? this._dataCustom as any[] : null;
                // set lại data custom = null => để khi close sẽ không chạy tiếp luồng logic trong lobby
                this._dataCustom = null;
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SPEED_RACE, 2);
                let dataSend: any[] = [];
                if (preDataCustom != null) {
                    const oldDataaKeetTutAndReceiveLobby = preDataCustom.find(data => instanceOfIUIKeepTutAndReceiveLobby(data));
                    oldDataaKeetTutAndReceiveLobby != null && dataSend.push(oldDataaKeetTutAndReceiveLobby);
                }

                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPEED_RACE_PREPARE, 1, true, dataSend);
                break;
            default:
                this.ShowUI();
                this.ShowBottom();
                break;
        }
    }

    private OnBtnShowPrizeChest() {
        LogEventManager.Instance.logButtonClick(`prize`, "ChestHeaderUISpeedRace");
        // noti show prize
        const indexPlayer = DataSpeedRace.Instance.GetRankPlayerNow();
        const prizePlayer = DataSpeedRace.Instance.GetPrizeRank(indexPlayer);
        if (prizePlayer == null) { return; }

        // noti prize
        clientEvent.dispatchEvent(CONFIG_SR.NOTIFICATION.ITEMS
            , Array.from(prizePlayer)
            , TYPE_BUBBLE.BOTTOM_RIGHT
            , this.et_chest.node.worldPosition.clone()
            , true
            , this.node
        )

    }

    private OnBtnTest() {
        let indexRandom = randomRangeInt(0, 50);
        console.log("indexRandom", indexRandom);
        this.listBot.ScrollToIndex(indexRandom, false);
    }
    //#endregion btn
    //=======================================
}


