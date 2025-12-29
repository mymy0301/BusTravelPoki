import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FeatureChangePosItemInMap')
export class FeatureChangePosItemInMap extends Component {
    @property(Node) nMap: Node;
    @property(Node) btnMoveDown: Node;
    @property(Node) btnMoveUp: Node;
    @property(Node) btnMoveLeft: Node;
    @property(Node) btnMoveRight: Node;

    protected onLoad(): void {
        const self = this;

        function registerHoldButton(nBtn: Node, cb: CallableFunction) {
            if (nBtn == null) return;
            
            let isPressing = false;
            nBtn.on(Node.EventType.TOUCH_START, () => {
                isPressing = true;
                self.schedule(cb, 0.1);
            }, this);
            nBtn.on(Node.EventType.TOUCH_END, () => {
                isPressing = false;
                self.unschedule(cb);
            }, this);
            nBtn.on(Node.EventType.TOUCH_CANCEL, () => {
                isPressing = false;
                self.unschedule(cb);
            }, this);
        }

        registerHoldButton(this.btnMoveDown, this.OnBtnMoveDown.bind(this));
        registerHoldButton(this.btnMoveUp, this.OnBtnMoveUp.bind(this));
        registerHoldButton(this.btnMoveLeft, this.OnBtnMoveLeft.bind(this));
        registerHoldButton(this.btnMoveRight, this.OnBtnMoveRight.bind(this));
    }

    OnBtnMoveDown() {
        for (const child of this.nMap.children) {
            child.setPosition(child.getPosition().x, child.getPosition().y - 1);
        }
    }

    OnBtnMoveUp() {
        for (const child of this.nMap.children) {
            child.setPosition(child.getPosition().x, child.getPosition().y + 1);
        }
    }

    OnBtnMoveLeft() {
        for (const child of this.nMap.children) {
            child.setPosition(child.getPosition().x - 1, child.getPosition().y);
        }
    }

    OnBtnMoveRight() {
        for (const child of this.nMap.children) {
            child.setPosition(child.getPosition().x + 1, child.getPosition().y);
        }
    }
}


