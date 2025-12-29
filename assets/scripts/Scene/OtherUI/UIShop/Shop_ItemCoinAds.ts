import { _decorator, Button, CCString, Component, Label, Layout, Material, Node, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { Utils } from '../../../Utils/Utils';
import { convertTYPE_PRIZEtoTYPE_ITEM, GameSoundEffect, IPrize, TYPE_CURRENCY, TYPE_ITEM, TYPE_PRIZE, TYPE_RECEIVE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { CountDownTimeGroup } from '../../../Common/CountDownTimeGroup';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { CurrencySys } from '../../CurrencySys';
import { SuperUIAnimCustom } from '../SuperUIAnimCustom';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import { DataShopSys } from '../../DataShopSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { SoundSys } from '../../../Common/SoundSys';
import { DataEventsSys } from '../../DataEventsSys';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemCoinAds')
export class Shop_ItemCoinAds extends Component {
    @property(Label) lbNumCoin: Label;
    @property(Node) objFree: Node = null;
    @property([Node]) listNGray: Node[] = [];
    @property(Button) btnGet: Button = null;
    @property(CountDownTimeGroup) countDownTimeGroup: CountDownTimeGroup = null;
    @property(Material) matGray: Material;
    @property(Label) lbFreeAmount: Label;
    @property(Label) lbFreeAmountShadow: Label;

    @property(Node) nStartCoin: Node;
    @property(CCString) stringColorHexOutlineCoinReceive: string = "#5c5383";

    @property(Sprite) icAds: Sprite;
    @property(SpriteFrame) sfTicket: SpriteFrame;
    @property(SpriteFrame) sfAds: SpriteFrame;

    private _dataPrize: IPrize[] = [new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 10)];

    private _typeScene: 'home' | 'game' = 'home';

    protected onEnable(): void {
        this.showInfo(true);
        this.UpdateUIWatchAds();
    }

    protected onDisable(): void {

    }

    public UpdateManualUI() {
        DataShopSys.Instance.CheckCanResetCoinFree();
        if (DataShopSys.Instance.GetNumShopFreeToPlay() < MConfigs.LIMIT_COIN_ADS_FREE_EACH_DAY) {
            this.node.active = true;
        }
    }

    private UpdateUIWatchAds() {
        if (CurrencySys.Instance.GetTicket() > 0) {
            this.icAds.spriteFrame = this.sfTicket;
        } else {
            this.icAds.spriteFrame = this.sfAds;
        }
    }

    public SetUp(typeScene: 'home' | 'game') {
        switch (typeScene) {
            case 'home':
                this._dataPrize[0].value = MConfigs.NUM_COIN_ADS_EACH_DAY;
                break;
            case 'game':
                this._dataPrize[0].value = MConfigs.NUM_COIN_ADS_EACH_DAY;
                break;
        }
        this._typeScene = typeScene;

        this.lbNumCoin.string = `${this._dataPrize[0].value}`;
    }

    private async onBtnAds() {
        LogEventManager.Instance.logButtonClick(`buy`, "Shop_ItemCoinAds");

        const self = this;

        async function UseSuccess(byWatchAds: boolean = true) {
            self.BuyItemSuccess(byWatchAds);
            self.PlayAnimBuyItemSuccessful();
            self.showInfo();

            self.UpdateUIWatchAds();
        }

        if (CurrencySys.Instance.GetTicket() > 0) {
            CurrencySys.Instance.AddTicket(-1, `SHOP_COIN_FREE_${this._typeScene}`);
            UseSuccess(false);
            return;
        }


        FBInstantManager.Instance.Show_RewardedVideoAsync("UIShop", "btnWatchAds", async (err, succ) => {
            if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
                UseSuccess();
            }
        });
    }

    private SetTextFreeAmount(text: string) {
        this.lbFreeAmount.string = text;
        this.lbFreeAmountShadow.string = text;
    }

    private showInfo(fromEnable: boolean = false): void {
        switch (true) {
            case CurrencySys.Instance.GetTicket() > 0:
                clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_COIN_INDICATOR);
                this.objFree.active = true;
                this.SetTextFreeAmount("Skip ads");
                this.countDownTimeGroup.HideNode();
                this.btnGet.enabled = true;
                MConfigs.UnGrayAllNode(this.listNGray);
                break;
            case DataShopSys.Instance.GetNumShopFreeToPlay() >= MConfigs.LIMIT_COIN_ADS_FREE_EACH_DAY:
                this.objFree.active = false;
                this.SetTextFreeAmount(`Free(${MConfigs.LIMIT_COIN_ADS_FREE_EACH_DAY - DataShopSys.Instance.GetNumShopFreeToPlay()})`);
                this.countDownTimeGroup.ShowNode();
                this.btnGet.enabled = false;
                MConfigs.GrayAllNode(this.listNGray, this.matGray);

                const lastTimeShopFree = DataShopSys.Instance.GetShopFreeLastTime()
                this.countDownTimeGroup.initCountDownTime(
                    // (Utils.getTimeLastDayUTCWithTime(lastTimeShopFree) - lastTimeShopFree) / 1000,
                    Utils.getTimeToNextDay(),
                    this.showInfo.bind(this),
                    "");
                break;
            case Utils.getSecondNow() >= DataShopSys.Instance.GetShopFreeLastTime() + MConfigs.TIME_COOLDOWN_COIN_ADS:
                clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_COIN_INDICATOR);
                this.objFree.active = true;
                this.SetTextFreeAmount(`Free(${MConfigs.LIMIT_COIN_ADS_FREE_EACH_DAY - DataShopSys.Instance.GetNumShopFreeToPlay()})`);
                this.countDownTimeGroup.HideNode();
                this.btnGet.enabled = true;
                MConfigs.UnGrayAllNode(this.listNGray);
                break;
            default:
                this.objFree.active = false;
                this.countDownTimeGroup.ShowNode();
                this.btnGet.enabled = false;
                MConfigs.GrayAllNode(this.listNGray, this.matGray);
                this.countDownTimeGroup.initCountDownTime(MConfigs.TIME_COOLDOWN_COIN_ADS - (Utils.getSecondNow() - DataShopSys.Instance.GetShopFreeLastTime()), this.showInfo.bind(this));
                break;
        }
    }

    private BuyItemSuccess(buyWatchAds: boolean = true) {
        //log event
        const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
        SupLogEvent.LogEventWithReward(dataEventLog, 0, 'ads_coin', "Shop");

        if (buyWatchAds) {
            // save data in here
            DataShopSys.Instance.DeceareseNumShopFreeToPlay(false);
        }
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_REWARDS);
        CurrencySys.Instance.AddMoney(this._dataPrize[0].value, `SHOP_COIN_FREE_${this._typeScene}`, true, false);
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_COIN_INDICATOR);
    }

    private async PlayAnimBuyItemSuccessful() {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

        let canContinueLogic: boolean = false;
        const numCoinReceive: number = this._dataPrize[0].value;
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
        superUIAnimCustom_com.PlayVFXFlash(wPosStartCoin);

        await superUIAnimCustom_com.ReceivePrizeCoin(this.stringColorHexOutlineCoinReceive, numCoinReceive, wPosStartCoin, wPosEndCoin,
            null,
            (numCoinIncrease: number) => {
                CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);

                clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_SHOP);
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_SHOP, null, null, MConfigs.FX_NEW_CUSTOM);
            });

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }
}


