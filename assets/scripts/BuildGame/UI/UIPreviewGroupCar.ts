import { _decorator, Component, instantiate, Label, Node, Prefab, Sprite, Vec3 } from 'cc';
import { GetMColorByNumber, GetNumberByMColor, JsonCar, GetNameCarSize, ConvertSizeCarFromJsonToNumber, TYPE_PASSENGER_POSE } from '../../Utils/Types';
import { BuildCar } from '../Car/BuildCar';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { shuffleArrayWithSeed } from '../../framework/randomSeed';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIPreviewGroupCar')
export class UIPreviewGroupCar extends Component {
    @property(Node) nGridCar: Node;
    @property(Node) nGridPassenger: Node;
    @property(Prefab) prefabCar: Prefab;
    @property(Label) lbGroup: Label;

    private _listJsonCarGroup: JsonCar[];
    private _listIdCar: number[];
    private _listColorPassenger: number[];

    private InitCarForGrid(idCar: number, jsonCar: JsonCar): Node {
        let nCar = instantiate(this.prefabCar);
        let jsonCreate: JsonCar = JSON.parse(JSON.stringify(jsonCar))
        jsonCreate.carSize = ConvertSizeCarFromJsonToNumber(jsonCreate.carSize);
        nCar.getComponent(BuildCar).SetIdCar(idCar);
        nCar.getComponent(BuildCar).SetData(jsonCreate, Vec3.ZERO);
        return nCar;
    }

    private InitGridCars(listIdCar: number[], listJsonCar: JsonCar[]) {
        for (let i = 0; i < listJsonCar.length; i++) {
            let nCar = this.InitCarForGrid(listIdCar[i], listJsonCar[i]);
            nCar.setParent(this.nGridCar);
        }
    }

    private InitGridPassenger(listColorPassenger: number[], listJsonCar: JsonCar[]) {

        let dataInput: number[] = [];

        // check if has preview data or not
        if (listColorPassenger.length > 0) {
            dataInput = listColorPassenger;
        } else {
            dataInput = listJsonCar.map(data => data.carColor);
        }

        // init passenger 
        for (let i = 0; i < dataInput.length; i++) {
            const pathImgPassenger: string = MConfigResourceUtils.GetPathPassengers(GetMColorByNumber(dataInput[i]), TYPE_PASSENGER_POSE.SITTING);
            let sfPassenger = MConfigResourceUtils.GetImagePassengers(pathImgPassenger);
            let nPassenger = new Node();
            nPassenger.addComponent(Sprite).spriteFrame = sfPassenger;
            nPassenger.setParent(this.nGridPassenger);
        }
    }

    private SetDataShow(listJsonCarGroup: JsonCar[], listIdCar: number[], listColorPassenger: number[]) {
        this._listJsonCarGroup = listJsonCarGroup;
        this._listIdCar = listIdCar;
        this._listColorPassenger = listColorPassenger;

        this.ResetUI();

        this.InitGridCars(this._listIdCar, this._listJsonCarGroup);
        this.InitGridPassenger(this._listColorPassenger, this._listJsonCarGroup);
    }

    private ResetUI() {
        this.nGridCar.removeAllChildren();
        this.nGridPassenger.removeAllChildren();
    }

    private ResetAllData() {
        this.ResetUI();
        this._maxGroup = 0;
        this._indexGroupNow = 0;
        this.rootData.clear();
    }

    private LoadDataGroup(indexGroupLoad: number, autoIncreaseIndex: boolean = true, autoDecreaseIndex: boolean = false) {
        let indexChoice: number = indexGroupLoad;

        if (autoIncreaseIndex) {
            while (indexChoice < this._maxGroup && this.rootData.get(indexChoice) == null) {
                indexChoice += 1;
            }
        }

        if (autoDecreaseIndex) {
            while (indexChoice >= 0 && this.rootData.get(indexChoice) == null) {
                indexChoice -= 1;
            }
        }


        if (indexGroupLoad < 0 || indexGroupLoad >= this._maxGroup) { return; }

        // casePass
        this._indexGroupNow = indexChoice;
        this.lbGroup.string = `Group_${indexChoice}`
        const dataLoadUI = this.rootData.get(indexChoice);
        this.SetDataShow(dataLoadUI.listJsonCarGroup, dataLoadUI.listIdCar, dataLoadUI.listColorPassenger);
    }

    //#region public func
    private _maxGroup: number = 0;
    private _indexGroupNow: number = 0;
    private rootData: Map<number, {
        listJsonCarGroup: JsonCar[],
        listIdCar: number[],
        listColorPassenger: number[]
    }> = new Map();
    public Init(mapGroupCarInfo: Map<number, {
        listJsonCarGroup: JsonCar[],
        listIdCar: number[],
        listColorPassenger: number[]
    }>) {

        this.ResetAllData();

        this._maxGroup = mapGroupCarInfo.size;
        this.rootData = mapGroupCarInfo;
        this.LoadDataGroup(this._indexGroupNow, true, false);
    }

    public NextGroup() {
        this.LoadDataGroup(this._indexGroupNow + 1, true, false);
    }

    public PreviousGroup() {
        this.LoadDataGroup(this._indexGroupNow - 1, false, true);
    }

    public RandomPassenger() {
        // copy json
        let dataCopy: number[] = [];
        if (this.rootData.get(this._indexGroupNow).listColorPassenger.length > 0) {
            dataCopy = Array.from(this.rootData.get(this._indexGroupNow).listColorPassenger);
        } else {
            dataCopy = this.rootData.get(this._indexGroupNow).listJsonCarGroup.map(data => data.carColor)
        }

        this._listColorPassenger = ShuffleLogic1(dataCopy);

        // update UI passenger
        this.nGridPassenger.children.forEach((child: Node, index: number) => {
            const pathImage = MConfigResourceUtils.GetPathPassengers(GetMColorByNumber(this._listColorPassenger[index]), TYPE_PASSENGER_POSE.SITTING);
            const sfPass = MConfigResourceUtils.GetImagePassengers(pathImage);
            child.getComponent(Sprite).spriteFrame = sfPass;
        })
    }

    public Close() {
        this.node.active = false;
    }

    public LogData() {
        let dataInput: number[] = [];

        // check if has preview data or not
        if (this.rootData.get(this._indexGroupNow).listColorPassenger.length > 0) {
            dataInput = this.rootData.get(this._indexGroupNow).listColorPassenger;
        } else {
            dataInput = this.rootData.get(this._indexGroupNow).listJsonCarGroup.map(data => data.carColor);
        }

        let result: string = dataInput.map(value => value.toString()).toString();
        console.log(`passenger group ${this._indexGroupNow}:::: `, result);
    }
    //#endregion public func
}


function ShuffleLogic1(listColorPassenger: number[]): number[] {
    return Utils.shuffleList(listColorPassenger)
}

