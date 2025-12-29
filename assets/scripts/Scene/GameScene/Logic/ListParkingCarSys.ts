import { _decorator, Component, instantiate, Layout, Node, Prefab, Vec3 } from 'cc';
import { ParkingCarSys } from './ParkingCarSys';
import { ROAD, STATE_PARKING_CAR, TYPE_ITEM } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { RoadSys } from './Road/RoadSys';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from 'db://assets/scripts/Utils/Types';
import { GameManager } from '../../GameManager';
import { MConfigs, TYPE_GAME } from '../../../Configs/MConfigs';
import { LEVEL_TUT_IN_GAME } from '../../OtherUI/UITutorialInGame/TypeTutorialInGame';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { ParkingCarSignageSys } from './ParkingCarSignageSys';
import { CarSys } from './CarSys';
const { ccclass, property } = _decorator;

@ccclass('ListParkingCarSys')
export class ListParkingCarSys extends Component {
    @property(Prefab) parkingCarPrefab: Prefab;
    @property(Node) nParentParkingCar: Node;
    @property(Node) nParentTempCar: Node;
    @property(RoadSys) roadSysMoveToParking: RoadSys;
    @property(ParkingCarSignageSys) parkingCarSignageSys: ParkingCarSignageSys;

    private listNParkingCar: Node[] = [];
    private _mapNCarParking: Map<number, Node> = new Map();
    private _listNCarParking: Node[] = [];
    private _cacheStatusParking: STATE_PARKING_CAR[] = [];


    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.UPDATE_VISUAL_ALL_VIP_PARKING, this.UpdateVisualAllVipParking, this);
        clientEvent.on(MConst.EVENT_ITEM_IN_GAME.USE_VIP_SLOT, this.ShowAllVipSlot, this);
        clientEvent.on(MConst.EVENT_PARKING.UNLOCK_1_NORMAL_PARKING, this.Unlock1NormalParking, this);
        clientEvent.on(MConst.EVENT_PARKING.ADD_CAR_TO_LIST_PARKING, this.AddCarToListParking, this);
        clientEvent.on(MConst.EVENT_PARKING.REMOVE_CAR_OUT_LIST_PARKING, this.RemoveCarOutListParking, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.UPDATE_VISUAL_ALL_VIP_PARKING, this.UpdateVisualAllVipParking, this);
        clientEvent.off(MConst.EVENT_ITEM_IN_GAME.USE_VIP_SLOT, this.ShowAllVipSlot, this);
        clientEvent.off(MConst.EVENT_PARKING.UNLOCK_1_NORMAL_PARKING, this.Unlock1NormalParking, this);
        clientEvent.off(MConst.EVENT_PARKING.ADD_CAR_TO_LIST_PARKING, this.AddCarToListParking, this);
        clientEvent.off(MConst.EVENT_PARKING.REMOVE_CAR_OUT_LIST_PARKING, this.RemoveCarOutListParking, this);
    }

    public async SetUp(numParkingCarUnlock: number, wPosGate: Vec3) {
        let nParkingVipTemp: Node = null

        for (let i = MConst.DEFAULT_NUM_PARKING_CAR - 1; i >= 0; i--) {
            // first parking car is vip
            // numParkingCar next parking car is normal
            // other is lock parking car
            let nParkingCar = this.GetNParkingCar();
            nParkingCar.active = true;
            nParkingCar.setParent(this.nParentParkingCar);
            this.listNParkingCar.unshift(nParkingCar);
            let stateParkingCar: STATE_PARKING_CAR;
            if (i == 0) {
                stateParkingCar = STATE_PARKING_CAR.LOCK_VIP;
                nParkingVipTemp = nParkingCar;
                if (GameManager.Instance != null) {
                    if (GameManager.Instance.TypeGamePlay == TYPE_GAME.TUTORIAL
                        || (GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL && GameManager.Instance.levelPlayerNow < LEVEL_TUT_IN_GAME.VIP_SLOT)
                        // || (GameManager.Instance.TypeGamePlay == TYPE_GAME.TOURNAMENT && GameManager.Instance.levelPlayerNow < LEVEL_TUT_IN_GAME.VIP_SLOT)
                        // || (GameManager.Instance.TypeGamePlay == TYPE_GAME.WITH_FRIEND && GameManager.Instance.levelPlayerNow < LEVEL_TUT_IN_GAME.VIP_SLOT)
                    ) {
                        nParkingVipTemp.active = false;
                    }
                }
            } else if (i <= numParkingCarUnlock) {
                const cacheStatus = this.GetCache(i);
                stateParkingCar = cacheStatus == null ? STATE_PARKING_CAR.EMPTY : cacheStatus;
            } else {
                const cacheStatus = this.GetCache(i);
                stateParkingCar = cacheStatus == null ? STATE_PARKING_CAR.LOCK_NORMAL : cacheStatus;
            }
            nParkingCar.getComponent(ParkingCarSys).Init(stateParkingCar, i, wPosGate, this.GetWPosParkingCarUnlock.bind(this));

            this._mapNCarParking.set(i, null);
        }

        // update data
        (async () => {
            if (this == null || this.nParentParkingCar == null) return;
            this.nParentParkingCar.getComponent(Layout).updateLayout();

            for (let i = 0; i < this.listNParkingCar.length; i++) {
                const nParkingCar = this.listNParkingCar[i];
                const parkingCarCom = nParkingCar.getComponent(ParkingCarSys);
                // init signage
                if (parkingCarCom.GetState() == STATE_PARKING_CAR.LOCK_NORMAL) {
                    const wPosSignage = parkingCarCom.GetWPosSignage();
                    this.parkingCarSignageSys.InitParkingAndSignage(i, wPosSignage);
                }
            }

            // init the vipParking => because the nParking is right place in here
            const wPosVipAnim = nParkingVipTemp.getComponent(ParkingCarSys).GetWPosAnimVip();
            clientEvent.dispatchEvent(MConst.EVENT_VIP_PARKING.INIT, wPosVipAnim);
            for (let i = 0; i < this.listNParkingCar.length; i++) {
                const nParkingCar = this.listNParkingCar[i];
                const parkingCarCom = nParkingCar.getComponent(ParkingCarSys);
                // move to the parking
                const wPosPrepareMoveToParking: Vec3 = new Vec3(nParkingCar.worldPosition.x, this.roadSysMoveToParking.node.worldPosition.y, 0);
                parkingCarCom.SetUpWPosSpeWithoutResetData(wPosPrepareMoveToParking, wPosPrepareMoveToParking);


            }
        })();
    }

    public UpdateStateParkingCar(indexParkingCar: number, state: STATE_PARKING_CAR) {
        this.listNParkingCar[indexParkingCar].getComponent(ParkingCarSys).ChangeState(state);
    }

    public GetIndexParkingCarCanPlace(): number {
        return this.listNParkingCar.findIndex(item => item.getComponent(ParkingCarSys).GetState() == STATE_PARKING_CAR.EMPTY);
    }

    public GetStateLogic(indexParkingCar: number): STATE_PARKING_CAR {
        if (this.listNParkingCar[indexParkingCar] == null) { return null; }
        return this.listNParkingCar[indexParkingCar].getComponent(ParkingCarSys).GetState();
    }

    public GetStateAnim(indexParkingCar: number): STATE_PARKING_CAR {
        if (this.listNParkingCar[indexParkingCar] == null) { return null; }
        return this.listNParkingCar[indexParkingCar].getComponent(ParkingCarSys).GetState();
    }

    public GetNParkingCarByStateParking(state: STATE_PARKING_CAR): Node {
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            if (this.listNParkingCar[i].getComponent(ParkingCarSys).GetState() == state) {
                return this.listNParkingCar[i];
            }
        }
        return null;
    }

    public GetListNParkingCarByState(state: STATE_PARKING_CAR): Node[] {
        let result: Node[] = [];
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            if (this.listNParkingCar[i].getComponent(ParkingCarSys).GetState() == state) {
                result.push(this.listNParkingCar[i]);
            }
        }
        return result;
    }

    public GetListNParkingCarByListState(listState: STATE_PARKING_CAR[]): Map<STATE_PARKING_CAR, Node[]> {
        // init
        let result = new Map<STATE_PARKING_CAR, Node[]>();
        listState.forEach(state => {
            result.set(state, []);
        })

        // loop to get data
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            const stateCheck = this.listNParkingCar[i].getComponent(ParkingCarSys).GetState();
            if (result.has(stateCheck)) {
                result.get(stateCheck).push(this.listNParkingCar[i]);
            }
        }

        return result;
    }

    public GetNParkingCarById(idParkingCar: number): Node {
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            if (this.listNParkingCar[i].getComponent(ParkingCarSys).idParkingCar == idParkingCar) {
                return this.listNParkingCar[i];
            }
        }
        return null;
    }

    public GetNParkingCarVipSlot(): Node {
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            if (this.listNParkingCar[i].getComponent(ParkingCarSys).GetState() == STATE_PARKING_CAR.LOCK_VIP) {
                return this.listNParkingCar[i];
            }
        }
        return null;
    }

    public GetListIdParkingCarByState(state: STATE_PARKING_CAR): number[] {
        let listIdParkingCar: number[] = [];
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            if (this.listNParkingCar[i].getComponent(ParkingCarSys).GetState() == state) {
                listIdParkingCar.push(this.listNParkingCar[i].getComponent(ParkingCarSys).idParkingCar);
            }
        }
        return listIdParkingCar;
    }

    public GetListNCarParking(): Node[] {
        return Array.from(this._listNCarParking);
        // return Array.from(this._mapNCarParking.values()) as Node[];
    }

    public GetListNCarParkingCanSort(): Node[] {
        return Array.from(this._listNCarParking.filter(car => car.getComponent(CarSys).CanSort()))
    }

    public ResetData(onlyResetInfor: boolean = false) {
        if (!onlyResetInfor) {
            this.listNParkingCar.forEach(item => {
                item.getComponent(ParkingCarSys).ResetData();
                this.ReUseParkingCar(item);
            })
        }
        this.listNParkingCar = [];
        this._mapNCarParking.clear();
        this._listNCarParking = [];

        // emit to close the vipParking car
        clientEvent.dispatchEvent(MConst.EVENT_VIP_PARKING.CLOSE);
    }

    //==================================
    //#region cache
    public SaveCache() {
        this.ClearCache();
        this.listNParkingCar.forEach(item => {
            this._cacheStatusParking.push(item.getComponent(ParkingCarSys).GetState())
        })
    }

    public ClearCache() {
        this._cacheStatusParking = [];
    }

    private GetCache(index: number): STATE_PARKING_CAR {
        if (this._cacheStatusParking == null) { return null; }
        return this._cacheStatusParking[index];
    }
    //#endregion cache
    //==================================

    //==================================
    //#region REUSE FUNC
    public GetNParkingCar(): Node {
        if (this.nParentTempCar.children.length > 0) {
            return this.nParentTempCar.children[0];
        } else {
            return instantiate(this.parkingCarPrefab);
        }
    }

    public ReUseParkingCar(nReUse: Node) {
        nReUse.active = false;
        nReUse.setParent(this.nParentTempCar);
    }
    //#endregion REUSE FUNC
    //==================================

    //==================================
    //#region listen func

    /**
     * this func will be call when a car move out of parking vip     -done                     
     * and when after using done item vip                            -done
     * but it can not be call when using item vip
    */
    private UpdateVisualAllVipParking() {
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            this.listNParkingCar[i].getComponent(ParkingCarSys).TryUpdateVisualForVipLock();
        }
    }

    private ShowAllVipSlot() {
        for (let i = 0; i < this.listNParkingCar.length; i++) {
            // this.listNParkingCar[i].getComponent(ParkingCarSys).ShowVisualLockVip();
        }
    }

    private Unlock1NormalParking() {
        let nParkingCarLockNormal = this.GetNParkingCarByStateParking(STATE_PARKING_CAR.LOCK_NORMAL);
        if (nParkingCarLockNormal != null) {
            SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.UNLOCK_SLOT_CAR);
            nParkingCarLockNormal.getComponent(ParkingCarSys).ChangeState(STATE_PARKING_CAR.EMPTY);
        }
    }

    public GetWPosParkingCarUnlock(): Vec3 {
        let nParkingCarLockNormal = this.GetNParkingCarByStateParking(STATE_PARKING_CAR.LOCK_NORMAL);
        if (nParkingCarLockNormal != null) {
            return nParkingCarLockNormal.worldPosition.clone();
        }
        return null;
    }

    private AddCarToListParking(idParkingCar: number, nCar: Node) {
        this._mapNCarParking.set(idParkingCar, nCar);
        this._listNCarParking.push(nCar);
    }

    private RemoveCarOutListParking(idParking: number) {
        const carPark: Node = this._mapNCarParking.get(idParking);

        this._mapNCarParking.set(idParking, null);

        if (this.listNParkingCar[idParking].getComponent(ParkingCarSys).GetState() == STATE_PARKING_CAR.LOCK_VIP) {
            clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.READY_USE_NEXT_VIP_SLOT);
        }

        let indexInList = this._listNCarParking.findIndex(item => item == carPark);
        if (indexInList >= 0)
            this._listNCarParking.splice(indexInList, 1);
    }
    //#endregion listen func
    //==================================
}



