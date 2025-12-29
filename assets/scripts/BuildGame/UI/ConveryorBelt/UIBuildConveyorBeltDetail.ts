import { _decorator, Component, EditBox, error, EventHandler, instantiate, Node, Prefab, Toggle, ToggleContainer, Vec3 } from 'cc';
import { ConvertSizeCarFromJsonToNumber, GetMColorByNumber, JsonCar, JsonConveyorBelt, M_COLOR } from '../../../Utils/Types';
import { ItemCarOfConveyorBelt } from './ItemCarOfConveyorBelt';
import { BuildGameSys } from '../../BuildGameSys';
import { BuildConveyorBelt } from '../../ConveyorBelt/BuildConveyorBelt';
import { UIInfoCarConveyorBelt } from './UIInfoCarConveyorBelt';
import { clientEvent } from '../../../framework/clientEvent';
import { MConstBuildGame } from '../../MConstBuildGame';
const { ccclass, property } = _decorator;

@ccclass('UIBuildConveyorBeltDetail')
export class UIBuildConveyorBeltDetail extends Component {
    @property(UIInfoCarConveyorBelt) UIInfoCarConveyorBelt: UIInfoCarConveyorBelt

    // for change indexCar
    @property(EditBox) edtBox: EditBox;

    // scrollView
    @property(Prefab) pfItemConveyorBelt: Prefab;
    @property(Node) nContain: Node;

    private _itemChoice: ItemCarOfConveyorBelt = null;

    protected onLoad(): void {
        this.UIInfoCarConveyorBelt.SetCallBack(this.GetItemChoice.bind(this), this.GetItemById.bind(this));
    }

    protected onEnable(): void {
        // turn off UIInfoCarGarage
        this.ChoiceItem(null);

        const nConveyorBelt: Node = BuildGameSys.Instance.getNConveyorBeltChoicing();

        if (nConveyorBelt != null) {
            this.UpdateUIInfoConveyorBelt(nConveyorBelt);
        }
    }

    private UpdateUIInfoConveyorBelt(nConveyorBelt: Node, indexItemChoice: number = -1) {
        // clear all old item
        this.nContain.removeAllChildren();

        let idConveyorBelt: number = nConveyorBelt.getComponent(BuildConveyorBelt).IDBuildConveyerBelt;

        // get data car of garage choice 
        let dataCarsOfConveyorBelt: JsonCar[] = BuildGameSys.Instance.listConveyorBeltSys.mapDataCarInConveyorBelt.get(idConveyorBelt);
        dataCarsOfConveyorBelt.forEach((jsonCar: JsonCar) => {
            this.GenCar(jsonCar);
        })

        // then try choice the first car of list
        this.ChoiceItem(this.nContain.children[indexItemChoice == -1 ? this.nContain.children.length - 1 : indexItemChoice]);
    }

    private GetItemChoice(): ItemCarOfConveyorBelt {
        return this._itemChoice;
    }

    private GetItemById(idCar: number): ItemCarOfConveyorBelt {
        let nFind: Node = this.nContain.children.find(item =>
            item.getComponent(ItemCarOfConveyorBelt).GetIdCar == idCar
        )

        console.log("GetItemById", idCar, nFind);

        if (nFind != null)
            return nFind.getComponent(ItemCarOfConveyorBelt);
        else
            return null;
    }

    private ChoiceItem(nItemChoice: Node) {
        if (nItemChoice != null) {
            this._itemChoice = nItemChoice.getComponent(ItemCarOfConveyorBelt);
            this._itemChoice.ChoiceThisCar();
            const IdItemChoice = this._itemChoice.GetIdCar;

            this.nContain.children.forEach((item) => {
                if (item != null) {
                    item.getComponent(ItemCarOfConveyorBelt).UnChoiceThisCar(IdItemChoice)
                }
            })

            this.UIInfoCarConveyorBelt.node.active = true;
            this.UIInfoCarConveyorBelt.UpdateToggleColor(this._itemChoice.GetInfo().carColor);
            this.UIInfoCarConveyorBelt.UpdateToggleSize(this._itemChoice.GetInfo().carSize);
        } else {
            this._itemChoice = null;
            this.UIInfoCarConveyorBelt.node.active = false;
        }
    }

