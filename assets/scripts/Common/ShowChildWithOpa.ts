import { _decorator, CCBoolean, CCFloat, Component, Node, tween, Tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShowChildWithOpa')
export class ShowChildWithOpa extends Component {
    @property(Node) nChild: Node;
    @property(CCFloat) timeShowShadow: number = 1;
    @property(CCFloat) timeHideShadow: number = 1;
    @property(CCBoolean) isAutoSetOpaTo0_WhenShow = false;

    public Show(isUseOpacity = true) {
        const comOpa = this.nChild.getComponent(UIOpacity);
        const self = this;

        if (this.isAutoSetOpaTo0_WhenShow) comOpa.opacity = 0;
        this.nChild.active = true;
        Tween.stopAllByTarget(comOpa);

        if (isUseOpacity) {
            if (comOpa != null) {
                tween(comOpa)
                    .to(self.timeShowShadow, { opacity: 255 })
                    .start();
            }
        } else {
            if (comOpa != null) {
                comOpa.opacity = 255;
            }
        }
    }

    public Hide(isUseOpacity = true) {
        const comOpa = this.nChild.getComponent(UIOpacity);
        const self = this;

        Tween.stopAllByTarget(this.nChild);

        if (isUseOpacity) {
            if (comOpa != null) {
                tween(comOpa)
                    .to(self.timeHideShadow, { opacity: 0 })
                    .call(() => {
                        self.nChild.active = false;
                    })
                    .start();
            } else {
                self.nChild.active = false;
            }
        } else {
            if (comOpa != null) {
                comOpa.opacity = 0;
            }
            this.nChild.active = false;
        }
    }
}


