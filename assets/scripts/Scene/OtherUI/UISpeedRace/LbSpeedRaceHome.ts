import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { CONFIG_SR, STATE_SPEED_RACE } from './TypeEventSpeedRace';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { DataEventsSys } from '../../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('LbSpeedRaceHome')
export class LbSpeedRaceHome extends Component {
    @property(Node) nLbStart: Node;
    @property(Node) nLbClaim: Node;
    @property(Node) nLbTime: Node;

    protected onEnable(): void {
        clientEvent.on(CONFIG_SR.TRY_CHANGE_TITLE, this.TryChangeTitle, this);
    }

    protected onDisable(): void {
        clientEvent.off(CONFIG_SR.TRY_CHANGE_TITLE, this.TryChangeTitle, this);
    }

    protected start(): void {
        this.TryChangeTitle();
    }

    private TryChangeTitle() {
        const isPlayTut = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SPEED_RACE);
        if (!isPlayTut) return;

        const stateEvent = DataSpeedRace.Instance.GetState;

        switch (true) {
            case !DataSpeedRace.Instance.IsPlayInfo()
                || stateEvent == STATE_SPEED_RACE.END_EVENT:
                this.nLbStart.active = true;
                this.nLbClaim.active = false;
                this.nLbTime.active = false;
                break;
            case stateEvent == STATE_SPEED_RACE.JOINING || (stateEvent == STATE_SPEED_RACE.WAIT_RECEIVE && DataSpeedRace.Instance.IsReceivePrizeSummery()):
                this.nLbTime.active = true;
                this.nLbStart.active = false;
                this.nLbClaim.active = false;
                break;
            case stateEvent == STATE_SPEED_RACE.END_EVENT:
                this.nLbClaim.active = true;
                this.nLbTime.active = false;
                this.nLbStart.active = false;
                break;
        }
    }
}


