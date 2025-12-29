import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { JsonCar, JsonConveyorBelt } from '../../Utils/Types';
import { BuildConveyorBelt } from './BuildConveyorBelt';
import { MConst } from '../../Const/MConst';
import { MConstBuildGame } from '../MConstBuildGame';
import { ListEntitiesBaseSys } from '../Utils/ListEntitiesBaseSys';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ListConveyorBeltSys')
export class ListConveyorBeltSys extends ListEntitiesBaseSys {
    @property(Node) nMapCar: Node;
    public mapConveyorBeltBuild: Map<number, Node> = new Map();
    public mapDataCarInConveyorBelt: Map<number, JsonCar[]> = new Map();
    private _cbGetIdCarForInit: CallableFunction = null;

    //=========================================================
    //#region self
    public Reset() {
        this.ResetAutoIdEntities();
        this.ReUseAllEntities(this.GetInfoToExport());
        this.mapConveyorBeltBuild.clear();
        this.mapDataCarInConveyorBelt.clear();
    }
    //#endregion self
    //=========================================================

    //=========================================================
    //#region Id belt
    public GetConveyorBuildById(idCar: number): Node {
        return this.mapConveyorBeltBuild.get(idCar);
    }
    //#endregion Id belt
    //=========================================================

    private GetNConveyorBelt(idBelt: number) {
        return this.mapConveyorBeltBuild.get(idBelt);
    }

    private GetDataCarInConveyorBelt(idBelt: number) {
        return this.mapDataCarInConveyorBelt.get(idBelt);
    }

    public GetAllCarsInAllBelt(): JsonCar[] {
        let result: JsonCar[] = [];
        this.mapDataCarInConveyorBelt.forEach((carMap) => {
            carMap.forEach((car) => {
                result.push(car);
            });
        });

        return result;
    }

    public ChangeIdCarInBelt(idCarRoot: number, idCarChange: number) {
        this.mapDataCarInConveyorBelt.forEach((carMap) => {
            let jsonCarChange = carMap.find(carInfo => carInfo.idCar = idCarRoot);
            if (jsonCarChange != null) {
                jsonCarChange.idCar = idCarChange;
            }
        })
    }

    public RegisterCallback(cbGetIdCarAuto: CallableFunction) { this._cbGetIdCarForInit = cbGetIdCarAuto; }

    //#region func ObjectPool
    public InitConveyorBeltBuild(jsonConveyorBelt: JsonConveyorBelt = null): Node {
        let nConveyorBelt: Node = this.GetEntity();
        nConveyorBelt.setParent(this.nMapCar);
        console.log(jsonConveyorBelt);
        if (jsonConveyorBelt == null) {
            nConveyorBelt.position = MConstBuildGame.DEFAULT_POSITION_CONVEYOR_BELT;
        } else {
            nConveyorBelt.worldPosition = Utils.ConvertPosToWorldOfANode(this.nMapCar.worldPosition.clone(), jsonConveyorBelt.conveyorBeltPosition, MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS);
        }
        // nConveyorBelt.setPosition(jsonConveyorBelt == null ? MConstBuildGame.DEFAULT_POSITION_CONVEYOR_BELT : jsonConveyorBelt.conveyorBeltPosition);
        nConveyorBelt.active = true;
        const idConveyorBeltNew = this.GetAutoIdEntities();
        this.mapConveyorBeltBuild.set(idConveyorBeltNew, nConveyorBelt);
        this.mapDataCarInConveyorBelt.set(idConveyorBeltNew, []);
        nConveyorBelt.getComponent(BuildConveyorBelt).SetIdConveyorBelt(idConveyorBeltNew);
        nConveyorBelt.getComponent(BuildConveyorBelt).registerCallback(this.AddCarsToConveyorBelt.bind(this), this.RemoveCarFromConveyorBelt.bind(this),
            this.ChangeDataCarInConveyorBelt.bind(this), this.GetNConveyorBelt.bind(this), this.GetDataCarInConveyorBelt.bind(this))

        // data conveyorBelt
        if (jsonConveyorBelt != null) {
            for (let i = 0; i < jsonConveyorBelt.cars.length; i++) {
                const dataCar: JsonCar = jsonConveyorBelt.cars[i];
                this.AddCarsToConveyorBelt(idConveyorBeltNew, dataCar);
            }

        }

        return nConveyorBelt;
    }
    //#endregion func ObjectPool

    //#region CRUD
    /**
     * This func will save data car and return idCar
     * @param idConveyorBelt 
     * @param dataCar 
     * @returns idCar
     */
    public AddCarsToConveyorBelt(idConveyorBelt: number, dataCar: JsonCar): number {
        if (!this.mapDataCarInConveyorBelt.has(idConveyorBelt)) {
            this.mapDataCarInConveyorBelt.set(idConveyorBelt, []);
        }
        this.mapDataCarInConveyorBelt.get(idConveyorBelt).push(dataCar);

        return dataCar.idCar;
    }

    public RemoveCarFromConveyorBelt(idConveyorBelt: number, idCar: number) {
        if (this.mapDataCarInConveyorBelt.has(idConveyorBelt)) {
            let listCars: JsonCar[] = this.mapDataCarInConveyorBelt.get(idConveyorBelt);
            const indexCar: number = listCars.findIndex(car => car.idCar == idCar);
            listCars.splice(indexCar, 1);
        }
    }

    public ChangeDataCarInConveyorBelt(idConveyorBelt: number, idCar: number, dataCar: JsonCar) {
        if (this.mapDataCarInConveyorBelt.has(idConveyorBelt)) {
            let listCarInBelt: JsonCar[] = this.mapDataCarInConveyorBelt.get(idConveyorBelt);
            const indexCar: number = listCarInBelt.findIndex(car => car.idCar == idCar);
            if (indexCar >= 0) {
                listCarInBelt[indexCar] = dataCar;
            }
        }
    }
    //#endregion CRUD

    public UpdateListBelt(typeUpdate: "delete" | "add" | "swap", idBelt1: number): boolean {

        try {
            // update
            switch (typeUpdate) {
                case "delete":
                    // delete belt
                    const beltDelete = this.mapConveyorBeltBuild.get(idBelt1);
                    if (beltDelete == null) return false;
                    this.ReUseEntiny(beltDelete);
                    if (!this.mapConveyorBeltBuild.delete(idBelt1)) { return false; }

                    // remove map car of belt
                    if (!this.mapDataCarInConveyorBelt.delete(idBelt1)) { return false; }

                    // reduce id gen belt
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
        const listNBeltExport = Array.from(this.mapConveyorBeltBuild.entries())
            .filter(element => element != null)
            .sort(([aId], [bId]) => aId - bId)
            .map(([_, node]) => node as Node);
        return listNBeltExport;
    }
}


