import { _decorator, CCInteger, Component, Label, Node, tween, Vec3 } from 'cc';
import { AnimChestSys } from '../../../AnimsPrefab/AnimChestSys';
import { clientEvent } from '../../../framework/clientEvent';
import { ConvertEnum_NameAnimChest_idle_after_open, ConvertEnum_NameAnimChest_idle_close, ConvertEnum_NameAnimChest_wait_to_open, Enum_NameAnimChest, NameAnimChest_idle_close, NameAnimChest_wait_to_open } from '../../../Utils/TypeAnimChest';
import { DataSpinSys } from '../../../DataBase/DataSpinSys';
import { MConst } from '../../../Const/MConst';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { IInfoPrizeProgressSpin, IPrize, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

export enum STATE_UI_PRIZE_SPIN {
    CAN_NOT_RECEIVE,
    WAIT_TO_RECEIVE,
    RECEIVED
}

@ccclass('UIPrizeProgressSpinReward')
export class UIPrizeProgressSpinReward extends Component {
    @property(Node) nParticle: Node;
    @property(Node) nListDaily: Node;
    @property(CCInteger) typeUIPrize: number = 0; // check logic in update function to know typeUIPrize decide to what
    @property(AnimChestSys) animChestSys: AnimChestSys;
    @property(Label) lbProgress: Label;
    @property({ type: Enum_NameAnimChest }) typeChest = Enum_NameAnimChest.Box_red
    private _state: STATE_UI_PRIZE_SPIN = STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE; public get State(): STATE_UI_PRIZE_SPIN { return this._state; }

    private readonly timeDelayNextAnim = 2;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SPIN.ITEM.EVENT_UPDATE_UI, this.UpdateUI, this);
        this.ChangeState(STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SPIN.ITEM.EVENT_UPDATE_UI, this.UpdateUI, this);
    }

    //#region self func
    private ChangeState(state: STATE_UI_PRIZE_SPIN) {
        this._state = state;

        switch (state) {
            case STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE:
                this.nParticle.active = false;
                this.nListDaily.active = false;
                const nameAnimClose = ConvertEnum_NameAnimChest_idle_close(this.typeChest);
                this.animChestSys.PlayAnim(nameAnimClose);
                this.node.off(Node.EventType.TOUCH_END, this.onBtnClaim, this);
                this.node.on(Node.EventType.TOUCH_END, this.onBtnShowInfoSelf, this);
                break;
            case STATE_UI_PRIZE_SPIN.WAIT_TO_RECEIVE:
                this.nParticle.active = true;
                this.nListDaily.scale = Vec3.ZERO;
                const timeScaleUp = 0.5;
                this.nListDaily.active = true;
                const nameAnimWaitToOpen = ConvertEnum_NameAnimChest_wait_to_open(this.typeChest);
                this.animChestSys.PlayAnimLoopWithDelay(nameAnimWaitToOpen, this.timeDelayNextAnim);
                tween(this.nListDaily)
                    .to(timeScaleUp, { scale: Vec3.ONE }, { easing: 'bounceOut' })
                    .call(this.AnimLoopWhenCanReceive)
                    .start();
                this.node.on(Node.EventType.TOUCH_END, this.onBtnClaim, this);
                this.node.off(Node.EventType.TOUCH_END, this.onBtnShowInfoSelf, this);
                break;
            case STATE_UI_PRIZE_SPIN.RECEIVED:
                this.nParticle.active = false;
                this.nListDaily.active = false;
                const nameAnimAfterOpen = ConvertEnum_NameAnimChest_idle_after_open(this.typeChest);
                this.animChestSys.PlayAnim(nameAnimAfterOpen);
                this.node.off(Node.EventType.TOUCH_END, this.onBtnClaim, this);
                this.node.off(Node.EventType.TOUCH_END, this.onBtnShowInfoSelf, this);
                break;
        }
    }

    public UpdateUIVisual(data: IInfoPrizeProgressSpin, state: STATE_UI_PRIZE_SPIN) {
        this.lbProgress.string = data.progress.toString();
        this.ChangeState(state);
    }

    public async UpdateUI(autoReceivePrizeIfChangeState: boolean = false, callbackReceivePrize: CallableFunction = null) {
        /**
         * logic
         * check each type prize quest => if it reach progress => unlock or change state
         */
        let canOpen: boolean = false;
        const progressNow = DataSpinSys.Instance.ProgressSpinNow();
        const wasReceivedPrized: boolean = DataSpinSys.Instance.IsPrizeProgressWasReceive(this.typeUIPrize);

        let indexPrizeCanReceived = DataSpinSys.Instance.LogicCheckIndexPrizeProgressCanReceived(progressNow);
        canOpen = indexPrizeCanReceived != -1 && this.typeUIPrize <= indexPrizeCanReceived;

        // check if can open and diff state => update state
        if (canOpen) {
            if (this._state == STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE && !wasReceivedPrized) {
                if (this._state == STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE && autoReceivePrizeIfChangeState) {
                    this.ChangeState(STATE_UI_PRIZE_SPIN.WAIT_TO_RECEIVE);
                    if (callbackReceivePrize != null) {
                        callbackReceivePrize();
                        await this.ReceivePrize();
                    }
                } else {
                    this.ChangeState(STATE_UI_PRIZE_SPIN.WAIT_TO_RECEIVE);
                }
            } else if (wasReceivedPrized) {
                this.ChangeState(STATE_UI_PRIZE_SPIN.RECEIVED);
            }
        } else {
            if (this._state != STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE) {
                this.ChangeState(STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE);
            }
        }
    }

    private AnimLoopWhenCanReceive() {
        
    }

    //#endregion

    private async onBtnClaim() {
        LogEventManager.Instance.logButtonClick(`prize_progress`, "UISpin");

        /**
         * logic play anim claim
         * make this UI to opacity = 0
         * emit event lobby Prize for DailyQuest
         * after done anim receive prize => set the UI opacity to 255 again
         * call save quest data + change state prize
         */

        // LogEventManager.Instance.logEventQuestReward(this.typeUIPrize);
        clientEvent.dispatchEvent(MConst.EVENT_SPIN.HIDE_SPIN);
        const listPrize = DataSpinSys.Instance.GetPrizeProgressAtIndex(this.typeUIPrize);
        DataSpinSys.Instance.ClaimPrizeProgress(this.typeUIPrize);
        this.ChangeState(STATE_UI_PRIZE_SPIN.RECEIVED);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SPIN, listPrize, "UISpin_progress", null, null, "Spin");

        // kiểm tra đã nhận hết quà của mùa này chưa?
        // nếu đã nhận hết quà của mùa này rùi thì reset lại UI progress
        clientEvent.dispatchEvent(MConst.EVENT_SPIN.CHECK_RESET_30_DAYS_SPIN);

        clientEvent.dispatchEvent(MConst.EVENT_SPIN.SHOW_SPIN);
    }

    /**
     * function này được gọi một cách tự động nhận thưởng
     */
    public async ReceivePrize() {
        const listPrize = DataSpinSys.Instance.GetPrizeProgressAtIndex(this.typeUIPrize);
        DataSpinSys.Instance.ClaimPrizeProgress(this.typeUIPrize);
        this.ChangeState(STATE_UI_PRIZE_SPIN.RECEIVED);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SPIN, listPrize, "UISpin_progress", null, null, "Spin");
    }

    private async onBtnShowInfoSelf() {
        const listPrize: IPrize[] = DataSpinSys.Instance.GetPrizeProgressAtIndex(this.typeUIPrize);
        clientEvent.dispatchEvent(MConst.EVENT_SPIN.NOTIFICATION.SHOW_NOTIFICATION, listPrize, this.node.worldPosition.clone().add3f(0, 50, 0))
    }
}


