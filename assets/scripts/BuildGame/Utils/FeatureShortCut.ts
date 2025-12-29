import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FeatureShortCut')
export class FeatureShortCut extends Component {
    // [1]
    // Show/Hide ảnh nền game và đường ô tô

    @property({ group: "Show/Hide ảnh nền game và đường ô tô", type: [Node], displayOrder: 0 }) listNUIBgInGame: Node[] = [];

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.DIGIT_1:
                // [1]
                // Show/Hide ảnh nền game và đường ô tô
                this.listNUIBgInGame.forEach(element => element.active = !element.active);
                break;
        }
    }
}


