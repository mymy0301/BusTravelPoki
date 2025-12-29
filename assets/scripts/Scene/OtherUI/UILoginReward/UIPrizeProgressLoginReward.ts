import { _decorator, CCBoolean, CCInteger, Component, Label, Node, tween, Vec3 } from 'cc';
import { AnimChestSys } from '../../../AnimsPrefab/AnimChestSys';
import { clientEvent } from '../../../framework/clientEvent';
import { ConvertEnum_NameAnimChest_idle_after_open, ConvertEnum_NameAnimChest_idle_close, ConvertEnum_NameAnimChest_wait_to_open, Enum_NameAnimChest, NameAnimChest_wait_to_open } from '../../../Utils/TypeAnimChest';
import { MConst } from '../../../Const/MConst';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { InfoProgressLoginReward, IPrize, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { DataLoginRewardSys } from '../../../DataBase/DataLoginRewardSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { DataItemSys } from '../../DataItemSys';
import { CurrencySys } from '../../CurrencySys';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { TYPE_BUBBLE } from '../Others/Bubble/TypeBubble';
const { ccclass, property } = _decorator;

export enum STATE_UI_PRIZE_LOGIN_REWARD {
    CAN_NOT_RECEIVE,
    WAIT_TO_RECEIVE,
    RECEIVED
}

@ccclass('UIPrizeProgressLoginReward')
export class UIPrizeProgressLoginReward extends Component {
    @property(Node) nParticle: Node;
    @property(CCInteger) typeUIPrize: number = 0; // check logic in update function to know typeUIPrize decide to what
    @property(AnimChestSys) animChestSys: AnimChestSys;
    @property(Label) lbProgress: Label;
    @property({ type: Enum_NameAnimChest }) typeChest = Enum_NameAnimChest.Box_red;
    @property(Node) nIcNoti: Node;
    private _state: STATE_UI_PRIZE_LOGIN_REWARD = STATE_UI_PRIZE_LOGIN_REWARD.CAN_NOT_RECEIVE; public get State() { return this._state; }

    private readonly timeDelayNextAnim = 2;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_LOGIN_REWARD.ITEM.EVENT_UPDATE_UI, this.UpdateUI, this);
    }

    protected start(): void {
        this.UpdateDataForce();
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_LOGIN_REWARD.ITEM.EVENT_UPDATE_UI, this.UpdateUI, this);
    }

    //#region self func
    /**
     * This func will be call on start this class
     * ```
     * ```
     * and will be call after unlock last prize 30 days
     */
    public UpdateDataForce() {
        // auto check data then auto update UI
        const dataInfoProgressLoginReward: InfoProgressLoginReward = DataLoginRewardSys.Instance.GetJsonRewardLoginProgress()[this.typeUIPrize];
        const isUnlock = DataLoginRewardSys.Instance.StateRewardProgressLogin(this.typeUIPrize);
        let state;
        switch (isUnlock) {
            case 'IS_CLAIMED': state = STATE_UI_PRIZE_LOGIN_REWARD.RECEIVED; break;
            case 'LOCK': state = STATE_UI_PRIZE_LOGIN_REWARD.CAN_NOT_RECEIVE; break;
            case 'UNLOCK': state = STATE_UI_PRIZE_LOGIN_REWARD.WAIT_TO_RECEIVE; break;
        }

        this.lbProgress.string = dataInfoProgressLoginReward.progress.toString();

        // force update UIChest
        const nameAnimClose = ConvertEnum_NameAnimChest_idle_close(this.typeChest);
        this.animChestSys.PlayAnim(nameAnimClose);

        this.ChangeState(state);
    }

    private ChangeState(state: STATE_UI_PRIZE_LOGIN_REWARD) {
        this._state = state;
        switch (state) {
            case STATE_UI_PRIZE_LOGIN_REWARD.CAN_NOT_RECEIVE:
                this.nParticle.active = false;
                const nameAnimClose = ConvertEnum_NameAnimChest_idle_close(this.typeChest);
                this.animChestSys.PlayAnim(nameAnimClose);
                this.nIcNoti.active = false;
                this.node.off(Node.EventType.TOUCH_END, this.onBtnClaim, this);
                this.node.on(Node.EventType.TOUCH_END, this.onBtnShowInfoSelf, this);
                break;
            case STATE_UI_PRIZE_LOGIN_REWARD.WAIT_TO_RECEIVE:
                this.nParticle.active = true;
                const timeScaleUp = 0.5;
                const nameAnimWaitToOpen = ConvertEnum_NameAnimChest_wait_to_open(this.typeChest);
                this.animChestSys.PlayAnimLoopWithDelay(nameAnimWaitToOpen, this.timeDelayNextAnim);
                this.nIcNoti.active = true;
                this.node.on(Node.EventType.TOUCH_END, this.onBtnClaim, this);
                this.node.off(Node.EventType.TOUCH_END, this.onBtnShowInfoSelf, this);
                break;
            case STATE_UI_PRIZE_LOGIN_REWARD.RECEIVED:
                this.nParticle.active = false;
                const nameAnimAfterOpen = ConvertEnum_NameAnimChest_idle_after_open(this.typeChest);
                this.animChestSys.PlayAnim(nameAnimAfterOpen);
                this.nIcNoti.active = false;
                this.node.off(Node.EventType.TOUCH_END, this.onBtnClaim, this);
                this.node.off(Node.EventType.TOUCH_END, this.onBtnShowInfoSelf, this);
                break;
        }
    }

    private async UpdateUI(autoReceivePrizeIfChangeState: boolean = false, callbackReceivePrize: CallableFunction = null) {
        /**
         * logic
         * check each type prize quest => if it reach progress => unlock or change state
         */
        let canOpen: boolean = false;
        const progressNow = DataLoginRewardSys.Instance.GetProgress30DaysReward();
        const wasReceivedPrized: boolean = DataLoginRewardSys.Instance.WasReward30DayLoginProgressReceived(this.typeUIPrize);

        let indexPrizeCanReceived = DataLoginRewardSys.Instance.GetMaxIndexPrizeProgressReceive(progressNow);
        canOpen = indexPrizeCanReceived != -1 && this.typeUIPrize <= indexPrizeCanReceived;

        // check if can open and diff state => update state
        if (canOpen) {
            if (this._state == STATE_UI_PRIZE_LOGIN_REWARD.CAN_NOT_RECEIVE && !wasReceivedPrized) {
                if (this._state == STATE_UI_PRIZE_LOGIN_REWARD.CAN_NOT_RECEIVE && autoReceivePrizeIfChangeState) {
                    this.ChangeState(STATE_UI_PRIZE_LOGIN_REWARD.WAIT_TO_RECEIVE);
                    if (callbackReceivePrize != null) {
                        callbackReceivePrize();
                        await this.ReceivePrize();
                    }
                } else {
                    this.ChangeState(STATE_UI_PRIZE_LOGIN_REWARD.WAIT_TO_RECEIVE);
                }
            } else if (wasReceivedPrized) {
                this.ChangeState(STATE_UI_PRIZE_LOGIN_REWARD.RECEIVED);
            }
        } else {
            if (this._state != STATE_UI_PRIZE_LOGIN_REWARD.CAN_NOT_RECEIVE) {
                this.ChangeState(STATE_UI_PRIZE_LOGIN_REWARD.CAN_NOT_RECEIVE);
            }
        }
    }

    private AnimLoopWhenCanReceive() {
    }

    //#endregion

    private async onBtnClaim() {
        LogEventManager.Instance.logButtonClick(`prize`, "UIPrizeProgressLoginReward");

        /**
         * logic play anim claim
         * make this UI to opacity = 0
         * emit event lobby Prize for loginReward progress
         * after done anim receive prize => set the UI opacity to 255 again
         * call save quest data + change state prize
         */

        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.HIDE_EVENT);
        const infoProgressPrize = DataLoginRewardSys.Instance.GetJsonRewardLoginProgress()[this.typeUIPrize];
        PrizeSys.Instance.AddPrize(infoProgressPrize.listPrize, "LoginReward", false, false);
        DataLoginRewardSys.Instance.SaveRewardLoginProgress([this.typeUIPrize]);
        this.ChangeState(STATE_UI_PRIZE_LOGIN_REWARD.RECEIVED);

        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY, false);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.LOGIN_REWARD, infoProgressPrize.listPrize, "UILoginReward_progress", null, null, 'Login Reward');
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_LOBBY, false);

        // kiểm tra đã nhận hết quà mùa này chưa?
        // nếu đã nhận hết quà mùa này rùi thì reset lại UI
        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.CHECK_RESET_30_DAYS_REWARD);

        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.SHOW_EVENT);
    }


    /**
     * function này giống function onBtnClaim bởi vì function này sẽ được gọi khi người chơi đạt đến tiến trình để tự động nhận thưởng
     * => do đó function onBtnClaim hầu như sẽ không được gọi
     */
    public async ReceivePrize() {
        const listPrize = DataLoginRewardSys.Instance.GetJsonRewardLoginProgress()[this.typeUIPrize].listPrize;
        PrizeSys.Instance.AddPrize(listPrize, "progress LoginReward", false, false);
        DataLoginRewardSys.Instance.SaveRewardLoginProgress([this.typeUIPrize]);
        this.ChangeState(STATE_UI_PRIZE_LOGIN_REWARD.RECEIVED);

        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.HIDE_EVENT);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.LOGIN_REWARD, listPrize, "UILoginReward_progress", null, null, 'Login Reward');
        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.SHOW_EVENT);
    }

    private async onBtnShowInfoSelf() {
        const typeBubble = this.typeUIPrize == 3 ? TYPE_BUBBLE.BOTTOM_LEFT : TYPE_BUBBLE.BOTTOM_MID;

        const listPrize: IPrize[] = DataLoginRewardSys.Instance.GetJsonRewardLoginProgress()[this.typeUIPrize].listPrize;
        const wPosPrize = this.animChestSys.node.worldPosition.clone();

        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.NOTIFICATION.SHOW_NOTIFICATION,
            Array.from(listPrize)
            , typeBubble
            , wPosPrize
            , true
            , null
            , null
        )
    }
}


