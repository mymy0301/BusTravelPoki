/**
 * 
 * anhngoxitin01
 * Mon Nov 24 2025 14:16:21 GMT+0700 (Indochina Time)
 * BgChristControl
 * db://assets/scripts/Scene/OtherUI/UIChristmasEvent/BgChristControl.ts
*
*/
import { _decorator, CCFloat, CCInteger, CCString, Color, Component, Node, Sprite, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BgChristControl')
export class BgChristControl extends Component {
    @property(Color) colorBlack: Color = new Color();
    @property(CCFloat) timeAnimDefault: number = 0.5;
    private _spBg: Sprite = null;

    protected onLoad(): void {
        this.CacheSp();
    }

    private CacheSp() { this._spBg = this.node.getComponent(Sprite); }

    public AnimLightBg(force: boolean = false, timeAnim: number = this.timeAnimDefault) {
        this._spBg == null && this.CacheSp();
        const currentColor = this._spBg.color;
        const self = this;

        if (force) { this._spBg.color = Color.WHITE; }
        else {
            tween(this._spBg)
                .to(timeAnim, {}, {
                    onUpdate(target, ratio) {
                        // Mix current color and white, then multiply by ratio
                        const mixedColor = new Color(
                            currentColor.r + (255 - currentColor.r) * ratio,
                            currentColor.g + (255 - currentColor.g) * ratio,
                            currentColor.b + (255 - currentColor.b) * ratio,
                            currentColor.a
                        );
                        self._spBg.color = mixedColor;
                    },
                })
                .start();
        }
    }

    public AnimUnLightBg(force: boolean = false, timeAnim: number = this.timeAnimDefault) {
        this._spBg == null && this.CacheSp();
        const cBlack = this.colorBlack;
        const self = this;

        if (force) { this._spBg.color = this.colorBlack; }
        else {
            tween(this._spBg)
                .to(timeAnim, {}, {
                    onUpdate(target, ratio) {
                        // Mix current color and white, then multiply by ratio
                        const mixedColor = new Color(
                            255 - (255 - cBlack.r) * ratio,
                            255 - (255 - cBlack.g) * ratio,
                            255 - (255 - cBlack.b) * ratio,
                            255
                        );
                        self._spBg.color = mixedColor;
                    },
                })
                .start();
        }
    }
}