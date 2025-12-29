import { _decorator, Component, Node } from 'cc';
import { DataEventsSys } from '../../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { TYPE_TUT_EVENT_LOBBY, UITutLobby } from '../../LobbyScene/UITutLobby';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_RUN_TUT_EVENT } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { MConst, TYPE_UI } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('LogicTutEventSpin')
export class LogicTutEventSpin extends Component {
    @property(Node) nLbTime: Node;
    @property(Node) nNotification: Node;
    @property(Node) nEventName: Node;
    @property({ type: TYPE_RUN_TUT_EVENT }) typeTut: TYPE_RUN_TUT_EVENT = TYPE_RUN_TUT_EVENT.HAND_CLICK;

    public CheckLogic(): boolean {
        switch (this.typeTut) {
            case TYPE_RUN_TUT_EVENT.HAND_CLICK: return this.CheckLogic_1();
            case TYPE_RUN_TUT_EVENT.POP_UP_TUT: return this.CheckLogic_2();
        }
    }

    public CheckLogicDone() {
        switch (this.typeTut) {
            case TYPE_RUN_TUT_EVENT.HAND_CLICK: this.CheckLogicDone_1();
            case TYPE_RUN_TUT_EVENT.POP_UP_TUT: this.CheckLogicDone_2();
        }
    }

    public JustCheckTut() {
        const check1: boolean = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SPIN);
        const check2: boolean = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SPIN);
        const check3: boolean = this.node.active == true;
        const logic4 = DataEventsSys.Instance._listTypeEventShow.includes(TYPE_EVENT_GAME.SPIN);

        return (!check1 && !check2 && check3 && logic4);
    }

    //#region TUT 1
    private CheckLogic_1(): boolean {
        // check if player has enough to play tutorial event win streak
        // gen hand point to Info
        // show shadow
        // copy node info
        const valid = this.JustCheckTut();

        if (valid) {
            this.nLbTime.active = false;
            this.nNotification.active = false;
            this.nEventName.active = false;
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW, TYPE_TUT_EVENT_LOBBY.TUT_SPIN, this.node);
            return true;
        }
        return false;
    }

    private CheckLogicDone_1() {
        const isValid = this.JustCheckTut();
        if (isValid) {
            this.nNotification.active = true;
            this.nEventName.active = true;
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.SPIN);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_END, TYPE_TUT_EVENT_LOBBY.TUT_SPIN, this.node);
        }
    }
    //#endregion TUT 1

    //#region TUT 2
    private CheckLogic_2(): boolean {
        const valid = this.JustCheckTut();
        if (valid) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTOIRAL_IN_LOBBY, 2, true, TYPE_EVENT_GAME.SPIN);
            return true;
        }
        return false;
    }

    private CheckLogicDone_2() {
        const valid = this.JustCheckTut();
        if (valid) {
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.SPIN);
            this.nNotification.active = true;
        }
    }
    //#endregion TUT 2
}


