import { _decorator } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { EnumNamePack, IGroupEvents, IGroupEventSave, IParamLogLoseEventInGameIAP, TYPE_EVENT_GAME } from '../Utils/Types';
import { MConfigs } from '../Configs/MConfigs';
import { DataPackSys } from '../DataBase/DataPackSys';
import { Utils } from '../Utils/Utils';
import { CaculTimeEvents2 } from './LobbyScene/CaculTimeEvents2';
import { EVENT_DASH_RUSH, STATE_DR } from './OtherUI/UIDashRush/TypeDashRush';
import { DataTreasureTrailSys } from '../DataBase/DataTreasureTrailSys';
import { EVENT_TT, STATE_TT } from './OtherUI/UITreasureTrail/TypeTreasureTrail';
import { DataDashRush } from './DataDashRush';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { CONFIG_LP } from './OtherUI/UILevelPass/TypeLevelPass';
import { CONFIG_SP } from './OtherUI/UISeasonPass/TypeSeasonPass';
import { DataSkyLiftSys } from '../DataBase/DataSkyLiftSys';
const { ccclass, property } = _decorator;

export enum STATE_EVENT {
    LOCK,
    UNLOCK
}

@ccclass('DataEventsSys')
export class DataEventsSys {
    public static Instance: DataEventsSys;
    private _stateSeasonPass: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateSpin: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateInviteFriend: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateLoginReward: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateLevelPass: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateBuilding: STATE_EVENT = STATE_EVENT.LOCK;
    private _statePiggyBank: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateDashRush: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateSpeedRace: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateEndlessTreasure: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateLevelProgress: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateTreasureTrail: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateSkyLift: STATE_EVENT = STATE_EVENT.LOCK;
    private _stateChristmasEvent: STATE_EVENT = STATE_EVENT.LOCK;

    constructor() {
        if (DataEventsSys.Instance == null) {
            DataEventsSys.Instance = this;
            clientEvent.on(MConst.EVENT_GROUP_LOOP_EVENT.FORCE_CHANGE_TIME, this.ForceChangeTimeGroup, this);
        }
    }

    public UpdateStateForEvent() {
        const levelPlayerNow: number = PlayerData.Instance._levelPlayer;
        this._stateInviteFriend = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.InviteFriend ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        // this._stateSeasonPass = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.SeasonPass ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateSeasonPass = STATE_EVENT.UNLOCK;
        this._stateSpin = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.Spin ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateLoginReward = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.LoginReward ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateLevelPass = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.LevelPass ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateBuilding = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.Building ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._statePiggyBank = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.PiggyBank ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateDashRush = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.DashRush ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateSpeedRace = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.SpeedRace ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateEndlessTreasure = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.EndlessTreasure ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateLevelProgress = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.LevelProgression ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateSkyLift = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.SkyLift ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateTreasureTrail = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.TreasureTrail ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
        this._stateChristmasEvent = levelPlayerNow < MConfigs.LEVEL_TUTORIAL_EVENT.ChristmasEvent ? STATE_EVENT.LOCK : STATE_EVENT.UNLOCK;
    }

    public GetStateEvent(type: TYPE_EVENT_GAME): STATE_EVENT {
        switch (type) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                return this._stateSeasonPass;
            case TYPE_EVENT_GAME.SPIN:
                return this._stateSpin;
            // case TYPE_EVENT_GAME.INVITE_FRIEND:
            //     return this._stateInviteFriend;
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                return this._stateLoginReward;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                return this._stateLevelPass;
            case TYPE_EVENT_GAME.BUILDING:
                return this._stateBuilding;
            case TYPE_EVENT_GAME.PIGGY_BANK:
                return this._statePiggyBank;
            case TYPE_EVENT_GAME.DASH_RUSH:
                return this._stateDashRush;
            case TYPE_EVENT_GAME.SPEED_RACE:
                return this._stateSpeedRace;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                return this._stateEndlessTreasure;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                return this._stateLevelProgress;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                return this._stateTreasureTrail;
            case TYPE_EVENT_GAME.SKY_LIFT:
                return this._stateSkyLift;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                return this._stateChristmasEvent;
        }

