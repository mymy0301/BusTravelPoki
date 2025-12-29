import { _decorator, CCBoolean, CCFloat, Component, Node, Tween, tween, UIOpacity } from 'cc';
import { Utils } from '../Utils';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('SplashOpacity')
@requireComponent(UIOpacity)
@disallowMultiple
export class SplashOpacity extends Component {
    @property(CCFloat) timeOpacityOn: number = 0.5;
    @property(CCFloat) timeOpacityOff: number = 0.5;
    @property(CCFloat) minOpa: number = 0;
    @property(CCFloat) delayFirstTime: number = 0;
    @property(CCBoolean) isFirstTimeShow: boolean = true;

    protected onLoad(): void {
        this.TweenOpacity();
    }

    protected onDestroy(): void {
        Tween.stopAllByTarget(this.node);
    }

    public async TweenOpacity() {
        this.node.active = this.isFirstTimeShow;

        await Utils.delay(this.delayFirstTime * 1000);

        const comOpa = this.node.getComponent(UIOpacity);
        const distanceOpacity = 255 - this.minOpa;
        const self = this;
        tween(this.node)
            .to(this.timeOpacityOn, {}, {
                onUpdate(target, ratio) {
                    comOpa.opacity = self.minOpa + distanceOpacity * ratio;
                },
            })
            .to(this.timeOpacityOff, {}, {
                onUpdate(target, ratio) {
                    comOpa.opacity = 255 - distanceOpacity * ratio;
                },
            })
            .union()
            .repeatForever()
            .start();
    }
}


