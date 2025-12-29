import { _decorator, Component, Label, Node } from 'cc';
import { DataEventsSys } from '../../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_TUT_EVENT_LOBBY, UITutLobby } from '../../LobbyScene/UITutLobby';
import { TYPE_RUN_TUT_EVENT } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
const { ccclass, property } = _decorator;

@ccclass('LogicTutEventSkyLift')
export class LogicTutEventSkyLift extends Component {
    @property({ type: TYPE_RUN_TUT_EVENT }) typeTut: TYPE_RUN_TUT_EVENT = TYPE_RUN_TUT_EVENT.HAND_CLICK;
    @property(Label) lbNameEvent: Label;

    public CheckLogic(): boolean {
        switch (this.typeTut) {
            case TYPE_RUN_TUT_EVENT.HAND_CLICK: return this.CheckLogic_1();
            case TYPE_RUN_TUT_EVENT.POP_UP_TUT:
                return this.CheckLogic_2();
        }
    }

    public CheckLogicDone() {
        switch (this.typeTut) {
            case TYPE_RUN_TUT_EVENT.HAND_CLICK: this.CheckLogicDone_1(); break;
            case TYPE_RUN_TUT_EVENT.POP_UP_TUT: this.CheckLogicDone_2(); break;
        }
    }

    public JustCheckTut() {
        const logic1 = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SKY_LIFT);
        const logic2 = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SKY_LIFT);
        const logic3 = this.node.active == true;
        const logic4 = DataEventsSys.Instance._listTypeEventShow.includes(TYPE_EVENT_GAME.SKY_LIFT);
        return !logic1 && !logic2 && logic3 && logic4;
    }

    //#region TUT 1
    private CheckLogic_1(): boolean {
        // check if player has enough to play tutorial event invite friend
        // gen hand point to Info
        // show shadow
        // copy node info

        const valid = this.JustCheckTut();
        if (valid) {
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW, TYPE_TUT_EVENT_LOBBY.TUT_SKY_LIFT, this.node);
            // console.log("Check call in this case");
            return true;
        }
        return false;
    }

    private CheckLogicDone_1() {
        const valid = this.JustCheckTut();
        if (valid) {
            this.lbNameEvent.node.active = false;
            // init new event
            DataSkyLiftSys.Instance.InitNewEvent();
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.SKY_LIFT);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_END, TYPE_TUT_EVENT_LOBBY.TUT_SKY_LIFT, this.node);
        }
    }
    //#endregion TUT 1

    //#region TUT 2
    private CheckLogic_2(): boolean {
        const valid = this.JustCheckTut();
        if (valid) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTOIRAL_IN_LOBBY, 2, true, TYPE_EVENT_GAME.SKY_LIFT);
            return true;
        }
        return false;
    }

    private CheckLogicDone_2() {
        const valid = this.JustCheckTut();
        if (valid) {
            this.lbNameEvent.node.active = false;
            // init new event
            DataSkyLiftSys.Instance.InitNewEvent();
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.SKY_LIFT);
        }
    }
    //#endregion TUT 2
}


