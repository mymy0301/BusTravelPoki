import { _decorator, Component, Label, Node, randomRangeInt, Sprite, SpriteFrame, tween, UIOpacity, Vec3, Widget } from 'cc';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { UIHRListBot } from './HatRace/UIHRListBot';
import { HRProgressSys } from './HatRace/HRProgressSys';
import { BubbleSys } from '../Others/Bubble/BubbleSys';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../../Const/MConst';
import { EVENT_HAT_RACE, STATE_HAT_RACE } from './HatRace/TypeHatRace';
import { PageItem } from '../../../Common/UltimatePageView/PageItem';
import { TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import * as I18n from 'db://i18n/LanguageData';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
import { AnimLRReceivePrize } from './LightRoad/AnimLRReceivePrize';
import { IInfoChestLightRoad } from './LightRoad/TypeLightRoad';
import { EVENT_CHRISTMAS_EVENT } from './TypeChristmasEvent';
import { DataLightRoad_christ } from '../../../DataBase/DataLightRoad_christ';
const { ccclass, property } = _decorator;

@ccclass('PageHatRace_UIChristmasEvent')
export class PageHatRace_UIChristmasEvent extends PageItem {
    @property(Node) nBtnClose: Node;
    @property(Node) nBtnClickChangeTabLR: Node;

    @property(Label) lbTime: Label;
    @property(InfoUIBase) infoUIBase: InfoUIBase;
    @property(UIHRListBot) listBot: UIHRListBot;
    @property(HRProgressSys) hrProgressSys: HRProgressSys;
    @property(BubbleSys) bubbleSys: BubbleSys;
    @property(Node) nBtnClaimPrizeSummery: Node;
    // @property(Node) nBtnContinue: Node;
    @property(Label) lbTextBtnClaim: Label;
    @property(Label) lbShadowTextBtnClaim: Label;
    @property(Node) nTime: Node;
    @property(Node) nTargetPosTime: Node;
    @property(AnimLRReceivePrize) animLRReceivePrize: AnimLRReceivePrize;

    @property({ group: { id: 'resource', name: 'resource' }, type: [SpriteFrame] }) listSfItem: SpriteFrame[] = [];
    @property({ group: { id: 'resource', name: 'resource' }, type: [SpriteFrame] }) listSfChest: SpriteFrame[] = [];

    @property({ group: { id: 'endTime', name: 'endTime' }, type: Label }) et_lbRank: Label;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Label }) et_lbNumPrize: Label;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Sprite }) et_spPrize: Sprite;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Sprite }) et_chest: Sprite;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Node }) et_light: Node;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Node }) et_nLbNoPrize: Node;
    @property({ group: { id: 'endTime', name: 'endTime' }, type: Node }) et_list_node_item: Node[] = [];

    @property(Node) listNHeaderInTime: Node[] = [];
    @property(Node) listNHeaderEndTime: Node[] = [];

    private _isAnimShowingUI: boolean = false;
    private _progressAnim: number = -1;

    private readonly widgetBottomWhenHaveBtn: number = 200;
    private readonly widgetBottomWhenNoBtn: number = 30;

    private readonly widgetBtmAnchorWhenHaveBtn: number = 0;
    private readonly widgetBtmAnchorWhenNoBtn: number = 14

    private _cbHideSelf: CallableFunction = null;
    private _cbShowSelf: CallableFunction = null;

    //==================================================
    //#region base UI + overide
    override RegisterCb(cbShow: CallableFunction, cbHide: CallableFunction) {
        this._cbShowSelf = cbShow;
        this._cbHideSelf = cbHide;
    }

    public override async CBShowDone(): Promise<void> {

        const isShowResultTime = DataHatRace_christ.Instance.IsShowResultTime();
        // chỉ có thể show info nếu đang trong case ko phải show end time
        if (!isShowResultTime) {
            if (!DataHatRace_christ.Instance.IsPlayTut()) {
                DataHatRace_christ.Instance.SetPlayTut(true);
                this.infoUIBase.Show();
            }
        }

        await this.AnimUI();

        // check is endTime , if end time show When EndTime , if not show UI suit
        if (!isShowResultTime) {
            // case chưa end time
            this.ShowBottom(true);
        } else {
            // case đã end time
            this.UpdateUIWhenEndTime();
        }
    }

    public override async CBPrepareShow(): Promise<void> {
        // return;
        this._isAnimShowingUI = true;
        this.infoUIBase.node.active = false;

        this.PrepareAnim();
    }

    protected onEnable(): void {
        if (DataHatRace_christ.Instance.State == STATE_HAT_RACE.JOINING) {
            this.TryRegisterTime();
        } else {
            this.UpdateUITime();
        }
        this.UpdateTextBtnSr();
    }

    protected start(): void {
        // this.nTime.worldPosition = new Vec3(this.nTargetPosTime.worldPosition.x, this.nTime.worldPosition.y, 0);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        clientEvent.off(EVENT_HAT_RACE.UPDATE_UI_WHEN_END_TIME, this.UpdateUIWhenEndTime, this);
        clientEvent.off(EVENT_HAT_RACE.UPDATE_TEXT_BTN_SR, this.UpdateTextBtnSr, this);
        this.bubbleSys.ForceClose();
    }

    public SetCb(cbHideUI: CallableFunction) {
        this._cbHideSelf = cbHideUI;
    }
    //#endregion base UI + overide
    //==================================================

    //=======================================
    //#region anim
    private PrepareAnim() {
        // trong trường hợp user mở đưuọc trang này trong khi vừa thua và chưa xem diễn hoạt thua thì ta sẽ force cho điểm số thua
        if (DataHatRace_christ.Instance.GetIndexOldMutilply() > DataHatRace_christ.Instance.GetIndexMutilply()) {
            DataHatRace_christ.Instance.UpdateIndexMultiply();
        }

        const progressBeforePlayAnim = DataHatRace_christ.Instance.GetProgressForPlayAnimUI();
        // ===== Header ======
        const isEndEvent = DataHatRace_christ.Instance.IsEndEvent();
        this.ShowHeader(false, isEndEvent);

        // save new Data
        this._progressAnim = -1;
        // chỉ chạy anim trong trường hợp progress nhỏ hơn và vị trí của player ko phải top 1
        const infoPlayerNow = DataHatRace_christ.Instance.GetInfoPlayerNow()
        const valid1 = progressBeforePlayAnim < infoPlayerNow.progress;
        const dataInfoPlayerNow = DataHatRace_christ.Instance.GetInfoPlayerNow();
        if (valid1 && dataInfoPlayerNow != null) {
            this._progressAnim = progressBeforePlayAnim;
            DataHatRace_christ.Instance.SetProgressForPlayAnimUI(dataInfoPlayerNow.progress, false);
            DataHatRace_christ.Instance.SetIndexMutilplyForPlayAnimUI(DataHatRace_christ.Instance.GetIndexMutilply());
            DataHatRace_christ.Instance.UpdateProgressPlayer();
        }

        // ===== bottom =======
        const widgetCom = this.listBot.node.getComponent(Widget);
        const widgetAnchor = this.listBot.param.nAnchor.getComponent(Widget);
        if (DataHatRace_christ.Instance.State == STATE_HAT_RACE.WAIT_RECEIVE || DataHatRace_christ.Instance.State == STATE_HAT_RACE.END_EVENT) {
            this.nBtnClose.active = false;
            this.nBtnClickChangeTabLR.active = false;
            widgetCom.bottom = this.widgetBottomWhenHaveBtn;
            widgetAnchor.bottom = this.widgetBtmAnchorWhenHaveBtn;
        } else {
            this.nBtnClose.active = true;
            this.nBtnClickChangeTabLR.active = true;
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
        this.listBot.nBlockView.active = true;
        const isUsingScroll = await this.listBot.AnimScroll(this._progressAnim)
        if (!isUsingScroll) {
            this.listBot.ScrollToPlayer();
        }
        this.listBot.nBlockView.active = false;
        // anim list bot
        this._isAnimShowingUI = false;

        // check if end time => call updateUI 
        // call listen update UI
        if (DataHatRace_christ.Instance.IsShowResultTime()) {
            this.UpdateUIWhenEndTime();
        } else {
            this.RegisterListenUpdateUIReceive();
        }
    }

    private async ShowHeader(useAnim: boolean = false, isEndTime: boolean, progressCustom: number = -1) {
        const indexMultiply = DataHatRace_christ.Instance.GetIndexMutilply();

        //=======================
        // case not use anim
        if (!useAnim) {
            // update data
            if (isEndTime) {
                // update progress and reward depend on the rank
                const infoPlayerNow = DataHatRace_christ.Instance.GetInfoPlayerNow(true)
                this.et_lbRank.string = `#${infoPlayerNow.rank + 1}`;
                const rankPlayer = infoPlayerNow.rank;
                const prizeSuitRank = DataHatRace_christ.Instance.GetPrizeRank(rankPlayer);

                this.hrProgressSys.SetBig(indexMultiply, false)

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
                this.hrProgressSys.SetBig(indexMultiply)

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
        const statusEvent = DataHatRace_christ.Instance.State
        const widgetCom = this.listBot.node.getComponent(Widget)
        const self = this;
        // check can show BtnClaim
        const isStatusCanShowEvent = statusEvent == STATE_HAT_RACE.WAIT_RECEIVE || statusEvent == STATE_HAT_RACE.END_EVENT;
        let canShowBtnClaim = !DataHatRace_christ.Instance.IsReceivePrizeSummery() && DataHatRace_christ.Instance.GetPrizeRank(DataHatRace_christ.Instance.GetRankPlayerNow()) != null
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

    /**
     * This func will be call in 2 case
     * Case1: click claim in progress UISrProgress
     * Case2: when call update UI if it end event
     */
    private UpdateTextBtnSr() {
        const infoPlayerNow = DataHatRace_christ.Instance.GetInfoPlayerNow(true);
        if (infoPlayerNow == null) { return; }
        const isReceivePrizeRank = DataHatRace_christ.Instance.GetPrizeRank(infoPlayerNow.rank) != null;

        // chỉ khi nhận thưởng bởi rank mới có chữ claim
        if (isReceivePrizeRank) {
            this.lbTextBtnClaim.string = this.lbShadowTextBtnClaim.string = "Claim";
        } else {
            this.lbTextBtnClaim.string = this.lbShadowTextBtnClaim.string = "Continue";
        }
    }

    //=======================================
    //#region self
    private HideUI() { this._cbHideSelf && this._cbHideSelf(); }
    private ShowUI() { this._cbShowSelf && this._cbShowSelf(); }

    private RegisterListenUpdateUIReceive() {
        clientEvent.on(EVENT_HAT_RACE.UPDATE_UI_WHEN_END_TIME, this.UpdateUIWhenEndTime, this);
    }
    //#endregion self

    //=======================================
    //#region  time
    public TryRegisterTime() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        }
    }

    private UpdateUITime() {
        const time = DataHatRace_christ.Instance.GetTimeDisplay();
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }
    //#endregion time

    //=======================================
    //#region btn
    private OnBtnInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "ChristEvent_HatRace");
        this.infoUIBase.Show();
    }

    private async OnBtnClaim() {
        LogEventManager.Instance.logButtonClick(`Claim`, "ChristEvent_HatRace");
        // emit show UIReceivePrize
        DataHatRace_christ.Instance.UpdateListData();
        const rankPlayer = DataHatRace_christ.Instance.GetRankPlayerNow();
        const listPrizeReceiveRank = DataHatRace_christ.Instance.GetPrizeRank(rankPlayer);

        const resultPrize = listPrizeReceiveRank;

        DataHatRace_christ.Instance.SetReceivePrizeSummery(false);
        DataHatRace_christ.Instance.UpdateStateEvent(STATE_HAT_RACE.END_EVENT);
        clientEvent.dispatchEvent(EVENT_HAT_RACE.TRY_CHANGE_TITLE);

        const validCanCreateNewEvent = DataLightRoad_christ.Instance.GetTimeEndEvent() > 0;

        // NOTE Reset dữ liệu cho vòng lặp mới
        if (validCanCreateNewEvent) {
            DataHatRace_christ.Instance.InitNewRound(true, DataLightRoad_christ.Instance.GetTimeEndEvent());
        }

        // check 2 case in here
        // trong trường hợp user ở home thì trả về giao diện nhận thưởng ở home
        // còn nếu trong trường hợp user ở game thì trả về giao diện nhận thưởng ở game
        // trong trường hợp nhận được hộp quà thì mới chạy anim hiển thị toàn bộ prize => còn nếu trong trường hợp chỉ nhận tiền thì sẽ bay tiền lên nCoin
        let isAnimming = true;

        switch (true) {
            case resultPrize != null && resultPrize.length > 0 && rankPlayer < 3:
                PrizeSys.Instance.AddPrize(resultPrize, 'PrizeHatRace', true, false);

                const infoChest: IInfoChestLightRoad = {
                    id: 0,
                    listPrize: resultPrize,
                    progressRequired: 0,
                    visual: rankPlayer,
                    wPosChest: this.et_chest.node.worldPosition.clone()
                }
                this.animLRReceivePrize.AnimReceivePrizeFromChest('HatRace', infoChest, () => { isAnimming = false });
                await Utils.WaitReceivingDone(() => !isAnimming);
                break;
            // case này chỉ nhận coin
            case resultPrize != null:
                // bắn emit di chuyển coin đến vị trí cần đến ko gọi receivePrizeChest
                clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.SHOW_NCOIN_TICKET);
                PrizeSys.Instance.AddPrize(resultPrize, 'PrizeHatRace', true, false);
                this.animLRReceivePrize.AnimReceiveCoin(this.et_spPrize.node.worldPosition.clone(), resultPrize[0].value, () => { isAnimming = false; })
                await Utils.WaitReceivingDone(() => !isAnimming);
                clientEvent.dispatchEvent(EVENT_CHRISTMAS_EVENT.HIDE_NCOIN_TICKET);
                break;
        }

        if (!validCanCreateNewEvent) {
            // ẩn button claim và btn continue đi
            this.nBtnClaimPrizeSummery.active = false;
            this.nBtnClose.active = true;
        } else {
            // update lại giao diện event
            this.CBPrepareShow();
            this.TryCallDataUntilHaveData();
            this.CBShowDone();

            // cập nhật lại đồng hồ
            this.UpdateUITime();
            this.TryRegisterTime();
        }

    }

    private OnBtnShowPrizeChest() {
        LogEventManager.Instance.logButtonClick(`prize`, "ChestHeaderUIHatRace");
        // noti show prize
        const indexPlayer = DataHatRace_christ.Instance.GetRankPlayerNow();
        const prizePlayer = DataHatRace_christ.Instance.GetPrizeRank(indexPlayer);
        if (prizePlayer == null) { return; }

        // noti prize
        clientEvent.dispatchEvent(EVENT_HAT_RACE.NOTIFICATION_ITEMS
            , Array.from(prizePlayer)
            , TYPE_BUBBLE.BOTTOM_MID
            , this.et_chest.node.worldPosition.clone()
            , true
            , this.node
        )

    }
    //#endregion btn
    //=======================================
}


