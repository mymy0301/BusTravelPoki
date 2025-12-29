import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { JsonCar, JsonGarage } from '../../Utils/Types';
import { MConstBuildGame } from '../MConstBuildGame';
import { BuildGarage } from './BuildGarage';
import { BuildGameSys } from '../BuildGameSys';
import { ListEntitiesBaseSys } from '../Utils/ListEntitiesBaseSys';
const { ccclass, property } = _decorator;



@ccclass('ListGarageSys')
export class ListGarageSys extends ListEntitiesBaseSys {
    @property(Node) nMapCar: Node;
    public mapGarageBuild: Map<number, Node> = new Map();
    public mapDataCarInGarage: Map<number, JsonCar[]> = new Map();
    private _cbGetIdCarForInit: CallableFunction = null;

    //=========================================================
    //#region self
    public Reset() {
        this.ResetAutoIdEntities();
        this.ReUseAllEntities(this.GetInfoToExport());
        this.mapGarageBuild.clear();
        this.mapDataCarInGarage.clear();
    }
    //#endregion self
    //=========================================================

    //=========================================================
    //#region Id garage
    public GetGarageBuildById(idCar: number): Node {
        return this.mapGarageBuild.get(idCar);
    }

    //#endregion Id garage
    //=========================================================

    private GetNGarage(idGarage: number) {
        return this.mapGarageBuild.get(idGarage);
    }

    private GetDataCarInGarage(idGarage: number): JsonCar[] {
        return this.mapDataCarInGarage.get(idGarage);
    }

    public GetAllCarsInAllGarages(): JsonCar[] {
        let result: JsonCar[] = [];
        this.mapDataCarInGarage.forEach((carMap) => {
            carMap.forEach((car) => {
                result.push(car);
            });
        });

        return result;
    }

    public ChangeIdCarInGarages(idCarRoot: number, idCarChange: number) {
        this.mapDataCarInGarage.forEach((carMap) => {
            let jsonCarChange = carMap.find(jsonCar => jsonCar.idCar == idCarRoot);
            if (jsonCarChange != null) {
                jsonCarChange.idCar = idCarChange;
            }
        })
    }

    public RegisterCallback(cbGetIdCarAuto: CallableFunction) { this._cbGetIdCarForInit = cbGetIdCarAuto; }

    //=========================================================
    //#region func ObjectPool
    public InitGarageBuild(jsonGarage: JsonGarage = null): Node {
        let nGarage: Node = this.GetEntity();
        nGarage.setParent(this.nMapCar);
        nGarage.setPosition(MConstBuildGame.DEFAULT_POSITION_CONVEYOR_BELT);
        nGarage.active = true;
        const idGarageNew = this.GetAutoIdEntities();
        this.mapGarageBuild.set(idGarageNew, nGarage);
        this.mapDataCarInGarage.set(idGarageNew, []);
        nGarage.getComponent(BuildGarage).SetIdGarage(idGarageNew);
        nGarage.getComponent(BuildGarage).registerCallback(this.AddCarsToGarage.bind(this), this.RemoveCarFromGarage.bind(this),
            this.ChangeDataCarInGarage.bind(this), this.GetNGarage.bind(this), this.GetDataCarInGarage.bind(this));
        nGarage.getComponent(BuildGarage).SetData(jsonGarage, this.nMapCar.worldPosition.clone());

        // data garage
        if (jsonGarage != null) {
            for (let i = 0; i < jsonGarage.cars.length; i++) {
                const dataCar: JsonCar = jsonGarage.cars[i];
                this.AddCarsToGarage(idGarageNew, dataCar);
            }

        }

        return nGarage;
    }
    //#endregion func ObjectPool
    //=========================================================

    /**
     * This func will save data car and return idCar
     * @param idGarage 
     * @param dataCar 
     * @returns idCar
     */
    public AddCarsToGarage(idGarage: number, dataCar: JsonCar): number {
        if (!this.mapDataCarInGarage.has(idGarage)) {
            this.mapDataCarInGarage.set(idGarage, []);
        }
        this.mapDataCarInGarage.get(idGarage).push(dataCar);
        return dataCar.idCar;
    }

    public RemoveCarFromGarage(idGarage: number, idCar: number) {
        if (this.mapDataCarInGarage.has(idGarage)) {
            let listCarInGarage: JsonCar[] = this.mapDataCarInGarage.get(idGarage);
            const indexCar: number = listCarInGarage.findIndex(car => car.idCar == idCar);
            if (indexCar >= 0) {
                listCarInGarage.splice(indexCar, 1);
            }
        }
    }

    public ChangeDataCarInGarage(idGarage: number, idCar: number, dataCar: JsonCar) {
        if (this.mapDataCarInGarage.has(idGarage)) {
            let listCarInGarage: JsonCar[] = this.mapDataCarInGarage.get(idGarage);
            const indexCar: number = listCarInGarage.findIndex(car => car.idCar == idCar);
            if (indexCar >= 0) {
                listCarInGarage[indexCar] = dataCar;
            }
        }
    }

    public UpdateListGarage(typeUpdate: "delete" | "add" | "swap", idGarage1: number): boolean {

        try {
            // update
            switch (typeUpdate) {
                case "delete":
                    // delete garage
                    const nGarage = this.mapGarageBuild.get(idGarage1);
                    if (nGarage == null) return false;
                    this.ReUseEntiny(nGarage);
                    if (!this.mapGarageBuild.delete(idGarage1)) { return false; }

                    // remove map car of garage
                    if (!this.mapDataCarInGarage.delete(idGarage1)) { return false; }

                    // reduce id gen garage
                    this.ReduceIdEntities();
                    break;
                case "add":
                    break;
                case "swap":
                    break;
                default:
                    return false;
            }
        } catch (e) {
            return false;
        }

        return true;
    }

    public GetInfoToExport(): Node[] {
        const listNGarageExport = Array.from(this.mapGarageBuild.entries())
            .filter(element => element != null)
            .sort(([aId], [bId]) => aId - bId)
            .map(([_, node]) => node as Node);
        return listNGarageExport
    }
}