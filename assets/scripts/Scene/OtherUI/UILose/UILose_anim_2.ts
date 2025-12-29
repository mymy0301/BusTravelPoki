import { _decorator, AnimationComponent, Button, Component, Label, Node, tween, UIOpacity } from 'cc';
import { SkeLoseSys } from './SkeLoseSys';
import { ParamCustomUILose } from './Type_UILose';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    IDLE = 'idle',
    OPEN_1 = "open_1",
    OPEN_2 = "open_2",
    OPEN_3 = "open_3",
}

@ccclass('UILose_anim_2')
export class UILose_anim_2 extends Component {
    // @property(AnimationComponent) animCom: AnimationComponent;
    @property(SkeLoseSys) skeLoseSys: SkeLoseSys;
    @property([Button]) listBtn: Button[] = [];
    // @property(Label) lbTime: Label;
    // @property(Label) lbCar: Label;
    // @property(Label) lbPass: Label;

    private _paramCustomUILose: ParamCustomUILose = {
        time: 1000,
        car: 1000,
        passenger: 1000
    };

    private readonly _timeDelayAnim: number = 0.5;

    @property(Node) nBox1: Node;
    @property(Node) nBox2: Node;

    //==========================================
    //#region anim
    public PrepareAnim(paramCustomUILose: ParamCustomUILose) {
        this._paramCustomUILose = paramCustomUILose;

        // set data
        // this.lbTime.string = Utils.convertTimeToStringFormat(this._paramCustomUILose.time);
        // this.lbCar.string = this._paramCustomUILose.car.toString();
        // this.lbPass.string = this._paramCustomUILose.passenger.toString();

        // ske
        this.skeLoseSys.PrepareSke();

        // anim
        // this.animCom.play(NAME_ANIM.IDLE);
        this.nBox1.getComponent(UIOpacity).opacity = 0;
        this.nBox2.getComponent(UIOpacity).opacity = 0;

        this.listBtn.forEach(item => item.enabled = false);
    }

    public async PlayAnim(cbTryShowSubDashRush: CallableFunction) {
        // this.animCom.play(NAME_ANIM.IDLE);
        await this.skeLoseSys.PlaySke_Lose_1();

        const opaBox1 = this.nBox1.getComponent(UIOpacity);
        const opaBox2 = this.nBox2.getComponent(UIOpacity);

        tween(opaBox1)
            .to(0.2, { opacity: 255 })
            .start();

        tween(opaBox2)
            .to(0.2, { opacity: 255 })
            .call(() => {
                this.listBtn.forEach(item => item.enabled = true);
            })
            .start();

        cbTryShowSubDashRush && cbTryShowSubDashRush();

        // this.animCom.play(NAME_ANIM.OPEN_2);
        // await Utils.delay(clipOpen2.duration / clipOpen2.speed * 1000);

        // // await Utils.delay(this._timeDelayAnim * 1000);

        // this.animCom.play(NAME_ANIM.OPEN_3);
        // await Utils.delay(clipOpen3.duration / clipOpen3.speed * 1000);
    }
    //#endregion anim
    //==========================================
}


