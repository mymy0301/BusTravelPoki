import { _decorator, Component, Node } from 'cc';
import { DataEventsSys } from '../../DataEventsSys';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_TUT_EVENT_LOBBY, UITutLobby } from '../../LobbyScene/UITutLobby';
import { IOpenUIBaseWithInfo, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { EVENT_LEVEL_PROGRESS, LEVEL_PROGRESS_DESCRIBE_NOTI, STATE_EVENT_LEVEL_PROGRESS } from '../../OtherUI/UILevelProgression/TypeLevelProgress';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { EVENT_TUT_LOBBY, TYPE_RUN_TUT_EVENT } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
const { ccclass, property } = _decorator;

@ccclass('LogicTutEventLevelProgression')
export class LogicTutEventLevelProgression extends Component {
    @property(Node) nVisualTutLevelProgression: Node;
    @property({ type: TYPE_RUN_TUT_EVENT }) typeTut: TYPE_RUN_TUT_EVENT = TYPE_RUN_TUT_EVENT.SCALE_IMPRESS;


    public JustCheckTut(): boolean {
        const logic1 = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
        const logic2 = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
        return !logic1 && !logic2;
    }

    public CheckLogic(): boolean {
        // check if player has enough to play tutorial event
        // gen hand point to Info
        // show shadow
        // copy node info

        switch (this.typeTut) {
            case TYPE_RUN_TUT_EVENT.HAND_CLICK: return this.CheckLogic_1();
            case TYPE_RUN_TUT_EVENT.SCALE_IMPRESS: return this.CheckLogic_2();
        }
    }

    public CheckLogicDone() {
        switch (this.typeTut) {
            case TYPE_RUN_TUT_EVENT.HAND_CLICK: this.CheckLogicDone_1();
            case TYPE_RUN_TUT_EVENT.SCALE_IMPRESS: this.CheckLogicDone_2();
        }
    }

    //=====================================
    //#region TUT 1
    private CheckLogic_1(): boolean {
        const valid = this.JustCheckTut();
        if (valid) {
            DataLevelProgressionSys.Instance.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW, TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PROGRESSION, this.node);
            return true;
        }
        return false;
    }

    private CheckLogicDone_1() {
        const valid = this.JustCheckTut();
        if (valid) {
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_END, TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PROGRESSION, this.node);
        }
    }
    //#endregion TUT 1
    //=====================================

    //=====================================
    //#region TUT 2
    private CheckLogic_2(): boolean {
        const valid = this.JustCheckTut();
        if (valid) {
            DataLevelProgressionSys.Instance.ChangeStateEvent(STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN);
            // clientEvent.dispatchEvent(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE);
            // clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW_SCALE_IMPRESS, TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PROGRESSION, this.node, () => {
            // clientEvent.dispatchEvent(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE);
            // });
            return true;
        }
        return false;
    }

    private CheckLogicDone_2() {
        const valid = this.JustCheckTut();
        if (valid) {
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.LEVEL_PROGRESSION);

            const dataCustomBase: IOpenUIBaseWithInfo = { isShowInfo: true }
            clientEvent.dispatchEvent(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE);
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1, true, [dataCustomBase]);
        }
    }
    //#endregion TUT 2
    //=====================================
}


