import { _decorator, Component, Node, Toggle, ToggleContainer } from 'cc';
import { UIBuildGarageDetail } from './UIBuildGarageDetail';
import { BuildGameSys } from '../../BuildGameSys';
import { BuildGarage } from '../../Garage/BuildGarage';
const { ccclass, property } = _decorator;

@ccclass('UIChangeInfoGarage')
export class UIChangeInfoGarage extends Component {
    @property(UIBuildGarageDetail) UIBuildGarageDetail: UIBuildGarageDetail;
    @property(ToggleContainer) tgcDirection: ToggleContainer;
    @property(Node) nUIOtherFunc: Node;

    protected onLoad(): void {
        // add event check for list checkbox
        this.tgcDirection.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new UIChangeInfoGarage.EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIChangeInfoGarage';
            checkEventHandler.handler = 'onToggleChangeDirection';
            checkEventHandler.customEventData = index.toString();

            tgc.checkEvents.push(checkEventHandler);
        });
    }

    protected onEnable(): void {
        this.UIBuildGarageDetail.node.active = true;
        this.nUIOtherFunc.active = false;

        // update toggle direction
        const garageCom: BuildGarage = BuildGameSys.Instance.getNGarageChoicing().getComponent(BuildGarage);
        this.tgcDirection.toggleItems[garageCom.directionGarage].isChecked = true;
    }

    //#region func btn
    private onBtnClose() {
        this.node.active = false;
        BuildGameSys.Instance.UnChoicingGarage();
    }

    private onBtnDeleteGarage() {
        this.node.active = false;
        BuildGameSys.Instance.DeleteGarage();
    }

    private onBtnShowUIDetailInfoGarage() {
        this.UIBuildGarageDetail.node.active = true;
        this.nUIOtherFunc.active = false;
    }

    private onBtnShowUIOtherFuncGarage() {
        this.UIBuildGarageDetail.node.active = false;
        this.nUIOtherFunc.active = true;
    }

    private onToggleChangeDirection(event: Event, customEventData: string) {
        let nGarageChoicing: Node = BuildGameSys.Instance.getNGarageChoicing();
        nGarageChoicing.getComponent(BuildGarage).ChangeDirection(Number.parseInt(customEventData));
    }
    //#endregion func btn
}


