import { _decorator, Component, Node, Toggle, ToggleContainer } from 'cc';
import { BuildGameSys } from '../../BuildGameSys';
import { UIBuildConveyorBeltDetail } from './UIBuildConveyorBeltDetail';
import { BuildConveyorBelt } from '../../ConveyorBelt/BuildConveyorBelt';
const { ccclass, property } = _decorator;

@ccclass('UIChangeInfoConveyorBelt')
export class UIChangeInfoConveyorBelt extends Component {
    @property(UIBuildConveyorBeltDetail) UIBuildConveyorBeltDetail: UIBuildConveyorBeltDetail;
    @property(ToggleContainer) tgcDirection: ToggleContainer;
    @property(Node) nUIOtherFunc: Node;

    protected onLoad(): void {
        // add event check for list checkbox
        this.tgcDirection.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new UIChangeInfoConveyorBelt.EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIChangeInfoConveyorBelt';
            checkEventHandler.handler = 'onToggleChangeDirection';
            checkEventHandler.customEventData = index.toString();

            tgc.checkEvents.push(checkEventHandler);
        });
    }

    protected onEnable(): void {
        this.UIBuildConveyorBeltDetail.node.active = true;
        this.nUIOtherFunc.active = false;

        // update toggle direction
        const conveyorBeltCom: BuildConveyorBelt = BuildGameSys.Instance.getNConveyorBeltChoicing().getComponent(BuildConveyorBelt);
        this.tgcDirection.toggleItems[conveyorBeltCom.DirectionConveyorBelt].isChecked = true;
    }

    //#region func btn
    private onBtnClose() {
        this.node.active = false;
        BuildGameSys.Instance.UnChoicingConveyorBelt();
    }

    private onBtnDeleteConveyorBelt() {
        this.node.active = false;
        BuildGameSys.Instance.DeleteConveyorBelt();
    }

    private onBtnShowUIDetailInfoConveyorBelt() {
        this.UIBuildConveyorBeltDetail.node.active = true;
        this.nUIOtherFunc.active = false;
    }

    private onBtnShowUIOtherFuncConveyorBelt() {
        this.UIBuildConveyorBeltDetail.node.active = false;
        this.nUIOtherFunc.active = true;
    }

    private onToggleChangeDirection(event: Event, customEventData: string) {
        let nGarageChoicing: Node = BuildGameSys.Instance.getNConveyorBeltChoicing();
        nGarageChoicing.getComponent(BuildConveyorBelt).ChangeDirection(Number.parseInt(customEventData));
    }
    //#endregion func btn
}


