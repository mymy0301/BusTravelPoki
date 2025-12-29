import { _decorator, Button, CCFloat, Component, Label, Layout, Node, ParticleSystem, Prefab, Tween, tween, UITransform, Vec3 } from 'cc';
import { UIWin_anim_box } from './UIWin_anim_box';
import { Utils } from '../../../Utils/Utils';
import { ParamCustomUIWin } from './Type_UIWin';
import { SkeWinSys } from './SkeWinSys';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('UIWin_anim')
export class UIWin_anim extends Component {
    @property(UIWin_anim_box) listBox: UIWin_anim_box[] = [];
    @property(UIWin_anim_box) listIcTime_Car_Pass: UIWin_anim_box[] = [];
    @property(UIWin_anim_box) listIcCoin_Building: UIWin_anim_box[] = [];
    @property(SkeWinSys) skeWinSys: SkeWinSys;
    @property(ParticleSystem) listSpark: ParticleSystem[] = [];
    @property(Label) lbCoinReward: Label;
    @property(Label) lbCoinBtnContinueShadow: Label;
    @property(Label) lbCoinBtnDoubleShadow: Label;
    @property(Label) lbCoinBtnContinue: Label;
    @property(Label) lbCoinBtnDouble: Label;
    @property(Node) nLbExtraCoin: Node;
    @property(CCFloat) timeDelayEachBox: number = 0.5;
    @property(CCFloat) timeDelayToScaleIconBox1: number = 0.4;
    @property(CCFloat) timeDelayToScaleIconBox2: number = 0.2;
    @property(CCFloat) timeIncreaseText: number = 0.3
    @property(CCFloat) timeWaitToIncreaseText: number = 0.333;
    @property(CCFloat) timeDelayShowBtn: number = 0.66667;

    @property(Button) btnContinue: Button;
    @property(Button) btnDouble: Button;
    @property(Button) btnShare: Button;

    private readonly testDataIncrease: number = 1000;
    private _isShowExtraCoin: boolean = false;

    private _paramCustomUIWin: ParamCustomUIWin = {
        level: 0,
        time: 1000,
        car: 1000,
        passenger: 1000,
        building: 1000,
        coin: 1000,
        typeUI: 'Normal'
    };


    //=============================================================================
    //========================     anim text            ===========================
    //=============================================================================
    public PrepareAnim(paramCustomUIWin: ParamCustomUIWin = null, numExtraCoin: number = 100) {
        if (paramCustomUIWin != null) {
            this._paramCustomUIWin = paramCustomUIWin;
        }

        this.listBox.forEach(item => item.prepareApear());

        this.listIcTime_Car_Pass.forEach(item => item.prepareApear_2_WithNotConfig_1("0"));
        this.listIcTime_Car_Pass[0].prepareApear_2_WithNotConfig_1("00:00");
        this.listIcCoin_Building.forEach(item => item.prepareApear_2_WithNotConfig_1("0"));
        this.nLbExtraCoin.active = false;
        this.nLbExtraCoin.getComponent(Label).string = `(+${numExtraCoin})`;

        this._isShowExtraCoin = numExtraCoin > 0;

        this.UpdateLbButton();

        // prepare win skeleton
        this.skeWinSys.PrepareSke();

        //particle 3D
        this.listSpark.forEach(item => {
            item.node.active = false;
            item.stop();
        });

        // unEnable button
        this.btnContinue.enabled = false;
        this.btnDouble.enabled = false;
        this.btnShare.enabled = false;
    }

    public async AnimBoxApear() {
        SoundSys.Instance.pauseMusic();
        // play sound
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CONFETII);

        //==============================================================
        //=======================   Paricle3D    =======================
        //==============================================================
        this.listSpark.forEach(item => {
            item.node.active = true;
            item.play();
        })

        //==============================================================
        //==================== play ske win first ======================
        //==============================================================
        await this.skeWinSys.PlaySke_1();

        (async () => {
            await this.skeWinSys.ChangeTweenBetween2Phase();
            this.skeWinSys.PlaySke_2();
        })()
        await Utils.delay((this.skeWinSys.timeTweenMove / 3) * 1000);

        //==============================================================
        //================= play anim box ==============================
        //==============================================================

