import { _decorator, Component, EditBox, error, instantiate, Node, Prefab, Vec3 } from 'cc';
import { UIInfoCarGarage } from './UIInfoCarGarage';
import { ItemCarOfGarage } from './ItemCarOfGarage';
import { BuildGameSys } from '../../BuildGameSys';
import { ConvertSizeCarFromJson, ConvertSizeCarFromJsonToNumber, JsonCar, JsonGarage } from '../../../Utils/Types';
import { BuildGarage } from '../../Garage/BuildGarage';
import { clientEvent } from '../../../framework/clientEvent';
import { MConstBuildGame } from '../../MConstBuildGame';
const { ccclass, property } = _decorator;

@ccclass('UIBuildGarageDetail')
export class UIBuildGarageDetail extends Component {
    @property(UIInfoCarGarage) UIInfoCarGarage: UIInfoCarGarage

    // for change indexCar
    @property(EditBox) edtBoxSibling: EditBox;

    // scrollView
    @property(Prefab) pfItemGarage: Prefab;
    @property(Node) nContain: Node;

    private _itemChoice: ItemCarOfGarage = null;

    protected onLoad(): void {
        this.UIInfoCarGarage.SetCallBack(this.GetItemChoice.bind(this), this.GetItemById.bind(this));
    }

    protected onEnable(): void {
        // turn off UIInfoCarGarage
        this.ChoiceItem(null);

        const nGarage: Node = BuildGameSys.Instance.getNGarageChoicing();

        if (nGarage != null) {
            this.UpdateUIInfoGarage(nGarage);
        }
    }

    private UpdateUIInfoGarage(nGarage: Node, indexItemChoice: number = -1) {
        // clear all old item
        this.nContain.removeAllChildren();

        let idBuildGarage: number = nGarage.getComponent(BuildGarage).IDBuildGarage;

        // get data car of garage choice 
        let dataCarsOfGarage: JsonCar[] = BuildGameSys.Instance.listGarageSys.mapDataCarInGarage.get(idBuildGarage);
        dataCarsOfGarage.forEach((jsonCar: JsonCar) => {
            this.GenCar(jsonCar);
        })

        // then try choice the first car of list
        this.ChoiceItem(this.nContain.children[indexItemChoice == -1 ? this.nContain.children.length - 1 : indexItemChoice]);
    }

    private GetItemChoice(): ItemCarOfGarage {
        return this._itemChoice;
    }

    private GetItemById(idCar: number): ItemCarOfGarage {
        let nFind: Node = this.nContain.children.find(item =>
            item.getComponent(ItemCarOfGarage).GetIdCar == idCar
        )

        console.log("GetItemById", idCar, nFind);

        if (nFind != null)
            return nFind.getComponent(ItemCarOfGarage);
        else
            return null;
    }

    private ChoiceItem(nItemChoice: Node) {
        if (nItemChoice != null) {
            this._itemChoice = nItemChoice.getComponent(ItemCarOfGarage);
            this._itemChoice.ChoiceThisCar();
            const IdItemChoice = this._itemChoice.GetIdCar;

            this.nContain.children.forEach((item) => {
                if (item != null) {
                    item.getComponent(ItemCarOfGarage).UnChoiceThisCar(IdItemChoice)
                }
            })

            this.UIInfoCarGarage.node.active = true;
            this.UIInfoCarGarage.UpdateToggleColor(this._itemChoice.GetNumColorCar());
            this.UIInfoCarGarage.UpdateToggleSize(ConvertSizeCarFromJsonToNumber(this._itemChoice.GetSizeCar()));
        } else {
            this._itemChoice = null;
            this.UIInfoCarGarage.node.active = false;
        }
    }

    private GenCar(jsonCar: JsonCar): Node {
        // get the lengthCarOfConveyorBelt
        let nItemGarage: Node = instantiate(this.pfItemGarage);
        nItemGarage.getComponent(ItemCarOfGarage).Init(this.ChoiceItem.bind(this), jsonCar.idCar, jsonCar);
        this.nContain.addChild(nItemGarage);
        return nItemGarage;
    }

    //#region func btn
    public onBtnAddCar() {
        let nGarage: Node = BuildGameSys.Instance.getNGarageChoicing();

        let defaultData: JsonCar = {
            idCar: BuildGameSys.Instance.listCarBuildSys.GetAutoIdEntities(),
            carColor: 1,
            carDirection: 0,
            carPosition: Vec3.ZERO,
            carSize: 4,
            isMysteryCar: false,
        }

        //update group
        BuildGameSys.Instance.groupSys.UpdateGroup("add", nGarage.getComponent(BuildGarage).IDBuildGarage);

        // gen item Car
        const idCarCreate: number = nGarage.getComponent(BuildGarage).AddCarToGarageCars(defaultData);
        // update UI
        this.GenCar(defaultData);
    }

    public onBtnRemoveCar() {
        if (this._itemChoice != null) {
            let nGarageChoicing: Node = BuildGameSys.Instance.getNGarageChoicing();
            const idCarGarage: number = this._itemChoice.GetIdCar
            nGarageChoicing.getComponent(BuildGarage).RemoveCarOfGarageCars(this._itemChoice.GetIdCar);

            //update group
            BuildGameSys.Instance.groupSys.UpdateGroup("delete", idCarGarage);

            // destroy item
            this._itemChoice.node.destroy();
            this._itemChoice == null;
            // not choice any item
            this.ChoiceItem(null);
        }
    }

    public onBtnMoveItemToSiblingIndex(index: number) { this.ChangeSiblingIndex(index); }

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
            const idItemChange: number = this.nContain.children[oldSiblingIndex - diffSiblingChange].getComponent(ItemCarOfGarage).GetIdCar;
            // set the data
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.SWAP_ID_CAR, idItemChoice, idItemChange);
            // call update UI again
            this.UpdateUIInfoGarage(BuildGameSys.Instance.getNGarageChoicing(), newSiblingIndex);
            // set the UI
            // ChangeSiblingIndex(this._itemChoice.node, oldSiblingIndex, -diffSiblingChange);
        }
    }
    //#endregion func btn
}

function ChangeSiblingIndex(nChange: Node, oldSiblingIndex: number, diffSiblingChange: number) {
    if (oldSiblingIndex + diffSiblingChange < 0) { nChange.setSiblingIndex(0); return; }
    if (oldSiblingIndex + diffSiblingChange >= nChange.parent.children.length) { nChange.setSiblingIndex(nChange.parent.children.length - 1); return; }
    nChange.setSiblingIndex(oldSiblingIndex + diffSiblingChange);
}

