import { _decorator, Color, Component, EditBox, EventHandler, Label, Node, Sprite, Toggle, ToggleContainer } from 'cc';
import { BuildGameSys } from '../BuildGameSys';
import { BuildCar } from '../Car/BuildCar';
import { MConfigBuildGame } from '../MConfigBuildGame';
import { ConvertJsonSizeBusFrenzyToSizeCar, ConvertSizeCarToJsonBusFrenzy, DIRECT_CAR, IsColorCanShuffle, M_COLOR, TYPE_CAR_SIZE, TYPE_USE_JSON_GROUP } from '../../Utils/Types';
import { clientEvent } from '../../framework/clientEvent';
import { MConstBuildGame } from '../MConstBuildGame';
import { Utils } from '../../Utils/Utils';
import { UIChangeColorLockAndKey } from './Car/UIChangeColorLockAndKey';
import { UINotiRemoveId } from './UINotiRemoveId';
const { ccclass, property } = _decorator;

@ccclass('UIChangeInfoCar')
export class UIChangeInfoCar extends Component {

    @property(Node) nUIDetailInfoCar: Node;
    @property(Node) nUIOtherFunc: Node;
    // @property(TriggerDragNode) triggerDragNode: TriggerDragNode;

    // UI info car
    @property({ group: "UI Info Car", type: ToggleContainer }) tgcColor: ToggleContainer;
    @property({ group: "UI Info Car", type: ToggleContainer }) tgcSize: ToggleContainer;
    @property({ group: "UI Info Car", type: ToggleContainer }) tgcDirection: ToggleContainer;
    @property({ group: "UI Info Car", type: EditBox }) edtIdCarChange: EditBox;
    @property({ group: "UI Info Car", type: Toggle }) toggleIsMysteryCar: Toggle;
    @property({ group: "UI Info Car", type: EditBox }) edtTimeCarCallCooldown: EditBox;
    @property({ group: "UI Info Car", type: Label }) lbTimeCarCallCooldown: Label;
    @property({ group: "UI Info Car", type: EditBox }) edtTimeCarCooldown: EditBox;
    @property({ group: "UI Info Car", type: Label }) lbTimeCarCooldown: Label;
    @property({ group: "UI Info Car", type: Toggle }) toggleIsTwoWayCar: Toggle;
    @property({ group: "UI Info Car", type: EditBox }) edtKeyCar: EditBox;
    @property({ group: "UI Info Car", type: Label }) lbKeyIdCar: Label;
    @property({ group: "UI Info Car", type: Label }) lbLockIdCar: Label;
    @property({ group: "UI Info Car", type: Label }) lbNumCarRemaingCallCooldown: Label;
    @property({ group: "UI Info Car", type: EditBox }) edtNumCarRemaingCallCooldown: EditBox;
    @property({ group: "UI Info Car", type: EditBox }) edtIdCarBlock: EditBox;
    @property({ group: "UI Info Car", type: Label }) lbListIdCarBlock: Label;
    @property(UIChangeColorLockAndKey) nUIChangeColorKeyLock: UIChangeColorLockAndKey;
    @property(UINotiRemoveId) uiNotiRemoveId: UINotiRemoveId;


    private _colorRedEdt: Color = new Color().fromHEX("#FF4E4E");
    private _colorGreenEdt: Color = new Color().fromHEX("#4EFF6A");

    //====================================================
    //#region base
    protected onLoad(): void {
        this.RegisterAllEventsToggle();

        clientEvent.on(MConstBuildGame.EVENT_BUILDING.UPDATE_DIRECT_CAR_UI_INFO, this.updateToggleDirection, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.UPDATE_DIRECT_CAR_UI_INFO, this.updateToggleDirection, this);
    }

    protected onEnable(): void {
        this.nUIChangeColorKeyLock.node.active = false;
    }
    //#endregion base
    //====================================================

