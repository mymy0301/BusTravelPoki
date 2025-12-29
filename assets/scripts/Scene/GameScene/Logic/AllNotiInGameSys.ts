import { _decorator, Component, Node } from 'cc';
import { UINotiOnlyOneParking } from '../OtherUI/UINotiOnlyOneParking/UINotiOnlyOneParking';
import { FxTextComboSys } from '../OtherUI/FxText/FxTextComboSys';
import { UINotiNoPlaceParking } from '../OtherUI/UINotiNoPlaceParking/UINotiNoPlaceParking';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { GameSys } from '../GameSys';
import { STATE_PARKING_CAR } from '../../../Utils/Types';
import { UINotiEndTime } from '../OtherUI/UINotiEndTime/UINotiEndTime';
const { ccclass, property } = _decorator;

enum TYPE_NOTI {
    ONLY_ONE_PARKING,
    NO_PLACE_PARKING,
    COMBO,
    END_TIME
}

@ccclass('AllNotiInGameSys')
export class AllNotiInGameSys extends Component {
    @property(UINotiOnlyOneParking) notiOnlyOneParking: UINotiOnlyOneParking;
    @property(UINotiNoPlaceParking) notiNoPlaceParking: UINotiNoPlaceParking;
    @property(UINotiEndTime) notiEndTime: UINotiEndTime;
    @property(FxTextComboSys) notiCombo: FxTextComboSys;

    private _statusNoti: boolean[] = new Array<boolean>(Object.keys(TYPE_NOTI).length / 2).fill(false);

    private _queueRequest: Array<[TYPE_NOTI, any[]]> = [];

    //=================================================================
    //#region Lifecycle
    protected onEnable(): void {
        this.notiOnlyOneParking.HideVisual();
        this.notiNoPlaceParking.HideVisual();
        this.notiCombo.StopAnim();
        this.notiEndTime.HideVisual();
        clientEvent.on(MConst.NOTIFICATION_IN_GAME.ONLY_ONE_PARKING, this.TryShowNotiOnlyOneParking, this);
        clientEvent.on(MConst.NOTIFICATION_IN_GAME.NO_PLACE_PARKING, this.TryShowNotiNoPlaceParking, this);
        clientEvent.on(MConst.NOTIFICATION_IN_GAME.END_TIME, this.TryShowNotiEndTime, this);
        clientEvent.on(MConst.EVENT_TEXT_COMBO.PLAY_FX_COMBO, this.TryShowCombo, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetStatusNoti, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.NOTIFICATION_IN_GAME.ONLY_ONE_PARKING, this.TryShowNotiOnlyOneParking, this);
        clientEvent.off(MConst.NOTIFICATION_IN_GAME.NO_PLACE_PARKING, this.TryShowNotiNoPlaceParking, this);
        clientEvent.off(MConst.NOTIFICATION_IN_GAME.END_TIME, this.TryShowNotiEndTime, this);
        clientEvent.off(MConst.EVENT_TEXT_COMBO.PLAY_FX_COMBO, this.TryShowCombo, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetStatusNoti, this);
    }
    //#endregion Lifecycle
    //=================================================================

    //=================================================================
    // #region self
    private ForecTurnOffNoti(typeNoti: TYPE_NOTI) {
        if (!this._statusNoti[typeNoti]) { return; }
        // turn off noti
        switch (typeNoti) {
            case TYPE_NOTI.NO_PLACE_PARKING:
                this.notiNoPlaceParking.HideVisual();
                break;
            case TYPE_NOTI.ONLY_ONE_PARKING:
                this.notiOnlyOneParking.HideVisual();
                break;
            case TYPE_NOTI.COMBO:
                this.notiCombo.StopAnim();
                break;
        }
        this._statusNoti[typeNoti] = false;
    }

    private async ShowNoti(typeNoti: TYPE_NOTI, ...args: any[]) {
        this._statusNoti[typeNoti] = true;

        switch (typeNoti) {
            case TYPE_NOTI.NO_PLACE_PARKING:
                // check is valid other noti => force turn it off
                this.ForecTurnOffNoti(TYPE_NOTI.ONLY_ONE_PARKING);
                this.ForecTurnOffNoti(TYPE_NOTI.COMBO);
                // show noti
                this.notiNoPlaceParking.node.setSiblingIndex(0);
                this.notiNoPlaceParking.ShowNoti(() => {
                    this._statusNoti[typeNoti] = false;
                });
                break;
            case TYPE_NOTI.ONLY_ONE_PARKING:
                // check is valid other noti => force turn it off
                this.ForecTurnOffNoti(TYPE_NOTI.COMBO);
                // show noti
                this.notiOnlyOneParking.node.setSiblingIndex(0);
                this.notiOnlyOneParking.ShowNoti(() => {
                    this._statusNoti[typeNoti] = false;
                });
                break;
            case TYPE_NOTI.COMBO:
                this.notiCombo.node.setSiblingIndex(0);
                await this.notiCombo.PlayCombo(args[0], args[1]);
                this._statusNoti[typeNoti] = false;
                break;
            case TYPE_NOTI.END_TIME:
                this.notiEndTime.node.setSiblingIndex(0);
                this.notiEndTime.ShowNoti(null);
                break;
        }
    }

