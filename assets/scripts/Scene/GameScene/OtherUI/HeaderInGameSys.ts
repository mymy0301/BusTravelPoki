import { _decorator, Component, Node } from 'cc';
import { TimeInGameSys } from '../../TimeInGameSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { GameManager } from '../../GameManager';
import { TYPE_GAME } from '../../../Configs/MConfigs';
import { TYPE_LOSE_GAME } from '../../../Utils/Types';
import { TimeInGameTournamentSys } from '../../TimeInGameTournamentSys';
import { TimeInGameWithFriendSys } from '../../../WithFriend/TimeInGameWithFriendSys';
const { ccclass, property } = _decorator;

@ccclass('HeaderInGameSys')
export class HeaderInGameSys extends Component {
    @property(TimeInGameSys) timeInGameSys: TimeInGameSys;
    @property(TimeInGameTournamentSys) timeInGameTournamentSys: TimeInGameTournamentSys;
    @property(TimeInGameWithFriendSys) timeInGameWithFriendSys: TimeInGameWithFriendSys = null;

    protected onLoad(): void {
        this.timeInGameSys.node.active = false;
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetGame, this);
        clientEvent.on(MConst.EVENT.RESUME_GAME, this.ResumeTime, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetGame, this);
        clientEvent.off(MConst.EVENT.RESUME_GAME, this.ResumeTime, this);
    }

    private PauseGame() {
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                break;
            case TYPE_GAME.NORMAL:
                this.timeInGameSys.PauseTime();
                break;
            case TYPE_GAME.TOURNAMENT:
                this.timeInGameTournamentSys.PauseTime();
                break;
            case TYPE_GAME.WITH_FRIEND:
                this.timeInGameWithFriendSys.PauseTime();
                break;
        }
    }

    private ResetGame() {
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                break;
            case TYPE_GAME.NORMAL:
                this.timeInGameSys.ResetTime();
                break;
            case TYPE_GAME.TOURNAMENT:
                this.timeInGameTournamentSys.ResetTime();
                break;
            case TYPE_GAME.WITH_FRIEND:
                this.timeInGameWithFriendSys.ResetTime();
                break;
        }
    }

    private ResumeTime() {
        if (GameManager.Instance == null) { return; }
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                break;
            case TYPE_GAME.NORMAL:
                this.timeInGameSys.StartTime();
                break;
            case TYPE_GAME.TOURNAMENT:
                this.timeInGameTournamentSys.StartTime();
                break;
            case TYPE_GAME.WITH_FRIEND:
                this.timeInGameWithFriendSys.StartTime();
                break;
        }
    }


    public StartTime() {
        // console.log("StartTime", GameManager.Instance.TypeGamePlay);
        if (GameManager.Instance == null) { return; }
        if (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL) {
            this.timeInGameSys.StartTime();
        } else if (GameManager.Instance.TypeGamePlay == TYPE_GAME.TOURNAMENT) {
            this.timeInGameTournamentSys.StartTime();
        } else if (GameManager.Instance.TypeGamePlay == TYPE_GAME.WITH_FRIEND) {
            this.timeInGameWithFriendSys.StartTime();
        }
    }

    //#region common
    public PrepareToShowUp() {
        this.HideTime();
    }

    public ChangeTime(time: number) {
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL:
                // this.timeInGameSys.SetUpTime(GameManager.Instance.JsonPlayGame.TIME);
                // this.timeInGameSys.RegisterEventListen(() => {
                //     // emit lose game from time
                //     clientEvent.dispatchEvent(MConst.EVENT.LOSE_GAME, TYPE_LOSE_GAME.OVER_TIME);
                // })
                break;
            case TYPE_GAME.TOURNAMENT:
                this.timeInGameTournamentSys.SetUpTime(0);
                break;
            case TYPE_GAME.WITH_FRIEND:
                this.timeInGameWithFriendSys.SetUpTime(0);
                break;
        }
    }

    public HideTime() {
        if (GameManager.Instance == null) { return; }
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL:
                this.timeInGameSys.node.active = false;
                break;
            case TYPE_GAME.TOURNAMENT:
                // this.timeInGameTournamentSys.node.active = false;
                break;
            case TYPE_GAME.WITH_FRIEND:
                // this.timeInGameWithFriendSys.node.active = false;
                break;
        }
    }

    public PauseTime() {
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                break;
            case TYPE_GAME.NORMAL:
                this.timeInGameSys.PauseTime();
                break;
            case TYPE_GAME.TOURNAMENT:
                this.timeInGameTournamentSys.PauseTime();
                break;
            case TYPE_GAME.WITH_FRIEND:
                this.timeInGameWithFriendSys.PauseTime();
                break;
        }
    }
    //#endregion common
}


