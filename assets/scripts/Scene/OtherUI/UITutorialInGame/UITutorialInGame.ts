import { _decorator, CCFloat, Label, Node, RealCurve, RichText, Sprite, SpriteFrame, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { LEVEL_TUT_IN_GAME } from './TypeTutorialInGame';
import { DataItemSys } from '../../DataItemSys';
import { GameSoundEffect, TYPE_ITEM, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import { SoundSys } from '../../../Common/SoundSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { SupTutNormalBus } from './SupTutNormalBus';
const { ccclass, property } = _decorator;

@ccclass('UITutorialInGame')
export class UITutorialInGame extends UIBaseSys {
    private _typeTutInGame: LEVEL_TUT_IN_GAME = null;
    private _cbCallWhenClose: CallableFunction = null;
    @property(CCFloat) timeDelayShowContinue: number = 1;
    @property(CCFloat) timeRecieveItem: number = 1.5;
    @property(CCFloat) timeHideShadow: number = 1;

    @property(Sprite) spIcon: Sprite;
    @property(Label) lbTitle: Label;
    @property(Label) lbTitleShadow: Label;
    @property(Label) content_1: Label;
    @property(Label) content_1_shadow: Label;
    @property(Label) content_2: Label;
    @property(Label) content_2_shadow: Label;
    @property(RichText) rtContent2: RichText;
    @property(Node) nBgListenClick: Node;
    @property(Node) nTutBusNormal: Node;

    @property({ group: "resources" }) scale_Sort = new Vec3(1, 1, 1);
    @property({ group: "resources", type: SpriteFrame }) sfMysteryCar: SpriteFrame;
    @property({ group: "resources" }) scale_MysteryCar = new Vec3(1, 1, 1);
    @property({ group: "resources" }) scale_Shuffle = new Vec3(1, 1, 1);
    @property({ group: "resources" }) scale_Vip = new Vec3(1, 1, 1);
    @property({ group: "resources", type: SpriteFrame }) sfGarage: SpriteFrame;
    @property({ group: "resources" }) scale_Garage = new Vec3(1, 1, 1);
    @property({ group: "resources", type: SpriteFrame }) sfConveyorBelt: SpriteFrame;
    @property({ group: "resources" }) scale_ConveyorBelt = new Vec3(1, 1, 1);

    @property({ group: "UI", type: Node }) nUIBlock: Node;
    @property({ group: "UI", type: Node }) nUIItem: Node;

    @property(RealCurve) cr1_x: RealCurve = new RealCurve();
    @property(RealCurve) cr1_y: RealCurve = new RealCurve();
    @property(RealCurve) crScale: RealCurve = new RealCurve();

    @property(InfoUIBase) infoUIBaseAmbulance: InfoUIBase;
    @property(InfoUIBase) infoUIBaseFireTruck: InfoUIBase;
    @property(InfoUIBase) infoUIBaseTwoWay: InfoUIBase;
    @property(InfoUIBase) infoUIBaseLockAndKey: InfoUIBase;

    @property(SupTutNormalBus) supTutNormalBus: SupTutNormalBus;

    private readonly COLOR_YELLOW = "#FEDD26";

    public async PrepareDataShow(): Promise<void> {
        // check dataCustom to know which UI Show

        this.nBgListenClick.active = false;

        if (this._dataCustom != null && this._dataCustom.typeTutPopUp != null) {
            if (this._dataCustom.typeTutPopUp != null) this._typeTutInGame = this._dataCustom.typeTutPopUp;
            if (this._dataCustom.cbCloseUI != null) this._cbCallWhenClose = this._dataCustom.cbCloseUI;
        }

        this.SetUI(this._typeTutInGame);

        // turn off nUIBlock
        // turn on nUIItem
        this.nUIBlock.active = false;
    }

    public async UIShowDone(): Promise<void> {
        await Utils.delay(this.timeDelayShowContinue * 1000);
        switch (this._typeTutInGame) {
            case LEVEL_TUT_IN_GAME.SORT: case LEVEL_TUT_IN_GAME.MYSTERY_CAR: case LEVEL_TUT_IN_GAME.CONVEYOR_BELT:
            case LEVEL_TUT_IN_GAME.GARAGE: case LEVEL_TUT_IN_GAME.SHUFFLE: case LEVEL_TUT_IN_GAME.VIP_SLOT:
            case LEVEL_TUT_IN_GAME.MILITARY: case LEVEL_TUT_IN_GAME.POLICE:
                this.nBgListenClick.active = true;
                break;
            case LEVEL_TUT_IN_GAME.AMBULANCE: case LEVEL_TUT_IN_GAME.CAR_TWO_WAY: case LEVEL_TUT_IN_GAME.KEY_LOCK:
            case LEVEL_TUT_IN_GAME.FIRE_TRUCK:
                break;
        }
    }

    public async UICloseDone(): Promise<void> {
        if (this._cbCallWhenClose) {
            this._cbCallWhenClose();
        }
    }

    private btnClose() {
        LogEventManager.Instance.logButtonClick(`tap_to_continue`, "UITutorialInGame");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TUTORIAL_IN_GAME, 2);
    }

    private SetUI(typeTutUI: LEVEL_TUT_IN_GAME) {
        if (typeTutUI == null) return;

        // unActive all node need
        this.nUIItem.active = false;
        this.infoUIBaseAmbulance.node.active = false;
        this.infoUIBaseLockAndKey.node.active = false;
        this.infoUIBaseTwoWay.node.active = false;

        async function LoadThenSetUpItemBig(sp: Sprite, typeItem: TYPE_PRIZE) {
            try {
                const sf = await MConfigResourceUtils.getImageItemBig(typeItem, TYPE_RECEIVE.NUMBER);
                sp.spriteFrame = sf;
            } catch (e) {

            }
        }

        this.supTutNormalBus.node.active = false;

        switch (typeTutUI) {
            case LEVEL_TUT_IN_GAME.SORT:
                LoadThenSetUpItemBig(this.spIcon, TYPE_PRIZE.SORT);
                this.spIcon.node.scale = this.scale_Sort;
                this.lbTitle.string = this.lbTitleShadow.string = "SORT !";
                this.content_1.string = this.content_1_shadow.string = "New booster unlocked!";
                this.content_2.string = this.content_2_shadow.string = "";
                // this.content_2.string = this.content_2_shadow.string = "Sort the PASSENGERS\naccording to vehicles colors";
                this.rtContent2.string = `<color=${this.COLOR_YELLOW}>Sort</color> the <color=${this.COLOR_YELLOW}>PASSENGERS</color>\naccording to vehicles colors`

                this.nUIItem.active = true; this.nUIItem.getComponent(UIOpacity).opacity = 255;
                break;
            case LEVEL_TUT_IN_GAME.MYSTERY_CAR:
                this.spIcon.spriteFrame = this.sfMysteryCar;
                this.spIcon.node.scale = this.scale_MysteryCar;
                this.lbTitle.string = this.lbTitleShadow.string = "MYSTERY CAR !";
                this.content_1.string = this.content_1_shadow.string = "New item unlocked!";
                this.content_2.string = this.content_2_shadow.string = "";
                this.rtContent2.string = '';

                this.nUIItem.active = true; this.nUIItem.getComponent(UIOpacity).opacity = 255;
                break;
            case LEVEL_TUT_IN_GAME.SHUFFLE:
                LoadThenSetUpItemBig(this.spIcon, TYPE_PRIZE.SHUFFLE);
                this.spIcon.node.scale = this.scale_Shuffle;
                this.lbTitle.string = this.lbTitleShadow.string = "SHUFFLE !";
                this.content_1.string = this.content_1_shadow.string = "New booster unlocked!";
                this.content_2.string = this.content_2_shadow.string = "";
                // this.content_2.string = this.content_2_shadow.string = "Rearrange the COLOR of the\nvehicle in parking lot";
                this.rtContent2.string = `<color=${this.COLOR_YELLOW}>Rearrange</color> the <color=${this.COLOR_YELLOW}>COLOR</color> of the\nvehicle in parking lot`;

                this.nUIItem.active = true; this.nUIItem.getComponent(UIOpacity).opacity = 255;
                break;
            case LEVEL_TUT_IN_GAME.VIP_SLOT:
                LoadThenSetUpItemBig(this.spIcon, TYPE_PRIZE.VIP_SLOT);
                this.spIcon.node.scale = this.scale_Vip;
                this.lbTitle.string = this.lbTitleShadow.string = "VIP !";
                this.content_1.string = this.content_1_shadow.string = "New booster unlocked!";
                this.content_2.string = this.content_2_shadow.string = "";
                // this.content_2.string = this.content_2_shadow.string = "Move any Car\nto VIP parking space";
                this.rtContent2.string = `<color=${this.COLOR_YELLOW}>Move</color> any <color=${this.COLOR_YELLOW}>Car</color>\nto VIP parking space`;

                this.nUIItem.active = true; this.nUIItem.getComponent(UIOpacity).opacity = 255;
                break;
            case LEVEL_TUT_IN_GAME.GARAGE:
                this.spIcon.spriteFrame = this.sfGarage;
                this.spIcon.node.scale = this.scale_Garage;
                this.lbTitle.string = this.lbTitleShadow.string = "GARAGE !";
                this.content_1.string = this.content_1_shadow.string = "New item unlocked!";
                this.content_2.string = this.content_2_shadow.string = "";
                this.rtContent2.string = "";

                this.nUIItem.active = true; this.nUIItem.getComponent(UIOpacity).opacity = 255;
                break;
            case LEVEL_TUT_IN_GAME.CONVEYOR_BELT:
                this.spIcon.spriteFrame = this.sfConveyorBelt;
                this.spIcon.node.scale = this.scale_ConveyorBelt;
                this.lbTitle.string = this.lbTitleShadow.string = "CONVEYOR BELT !";
                this.content_1.string = this.content_1_shadow.string = "New item unlocked!";
                this.content_2.string = this.content_2_shadow.string = "";
                this.rtContent2.string = "";

                this.nUIItem.active = true; this.nUIItem.getComponent(UIOpacity).opacity = 255;
                break;
            case LEVEL_TUT_IN_GAME.CAR_TWO_WAY:
                this.infoUIBaseTwoWay.registerCallback(() => { this.AnimReceivePrize() })
                this.infoUIBaseTwoWay.Show();
                break;
            case LEVEL_TUT_IN_GAME.KEY_LOCK:
                this.infoUIBaseLockAndKey.registerCallback(() => { this.AnimReceivePrize() })
                this.infoUIBaseLockAndKey.Show();
                break;
            case LEVEL_TUT_IN_GAME.AMBULANCE:
                this.infoUIBaseAmbulance.registerCallback(() => { this.AnimReceivePrize() })
                this.infoUIBaseAmbulance.Show();
                break;
            case LEVEL_TUT_IN_GAME.FIRE_TRUCK:
                this.infoUIBaseFireTruck.registerCallback(() => { this.AnimReceivePrize() })
                this.infoUIBaseFireTruck.Show();
                break;
            case LEVEL_TUT_IN_GAME.POLICE:
                this.spIcon.node.active = false;
                this.nUIItem.active = false;
                this.supTutNormalBus.PreShow('Police');
                this.supTutNormalBus.Show();
                this.supTutNormalBus.infoUIBase.registerCallback(() => { this.AnimReceivePrize() });
                this.supTutNormalBus.infoUIBase.Show();
                break;
            case LEVEL_TUT_IN_GAME.MILITARY:
                this.nUIItem.active = false;
                this.spIcon.node.active = false;
                this.supTutNormalBus.PreShow('Military');
                this.supTutNormalBus.Show();
                this.supTutNormalBus.infoUIBase.registerCallback(() => { this.AnimReceivePrize() });
                this.supTutNormalBus.infoUIBase.Show();
                break;
        }
    }

    private async AnimReceivePrize() {
        // check typeUI
        // if is booster => anim booster
        // get endWPos booster
        // Beizer receive anim
        // move prize to endWPos by Beizer
        // close UI

        switch (this._typeTutInGame) {
            case LEVEL_TUT_IN_GAME.VIP_SLOT: case LEVEL_TUT_IN_GAME.SHUFFLE: case LEVEL_TUT_IN_GAME.SORT:
                // ẩn giao diện + tắt shadow đi nhưng vẫn phải bật block lên để ko click đc
                this.nUIBlock.active = true;
                HideOpacity(this.nUIItem, this.timeHideShadow / 2);
                // hide shadow too
                this.HideShadow(true, this.timeHideShadow / 2);
                clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_GAME, true, this.timeHideShadow);
                await animBooster(this._typeTutInGame, this.spIcon.node, this.cr1_x, this.cr1_y, this.crScale, this.timeRecieveItem);
                this.nUIBlock.active = false;
                break;
        }

        this.btnClose();
    }

    //============================================
    //#region Tut police + militayr
    private PreShowTutPoliceAndMilitary() {
        this.nUIItem.active = false;
        this.spIcon.node.active = false;
        this.nTutBusNormal.active = true;

        // dựa vào type ta sẽ quyết định text và ảnh
    }
    //#endregion Tut police + military
    //============================================
}

