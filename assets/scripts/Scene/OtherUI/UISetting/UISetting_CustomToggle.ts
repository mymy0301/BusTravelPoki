import { _decorator, CCFloat, Color, Component, Label, Node, Sprite, tween, Vec3 } from 'cc';
import { languages } from 'db://assets/resources/i18n/en';
import * as I18n from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('UISetting_CustomToggle')
export class UISetting_CustomToggle extends Component {
    @property(Sprite) spProgress: Sprite;
    @property(Node) nCar: Node;
    @property(Label) lbStatus: Label;
    @property(CCFloat) posX_off_car: number = 0;
    @property(CCFloat) posX_on_car: number = 0;
    @property(CCFloat) angle_off_car: number = 0;
    @property(CCFloat) angle_on_car: number = 0;
    @property(CCFloat) posX_lbStatus_off_car: number = 9;
    @property(CCFloat) posX_lbStatus_on_car: number = -9;
    @property(Color) outlineColor_on: Color = new Color().fromHEX("#4767A4");
    @property(Color) outlineColor_off: Color = new Color().fromHEX("#BE8553");

    private _statusToggle: boolean = false;

    private GetTextStatus(status: boolean): string {
        return status ? I18n.t(languages["ON"]) : I18n.t(languages["OFF"]);
    }

    private ChangeTextStatus(status: boolean) {
        this.lbStatus.string = this.GetTextStatus(status);
        this.lbStatus.node.setPosition(new Vec3(status ? this.posX_lbStatus_on_car : this.posX_lbStatus_off_car, this.lbStatus.node.position.y));
        this.lbStatus.outlineColor = status ? this.outlineColor_on : this.outlineColor_off;
    }

    public SetUp(status: boolean) {
        this.spProgress.fillRange = status ? 1 : 0;
        this.ChangeTextStatus(status);
        const posXCar: number = status ? this.posX_on_car : this.posX_off_car;
        const angleCar: number = status ? this.angle_on_car : this.angle_off_car;
        this.nCar.setPosition(new Vec3(posXCar, this.nCar.position.y));
        this.nCar.eulerAngles = new Vec3(0, 0, angleCar);

        this._statusToggle = status;
    }

    /**
     * Please ensure check not duplicated status when call this funcion
     * @example status is false and you call anim change false again is not accept
     * @param status 
     */
    public async AnimChangeSetting(status: boolean) {
        this._statusToggle = status;

        const timeAnim = 0.2;

        const self = this;
        const diffX: number = status ? this.posX_on_car - this.posX_off_car : this.posX_off_car - this.posX_on_car;
        const diffAngel: number = status ? this.angle_on_car - this.angle_off_car : this.angle_off_car - this.angle_on_car;
        const posXCar_Now: number = this.nCar.position.x;
        const posYCar_Now: number = this.nCar.position.y;
        const angleCar_Now: number = this.nCar.eulerAngles.z;

        let isUpdateLabelStatus: boolean = false;
        function UpdateLabelStatus() {
            isUpdateLabelStatus = true;
            self.ChangeTextStatus(status);
        }

        return new Promise<void>(resolve => {
            tween(this.spProgress)
                .to(timeAnim, { fillRange: status ? 1 : 0 }, {
                    onUpdate(target, ratio) {
                        if (!isUpdateLabelStatus && ratio > 0.5) {
                            UpdateLabelStatus();
                        }
                        self.nCar.setPosition(new Vec3(posXCar_Now + (diffX * ratio), posYCar_Now));
                        self.nCar.eulerAngles = new Vec3(0, 0, angleCar_Now + (diffAngel * ratio));
                    },
                })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }
}


