import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

enum STATE_ADD_ON_SPE_01 {
    ON,
    OFF
}

@ccclass('AddOnSpeNoItem01')
export class AddOnSpeNoItem01 extends Component {
    private _stateAddOnSpe: STATE_ADD_ON_SPE_01 = STATE_ADD_ON_SPE_01.OFF;

    private ChangeState(state: STATE_ADD_ON_SPE_01) {
        this._stateAddOnSpe = state;
        switch (state) {
            case STATE_ADD_ON_SPE_01.ON:
                this.node.active = true;
                break;
            case STATE_ADD_ON_SPE_01.OFF:
                this.node.active = false;
                break;
        }
    }

    public ChangeStateAddOn(turnOn: boolean) {
        this.ChangeState(turnOn ? STATE_ADD_ON_SPE_01.ON : STATE_ADD_ON_SPE_01.OFF);
    }

    public GetStateAddOn(): boolean {
        return this._stateAddOnSpe == STATE_ADD_ON_SPE_01.ON;
    }
}


