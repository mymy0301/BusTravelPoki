import { _decorator, Color, Component, Label, Node, Tween, tween, Vec3 } from 'cc';
import { EVENT_CLOCK_ON_TICK } from '../Const/MConst';
import { clientEvent } from '../framework/clientEvent';
import { Utils } from '../Utils/Utils';
import { AniTweenSys } from '../Utils/AniTweenSys';
const { ccclass, property } = _decorator;

@ccclass('TimeInGameTournamentSys')
export class TimeInGameTournamentSys extends Component {
    @property(Label) lbTime: Label;
    private _time: number = 0;
    private _speedIncreaseTime: number = 1;
    private _cbWhenOverTime: CallableFunction = null;

    protected onDisable(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
    }

    protected onDestroy(): void {
        this._cbWhenOverTime = null;
    }

    //#region self func
    public RegisterEventListen(cbWhenOverTime: CallableFunction) {
        this._cbWhenOverTime = cbWhenOverTime;
    }

    public SetUpTime(second: number, speedIncreaseTime: number = 1) {
        this._time = second;
        this._speedIncreaseTime = speedIncreaseTime;
        this.UpdateUITime();
    }

    public StartTime() {
        let isHasListenEvent: boolean = clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
        // console.log("isHasListenEvent", isHasListenEvent);
        if (!isHasListenEvent) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
        }
    }

    public ResetTime() {
        this._time = 0;
        this.UpdateUITime();

        clientEvent.off(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
    }

    public PauseTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
    }

    /**
    * @param timeAdd second
    */
    public AddTime(timeAdd: number) {
        this.setDefaultUILabelTime();

        //add time
        const rootNumberTime = this._time;
        const distance = timeAdd;
        this._time += timeAdd;
        let self = this;
        const maxTimeRaiseTime: number = 0.2;
        tween(this.lbTime.node)
            .to(maxTimeRaiseTime, {}, {
                easing: 'smooth', onUpdate(target, ratio) {
                    self.lbTime.string = Utils.convertTimeToFormat(Math.floor(rootNumberTime + distance * ratio));
                },
            })
            .start();
    }

    private UpdateUITime() {
        this.lbTime.string = Utils.convertTimeToFormat(this._time);
    }

    private OverTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.InRunTime, this);
        this._cbWhenOverTime && this._cbWhenOverTime();
    }

    private InRunTime() {
        //decrease time and update UI
        this._time += this._speedIncreaseTime;
        // console.log("this._time", this._time);
        this.UpdateUITime();
    }
    //#endregion self func

    //#region visual effect
    private setDefaultUILabelTime() {
        Tween.stopAllByTarget(this.lbTime.node);
        this.lbTime.color = Color.WHITE;
        this.lbTime.node.scale = Vec3.ONE;
    }

    public GetTimeTournament() {
        return this._time;
    }

    private EffectImpressTimeWhenStartGame() {
        Tween.stopAllByTarget(this.lbTime.node);
        this.UpdateUITime();
        AniTweenSys.playAnimGreeningText(this.lbTime);
    }
    //#endregion visual effect
}


