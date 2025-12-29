import { _decorator, Component, Node, UIOpacity } from 'cc';
import { PlayAnimInfo } from './ScriptSupport/AnimInfo';
const { ccclass, property } = _decorator;

enum Type_Block_UI {
    TapToContinue,
    BlockNoClick
}

@ccclass('InfoUIBase')
export class InfoUIBase extends Component {
    @property([Node]) nStickers: Node[] = [];
    @property(Node) nLbTapToContinue: Node;
    @property(Node) nBlockUI: Node;

    private _cbClose: CallableFunction = null;

    public async Show(cbCustomShow: CallableFunction = null) {
        this.node.active = true;
        // set all ui opacity to 0
        this.nStickers.forEach(element => {
            element.getComponent(UIOpacity).opacity = 0;
        })
        this.nLbTapToContinue.getComponent(UIOpacity).opacity = 0;

        // set onClickForNBlockUI
        this.SetBlockUI(Type_Block_UI.BlockNoClick);

        if (cbCustomShow == null) {
            await PlayAnimInfo(this.nStickers, this.nLbTapToContinue);
        } else {
            await cbCustomShow(this.nStickers, this.nLbTapToContinue);
        }

        // set onClickForNBlockUI
        this.SetBlockUI(Type_Block_UI.TapToContinue);
    }

    private SetBlockUI(type: Type_Block_UI) {
        switch (type) {
            case Type_Block_UI.BlockNoClick:
                this.nBlockUI.off(Node.EventType.TOUCH_START, this.CloseUI, this);
                break;
            case Type_Block_UI.TapToContinue:
                this.nBlockUI.on(Node.EventType.TOUCH_START, this.CloseUI, this);
                break;
            default: break;
        }
    }

    private CloseUI() {
        this.node.active = false;
        if (this._cbClose != null) {
            this._cbClose();
        }
    }

    registerCallback(cbClose: CallableFunction) {
        this._cbClose = cbClose;
    }

    unRegisterAllCallback() {
        this._cbClose = null;
    }
}


