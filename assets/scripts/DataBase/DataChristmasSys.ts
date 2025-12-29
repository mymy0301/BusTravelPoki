/**
 * 
 * anhngoxitin01
 * Wed Nov 05 2025 10:23:06 GMT+0700 (Indochina Time)
 * DataChristmasSys
 * db://assets/scripts/DataBase/DataChristmasSys.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { EnumReasonEndPack, InfoPack, InfoPackChristmasAFO } from '../Utils/Types';
import { PlayerData } from '../Utils/PlayerData';
import { Utils } from '../Utils/Utils';
import { ReadDataJson } from '../ReadDataJson';
import { DataInfoPlayer } from '../Scene/DataInfoPlayer';
import { DataPackSys } from './DataPackSys';
import { DataHalloweenSys } from './DataHalloweenSys';
import { clientEvent } from '../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../Const/MConst';
import { MConfigs } from '../Configs/MConfigs';
import { MCONFIG_CHRISTMAS_EVENT } from '../Scene/OtherUI/UIChristmasEvent/TypeChristmasEvent';
const { ccclass, property } = _decorator;

const TIME_LONG_ACTIVE = 60 * 60 * 24 * 30;
const TIME_LONG_RE_INIT = 60 * 60 * 24;
enum ESTATE_PACK_CHRISTMAS {
    NONE,
    ACTIVE,
    WAITING_RE_INIT
}

@ccclass('DataChristmasSys')
export class DataChristmasSys {
    public static Instance: DataChristmasSys = null;
    private _infoPackWoring: any = null;
    private _state: ESTATE_PACK_CHRISTMAS = ESTATE_PACK_CHRISTMAS.NONE; public get IsActive() { return this._state == ESTATE_PACK_CHRISTMAS.ACTIVE; }
    public get InfoPackChristmasWorking() {
        if (!PlayerData.Instance._xmax_isActive) {
            return null;
        }
        return this._infoPackWoring;
    }
    constructor() {
        if (DataChristmasSys.Instance == null) {
            DataChristmasSys.Instance = this;
        }
    }

    //=====================================================
    //#region state
    private ChangeState(newState: ESTATE_PACK_CHRISTMAS) {
        const oldState = this._state;

        this._state = newState;

        // hủy đăng ký thời gian của cả active và reInit => chấp nhận đăng ký lại vì không thay đổi quá nhiều ở đây


        switch (this._state) {
            case ESTATE_PACK_CHRISTMAS.NONE:
                this.UnRegisterTimePack();
                this.UnRegisterTimeReInit();
                this._infoPackWoring = null;
                break;
            case ESTATE_PACK_CHRISTMAS.ACTIVE:
                // genPack và đăng ký thời gian của pack
                this.TryGenPack(PlayerData.Instance._xmax_indexPack);
                this.RegisterTimePack();
                this.RegisterTimeReInit();
                break;
            case ESTATE_PACK_CHRISTMAS.WAITING_RE_INIT:
                this.RegisterTimePack();
                break;
        }
    }

    /**
     * This func call from load
     */
    public UpdateStateFromLoad() {
        this.ChangeState(this._state);
    }
    //#endregion state
    //=====================================================

    //#region private ========================================================
    private UpdateTimeDataReInit() {
        PlayerData.Instance._xmax_isActive = false;
    }

    private UpdateTimeEndEvent() {
        PlayerData.Instance._xmax_isActive = false;
    }
    //#endregion private =====================================================

    /**
    * Func này sẽ được gọi trong onLoad và gọi sau khi đã có bộ dữ liệu người dùng
    * Func này cũng sẽ được gọi trong ChangeScene từ game ra home
    */
    private _wasLoad: boolean = false;
    public LoadPackFirstTime(needSaveData: boolean = false) {
        // chỉ trigger code để init pack mới khi và chỉ khi levelPlayer vượt qua mốc levelTut
        if (PlayerData.Instance._levelPlayer < MConfigs.LEVEL_TUTORIAL_EVENT.Pack_christmasEvent) {
            this.ChangeState(ESTATE_PACK_CHRISTMAS.NONE);
            return;
        }

        const indexPackNow = PlayerData.Instance._xmax_indexPack
        const timeRemainEndPack = PlayerData.Instance._xmax_timeRemainPack - Utils.getCurrTime();
        const timeRemainReInit = PlayerData.Instance._xmax_timeReInitPack - Utils.getCurrTime();
        const canNotReinitPack = (indexPackNow == 12 || indexPackNow == 13) &&
            (!PlayerData.Instance._xmax_isActive || timeRemainReInit < 0);

        // check có thể trigger reInit lại không
        if (this._wasLoad) {
            // console.log("check state: ", this._state);
            return;
        }
        this._wasLoad = true;


        switch (true) {
            case PlayerData.Instance._xmax_indexPack < 0 || !this.ValidInitPackNow():
                this._state = ESTATE_PACK_CHRISTMAS.NONE;
                break;
            // case tạo pack lần đầu
            case PlayerData.Instance._xmax_timeRemainPack == 0:
                const totalIAPWhenInit = this.GetTotalIAP();
                const yearInit = this.GetYearInitEventNow()
                PlayerData.Instance._xmax_timeRemainPack = Utils.getTimeByData(1, MCONFIG_CHRISTMAS_EVENT.DATE_VALID_END_EVENT_MONTH, yearInit);
                PlayerData.Instance._xmax_timeReInitPack = Utils.getCurrTime() + TIME_LONG_RE_INIT;
                PlayerData.Instance._xmax_isActive = true;
                PlayerData.Instance._xmax_year_init = yearInit;
                // kiểm tra theo luồng IAP nào thì ta sẽ set indexPack bắt đầu từ luồng đó
                if (PlayerData.Instance._xmax_typeLogicPack == -1) {
                    if (totalIAPWhenInit < 5) {
                        PlayerData.Instance._xmax_typeLogicPack = 0;
                    } else {
                        PlayerData.Instance._xmax_typeLogicPack = 1;
                        PlayerData.Instance._xmax_indexPack = 6;
                    }
                }
                // gen pack
                this.TryGenPack(PlayerData.Instance._xmax_indexPack);
                // cập nhật trạng thái của pack
                this._state = ESTATE_PACK_CHRISTMAS.ACTIVE;
                break;
            // case pack đã được tạo + đã mua + có thể reInit
            case timeRemainEndPack > 0 && !canNotReinitPack && !PlayerData.Instance._xmax_isActive && timeRemainReInit <= 0:
                PlayerData.Instance._xmax_timeReInitPack = Utils.getCurrTime() + TIME_LONG_RE_INIT;
                this.TryReInitPack(false, 'bought');
                if (PlayerData.Instance._xmax_indexPack < 0) { this._state = ESTATE_PACK_CHRISTMAS.NONE; }
                else { this._state = ESTATE_PACK_CHRISTMAS.ACTIVE; MCONFIG_CHRISTMAS_EVENT.IS_SHOW_FIRST_TIME = true; }
                break;
            // case pack đã được tạo + ko mua + có thể reInit
            case timeRemainEndPack > 0 && !canNotReinitPack && PlayerData.Instance._xmax_isActive && timeRemainReInit <= 0:
                PlayerData.Instance._xmax_timeReInitPack = Utils.getCurrTime() + TIME_LONG_RE_INIT;
                this.TryReInitPack(false, 'EndTime');
                if (PlayerData.Instance._xmax_indexPack < 0) { this._state = ESTATE_PACK_CHRISTMAS.NONE; }
                else { this._state = ESTATE_PACK_CHRISTMAS.ACTIVE; MCONFIG_CHRISTMAS_EVENT.IS_SHOW_FIRST_TIME = true; }
                break;
            // case pack đã được tạo + đã mua + chưa đến lúc reInit
            case timeRemainEndPack > 0 && !canNotReinitPack && !PlayerData.Instance._xmax_isActive && timeRemainReInit > 0:
                this.RegisterTimeReInit();
                this._state = ESTATE_PACK_CHRISTMAS.WAITING_RE_INIT;
                break;
            // case pack đã được tạo + chưa mua + chưa đén lúc reInit
            case timeRemainEndPack > 0 && !canNotReinitPack && timeRemainReInit > 0 && PlayerData.Instance._xmax_isActive:
                this.TryGenPack(PlayerData.Instance._xmax_indexPack);
                this._state = ESTATE_PACK_CHRISTMAS.ACTIVE;
                break;
        }

        // check trigger save christmas data
        if (needSaveData) {
            PlayerData.Instance.SaveEvent_Christmas();
        }
    }

    public TryGenPack(indexPack: number) {
        if (!PlayerData.Instance._xmax_isActive) { return; }
        const listPackNormal = ReadDataJson.Instance.GetDataPacksChristmas();
        const listPackAFO = ReadDataJson.Instance.GetDataPacksChristmasAFO();
        let dataPack = null;
        if (indexPack >= 0 && indexPack < listPackNormal.length) {
            dataPack = listPackNormal[indexPack];
            this._infoPackWoring = new InfoPack();
            this._infoPackWoring.readDataFromJson_WhenInit(dataPack);
        } else if (indexPack == 12 || indexPack == 13) {
            dataPack = listPackAFO[PlayerData.Instance._xmax_typeLogicPack];
            this._infoPackWoring = dataPack;
        }
    }

    public TryReInitPack(needSaveData: boolean = true, reason: 'bought' | 'EndTime') {
        // hiện tại bởi vì các pack của hai luồng là bằng nhau nên ta mới làm theo công thức toán học được
        // còn lại nếu sau này thay đổi logic luồng pack thì ta phải chỉnh switch case đoạn này
        const indexRight = PlayerData.Instance._xmax_indexPack % 6;
        const type = PlayerData.Instance._xmax_typeLogicPack;
        const newIndexPack = logicIncreaseIndexPack(indexRight, type, reason);
        PlayerData.Instance._xmax_indexPack = newIndexPack;
        if (newIndexPack < 0) { return; }
        PlayerData.Instance._xmax_isActive = true;
        if (newIndexPack != 12 && newIndexPack != 13) {
            PlayerData.Instance._xmax_indexPack = PlayerData.Instance._xmax_typeLogicPack == 0 ? newIndexPack : 6 + newIndexPack;
        } else {
            PlayerData.Instance._xmax_indexPack = newIndexPack;
        }

        // === gen pack ===
        this.TryGenPack(PlayerData.Instance._xmax_indexPack);

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_Christmas();
        }
    }

    public BuyPackSuccess(needSaveData: boolean = true) {
        // noti remove pack
        const idPackNow = this.InfoPackChristmasWorking.namePack;
        clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.Force, idPackNow);

        this._infoPackWoring = null;
        PlayerData.Instance._xmax_isActive = false;

        // === kiểm tra valid hay không ===
        // chỉnh thời gian
        this.UnRegisterTimePack();
        this.UnRegisterTimeReInit();
        const indexPackNow = this.GetIndexPackNow()
        if (indexPackNow == 12 || indexPackNow == 13) {
            this.UpdateTimeEndEvent();
            this.ChangeState(ESTATE_PACK_CHRISTMAS.NONE);
        } else {
            this.ChangeState(ESTATE_PACK_CHRISTMAS.WAITING_RE_INIT);
            this.UpdateTimeDataReInit();
            this.RegisterTimeReInit();
        }

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_Christmas(needSaveData);
        }
    }

    public GetIndexPackNow() { return PlayerData.Instance._xmax_indexPack; }
    public GetTimeEnd() { return PlayerData.Instance._xmax_timeRemainPack; }
    public GetTimeCanReInitPack() { return PlayerData.Instance._xmax_timeReInitPack; }
    public GetTimeRemain() {
        if (!PlayerData.Instance._xmax_isActive) { return -1; }
        return this.GetTimeEnd() - Utils.getCurrTime();
    }
    public GetTimeRemainReInit(): number {
        if (!PlayerData.Instance._xmax_isActive) { return -1; }
        return this.GetTimeCanReInitPack() - Utils.getCurrTime();
    }

    private GetTotalIAP(): number {
        let totalIAPExpend = DataInfoPlayer.Instance.TotalSpendingMoneyOfUser();
        if (totalIAPExpend == 0) {
            // vì chúng ta chưa cache dữ liệu IAP mua ở đâu do đó chúng ta sẽ kiểm tra các gói pack đã mua trong dữ liệu xem có không? nếu không thì không tính
            totalIAPExpend = DataPackSys.Instance.TotalSpendingMoneyOfUser();

            // chúng ta cũng sẽ kiểm tra cả các gói pack của hlw theo id
            totalIAPExpend += DataHalloweenSys.Instance.TotalPriceSpendingMoney();

            //NOTE tại sao ở đây ko tính cả của christmas vì với bản christmas auto đã bổ sung thêm chức năng cache IAP lại nên ta sẽ ko cần kiểm tra đối với bộ dữ liệu của christmas
        }

        return totalIAPExpend;
    }

    public IsValidToShowOnShop(idPack: string): boolean {
        return idPack != 'xmash_choose_one_1' && idPack != 'xmash_choose_one_2';
    }

    public InitNewLoopForce(needSaveData: boolean) {
        PlayerData.Instance._xmax_typeLogicPack = -1;
        PlayerData.Instance._xmax_timeRemainPack = 0;
        PlayerData.Instance._xmax_timeReInitPack = 0;
        PlayerData.Instance._xmax_indexPack = 0;
        PlayerData.Instance._xmax_isActive = true;
        PlayerData.Instance._xmax_year_init = this.GetYearInitEventNow();

        if (needSaveData) {
            PlayerData.Instance.SaveEvent_Christmas();
        }
    }
    //============================================================
    //#region time
    private RegisterTimePack() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.IncreaseTimeRemainPack, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.IncreaseTimeRemainPack, this);
        }
    }

    private UnRegisterTimePack() { clientEvent.off(EVENT_CLOCK_ON_TICK, this.IncreaseTimeRemainPack, this); }

    private IncreaseTimeRemainPack() {
        // check is end time of event
        const isEndTimeEventLoop = PlayerData.Instance._xmax_timeRemainPack - Utils.getCurrTime() < 0;
        if (isEndTimeEventLoop) {
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.IncreaseTimeRemainPack, this);
            PlayerData.Instance._xmax_isActive = false;
            this._infoPackWoring = null;

            this.UnRegisterTimePack();
            this.UnRegisterTimeReInit();
            this.UpdateTimeEndEvent();
            this.ChangeState(ESTATE_PACK_CHRISTMAS.NONE);
            PlayerData.Instance.SaveEvent_Christmas();
        }
    }

    private RegisterTimeReInit() {
        if (!clientEvent.isOnEvent(EVENT_CLOCK_ON_TICK, this.IncreaseTimeReInit, this)) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.IncreaseTimeReInit, this);
        }
    }

    private UnRegisterTimeReInit() { clientEvent.off(EVENT_CLOCK_ON_TICK, this.IncreaseTimeReInit, this); }

    private lastTimeReInitPack: number = 0;
    private IncreaseTimeReInit() {
        // check is end time of event
        const timeNow = Utils.getCurrTime();
        const isEndTimeReEvent = (PlayerData.Instance._xmax_timeReInitPack - timeNow) < 0;
        if (isEndTimeReEvent) {
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.IncreaseTimeReInit, this);
            // đoạn code return này được dùng để force ko reInit lại nếu như hàm này đưuọc gọi lại dưới 2s
            // lý do cho đoạn code này là vì hiện ko bt lý do tại sao hàm này có thể trigger đưuọc như thế => đoạn code dưới là force fix chứ không phải fix bug root
            if (this.lastTimeReInitPack > 0 && this.lastTimeReInitPack < Utils.getCurrTime() - 2) { return; }
            const packRemove = ReadDataJson.Instance.GetDataPacksChristmas()[PlayerData.Instance._xmax_indexPack];
            if (packRemove != null) {
                clientEvent.dispatchEvent(MConst.EVENT_PACK.REMOVE_PACK, EnumReasonEndPack.Force, packRemove.namePack);
            }
            this.lastTimeReInitPack = Utils.getCurrTime();
            this.ChangeState(ESTATE_PACK_CHRISTMAS.WAITING_RE_INIT);

            const indexPackNow = this.GetIndexPackNow();
            if (indexPackNow != 4 && indexPackNow != 2) {
                this._wasLoad = false;
            }
        }
    }

    public GetYearInitEventNow(): number {
        const dateNow = Utils.getDate();
        const monthNow = dateNow.getMonth();
        let yearNow = dateNow.getFullYear();
        if (monthNow == 11) {
            yearNow = yearNow + 1;
        }

        return yearNow;
    }
    //#endregion time
    //============================================================
    public ValidInitPackNow(): boolean {
        const monthNow = Utils.getDate().getMonth();
        return MCONFIG_CHRISTMAS_EVENT.MONTH_VALID_INIT.includes(monthNow);
    }

    public ValidReInitLoopPack(): boolean {
        const yearCache = PlayerData.Instance._xmax_year_init;
        if (!this.ValidInitPackNow()) { return false; }
        if (yearCache == 0) return true;
        if (yearCache < this.GetYearInitEventNow()) { return true; }
        return false;
    }
}

function logicIncreaseIndexPack(indexInput: number, type: number, reason: 'bought' | 'EndTime'): number {
    let indexOutput: number = 0;

    switch (reason) {
        case 'bought':
            if (indexInput == 5) { indexOutput = -1 }
            else if (indexInput == 4 || indexInput == 2) { indexOutput = -1 }
            else if (indexInput < 2) { indexOutput = indexInput + 1; }
            else if (indexInput < 4) { indexOutput = indexInput + 1; }
            else { indexOutput = indexInput; }
            break;
        case 'EndTime':
            if (indexInput == 5) { indexOutput = type == 0 ? 12 : 13 }
            else if (indexInput == 4 || indexInput == 2) { indexOutput = -1 }
            else if (indexInput == 0) { indexOutput = 3; }
            else if (indexInput == 1) { indexOutput = 4; }
            else if (indexInput == 3) { indexOutput = 5; }
            else { indexInput = indexOutput; }
            break;
    }

    return indexOutput;
}