    private GenCar(jsonCar: JsonCar): Node {
        // get the lengthCarOfConveyorBelt
        let nItemConveyorBelt: Node = instantiate(this.pfItemConveyorBelt);
        nItemConveyorBelt.getComponent(ItemCarOfConveyorBelt).Init(this.ChoiceItem.bind(this), jsonCar.idCar, jsonCar);
        this.nContain.addChild(nItemConveyorBelt);
        return nItemConveyorBelt;
    }

    //#region func btn
    public onBtnAddCar() {
        let nConveyorBelt: Node = BuildGameSys.Instance.getNConveyorBeltChoicing();

        let defaultData: JsonCar = {
            idCar: BuildGameSys.Instance.listCarBuildSys.GetAutoIdEntities(),
            carColor: 1,
            carDirection: 0,
            carPosition: Vec3.ZERO,
            carSize: 4,
            isMysteryCar: false
        }

        //update group
        BuildGameSys.Instance.groupSys.UpdateGroup("add", nConveyorBelt.getComponent(BuildConveyorBelt).IDBuildConveyerBelt);

        // gen item Car
        const idCarCreate: number = nConveyorBelt.getComponent(BuildConveyorBelt).AddCarToConveyorBeltCars(defaultData);
        // update UI
        this.GenCar(defaultData);
    }

    public onBtnRemoveCar() {
        if (this._itemChoice != null) {
            let nConveyorChoicing: Node = BuildGameSys.Instance.getNConveyorBeltChoicing();
            const idCarRemove: number = this._itemChoice.GetIdCar;
            nConveyorChoicing.getComponent(BuildConveyorBelt).RemoveCarOfConveyorBeltCars(this._itemChoice.GetIdCar);

            //update group
            BuildGameSys.Instance.groupSys.UpdateGroup("delete", idCarRemove);

            // destroy item
            this._itemChoice.node.destroy();
            this._itemChoice == null;
            // not choice any item
            this.ChoiceItem(null);
        }
    }

    public onBtnMoveItemToSiblignIndex(index: number) { this.ChangeSiblingIndex(index); }

    public onBtnMoveItemToLeft() {
        // check valid trong này nếu như item move left đang là item đầu tiên
        const itemChoicing = this.GetItemChoice();
        const indexItemChoicing = this.nContain.children.indexOf(itemChoicing.node);
        if (indexItemChoicing == this.nContain.children.length) {
            console.warn("can not left item any more", indexItemChoicing);
        }

        this.ChangeSiblingIndex(-1);
    }

    public onBtnMoveItemToRight() {
        // check valid trong này nếu như item move right đang là item cuối cùng
        const itemChoicing = this.GetItemChoice();
        const indexItemChoicing = this.nContain.children.indexOf(itemChoicing.node);
        if (indexItemChoicing == 0) {
            console.warn("can not right item any more", indexItemChoicing);
        }

        this.ChangeSiblingIndex(1);
    }

    private ChangeSiblingIndex(diffSiblingChange: number) {
        if (this._itemChoice != null) {
            const oldSiblingIndex: number = this._itemChoice.node.getSiblingIndex();
            const newSiblingIndex: number = oldSiblingIndex - diffSiblingChange;
            const idItemChoice: number = this._itemChoice.GetIdCar;
            const idItemChange: number = this.nContain.children[oldSiblingIndex - diffSiblingChange].getComponent(ItemCarOfConveyorBelt).GetIdCar;
            // set the data
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.SWAP_ID_CAR, idItemChoice, idItemChange);
            // call update UI again
            this.UpdateUIInfoConveyorBelt(BuildGameSys.Instance.getNConveyorBeltChoicing(), newSiblingIndex);
            // set the UI
            // ChangeSiblingIndex(this._itemChoice.node, oldSiblingIndex, -diffSiblingChange);
        }
    }
    //#endregion func btn
}

function ChangeSiblingIndex(nChange: Node, diffSiblingChange: number) {
    const sibNow = nChange.getSiblingIndex();
    if (sibNow + diffSiblingChange < 0) { nChange.setSiblingIndex(0); return; }
    if (sibNow + diffSiblingChange >= nChange.parent.children.length) { nChange.setSiblingIndex(nChange.parent.children.length - 1); return; }
    nChange.setSiblingIndex(sibNow + diffSiblingChange);
}




