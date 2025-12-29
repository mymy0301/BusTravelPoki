import { _decorator, Component, Node } from 'cc';
import { JsonCar, JsonGarage } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('InfoGarageSys')
export class InfoGarageSys {
    private _infoGarage: JsonGarage = null;
    private _indexCarGet: number = 0;
    private _idGarage: number = -1; public get IDGarage(): number { return this._idGarage; }

    public Init(infoGarage: JsonGarage, idGarage: number) {
        this._indexCarGet = 0;
        this._infoGarage = infoGarage;
        this._idGarage = idGarage;
    }

    public get DirectGarage() { return this._infoGarage.direction; }
    public get TotalCarHas() { return this._infoGarage.cars.length }
    public get PosGarage() { return this._infoGarage.garagePosition; }
    public GetInfoNextCar(indexCar: number): JsonCar { return this._infoGarage.cars[indexCar] }
    public GetIndexCarNow(): number { return this._indexCarGet; }
    public IncreaseIndexCar() { this._indexCarGet += 1; }
    public GetNumRemainingCar(): number { return this.TotalCarHas - this._indexCarGet; }
}


