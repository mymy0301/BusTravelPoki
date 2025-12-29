import { _decorator, Component, Label, Node, ProgressBar, Sprite, SpriteFrame, tween, Tween, Vec3 } from 'cc';
import { InfoItemProgressSR, TYPE_EVENT_GAME, TYPE_PRIZE } from '../../../Utils/Types';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { ItemUltimateSV } from '../../../Common/UltimateScrollView/ItemUltimateSV';
import * as I18n from 'db://i18n/LanguageData';
import { clientEvent } from '../../../framework/clientEvent';
import { CONFIG_SR } from './TypeEventSpeedRace';
import { MConst } from '../../../Const/MConst';
import { TYPE_GAME } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

enum STATE_ITEM_INFO_PROGRESS_SR {
    LOCK,
    WAIT_TO_CLAIM,
    CLAIMED
}

@ccclass('ItemUIInfoProgressSR')
export class ItemUIInfoProgressSR extends ItemUltimateSV {
    @property(Sprite) spPrize: Sprite;
    @property(Label) lbPrize: Label;
    @property(Label) lbIndex: Label;
    @property(Sprite) sp_progress: Sprite;
    @property(Node) nItem: Node;
    @property(Node) nIconLock: Node;

    @property(Sprite) spBgIndex: Sprite;
    @property(SpriteFrame) listSfBgIndex: SpriteFrame[] = [];

    @property(Node) listN_LOCK: Node[] = [];
    @property(Node) listN_WAIT_TO_CLAIM: Node[] = [];
    @property(Node) listN_CLAIMED: Node[] = [];

    private _cbGetImagePrize: CallableFunction;
    private _cbReceiveItem: CallableFunction;
    private _stateItem: STATE_ITEM_INFO_PROGRESS_SR = STATE_ITEM_INFO_PROGRESS_SR.LOCK;
    private _dataPrize: InfoItemProgressSR = null;

    public RegisterCb(cbGetImagePrize: CallableFunction, cbReceiveItem: CallableFunction) {
        this._cbGetImagePrize = cbGetImagePrize;
        this._cbReceiveItem = cbReceiveItem;
    }

    public SetUp(data: InfoItemProgressSR) {
        this._dataPrize = data;

        const progressPercent = DataSpeedRace.Instance.GetPercentProgressWithIndex(data.index);

        this.lbIndex.string = (data.index + 1).toString();
        const prize = data.prizes[0];
        this.lbPrize.string = prize.typePrize != TYPE_PRIZE.MONEY ? prize.GetStringValue_2() : prize.GetStringValue();
        this.spPrize.spriteFrame = this._cbGetImagePrize(prize.typePrize, prize.typeReceivePrize);
        this.sp_progress.fillRange = progressPercent;

        // check status prize
        switch (true) {
            case progressPercent < 1:
                this.UdpateState(STATE_ITEM_INFO_PROGRESS_SR.LOCK);
                break;
            case progressPercent == 1 && DataSpeedRace.Instance.IsClaimedPrizeProgress(data.index):
                this.UdpateState(STATE_ITEM_INFO_PROGRESS_SR.CLAIMED);
                break;
            case progressPercent == 1 && !DataSpeedRace.Instance.IsClaimedPrizeProgress(data.index):
                this.UdpateState(STATE_ITEM_INFO_PROGRESS_SR.WAIT_TO_CLAIM);
                break;
        }
    }

    public TryReUpdateData() {
        if (this._dataPrize != null) {
            this.SetUp(this._dataPrize);
        }
    }

    public UdpateState(newState: STATE_ITEM_INFO_PROGRESS_SR) {
        this._stateItem = newState;

        switch (this._stateItem) {
            case STATE_ITEM_INFO_PROGRESS_SR.LOCK:
                this.listN_WAIT_TO_CLAIM.forEach(item => item.active = false);
                this.listN_CLAIMED.forEach(item => item.active = false);
                this.listN_LOCK.forEach(item => item.active = true);
                this.spBgIndex.spriteFrame = this.listSfBgIndex[1];
                break;
            case STATE_ITEM_INFO_PROGRESS_SR.WAIT_TO_CLAIM:
                this.listN_LOCK.forEach(item => item.active = false);
                this.listN_CLAIMED.forEach(item => item.active = false);
                this.listN_WAIT_TO_CLAIM.forEach(item => item.active = true);
                this.nIconLock.active = false;
                this.spBgIndex.spriteFrame = this.listSfBgIndex[0];
                break;
            case STATE_ITEM_INFO_PROGRESS_SR.CLAIMED:
                this.listN_LOCK.forEach(item => item.active = false);
                this.listN_WAIT_TO_CLAIM.forEach(item => item.active = false);
                this.listN_CLAIMED.forEach(item => item.active = true);
                this.spBgIndex.spriteFrame = this.listSfBgIndex[0];
                break;
        }
    }

    private AnimLock() {
        Tween.stopAllByTarget(this.nIconLock);
        this.nIconLock.angle = 0;
        const timeAnim = 0.6;
        tween(this.nIconLock)
            .to(timeAnim / 24, { angle: 20 }, { easing: 'smooth' })
            .to(timeAnim / 12, { angle: -20 }, { easing: 'smooth' })
            .to(timeAnim / 12, { angle: 20 }, { easing: 'smooth' })
            .to(timeAnim / 12, { angle: -20 }, { easing: 'smooth' })
            .to(timeAnim / 12, { angle: 20 }, { easing: 'smooth' })
            .to(timeAnim / 24, { angle: 0 }, { easing: 'smooth' })
            .start();
    }

    public OnBtnClaim() {
        // log event
        // nhận thưởng, save đã nhân thưởng
        // trượt prize lên nhận thưởng như trong levelPass
        // thay đổi giao diện

        LogEventManager.Instance.logButtonClick(`claim`, "ItemProgress_SpeedRace");

        PrizeSys.Instance.AddPrize(this._dataPrize.prizes, 'ItemProgress_SpeedRace', false, true);
        DataSpeedRace.Instance.ClaimPrizeProgress(this._dataPrize.index);


        const visualPrize: Node = this.nItem;
        const wPos: Vec3 = this.nItem.worldPosition.clone();
        this._cbReceiveItem(visualPrize, wPos);

        this.UdpateState(STATE_ITEM_INFO_PROGRESS_SR.CLAIMED);

        clientEvent.dispatchEvent(CONFIG_SR.UPDATE_NOTI_PRIZE);
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SPEED_RACE);
    }

    public OnBtnClick() {
        // check status
        switch (this._stateItem) {
            case STATE_ITEM_INFO_PROGRESS_SR.LOCK:
                // lắc ổ khóa và thông báo hãy chơi tiếp để mở khóa
                this.AnimLock();
                break;
            case STATE_ITEM_INFO_PROGRESS_SR.CLAIMED:
                break;
            case STATE_ITEM_INFO_PROGRESS_SR.WAIT_TO_CLAIM:
                this.OnBtnClaim();
                break;
        }
    }
}


