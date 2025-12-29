import { _decorator, CCFloat, Component, Node, tween, Tween, UIOpacity } from 'cc';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ShadowGameUI')
export class ShadowGameUI extends Component {
    @property(CCFloat) timeShowShadow: number = 1;
    @property(CCFloat) timeHideShadow: number = 1;

    public Show(isUseOpacity = true, timeShowShadow: number = this.timeShowShadow) {
        if (this.node == null) return;
        const comOpa = this.node.getComponent(UIOpacity);
        const self = this;

        this.node.active = true;
        Tween.stopAllByTarget(comOpa);

        if (isUseOpacity) {
            if (comOpa != null) {
                comOpa.opacity = 20;
                tween(comOpa)
                    .to(timeShowShadow, { opacity: 255 })
                    .start();
            }
        } else {
            if (comOpa != null) {
                comOpa.opacity = 255;
            }
        }
    }

    public Hide(isUseOpacity = true, timeHideShadow: number = this.timeHideShadow) {
        const comOpa = this.node.getComponent(UIOpacity);
        const self = this;

        Tween.stopAllByTarget(comOpa);

        if (isUseOpacity) {
            if (comOpa != null) {
                tween(comOpa)
                    .to(timeHideShadow, { opacity: 0 })
                    .call(() => {
                        self.node.active = false;
                    })
                    .start();
            } else {
                self.node.active = false;
            }
        } else {
            if (comOpa != null) {
                comOpa.opacity = 0;
            }
            this.node.active = false;
        }
    }

    public ShowShadowBlockNoShadow() {
        this.node.active = true;
        this.node.getComponent(UIOpacity).opacity = 0;
    }
}


