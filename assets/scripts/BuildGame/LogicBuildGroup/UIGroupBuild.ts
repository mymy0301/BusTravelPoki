import { _decorator, Component, Node } from 'cc';
import { ListItemColorBuild } from './ListItemColorBuild';
import { ConvertSizeCarFromJsonToNumber, GetMColorByNumber, GetPriorityDefaultByColor, JsonCar, M_COLOR, TGroupToLogic } from '../../Utils/Types';
import { MConfigBuildGame } from '../MConfigBuildGame';
import { UIChoiceGroupBuild } from './UIChoiceGroupBuild';
import { UIInfoGroupBuilding } from './UIInfoGroupBuilding';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Fri Aug 22 2025 17:59:40 GMT+0700 (Indochina Time)
 * UIGroupBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/UIGroupBuild.ts
 *
 */

@ccclass('UIGroupBuild')
export class UIGroupBuild extends Component {
    @property(ListItemColorBuild) listItemColorBuild: ListItemColorBuild;
    @property(UIChoiceGroupBuild) uiChoiceGroupBuild: UIChoiceGroupBuild;
    @property(UIInfoGroupBuilding) uiInfoGroupBuilding: UIInfoGroupBuilding;
    private _idGroupChoice: number = 0;
    private _listInfoCar: JsonCar[] = [];
    //==========================================
    //#region base
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private ChoiceGroup(index: number) {
        let configSet: TGroupToLogic[] = MConfigBuildGame.listLogicGroup[index];

        // console.log(MConfigBuildGame.listLogicGroup);
        // console.log(index);

        if (configSet == null) {
            configSet = this.ConvertJsonCarToTGroupToLogic(this._listInfoCar);
        }
        // check nếu là bản cũ thì ta sẽ thêm dữ liệu số xe vào json
        if (configSet[0] != null && configSet[0].numCar == 0) {
            configSet = this.AddParamNumCar(this._listInfoCar, configSet);
        }

        this.uiInfoGroupBuilding.SetUp(configSet);
        this.listItemColorBuild.SetUp(configSet);

        this._idGroupChoice = index;
    }

    private AddParamNumCar(listInfoCar: JsonCar[], tGroupToLogicRoot: TGroupToLogic[]): TGroupToLogic[] {
        let result: TGroupToLogic[] = tGroupToLogicRoot;

        let mapColor: Map<number, number> = new Map();  // MCOLOR - numCar

        listInfoCar.forEach(infoCar => {
            let isHasCarSameColor: boolean = tGroupToLogicRoot.find(tGroup => tGroup.color == infoCar.carColor) != null;
            if (isHasCarSameColor) {
                if (mapColor.get(infoCar.carColor) == null) {
                    mapColor.set(infoCar.carColor, 0);
                }
                mapColor.set(infoCar.carColor, mapColor.get(infoCar.carColor) + 1);
            }
        })

        result.forEach(tGroupCheck => {
            const numCar = mapColor.get(tGroupCheck.color);
            tGroupCheck.numCar = numCar;
        })

        return result;
    }

    public ConvertJsonCarToTGroupToLogic(listInfoCar: JsonCar[]): TGroupToLogic[] {
        let result: TGroupToLogic[] = [];


        let mapColor: Map<number, { numColor: number, numCar: number, priority: number }> = new Map();  // color json - quality
        listInfoCar.forEach(infoCar => {
            const colorCar: number = infoCar.carColor;

            if (mapColor.get(colorCar) == null) {
                const mColor: M_COLOR = GetMColorByNumber(colorCar);
                const priorityDefault: number = GetPriorityDefaultByColor(mColor);
                mapColor.set(colorCar, { numColor: 0, numCar: 0, priority: priorityDefault });
            }
            const numColor = mapColor.get(colorCar).numColor + ConvertSizeCarFromJsonToNumber(infoCar.carSize);
            const totalCar = mapColor.get(colorCar).numCar + 1;
            mapColor.set(colorCar, { numColor: numColor, numCar: totalCar, priority: mapColor.get(colorCar).priority });
        })

        mapColor.forEach((colorCheck, key) => {
            result.push({
                color: key,
                total: colorCheck.numColor,
                numCar: colorCheck.numCar,
                listTGroup: [{ quality: colorCheck.numColor, startR: 0, endR: 100 }],
                priority: colorCheck.priority
            })
        })
        // console.log("now", ...result);
        return result;
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public Show(listInfoCar: JsonCar[]) {
        this.uiInfoGroupBuilding.Reset();
        this.listItemColorBuild.Reset();
        this.uiChoiceGroupBuild.Reset();

        this._listInfoCar = listInfoCar;
        this.ChoiceGroup(0);
        this.uiChoiceGroupBuild.SetUp(this.ChoiceGroup.bind(this));
        this.node.active = true;
    }

    public Hide() {
        this.node.active = false;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    public onBtnAddGroup() {
        const jsonGroup = this.listItemColorBuild.GetListPassenger();
        MConfigBuildGame.listLogicGroup.push(jsonGroup);
        this.uiChoiceGroupBuild.UpdateUI();
    }

    public onBtnSaveData() {
        const jsonGroup = this.listItemColorBuild.GetListPassenger();
        const indexChoice = this.uiChoiceGroupBuild.GetIndexChoice();
        if (MConfigBuildGame.listLogicGroup[indexChoice] != null) {
            MConfigBuildGame.listLogicGroup[indexChoice] = jsonGroup;
        }

        console.log("new data", indexChoice, jsonGroup);
    }

    public onBtnDeleteData() {
        if (MConfigBuildGame.listLogicGroup.length == 0) { return; }
        MConfigBuildGame.listLogicGroup.splice(this._idGroupChoice, 1);
        this.uiChoiceGroupBuild.UpdateUI();
    }

    public OnBtnReset() {
        this.listItemColorBuild.Reset();
        this.uiInfoGroupBuilding.Reset();
    }
    //#endregion btn
    //==========================================
}