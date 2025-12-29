import { _decorator, Button, CCFloat, Component, Label, Layout, Node, Tween, tween, Vec3 } from 'cc';
import { Utils } from '../../../Utils/Utils';
import { UIWin_anim_box } from '../UIWin/UIWin_anim_box';
import { ParamCustomUILose } from './Type_UILose';
import { SkeLoseSys } from './SkeLoseSys';
const { ccclass, property } = _decorator;

@ccclass('UILose_anim')
export class UILose_anim extends Component {
    @property(UIWin_anim_box) listBox: UIWin_anim_box[] = [];
    @property(UIWin_anim_box) listIcTime_Car_Pass: UIWin_anim_box[] = [];
    @property(SkeLoseSys) skeLose: SkeLoseSys;
    @property(CCFloat) timeDelayEachBox: number = 0.5;
    @property(CCFloat) timeDelayToScaleIconBox1: number = 0.4;
    @property(CCFloat) timeDelayToScaleIconBox2: number = 0.2;
    @property(CCFloat) timeIncreaseText: number = 0.3;
    @property(CCFloat) timeDelayShowText: number = 0.5;
    @property(CCFloat) timeShowButton: number = 0.5;

    @property(Button) btnHome: Button;
    @property(Button) btnReplay: Button;

    private _paramCustomUILose: ParamCustomUILose = {
        time: 1000,
        car: 1000,
        passenger: 1000
    };


    //=============================================================================
    //========================     anim text            ===========================
    //=============================================================================
    public PrepareAnim(paramCustomUILose: ParamCustomUILose = null) {
        if (paramCustomUILose != null) {
            this._paramCustomUILose = paramCustomUILose;
        }

        this.listBox.forEach(item => item.prepareApear());

        this.listIcTime_Car_Pass.forEach(item => item.prepareApear_2_WithNotConfig_1("0"));
        this.listIcTime_Car_Pass[0].prepareApear_2_WithNotConfig_1("00:00");

        this.UpdateLbButton();

        this.skeLose.PrepareSke();

        // unEnable button
        this.btnHome.enabled = false;
        this.btnReplay.enabled = false;
    }

    public async AnimBoxApear() {

        // play ske lose than do other
        await this.skeLose.PlaySke_Lose_1();

        for (let i = 0; i < this.listBox.length; i++) {
            const animBox: UIWin_anim_box = this.listBox[i];



            switch (i) {
                case 0:
                    // box time + car + pass
                    await animBox.animApear();
                    // each box
                    await Promise.all([
                        await Utils.delay(this.timeDelayShowText * 1000),
                        await this.listIcTime_Car_Pass[0].animApear_2(this.IncreaseTextTime.bind(this)),
                        await this.listIcTime_Car_Pass[1].animApear_2(this.IncreaseTextCar.bind(this)),
                        await this.listIcTime_Car_Pass[2].animApear_2(this.IncreaseTextPassenger.bind(this))
                    ])

                    break;
                case this.listBox.length - 1:
                    await Utils.delay(this.timeShowButton * 1000);
                    (async () => {
                        // box time + car + pass
                        await animBox.animApear();
                        // enable button when it show done
                        this.btnHome.enabled = true;
                        this.btnReplay.enabled = true;
                    })();
                    await Utils.delay(this.timeDelayEachBox * 1000);
                    break;
                default:
                    await Utils.delay(0.5 * 1000);
                    animBox.animApear();
                    // box time + car + pass
                    await Utils.delay(this.timeDelayEachBox * 1000);
                    break;
            }
        }


    }

