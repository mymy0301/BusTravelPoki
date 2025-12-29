import { _decorator, Component, Node } from 'cc';
import { JsonCar, JsonGarage, JsonConveyorBelt } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('InfoBuildGame')
export class InfoBuildGame extends Component {
    public static Instance: InfoBuildGame = null;

    private _parkingCarSpaceInit: number = 4;
    private _listGuestColor: number[] = [];
    private _carsInfo: JsonCar[] = [];
    private _hamXeInfo: JsonGarage[] = [];
    private _transmissionsInfo: JsonConveyorBelt[] = [];

    protected onLoad(): void {
        if (InfoBuildGame.Instance == null) {
            InfoBuildGame.Instance = this;
        }
    }

    protected onDestroy(): void {
        InfoBuildGame.Instance = null;
    }
}