async function HideOpacity(target: Node, time: number) {
    Tween.stopAllByTarget(target);
    const opa = target.getComponent(UIOpacity);
    if (opa == null) return;
    tween(opa)
        .to(time, { opacity: 0 })
        .start();
}

async function animBooster(typeTutUI: LEVEL_TUT_IN_GAME, nIconMove: Node, curveX: RealCurve, curveY: RealCurve, curveScale: RealCurve, timeReceiveItem: number = 0.5) {
    let wPosEnd: Vec3 = new Vec3();
    let waitLogic: boolean = false;

    waitLogic = true;
    clientEvent.dispatchEvent(MConst.EVENT.GET_WPOS_BOOSTER, typeTutUI, (wPosEndReceive: Vec3) => {
        waitLogic = false;
        wPosEnd = wPosEndReceive;
    })

    await Utils.WaitReceivingDone(() => !waitLogic);

    const wPosStart: Vec3 = nIconMove.worldPosition.clone();

    const distanceX = wPosEnd.x - wPosStart.x;
    const distanceY = wPosEnd.y - wPosStart.y;
    const scaleNow = nIconMove.scale.clone();
    const scaleEnd = Vec3.ONE.clone().multiplyScalar(0.5);
    const distanceScale = scaleEnd.x - scaleNow.x;
    await new Promise<void>(resolve => {
        tween(nIconMove)
            .to(timeReceiveItem, {}, {
                onUpdate(target, ratio) {
                    const ratiX = curveX.evaluate(ratio);
                    const ratiY = curveY.evaluate(ratio);
                    const ratiScale = curveScale.evaluate(ratio);
                    nIconMove.worldPosition = wPosStart.clone().add3f(ratiX * distanceX, ratiY * distanceY, 0)
                    nIconMove.scale = scaleNow.clone().add3f(ratiScale * distanceScale, ratiScale * distanceScale, ratiScale * distanceScale);
                },
            })
            .call(() => resolve())
            .start();
    })


    SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RECEIVE_ITEM_DONE);

    // emit update item
    switch (typeTutUI) {
        case LEVEL_TUT_IN_GAME.VIP_SLOT:
            clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_BOOSTER_VIP_SLOT, null, null, MConfigs.FX_BOOSTER);
            DataItemSys.Instance.EmitUpdateItem(TYPE_ITEM.VIP_SLOT);
            break;
        case LEVEL_TUT_IN_GAME.SHUFFLE:
            clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_BOOSTER_SHUFFLE, null, null, MConfigs.FX_BOOSTER);
            DataItemSys.Instance.EmitUpdateItem(TYPE_ITEM.SHUFFLE);
            break;
        case LEVEL_TUT_IN_GAME.SORT:
            clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_BOOSTER_SORT, null, null, MConfigs.FX_BOOSTER);
            DataItemSys.Instance.EmitUpdateItem(TYPE_ITEM.SORT);
            break;
    }
}