    //=============================================================================
    //========================     increase text        ===========================
    //=============================================================================
    //#region func increase text
    private IncreaseTextTime(nLb: Node, timeAnim: number = this.timeIncreaseText) {
        const self = this;
        const timeIncreaseText: number = timeAnim;
        const resultTime: number = this._paramCustomUILose.time;
        const lbCom = nLb.getComponent(Label);
        const scaleFontNow: number = nLb.getComponent(Label).fontSize;
        const scaleMax = scaleFontNow * 1.3;

        tween(nLb)
            .to(0.1, {}, {
                onUpdate(target, ratio) {
                    lbCom.fontSize = scaleFontNow + (scaleMax - scaleFontNow) * ratio;
                }
            })
            .to(timeIncreaseText, {}, {
                onUpdate(target, ratio) {
                    const time = Number((resultTime * ratio).toFixed(0));
                    const timeString = Utils.convertTimeToStringFormat(time);
                    lbCom.string = timeString == "0" ? "00:00" : timeString;
                },
            })
            .to(0.1, {}, {
                onUpdate(target, ratio) {
                    lbCom.fontSize = scaleFontNow + (scaleMax - scaleFontNow) * (1 - ratio);
                }
            })
            .start();
    }

    private IncreaseTextCar(nLb: Node, timeAnim: number = this.timeIncreaseText) {
        const self = this;
        const timeIncreaseText: number = timeAnim;
        const resultCar: number = this._paramCustomUILose.car;
        const lbCom = nLb.getComponent(Label);
        const scaleFontNow: number = nLb.getComponent(Label).fontSize;
        const scaleMax = scaleFontNow * 1.4;

        tween(nLb)
            .to(0.1, {}, {
                onUpdate(target, ratio) {
                    lbCom.fontSize = scaleFontNow + (scaleMax - scaleFontNow) * ratio;
                }
            })
            .to(timeIncreaseText, {}, {
                onUpdate(target, ratio) {
                    nLb.getComponent(Label).string = (resultCar * ratio).toFixed(0);
                },
            })
            .to(0.1, {}, {
                onUpdate(target, ratio) {
                    lbCom.fontSize = scaleFontNow + (scaleMax - scaleFontNow) * (1 - ratio);
                }
            })
            .start();
    }

    private IncreaseTextPassenger(nLb: Node, timeAnim: number = this.timeIncreaseText) {
        const self = this;
        const timeIncreaseText: number = timeAnim;
        const resultPassenger: number = this._paramCustomUILose.passenger;
        const lbCom = nLb.getComponent(Label);
        const scaleFontNow: number = nLb.getComponent(Label).fontSize;
        const scaleMax = scaleFontNow * 1.4;

        tween(nLb)
            .to(0.1, {}, {
                onUpdate(target, ratio) {
                    lbCom.fontSize = scaleFontNow + (scaleMax - scaleFontNow) * ratio;
                }
            })
            .to(timeIncreaseText, {}, {
                onUpdate(target, ratio) {
                    nLb.getComponent(Label).string = (resultPassenger * ratio).toFixed(0);
                },
            })
            .to(0.1, {}, {
                onUpdate(target, ratio) {
                    lbCom.fontSize = scaleFontNow + (scaleMax - scaleFontNow) * (1 - ratio);
                }
            })
            .start();
    }

    public UpdateLbButton() {
        // const resultCoin: number = this._paramCustomUIWin.passenger;
    }
    //#endregion func increase text

    // #region other anim
    public Anim_ScaleBtn(btnScale: Node, btnMoveToMid: Node, scaleTo: Vec3) {
        const self = this;
        const timeScaleBtn: number = 0.15;
        const basePosBtnMoveToMid: Vec3 = btnMoveToMid.position.clone();
        return new Promise<void>(resolve => {
            tween(btnScale)
                .to(timeScaleBtn, { scale: scaleTo }, {
                    onUpdate(target, ratio) {
                        let result: Vec3 = new Vec3(0, 0, 0);
                        result = Vec3.lerp(result, basePosBtnMoveToMid, Vec3.ZERO, ratio);
                        btnMoveToMid.position = result;
                    },
                })
                .call(() => { resolve() })
                .start();
        })
    }
    // #endregion other anim
}