        return STATE_EVENT.UNLOCK;
    }

    public IsLockEvent(type: TYPE_EVENT_GAME): boolean {
        // chúng ta sẽ ưu tiên check play tutorial event trước
        if (this.IsPlayTutorialEvent(type)) return false;
        return this.GetStateEvent(type) == STATE_EVENT.LOCK;
    }

    public IsPlayTutorialEvent(type: TYPE_EVENT_GAME): boolean {
        return PlayerData.Instance._isPlayTutorialEvent[type];
    }

    public SetPlayedTutorialEvent(type: TYPE_EVENT_GAME) {
        PlayerData.Instance._isPlayTutorialEvent[type] = true;
        PlayerData.Instance.SaveTut();
    }

    public GetLevelEventUnlock(type: TYPE_EVENT_GAME): number {
        switch (type) {
            case TYPE_EVENT_GAME.SEASON_PASS:
                return MConfigs.LEVEL_TUTORIAL_EVENT.SeasonPass;
            case TYPE_EVENT_GAME.SPIN:
                return MConfigs.LEVEL_TUTORIAL_EVENT.Spin;
            // case TYPE_EVENT_GAME.INVITE_FRIEND:
            //     return MConfigs.LEVEL_TUTORIAL_EVENT.InviteFriend;
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                return MConfigs.LEVEL_TUTORIAL_EVENT.LoginReward;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                return MConfigs.LEVEL_TUTORIAL_EVENT.LevelPass;
            case TYPE_EVENT_GAME.BUILDING:
                return MConfigs.LEVEL_TUTORIAL_EVENT.Building;
            case TYPE_EVENT_GAME.PIGGY_BANK:
                return MConfigs.LEVEL_TUTORIAL_EVENT.PiggyBank;
            case TYPE_EVENT_GAME.DASH_RUSH:
                return MConfigs.LEVEL_TUTORIAL_EVENT.DashRush;
            case TYPE_EVENT_GAME.SPEED_RACE:
                return MConfigs.LEVEL_TUTORIAL_EVENT.SpeedRace;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                return MConfigs.LEVEL_TUTORIAL_EVENT.EndlessTreasure;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                return MConfigs.LEVEL_TUTORIAL_EVENT.LevelProgression;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                return MConfigs.LEVEL_TUTORIAL_EVENT.TreasureTrail;
            case TYPE_EVENT_GAME.SKY_LIFT:
                return MConfigs.LEVEL_TUTORIAL_EVENT.SkyLift;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                return MConfigs.LEVEL_TUTORIAL_EVENT.ChristmasEvent;
        }
    }

    public CanInitItemEvent(typeEventCheck: TYPE_EVENT_GAME): boolean {

        // logic check pack 
        function checkPackIsOngoing(namePack: EnumNamePack): boolean {
            return DataPackSys.Instance.IsPackOngoing(namePack);
        }

        // thứ tự ưu tiên 
        switch (typeEventCheck) {
            case TYPE_EVENT_GAME.SPEED_RACE:
                if (checkPackIsOngoing(EnumNamePack.GreateDealsPack_1) || checkPackIsOngoing(EnumNamePack.GreateDealsPack_2)) {
                    return true;
                }
                break;
        }
        return true;
    }

    //===============================================
    //#region get param to log
    public GetParamEventWhenBoughtIAPSuccess(): IParamLogLoseEventInGameIAP {
        const dataSlNow = DataSkyLiftSys.Instance.GetParamToLogThisEvent();
        const dataTTNow = DataTreasureTrailSys.Instance.GetParamToLogThisEvent();
        const eventOnGoing = this.IsEventShowingByLoop(TYPE_EVENT_GAME.TREASURE_TRAIL) ? TYPE_EVENT_GAME.TREASURE_TRAIL : TYPE_EVENT_GAME.DASH_RUSH;
        const numLoop = eventOnGoing == TYPE_EVENT_GAME.TREASURE_TRAIL ? dataTTNow.num_play_event : dataSlNow.num_play_event;

        return {
            streakSL: dataSlNow.progress_event,
            streakTT: dataTTNow.progress_event,
            typeEventGoingOn: eventOnGoing,
            numLoopEventGoingOn: numLoop
        }
    }
    //#endregion get param to log
    //===============================================

    //===============================================
    //#region group events
    private _listGroupEventLoop: IGroupEvents[] = []; public GetListGroupEvent(): IGroupEvents[] { return this._listGroupEventLoop; }
    public _listTypeEventShow: TYPE_EVENT_GAME[] = [];
    public _listTypeEventHide: TYPE_EVENT_GAME[] = [];
    private readonly ListAllEventWorking = [
        TYPE_EVENT_GAME.DASH_RUSH,
        TYPE_EVENT_GAME.SPIN,
        TYPE_EVENT_GAME.LEVEL_PROGRESSION,
        TYPE_EVENT_GAME.LEVEL_PASS,
        TYPE_EVENT_GAME.SEASON_PASS,
        TYPE_EVENT_GAME.ENDLESS_TREASURE,
        TYPE_EVENT_GAME.SKY_LIFT,
        TYPE_EVENT_GAME.PIGGY_BANK,
        TYPE_EVENT_GAME.LOGIN_REWARD,
        TYPE_EVENT_GAME.TREASURE_TRAIL,
        TYPE_EVENT_GAME.SPEED_RACE,
        TYPE_EVENT_GAME.CHRISTMAS_EVENT
    ]
    /**
     * function phải được gọi duy nhất một lần lúc khởi tạo game và sau khi đã có thể đọc dữ liệu của user
     * không được phép gọi hàm lưu trữ dữ liệu trong này. Bạn có thể thay đổi dữ liệu nhưng xin đừng gọi hàm lưu trữ dữ liệu. 
     */
    public InitListGroupEvents() {
        // loop check player data => 
        IDGrUsing.forEach(idCheck => {
            // tìm kiếm idGroup check trong dữ liệu
            const infoGroupInSave: IGroupEventSave = PlayerData.Instance.GR_listEventGroups.find(groupCheck => groupCheck.idGroup == idCheck);
            const dataRoot = DATA_ROOT_EG.find(infoCheck => infoCheck.iSave.idGroup == idCheck);
            // console.warn(idCheck, dataRoot);

            // console.log("================ group ===============");
            // console.log(infoGroupInSave);
            // console.log(dataRoot);
            // console.log("======================================");

            let groupNew: IGroupEvents = null;
            let groupSaveNew: IGroupEventSave = null;

            switch (true) {
                // case group mới được tạo trong bản cập nhật mới
                case infoGroupInSave == null:
                    //gọi check group event mới
                    groupSaveNew = this.InitNewGroupEventSave(dataRoot.iSave.idGroup);
                    PlayerData.Instance.GR_listEventGroups.push(groupSaveNew);
                    groupNew = this.InitNewGroupEvent(groupSaveNew, dataRoot);
                    break;
                // case group đã được tạo trong các bản trước
                case infoGroupInSave != null:
                    groupNew = this.InitNewGroupEvent(infoGroupInSave, dataRoot);
                    break;
            }

            // push to list
            groupNew != null && this._listGroupEventLoop.push(groupNew);
        });
    }

    private InitNewGroupEventSave(idGroup: number): IGroupEventSave {
        const result: IGroupEventSave = {
            idGroup: idGroup,
            indexEventChecked: 0,
            numLoop: 0,
            timeCanCheckNextEvent: 0,
            isCheckFirstTime: false
        };
        return result;
    }

    private InitNewGroupEvent(dataSave: IGroupEventSave, dataRoot: IGroupEvents): IGroupEvents {
        const iGroupEvents: IGroupEvents = {
            iSave: {
                idGroup: dataRoot.iSave.idGroup,
                indexEventChecked: dataSave.indexEventChecked,
                numLoop: dataSave.numLoop,
                timeCanCheckNextEvent: dataSave.timeCanCheckNextEvent,
                isCheckFirstTime: dataSave.isCheckFirstTime
            },
            listEvents: dataRoot.listEvents,
            listCbCheckNextEvent: dataRoot.listCbCheckNextEvent,
            listCbGetTimeNextEvent: dataRoot.listCbGetTimeNextEvent,
            cbNewIndexOfNextLoop: dataRoot.cbNewIndexOfNextLoop,
            listCbBeforeNextEvent: dataRoot.listCbBeforeNextEvent != null ? dataRoot.listCbBeforeNextEvent : null,
            listCbAfterNextEvent: dataRoot.listCbAfterNextEvent != null ? dataRoot.listCbAfterNextEvent : null,
            listCbAfterUpdateListEventWorking: dataRoot.listCbAfterUpdateListEventWorking != null ? dataRoot.listCbAfterUpdateListEventWorking : null,
            logicCanShowOtherEventButLock: dataRoot.logicCanShowOtherEventButLock != null ? dataRoot.logicCanShowOtherEventButLock : null,
            cbCheckEventBeforeUpdataGroup: dataRoot.cbCheckEventBeforeUpdataGroup != null ? dataRoot.cbCheckEventBeforeUpdataGroup : null
        }

        return iGroupEvents;
    }

    /**
     * Tìm kiếm Group phù hợp với param truyền vào và trả về xem event đó có thể ReInit hay không?
     */
    public CanReInitEvent(typeEventCheck: TYPE_EVENT_GAME): boolean {
        // B1: tìm kiếm id group
        // B2: Kiểm tra đã đến thời hạn có thể next event hay chưa
        // B3: Check logic event đấy có thể ReInit hay không
        //NOTE theo logic hiện tại thì mỗi event chỉ tồn tại trong 1 group duy nhất ko có case 1 event nằm trong 2 group khác nhau
        const groupRootCheck: IGroupEvents = this._listGroupEventLoop.find(group => group.listEvents.includes(typeEventCheck));
        const indexEventInGroupLoop: number = groupRootCheck.listEvents.findIndex(event => event == typeEventCheck);
        // check index event in group có đang trùng với index group hiện tại không
        // trước đấy sẽ update trạng thái của group để đảm bảo trạng thái hiện tại sẽ đang đúng
        this.AutoUpdateStateGroup(groupRootCheck.iSave.idGroup);
        const isSameIndexEventChecked: boolean = groupRootCheck.iSave.indexEventChecked == indexEventInGroupLoop;
        return isSameIndexEventChecked;
    }

    private AutoUpdateStateGroup(idGroup: number): boolean {
        let groupCheck: IGroupEvents = this._listGroupEventLoop.find(group => group.iSave.idGroup == idGroup);

        // check trạng thái group thông qua cb của chính nó
        const indexEventChecked = groupCheck.iSave.indexEventChecked;
        const isCanNextEvent: boolean = groupCheck.iSave.timeCanCheckNextEvent < Utils.getCurrTime();
        const logicCanChangeNextEvent: boolean = groupCheck.listCbCheckNextEvent[indexEventChecked]();
        // const isNextEventUnlock: boolean = this.GetStateEvent(groupCheck.listEvents[indexEventChecked + 1]) == STATE_EVENT.UNLOCK;
        const isEventUnlockNow: boolean = this.GetStateEvent(groupCheck.listEvents[indexEventChecked]) == STATE_EVENT.UNLOCK;
        const isEventNextPlayedTut: boolean = this.IsPlayTutorialEvent(groupCheck.listEvents[indexEventChecked + 1]);
        const isEventNowPlayedTut: boolean = this.IsPlayTutorialEvent(groupCheck.listEvents[indexEventChecked]);
        let anyChange: boolean = false;

        // console.log(idGroup, groupCheck.numLoop, groupCheck.timeCanCheckNextEvent, isEventNowPlayedTut, isEventNextPlayedTut);


        switch (true) {
            // trong trường hợp group mới được tạo nhưng player cũ đã unlock và đang chơi event ko theo đúng thứ tự ban đầu của group
            // ở đây chúng ta sẽ force cài đặt group cho theo event đó
            case !groupCheck.iSave.isCheckFirstTime && idGroup == 0 && isEventNextPlayedTut: // group LevelPass và SeasonPass
                // nếu như đang trong giai đoạn diễn của seasonPass thì ta sẽ force trường hợp group đang ở trong giai đoạn SeasonPass luôn
                const isSeasonPassPlaying: boolean = !CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.SEASON_PASS);
                if (isSeasonPassPlaying) {
                    groupCheck.iSave.indexEventChecked = 1;
                    groupCheck.iSave.timeCanCheckNextEvent = CaculTimeEvents2.Instance.GetTimeEventEndFromNow(TYPE_EVENT_GAME.SEASON_PASS);
                } else {
                    groupCheck.iSave.timeCanCheckNextEvent = Utils.getCurrTime() + groupCheck.listCbGetTimeNextEvent[groupCheck.iSave.indexEventChecked]();
                }
                groupCheck.iSave.isCheckFirstTime = true;
                anyChange = true;
                break;
            case !groupCheck.iSave.isCheckFirstTime && idGroup == 1 && isEventNextPlayedTut: // group dashRush và TreasureTrail
                const isJoinginDR: boolean = DataDashRush.Instance.GetState() == STATE_DR.JOINING;
                let indexEventChecked = isJoinginDR ? 1 : 0;
                let timeEnd = isJoinginDR ? PlayerData.Instance.DR_timeEnd : Utils.getCurrTime() + groupCheck.listCbGetTimeNextEvent[groupCheck.listEvents.findIndex(e => e == TYPE_EVENT_GAME.TREASURE_TRAIL)]();
                groupCheck.iSave.indexEventChecked = indexEventChecked;
                groupCheck.iSave.timeCanCheckNextEvent = timeEnd;
                groupCheck.iSave.isCheckFirstTime = true;
                if (isJoinginDR) { groupCheck.iSave.numLoop == -1; }
                anyChange = true;
                break;

            // trong trường hợp bắt đầu tut của các event trong group
            // < ở đây chúng ta chỉ tính là tut đầu tiên của mỗi group là tut sẽ được unlock>
            case !groupCheck.iSave.isCheckFirstTime && (IDGrUsing.includes(idGroup)) && !isEventNowPlayedTut && isEventUnlockNow:
                groupCheck.iSave.isCheckFirstTime = true;
                groupCheck.iSave.timeCanCheckNextEvent = Utils.getCurrTime() + groupCheck.listCbGetTimeNextEvent[groupCheck.iSave.indexEventChecked]();
                anyChange = true;
                break;

            // sau khi update group check
            // chúng ta sẽ cập nhật trạng thái event nếu như
            // nếu như ở đây chúng ta cập nhật lại trạng thái của event tiếp theo thì làm sao để biết dc để reInit lại event
            // => ở đây theo logic game này thì chúng ta chỉ tái tạo lại event mới trong trường hợp khi user về home
            // => vậy nên ở đây chúng ta sẽ chỉ cần đẩy index event Check thôi
            // Còn khi user về home ta sẽ gọi một hàm check LogicGenGroupEvent để quyết định thời gian kết thúc các event
            case isCanNextEvent && logicCanChangeNextEvent:

                const oldIndexEvent = groupCheck.iSave.indexEventChecked;

                // call cb listCbBeforeNextEvent 
                if (groupCheck.listCbBeforeNextEvent != null) {
                    groupCheck.listCbBeforeNextEvent[groupCheck.iSave.indexEventChecked] != null && groupCheck.listCbBeforeNextEvent[groupCheck.iSave.indexEventChecked]();
                }

                const infoNextEvent = groupCheck.cbNewIndexOfNextLoop(groupCheck);
                groupCheck.iSave.indexEventChecked = infoNextEvent.indexEventNew;
                groupCheck.iSave.timeCanCheckNextEvent = infoNextEvent.timeRemainNew;
                groupCheck.iSave.numLoop += infoNextEvent.numLoopWasPass;

                const newIndexEvent = groupCheck.iSave.indexEventChecked;

                if (groupCheck.listCbAfterNextEvent != null && groupCheck.listCbAfterNextEvent[groupCheck.iSave.indexEventChecked] != null) {
                    // console.log("1", groupCheck.iSave.indexEventChecked);
                    groupCheck.listCbAfterNextEvent[groupCheck.iSave.indexEventChecked](oldIndexEvent, newIndexEvent);
                }

                anyChange = true;
                break;
        }

        return anyChange;
    }

    private GetTimeStartThisLoopEvent(groupCheck: IGroupEvents): number {
        let result = groupCheck.iSave.timeCanCheckNextEvent;
        for (let i = groupCheck.iSave.indexEventChecked; i >= 0; i--) {
            const timeNextEvent = groupCheck.listCbGetTimeNextEvent[i]();
            result -= timeNextEvent;
        }
        return result;
    }

    private GetTotalTimeEventGroupUntilIndexEvent(groupCheck: IGroupEvents, indexEventCheck: number): number {
        let result = 0;
        for (let i = 0; i <= indexEventCheck && i < groupCheck.listEvents.length; i++) {
            const timeNextEvent = groupCheck.listCbGetTimeNextEvent[i]();
            result += timeNextEvent;
        }
        return result;
    }

    private GetIndexEventByTimePassALoop(groupCheck: IGroupEvents, timePassNewLoop: number): number {
        let indexResult = -1;
        let timeCheck = timePassNewLoop;
        const timeNow = Utils.getCurrTime()
        for (let i = 0; i < groupCheck.listEvents.length; i++) {
            const timeNextEvent = groupCheck.listCbGetTimeNextEvent[i]();
            timeCheck += timeNextEvent;
            if (timeCheck > timeNow) {
                indexResult = i;
                break;
            }
        }

        // console.warn("1111111", indexResult, timeCheck);
        return indexResult;
    }

    public GetTheInfoSuitForNextEvent(groupCheck: IGroupEvents): { indexEventNew: number, timeRemainNew: number, numLoopWasPass: number } {
        // console.error("idEvent check", groupCheck.iSave.idGroup);

        const timeStartThisLoopEventCheck: number = this.GetTimeStartThisLoopEvent(groupCheck);
        const timeNow: number = Utils.getCurrTime();
        const totalTimeAllEventsGroup = this.GetTotalTimeEventGroupUntilIndexEvent(groupCheck, groupCheck.listEvents.length - 1);
        let numLoopWasPass = Math.floor((timeNow - timeStartThisLoopEventCheck) / totalTimeAllEventsGroup);
        let timeStartLoopNow = timeStartThisLoopEventCheck + totalTimeAllEventsGroup * numLoopWasPass;
        let indexEventNow = this.GetIndexEventByTimePassALoop(groupCheck, timeStartLoopNow);

        let timeToNextLoopIndexEvent = this.GetTotalTimeEventGroupUntilIndexEvent(groupCheck, indexEventNow);
        if (timeToNextLoopIndexEvent == 0) {
            timeToNextLoopIndexEvent = groupCheck.listCbGetTimeNextEvent[0]();
        }
        let timeEndEventNew = timeStartLoopNow + timeToNextLoopIndexEvent;
        // console.log("🚀", indexEventNow, timeStartThisLoopEventCheck, timeStartLoopNow, timeEndEventNew);
        return {
            indexEventNew: indexEventNow,
            timeRemainNew: timeEndEventNew,
            numLoopWasPass: numLoopWasPass
        }
    }



    /**
     * Hàm này sẽ được gọi trong onLoad của ControlItemEvents
     * @returns 
     */
    public GetListEventCanShowThisSeasionAtSceneLobby(needSaveData: boolean = false): { listEventsShow: TYPE_EVENT_GAME[], listEventsHide: TYPE_EVENT_GAME[] } {
        // auto update toàn bộ các event trong group + save event
        let hasAnyChange: boolean = false;
        this._listGroupEventLoop.forEach(group => {
            if (group.cbCheckEventBeforeUpdataGroup != null) {
                group.cbCheckEventBeforeUpdataGroup(group.iSave, group.listEvents);
            }
            let isChange = this.AutoUpdateStateGroup(group.iSave.idGroup);
            hasAnyChange = !hasAnyChange ? isChange : true;
        });
        if (hasAnyChange) { this.SaveDataGroupEvent(needSaveData); }

        // list group event shows
        const listGroupEventShow: TYPE_EVENT_GAME[] = [];
        this._listGroupEventLoop.forEach(gEvent => {
            if (gEvent.logicCanShowOtherEventButLock != null) {
                const listEventsShowSpecial: TYPE_EVENT_GAME[] = gEvent.logicCanShowOtherEventButLock(gEvent.iSave.numLoop, gEvent.listEvents, gEvent.iSave.indexEventChecked);
                listGroupEventShow.push(...listEventsShowSpecial)
            } else {
                listGroupEventShow.push(gEvent.listEvents[gEvent.iSave.indexEventChecked]);
            }
        })

        // check event đang Hide
        let totalEventAffectByGroup: TYPE_EVENT_GAME[] = [];
        try {
            const mapEventGroups = this._listGroupEventLoop.map(group => group.listEvents);
            if (mapEventGroups == null) {
                throw ("mapEventGroups has something wrongs");
            } else {
                totalEventAffectByGroup = mapEventGroups.flat();
            }
        } catch (e) {
            totalEventAffectByGroup = [];
        }
        const listGroupEventHide: TYPE_EVENT_GAME[] = totalEventAffectByGroup.filter(groupCheck => !listGroupEventShow.includes(groupCheck));

        this._listTypeEventShow = this.ListAllEventWorking.filter(event => !listGroupEventHide.includes(event));
        this._listTypeEventHide = listGroupEventHide;

        // console.warn("list group show: ", this._listTypeEventShow);
        // console.warn("list group hide: ", this._listTypeEventHide);

        return {
            listEventsShow: listGroupEventShow,
            listEventsHide: listGroupEventHide
        }
    }

    public SaveDataGroupEvent(needSaveData: boolean = true) {
        // convert data now to data for saving
        const listToSave: IGroupEventSave[] = this._listGroupEventLoop.map(group => ({
            idGroup: group.iSave.idGroup,
            indexEventChecked: group.iSave.indexEventChecked,
            numLoop: group.iSave.numLoop,
            timeCanCheckNextEvent: group.iSave.timeCanCheckNextEvent,
            isCheckFirstTime: group.iSave.isCheckFirstTime
        }));
        PlayerData.Instance.GR_listEventGroups = listToSave;
        needSaveData && PlayerData.Instance.SaveListEventGroups(needSaveData);
    }

    public GetTimeGroupEventRemain(typeEvent: TYPE_EVENT_GAME, idGroup: number): number {
        const group = this._listGroupEventLoop.find(group => group.iSave.idGroup == idGroup);
        if (group == null) return -1;
        const indexEvent = group.listEvents.findIndex(event => event == typeEvent);
        if (indexEvent < 0) return -1;
        const isShowingEvent = group.iSave.indexEventChecked == indexEvent;
        if (!isShowingEvent) return -1;
        const remainTimeEvent = group.iSave.timeCanCheckNextEvent - Utils.getCurrTime();
        return remainTimeEvent;
    }

    public GetTimeEventInGroupCoolDown(typeEvent: TYPE_EVENT_GAME, idGroup: number): number {
        const group = this._listGroupEventLoop.find(group => group.iSave.idGroup == idGroup);
        if (group == null) return -1;
        const indexEvent = group.listEvents.findIndex(event => event == typeEvent);
        if (indexEvent < 0) return -1;
        const isNotShowingEvent = group.iSave.indexEventChecked != indexEvent;
        if (!isNotShowingEvent) return -1;
        const remainTimeEvent = group.iSave.timeCanCheckNextEvent - Utils.getCurrTime();
        return remainTimeEvent;
    }

    public GetGroupById(idGroup: number): IGroupEvents {
        const group = this._listGroupEventLoop.find(group => group.iSave.idGroup == idGroup);
        return group;
    }

    public IsEventHide(typeEvent: TYPE_EVENT_GAME) {
        return this._listTypeEventHide.includes(typeEvent);
    }

    /**
     * loop qua các group đang hoạt động và tìm kiếm group đầu tiên có chưa event đó , check group đó đã numLoop >= 1 chưa?
     * nếu rồi thì sẽ sẽ trả về true
     * @param typeEvent 
     * @returns number 
     *       -1 : ko tìm thấy event trong group |
     *       0 : tìm thấy event trong group nhưng ko phải event show but lock |
     *       1: tìm thấy event trong group và event đó là event show but lock
     */
    public IsEventShowButLock(typeEvent: TYPE_EVENT_GAME): number {
        let result = -1;
        for (let i = 0; i < this._listGroupEventLoop.length; i++) {
            const gCheck = this._listGroupEventLoop[i];
            if (gCheck.listEvents.includes(typeEvent)) {
                result = 0
                const indexEventInList = gCheck.listEvents.indexOf(typeEvent);
                // kiểm tra đối với những event có func có thể check event but lock trước
                if (gCheck.logicCanShowOtherEventButLock != null) {
                    const listEventShowing: TYPE_EVENT_GAME[] = gCheck.logicCanShowOtherEventButLock(gCheck.iSave.numLoop, gCheck.listEvents, gCheck.iSave.indexEventChecked);
                    if (listEventShowing.includes(typeEvent) && indexEventInList != gCheck.iSave.indexEventChecked) {
                        result = 1;
                        break;
                    }
                }
            }
        }

        return result;
    }

    /**
     * Loop những group event đang diễn ra và chỉ chọn những event nào trong danh sách group mà đang checked
     */
    public IsEventShowingByLoop(typeEvent: TYPE_EVENT_GAME) {
        let result = false;
        for (let i = 0; i < this._listGroupEventLoop.length; i++) {
            const gCheck = this._listGroupEventLoop[i];
            if (gCheck.listEvents.includes(typeEvent)) {
                if (gCheck.listEvents.indexOf(typeEvent) == gCheck.iSave.indexEventChecked) {
                    result = true;
                    break;
                }
            }
        }

        return result;
    }

    public ForceUdpateEventFromLoading() {
        // trong func này sẽ tập trung chủ yếu vào udpate những event có trong group mà ở trong những trường hợp special case
        switch (true) {
            // case DashRush
            case this.IsEventHide(TYPE_EVENT_GAME.DASH_RUSH):
                clientEvent.dispatchEvent(EVENT_DASH_RUSH.FORCE_END);
                break;
            case this.IsEventHide(TYPE_EVENT_GAME.TREASURE_TRAIL):
                clientEvent.dispatchEvent(EVENT_TT.FORCE_END);
                break;
        }
    }

    private ForceChangeTimeGroup(idGroup: number, timeNew: number) {
        //find group in data
        const groupChange = this._listGroupEventLoop.find(groupCheck => groupCheck.iSave.idGroup == idGroup);
        if (groupChange == null) { console.error("not found group"); }
        groupChange.iSave.timeCanCheckNextEvent = Utils.getCurrTime() + timeNew;
        this.SaveDataGroupEvent();
    }

    public GetTimeUntilUnlockNextEvent(typeEvent: TYPE_EVENT_GAME): number {
        const groupCheck = this._listGroupEventLoop.find(data => data.listEvents.includes(typeEvent));
        if (groupCheck == null) { return -1; }

        const indexEvent = groupCheck.listEvents.findIndex(event => event == typeEvent);

        const timeNow = Utils.getCurrTime();
        let result = groupCheck.iSave.timeCanCheckNextEvent - timeNow;
        if (result < 0) result = 0;

        switch (true) {
            // case indexEvent == groupCheck.iSave.indexEventChecked:
            //     for (let i = 0; i < groupCheck.listCbGetTimeNextEvent.length; i++) {
            //         result += groupCheck.listCbGetTimeNextEvent[i]();
            //     }
            //     break;
            case indexEvent > groupCheck.iSave.indexEventChecked:
                for (let i = groupCheck.iSave.indexEventChecked + 1; i < indexEvent; i++) {
                    result += groupCheck.listCbGetTimeNextEvent[i]();
                }
                break;
            case indexEvent <= groupCheck.iSave.indexEventChecked:
                for (let i = groupCheck.iSave.indexEventChecked + 1; i < groupCheck.listCbGetTimeNextEvent.length; i++) {
                    result += groupCheck.listCbGetTimeNextEvent[i]();
                }

                for (let i = 0; i < indexEvent; i++) {
                    result += groupCheck.listCbGetTimeNextEvent[i]();
                }
                break;
        }

        return result;
    }
    //#endregion group events
    //===============================================

    //===============================================
    //#region time
    /**!SECTION
     * Chỉ RegisterTimeGroup sau khi update lần đầu tiên ở home
     * cụ thể ở class ControlItemsEvent
     * */
    public RegisterTimeGroup() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.UpdateTimeGroup, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTimeGroup, this);
        }
    }

    /**
     * func này sẽ được gọi khi class LobbySys disable => tương ứng vs vc đã rời màn home
     */
    public UnRegisterTimeGroup() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTimeGroup, this);
    }

    private UpdateTimeGroup() {
        const timeNow = Utils.getCurrTime();
        // kiểm tra từng group đang hoạt động. Nếu như thời gian hiện tại vượt qua thời gian hoạt động của các group event đó thì sẽ dispatch udpate event
        this._listGroupEventLoop.forEach(groupCheck => {
            // hiển tại chỉ áp dụng cho group có dashRush và TreasureTrail
            // chỉ tính từ lần lặp thứ 1
            if (groupCheck.logicCanShowOtherEventButLock != null) {
                if (timeNow > groupCheck.iSave.timeCanCheckNextEvent) {
                    // console.warn("Trigger Auto update time loop: ", groupCheck.idGroup);
                    let hasChange = this.AutoUpdateStateGroup(groupCheck.iSave.idGroup);
                    if (groupCheck.listCbAfterUpdateListEventWorking != null && groupCheck.listCbAfterUpdateListEventWorking[groupCheck.iSave.indexEventChecked] != null) {
                        groupCheck.listCbAfterUpdateListEventWorking[groupCheck.iSave.indexEventChecked]();
                    }
                    if (hasChange) { this.SaveDataGroupEvent(); }
                }
            }
        })
    }

    public GetTimeEventWithLoop(typeEvent: TYPE_EVENT_GAME): number {

        // kiêm tra event check có trong group hay không?
        // nếu không thì trả về -1
        const groupHasEvent = this._listGroupEventLoop.find(group => group.listEvents.includes(typeEvent))
        if (groupHasEvent == null) { return -1; }
        const indexEvent = groupHasEvent.listEvents.findIndex(event => event == typeEvent);
        if (indexEvent < 0) return -1;
        const isShowingEvent = groupHasEvent.iSave.indexEventChecked == indexEvent;
        const timeNow = Utils.getCurrTime();

        let remainTime = -1;
        if (!isShowingEvent) {
            remainTime = groupHasEvent.iSave.timeCanCheckNextEvent + this.GetTimeUntilUnlockNextEvent(typeEvent) - timeNow;
        } else {
            remainTime = groupHasEvent.iSave.timeCanCheckNextEvent - Utils.getCurrTime()
        }

        return remainTime;
    }
    //#endregion time
    //===============================================
}
const IDGrUsing = [0];//[0, 1];

