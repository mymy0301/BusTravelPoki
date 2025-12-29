import { _decorator, Component, Node, tween, UIOpacity } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { MConst } from '../Const/MConst';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('ShowNodeWithOpacity')
@requireComponent(UIOpacity)
@disallowMultiple
export class ShowNodeWithOpacity extends Component {
    protected onLoad(): void {
        clientEvent.on(MConst.NODE_WITH_OPACITY.PREPARE_OPACITY, this.PrepareOpacity, this);
        clientEvent.on(MConst.NODE_WITH_OPACITY.SHOW, this.Show, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.NODE_WITH_OPACITY.PREPARE_OPACITY, this.PrepareOpacity, this);
        clientEvent.off(MConst.NODE_WITH_OPACITY.SHOW, this.Show, this);
    }

    public PrepareOpacity() {
        const opaCom = this.node.getComponent(UIOpacity);
        opaCom.opacity = 0;
    }

    public Show(timeOpacity: number = 1) {
        const opaCom = this.node.getComponent(UIOpacity);
        tween(opaCom)
            .to(timeOpacity, { opacity: 255 })
            .call(() => {
                opaCom.opacity = 255;
            })
            .start();
    }

    public Hide(timeOpacity: number = 1) {
        const opaCom = this.node.getComponent(UIOpacity);
        tween(opaCom)
            .to(timeOpacity, { opacity: 0 })
            .call(() => {
                opaCom.opacity = 0;
            })
            .start();
    }
}


