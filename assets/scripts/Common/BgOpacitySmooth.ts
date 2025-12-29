import { _decorator, CCInteger, Component, Node, tween, UIOpacity } from 'cc';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('BgOpacitySmooth')
@requireComponent(UIOpacity)
@disallowMultiple
export class BgOpacitySmooth extends Component {

    @property(CCInteger) maxOpacity: number = 255;

    public ShowBgIncreaseSmooth() {
        const opaCom = this.node.getComponent(UIOpacity);
        const timeOpacity = 0.5;
        const self = this;
        opaCom.opacity = 0;
        tween(this.node)
            .to(timeOpacity, {}, {
                onUpdate(target, ratio) {
                    opaCom.opacity = self.maxOpacity * ratio;
                },
            })
            .start();
    }
}