        for (let i = 0; i < this.listBox.length; i++) {
            const animBox: UIWin_anim_box = this.listBox[i];


            switch (i) {
                case 0:
                    animBox.animApear();

                    // box time + car + pass
                    await Utils.delay(this.timeDelayToScaleIconBox1 * 1000);
                    // each box
                    // (async () => {
                    //     await Promise.all([
                    //         this.listIcTime_Car_Pass[0].animApear_2(this.IncreaseTextTime.bind(this)),
                    //         this.listIcTime_Car_Pass[1].animApear_2(this.IncreaseTextCar.bind(this)),
                    //         this.listIcTime_Car_Pass[2].animApear_2(this.IncreaseTextPassenger.bind(this))
                    //     ])
                    // })();
                    break;
                case 1:
                    animBox.animApear();

                    // box time + car + pass
                    await Utils.delay(this.timeDelayToScaleIconBox2 * 1000);
                    //each box reward
                    await Promise.all([
                        await Utils.delay(this.timeWaitToIncreaseText * 1000),
                        await this.listIcTime_Car_Pass[0].animApear_2(this.IncreaseTextTime.bind(this)),
                        await this.listIcTime_Car_Pass[1].animApear_2(this.IncreaseTextCar.bind(this)),
                        await this.listIcTime_Car_Pass[2].animApear_2(this.IncreaseTextPassenger.bind(this)),
                        await this.listIcCoin_Building[0].animApear_2(this.IncreaseTextCoin.bind(this)),
                        await this.listIcCoin_Building[1].animApear_2(this.IncreaseTextBuilding.bind(this))
                    ])
                    await Utils.delay(this.timeDelayShowBtn * 1000);
                    break;
                case 2:
                    animBox.animApear();
                    break;
                case 3:
                    (async () => {
                        await animBox.animApear();
                        // enable click when show done
                        this.btnContinue.enabled = true;
                        this.btnDouble.enabled = true;
                        this.btnShare.enabled = true;
                    })();
                    break;
                default:
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
        const resultTime: number = this._paramCustomUIWin.time;
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
        const resultCar: number = this._paramCustomUIWin.car;
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
        const resultPassenger: number = this._paramCustomUIWin.passenger;
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

    private IncreaseTextCoin(nLb: Node, timeAnim: number = this.timeIncreaseText) {
        const self = this;
        const timeIncreaseText: number = timeAnim;
        // Số tiền bằng số người đón được
        const resultCoin: number = this._paramCustomUIWin.coin;
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
                    nLb.getComponent(Label).string = (resultCoin * ratio).toFixed(0);
                },
            })
            .call(() => {
                if (this._isShowExtraCoin) {
                    // you can add some anim when show extra coin
                    this.nLbExtraCoin.active = true;
                }
            })
            .to(0.1, {}, {
                onUpdate(target, ratio) {
                    lbCom.fontSize = scaleFontNow + (scaleMax - scaleFontNow) * (1 - ratio);
                }
            })
            .start();
    }

    private IncreaseTextBuilding(nLb: Node, timeAnim: number = this.timeIncreaseText) {
        const self = this;
        const timeIncreaseText: number = timeAnim;

        // hiện tại logic đang là số phần thưởng buidling = số người đón được trong game
        const resultBuilding: number = this._paramCustomUIWin.building;

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
                    nLb.getComponent(Label).string = (resultBuilding * ratio).toFixed(0);

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
        const resultCoin: number = this._paramCustomUIWin.coin;
        // update text label at buttons
        this.lbCoinBtnContinueShadow.string = resultCoin.toFixed(0);
        this.lbCoinBtnContinue.string = resultCoin.toFixed(0);
        this.lbCoinBtnDouble.string = (resultCoin * 2).toFixed(0);
        this.lbCoinBtnDoubleShadow.string = (resultCoin * 2).toFixed(0);
    }
    //#endregion func increase text

    // #region other anim
    public Anim_IncreaseCoinReward_ExceptX2(newCoin: number) {
        const self = this;
        const timeIncreaseText: number = 0.15;
        // Số tiền bằng số người đón được
        const baseCoin: number = Number(self.lbCoinReward.string);
        const diffCoin: number = newCoin - baseCoin;

        return new Promise<void>(resolve => {
            tween(this.lbCoinReward.node)
                .to(timeIncreaseText, {}, {
                    onUpdate(target, ratio) {
                        const text = (baseCoin + diffCoin * ratio).toFixed(0);
                        self.lbCoinReward.string = text;
                        self.lbCoinBtnContinue.string = text;
                        self.lbCoinBtnContinueShadow.string = text;
                    },
                })
                .call(() => { resolve() })
                .start();
        });
    }

    public Anim_IncreaseCoinReward_All(newCoin: number) {
        const self = this;
        const timeIncreaseText: number = 0.15;
        // Số tiền bằng số người đón được
        const baseCoin: number = Number(self.lbCoinReward.string);
        const diffCoin: number = newCoin - baseCoin;

        return new Promise<void>(resolve => {
            tween(this.lbCoinReward.node)
                .to(timeIncreaseText, {}, {
                    onUpdate(target, ratio) {
                        const text = (baseCoin + diffCoin * ratio).toFixed(0);
                        self.lbCoinReward.string = text;
                        self.lbCoinBtnContinue.string = text;
                        self.lbCoinBtnContinueShadow.string = text;

                        const textDouble = (baseCoin * 2 + diffCoin * 2 * ratio).toFixed(0);
                        self.lbCoinBtnDouble.string = textDouble;
                        self.lbCoinBtnDoubleShadow.string = textDouble;
                    },
                })
                .call(() => { resolve() })
                .start();
        });
    }

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