    //====================================================
    //#region listen
    private RegisterEventToggleColor() {
        // add event check for list checkbox
        this.tgcColor.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIChangeInfoCar';
            checkEventHandler.handler = 'onToggleChangeColor';
            checkEventHandler.customEventData = index.toString();

            tgc.checkEvents.push(checkEventHandler);
        });
    }

    private UnRegisterEventToggleColor() {
        this.tgcColor.toggleItems.forEach((tgc: Toggle, index: number) => {
            tgc.checkEvents = [];
        })
    }

    private RegisterEventToggleDirection() {
        this.tgcDirection.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIChangeInfoCar';
            checkEventHandler.handler = 'onToggleChangeDirection';
            checkEventHandler.customEventData = index.toString();

            tgc.checkEvents.push(checkEventHandler);
        });
    }

    private UnRegisterEventToggleDirection() {
        this.tgcColor.toggleItems.forEach((tgc: Toggle, index: number) => {
            tgc.checkEvents = [];
        })
    }

    private RegisterEventToggleSize() {
        this.tgcSize.toggleItems.forEach((tgc: Toggle, index: number) => {
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'UIChangeInfoCar';
            checkEventHandler.handler = 'onToggleChangeSize';
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

    private UnRegisterEventToggleSize() {
        this.tgcSize.toggleItems.forEach((tgc: Toggle, index: number) => {
            tgc.checkEvents = [];
        })
    }

    private RegisterAllEventsToggle() {
        this.RegisterEventToggleColor();
        this.RegisterEventToggleDirection();
        this.RegisterEventToggleSize();
        this.nUIChangeColorKeyLock.RegisterClick();
    }

    private UnRegisterAllEventsToggle() {
        this.UnRegisterEventToggleColor();
        this.UnRegisterEventToggleDirection();
        this.UnRegisterEventToggleSize();
        this.nUIChangeColorKeyLock.UnRegisterClick();
    }

    private GetLbShowListIdBlock(listIdCarBlock: number[]): string {
        let result = 'ListIds: ';
        listIdCarBlock.forEach((id, index) => {
            result += id.toString();
            if (index < listIdCarBlock.length - 1) {
                result += ","
            }
        })
        return result;
    }
    //#endregion listen
    //====================================================

    public UpdateVisual() {
        this.nUIDetailInfoCar.active = true;
        this.nUIOtherFunc.active = false;
        this.edtIdCarChange.string = "";
        this.edtTimeCarCallCooldown.string = "";
        this.edtIdCarBlock.string = "";

        //update UI Info Car
        this.UpdateUIInfoCar(BuildGameSys.Instance.getNCarChoicing());
    }

    private UpdateUIInfoCar(nCar: Node) {
        // unRegister event change
        this.UnRegisterAllEventsToggle();

        const carCom: BuildCar = nCar.getComponent(BuildCar);
        // color
        this.tgcColor.toggleItems[carCom.colorCar].isChecked = true;
        // size
        switch (carCom.carSize) {
            case 4: this.tgcSize.toggleItems[0].isChecked = true; break;
            case 6: this.tgcSize.toggleItems[1].isChecked = true; break;
            case 10: this.tgcSize.toggleItems[2].isChecked = true; break;
        }
        // direction
        this.tgcDirection.toggleItems[carCom.directionCar].isChecked = true;
        // mysteryCar
        this.toggleIsMysteryCar.isChecked = carCom.isMysteryCar;
        // car coolDown
        this.edtTimeCarCallCooldown.string = this.lbTimeCarCallCooldown.string = carCom.timeCarCallCoolDown > 0 ? Utils.convertTimeLengthToFormat(carCom.timeCarCallCoolDown) : '';
        this.edtTimeCarCooldown.string = this.lbTimeCarCooldown.string = carCom.timeCarCoolDown > 0 ? Utils.convertTimeLengthToFormat(carCom.timeCarCoolDown) : '';
        this.edtNumCarRemaingCallCooldown.string = this.lbNumCarRemaingCallCooldown.string = carCom.numCarCallCoolDown >= 0 ? carCom.numCarCallCoolDown.toString() : '';

        // id list car block
        this.UpdateUIListIdCarBlock(carCom);

        this.UpdateColorEditCallCooldownTime(Color.WHITE);
        this.UpdateColorEditCooldownTime(Color.WHITE);
        this.UpdateColorEditNumCarCooldown(Color.WHITE);

        // twoWay car
        this.toggleIsTwoWayCar.isChecked = carCom.isTwoWayCar;

        // idCar key
        this.edtIdCarChange.string = this.lbKeyIdCar.string = carCom.idCarKeyOfCarLock >= 0 ? carCom.idCarKeyOfCarLock.toString() : "";
        this.lbLockIdCar.string = carCom.idCarLockOfCarKey >= 0 ? carCom.idCarLockOfCarKey.toString() : "";

        this.lbKeyIdCar.string = carCom.idCarKeyOfCarLock >= 0 ? carCom.idCarKeyOfCarLock.toString() : "";
        this.edtKeyCar.string = carCom.idCarKeyOfCarLock >= 0 ? carCom.idCarKeyOfCarLock.toString() : "";
        if (carCom.idCarKeyOfCarLock >= 0 || carCom.idCarLockOfCarKey >= 0) {
            this.nUIChangeColorKeyLock.ChoiceColorForce(carCom.colorKey_Lock);
        }


        // // update UIToggleForce
        const colorCarNum = carCom.GetInfoToSaveData().carColor - 1;  // subtraction 1 because the color save in json is plus 1
        this.UpdateUIToggleSizeBygColorForce(colorCarNum, false);

        // register event again
        this.RegisterAllEventsToggle();

        // hide UISub
        this.uiNotiRemoveId.node.active = false;
    }


    //===================================================================================
    //#region Force toggleUI
    private UpdateUIToggleSizeBygColorForce(colorCarChoice: number, needUseTempSaveChoice: boolean = true): TYPE_CAR_SIZE {
        let listTypeCarUnlock = [];

        // get old choice
        const indexToggle: number = this.tgcSize.node.children.findIndex(nToggle => {
            const toggleCom = nToggle.getComponent(Toggle);
            return toggleCom.isChecked;
        })

        //save temp choice
        let oldSizeCarChoice: TYPE_CAR_SIZE = ConvertJsonSizeBusFrenzyToSizeCar(indexToggle);
        if (indexToggle == -1) oldSizeCarChoice = TYPE_CAR_SIZE['4_CHO'];

        // check valid choice
        switch (true) {
            case colorCarChoice <= 9:
                listTypeCarUnlock.push(TYPE_CAR_SIZE['4_CHO'], TYPE_CAR_SIZE['6_CHO'], TYPE_CAR_SIZE['10_CHO']);
                break;
            case colorCarChoice == 10: // Police
                listTypeCarUnlock.push(TYPE_CAR_SIZE['4_CHO']);
                break;
            case colorCarChoice == 11: // military
                listTypeCarUnlock.push(TYPE_CAR_SIZE['4_CHO']);
                break;
            case colorCarChoice == 12: // ambulance
                listTypeCarUnlock.push(TYPE_CAR_SIZE['6_CHO']);
                break;
            case colorCarChoice == 13: // fire_truck
                listTypeCarUnlock.push(TYPE_CAR_SIZE['6_CHO']);
                break;
            case colorCarChoice == 14: // reindeer_cart
                listTypeCarUnlock.push(TYPE_CAR_SIZE['4_CHO']);
                break;
        }

        // unRegister of toggle size => unchoice the toggle
        this.UnRegisterEventToggleSize();

        let isHasAnyChange: boolean = false;
        switch (true) {
            case listTypeCarUnlock.length > 0:
                const listIndex: number[] = listTypeCarUnlock.map(itemCheck => ConvertSizeCarToJsonBusFrenzy(itemCheck));
                this.tgcSize.node.children.forEach((item, idx) => {
                    if (listIndex.includes(idx)) {
                        if (!item.active) {
                            isHasAnyChange = true;
                            item.active = true;
                        }
                    } else {
                        if (item.active) {
                            isHasAnyChange = true;
                            item.active = false;
                        }
                    }
                });
                break;
            default:
                // check has any change
                isHasAnyChange = this.tgcSize.node.children.every(item => item.active);
                if (isHasAnyChange) {
                    // unlock all
                    this.tgcSize.node.children.forEach(item => item.active = true);
                }
                break;
        }

        // check the value choice can choice after force
        if (isHasAnyChange && needUseTempSaveChoice) {
            // check valid old car choice
            if (listTypeCarUnlock.length > 0 && !listTypeCarUnlock.includes(oldSizeCarChoice)) {
                oldSizeCarChoice = listTypeCarUnlock[0];
            }

            const indexToggleChoice = ConvertSizeCarToJsonBusFrenzy(oldSizeCarChoice);
            this.tgcSize.node.children[indexToggleChoice].getComponent(Toggle).isChecked = true;
        }

        // register of toggle size => choice the toggle
        this.RegisterEventToggleSize();

        return oldSizeCarChoice;
    }

    private UpdateUIToggleSizeForce(colorCarChoice: number) {
        let typeCarChoice: TYPE_CAR_SIZE = TYPE_CAR_SIZE['4_CHO'];

        switch (true) {
            case colorCarChoice <= 9:
                break;
            case colorCarChoice == 10: // Police
                typeCarChoice = TYPE_CAR_SIZE['4_CHO'];
                break;
            case colorCarChoice == 11: // military
                typeCarChoice = TYPE_CAR_SIZE['4_CHO'];
                break;
            case colorCarChoice == 12: // ambulance
                typeCarChoice = TYPE_CAR_SIZE['6_CHO'];
                break;
            case colorCarChoice == 13: // fire_truck
                typeCarChoice = TYPE_CAR_SIZE['6_CHO'];
                break;
            case colorCarChoice == 14: // reindeer_cart
                typeCarChoice = TYPE_CAR_SIZE['4_CHO'];
                break;
        }

        if (typeCarChoice == null) { return; }
        const indexToggleChoice = ConvertSizeCarToJsonBusFrenzy(typeCarChoice);
        this.tgcSize.node.children[indexToggleChoice].getComponent(Toggle).isChecked = true;
    }

    private UpdateUIListIdCarBlock(carCom: BuildCar = null) {
        if (carCom == null) {
            const nCar = BuildGameSys.Instance.getNCarChoicing()
            carCom = nCar.getComponent(BuildCar);
        }
        // list idCarBlock auto move
        this.lbListIdCarBlock.string = this.GetLbShowListIdBlock(carCom.listIdCarBlock);
    }
    //#endregion Force toggleUI
    //===================================================================================

    private UpdateColorEditCallCooldownTime(color: Color) {
        this.edtTimeCarCallCooldown.node.getComponent(Sprite).color = color;
    }

    private UpdateColorEditCooldownTime(color: Color) {
        this.edtTimeCarCooldown.node.getComponent(Sprite).color = color;
    }

    private UpdateColorEditNumCarCooldown(color: Color) {
        this.edtNumCarRemaingCallCooldown.node.getComponent(Sprite).color = color;
    }

    private UpdateColorEditKeyId(color: Color) {
        this.edtKeyCar.node.getComponent(Sprite).color = color;
    }
    //=======================================================
    //#region func Toggle
    private onToggleChangeColor(event: Event, customEventData: string) {
        if (event["_isChecked"]) {
            let nCarChoice: Node = BuildGameSys.Instance.getNCarChoicing();
            const colorCarChoice = Number.parseInt(customEventData);
            const oldSizeCarChoice: TYPE_CAR_SIZE = this.UpdateUIToggleSizeBygColorForce(colorCarChoice);
            nCarChoice.getComponent(BuildCar).ChangeColor(Number.parseInt(customEventData), oldSizeCarChoice);
        }
    }

    private onToggleChangeSize(event: Event, customEventData: string) {
        if (event["_isChecked"]) {
            let nCarChoice: Node = BuildGameSys.Instance.getNCarChoicing();
            nCarChoice.getComponent(BuildCar).ChangeSize(Number.parseInt(customEventData));
        }
    }

    private onToggleChangeDirection(event: Event, customEventData: string) {
        if (event["_isChecked"]) {
            let nCarChoice: Node = BuildGameSys.Instance.getNCarChoicing();
            nCarChoice.getComponent(BuildCar).ChangeDirection(Number.parseInt(customEventData));
        }
    }

    private onToggleIsMysteryCar(event: Event, customEventData: string) {
        const statusToggle: boolean = this.toggleIsMysteryCar.isChecked;
        let nCarChoice: Node = BuildGameSys.Instance.getNCarChoicing();
        nCarChoice.getComponent(BuildCar).ChangeIsMysteryCar(statusToggle);
    }

    private onToggleIsTwoWayCar(event: Event, customEventData: string) {
        const statusToggle: boolean = this.toggleIsTwoWayCar.isChecked;
        let nCarChoice: Node = BuildGameSys.Instance.getNCarChoicing();
        nCarChoice.getComponent(BuildCar).ChangeIsTwoWayCar(statusToggle);
    }

    private updateToggleDirection(directionCar: DIRECT_CAR) {
        if (directionCar == null) { return; }
        this.tgcDirection.toggleItems[directionCar].isChecked = true;
    }

    private onTextTimeCallCoolDownChanged() {
        this.UpdateColorEditCallCooldownTime(this._colorRedEdt);
    }

    private onTextTimeCooldownChanged() {
        this.UpdateColorEditCooldownTime(this._colorRedEdt);
    }

    private onTextNumCarCooldownChanged() {
        this.UpdateColorEditNumCarCooldown(this._colorRedEdt);
    }

    private onTextIdCarKey() {
        this.UpdateColorEditKeyId(this._colorRedEdt);
    }

    private onBtnSubmitTimeCallCoolDown() {
        // check valid string 
        const timeInput = this.edtTimeCarCallCooldown.string;

        // trong trường hợp input là empty thì sẽ là ko time
        if (timeInput == "") {
            this.UpdateColorEditCallCooldownTime(this._colorGreenEdt);
            const carChoice = BuildGameSys.Instance.getNCarChoicing();
            carChoice.getComponent(BuildCar).SetTimeCarCallCoolDown(-1);
            this.lbTimeCarCallCooldown.string = "";
            return;
        }

        const timeCarSet = Utils.convertFormatStringToTime(timeInput);
        if (timeCarSet != -1 && timeCarSet != null) {
            this.UpdateColorEditCallCooldownTime(this._colorGreenEdt);
            const carChoice = BuildGameSys.Instance.getNCarChoicing();
            carChoice.getComponent(BuildCar).SetTimeCarCallCoolDown(timeCarSet);
            this.lbTimeCarCallCooldown.string = Utils.convertTimeLengthToFormat(timeCarSet);
        }
    }

    private onBtnSubmitNumCarCallCooldown() {
        //check valid string 
        const numCarInput = this.edtNumCarRemaingCallCooldown.string;

        const numCarSet = Number.parseInt(numCarInput);

        try {
            this.UpdateColorEditNumCarCooldown(this._colorGreenEdt);
            const carChoice = BuildGameSys.Instance.getNCarChoicing();
            carChoice.getComponent(BuildCar).SetNumCarCallCoolDown(numCarSet);
            this.lbNumCarRemaingCallCooldown.string = numCarInput;
            return;
        } catch (e) {

        }

        //trong trường hợp input là empty thì sẽ là 0 có xe nào
        if (numCarInput == "") {
            this.UpdateColorEditNumCarCooldown(this._colorGreenEdt);
            const carChoice = BuildGameSys.Instance.getNCarChoicing();
            carChoice.getComponent(BuildCar).SetNumCarCallCoolDown(-1);
            this.lbNumCarRemaingCallCooldown.string = ""
            return;
        }
    }

    private onBtnSubmitTimeCoolDown() {
        // check valid string 
        const timeInput = this.edtTimeCarCooldown.string;

        // trong trường hợp input là empty thì sẽ là ko time
        if (timeInput == "") {
            this.UpdateColorEditCooldownTime(this._colorGreenEdt);
            const carChoice = BuildGameSys.Instance.getNCarChoicing();
            carChoice.getComponent(BuildCar).SetTimeCoolDown(-1);
            this.lbTimeCarCooldown.string = "";
            return;
        }

        const timeCarSet = Utils.convertFormatStringToTime(timeInput);
        if (timeCarSet != -1 && timeCarSet != null) {
            this.UpdateColorEditCooldownTime(this._colorGreenEdt);
            const carChoice = BuildGameSys.Instance.getNCarChoicing();
            carChoice.getComponent(BuildCar).SetTimeCoolDown(timeCarSet);
            this.lbTimeCarCooldown.string = Utils.convertTimeLengthToFormat(timeCarSet);
        }
    }

    private onBtnSubmitIdCarKey() {
        const carChoice = BuildGameSys.Instance.getNCarChoicing();
        const carCom = carChoice.getComponent(BuildCar);
        //check valid string
        const keyIdInput = this.edtKeyCar.string;
        // trong trường hợp input là empty thì sẽ là ko có id key
        if (keyIdInput == "" || keyIdInput == undefined || keyIdInput == null) { console.error("input must an interger") }
        // trong trường hợp xe đã có chìa cũ => bỏ => thông báo chìa bị sai
        const idCarHasKey: number = carCom.idCarKeyOfCarLock;
        if (carCom.idCarKeyOfCarLock >= 0) {
            // trong trường hợp xe đấy là khóa hoặc có chìa rồi thì không cho phép nữa
            const nCarHasKey = BuildGameSys.Instance.GetCarById(idCarHasKey);
            if (nCarHasKey.getComponent(BuildCar).idCarLockOfCarKey || nCarHasKey.getComponent(BuildCar).idCarKeyOfCarLock) {
                console.error("car has key | lock");
            }
        }

        try {
            const numKeyId = Number.parseInt(keyIdInput);
            if (numKeyId < 0) { console.error("Id < 0") }
            if (!BuildGameSys.Instance.CheckHasCarId(numKeyId)) { console.error("not found id car") }
            if (carCom.IDCar == numKeyId) { console.error("can not self to the car key") }

            this.UpdateColorEditKeyId(this._colorGreenEdt);
            carCom.SetColorKeyLock(this.nUIChangeColorKeyLock.GetColorKeyLockNow());
            carCom.SetIdCarKey(numKeyId);
            this.lbKeyIdCar.string = keyIdInput;
            // emit event để BuildCar lock dc cập nhật idCarLock of car key
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.UPDATE_ID_CAR_LOCK, numKeyId, carCom.IDCar, carCom.colorKey_Lock);
        } catch (e) {
            console.error("bug submit id car key: ", e);
        }
    }
    //#endregion func Toggle
    //=======================================================

    //=======================================================
    //#region func btn
    private onBtnClose() {
        this.node.active = false;
        BuildGameSys.Instance.UnChoicingCar();
    }

    private onBtnDeleteCar() {
        this.node.active = false;
        BuildGameSys.Instance.DeleteCar();
    }

    private onBtnShowUIDetailInfoCar() {
        this.nUIDetailInfoCar.active = true;
        this.nUIOtherFunc.active = false;
    }

    private onBtnShowUIOtherFunc() {
        this.nUIDetailInfoCar.active = false;
        this.nUIOtherFunc.active = true;
    }

    private onBtnEmitCheckCollider() {
        // use raycast like carMove than emit all car block
        BuildGameSys.Instance.NCarChoicing.getComponent(BuildCar).debugColliderCarWhenBuild.ShoutRayCastCheckCarBlock();
    }

    private onBtnEmitCheckCarSameGroup() {
        // get the car choicing and find the list of group has that id Car
        let nCarChoice: Node = BuildGameSys.Instance.getNCarChoicing();
        if (nCarChoice == null || MConfigBuildGame.jsonLevelImport.Group == null) return;

        let idCar: number = nCarChoice.getComponent(BuildCar).IDCar;
        let listIdsCarSameGroup: number[] = [];
        MConfigBuildGame.jsonLevelImport.Group.some(group => {
            if (group.typeUse == TYPE_USE_JSON_GROUP.USE_FIRST) {
                group.listGroups.some(listGroup => {
                    if (listGroup.indexOf(idCar) != -1) {
                        listIdsCarSameGroup.push(...listGroup);
                        return true;
                    }
                })
            }

            if (listIdsCarSameGroup.length > 0) return true;
        })

        if (listIdsCarSameGroup.length > 0) {
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_CAR_SAME_GROUP, listIdsCarSameGroup);
        }
    }

    private OnBtnNotiCarHasKey() {
        const carChoice: Node = BuildGameSys.Instance.NCarChoicing;
        const idCarHasKey = carChoice.getComponent(BuildCar).idCarKeyOfCarLock;
        clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_ARROW_CAR_HAS_KEY, idCarHasKey);
    }

    private OnBtnNotiCarHasLock() {
        const carChoice: Node = BuildGameSys.Instance.NCarChoicing;
        const idCarHasLock = carChoice.getComponent(BuildCar).idCarLockOfCarKey;
        clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.NOTIFICATION_ARROW_CAR_HAS_LOCK, idCarHasLock);
    }

    private onBtnClearIdKeyAndLock() {
        const carChoice: Node = BuildGameSys.Instance.NCarChoicing;
        const comBuildCar: BuildCar = carChoice.getComponent(BuildCar);
        const idCarHasKey = comBuildCar.idCarKeyOfCarLock;
        const idCarHasLock = comBuildCar.idCarLockOfCarKey;
        comBuildCar.SetIdCarKey(-1);
        comBuildCar.SetIdCarLock(-1);
        comBuildCar.UpdateUICar();

        this.lbKeyIdCar.string = this.lbLockIdCar.string = '';
        if (idCarHasKey > -1) {
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.REMOVE_ID_CAR_LOCK, idCarHasKey);
        } else if (idCarHasLock > -1) {
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.REMOVE_ID_CAR_KEY, idCarHasLock);
        }
    }

    private ChangeIdCar() {
        // check the input id Car is correct
        if (this.edtIdCarChange.string == "" || this.edtIdCarChange.string == null) return;
        try {
            let idCar: number = Number.parseInt(this.edtIdCarChange.string);
            if (!BuildGameSys.Instance.CheckHasCarId(idCar)) { return; }

            // in case pass
            const oldIdCar: number = BuildGameSys.Instance.NCarChoicing.getComponent(BuildCar).IDCar;
            // console.log("oldIdCar", idCar, oldIdCar);
            if (idCar == oldIdCar) return;
            // the BuildCar , ListGarage , ListConveyorBelt will listen this emit
            clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.SWAP_ID_CAR, idCar, oldIdCar);
        } catch (e) {
            return;
        }
    }

    private onBtnShowUIChangeColorLockAndKey() {
        this.nUIChangeColorKeyLock.node.active = !this.nUIChangeColorKeyLock.node.active;
    }

    private OnEditIdCarBlock() {
        const input = this.edtIdCarBlock.string;
        // reset idCarBlock
        this.edtIdCarBlock.string = '';

        // kiểm tra id nhập có valid hay không
        const parsedInput = Number.parseInt(input);
        if (input == null || !Number.isSafeInteger(parsedInput)) { console.error("wrong in here"); return; }

        // ở đây sẽ có 2 trường hợp đó là id đã nhập đã tồn tại trong danh sách, hoặc id đã nhập chưa tồn tại trong danh sách
        // lấy xe đã chọn
        const carChoice = BuildGameSys.Instance.getNCarChoicing();
        const carCom = carChoice.getComponent(BuildCar);
        const idCarAdd: number = Number.parseInt(input);
        if (!carCom.IsExitsIdBlock(idCarAdd)) {
            carCom.AddIdBlock(idCarAdd);
            // update UI
            this.UpdateUIListIdCarBlock(carCom);
        } else {
            this.uiNotiRemoveId.node.active = true;
            this.uiNotiRemoveId.Show(idCarAdd, () => {
                carCom.RemoveIdBlock(idCarAdd);
                // update UI
                this.UpdateUIListIdCarBlock(carCom);
            })
        }
    }

    private OnBtnResetBlockId() {
        try {
            const carChoice = BuildGameSys.Instance.getNCarChoicing();
            const carCom = carChoice.getComponent(BuildCar);
            carCom.ClearListIdBlock();
            this.UpdateUIListIdCarBlock(carCom);
        } catch (e) {
            console.error(e);
        }
    }
    //#endregion func btn
    //=======================================================
}


