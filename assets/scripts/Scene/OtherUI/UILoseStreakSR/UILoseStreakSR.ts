import { _decorator, Component, Node, Tween, tween, UIOpacity } from 'cc';
import { SRProgressSys } from '../UISpeedRace/SRProgressSys';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

enum STATE_UI_SUB_LOSE_STREAK_SR {
    IDLE,
    ANIM,
    ANIM_LOOP_WARNING
}

@ccclass('UILoseStreakSR')
export class UILoseStreakSR extends Component {
    @property(SRProgressSys) srProgress: SRProgressSys;
    private _progressNow: number = 0;
    private _stateUI: STATE_UI_SUB_LOSE_STREAK_SR = STATE_UI_SUB_LOSE_STREAK_SR.IDLE;
    private timeDelayToPlayAnim: number = 1;
    private timeDelayLoopAnim: number = 2;

    // =====================================
    //#region baseUI
    public Show(timeShow: number = 0.5) {
        tween(this.node.getComponent(UIOpacity))
            .to(timeShow, { opacity: 255 })
            .call(() => {
                this.SetState(STATE_UI_SUB_LOSE_STREAK_SR.ANIM);
            })
            .start();
    }

    public ShowWithOutTween() {
        this.node.getComponent(UIOpacity).opacity = 255;
        this.SetState(STATE_UI_SUB_LOSE_STREAK_SR.ANIM);
    }

    public Hide() {
        this.node.getComponent(UIOpacity).opacity = 0;
    }

    protected onDisable(): void {
        this.StopAnim();
    }
    //#endregion baseUI
    // =====================================

    // =====================================
    // #region self
    public SetUp(progressNow: number, needTween: boolean = true) {
        this._forceStop = false;
        this._progressNow = progressNow;
        this.srProgress.SetBig(progressNow, needTween);
    }
    // #endregion self
    // =====================================


    // =====================================
    // #region state
    private SetState(newState: STATE_UI_SUB_LOSE_STREAK_SR) {
        this._stateUI = newState;
        switch (this._stateUI) {
            case STATE_UI_SUB_LOSE_STREAK_SR.IDLE:
                this.StopAnim();
                break;
            case STATE_UI_SUB_LOSE_STREAK_SR.ANIM:
                this.PlayAnimIdle(false);
                this._isLoop = true;
                break;
            case STATE_UI_SUB_LOSE_STREAK_SR.ANIM_LOOP_WARNING:
                this.LoopOnlyWarning(false);
                this._isLoop = true;
                break;
        }
    }

    public ChangeStateLoopWarning() {
        this._isLoop = false;
        this.SetState(STATE_UI_SUB_LOSE_STREAK_SR.ANIM_LOOP_WARNING);
    }
    // #endregion state
    // =====================================

    // =====================================
    // #region anim 
    private _isLoop: boolean = false;
    private _forceStop: boolean = false;
    public async PlayAnimIdle(callFromLoop: boolean) {
        try {
            if (this._stateUI != STATE_UI_SUB_LOSE_STREAK_SR.ANIM || (!callFromLoop && this._isLoop)) { this._isLoop = false; return; }
            if (this._forceStop) { this._isLoop = false; return; }
            this.SetUp(this._progressNow);
            await Utils.delay(this.timeDelayToPlayAnim * 1000);
            await this.srProgress.AnimWarning();
            await this.srProgress.MoveToIndexWithPromise(0);
            await Utils.delay(this.timeDelayLoopAnim * 1000);
            this.PlayAnimIdle(true);
        } catch (e) {

        }
    }

    private async LoopOnlyWarning(callFromLoop: boolean = false) {
        try {
            if (this._stateUI != STATE_UI_SUB_LOSE_STREAK_SR.ANIM_LOOP_WARNING || (!callFromLoop && this._isLoop)) { this._isLoop = false; return; }
            if (this._forceStop) { this._isLoop = false; return; }
            await this.srProgress.AnimWarning();
            await Utils.delay(this.srProgress.GetTimeAnimWarning() * 1000);
            this.LoopOnlyWarning(true)
        } catch (e) {

        }
    }

    public StopAnim() {
        this._forceStop = true;
        this.srProgress.StopAnim();
    }
    // #endregion anim
    // =====================================
}


