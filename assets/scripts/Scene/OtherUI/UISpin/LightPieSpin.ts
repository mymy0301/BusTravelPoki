import { _decorator, Component, Node, Sprite, Tween, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LightPieSpin')
export class LightPieSpin extends Component {
    private readonly timeLongFlickerDefault: number = 2;
    private readonly timeEachFlickerDefault: number = 0.5;

    public FlickerLight(timeEachFlicker: number = -1, timeLongFlicker: number = -1) {
        const timeEachFlickerUse = timeEachFlicker == -1 ? this.timeEachFlickerDefault : timeEachFlicker;
        const timeLongFlickerUse = timeLongFlicker == -1 ? this.timeLongFlickerDefault : timeLongFlicker;
        const comOpacity = this.node.getComponent(UIOpacity);

        let numberLoop = timeLongFlickerUse / timeEachFlickerUse;
        let isUp = true;
        let listTweenFlicker = [];
        for (let i = 0; i < numberLoop; i++) {
            let t = tween(this.node)
                .to(timeEachFlickerUse, {}, {
                    onUpdate(target, ratio) {
                        comOpacity.opacity = isUp ? 255 * ratio : 255 * (1 - ratio);
                    },
                })
                .call(() => { isUp = !isUp })
            listTweenFlicker.push(t);
        }

        // run tween
        Tween.stopAllByTarget(this.node);
        this.SetDefaultState();
        this.node.active = true;
        isUp = true;
        tween(this.node)
            .sequence(...listTweenFlicker)
            .call(this.SetDefaultState.bind(this))
            .start();
    }

    public SetDefaultState() {
        this.node.active = false;
        this.node.getComponent(UIOpacity).opacity = 0;
    }
}


