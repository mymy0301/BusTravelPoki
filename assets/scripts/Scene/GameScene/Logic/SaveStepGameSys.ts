import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SaveStepGameSys')
export class SaveStepGameSys extends Component {
    public static Instance: SaveStepGameSys = null;
    private listStepCarColor: number[] = [];

    protected onLoad(): void {
        if (SaveStepGameSys.Instance == null) {
            SaveStepGameSys.Instance = this;
        }
    }

    protected onDisable(): void {
        SaveStepGameSys.Instance = null;
    }

    public ResetSteps(): void {
        this.listStepCarColor = [];
    }

    public AddStep(idCar: number) {
        this.listStepCarColor.push(idCar);
    }

    public GetListStepToLog(): string {
        let result = "";
        result = this.listStepCarColor.toString();
        return result;
    }
}


