/**
 * 
 * anhngoxitin01
 * Sun Aug 31 2025 08:40:29 GMT+0700 (Indochina Time)
 * LightSkyLift
 * db://assets/scripts/Scene/OtherUI/UISkyLift/LightSkyLift.ts
*
*/
import { _decorator, Component, ParticleSystem, Tween, tween, UIOpacity } from 'cc';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('LightSkyLift')
export class LightSkyLift extends Component {
    @property(UIOpacity) opaLight1: UIOpacity;
    @property(UIOpacity) opaLight2: UIOpacity;
    @property(UIOpacity) opaLight3: UIOpacity;
    @property(ParticleSystem) ps1: ParticleSystem;
    @property(ParticleSystem) ps2: ParticleSystem;
    public _isUsingLoopLight: boolean = false;
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private PauseAnim() {
        Tween.stopAllByTarget(this.opaLight1);
        Tween.stopAllByTarget(this.opaLight2);
        Tween.stopAllByTarget(this.opaLight3);
        this.ps1.stop();
        this.ps2.stop();
        this._isUsingLoopLight = false;
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public HideLight() {
        this.PauseAnim();
        this.opaLight1.opacity = this.opaLight2.opacity = this.opaLight3.opacity = 0;
        this.ps1.node.active = false;
        this.ps2.node.active = false;
    }

    /**
     * light show -> loop
     */
    public async ShowLight_1() {
        try {
            this.PauseAnim();

            const timeShowLight: number = 0.5;
            const timeDelayLight: number = 1;
            const timeHideLight: number = 0.5;
            this.opaLight3.opacity = 0;

            this.ps1.node.active = true;
            this.ps1.play();

            tween(this.opaLight1)
                .to(timeShowLight, { opacity: 255 })
                .start();
            tween(this.opaLight2)
                .to(timeShowLight, { opacity: 255 })
                .start();

            this.ps1.node.active = true;
            this.ps1.play();

            await Utils.delay(timeDelayLight * 1000);

            tween(this.opaLight1)
                .to(timeHideLight, { opacity: 0 })
                .call(() => {
                    try {
                        this.ShowLight_2(true);
                    } catch (e) {

                    }
                })
                .start();
        } catch (e) {

        }
    }

    /**
     * light loop
     * @returns 
     */
    public ShowLight_2(fromLight1: boolean = false) {
        if (this._isUsingLoopLight) { return; }
        this._isUsingLoopLight = true;
        try {
            if (!fromLight1) this.PauseAnim();

            const timeGlowUp: number = 2;
            const timeGlowDown: number = 2;

            this.ps2.play();
            this.ps2.node.active = true;

            tween(this.opaLight2)
                .to(timeGlowUp, { opacity: 255 }, { easing: 'quintOut' })
                .to(timeGlowDown, { opacity: 0 }, { easing: 'quintIn' })
                .call(() => {
                    tween(this.opaLight3)
                        .to(timeGlowUp, { opacity: 255 }, { easing: 'quintOut' })
                        .to(timeGlowDown, { opacity: 0 }, { easing: 'quintIn' })
                        .start()
                })
                .delay(timeGlowUp + timeGlowDown)
                .union()
                .repeatForever()
                .start();
        } catch (e) {

        }
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}