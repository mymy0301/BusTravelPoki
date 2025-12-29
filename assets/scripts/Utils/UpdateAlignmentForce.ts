import { _decorator, CCBoolean, Component, Node, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UpdateAlignmentForce')
export class UpdateAlignmentForce extends Component {
    @property(CCBoolean) isAuto = false;
    @property(Node) nCanvas: Node;

    protected start(): void {
        if (this.isAuto) {
            this.UpdateAlignmentSelf();
        }
    }

    public UpdateAlignmentSelf() {
        this.nCanvas.getComponent(Widget).updateAlignment();
        this.nCanvas.getComponentsInChildren(Widget).forEach(item => item.updateAlignment());
    }
}


