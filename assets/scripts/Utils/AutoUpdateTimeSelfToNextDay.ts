import { _decorator, Component, Label, Node } from 'cc';
import { Utils } from './Utils';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('AutoUpdateTimeSelfToNextDay')
export class AutoUpdateTimeSelfToNextDay extends Component {
    @property(Label) lbTime: Label;

    protected onEnable(): void {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateLabel, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateLabel, this);
    }

    protected UpdateLabel(): void {
        let time = Utils.getTimeToNextDay();
        if (time < 0) {
            this.lbTime.string = "FINISHED";
        } else {
            let timeRemaningString = "";
            timeRemaningString = Utils.convertTimeLengthToFormat_ForEvent(time);
            if (timeRemaningString == '') {
                timeRemaningString = "FINISHED";
            }
            this.lbTime.string = timeRemaningString;
        }
    }
}


