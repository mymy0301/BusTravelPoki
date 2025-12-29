import { _decorator, Button, CCString, Component, Label, Material, Node, UITransform, Vec3 } from 'cc';
import { convertTYPE_PRIZEtoTYPE_ITEM, GameSoundEffect, InfoItemBundleStore, IPrize, TYPE_CURRENCY, TYPE_ITEM, TYPE_PRIZE, TYPE_RECEIVE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { CurrencySys } from '../../CurrencySys';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
import { Utils } from '../../../Utils/Utils';
import { SuperUIAnimCustom } from '../SuperUIAnimCustom';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import { CountDownTimeGroup } from '../../../Common/CountDownTimeGroup';
import { DataShopSys } from '../../DataShopSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { SoundSys } from '../../../Common/SoundSys';
import { DataEventsSys } from '../../DataEventsSys';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemCoinFree')
export class Shop_ItemCoinFree extends Component {
    @property(Node) nStartCoin: Node;
    @property(Label) lbCoin: Label;
    @property(CCString) stringColorHexOutlineCoinReceive = "#5c5383";
    @property(CountDownTimeGroup) countDownTimeGroup: CountDownTimeGroup;
    @property([Node]) listNGray: Node[] = [];
    @property(Material) matGray: Material;
    @property(Button) btnBuy: Button;
    @property(Node) nObjFree: Node;

    protected onEnable(): void {
        this.lbCoin.string = MConfigs.NUM_COIN_FREE_EACH_DAY.toString();

        // check is receive coin free today or not
        this.UpdateUI()
    }

    private UpdateUI() {
        const hasFreeCoinToday = !DataShopSys.Instance.IsReceiveCoinFreeToday();
        // console.log("hasFreeCoinToday", hasFreeCoinToday);
        switch (true) {
            case hasFreeCoinToday:
                this.nObjFree.active = true;
                this.countDownTimeGroup.HideNode();
                MConfigs.UnGrayAllNode(this.listNGray);
                this.btnBuy.enabled = true;
                break;
            case !hasFreeCoinToday:
                this.countDownTimeGroup.initCountDownTime(Utils.getTimeToNextDay(), this.UpdateUI.bind(this));
                this.nObjFree.active = false;
                this.countDownTimeGroup.ShowNode();
                MConfigs.GrayAllNode(this.listNGray, this.matGray);
                this.btnBuy.enabled = false;
                break;
        }
    }

    private onBtnBuyItem() {
        LogEventManager.Instance.logButtonClick(`buy`, "UIShop");

        this.BuyItemSuccess();
        this.UpdateUI();
    }

    private BuyItemSuccess() {
        // log event
        const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
        SupLogEvent.LogEventWithIAP(dataEventLog, 'coin_free', 0, 'coin_free', "Shop");

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_REWARDS);
        DataShopSys.Instance.SetReceiveCoinFreeToday(false);
        CurrencySys.Instance.AddMoney(200, `SHOP_FREE_COIN`, true, false);
        this.PlayAnimBuyItemSuccessful();
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_COIN_INDICATOR);
    }

    private async PlayAnimBuyItemSuccessful() {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

        let canContinueLogic: boolean = false;
        const listPrizes: IPrize[] = [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 200)];
        const numCoinReceive: number = listPrizes[0].value;
        const wPosStartCoin: Vec3 = this.nStartCoin.worldPosition.clone();
        let wPosEndCoin: Vec3 = Vec3.ZERO;
        let superUIAnimCustom_com: SuperUIAnimCustom = null;

        // get wPosStartCoin
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.GET_WPOS_UI_COIN, (wPosUICoin: Vec3) => {
            wPosEndCoin = wPosUICoin.clone();
            canContinueLogic = true;
        })
        await Utils.WaitReceivingDone(() => { return canContinueLogic; });
        canContinueLogic = false;

        // get superUIAnimCustom_com
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.GET_UI_ANIM_CUSTOM_COM, (uiAnimCustomCom) => {
            superUIAnimCustom_com = uiAnimCustomCom;
            canContinueLogic = true;
        });
        await Utils.WaitReceivingDone(() => { return canContinueLogic; });
        canContinueLogic = false;


        // =================================================================
        // ========================    anim coin ===========================
        // =================================================================
        // play VFX flash
        superUIAnimCustom_com.PlayVFXFlash(wPosStartCoin.clone());

        await superUIAnimCustom_com.ReceivePrizeCoin(this.stringColorHexOutlineCoinReceive, numCoinReceive, wPosStartCoin, wPosEndCoin,
            null,
            (numMoneyIncrease: number) => {
                CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numMoneyIncrease);
                clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_SHOP);
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_SHOP, null, null, MConfigs.FX_NEW_CUSTOM);
            });

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }
}


