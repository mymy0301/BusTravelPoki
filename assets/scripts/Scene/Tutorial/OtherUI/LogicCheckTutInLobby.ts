import { _decorator, Component, Node } from 'cc';
import { IOpenUIBaseWithInfo, IUIKeepTutAndReceiveLobby, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { LogicTutEventSpin } from './LogicTutEventSpin';
import { LogicTutEventSeasonPass } from './LogicTutEventSeasonPass';
import { LogicTutEventInviteFriend } from './LogicTutEventInviteFriend';
import { LogicTutEventLoginReward } from './LogicTutEventLoginReward';
import { LogicTutEventLevelPass } from './LogicTutEventLevelPass';
import { EVENT_TUT_LOBBY } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { LogicTutEventPiggyBank } from './LogicTutEventPiggyBank';
import { LogicTutEventDashRush } from './LogicTutEventDashRush';
import { LogicTutEventSpeedRace } from './LogicTutEventSpeedRace';
import { LogicTutEventEndlessTreasure } from './LogicTutEventEndlessTreasure';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { LogicTutEventLevelProgression } from './LogicTutEventLevelProgression';
import { LogicTutEventTreasureTrail } from './LogicTutEventTreasureTrail';
import { LogicTutEventSkyLift } from './LogicTutEventSkyLift';
import { IOpenNewEvent } from '../../OtherUI/UISkyLift/TypeSkyLift';
import { DataEventsSys } from '../../DataEventsSys';
import { LogicTutEventChristmas } from './LogicTutEventChristmas';
const { ccclass, property } = _decorator;

@ccclass('LogicCheckTutInLobby')
export class LogicCheckTutInLobby extends Component {


    @property(LogicTutEventSpin) tutEventSpin: LogicTutEventSpin;
    @property(LogicTutEventSeasonPass) tutEventSeasonPass: LogicTutEventSeasonPass;
    @property(LogicTutEventInviteFriend) tutEventInviteFriend: LogicTutEventInviteFriend;
    @property(LogicTutEventLoginReward) tutEventLoginReward: LogicTutEventLoginReward;
    @property(LogicTutEventLevelPass) tutEventLevelPass: LogicTutEventLevelPass;
    @property(LogicTutEventPiggyBank) tutEventPiggyBank: LogicTutEventPiggyBank;
    @property(LogicTutEventDashRush) tutEventDashRush: LogicTutEventDashRush;
    @property(LogicTutEventSpeedRace) tutEventSpeedRace: LogicTutEventSpeedRace;
    @property(LogicTutEventEndlessTreasure) tutEventEndlessTreasure: LogicTutEventEndlessTreasure;
    @property(LogicTutEventLevelProgression) tutEventLevelProgression: LogicTutEventLevelProgression;
    @property(LogicTutEventTreasureTrail) tutEventTreasureTrail: LogicTutEventTreasureTrail;
    @property(LogicTutEventSkyLift) tutEventSkyLift: LogicTutEventSkyLift;
    @property(LogicTutEventChristmas) tutEventChristmas: LogicTutEventChristmas;
    private _tutShow: TYPE_EVENT_GAME = null;
    private _previousTut: TYPE_EVENT_GAME = null;

    /**
     * param này sẽ được set thành false mỗi khi chạy một tut event
     * và được set thành true sau trước khi close một UI nào đó<Điều này phụ thuộc vào kịch bản xuất hiện của UI đó , sẽ tùy thuộc cái sẽ set true và cái không>
     */
    private _enableCheckTut: boolean = false;

    protected onLoad(): void {
        clientEvent.on(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE, this.TutCheckDone, this);
        // clientEvent.on(EVENT_TUT_LOBBY.RUN_LOGIC_CHECK_TUT, this.RunLogicCheckTut, this);
        clientEvent.on(EVENT_TUT_LOBBY.TRY_SHOW_POP_UP_UI, this.TryShowPopUpEvent, this);
        clientEvent.on(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, this.ChangeEnableCheckLogicTut, this);
    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE, this.TutCheckDone, this);
        // clientEvent.off(EVENT_TUT_LOBBY.RUN_LOGIC_CHECK_TUT, this.RunLogicCheckTut, this);
        clientEvent.off(EVENT_TUT_LOBBY.TRY_SHOW_POP_UP_UI, this.TryShowPopUpEvent, this);
        clientEvent.off(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, this.ChangeEnableCheckLogicTut, this);
    }

    /**
     * Func này sẽ được gọi sau khi nhận thưởng các phần thưởng ở lobby
     * Func này sẽ được gọi sau khi close những UI theo kịch bản => để có thể tiếp tục xuất hiện tut
     * @param cbHasEventCanRun 
     * @returns 
     */
    private RunLogicCheckTut(cbHasEventCanRun: CallableFunction): boolean {
        if (!this._enableCheckTut) { cbHasEventCanRun && cbHasEventCanRun(false); return false; }

        this._tutShow = null;
        let forceTutDone: boolean = false;
        switch (true) {
            case this.tutEventSpin.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.SPIN; break;
            case this.tutEventLoginReward.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.LOGIN_REWARD; break;
            case this.tutEventLevelPass.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.LEVEL_PASS; break;
            case this.tutEventPiggyBank.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.PIGGY_BANK; break;
            case this.tutEventDashRush.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.DASH_RUSH; break;
            case this.tutEventSpeedRace.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.SPEED_RACE; break;
            case this.tutEventEndlessTreasure.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.ENDLESS_TREASURE; break;
            case this.tutEventSeasonPass.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.SEASON_PASS; break;
            case this.tutEventTreasureTrail.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.TREASURE_TRAIL; break;
            case this.tutEventSkyLift.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.SKY_LIFT; break;
            case this.tutEventChristmas.CheckLogic(): this._tutShow = TYPE_EVENT_GAME.CHRISTMAS_EVENT; break;
            case this.tutEventLevelProgression.CheckLogic():
                this._tutShow = TYPE_EVENT_GAME.LEVEL_PROGRESSION;
                forceTutDone = true;
                break;
        }

        if (this._tutShow == null) {
            cbHasEventCanRun && cbHasEventCanRun(false);
            if (forceTutDone) { this.TutCheckDone(); }
            return false;
        } else {
            this._previousTut = this._tutShow;
            this._enableCheckTut = false;
            cbHasEventCanRun && cbHasEventCanRun(true);
            if (forceTutDone) { this.TutCheckDone(); }
            return true;
        }
    }

    private TutCheckDone() {
        switch (this._tutShow) {
            case TYPE_EVENT_GAME.SPIN: this.tutEventSpin.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.INVITE_FRIEND: this.tutEventInviteFriend.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.SEASON_PASS: this.tutEventSeasonPass.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.LOGIN_REWARD: this.tutEventLoginReward.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.LEVEL_PASS: this.tutEventLevelPass.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.PIGGY_BANK: this.tutEventPiggyBank.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.DASH_RUSH: this.tutEventDashRush.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.SPEED_RACE: this.tutEventSpeedRace.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE: this.tutEventEndlessTreasure.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL: this.tutEventTreasureTrail.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.SKY_LIFT: this.tutEventSkyLift.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT: this.tutEventChristmas.CheckLogicDone(); break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION: this.tutEventLevelProgression.CheckLogicDone(); break;
        }

        this._tutShow = null;
    }

    private HasAnyLogicTutCanPlay(): boolean {
        if (this.tutEventSpin.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.SPIN; return true }
        if (this.tutEventSeasonPass.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.SEASON_PASS; return true; }
        // if (this.tutEventInviteFriend.CheckLogic()) { this._tutShow = TYPE_EVENT_GAME.INVITE_FRIEND; return true; }
        if (this.tutEventLoginReward.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.LOGIN_REWARD; return true; }
        if (this.tutEventLevelPass.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.LEVEL_PASS; return true; }
        if (this.tutEventPiggyBank.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.PIGGY_BANK; return true; }
        if (this.tutEventDashRush.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.DASH_RUSH; return true; }
        if (this.tutEventSpeedRace.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.SPEED_RACE; return true; }
        if (this.tutEventEndlessTreasure.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.ENDLESS_TREASURE; return true; }
        if (this.tutEventTreasureTrail.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.TREASURE_TRAIL; return true; }
        if (this.tutEventSkyLift.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.SKY_LIFT; return true; }
        if (this.tutEventChristmas.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.CHRISTMAS_EVENT; return true; }
        if (this.tutEventLevelProgression.JustCheckTut()) { this._tutShow = TYPE_EVENT_GAME.LEVEL_PROGRESSION; return true; }
    }

    private TryShowPopUpEvent(typeEvent: TYPE_EVENT_GAME) {
        // const hasAnyLogicTutCanPlay = this.HasAnyLogicTutCanPlay();
        // if (hasAnyLogicTutCanPlay) { return; }
        const canPlayInfo: IOpenUIBaseWithInfo = { isShowInfo: true }
        switch (typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PASS, 1, true, [canPlayInfo]);
                break;
            case TYPE_EVENT_GAME.INVITE_FRIEND:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_INVITE_FRIEND, 1, true, [canPlayInfo]);
                break;
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LOGIN_REWARD, 1);
                break;
            case TYPE_EVENT_GAME.SPIN:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPIN, 1);
                break;
            case TYPE_EVENT_GAME.PIGGY_BANK:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PIGGY_BANK, 1, true, [canPlayInfo]);
                break;
            case TYPE_EVENT_GAME.DASH_RUSH:
                if (!DataEventsSys.Instance.IsEventShowButLock(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_DASH_RUSH_PREPARE, 1, true, [canPlayInfo]);
                } else {
                    clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
                }
                break;
            case TYPE_EVENT_GAME.SPEED_RACE:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPEED_RACE_PREPARE, 1, true, [canPlayInfo]);
                break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_ENLESSTREASURE, 1);
                break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                if (!DataEventsSys.Instance.IsEventShowButLock(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TREASURE_TRAIL_PREPARE, 1);
                } else {
                    clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
                }
                break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1, true, [canPlayInfo]);
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SEASON_PASS, 1, true, [canPlayInfo]);
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                const iOpenNewGameSL: IOpenNewEvent = {
                    openNewEvent: true
                }
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SKY_LIFT, 1, true, [iOpenNewGameSL]);
                break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_CHRISTMAS_EVENT, 1, true, [canPlayInfo]);
                break;
        }
    }


    private _cacheCbHasEventCanRun: CallableFunction = null;
    private ChangeEnableCheckLogicTut(enabled: boolean, force: boolean = false, cbHasEventCanRun: CallableFunction = null) {
        if (cbHasEventCanRun != null) { this._cacheCbHasEventCanRun = cbHasEventCanRun; }

        if (!enabled) {
            this._enableCheckTut = enabled;
            return;
        }

        // in case enable = true
        let canNextTut: boolean = false;
        if (this._previousTut == null && !force) { return; }
        switch (this._previousTut) {
            case TYPE_EVENT_GAME.SPIN:
                // đối với spin sẽ có hai trường hợp có thể xảy ra =>
                // case 1: Khi user close UISpin
                // case 2: Khi user bấm ticket , coin => shop => quay lại pageHome
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                // đối với login reward sẽ chỉ có 1 trường hợp duy nhất đó là khi close UI
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                // đối với level_pass sẽ chỉ có 1 trường hợp duy nhất đó là khi close UI
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.PIGGY_BANK:
                // đối với piggy_bank sẽ chỉ có 1 trường hợp duy nhất đó là khi close UI
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.DASH_RUSH:
                // đối với dash_rush sẽ có 2 trường hợp 
                // case 1: User close UIPrepareDashRush
                // case 2: User close UIDashRush
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.SPEED_RACE:
                // đối với speed_race sẽ có 2 trường hợp
                // case 1: User close UIPrepareSpeedRace
                // case 2: User close UISpeedRace
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                // đối với speed_race sẽ chỉ có 1 trương hợp duy nhất đó là khi close UI
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                // đối với treasure sẽ có 2 trường hợp
                // 1: là khi close UIPrepare
                // 2: là khi close UI thường
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                // đối với event skyLift sẽ chỉ có 1 trường hợp
                // 1: là khi close UISkyLift
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                canNextTut = true;
                break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                canNextTut = true;
                break;
            default:
                if (force) canNextTut = true;
                this._enableCheckTut = true;
                break;
        }


        // play check logic tut again
        if (canNextTut) {
            this._enableCheckTut = true;
            this.RunLogicCheckTut(this._cacheCbHasEventCanRun);
        }
    }

    public JustCheckLogicEvent(typeGame: TYPE_EVENT_GAME): boolean {
        if (this == null) { return false; }
        try {
            switch (typeGame) {
                case TYPE_EVENT_GAME.SPIN: return this.tutEventSpin.JustCheckTut();
                case TYPE_EVENT_GAME.SEASON_PASS: return this.tutEventSeasonPass.JustCheckTut();
                // case TYPE_EVENT_GAME.INVITE_FRIEND: return this.tutEventInviteFriend.JustCheckTut();
                case TYPE_EVENT_GAME.LOGIN_REWARD: return this.tutEventLoginReward.JustCheckTut();
                case TYPE_EVENT_GAME.LEVEL_PASS: return this.tutEventLevelPass.JustCheckTut();
                case TYPE_EVENT_GAME.PIGGY_BANK: return this.tutEventPiggyBank.JustCheckTut();
                case TYPE_EVENT_GAME.DASH_RUSH: return this.tutEventDashRush.JustCheckTut();
                case TYPE_EVENT_GAME.SPEED_RACE: return this.tutEventSpeedRace.JustCheckTut();
                case TYPE_EVENT_GAME.TREASURE_TRAIL: return this.tutEventTreasureTrail.JustCheckTut();
                case TYPE_EVENT_GAME.SKY_LIFT: return this.tutEventSkyLift.JustCheckTut();
                case TYPE_EVENT_GAME.ENDLESS_TREASURE: return this.tutEventEndlessTreasure.JustCheckTut();
                case TYPE_EVENT_GAME.CHRISTMAS_EVENT: return this.tutEventChristmas.JustCheckTut();
                case TYPE_EVENT_GAME.LEVEL_PROGRESSION: return this.tutEventLevelProgression.JustCheckTut();
                default: return false;
            }
        } catch (e) {
            return false;
        }
    }
}