//NOTE - Xin hãy nhớ là ko bao giờ được phép xóa Gr chỉ được thêm
//NOTE - Nếu sửa hãy cân nhắc
export const DATA_ROOT_EG: IGroupEvents[] = [
    {
        iSave: {
            idGroup: 0,
            indexEventChecked: 0,
            numLoop: 0,
            timeCanCheckNextEvent: -1,
            isCheckFirstTime: false
        },
        listEvents: [TYPE_EVENT_GAME.LEVEL_PASS, TYPE_EVENT_GAME.SEASON_PASS],
        listCbCheckNextEvent: [
            () => { //LP->SP
                // check đã hoàn thành event hay chưa
                // check trạng thái event thông qua caculator
                const isFullProgressLevelPass = PlayerData.Instance._LP_isFinishEvent;
                const isBoughtPrenium = PlayerData.Instance._levelPass_isActive;
                const isEndEvent: boolean = CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.LEVEL_PASS);

                // trong trường hợp đã hoàn thành đủ điều kiện để qua seasonPass
                const validPassToSeasonPass = isEndEvent && isFullProgressLevelPass && isBoughtPrenium;

                // trong trường hợp đã hết h và chưa đạt đủ điều kiện để tiếp tục event
                const validNotPassAndLoopLP = isEndEvent && (!isBoughtPrenium || !isFullProgressLevelPass)
                return validPassToSeasonPass || validNotPassAndLoopLP;
            },
            () => { //SP->LP
                // check user có mua hay không
                // check trạng thái event thông qua caculator
                const isEndEvent: boolean = CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.SEASON_PASS);
                return isEndEvent;
            }
        ],
        listCbGetTimeNextEvent: [
            // LP -> SP
            () => { return CONFIG_LP.MAX_TIME_EVENT; },   // levelPass long
            // SP -> LP
            () => { return CONFIG_SP.MAX_TIME_EVENT; },   // seasonPass long
        ],
        cbNewIndexOfNextLoop: (groupCheck: IGroupEvents): { indexEventNew: number, timeRemainNew: number, numLoopWasPass: number } => {
            const maxEvents = groupCheck.listEvents.length;
            let numLevelIncrease: number = 0;
            switch (groupCheck.iSave.indexEventChecked) {
                case 0:
                    if (PlayerData.Instance._LP_isFinishEvent && PlayerData.Instance._levelPass_isActive) numLevelIncrease = 1;
                    else numLevelIncrease = maxEvents;
                    break;
                case 1:
                    if (PlayerData.Instance._seasonPass_isActive && PlayerData.Instance._SP_isFinishEvent) numLevelIncrease = maxEvents;
                    else numLevelIncrease = 1;
                    break;
                default: numLevelIncrease = 1; break;
            }

            // get the result data
            let indexEventNew = groupCheck.iSave.indexEventChecked + numLevelIncrease;
            let numLoopWasPass = groupCheck.iSave.numLoop;

            if (indexEventNew >= maxEvents) {
                numLoopWasPass += 1;
                indexEventNew = indexEventNew % maxEvents;
            }
            let timeRemainNew = Utils.getCurrTime() + groupCheck.listCbGetTimeNextEvent[indexEventNew]();

            return {
                indexEventNew: indexEventNew,
                timeRemainNew: timeRemainNew,
                numLoopWasPass: numLoopWasPass
            }
        },
        listCbBeforeNextEvent: [
            // LP -> SP
            () => { clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.SEASON_PASS, 1, false); },
            // SP -> LP
            () => { clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.LEVEL_PASS, 1, false); },
        ],
        listCbAfterNextEvent: [
            // LP || SP
            (indexOld: number = -1, indexNew: number = -1) => {
                if (indexOld == -1 || indexNew == -1) { return; }
                if (indexOld == indexNew) {
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.LEVEL_PASS, 1, false);
                }
            },
            // LP || SP
            (indexOld: number = -1, indexNew: number = -1) => {
                if (indexOld == -1 || indexNew == -1) { return; }
                if (indexOld != indexNew) {
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.LEVEL_PASS, 1, false);
                } else {
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.FORCE_GEN_EVENT, TYPE_EVENT_GAME.SEASON_PASS, 1, false);
                }
            },
        ]
    },
    {
        iSave: {
            idGroup: 1,
            indexEventChecked: 0,
            numLoop: 0,
            timeCanCheckNextEvent: -1,
            isCheckFirstTime: false
        },
        listEvents: [TYPE_EVENT_GAME.TREASURE_TRAIL, TYPE_EVENT_GAME.DASH_RUSH],
        cbCheckEventBeforeUpdataGroup: (iSave: IGroupEventSave, listEvents: TYPE_EVENT_GAME[]) => {
            if (!iSave.isCheckFirstTime) return;
            const typeEventChoicing = listEvents[iSave.indexEventChecked];
            switch (true) {
                case typeEventChoicing != TYPE_EVENT_GAME.DASH_RUSH:
                    if (DataDashRush.Instance != null && DataDashRush.Instance.GetState() == STATE_DR.JOINING) {
                        clientEvent.dispatchEvent(EVENT_DASH_RUSH.FORCE_END);
                    }
                    break;
                case typeEventChoicing != TYPE_EVENT_GAME.TREASURE_TRAIL:
                    if (DataTreasureTrailSys.Instance != null && DataTreasureTrailSys.Instance.STATE == STATE_TT.JOINING) {
                        clientEvent.dispatchEvent(EVENT_TT.FORCE_END);
                    }
                    break;
            }
        },
        listCbCheckNextEvent: [
            () => {
                const isUnlockEventTreasureTrail = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
                return isUnlockEventTreasureTrail;

            },
            () => {
                return true;
            }
        ],
        listCbGetTimeNextEvent: [
            // TT -> DR
            () => { return 60 * 60 * 24; },
            // DR -> TT
            () => { return 60 * 60 * 24; },
        ],
        listCbAfterNextEvent: [
            // DR -> TT
            (indexOld: number = -1, indexNew: number = -1) => {
                // call force end DR
                clientEvent.dispatchEvent(EVENT_DASH_RUSH.FORCE_END, false);
                if (indexOld != indexNew || DataTreasureTrailSys.Instance.IsReceiveReward()) {
                    clientEvent.dispatchEvent(EVENT_TT.FORCE_WAIT_TO_JOIN, false);
                }
            },
            // TT -> DR
            (indexOld: number = -1, indexNew: number = -1) => {
                clientEvent.dispatchEvent(EVENT_TT.FORCE_END, false);
                if (indexOld != indexNew) {
                    // call force end TT
                    clientEvent.dispatchEvent(EVENT_DASH_RUSH.FORCE_WAIT_TO_JOIN, false);
                }
            },
        ],
        listCbAfterUpdateListEventWorking: [
            // DR -> TT
            () => {
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.TREASURE_TRAIL);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.TREASURE_TRAIL);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.DASH_RUSH);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.OPEN_EVENT_BY_GROUP, TYPE_EVENT_GAME.DASH_RUSH);
            },
            // TT -> DR
            () => {
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.TREASURE_TRAIL);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.TREASURE_TRAIL);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_TIME, TYPE_EVENT_GAME.DASH_RUSH);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.DASH_RUSH);
                clientEvent.dispatchEvent(MConst.EVENT_GAME.OPEN_EVENT_BY_GROUP, TYPE_EVENT_GAME.TREASURE_TRAIL);
            },
        ],
        cbNewIndexOfNextLoop: (groupCheck: IGroupEvents): { indexEventNew: number, timeRemainNew: number, numLoopWasPass: number } => {
            return DataEventsSys.Instance.GetTheInfoSuitForNextEvent(groupCheck)
        },
        logicCanShowOtherEventButLock: (numLoop: number, listEvent: TYPE_EVENT_GAME[], indexEventShowing: number): TYPE_EVENT_GAME[] => {
            let result: TYPE_EVENT_GAME[] = [];
            result.push(listEvent[indexEventShowing]);
            // switch (true) {
            //     case numLoop < 0 || (numLoop == 0 && indexEventShowing == 0):
            //         result.push(listEvent[indexEventShowing]);
            //         break;
            //     default:
            //         result.push(...listEvent);
            //         break;
            // }
            return result;
        }
    },
]