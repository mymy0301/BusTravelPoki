import { _decorator, Component, Node, Label } from 'cc';
import { lodash } from '../framework/lodash';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('CountDownTimeGroup')
export class CountDownTimeGroup extends Component {
    @property(Label)
    txtTime: Label;
    @property(Label)
    txtTimeShadow: Label;

    countTime: number;

    callBack: any = null;
    start() {

    }


    update(deltaTime: number) {

    }

    onDisable() {
        this.unschedule(this.showTime);
    }

    initCountDownTime(_countTime: number, cb: any, customTextBefore: string = "") {
        this.ShowNode();
        this.callBack = cb;
        this.countTime = _countTime;
        const textSet = `${customTextBefore}${Utils.convertTimeLengthToFormat(this.countTime)}`;
        this.txtTime.string = _countTime > 0 ? textSet : "00:00:00";
        this.txtTimeShadow.string = _countTime > 0 ? textSet : "00:00:00";
        this.schedule(this.showTime, 1);
    }


    showTime() {
        this.countTime--;
        const textSet = `${Utils.convertTimeLengthToFormat(this.countTime)}`;
        if (this.countTime > 0) {
            this.txtTime.string = textSet;
            this.txtTimeShadow.string = textSet;
        } else {
            this.countTime = 0;
            this.txtTime.string = textSet;
            this.txtTimeShadow.string = textSet;
            this.unschedule(this.showTime);

            if (this.callBack) {
                this.callBack();
            }
            this.HideNode();
        }
    }

    public HideNode() {
        this.node.active = false;
        this.txtTimeShadow.node.active = false;
    }

    public ShowNode() {
        this.node.active = true;
        this.txtTimeShadow.node.active = true;
    }
}

