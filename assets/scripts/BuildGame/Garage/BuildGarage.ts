import { _decorator, Component, Label, math, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { ConvertSizeCarNumberToJsonBusFrenzy, DIRECT_CAR, JsonCar, JsonGarage } from '../../Utils/Types';
import { Utils } from '../../Utils/Utils';
import { MConst } from '../../Const/MConst';
import { BuildItemBase, IBuildItemBase, ITouchItem } from '../BuildItemBase';
import { BuildGameSys } from '../BuildGameSys';
const { ccclass, property } = _decorator;

@ccclass('BuildGarage')
export class BuildGarage extends BuildItemBase implements IBuildItemBase, ITouchItem {


    // info
    @property({ type: DIRECT_CAR }) directionGarage = DIRECT_CAR.TOP_RIGHT;

    //UI
    @property(Label) lbId: Label;
    @property(Sprite) spVisualGarage: Sprite;
    @property({ tooltip: "remember it follow the rule DIRECT_CAR", type: SpriteFrame }) listSfGarage: SpriteFrame[] = [];

    private idBuildGarage: number = -1; public get IDBuildGarage(): number { return this.idBuildGarage; }
    private garagePosition: Vec3 = Vec3.ZERO;

    private _cbAddCarToGarage: CallableFunction = null;
    private _cbRemoveCarOutGarage: CallableFunction = null;
    private _cbChangeDataCarOfGarage: CallableFunction = null;

    private _cbGetGarage: CallableFunction = null;
    private _cbGetListCarOfGarage: CallableFunction = null;

    override onLoad(): void {
        super.onLoad();
        this.Init(this, this);
    }

    // #region init func

    public registerCallback(cbAddCarToGarage: CallableFunction, cbRemoveCarOutGarage: CallableFunction, cbChangeDataCarOfGarage: CallableFunction
        , cbGetGarage: CallableFunction, cbGetListCarOfGarage: CallableFunction,) {
        this._cbAddCarToGarage = cbAddCarToGarage;
        this._cbRemoveCarOutGarage = cbRemoveCarOutGarage;
        this._cbChangeDataCarOfGarage = cbChangeDataCarOfGarage;

        this._cbGetGarage = cbGetGarage;
        this._cbGetListCarOfGarage = cbGetListCarOfGarage;
    }

    public SetIdGarage(idGarage: number) {
        this.idBuildGarage = idGarage;
    }

    public SetData(jsonGarage: JsonGarage, wPosMap: Vec3) {
        if (jsonGarage != null) {
            this.node.worldPosition = Utils.ConvertPosToWorldOfANode(wPosMap, jsonGarage.garagePosition, MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS);
            // set for base data
            this.garagePosition = new Vec3(jsonGarage.garagePosition.x, jsonGarage.garagePosition.y, 0);
            this.directionGarage = jsonGarage.direction;
            this.UpdateVisual(this.directionGarage);
        }

        this.UpdateGarage();
    }
    // #endregion init func

    // #region func self
    private UpdateGarage() {
        this.node.name = `garage_${this.idBuildGarage}`;
    }

    public GetInfoToSaveData(): JsonGarage {

        // let list dataCar
        let listDataCar: JsonCar[] = [];
        let data = this._cbGetListCarOfGarage(this.IDBuildGarage) as Map<number, JsonCar>;
        console.warn("data check ", data);
        
        listDataCar = JSON.parse(JSON.stringify(Array.from(data.values())));

        let result: JsonGarage = {
            garagePosition: this.node.position.clone().multiplyScalar(1 / MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS),
            cars: listDataCar,
            direction: this.directionGarage,
        }
        return result;
    }

    public GetListIdCars(): number[] {
        let result: number[] = [];
        this._cbGetListCarOfGarage(this.IDBuildGarage).forEach((value: JsonCar, key: number) => {
            result.push(key);
        })

        return result;
    }

    public ChangeDirection(direction: DIRECT_CAR) {
        this.directionGarage = direction;
        this.UpdateVisual(direction);
    }

    private UpdateVisual(direction: DIRECT_CAR) {
        this.spVisualGarage.spriteFrame = this.listSfGarage[direction];
    }
    // #region func self

    //#region func of build game base
    DragDone(): void {

    }
    WarningObject(): void {

    }
    ChoicingObject(): void {
        this.RegisterKey();
    }
    UnChoicingObject(): void {
        this.UnRegisterKey();
    }
    SetObjectInBuildGameChoicing(node: Node): void {
        BuildGameSys.Instance.SetGarageChoicing(node);
    }
    //#endregion func of build game base

    //#region func of touch item
    IsChoiceThisObject(): boolean {
        return BuildGameSys.Instance.NGarageChoicing == this.node;
    }
    MoveObj(touchMove: math.Vec2): void {
        let wPosMove: Vec3 = new Vec3(touchMove.x, touchMove.y, 0);
        this.node.worldPosition = wPosMove;
    }
    RotateObj(): void {
        if (this.directionGarage == DIRECT_CAR.TOP_RIGHT) {
            this.directionGarage = DIRECT_CAR.TOP;
        } else {
            this.directionGarage += 1;
        }
        this.ChangeDirection(this.directionGarage);
    }
    //#endregion func of touch item 


    //#region CRUD
    /**
     * This func will return idCar
     * @param dataCar 
     * @returns IdCar
     */
    public AddCarToGarageCars(dataCar: JsonCar): number {
        return this._cbAddCarToGarage(this.idBuildGarage, dataCar);
    }
    public RemoveCarOfGarageCars(idCar: number) {
        this._cbRemoveCarOutGarage(this.idBuildGarage, idCar);
    }
    public ChangeDataCarOfGarageCars(idCar: number, dataCar: JsonCar) {
        this._cbChangeDataCarOfGarage(this.idBuildGarage, idCar, dataCar);
    }
    //#endregion CRUD
}


