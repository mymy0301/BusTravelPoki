import { _decorator, Button, Color, Component, Enum, Label, Material, Node, Sprite } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { DataEventsSys, STATE_EVENT } from '../../DataEventsSys';
import { Utils } from '../../../Utils/Utils';
import { AnimIconHomeSys } from '../../../AnimsPrefab/AnimIconHomeSys';
import { getNameTypeEventGame, IOpenUIBaseWithInfo, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { AddOnSpeNoItem01 } from './AddOnSpeNoItem01';
import { MConfigs } from '../../../Configs/MConfigs';
import { DataLevelPassSys } from '../../../DataBase/DataLevelPassSys';
import { CaculTimeEvents2 } from '../CaculTimeEvents2';
import { DataFriendJoinedSys } from '../../../DataBase/DataFriendJoinedSys';
import { DataSeasonPassSys } from '../../../DataBase/DataSeasonPassSys';
import { DataSpinSys } from '../../../DataBase/DataSpinSys';
import { DataLoginRewardSys } from '../../../DataBase/DataLoginRewardSys';
import { NameAnimIconHome_Active, NameAnimIconHome_Idle } from '../../../Utils/TypeAnimChest';
import { EVENT_TUT_LOBBY } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { DataPiggySys, STATUS_PIGGY_PANK } from '../../../DataBase/DataPiggySys';
import { DataDashRush } from '../../DataDashRush';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { DataEndlessTreasureSys } from '../../../DataBase/DataEndlessTreasureSys';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { CONFIG_LPr, STATE_EVENT_LEVEL_PROGRESS } from '../../OtherUI/UILevelProgression/TypeLevelProgress';
import { CONFIG_DR, STATE_DR } from '../../OtherUI/UIDashRush/TypeDashRush';
import { STATE_ET } from '../../OtherUI/UIEndlessTreasure/TypeEventEndlessTreasure';
import { CONFIG_SR, STATE_SPEED_RACE } from '../../OtherUI/UISpeedRace/TypeEventSpeedRace';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { STATE_TT } from '../../OtherUI/UITreasureTrail/TypeTreasureTrail';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { IOpenNewEvent, STATE_SL } from '../../OtherUI/UISkyLift/TypeSkyLift';
import { DataLightRoad_christ } from '../../../DataBase/DataLightRoad_christ';
import { DataChristmasSys } from '../../../DataBase/DataChristmasSys';
const { ccclass, property, disallowMultiple } = _decorator;
@ccclass('ItemEventSys')
@disallowMultiple(false)
export class ItemEventSys extends Component {
    @property({ type: TYPE_EVENT_GAME }) typeEvent: TYPE_EVENT_GAME;
    @property(Node) icNotification: Node;
    @property(Node) bgNotificationRank: Node;
    @property(Label) lbNotificationRank: Label;
    @property(Label) lbLock: Label;
    @property(Node) nLbNameEvent: Node;
    @property(Label) lbTime: Label;
    @property(AddOnSpeNoItem01) addOnSpeNoItem: AddOnSpeNoItem01;
    @property(Material) matGray: Material;
    @property(Node) listNHideWhenLoadAnim: Node[] = [];
    @property({ group: "darker" }) darkerColor: Color = new Color();
    @property({ group: "darker", type: [Sprite] }) listSpDarker: Sprite[] = [];
    @property({ group: "darker", type: [Label] }) listLbDarker: Label[] = [];
    @property({ group: "darker", type: Material }) matDarker: Material;


    protected onLoad(): void {
        if (this.icNotification != null) {
            this.icNotification.active = false;
        }
        if (this.lbNotificationRank != null) {
            this.lbNotificationRank.node.active = false;
        }

        if (this.bgNotificationRank != null) {
            this.bgNotificationRank.active = false;
        }
        if (this.lbLock != null) {
            this.lbLock.node.active = false;
        }

        if (this.addOnSpeNoItem != null) {
            this.addOnSpeNoItem.ChangeStateAddOn(false)
        }

        if (this.nLbNameEvent != null) {
            this.nLbNameEvent.active = false;
        }

        clientEvent.on(MConst.EVENT_GAME.UPDATE_NOTIFICATION, this.UpdateNotification, this);
        clientEvent.on(MConst.EVENT_GAME.UPDATE_INDEX_NOTIFICATION, this.UpdateIndexNotification, this);
        clientEvent.on(MConst.EVENT_GAME.UPDATE_ADD_ON_SPE_01, this.UpdateAddOnSpe01, this);
        clientEvent.on(MConst.EVENT_GAME.GEN_EVENT, this.onGenEvent, this);
        clientEvent.on(MConst.EVENT_GAME.RESUME_EVENT, this.onGenEvent, this);
        clientEvent.on(MConst.EVENT_GAME.END_TIME_EVENT, this.endTimeGenEvent, this);
        clientEvent.on(MConst.EVENT_GAME.SHOW_NAME_EVENT, this.ShowName, this);
        clientEvent.on(MConst.EVENT_GAME.UPDATE_TIME, this.UpdateTime, this);
        clientEvent.on(MConst.EVENT_GAME.HIDE_EVENT, this.UnActiveNodeEvent, this);
        clientEvent.on(MConst.EVENT_GAME.OFF_LISTEN_TIME, this.OffListenEvent, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_GAME.UPDATE_NOTIFICATION, this.UpdateNotification, this);
        clientEvent.off(MConst.EVENT_GAME.UPDATE_INDEX_NOTIFICATION, this.UpdateIndexNotification, this);
        clientEvent.off(MConst.EVENT_GAME.UPDATE_ADD_ON_SPE_01, this.UpdateAddOnSpe01, this);
        clientEvent.off(MConst.EVENT_GAME.GEN_EVENT, this.onGenEvent, this);
        clientEvent.off(MConst.EVENT_GAME.RESUME_EVENT, this.onGenEvent, this);
        clientEvent.off(MConst.EVENT_GAME.END_TIME_EVENT, this.endTimeGenEvent, this);
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
        clientEvent.off(MConst.EVENT_GAME.SHOW_NAME_EVENT, this.ShowName, this);
        clientEvent.off(MConst.EVENT_GAME.UPDATE_TIME, this.UpdateTime, this);
        clientEvent.off(MConst.EVENT_GAME.HIDE_EVENT, this.UnActiveNodeEvent, this);
        clientEvent.off(MConst.EVENT_GAME.OFF_LISTEN_TIME, this.OffListenEvent, this);
    }

    //#region listen event 
    private CheckSameEvent(eventType: TYPE_EVENT_GAME, eventTypeCheck: TYPE_EVENT_GAME = null): boolean {
        if (eventTypeCheck == null) {
            if ((this.typeEvent == TYPE_EVENT_GAME.SEASON_PASS_2 && eventType == TYPE_EVENT_GAME.SEASON_PASS) || this.typeEvent == eventType) {
                return true;
            }
        } else {
            if ((this.typeEvent == TYPE_EVENT_GAME.SEASON_PASS_2 && eventType == TYPE_EVENT_GAME.SEASON_PASS)
                || (this.typeEvent == TYPE_EVENT_GAME.SEASON_PASS && eventTypeCheck == TYPE_EVENT_GAME.SEASON_PASS_2)
                || this.typeEvent == eventType) {
                return true;
            }
        }
        return false;
    }

    private GetTypeEventEmit(eventType: TYPE_EVENT_GAME): TYPE_EVENT_GAME {
        if (eventType == TYPE_EVENT_GAME.SEASON_PASS_2) {
            return TYPE_EVENT_GAME.SEASON_PASS;
        }
        return eventType;
    }

    private onGenEvent(eventType: TYPE_EVENT_GAME) {
        if (!this.CheckSameEvent(eventType)) { return; }

        const eventSend = this.GetTypeEventEmit(eventType);

        /**Sample**/

        switch (this.typeEvent) {
            //     case TYPE_EVENT_GAME.TILE_RACE:
            //         if (DataEventsSys.Instance.IsLockEvent(this.typeEvent)) { break; }
            //         this.node.active = true;
            //         this.ShowUINormal();
            //         this.UpdateUITimeEventFirstTime();
            //         this.UpdateIndexNotification(this.typeEvent);
            //         this.UpdateNotification(this.typeEvent);
            //         // this.UpdateAddOnSpe01(TYPE_EVENT_GAME.TILE_RACE, DataTileRaceSys.Instance.CanShowNotificationJoin());
            //         clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
            //         clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
            //         break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                if (DataEventsSys.Instance.IsLockEvent(eventSend)) { break; }
                // this.node.active = true;
                this.ShowUINormal();
                this.UpdateUITimeEventFirstTime();
                // console.log("UpdateUITimeEventFirstTime", DataTilePassSys.Instance.GetNumPrizeCanClaim());
                if (DataLevelPassSys.Instance.GetNumPrizeCanClaim() > 0) {
                    // this.UpdateIndexNotification(TYPE_EVENT_GAME.LEVEL_PASS);
                    if (this.addOnSpeNoItem != null) {
                        this.UpdateAddOnSpe01(TYPE_EVENT_GAME.LEVEL_PASS, true);
                    }
                }
                clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                if (DataEventsSys.Instance.IsLockEvent(eventSend)) { break; }
                if (CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(this.typeEvent)) { break; }
                // this.node.active = true;
                this.UpdateIndexNotification(eventSend);
                this.UpdateNotification(eventSend);
                this.ShowUINormal();
                this.lbTime.node.active = true;
                // this.lbTime.outlineColor = DataSeasonPassSys.Instance.getColorOutlineTextX2();
                this.UpdateUITimeEventFirstTime();
                clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                break;
            case TYPE_EVENT_GAME.SEASON_PASS_2:
                if (DataEventsSys.Instance.IsLockEvent(eventSend)) { break; }
                // this.node.active = true;
                this.ShowUINormal();
                this.UpdateUITimeEventFirstTime();
                if (DataSeasonPassSys.Instance.GetNumPrizeCanClaim() > 0) {
                    if (this.addOnSpeNoItem != null) {
                        // this.UpdateNotification(TYPE_EVENT_GAME.SEASON_PASS);
                        this.UpdateAddOnSpe01(TYPE_EVENT_GAME.SEASON_PASS, true);
                    }
                }
                clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                break;
        }
    }

    private UpdateIndexNotification(typeEvent: TYPE_EVENT_GAME) {
        if (!this.CheckSameEvent(typeEvent) || this.lbNotificationRank == null || this.bgNotificationRank == null) {
            return;
        }

        const eventSend = this.GetTypeEventEmit(typeEvent);

        if (DataEventsSys.Instance.IsLockEvent(eventSend)) {
            return;
        }


        /**Sample**/
        // switch (this.typeEvent) {
        //     case TYPE_EVENT_GAME.TILE_RACE:
        //         /* will be call in 2 case
        //         * case 1: when player come to lobby scene
        //         * case 2: when player close the UITileRace
        //         */
        //         // check if player was join the race , and show notification with the label index of player when player joined
        //         if (DataTileRaceSys.Instance.IsPlayerJoinTileRace()) {
        //             const indexPlayer = DataTileRaceSys.Instance.GetRankPlayerNow() + 1;
        //             this.lbNotificationRank.node.active = true;
        //             this.bgNotificationRank.active = true;
        //             this.lbNotificationRank.string = indexPlayer.toString();
        //             this.ForceTurnOffNotification();
        //         } else {
        //             this.bgNotificationRank.active = false;
        //             this.lbNotificationRank.node.active = false;
        //         }
        //         break;
        // }

        const isEventLock = DataEventsSys.Instance.IsLockEvent(eventSend)
        switch (this.typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS:
                if (!isEventLock) {
                    const numPrizeCanReceiveLevelPass = DataLevelPassSys.Instance.GetNumPrizeCanClaim();
                    this.bgNotificationRank.active = true;
                    this.lbNotificationRank.node.active = true;
                    this.lbNotificationRank.string = numPrizeCanReceiveLevelPass.toString();
                    this.ForceActiveNotification(true);
                }
                break;
            case TYPE_EVENT_GAME.SEASON_PASS_2:
                if (!isEventLock) {
                    const numPrizeCanReceiveSeasonPass = DataSeasonPassSys.Instance.GetNumPrizeCanClaim();
                    this.bgNotificationRank.active = true;
                    this.lbNotificationRank.node.active = true;
                    this.lbNotificationRank.string = numPrizeCanReceiveSeasonPass.toString();
                    this.ForceActiveNotification(true);
                }
                break;
        }
    }

    private UpdateNotification(type: TYPE_EVENT_GAME, turnOn: boolean = true) {
        const eventSend = this.GetTypeEventEmit(type);

        if (!this.CheckSameEvent(eventSend) || this.icNotification == null || this.icNotification == undefined || DataEventsSys.Instance.IsLockEvent(eventSend)) {
            return;
        }

        /**Sample**/
        // switch (this.typeEvent) {
        //     case TYPE_EVENT_GAME.TILE_PASS:
        //         this.icNotification.active = turnOn;
        //         this.ForceTurnOffNotificationRank();
        //         break;
        // }
        const isUnlockEvent = DataEventsSys.Instance.GetStateEvent(eventSend) == STATE_EVENT.UNLOCK

        switch (this.typeEvent) {
            case TYPE_EVENT_GAME.SPIN:
                // check have any free today
                if (!DataSpinSys.Instance.IsMaxSpinToday()) {
                    this.icNotification.active = true;
                }
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                this.icNotification.active = turnOn;
                this.ForceTurnOffNotificationRank();
                break;
            case TYPE_EVENT_GAME.SEASON_PASS_2:
                this.icNotification.active = DataSeasonPassSys.Instance.GetNumPrizeCanClaim() > 0;
                this.ForceTurnOffNotificationRank();
                break;
            case TYPE_EVENT_GAME.INVITE_FRIEND:
                this.icNotification.active = DataFriendJoinedSys.Instance.HavePrizeNotReceiveYet();
                break;
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                let isShowNoti_loginReward = DataLoginRewardSys.Instance.IsRewardAllPrize30Day() && isUnlockEvent;
                this.icNotification.active = isShowNoti_loginReward;
                this.lbTime.node.active = !isShowNoti_loginReward;
                this.nLbNameEvent.active = isShowNoti_loginReward;
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                const hadPrizeNotReceiveYet: boolean = DataSeasonPassSys.Instance.HadPrizeNotReceive();
                this.icNotification.active = hadPrizeNotReceiveYet && isUnlockEvent;
                break;
            case TYPE_EVENT_GAME.PIGGY_BANK:
                this.icNotification.active = DataPiggySys.Instance.GetStatusPiggyNow() == STATUS_PIGGY_PANK.Full;
                break;
            case TYPE_EVENT_GAME.SPEED_RACE:
                switch (true) {
                    case DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.END_EVENT:
                        this.icNotification.active = MConfigs.SR_CAN_NOTI_START;
                        break;
                    case DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.JOINING && DataSpeedRace.Instance.HasAnyPrizeProgressCanClaim():
                        this.icNotification.active = true;
                        break;
                    case DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.WAIT_RECEIVE && DataSpeedRace.Instance.HasAnyPrizeProgressCanClaim():
                        this.icNotification.active = true;
                        break;
                    default:
                        this.icNotification.active = false;
                        break;
                }
                break;
            case TYPE_EVENT_GAME.DASH_RUSH:
                switch (true) {
                    case DataEventsSys.Instance.IsEventShowButLock(eventSend) == 1:
                        this.icNotification.active = false;
                        break;
                    case DataDashRush.Instance.GetState() == STATE_DR.WAIT_TO_JOIN:
                        this.icNotification.active = MConfigs.DR_CAN_NOTI_START;
                        break;
                }
                break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                const IsNextPackIsFree = DataEndlessTreasureSys.Instance.IsNextPackIsFree();
                this.icNotification.active = IsNextPackIsFree;
                break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                switch (true) {
                    case DataLevelProgressionSys.Instance.STATE == STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN:
                        this.icNotification.active = CONFIG_LPr.IS_NOTI_START;
                        break;
                    default:
                        const hadPrizeLPr_not_receive_yet: boolean = DataLevelProgressionSys.Instance.HadPrizeNotReceive();
                        this.icNotification.active = hadPrizeLPr_not_receive_yet && isUnlockEvent;
                        break;
                }
                break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                if (DataEventsSys.Instance.IsEventShowButLock(eventSend) == 1) {
                    this.icNotification.active = false;
                } else {
                    this.icNotification.active = MConfigs.TT_CAN_NOTI_START;
                }
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                this.icNotification.active = MConfigs.SL_CAN_NOTI_START;
                break;
        }
    }

    private UpdateAddOnSpe01(eventType: TYPE_EVENT_GAME, stateAddOn: boolean) {
        const eventSend = this.GetTypeEventEmit(eventType);
        if (!this.CheckSameEvent(eventType) || DataEventsSys.Instance.IsLockEvent(eventSend) || this.addOnSpeNoItem == null) { return; }

        switch (eventSend) {
            case TYPE_EVENT_GAME.LEVEL_PASS:
                this.addOnSpeNoItem.ChangeStateAddOn(stateAddOn);
                // this.nBgTime.active = !stateAddOn;
                this.lbTime.node.active = !stateAddOn;
                this.ForceActiveNotification(stateAddOn);
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                this.addOnSpeNoItem.ChangeStateAddOn(stateAddOn);
                this.lbTime.node.active = !stateAddOn;
                this.ForceActiveNotification(stateAddOn);
                break;

        }
    }

    private UpdateTime(eventType: TYPE_EVENT_GAME) {
        const eventSend = this.GetTypeEventEmit(eventType);
        if (!this.CheckSameEvent(eventType) || DataEventsSys.Instance.IsLockEvent(eventSend)) { return; }

        let timeShow = 0;

        switch (this.typeEvent) {
            case TYPE_EVENT_GAME.DASH_RUSH:
                // case đang show but lock
                if (DataEventsSys.Instance.IsEventShowButLock(eventSend) == 1) {
                    // console.log("check show but lock in DR");
                    this.lbTime.node.active = true;
                    this.lbTime.string = "FINISHED";
                    this.lbNotificationRank.node.active = false;
                    break;
                }

                const stateEventDR = DataDashRush.Instance.GetState();
                console.log("stateEventDR", stateEventDR);
                // case normal
                switch (true) {
                    case stateEventDR == STATE_DR.WAIT_TO_JOIN:
                        this.lbTime.node.active = false;
                        this.lbNotificationRank.node.active = true;
                        break;
                    default:
                        this.lbNotificationRank.node.active = false;
                        this.lbTime.node.active = true;
                        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        }
                        break;
                }
                break;
            case TYPE_EVENT_GAME.SPEED_RACE:
                if (DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.JOINING
                    || DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.WAIT_RECEIVE) {
                    if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                    }
                }
                break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                if (DataLevelProgressionSys.Instance.STATE != STATE_EVENT_LEVEL_PROGRESS.LOCK) {
                    if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                        this.UpdateUITimeEvent();
                        this.lbTime.node.active = true;
                        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                    }
                }
                break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                timeShow = DataEndlessTreasureSys.Instance.GetTimeToDiplay();
                this.lbTime.node.active = true;
                this.UpdateUITimeEvent();
                if (timeShow > 0) {
                    clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                }
                break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                // case đang show but lock
                if (DataEventsSys.Instance.IsEventShowButLock(eventSend) == 1) {
                    this.lbTime.node.active = true;
                    this.lbTime.string = "FINISHED";
                    this.lbNotificationRank.node.active = false;
                    break;
                }

                // case normal
                const stateTTNow = DataTreasureTrailSys.Instance.STATE;
                console.log("stateTTNow", stateTTNow);
                
                switch (stateTTNow) {
                    case STATE_TT.JOINING: case STATE_TT.LOSE: case STATE_TT.WIN:
                        this.lbNotificationRank.node.active = false;
                        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                            this.UpdateUITimeEvent();
                            this.lbTime.node.active = true;
                            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        }
                        break;
                    case STATE_TT.DELAY_WIN:
                        this.lbNotificationRank.node.active = false;
                        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                            this.UpdateUITimeEvent();
                            this.lbTime.node.active = true;
                            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        }
                        break;
                    case STATE_TT.DELAY_LOSE:
                        this.lbNotificationRank.node.active = false;
                        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                            this.UpdateUITimeEvent();
                            this.lbTime.node.active = true;
                            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        }
                        break;
                    case STATE_TT.WAIT_TO_JOIN:
                        this.lbTime.node.active = false;
                        this.lbNotificationRank.node.active = true;
                        this.lbTime.node.active = false;
                        break;
                }
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                const stateSLNow = DataSkyLiftSys.Instance.STATE;
                switch (stateSLNow) {
                    case STATE_SL.JOINING:
                        this.lbNotificationRank.node.active = false;
                        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)
                        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                            this.UpdateUITimeEvent();
                            this.lbTime.node.active = true;
                            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        }
                        break;
                    case STATE_SL.DELAY:
                        this.lbNotificationRank.node.active = false;
                        this.lbTime.node.active = true;
                        this.lbTime.string = "FINISHED"
                        break;
                    case STATE_SL.WAIT_TO_RECEIVE:
                        this.lbNotificationRank.node.active = false;
                        this.UpdateUITimeEvent();
                        this.lbTime.node.active = true;
                        break;
                    case STATE_SL.WAIT_TO_JOIN:
                        this.lbNotificationRank.node.active = true;
                        this.lbTime.node.active = false;
                        break;
                }
                break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                const timeEndEvent = DataLightRoad_christ.Instance.GetTimeEndEvent();
                this.lbTime.node.active = false;
                if (timeEndEvent > 0) {
                    if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this)) {
                        this.UpdateUITimeEvent();
                        this.lbTime.node.active = true;
                        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                    }
                } else {
                    this.lbTime.string = "FINISHED";
                }
                break;
        }
    }

    private ShowName(eventType: TYPE_EVENT_GAME) {
        const eventSend = this.GetTypeEventEmit(eventType);
        if (!this.CheckSameEvent(eventType) || DataEventsSys.Instance.IsLockEvent(eventSend) || this.nLbNameEvent == null) { return; }

        switch (this.typeEvent) {
            case TYPE_EVENT_GAME.SPIN: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.INVITE_FRIEND: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.PIGGY_BANK: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.DASH_RUSH: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                let isShowNoti_loginReward = DataLoginRewardSys.Instance.IsRewardAllPrize30Day() && DataEventsSys.Instance.GetStateEvent(eventSend) == STATE_EVENT.UNLOCK;
                this.nLbNameEvent.active = isShowNoti_loginReward;
                break;
            case TYPE_EVENT_GAME.PVP: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.SPEED_RACE: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL: this.nLbNameEvent.active = true; break;
            case TYPE_EVENT_GAME.SKY_LIFT: this.nLbNameEvent.active = true; break;
        }

    }

    private endTimeGenEvent(eventType: TYPE_EVENT_GAME) {
        const eventSend = this.GetTypeEventEmit(eventType);
        if (!this.CheckSameEvent(eventType) || DataEventsSys.Instance.IsLockEvent(eventSend)) { return; }

        /**Sample**/
        // switch (eventType) {
        //     case TYPE_EVENT_GAME.TILE_PASS:
        //         // this.node.active = false;
        //         this.lbTime.string = "FINISHED";
        //         clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
        //         break;
        // }

        switch (this.typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS: case TYPE_EVENT_GAME.SEASON_PASS_2:
                // this.node.active = false;
                this.lbTime.string = "FINISHED";
                clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                break;
            case TYPE_EVENT_GAME.SEASON_PASS: case TYPE_EVENT_GAME.LEVEL_PROGRESSION: case TYPE_EVENT_GAME.TREASURE_TRAIL: case TYPE_EVENT_GAME.DASH_RUSH:
                // because this will affect with the anim receive when player come lobby => so i turn node off after it play anim receive key done in battlePassUI class
                this.lbTime.string = "FINISHED";
                clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                break;
        }
    }

    private UnActiveNodeEvent(typeEvent: TYPE_EVENT_GAME) {
        if (!this.node.isValid) { return; }
        if (!this.CheckSameEvent(typeEvent)) { return; }
        this.node.active = false;
    }

    private OffListenEvent(typeEvent: TYPE_EVENT_GAME) {
        if (!this.CheckSameEvent(typeEvent)) { return; }
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
    }
    //#endregion

    //#region set time
    private UpdateUITimeEvent() {
        let time = -1;
        let setTimeManual: boolean = false;
        const eventSend = this.GetTypeEventEmit(this.typeEvent);
        switch (this.typeEvent) {
            // NOTE
            /** 
             * Trong trường hợp bạn muốn auto update thời gian của một event nào đó
             * Event đó bắt buộc phải được đăng ký quản lý bởi CaculTimeEvents2
             * thì bạn có thể code như mẫu ở bên dưới
            */
            case TYPE_EVENT_GAME.LEVEL_PASS: case TYPE_EVENT_GAME.SEASON_PASS: case TYPE_EVENT_GAME.SEASON_PASS_2:
                time = CaculTimeEvents2.Instance.GetTimeEvent(eventSend);
                break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                // get state event to show suitable
                const stateEventLPr = DataLevelProgressionSys.Instance.STATE;
                switch (stateEventLPr) {
                    case STATE_EVENT_LEVEL_PROGRESS.LOCK:
                        this.lbTime.string = this.GetContentShowLevelLock(this.typeEvent);
                        setTimeManual = true;
                        break;
                    case STATE_EVENT_LEVEL_PROGRESS.JOINING:
                        time = DataLevelProgressionSys.Instance.GetTimeDisplay();
                        break;
                    case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN:
                        this.lbTime.string = "Start";
                        setTimeManual = true;
                        break;
                    case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_RECEIVE_END_EVENT:
                        time = DataLevelProgressionSys.Instance.GetTimeDisplay();
                        break;
                }
                break;
            case TYPE_EVENT_GAME.SPIN:
                // đang trong tutorial thì không update time
                if (DataSpinSys.Instance.GetIdPrizeSpeSpin() > 0) {
                    time = Utils.getTimeRemainingFromNowToEndWeek();
                }
                break;
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                // đang trong tutorial thì không update time
                // console.log(DataEventsSys.Instance.IsLockEvent(this.typeEvent), DataEventsSys.Instance.IsPlayTutorialEvent(this.typeEvent));

                if (DataEventsSys.Instance.IsLockEvent(eventSend)) {
                    time = Utils.getTimeRemainingFromNowToEndWeek();
                }
                break;
            case TYPE_EVENT_GAME.DASH_RUSH:
                const stateEventDR = DataDashRush.Instance.GetState();
                switch (true) {
                    case stateEventDR == STATE_DR.DELAY_LOSE:
                        time = DataDashRush.Instance.GetTimeDisplay_Delay();
                        break;
                    case stateEventDR == STATE_DR.DELAY_WIN:
                        time = DataDashRush.Instance.GetTimeDisplay_Delay();
                        break;
                    case stateEventDR == STATE_DR.WAIT_TO_JOIN:
                        this.lbTime.string = "Start";
                        return;
                    default:
                        // time = DataEventsSys.Instance.GetTimeGroupEventRemain(this.typeEvent, 1);
                        time = DataDashRush.Instance.GetTimeDisplay();
                        break;
                }

                if (time <= 0) {
                    this.lbTime.string = "FINISHED";
                    clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                    return;
                }
                break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                const stateEventTT = DataTreasureTrailSys.Instance.STATE;
                console.log("TYPE_EVENT_GAME.TREASURE_TRAIL", stateEventTT);
                switch (true) {
                    case stateEventTT == STATE_TT.DELAY_LOSE:
                        time = DataTreasureTrailSys.Instance.GetTimeDisplay_Delay();
                        break;
                    case stateEventTT == STATE_TT.DELAY_WIN:
                        time = DataTreasureTrailSys.Instance.GetTimeDisplay_Delay();
                        break;
                    default:
                        // time = DataEventsSys.Instance.GetTimeGroupEventRemain(this.typeEvent, 1);
                        time = DataTreasureTrailSys.Instance.GetTimeDisplay();
                        break;
                }

                console.log("TREASURE_TRAIL time", time);
                if (time <= 0) {
                    this.lbTime.string = "FINISHED";
                    clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                    return;
                }
                break;
            case TYPE_EVENT_GAME.SPEED_RACE: case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                if (DataEventsSys.Instance.IsPlayTutorialEvent(eventSend)) {
                    switch (this.typeEvent) {
                        case TYPE_EVENT_GAME.SPEED_RACE: time = DataSpeedRace.Instance.GetTimeDisplay(); break;
                        case TYPE_EVENT_GAME.ENDLESS_TREASURE: time = DataEndlessTreasureSys.Instance.GetTimeToDiplay(); break;
                    }
                    if (time <= 0) {
                        this.lbTime.string = "FINISHED";
                        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        return;
                    }
                }
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                if (DataEventsSys.Instance.IsPlayTutorialEvent(eventSend)) {
                    const stateEventSL = DataSkyLiftSys.Instance.STATE;
                    switch (stateEventSL) {
                        case STATE_SL.JOINING:
                            time = DataSkyLiftSys.Instance.GetTimeDisplay();
                            if (time <= 0) {
                                this.lbTime.string = "FINISHED";
                                clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                                return;
                            }
                            break;
                        default:
                            this.lbTime.string = "FINISHED";
                            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                            break;
                    }
                }
                break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                if (DataEventsSys.Instance.IsPlayTutorialEvent(eventSend)) {
                    // lấy thời gian của event lightRoad để hiển thị ở đây
                    const timeRemain = DataLightRoad_christ.Instance.GetTimeEndEvent();
                    if (timeRemain > 0) {
                        this.lbTime.node.active = true;
                        time = timeRemain;
                    } else {
                        this.lbTime.node.active = true;
                        this.lbTime.string = "FINISHED";
                        this.node.active = false;
                        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                        return;
                    }
                }
                break;
        }


        // Check valid to set time manual
        if (!setTimeManual) {
            this.SetTimeToLabel(this.lbTime, time);
        }
    }

    private UpdateUITimeEventFirstTime() {
        this.lbTime.string = "Loading...";
    }

    private SetTimeToLabel(lb: Label, time: number) {
        if (time < 0) {
            lb.string = "FINISHED";
        } else {
            let timeRemaningString = "";
            timeRemaningString = Utils.convertTimeLengthToFormat_ForEvent(time);
            if (timeRemaningString == '') {
                timeRemaningString = "FINISHED";
            }
            lb.string = timeRemaningString;
        }
    }
    //#endregion 

    //#region self func
    private ForceActiveNotification(active: boolean) {
        if (this.icNotification != null) {
            this.icNotification.active = active;
        }
    }

    private ForceTurnOffNotificationRank() {
        if (this.bgNotificationRank != null) {
            this.bgNotificationRank.active = false;
        }
        if (this.lbNotificationRank != null) {
            this.lbNotificationRank.node.active = false;
        }
    }

    public CheckSelfEventIsLockOrNot() {
        console.log("check type event ", this.typeEvent, "|", DataEventsSys.Instance.IsLockEvent(this.typeEvent));

        const eventSend = this.GetTypeEventEmit(this.typeEvent);

        if (DataEventsSys.Instance.IsLockEvent(eventSend)) {
            // Phần login này hiện đang được code kèm trong LogicTut của từng event , xin hãy đọc thêm code ở những class đó để bt chính xác
            // đoạn dưới đây sẽ chọn cái nào

            //in case special 
            switch (eventSend) {
            }

            // show UI event was not active
            this.ShowUILock();
        } else {
            switch (eventSend) {
                // case TYPE_EVENT_GAME.LEVEL_PASS:
                //     if (CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.LEVEL_PASS)) {
                //         this.node.active = false;
                //     }
                //     break;
                // case TYPE_EVENT_GAME.SEASON_PASS:
                //     if (CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
                //         this.node.active = false;
                //     }
                //     break;
                case TYPE_EVENT_GAME.DASH_RUSH:
                    // case event show nhưng lock
                    if (DataEventsSys.Instance.IsEventShowButLock(eventSend) == 1) {
                        this.icNotification.active = false;
                        this.UpdateTime(eventSend);
                        break;
                    }

                    DataDashRush.Instance.TryAutoUpdateState();
                    this.UpdateTime(TYPE_EVENT_GAME.DASH_RUSH);
                    this.UpdateNotification(this.typeEvent);
                    break;
                case TYPE_EVENT_GAME.SPEED_RACE:
                    this.UpdateNotification(TYPE_EVENT_GAME.SPEED_RACE);
                    switch (true) {
                        case DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.JOINING: case DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.WAIT_RECEIVE:
                            this.lbTime.node.active = true;
                            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                            break;
                        case DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.END_EVENT:
                            this.UpdateNotification(TYPE_EVENT_GAME.SPEED_RACE);
                            break;
                    }
                    break;
                case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                    // case before tut
                    if (!DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.ENDLESS_TREASURE)) {
                        this.nLbNameEvent.active = true;
                        this.lbTime.node.active = false;
                        break;
                    }
                    // case after tut
                    this.nLbNameEvent.active = false;
                    // check can initPack
                    DataEndlessTreasureSys.Instance.AutoUpdateState2();
                    const IsJoining = DataEndlessTreasureSys.Instance.STATE == STATE_ET.JOINING;
                    const HasPackNotBuyYet = DataEndlessTreasureSys.Instance.HasAnyPackCanBuyOrClaim();
                    if (IsJoining && HasPackNotBuyYet) {
                        this.UpdateTime(TYPE_EVENT_GAME.ENDLESS_TREASURE);
                        this.UpdateNotification(TYPE_EVENT_GAME.ENDLESS_TREASURE);
                    } else {
                        this.node.active = false;
                    }
                    break;
                case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                    this.node.active = true;
                    this.UpdateIndexNotification(eventSend);
                    this.UpdateNotification(eventSend);
                    this.ShowUINormal();
                    this.lbTime.node.active = true;
                    this.UpdateUITimeEventFirstTime();
                    clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                    clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITimeEvent, this);
                    break;
                case TYPE_EVENT_GAME.TREASURE_TRAIL:
                    // case event show nhưng lock
                    if (DataEventsSys.Instance.IsEventShowButLock(eventSend) == 1) {
                        this.icNotification.active = false;
                        this.UpdateTime(eventSend);
                        break;
                    }

                    const stateTTNow = DataTreasureTrailSys.Instance.STATE;
                    switch (true) {
                        case stateTTNow == STATE_TT.WAIT_TO_JOIN:
                            this.UpdateNotification(eventSend);
                            this.UpdateTime(TYPE_EVENT_GAME.TREASURE_TRAIL);
                            break;
                        case stateTTNow == STATE_TT.JOINING: case stateTTNow == STATE_TT.LOSE:
                        case stateTTNow == STATE_TT.WIN: case stateTTNow == STATE_TT.DELAY_LOSE: case stateTTNow == STATE_TT.DELAY_WIN:
                            this.UpdateTime(TYPE_EVENT_GAME.TREASURE_TRAIL);
                            break;
                    }
                    break;
                case TYPE_EVENT_GAME.SKY_LIFT:
                    const stateSLNow = DataSkyLiftSys.Instance.STATE;
                    try {
                        switch (true) {
                            case stateSLNow == STATE_SL.DELAY:
                                this.UpdateTime(TYPE_EVENT_GAME.SKY_LIFT);
                                break;
                            case stateSLNow == STATE_SL.WAIT_TO_RECEIVE:
                                this.UpdateNotification(eventSend);
                                this.UpdateTime(TYPE_EVENT_GAME.SKY_LIFT);
                                break;
                            case stateSLNow == STATE_SL.WAIT_TO_JOIN:
                                this.UpdateNotification(eventSend);
                                this.UpdateTime(TYPE_EVENT_GAME.SKY_LIFT);
                                break;
                            case stateSLNow == STATE_SL.JOINING:
                                this.UpdateTime(TYPE_EVENT_GAME.SKY_LIFT);
                                break;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    break;
                case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                    // trong trường hợp đã hết thời gian => ta sẽ ẩn event này đi
                    const validCanNotShow1 = !DataLightRoad_christ.Instance.ValidTimeCanInit();
                    const validCanNotShow2 = DataLightRoad_christ.Instance.IsEventEnd();
                    switch (true) {
                        case validCanNotShow1 || validCanNotShow2:
                            this.node.active = false;
                            break;
                        case DataEventsSys.Instance.IsPlayTutorialEvent(eventSend):
                            this.UpdateTime(TYPE_EVENT_GAME.CHRISTMAS_EVENT);
                            break;
                        default:
                            this.lbTime.node.active = false;
                            break;
                    }
                    break;
            }
        }
    }

    private ShowUINormal() {
        if (this.lbLock != null) {
            this.lbLock.node.active = true;
        }
    }

    private ShowUILock() {
        if (this.lbLock != null) {
            // ===== set label unlock level ======
            this.lbLock.string = this.GetContentShowLevelLock(this.typeEvent);
            this.lbLock.node.active = true;
        }

        // not gray ui for UISeasonPass
        if (this.typeEvent == TYPE_EVENT_GAME.SEASON_PASS || this.typeEvent == TYPE_EVENT_GAME.LEVEL_PROGRESSION) {
            return;
        }

        // gray ui
        darkerImage(this.listSpDarker, this.listLbDarker, this.darkerColor, this.matDarker);
        // MConfigs.GrayAllNode(this.node.children, this.matGray);
    }

    private GetContentShowLevelLock(typeEvent: TYPE_EVENT_GAME): string {
        let result = '';
        let levelUnlock = 1;
        switch (this.typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.LevelPass; break;
            case TYPE_EVENT_GAME.SEASON_PASS_2: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.SeasonPass; break;
            case TYPE_EVENT_GAME.SPIN: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.Spin; break;
            case TYPE_EVENT_GAME.INVITE_FRIEND: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.InviteFriend; break;
            case TYPE_EVENT_GAME.LOGIN_REWARD: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.LoginReward; break;
            case TYPE_EVENT_GAME.PIGGY_BANK: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.PiggyBank; break;
            case TYPE_EVENT_GAME.DASH_RUSH: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.DashRush; break;
            case TYPE_EVENT_GAME.SPEED_RACE: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.SpeedRace; break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.EndlessTreasure; break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.TreasureTrail; break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.LevelProgression; break;
            case TYPE_EVENT_GAME.SKY_LIFT: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.SkyLift; break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT: levelUnlock = MConfigs.LEVEL_TUTORIAL_EVENT.ChristmasEvent; break;
        }
        result = `Level ${levelUnlock}`;
        return result;
    }

    public HideBgTime() {
        if (this.lbTime != null) this.lbTime.node.active = false;
    }
    //#endregion

    //#region btn func
    private onBtnEvent(typeEvent: TYPE_EVENT_GAME, typeUI: TYPE_UI, dataCustom: any[] = []) {
        const eventSend = this.GetTypeEventEmit(typeEvent);
        LogEventManager.Instance.logButtonClick(`event_${getNameTypeEventGame(eventSend)}`, "home");

        // the data custom send to ui event is need to show infoUI first
        if (DataEventsSys.Instance.IsLockEvent(eventSend)) {
            let levelEventUnlock = DataEventsSys.Instance.GetLevelEventUnlock(eventSend);
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, `Event unlocks at lv.${levelEventUnlock}`);
        }
        // ===================== Lý do comment đoạn code dưới là vì bây giờ đã chuyển sang tut popUP =====================
        // else if (!DataEventsSys.Instance.IsLockEvent(typeEvent) && !DataEventsSys.Instance.IsLockEvent(typeEvent)) {
        //     clientEvent.dispatchEvent(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE);
        //     const dataCustomBase: IOpenUIBaseWithInfo = {
        //         isShowInfo: true,
        //     }

        //     /**
        //      * Trong trường hợp bạn cần truyền tham số trước khi mở UIEvent thì xin hãy tinh chỉnh đoạn code ở dưới
        //      */
        //     switch (typeEvent) {
        //         // case TYPE_EVENT_GAME.DAILY_CHALLENGE:
        //         //     let dataCustomDailyChallenge: IOpenUIDailyChallenge = {
        //         //         isShowInfo: true,
        //         //         dayOpenDone: null
        //         //     }
        //         //     clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, dataCustomDailyChallenge);
        //         //     break;
        //         default:
        //             clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, dataCustomBase);
        //             break;
        //     }
        // } 
        else {
            const isPlayTutEvent = DataEventsSys.Instance.IsPlayTutorialEvent(eventSend);
            const dataCustomBase: IOpenUIBaseWithInfo = {
                isShowInfo: true,
            }

            switch (true) {
                case this.typeEvent == TYPE_EVENT_GAME.SEASON_PASS && !isPlayTutEvent:
                    clientEvent.dispatchEvent(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE);
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, [dataCustomBase])
                    break;
                case this.typeEvent == TYPE_EVENT_GAME.LEVEL_PROGRESSION && !isPlayTutEvent:
                    CONFIG_LPr.IS_NOTI_START = false;
                    this.UpdateNotification(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
                    clientEvent.dispatchEvent(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE);
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, [dataCustomBase]);
                    break;
                case this.typeEvent == TYPE_EVENT_GAME.LEVEL_PASS && !isPlayTutEvent:
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, (isPlayTutEvent ? [dataCustomBase] : null));
                    break;
                case this.typeEvent == TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                    CONFIG_LPr.IS_NOTI_START = false;
                    this.UpdateNotification(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, dataCustom);
                    break;
                case this.typeEvent == TYPE_EVENT_GAME.SPEED_RACE:
                    if (DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.END_EVENT) {
                        MConfigs.SR_CAN_NOTI_START = false;
                    }
                    this.UpdateNotification(TYPE_EVENT_GAME.SPEED_RACE);
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, dataCustom);
                    break;
                case this.typeEvent == TYPE_EVENT_GAME.DASH_RUSH:
                    if (DataDashRush.Instance.GetState() == STATE_DR.WAIT_TO_JOIN) {
                        MConfigs.DR_CAN_NOTI_START = false;
                    }
                    this.UpdateNotification(TYPE_EVENT_GAME.DASH_RUSH);
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, dataCustom);
                    break;
                case this.typeEvent == TYPE_EVENT_GAME.TREASURE_TRAIL:
                    if (MConfigs.TT_CAN_NOTI_START) {
                        MConfigs.TT_CAN_NOTI_START = false;
                        this.UpdateNotification(TYPE_EVENT_GAME.TREASURE_TRAIL);
                    }
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, dataCustom);
                    break;
                case this.typeEvent == TYPE_EVENT_GAME.SKY_LIFT:
                    if (MConfigs.SL_CAN_NOTI_START) {
                        MConfigs.SL_CAN_NOTI_START = false;
                        this.UpdateNotification(TYPE_EVENT_GAME.SKY_LIFT);
                    }
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true, dataCustom);
                    break;
                default:
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, typeUI, 1, true);
                    break;
            }
        }
    }

    /**
     * this func use for show ui event when click
     */
    private OnBtnShowUIEventLobby() {
        let dataCustom = [];

        switch (this.typeEvent) {
            case TYPE_EVENT_GAME.SPIN: this.onBtnEvent(TYPE_EVENT_GAME.SPIN, TYPE_UI.UI_SPIN); break;
            case TYPE_EVENT_GAME.SEASON_PASS: case TYPE_EVENT_GAME.SEASON_PASS_2: this.onBtnEvent(TYPE_EVENT_GAME.SEASON_PASS, TYPE_UI.UI_SEASON_PASS); break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                switch (DataLevelProgressionSys.Instance.STATE) {
                    case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN:
                        this.onBtnEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE);
                        break;
                    case STATE_EVENT_LEVEL_PROGRESS.JOINING: case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_RECEIVE_END_EVENT:
                        this.onBtnEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION, TYPE_UI.UI_LEVEL_PROGRESSION);
                        break;
                }
                break;
            case TYPE_EVENT_GAME.INVITE_FRIEND: this.onBtnEvent(TYPE_EVENT_GAME.INVITE_FRIEND, TYPE_UI.UI_INVITE_FRIEND); break;
            case TYPE_EVENT_GAME.LOGIN_REWARD: this.onBtnEvent(TYPE_EVENT_GAME.LOGIN_REWARD, TYPE_UI.UI_LOGIN_REWARD); break;
            case TYPE_EVENT_GAME.LEVEL_PASS: this.onBtnEvent(TYPE_EVENT_GAME.LEVEL_PASS, TYPE_UI.UI_LEVEL_PASS); break;
            case TYPE_EVENT_GAME.PIGGY_BANK: this.onBtnEvent(TYPE_EVENT_GAME.PIGGY_BANK, TYPE_UI.UI_PIGGY_BANK); break;
            case TYPE_EVENT_GAME.DASH_RUSH:
                // case active but lock
                if (DataEventsSys.Instance.IsEventShowButLock(this.typeEvent) == 1) {
                    // const timeRemainToUnlockEvent = DataEventsSys.Instance.GetTimeEventInGroupCoolDown(this.typeEvent, 1);
                    // if (timeRemainToUnlockEvent > 0) {
                    //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, `Event unlocks in ${Utils.convertTimeLengthToFormat_ForEvent(timeRemainToUnlockEvent)}`)
                    //     break;
                    // }
                    this.onBtnEvent(TYPE_EVENT_GAME.DASH_RUSH, TYPE_UI.UI_DASH_RUSH_DELAY); break;
                }

                const stateEventDR = DataDashRush.Instance.GetState();
                switch (true) {
                    case DataEventsSys.Instance.IsEventShowingByLoop(TYPE_EVENT_GAME.DASH_RUSH) && stateEventDR == STATE_DR.DELAY_LOSE:
                        this.onBtnEvent(TYPE_EVENT_GAME.DASH_RUSH, TYPE_UI.UI_DASH_RUSH_DELAY); break;
                    case stateEventDR == STATE_DR.DELAY_WIN:
                        this.onBtnEvent(TYPE_EVENT_GAME.DASH_RUSH, TYPE_UI.UI_DASH_RUSH_DELAY); break;
                    case stateEventDR == STATE_DR.WAIT_TO_JOIN:
                        this.onBtnEvent(TYPE_EVENT_GAME.DASH_RUSH, TYPE_UI.UI_DASH_RUSH_PREPARE); break;
                    default:
                        this.onBtnEvent(TYPE_EVENT_GAME.DASH_RUSH, TYPE_UI.UI_DASH_RUSH); break;
                }
                break;
            case TYPE_EVENT_GAME.SPEED_RACE:
                if (!DataSpeedRace.Instance.IsPlayInfo() || DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.END_EVENT) {
                    this.onBtnEvent(TYPE_EVENT_GAME.SPEED_RACE, TYPE_UI.UI_SPEED_RACE_PREPARE); break;
                } else {
                    this.onBtnEvent(TYPE_EVENT_GAME.SPEED_RACE, TYPE_UI.UI_SPEED_RACE); break;
                }
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                this.onBtnEvent(TYPE_EVENT_GAME.ENDLESS_TREASURE, TYPE_UI.UI_ENLESSTREASURE); break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                // case active but lock
                if (DataEventsSys.Instance.IsEventShowButLock(this.typeEvent) == 1) {
                    // const timeRemainToUnlockEvent = DataEventsSys.Instance.GetTimeEventInGroupCoolDown(this.typeEvent, 1);
                    // if (timeRemainToUnlockEvent > 0) {
                    //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, `Event unlocks in ${Utils.convertTimeLengthToFormat_ForEvent(timeRemainToUnlockEvent)}`)
                    //     break;
                    // }
                    this.onBtnEvent(TYPE_EVENT_GAME.TREASURE_TRAIL, TYPE_UI.UI_TREASURE_TRAIL_DELAY); break;
                }

                // case normal
                switch (DataTreasureTrailSys.Instance.STATE) {
                    case STATE_TT.DELAY_WIN: case STATE_TT.DELAY_LOSE:
                        this.onBtnEvent(TYPE_EVENT_GAME.TREASURE_TRAIL, TYPE_UI.UI_TREASURE_TRAIL_DELAY); break;
                    case STATE_TT.WAIT_TO_JOIN:
                        this.onBtnEvent(TYPE_EVENT_GAME.TREASURE_TRAIL, TYPE_UI.UI_TREASURE_TRAIL_PREPARE); break;
                    case STATE_TT.LOCK:
                        this.onBtnEvent(TYPE_EVENT_GAME.TREASURE_TRAIL, TYPE_UI.UI_TREASURE_TRAIL_PREPARE); break;
                    default:
                        this.onBtnEvent(TYPE_EVENT_GAME.TREASURE_TRAIL, TYPE_UI.UI_TREASURE_TRAIL); break;
                }
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                const stateEventSLNow = DataSkyLiftSys.Instance.STATE;
                let typeUISL = null;

                // ui
                switch (stateEventSLNow) {
                    case STATE_SL.DELAY:
                        typeUISL = TYPE_UI.UI_SKY_LIFT_DELAY;
                        break;
                    case STATE_SL.WAIT_TO_JOIN:
                        typeUISL = TYPE_UI.UI_SKY_LIFT_PREPARE;
                        break;
                    default:
                        typeUISL = TYPE_UI.UI_SKY_LIFT;
                        break;
                }
                this.onBtnEvent(TYPE_EVENT_GAME.SKY_LIFT, typeUISL, dataCustom);
                break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                this.onBtnEvent(TYPE_EVENT_GAME.CHRISTMAS_EVENT, TYPE_UI.UI_CHRISTMAS_EVENT);
                break;
            default: break;
        }
    }
    //#endregion
}


function darkerImage(listImgDarker: Sprite[], listLbDarker: Label[], colorDarker: Color, matDarker: Material) {
    listImgDarker.forEach(img => { img.color = colorDarker; img.grayscale = false; });
    listLbDarker.forEach(lb => lb.customMaterial = matDarker);
}