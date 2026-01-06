import { _decorator, AnimationComponent, Label, Node, ParticleSystem, RealCurve, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import * as I18n from 'db://i18n/LanguageData';
import { languages } from 'db://assets/resources/i18n/en';
import { CurrencySys } from '../../CurrencySys';
import { DataCustomUIShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../UIShop/TypeShop';
import { MConfigs } from '../../../Configs/MConfigs';
import { GameSys } from '../../GameScene/GameSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { Utils } from '../../../Utils/Utils';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

enum NAME_ANIM {
    IDLE = "IdleUI",
    OPEN_UI = "OpenUI",
    UNLOCK = "Unlock"
}

@ccclass('UIUnlockParking')
export class UIUnlockParking extends UIBaseSys {
    @property(Sprite) icAds: Sprite;
    // @property(SpriteFrame) sfTicket: SpriteFrame;
    // @property(SpriteFrame) sfAds: SpriteFrame;
    @property(Label) lbWatchedAds: Label;
    @property(Label) lbShadowWatchedAds: Label;
    @property(Node) nBtnWatchAds: Node;
    @property(Node) nBtnCoin: Node;
    @property(Node) nBtnCoin_Disable: Node;
    @property(AnimationComponent) animationComponent: AnimationComponent;
    @property(Node) nIcParking: Node;
    @property(ParticleSystem) par1: ParticleSystem;
    @property(ParticleSystem) par2: ParticleSystem;
    @property(RealCurve) cr1_x: RealCurve = new RealCurve();
    @property(RealCurve) cr1_y: RealCurve = new RealCurve();
    private readonly _posNBtnCoinWhen2Btn: Vec3 = new Vec3(-143, -180, 0);

    protected onEnable(): void {
        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);

        this.UpdateBtnAds();
        this.UpadetUI();
    }

    public async PrepareDataShow(): Promise<void> {
        this.animationComponent.play(NAME_ANIM.IDLE);
        this.par1.stop();
        this.par2.stop();
    }

    public async UIShowDone(): Promise<void> {
        this.animationComponent.play(NAME_ANIM.OPEN_UI);
    }

    private UpdateBtnAds() {
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     this.icAds.spriteFrame = this.sfTicket;
        //     this.lbWatchedAds.string = "Free(1)";
        //     this.lbShadowWatchedAds.string = "Free(1)";
        // } else {
        //     this.icAds.spriteFrame = this.sfAds;
        //     this.lbWatchedAds.string = "Free(1)";
        //     this.lbShadowWatchedAds.string = "Free(1)";
        // }
    }

    private UpadetUI() {

        // let canShowBtnWatchAds: boolean = true;
        // // kiểm tra xem có ticket sử dụng hay không
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     canShowBtnWatchAds = true;
        // }
        // // kiểm tra xem lượt này có xem được quảng cáo hay không
        // if (GameSys.Instance.CheckWatchedAdsUnlockSpot()) {
        //     canShowBtnWatchAds = false;
        // }

        // if (canShowBtnWatchAds) {
        //     this.nBtnCoin.position = this._posNBtnCoinWhen2Btn;
        //     this.nBtnWatchAds.active = true;
        // } else {
        //     this.nBtnCoin.position = new Vec3(0, this._posNBtnCoinWhen2Btn.y, 0);
        //     this.nBtnWatchAds.active = false;
        // }

        if(CurrencySys.Instance.GetMoney() >= 1500) {
            this.nBtnCoin_Disable.active = false;
        } else {
            this.nBtnCoin_Disable.active = true;
        }

    }

    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIUnlockParking");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_UNLOCK_PARKING, 1);
        clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
    }

    private async AddParkingSuccess() {
        // emit is unlock anim
        clientEvent.dispatchEvent(MConst.EVENT.IS_ANIM_UNLOCK_PARKING, true);

        // play anim 
        this.animationComponent.play(NAME_ANIM.UNLOCK);
        const timeAnimUnlock = this.animationComponent.clips[Utils.getIndexOfEnum(NAME_ANIM, NAME_ANIM.OPEN_UI)].duration;
        await Utils.delay(timeAnimUnlock * 1000);
    }

    private onBtnWatchAds() {
        LogEventManager.Instance.logButtonClick(`ads`, "UIUnlockParking");

        // ticket
        if (CurrencySys.Instance.GetTicket() > 0) {
            CurrencySys.Instance.AddTicket(-1, 'UIUnlockParking', true, true);
            this.AddParkingSuccess();
            return;
        }

        // watch ads
        // FBInstantManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
        //     if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
        //         GameSys.Instance.SetWatcedAdsUnlockSpot();
        //         this.AddParkingSuccess();
        //     } else {
        //         // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t(languages['No video Available!']));

        //         // // show Shop in here -> after close shop -> show this UIagain , remmember not change state game to resume
        //         // // Close this UI and open UIShop to coin
        //         // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, TYPE_UI.UI_UNLOCK_PARKING, 2);
        //         // // if pass all case show ui shop
        //         // let dataCustomUIShop: DataCustomUIShop = {
        //         //     isActiveClose: true,
        //         //     openUIAfterClose: TYPE_UI.UI_UNLOCK_PARKING,
        //         //     pageViewShop_ScrollTo: MConfigs.numIAPTicketHave > 0 ? PAGE_VIEW_SHOP.COIN : PAGE_VIEW_SHOP_2.COIN
        //         // }
        //         // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SHOP, 2, true, dataCustomUIShop, false);
        //     }
        // })

        PokiSDKManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
            if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
                GameSys.Instance.SetWatcedAdsUnlockSpot();
                this.AddParkingSuccess();
            }
        });
    }

    private BtnAddParkingByCoin() {
        LogEventManager.Instance.logButtonClick(`coin`, "UIUnlockParking");

        if (CurrencySys.Instance.AddMoney(-1500, `UIUnlockParking_addParking`, true)) {
            this.AddParkingSuccess();
        } else {
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Not enough Coins!");

            // Close this UI and open UIShop to coin
            // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, TYPE_UI.UI_UNLOCK_PARKING, 2);
            // // if pass all case show ui shop
            // let dataCustomUIShop: DataCustomUIShop = {
            //     isActiveClose: true,
            //     openUIAfterClose: TYPE_UI.UI_UNLOCK_PARKING,
            //     pageViewShop_ScrollTo: MConfigs.numIAPTicketHave > 0 ? PAGE_VIEW_SHOP.COIN : PAGE_VIEW_SHOP_2.COIN,
            //     canAutoResumeGame: false,
            //     dataCustom: this._dataCustom
            // }
            // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SHOP_SHORT, 2, true, dataCustomUIShop, false);
        }
    }

    //==============================
    //#region anim
    private PlayParticle() {
        this.par1.play();
        this.par2.play();
    }

    /**
     * emit to move the block
     */
    private async MoveBlock() {
        const timeMoveBlock = 0.5;
        const wPosParkingUnlock = this._dataCustom as Vec3;
        const distanceX: number = wPosParkingUnlock.x - this.nIcParking.worldPosition.x;
        const distanceY: number = wPosParkingUnlock.y - this.nIcParking.worldPosition.y;
        const baseWPosIc = this.nIcParking.worldPosition.clone();
        const self = this;
        const scaleRoot = this.nIcParking.scale.clone();
        const scaleEnd = new Vec3(0.2, 0.2, 0.2);
        // tween di chuyển block đến vị trí mở khóa
        this.nShadowSelf.Hide(true, timeMoveBlock * 2 / 3);
        tween(this.nIcParking)
            .to(timeMoveBlock, {}, {
                onUpdate(target, ratio) {
                    const newDistanceX = self.cr1_x.evaluate(ratio) * distanceX;
                    const newDistanceY = self.cr1_y.evaluate(ratio) * distanceY;
                    self.nIcParking.worldPosition = new Vec3(baseWPosIc.x + newDistanceX, baseWPosIc.y + newDistanceY, baseWPosIc.z);
                    let scaleRight: Vec3 = new Vec3();
                    Vec3.lerp(scaleRight, scaleRoot, scaleEnd, self.cr1_x.evaluate(ratio));
                    self.nIcParking.scale = scaleRight.clone();
                },
            })
            .start();
        await Utils.delay(timeMoveBlock * 1000);

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_UNLOCK_PARKING, 2);
        clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
        clientEvent.dispatchEvent(MConst.EVENT_PARKING.UNLOCK_1_NORMAL_PARKING);
        // clientEvent.dispatchEvent(MConst.EVENT_CAR.TRIGGER_CAR_AUTO_MOVE_FORWARD);

        this.UpdateBtnAds();
        this.UpadetUI();
    }
    //#endregion anim
    //==============================
}




