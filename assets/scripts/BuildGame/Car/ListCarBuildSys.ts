import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { COLOR_KEY_LOCK, DIRECT_CAR, JsonCar } from '../../Utils/Types';
import { BuildCar } from './BuildCar';
import { ListEntitiesBaseSys } from '../Utils/ListEntitiesBaseSys';
import { clientEvent } from '../../framework/clientEvent';
import { MConstBuildGame } from '../MConstBuildGame';
const { ccclass, property } = _decorator;

@ccclass('ListCarBuildSys')
export class ListCarBuildSys extends ListEntitiesBaseSys {
    @property(Node) nMapCar: Node;
    public mapCarBuild: Node[] = [];
    private _cbGetListCarGarage: CallableFunction;
    private _cbGetListCarConveyorBelt: CallableFunction;
    private _cbChangeIdCarBelt: CallableFunction;
    private _cbChangeIdCarGarage: CallableFunction;

    private readonly DEFAULT_JSON_CAR: JsonCar = {
        idCar: 1,
        carColor: 1,
        carSize: 1,
        carPosition: Vec3.ZERO,
        carDirection: DIRECT_CAR.TOP,
        isMysteryCar: false
    }

    //=========================================================
    //#region self
    public Reset() {
        this.ResetAutoIdEntities();
        this.ReUseAllEntities(this.GetInfoToExport());
        this.mapCarBuild = [];
    }

    public RegisterCb(cbGetListCarGarage: CallableFunction, cbGetListCarConveyorBelt: CallableFunction,
        cbChangeIdCarBelt: CallableFunction, cbChangeIdCarGarage: CallableFunction) {
        this._cbGetListCarGarage = cbGetListCarGarage;
        this._cbGetListCarConveyorBelt = cbGetListCarConveyorBelt;
        this._cbChangeIdCarBelt = cbChangeIdCarBelt
        this._cbChangeIdCarGarage = cbChangeIdCarGarage;
    }

