import { _decorator, Button, CCFloat, CCInteger, Component, error, Label, math, Node, Size, Vec3 } from 'cc';
import { ConvertSizeCarNumberToJsonBusFrenzy, DIRECT_CAR, JsonCar, JsonConveyorBelt } from '../../Utils/Types';
import { Utils } from '../../Utils/Utils';
import { MConst } from '../../Const/MConst';
import { clientEvent } from '../../framework/clientEvent';
import { MConstBuildGame, STATE_BUILD_GAME } from '../MConstBuildGame';
import { BuildGameSys } from '../BuildGameSys';
import { BuildItemBase, IBuildItemBase, ITouchItem } from '../BuildItemBase';
const { ccclass, property } = _decorator;

@ccclass('BuildConveyorBelt')
export class BuildConveyorBelt extends BuildItemBase implements IBuildItemBase, ITouchItem {
    // info
    @property(CCInteger) numItemShow: number = 7;
    @property(CCFloat) spacingX: number = 0;
    @property(Size) sizeItem: Size = new Size(100, 100);

    // UI
    @property(Label) lbIdConveyorBuild: Label;
    private jsonConveyorBelt: JsonConveyorBelt = {
        conveyorBeltPosition: MConstBuildGame.DEFAULT_POSITION_CONVEYOR_BELT,
        cars: [],
        direction: DIRECT_CAR.TOP,
    }

    private idBuildConveyerBelt: number = -1; public get IDBuildConveyerBelt(): number { return this.idBuildConveyerBelt; }
    public get DirectionConveyorBelt(): DIRECT_CAR { return this.jsonConveyorBelt.direction; }

    //callback
    private _cbAddCarToConveyorBelt: CallableFunction = null;
    private _cbRemoveCarOutConveyorBelt: CallableFunction = null;
    private _cbChangeDataCarOfConveyorBelt: CallableFunction = null;

    private _cbGetConveyorBelt: CallableFunction = null;
    private _cbGetListCarOfConveyorBelt: CallableFunction = null;


    override onLoad(): void {
        super.onLoad();
        this.Init(this, this);
    }

    //#region func self
    public registerCallback(cbAddCarToConveyorBelt: CallableFunction, cbRemoveCarOutConveyorBelt: CallableFunction, cbChangeDataCarOfConveyorBelt: CallableFunction
        , cbGetConveyorBelt: CallableFunction, cbGetListCarOfConveyorBelt: CallableFunction,) {
        this._cbAddCarToConveyorBelt = cbAddCarToConveyorBelt;
        this._cbRemoveCarOutConveyorBelt = cbRemoveCarOutConveyorBelt;
        this._cbChangeDataCarOfConveyorBelt = cbChangeDataCarOfConveyorBelt;

        this._cbGetConveyorBelt = cbGetConveyorBelt;
        this._cbGetListCarOfConveyorBelt = cbGetListCarOfConveyorBelt;
    }

    public SetIdConveyorBelt(idConveyor: number) {
        this.idBuildConveyerBelt = idConveyor;
    }

    public SetData(jsonConveyorBelt: JsonConveyorBelt, wPosMap: Vec3) {
        this.node.worldPosition = Utils.ConvertPosToWorldOfANode(wPosMap, jsonConveyorBelt.conveyorBeltPosition, MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS);
        this.jsonConveyorBelt = jsonConveyorBelt;
        this.UpdateConveyorBelt();
    }

    private UpdateConveyorBelt() {
        this.node.name = `conveyor_belt_${this.idBuildConveyerBelt}`;
    }

    public GetInfoToSaveData(): JsonConveyorBelt {
        // let list dataCar
        let listDataCar: JsonCar[] = [];
        let data = this._cbGetListCarOfConveyorBelt(this.IDBuildConveyerBelt) as Map<number, JsonCar>;
        listDataCar = JSON.parse(JSON.stringify(Array.from(data.values())));

        let result: JsonConveyorBelt = {
            conveyorBeltPosition: this.node.position.clone().multiplyScalar(1 / MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS),
            cars: listDataCar,
            direction: this.jsonConveyorBelt.direction,
        }

        return result;
    }

    public GetListIdCars(): number[] {
        let result: number[] = [];
        this._cbGetListCarOfConveyorBelt(this.IDBuildConveyerBelt).forEach((value: JsonCar, key: number) => {
            result.push(key);
        })

        return result;
    }


    /**
     * Change index car in data
     * @param indexCar it is same with id car
     * @param diffIndexChange the diff index want to change
     * @returns if success return true
     */
    public ChangeIndexCarInData(indexCar: number, diffIndexChange: number): boolean {
        if (indexCar >= 0 && indexCar < this.jsonConveyorBelt.cars.length - 1) {
            const targetIndex = indexCar + diffIndexChange;
            if (targetIndex >= 0 && targetIndex < this.jsonConveyorBelt.cars.length) {
                const [car] = this.jsonConveyorBelt.cars.splice(indexCar, 1);
                this.jsonConveyorBelt.cars.splice(targetIndex, 0, car);
                return true;
            }
        }
        return false;
    }

    public ChangeDirection(directionRotateTo: DIRECT_CAR) {
        this.jsonConveyorBelt.direction = directionRotateTo;
        this.node.angle = this.jsonConveyorBelt.direction * 45;
    }
    //#endregion func self

    DragDone(): void {
        //NOTE you can do somethign in here
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
        BuildGameSys.Instance.SetConveyorBeltChoicing(node);
    }


    IsChoiceThisObject(): boolean {
        return BuildGameSys.Instance.NConveyorBeltChoicing == this.node;
    }
    MoveObj(touchMove: math.Vec2): void {
        let wPosMove: Vec3 = new Vec3(touchMove.x, touchMove.y, 0);
        this.node.worldPosition = wPosMove;
    }
    RotateObj(): void {
        if (this.jsonConveyorBelt.direction == DIRECT_CAR.TOP_RIGHT) {
            this.jsonConveyorBelt.direction = DIRECT_CAR.TOP;
        } else {
            this.jsonConveyorBelt.direction += 1;
        }
        this.ChangeDirection(this.jsonConveyorBelt.direction);
    }

    //#region CRUD
    /**
     * This func will return idCar
     * @param dataCar 
     * @returns IdCar
     */
    public AddCarToConveyorBeltCars(dataCar: JsonCar): number {
        return this._cbAddCarToConveyorBelt(this.idBuildConveyerBelt, dataCar);
    }
    public RemoveCarOfConveyorBeltCars(idCar: number) {
        this._cbRemoveCarOutConveyorBelt(this.idBuildConveyerBelt, idCar);
    }
    public ChangeDataCarOfConveyorBeltCars(idCar: number, dataCar: JsonCar) {
        this._cbChangeDataCarOfConveyorBelt(this.idBuildConveyerBelt, idCar, dataCar);
    }
    //#endregion CRUD
}


