import { _decorator, Component, Node } from 'cc';
import { DataEventsSys } from '../../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { TYPE_TUT_EVENT_LOBBY, UITutLobby } from '../../LobbyScene/UITutLobby';
import { clientEvent } from '../../../framework/clientEvent';
import { TYPE_RUN_TUT_EVENT } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
const { ccclass, property } = _decorator;

@ccclass('LogicTutEventTreasureTrail')
export class LogicTutEventTreasureTrail extends Component {
    @property(Node) nEventName: Node;
    @property(Node) nLbStart: Node;
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
        const check1: boolean = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
        const check2: boolean = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
        const check3: boolean = this.node.active == true;
        const logic4 = DataEventsSys.Instance._listTypeEventShow.includes(TYPE_EVENT_GAME.TREASURE_TRAIL);

        return (!check1 && !check2 && check3 && logic4);
    }

    //#region TUT 1
    private CheckLogic_1(): boolean {
        // check if player has enough to play tutorial event win streak
        // gen hand point to Info
        // show shadow
        // copy node info

        // const valid = this.JustCheckTut();
        // if (valid) {
        //     clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW, TYPE_TUT_EVENT_LOBBY.TREASURE_TRAIL, this.node);
        //     return true;
        // }
        return false;
    }

    private CheckLogicDone_1() {
        // const valid = this.JustCheckTut();
        // if (valid) {
        //     this.nEventName.active = false;
        //     DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
        //     clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_END, TYPE_TUT_EVENT_LOBBY.TREASURE_TRAIL, this.node);
        // }
    }
    //#endregion TUT 1

    //#region TUT 2
    private CheckLogic_2(): boolean {
        const valid = this.JustCheckTut();
        if (valid) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTOIRAL_IN_LOBBY, 2, true, TYPE_EVENT_GAME.TREASURE_TRAIL);
            return true;
        }
        return false;
    }

    private CheckLogicDone_2() {
        const valid = this.JustCheckTut();
        if (valid) {
            DataTreasureTrailSys.Instance.UnlockEventByTut();
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
            this.nEventName.active = false;
            this.nLbStart.active = true;
            // if (DataEventsSys.Instance.IsEventShowButLock(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
            //     this.nLbStart.active = false;
            // } else {
            // }
        }
    }
    //#endregion TUT 2
}