    protected onEnable(): void {
        super.onEnable();

        clientEvent.on(MConstBuildGame.EVENT_BUILDING.UPDATE_ID_CAR_LOCK, this.SetIdKeyLockForCar, this);
        clientEvent.on(MConstBuildGame.EVENT_BUILDING.REMOVE_ID_CAR_LOCK, this.RemoveIdKeyLockForCar, this);
        clientEvent.on(MConstBuildGame.EVENT_BUILDING.REMOVE_ID_CAR_KEY, this.RemoveIdLockForCar, this);
        clientEvent.on(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_ARROW_CAR_HAS_LOCK, this.NotificationArrowLock, this);
        clientEvent.on(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_ARROW_CAR_HAS_KEY, this.NotificationArrowKey, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.UPDATE_ID_CAR_LOCK, this.SetIdKeyLockForCar, this);
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.REMOVE_ID_CAR_LOCK, this.RemoveIdKeyLockForCar, this);
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.REMOVE_ID_CAR_KEY, this.RemoveIdLockForCar, this);
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_ARROW_CAR_HAS_LOCK, this.NotificationArrowLock, this);
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_ARROW_CAR_HAS_KEY, this.NotificationArrowKey, this);
    }
    //#endregion self
    //=========================================================

    //=========================================================
    //#region listen
    private SetIdKeyLockForCar(idCarHasKey: number, idCarHasLock: number, colorCarKeyLock: COLOR_KEY_LOCK) {
        // find car by id
        const carNeedSet = this.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCarHasKey);
        if (carNeedSet == null) {
            console.error("not Found id car for set id key lock", idCarHasKey);
            return;
        } else {
            carNeedSet.getComponent(BuildCar).SetColorKeyLock(colorCarKeyLock, false);
            carNeedSet.getComponent(BuildCar).SetIdCarLock(idCarHasLock);
        }
    }

    private RemoveIdKeyLockForCar(idCarHasKey: number) {
        // find car by id
        const carNeedSet = this.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCarHasKey);
        if (carNeedSet == null) {
            console.error("not Found id car for remove key RemoveIdKeyLockForCar", idCarHasKey);
            return;
        } else {
            carNeedSet.getComponent(BuildCar).SetIdCarLock(-1);
            carNeedSet.getComponent(BuildCar).UpdateUICar();
        }
    }

    private RemoveIdLockForCar(idCarHasLock: number) {
        // find car by id
        const carNeedSet = this.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCarHasLock);
        if (carNeedSet == null) {
            console.error("not Found id car for remove lock RemoveIdLockForCar", idCarHasLock);
            return;
        } else {
            carNeedSet.getComponent(BuildCar).SetIdCarKey(-1);
            carNeedSet.getComponent(BuildCar).UpdateUICar();
        }
    }

    private NotificationArrowLock(idCarLock: number) {
        // find car by id
        const carNeedNoti = this.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCarLock);
        if (carNeedNoti == null) {
            console.error("not Found id car for noti NotificationArrowLock", idCarLock);
            return;
        } else {
            carNeedNoti.getComponent(BuildCar).visualArrowCar.AnimNotiArrow();
        }
    }

    private NotificationArrowKey(idCarKey: number) {
        // find car by id
        const carNeedNoti = this.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCarKey);
        if (carNeedNoti == null) {
            console.error("not Found id car for noti NotificationArrowLock", idCarKey);
            return;
        } else {
            carNeedNoti.getComponent(BuildCar).visualArrowCar.AnimNotiArrow();
        }
    }
    //#endregion listen
    //=========================================================

    public GetCarBuildById(idCar: number): Node {
        return this.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCar);
    }

    public ReSiblingIndexCar() {
        this.nMapCar.children.sort((a, b) => {
            const aPos = a.worldPosition;
            const bPos = b.worldPosition;

            // Sắp xếp theo trục y trước (TopLeft là y lớn hơn), sau đó theo trục x (x nhỏ hơn sẽ ở trước)
            if (aPos.y !== bPos.y) {
                return bPos.y - aPos.y;  // y lớn hơn sẽ được xếp trước
            } else {
                return aPos.x - bPos.x;  // x nhỏ hơn sẽ được xếp trước
            }
        });

        let listIdCar: number[] = this.nMapCar.children.map(nCar => nCar.getComponent(BuildCar) == null ? -1 : nCar.getComponent(BuildCar).IDCar);
        Array.from(this.nMapCar.children).forEach((nCar, index) => {
            if (nCar.getComponent(BuildCar) == null) return;
            const newSiblingIndex: number = listIdCar.indexOf(nCar.getComponent(BuildCar).IDCar);
            nCar.setSiblingIndex(newSiblingIndex);
            // console.log(nCar.name, newSiblingIndex);
        })
    }

    //#region func ObjectPool
    public InitCarBuild(jsonCar: JsonCar = null): Node {
        let nCar: Node = this.GetEntity();
        nCar.setParent(this.nMapCar);
        nCar.setPosition(Vec3.ZERO);
        nCar.active = true;
        let idCarNew = 0;
        if (jsonCar != null && jsonCar.idCar != null) {
            idCarNew = jsonCar.idCar;
        } else {
            idCarNew = this.GetAutoIdEntities();
        }
        this.mapCarBuild.unshift(nCar);
        nCar.getComponent(BuildCar).SetIdCar(idCarNew);
        nCar.getComponent(BuildCar).SetData(jsonCar, this.nMapCar.worldPosition.clone());

        return nCar;
    }

    public UpdateListCar(typeUpdate: "delete" | "add" | "swap", idCar1: number, idCar2: number = -1): boolean {
        const self = this;

        function GetCarById(idCar: number): { nCar: Node, jsonCarGara: JsonCar, jsonCarBelt: JsonCar } {
            let nCarInGround: Node = self.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCar);
            let jsonCar: JsonCar = null;
            let jsonCarGara: JsonCar = null;
            let jsonCarBelt: JsonCar = null;
            if (nCarInGround == null) {
                jsonCarGara = self._cbGetListCarGarage().find((jsonCheck: JsonCar) => jsonCheck.idCar == idCar);
                if (jsonCarGara == null) {
                    jsonCarBelt = self._cbGetListCarConveyorBelt().find((jsonCheck: JsonCar) => jsonCheck.idCar == idCar);
                }
            }

            return { nCar: nCarInGround, jsonCarGara: jsonCar, jsonCarBelt: jsonCarBelt };
        }

        let idCarKey = -1;
        let idCarLock = -1;
        try {
            // update
            switch (typeUpdate) {
                case "delete":
                    // remove id car
                    const nCarRemove = this.mapCarBuild.find(nCar => nCar.getComponent(BuildCar).IDCar == idCar1);
                    idCarKey = nCarRemove.getComponent(BuildCar).idCarKeyOfCarLock;
                    idCarLock = nCarRemove.getComponent(BuildCar).idCarLockOfCarKey;
                    if (idCarKey > 0) { this.RemoveIdKeyLockForCar(idCarKey); }
                    if (idCarLock > 0) { this.RemoveIdLockForCar(idCarLock); }
                    if (nCarRemove == null) { return false; }
                    this.ReUseEntiny(nCarRemove);
                    this.mapCarBuild.splice(this.mapCarBuild.indexOf(nCarRemove), 1);
                    break;
                case "add":
                    break;
                case "swap":
                    // swap 2 
                    const dataCarId1 = GetCarById(idCar1);
                    const dataCarId2 = GetCarById(idCar2);
                    if (dataCarId1 == null || dataCarId2 == null) { return false; }
                    // ====== change id car 1
                    if (dataCarId1.jsonCarBelt != null || dataCarId1.nCar != null || dataCarId1.jsonCarGara != null) {
                        switch (true) {
                            case dataCarId1.nCar != null:
                                dataCarId1.nCar.getComponent(BuildCar).SetIdCar(idCar2);
                                break;
                            case dataCarId1.jsonCarGara != null:
                                this._cbChangeIdCarGarage(idCar1, idCar2);
                                break;
                            case dataCarId1.jsonCarBelt != null:
                                this._cbChangeIdCarBelt(idCar1, idCar2);
                                break;
                        }
                    }

                    // ====== change id car 2
                    if (dataCarId2.jsonCarBelt != null || dataCarId2.nCar != null || dataCarId2.jsonCarGara != null) {
                        switch (true) {
                            case dataCarId2.nCar != null:
                                dataCarId2.nCar.getComponent(BuildCar).SetIdCar(idCar1);
                                break;
                            case dataCarId2.jsonCarGara != null:
                                this._cbChangeIdCarGarage(idCar2, idCar1);
                                break;
                            case dataCarId2.jsonCarBelt != null:
                                this._cbChangeIdCarBelt(idCar2, idCar1);
                                break;
                        }
                    }

                    // đê logic sẽ tiếp tục sửa id của những đối tượng tiếp theo
                    if ((dataCarId1.jsonCarBelt == null && dataCarId1.nCar == null && dataCarId1.jsonCarGara == null)
                        || (dataCarId2.jsonCarBelt == null && dataCarId2.nCar == null && dataCarId2.jsonCarGara == null)) {
                        return false;
                    }
                    break;
                default:
                    return false;
            }
        } catch (e) {
            return false;
        }

        return true;
    }
    //#endregion func ObjectPool

    public GetInfoToExport(): Node[] {
        const listNCarExport = Array.from(this.mapCarBuild.entries())
            .filter(element => element != null)
            .sort(([aId], [bId]) => aId - bId)
            .map(([_, node]) => node as Node);
        return listNCarExport
    }
}