    private ResetStatusNoti() {
        this._statusNoti.fill(false);
        this._queueRequest = [];
        this.notiNoPlaceParking.HideVisual();
        this.notiOnlyOneParking.HideVisual();
        this.notiCombo.StopAnim();
        this._isLooping = false;
    }

    private AddQueueAction(type: TYPE_NOTI, args: any[]) {
        const newQueue: [TYPE_NOTI, any[]] = [type, args];
        this._queueRequest.push(newQueue);

        if (!this._isLooping) {
            this.TryLoopQueue();
        }
    }

    private _isLooping: boolean = false;
    private async TryLoopQueue() {
        while (true) {
            try {
                this._isLooping = true;
                if (this._queueRequest.length == 0) {
                    this._isLooping = false;
                    break;
                }

                const nextQueue: [TYPE_NOTI, any[]] = this._queueRequest.shift();
                const isShowingNotiNoPlaceParking = this._statusNoti[TYPE_NOTI.NO_PLACE_PARKING];
                const isShowingNotiOnlyOneParking = this._statusNoti[TYPE_NOTI.ONLY_ONE_PARKING];
                switch (nextQueue[0]) {
                    case TYPE_NOTI.ONLY_ONE_PARKING:
                        if (isShowingNotiNoPlaceParking) { return; }
                        if (GameSys.Instance == null) { return; }
                        const isValidCanNoti = GameSys.Instance.listParkingCarSys.GetListNParkingCarByState(STATE_PARKING_CAR.EMPTY).length == 1
                        if (!isValidCanNoti) { return; }
                        await this.ShowNoti(TYPE_NOTI.ONLY_ONE_PARKING, ...nextQueue[1]);
                        break;
                    case TYPE_NOTI.COMBO:
                        if (isShowingNotiNoPlaceParking || isShowingNotiOnlyOneParking) { (nextQueue[1][1] as CallableFunction)(false); return; }
                        await this.ShowNoti(TYPE_NOTI.COMBO, ...nextQueue[1]);
                        break;
                    case TYPE_NOTI.NO_PLACE_PARKING:
                        await this.ShowNoti(TYPE_NOTI.NO_PLACE_PARKING, ...nextQueue[1]);
                        break;
                }

                this.TryLoopQueue();
            } catch (e) {
                break;
            }
        }

    }
    // #endregion self
    //=================================================================

    //=================================================================
    //#region Event Handlers
    private HandleShowCombo(...arg: any[]) {
        this.AddQueueAction(TYPE_NOTI.COMBO, arg);
    }

    private HandleShowOnlyOneParking() {
        this.AddQueueAction(TYPE_NOTI.ONLY_ONE_PARKING, []);
    }

    private HandleShowNoPlaceParking() {
        this.AddQueueAction(TYPE_NOTI.NO_PLACE_PARKING, []);
    }

    private TryShowCombo(...arg: any[]) {
        const isShowingNotiNoPlaceParking = this._statusNoti[TYPE_NOTI.NO_PLACE_PARKING];
        if (isShowingNotiNoPlaceParking) { (arg[1] as CallableFunction)(false); return; }
        const isShowingNotiOnlyOneParking = this._statusNoti[TYPE_NOTI.ONLY_ONE_PARKING];
        if (isShowingNotiOnlyOneParking) { (arg[1] as CallableFunction)(false); return; }
        // show noti
        this.ShowNoti(TYPE_NOTI.COMBO, ...arg);
    }

    private TryShowNotiOnlyOneParking() {
        const isShowingNotiNoPlaceParking = this._statusNoti[TYPE_NOTI.NO_PLACE_PARKING];
        if (isShowingNotiNoPlaceParking) { return; }
        if (GameSys.Instance == null) { return; }
        const isValidCanNoti = GameSys.Instance.listParkingCarSys.GetListNParkingCarByState(STATE_PARKING_CAR.EMPTY).length == 1
        if (!isValidCanNoti) { return; }
        // show noti
        this.ShowNoti(TYPE_NOTI.ONLY_ONE_PARKING);
    }

    private TryShowNotiNoPlaceParking() {
        this.ShowNoti(TYPE_NOTI.NO_PLACE_PARKING);
    }

    private TryShowNotiEndTime() {
        this.ShowNoti(TYPE_NOTI.END_TIME);
    }
    //#endregion Event Handlers
    //=================================================================
}


