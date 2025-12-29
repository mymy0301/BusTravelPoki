import { _decorator, Component, Label, Node } from 'cc';
import { DataEventsSys } from '../../DataEventsSys';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_TUT_EVENT_LOBBY, UITutLobby } from '../../LobbyScene/UITutLobby';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { EVENT_SEASON_PASS } from '../../OtherUI/UISeasonPass/TypeSeasonPass';
import { CaculTimeEvents2 } from '../../LobbyScene/CaculTimeEvents2';
import { TYPE_RUN_TUT_EVENT } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { DataSeasonPassSys } from '../../../DataBase/DataSeasonPassSys';
const { ccclass, property } = _decorator;

@ccclass('LogicTutEventSeasonPass')
export class LogicTutEventSeasonPass extends Component {
    @property(Label) lbTime: Label;
    @property(Node) nNotification: Node;
    @property({ type: TYPE_RUN_TUT_EVENT }) typeTut: TYPE_RUN_TUT_EVENT = TYPE_RUN_TUT_EVENT.HAND_CLICK;
    @property(Node) nBgClaim: Node;



    public JustCheckTut(): boolean {
        const logic1 = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS);
        const logic2 = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SEASON_PASS);
        const logic3 = this.node.active == true;
        const logic4 = DataEventsSys.Instance._listTypeEventShow.includes(TYPE_EVENT_GAME.SEASON_PASS);
        return !logic1 && !logic2 && logic3 && logic4;
    }

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

    //===========================================
    // #region tut 1
    public CheckLogic_1(): boolean {
        // check if player has enough to play tutorial event
        // gen hand point to Info
        // show shadow
        // copy node info

        const valid = this.JustCheckTut();
        if (valid) {
            // you need create new event when it is unlock in the first time
            clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.SEASON_PASS);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW, TYPE_TUT_EVENT_LOBBY.TUT_SEASON_PASS, this.node);
            // clientEvent.dispatchEvent(MConst.EVENT_BUILDING.PLAY_TUT_BUILDING, this.nVisualTutSeasonPass, 0.5);

            // emit event to load the new UI season pass Event
            clientEvent.dispatchEvent(EVENT_SEASON_PASS.LOAD_IMAGE_FORCE);
            return true;
        }
        return false;
    }

    public CheckLogicDone_1() {
        const valid = this.JustCheckTut();
        if (valid) {
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.SEASON_PASS);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_END, TYPE_TUT_EVENT_LOBBY.TUT_SEASON_PASS, this.node);
            // clientEvent.dispatchEvent(MConst.EVENT_BUILDING.TUT_BUILDING_DONE);

            CaculTimeEvents2.Instance.CheckCanResumeOrGenEvent(TYPE_EVENT_GAME.SEASON_PASS);
        }
    }

    // #endregion tut 1
    //===========================================

    //===========================================
    //#region TUT 2
    private CheckLogic_2(): boolean {
        const valid = this.JustCheckTut();
        if (valid) {
            DataSeasonPassSys.Instance.SetReceiveLastOldTypeSeasonPass(true);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.SEASON_PASS);
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTOIRAL_IN_LOBBY, 2, true, TYPE_EVENT_GAME.SEASON_PASS);
            this.nBgClaim.active = this.nNotification.active = false;
            return true;
        }
        return false;
    }

    private CheckLogicDone_2() {
        const valid = this.JustCheckTut();
        if (valid) {
            this.nBgClaim.active = this.nNotification.active = true;
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.SEASON_PASS);
            CaculTimeEvents2.Instance.CheckCanResumeOrGenEvent(TYPE_EVENT_GAME.SEASON_PASS);
        }
    }
    //#endregion TUT 2
    //===========================================
}


