import { _decorator, Color, Component, Node, RealCurve, Sprite, SpriteFrame, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { M_ERROR } from 'db://assets/scripts/Configs/MConfigError';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { DIRECT_CAR } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('SupCarFireTruck')
export class SupCarFireTruck extends Component {
    @property(RealCurve) rcAlpha1: RealCurve = new RealCurve();
    @property(RealCurve) rcAlpha2: RealCurve = new RealCurve();
    @property(Node) nLight: Node;
    @property(Node) nLight_2: Node;
    private readonly TIME_TOTAL = 1;

    private _directionCar: DIRECT_CAR = null;
    private _isStopAnim: boolean = true;

    protected onDisable(): void {
        this.StopLight();
    }

    private StopLight() {
        this._isStopAnim = true;
        Tween.stopAllByTarget(this.node);
    }

    public ChangeLight(directionCar: DIRECT_CAR) {
        if (this._directionCar == directionCar && this._isStopAnim) { return; }

        const opaLight_1 = this.nLight.getComponent(UIOpacity);
        const opaLight_2 = this.nLight_2.getComponent(UIOpacity);

        const self = this;
        this.StopLight();
        this._isStopAnim = true;
        opaLight_1.opacity = opaLight_2.opacity = 0;

        // pos light
        const posLight = LIST_POS_LIGHT_1[directionCar];
        const posLight_2 = LIST_POS_LIGHT_2[directionCar];
        this.nLight.position = posLight;
        this.nLight_2.position = posLight_2;

        // load sp light
        const pathLight = MConfigResourceUtils.GetPathFireTruckLight();
        MConfigResourceUtils.GetImgLightFireTruckUntilLoad(pathLight, (path: string, sf: SpriteFrame) => {
            try {
                if (path == pathLight) {
                    self.nLight.getComponent(Sprite).spriteFrame = self.nLight_2.getComponent(Sprite).spriteFrame = sf;
                }
            } catch (e) {
                console.error(`#${M_ERROR.FIRE_TRUCK_LIGHT}`);
            }
        });

        opaLight_1.opacity = 255 * self.rcAlpha1.evaluate(Utils.GetValueFromToRangeWithRatio(0, 0.5, 1));
        opaLight_2.opacity = 0;

        // anim light
        tween(this.node)
            //=================== WAY 1 =======================
            .parallel(
                tween()
                    .to(this.TIME_TOTAL / 4, {}, {
                        onUpdate(target, ratio) {
                            opaLight_1.opacity = 255 * self.rcAlpha1.evaluate(Utils.GetValueFromToRangeWithRatio(ratio, 0.5, 1));
                        },
                    })
                    .to(this.TIME_TOTAL / 2, {}, {
                        onUpdate(target, ratio) {
                            opaLight_1.opacity = 255 * self.rcAlpha2.evaluate(ratio);
                        },
                    })
                    .to(this.TIME_TOTAL / 4, {}, {
                        onUpdate(target, ratio) {
                            opaLight_1.opacity = 255 * self.rcAlpha1.evaluate(Utils.GetValueFromToRangeWithRatio(ratio, 0, 0.5));
                        },
                    })
                    .delay(this.TIME_TOTAL / 4)
                , tween()
                    .delay(this.TIME_TOTAL / 4)
                    .to(this.TIME_TOTAL / 2, {}, {
                        onUpdate(target, ratio) {
                            opaLight_2.opacity = 255 * self.rcAlpha1.evaluate(ratio);
                        },
                    })
                    .to(this.TIME_TOTAL / 2, {}, {
                        onUpdate(target, ratio) {
                            opaLight_2.opacity = 255 * self.rcAlpha2.evaluate(ratio);
                        },
                    })
            )
            .union()
            .repeatForever()
            .start();
    }
}

const LIST_POS_LIGHT_1 = {
    0: new Vec3(-16.197, 52.489, 0),      // TOP
    1: new Vec3(-31.426, 39.532, 0),     // TOP_LEFT
    2: new Vec3(-30.744, 14.074, 0),      // LEFT
    3: new Vec3(-11.877, 3.391, 0),     // BOTTOM_LEFT
    4: new Vec3(12.218, -6.156, 0),       // BOTTOM
    5: new Vec3(12.358, 2.143, 0),     // BOTTOM_RIGHT
    6: new Vec3(30.895, 14.013, 0),     // RIGHT
    7: new Vec3(10.857, 54.494, 0)       // TOP_RIGHT
}

const LIST_POS_LIGHT_2 = {
    0: new Vec3(12.147, 52.489, 0),      // TOP
    1: new Vec3(-11.266, 54.762, 0),     // TOP_LEFT
    2: new Vec3(-30.36, 35.668, 0),      // LEFT
    3: new Vec3(-29.451, 17.483, 0),     // BOTTOM_LEFT
    4: new Vec3(-15.813, -6.612, 0),       // BOTTOM
    5: new Vec3(29.597, 17.672, 0),     // BOTTOM_RIGHT
    6: new Vec3(30.837, 35.986, 0),     // RIGHT
    7: new Vec3(30.984, 39.342, 0)       // TOP_RIGHT
}