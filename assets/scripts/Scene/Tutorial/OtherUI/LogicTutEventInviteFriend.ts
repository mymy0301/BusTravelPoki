import { _decorator, CCInteger, Component, Label, Node } from 'cc';
import { DataEventsSys } from '../../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_TUT_EVENT_LOBBY, UITutLobby } from '../../LobbyScene/UITutLobby';
import { IDataCustomTutorialInLobby, TYPE_RUN_TUT_EVENT } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { MConst, TYPE_UI } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('LogicTutEventInviteFriend')
export class LogicTutEventInviteFriend extends Component {
    @property(Label) lbTime: Label;
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
            case TYPE_RUN_TUT_EVENT.HAND_CLICK: this.CheckLogicDone_1(); break;
            case TYPE_RUN_TUT_EVENT.POP_UP_TUT: this.CheckLogicDone_2(); break;
        }
    }

    private CheckLogic_1(): boolean {
        // check if player has enough to play tutorial event invite friend
        // gen hand point to Info
        // show shadow
        // copy node info
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.INVITE_FRIEND) && !DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND)) {
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW, TYPE_TUT_EVENT_LOBBY.TUT_INVITE_FRIEND, this.node);
            // console.log("Check call in this case");

            this.lbTime.node.active = false;
            this.nEventName.active = false;
            return true;
        }
        return false;
    }

    private CheckLogicDone_1() {
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.INVITE_FRIEND) && !DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND)) {
            this.nEventName.active = true;
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_END, TYPE_TUT_EVENT_LOBBY.TUT_INVITE_FRIEND, this.node);
        }
    }

    private CheckLogic_2(): boolean {
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.INVITE_FRIEND) && !DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND)) {
            // emit show UI PopUp Tut
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTOIRAL_IN_LOBBY, 2, true, TYPE_EVENT_GAME.INVITE_FRIEND);
            return true;
        }
        return false;
    }

    private CheckLogicDone_2() {
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.INVITE_FRIEND) && !DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND)) {
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.INVITE_FRIEND);
        }
    }
}


