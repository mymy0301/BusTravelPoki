import { _decorator, Component, Label, Node } from 'cc';
import { UIChangeInfoCar } from './UI/UIChangeInfoCar';
import { ResourceUtils } from '../Utils/ResourceUtils';
import { MConst } from '../Const/MConst';
import { MConfigResourceUtils } from '../Utils/MConfigResourceUtils';
import { UIChangeInfoConveyorBelt } from './UI/ConveryorBelt/UIChangeInfoConveyorBelt';
import { UIChangeInfoGarage } from './UI/Garage/UIChangeInfoGarage';
import { MConfigBuildGame } from './MConfigBuildGame';
import { UIPreparePlayBuild } from './UI/UIPlayChoiceGroup/UIPreparePlayBuild';
import { UINotiBuildNoGroup } from './UI/UINotiBuildNoGroup';
const { ccclass, property } = _decorator;

@ccclass('BuildGameUISys')
export class BuildGameUISys extends Component {
    public static Instance: BuildGameUISys = null
    @property(UIChangeInfoCar) uiChangeInfoCar: UIChangeInfoCar;
    @property(UIChangeInfoConveyorBelt) uiChangeInfoConveyorBelt: UIChangeInfoConveyorBelt
    @property(UIChangeInfoGarage) uiChangeInfoGarage: UIChangeInfoGarage
    @property(Node) nBlockUI: Node
    @property(Label) lbTitleLevel: Label;
    @property(UIPreparePlayBuild) uiPreparePlayBuild: UIPreparePlayBuild;
    @property(UINotiBuildNoGroup) nUINotiBuildGroup: UINotiBuildNoGroup;

    protected onLoad() {
        if (BuildGameUISys.Instance == null) {
            BuildGameUISys.Instance = this;
            this.uiChangeInfoCar.node.active = false;
            this.uiChangeInfoConveyorBelt.node.active = false;
            this.uiChangeInfoGarage.node.active = false;
            this.uiPreparePlayBuild.node.active = false;
            this.uiPreparePlayBuild.LoadFromOtherScript();
            this.nUINotiBuildGroup.node.active = false;

            this.LoadBundle();
        }
    }

    private async LoadBundle() {
        this.nBlockUI.active = true;
        await ResourceUtils.loadBundler(MConst.BUNDLE_GAME);

        // may be you need to read json first than load bundle passenger and car that include in json have
        await Promise.all([
            await MConfigResourceUtils.LoadImagePassengersAndEmotions(),
            await MConfigResourceUtils.LoadAllImageCar(null),
            await MConfigResourceUtils.LoadAllArrow(),
            await MConfigResourceUtils.LoadAllQuestion(),
            await MConfigResourceUtils.LoadPfAnimReindeer()
        ]);
        this.nBlockUI.active = false;
    }

    protected onDestroy(): void {
        BuildGameUISys.Instance = null
    }

    //#region func show UI
    public ShowUIChangeInfoCar() {
        this.uiChangeInfoCar.node.active = true;
        this.uiChangeInfoCar.getComponent(UIChangeInfoCar).UpdateVisual();
    }

    public ShowUIChangeInfoConveyorBelt() {
        this.uiChangeInfoConveyorBelt.node.active = true;
    }

    public ShowUIChangeInfoGarage() {
        this.uiChangeInfoGarage.node.active = true;
    }

    public TurnOffAllUI() {
        this.uiChangeInfoCar.node.active = false;
        this.uiChangeInfoConveyorBelt.node.active = false;
        this.uiChangeInfoGarage.node.active = false;
    }

    public SetLevelTitle(title: string) {
        this.lbTitleLevel.string = title;
    }

    public Reset() {
        this.TurnOffAllUI();
        this.SetLevelTitle("");
        MConfigBuildGame.nameLevelImport = "";
        MConfigBuildGame.listLogicGroup = [];
    }
    //#endregions func show Ui
}


