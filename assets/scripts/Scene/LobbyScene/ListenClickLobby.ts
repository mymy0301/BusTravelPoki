import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ListenClickLobby')
export class ListenClickLobby extends Component {
    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.OnClick, this, true);
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.IncreaseTime, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.OnClick, this, true);
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.IncreaseTime, this);
    }

    private _mTime: number = 0;
    private _maxTime: number = 4;
    private OnClick() {
        this._mTime = 0;
    }

    private IncreaseTime() {
        this._mTime += 1;
        // not increase too much
        if (this._mTime > 100) { this._mTime = 0; }
        // check condition to trigger
        if (this._mTime > 0 && this._mTime % this._maxTime == 0) {
            clientEvent.dispatchEvent(MConst.EVENT.IMPRESS_BTN_PLAY);
        }
    }

}


