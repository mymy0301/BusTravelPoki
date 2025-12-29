import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VisualBtnPause')
export class VisualBtnPause extends Component {
    @property(Node) nVisualOn: Node;
    @property(Node) nVisualOff: Node;

    public ChangeVisual(isOn: boolean) {
        this.nVisualOn.active = isOn;
        this.nVisualOff.active = !isOn;
    }
}


