/**
 * 
 * anhngoxitin01
 * Mon Nov 10 2025 14:17:02 GMT+0700 (Indochina Time)
 * UISubHatRace
 * db://assets/scripts/Scene/OtherUI/SubHatRace/UISubHatRace.ts
*
*/
import { _decorator, Component, Label, Node, tween, UIOpacity, Vec3, Widget } from 'cc';
import { HRProgressSys } from '../UIChristmasEvent/HatRace/HRProgressSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from '../../../Const/MConst';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

enum STATE_SUP_HAT_RACE {
    HIDE = "HIDE",
    ANIM_SHOW = "ANIM_SHOW",
    ANIM_PROGRESS = "ANIM_PROGRESS",
    IDLE = "IDLE"
}

@ccclass('UISupHatRace')
export class UISupHatRace extends Component {
    @property(Node) nBlockUI: Node;
    @property(HRProgressSys) hrProgressSys: HRProgressSys;
    @property(Label) lbTime: Label;

    private _state: STATE_SUP_HAT_RACE = STATE_SUP_HAT_RACE.HIDE;
    private readonly timeShow: number = 0.2;
    private readonly timeDelayShowAnim: number = 0.5;

    //===========================================
    //#region base func
    protected onLoad(): void {
        this._state = STATE_SUP_HAT_RACE.HIDE;
    }
    protected onEnable(): void {
        this.RegisterTime();
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }
    //#endregion base func
    //===========================================

    //===========================================
    //#region self
    private PrepareAnimProgress(oldProgress: number) {
        // set progress to the old progress of speedRace
        this.hrProgressSys.SetBig(oldProgress)
    }
    private RegisterTime() {
        this.UpdateTime();
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTime, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        }
    }

    private UpdateTime() {
        const timeDisplay = DataHatRace_christ.Instance.GetTimeDisplay();
        if (timeDisplay < 0) {
            this.lbTime.string = "FINISHED";
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat_ForEvent(timeDisplay);
        }
    }
    //#endregion self
    //===========================================

    //===========================================
    //#region state
    private async SetState(state: STATE_SUP_HAT_RACE) {
        try {
            this._state = state;
            switch (state) {
                case STATE_SUP_HAT_RACE.HIDE:
                    this.OnStateHide();
                    break;
                case STATE_SUP_HAT_RACE.IDLE:
                    this.OnStateIdle();
                    break;
                case STATE_SUP_HAT_RACE.ANIM_SHOW:
                    await this.OnStateAnimShow();
                    await Utils.delay(this.timeDelayShowAnim * 1000);
                    this.SetState(STATE_SUP_HAT_RACE.ANIM_PROGRESS);
                    break;
                case STATE_SUP_HAT_RACE.ANIM_PROGRESS:
                    await this.OnStateAnimProgress();
                    this.SetState(STATE_SUP_HAT_RACE.IDLE);
                    break;
            }
        } catch (e) {

        }
    }

    private get STATE() { return this._state; }

    private OnStateHide() {
        this.node.active = false;
    }

    private async OnStateAnimShow() {
        const widgetCom = this.node.getComponent(Widget);
        widgetCom.enabled = true;
        widgetCom.updateAlignment();
        this.node.active = true;
        const opaCom = this.node.getComponent(UIOpacity);
        widgetCom.enabled = false;
        const posEnd: Vec3 = this.node.position.clone();
        const posStart: Vec3 = posEnd.clone().subtract3f(0, widgetCom.bottom, 0);
        this.node.position = posStart;
        opaCom.opacity = 0;
        tween(this.node)
            .to(this.timeShow, { position: posEnd }, {
                onUpdate(target, ratio) {
                    opaCom.opacity = ratio * 255;
                },
            })
            .start()
    }

    private async OnStateAnimProgress() {
        const newIndex: number = DataHatRace_christ.Instance.GetIndexMutilply();
        this.hrProgressSys.MoveToIndex(newIndex);
    }

    private async OnStateIdle() {
        this.nBlockUI.active = false;
    }
    //#endregion state
    //===========================================

    //===========================================
    //#region public
    public async ShowUI(oldProgress: number) {
        try {
            this.PrepareAnimProgress(oldProgress);
            await this.SetState(STATE_SUP_HAT_RACE.ANIM_SHOW);
        } catch (e) {

        }
    }

    public HideUI() {
        this.SetState(STATE_SUP_HAT_RACE.HIDE);
    }
    //#endregion public
    //===========================================
}