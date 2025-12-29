import { _decorator, Component, EditBox, EventHandler, Node, Toggle, ToggleContainer } from 'cc';
import { GetMColorByNumber } from '../../../Utils/Types';
import { BuildGameSys } from '../../BuildGameSys';
import { BuildCar } from '../../Car/BuildCar';
import { ItemCarOfGarage } from './ItemCarOfGarage';
import { clientEvent } from '../../../framework/clientEvent';
import { MConstBuildGame } from '../../MConstBuildGame';
const { ccclass, property } = _decorator;

@ccclass('UIInfoCarGarage')
export class UIInfoCarGarage extends Component {
    @property(ToggleContainer) tgcColor: ToggleContainer = null;
    @property(ToggleContainer) tgcSize: ToggleContainer = null;
    @property(EditBox) edtIdCarChange: EditBox = null;
    private _cbGetNItemCarOfGarageChoicing: CallableFunction = null;
    private _cbGetNItemCarOfGarageById: CallableFunction = null;

    protected onLoad(): void {
        //register event click
        this.tgcColor.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIInfoCarGarage';
            checkEventHandler.handler = 'onToggleChangeColor2';
            checkEventHandler.customEventData = index.toString();

            tgc.checkEvents.push(checkEventHandler);
        });

        // add event check for list checkbox
        this.tgcSize.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIInfoCarGarage';
            checkEventHandler.handler = 'onToggleChangeSize2';
            let sizeCar: number = 0;
            switch (index) {
                case 0: sizeCar = 4; break;
                case 1: sizeCar = 6; break;
                case 2: sizeCar = 10; break;
            }
            checkEventHandler.customEventData = sizeCar.toString();

            tgc.checkEvents.push(checkEventHandler);
        });
    }

    public SetCallBack(cbSetItemChoice: CallableFunction, cbGetNItemCarOfGarageById: CallableFunction) {
        this._cbGetNItemCarOfGarageChoicing = cbSetItemChoice;
        this._cbGetNItemCarOfGarageById = cbGetNItemCarOfGarageById;
    }

    //#region func Toggle
    public UpdateToggleColor(color: number) {
        let colorChoice = color - 1;
        if (this.tgcColor.toggleItems[colorChoice] == null || this.tgcColor.toggleItems[colorChoice].isChecked) return;
        this.tgcColor.toggleItems[colorChoice].isChecked = true;
    }

    public UpdateToggleSize(size: number) {
        switch (size) {
            case 4: this.tgcSize.toggleItems[0].isChecked = true; break;
            case 6: this.tgcSize.toggleItems[1].isChecked = true; break;
            case 10: this.tgcSize.toggleItems[2].isChecked = true; break;
        }
    }

    private onToggleChangeColor2(event: Event, customEventData: string) {
        this._cbGetNItemCarOfGarageChoicing().OnChangeColor(GetMColorByNumber(Number.parseInt(customEventData) + 1));
    }

    private onToggleChangeSize2(event: Event, customEventData: string) {
        this._cbGetNItemCarOfGarageChoicing().OnChangeSize(Number.parseInt(customEventData));
    }
    //#endregion func Toggle

    //#region func btn
    private ChangeIdCar() {
        // check the input id Car is correct
        if (this.edtIdCarChange.string == "" || this.edtIdCarChange.string == null) return;
        try {
            let idCar: number = Number.parseInt(this.edtIdCarChange.string);
            if (!BuildGameSys.Instance.CheckHasCarId(idCar)) { return; }

            // in case pass
            const nCarChoicing = this._cbGetNItemCarOfGarageChoicing();
            const oldIdCar: number = nCarChoicing.getComponent(ItemCarOfGarage).GetIdCar;
            console.log("oldIdCar", idCar, oldIdCar);
            if (idCar == oldIdCar) return;
            // You need do two thing in here
            // 1 : Update UI ItemCarOfGarage Again
            // 2 : Update Data map car of Garage in ListGarage

            const itemCarOfGarageNeedChange: ItemCarOfGarage = this._cbGetNItemCarOfGarageById(idCar);
            if (itemCarOfGarageNeedChange != null) {
                // update UI
                itemCarOfGarageNeedChange.SetIdCar(oldIdCar);
            }
            nCarChoicing.getComponent(ItemCarOfGarage).SetIdCar(idCar);


            // the BuildGameSys will listen this emit and will to change data
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.SWAP_ID_CAR, idCar, oldIdCar);
        } catch (e) {
            return;
        }
    }
    //#endregion func btn
}


