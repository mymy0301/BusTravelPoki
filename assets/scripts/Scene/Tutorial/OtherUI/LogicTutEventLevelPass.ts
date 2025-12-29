import { _decorator, Component, Node } from 'cc';
import { DataEventsSys } from '../../DataEventsSys';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { TYPE_TUT_EVENT_LOBBY, UITutLobby } from '../../LobbyScene/UITutLobby';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { TYPE_RUN_TUT_EVENT } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { CaculTimeEvents2 } from '../../LobbyScene/CaculTimeEvents2';
import { DataLevelPassSys } from '../../../DataBase/DataLevelPassSys';
const { ccclass, property } = _decorator;

@ccclass('LogicTutEventLevelPass')
export class LogicTutEventLevelPass extends Component {
    @property(Node) nLbTime: Node;
    @property(Node) nNotification: Node;
    @property({ type: TYPE_RUN_TUT_EVENT }) typeTut: TYPE_RUN_TUT_EVENT = TYPE_RUN_TUT_EVENT.HAND_CLICK;


    @property(Node) nBgClaim: Node;
    // @property(Node) nBgNotification: Node;

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

    public JustCheckTut() {
        const logic1 = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PASS);
        const logic2 = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PASS);
        const logic3 = this.node.active == true;
        const logic4 = DataEventsSys.Instance._listTypeEventShow.includes(TYPE_EVENT_GAME.LEVEL_PASS);

        return !logic1 && !logic2 && logic3 && logic4;
    }

    //#region TUT 1
    private CheckLogic_1() {
        // check if player has enough to play tutorial event win streak
        // gen hand point to Info
        // show shadow
        // copy node info
        const valid = this.JustCheckTut();
        if (valid) {
            this.nLbTime.active = this.nBgClaim.active = this.nNotification.active = false;
            // this.nBgNotification.active = false;

            // you need create new event when it is unlock in the first time
            clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.LEVEL_PASS);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_SHOW, TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PASS, this.node);

            // ở đây mình gọi thêm một lần nữa turn off vì lo rằng có thể ở đoạn mess emit kia lỡ có logic nào đó bật những UI mà mình không muốn lên nên gọi một lần nữa cho chắc
            this.nLbTime.active = this.nBgClaim.active = this.nNotification.active = false;
            // this.nBgNotification.active = false;

            return true;
        }
        return false;
    }

    private CheckLogicDone_1() {
        const valid = this.JustCheckTut();
        if (valid) {
            // this.nBgNotification.active = true;
            this.nBgClaim.active = true;

            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.LEVEL_PASS);
            clientEvent.dispatchEvent(UITutLobby.EVENT_TUT_END, TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PASS, this.node);
        }
    }
    //#endregion TUT 1

    //#region TUT 2
    private CheckLogic_2() {
        const valid = this.JustCheckTut();
        if (valid) {
            // you need create new event when it is unlock in the first time
            clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.LEVEL_PASS);
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TUTOIRAL_IN_LOBBY, 2, true, TYPE_EVENT_GAME.LEVEL_PASS);
            this.nBgClaim.active = this.nNotification.active = false;
            return true;
        }
        return false;
    }

    private CheckLogicDone_2() {
        const valid = this.JustCheckTut();
        if (valid) {
            this.nBgClaim.active = this.nNotification.active = true;
            DataEventsSys.Instance.SetPlayedTutorialEvent(TYPE_EVENT_GAME.LEVEL_PASS);
            CaculTimeEvents2.Instance.CheckCanResumeOrGenEvent(TYPE_EVENT_GAME.LEVEL_PASS);
        }
    }
    //#endregion TUT 2
}


