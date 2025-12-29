import { _decorator, CCString, Component, Label, Node, UITransform, Vec3 } from 'cc';
import { convertTYPE_PRIZEtoTYPE_ITEM, GameSoundEffect, InfoItemBundleStore, IPrize, TYPE_CURRENCY, TYPE_ITEM, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { CheatingSys } from '../../CheatingSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { CurrencySys } from '../../CurrencySys';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
import { Utils } from '../../../Utils/Utils';
import { SuperUIAnimCustom } from '../SuperUIAnimCustom';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import { SoundSys } from '../../../Common/SoundSys';
import { DataEventsSys } from '../../DataEventsSys';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
import { DataInfoPlayer } from '../../DataInfoPlayer';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemCoin')
export class Shop_ItemCoin extends Component {
    @property(Label) lbNumCoin: Label;
    @property(Label) lbPrice: Label;
    @property(Label) lbPriceShadow: Label;
    @property({ group: "Ribbon", type: Node }) nRibbon: Node;
    @property({ group: "Ribbon", type: Label }) lbRibbon: Label;
    @property(Node) nStartCoin: Node;
    @property(Node) nVisualBtn: Node;
    @property(Node) nBtn: Node;
    @property(CCString) stringColorHexOutlineCoinReceive = "#5c5383";

    private _infoPack: InfoItemBundleStore = null;

    private readonly paddingRightAndLeft = 21 * 2;

    public SetUp(data: InfoItemBundleStore, maxWidthText: number) {
        this._infoPack = data;

        // udpate visual
        this.lbNumCoin.string = data.listItems[0].value.toString();

        // update ribbon
        if (data.typeUI == 2) {
            this.nRibbon.active = this.lbRibbon.node.active = true;
        } else {
            this.nRibbon.active = this.lbRibbon.node.active = false;
        }

        // update price
        const priceString: string = FBInstantManager.Instance.getPriceIAPPack_byProductID(data.idBundle);
        this.lbPrice.string = priceString != null ? priceString : this._infoPack.price.toString();
        this.lbPriceShadow.string = priceString != null ? priceString : this._infoPack.price.toString();

        // update visual btn
        this.nVisualBtn.getComponent(UITransform).width = maxWidthText + this.paddingRightAndLeft;
        this.nBtn.getComponent(UITransform).width = maxWidthText + this.paddingRightAndLeft;

        // update pos label coin
        const posBasePrice = this.lbPrice.node.position.clone();
        const posBasePriceShadow = this.lbPriceShadow.node.position.clone();
        const posLabelCoin = (maxWidthText + this.paddingRightAndLeft) / 2;
        this.lbPrice.node.position = new Vec3(-posLabelCoin, posBasePrice.y, posBasePrice.z);
        this.lbPriceShadow.node.position = new Vec3(-posLabelCoin, posBasePriceShadow.y, posBasePriceShadow.z);
    }

    private onBtnBuyItem() {
        const price = Number.parseFloat(this._infoPack.price);
        LogEventManager.Instance.logButtonClick(`buy_${this._infoPack.idBundle}`, "Shop_ItemCoin");

        const self = this;

        // check ceating 
        if (CheatingSys.Instance.isCheatStore) {
            // save about data
            this.BuyItemSuccess();
            // play anim receive item
            this.PlayAnimBuyItemSuccessful();
        } else {
            const namePack: string = this._infoPack.idBundle;

            // log event
            LogEventManager.Instance.buyPack(namePack);

            LogEventManager.Instance.logIAP_PurchaseItem(namePack, price)

            // buy item
            FBInstantManager.Instance.getListIAP_Purchase((err: Error, success: string) => {
                if (err) {
                    FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
                        if (err) {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                        } else {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                            self.BuyItemSuccess();
                            self.PlayAnimBuyItemSuccessful();
                        }
                    }, price);

                } else {
                    let purchaseToken: string = FBInstantManager.Instance.iap_checkPurchaseInfo(namePack);
                    if (purchaseToken != "") {
                        FBInstantManager.Instance.iap_consumePackID(purchaseToken, (err: Error, success: string) => {
                            if (err) {
                                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                            } else {
                                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                                self.BuyItemSuccess();
                                self.PlayAnimBuyItemSuccessful();
                            }
                        });
                    } else {
                        FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
                            if (err) {
                                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                            } else {
                                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                                self.BuyItemSuccess();
                                self.PlayAnimBuyItemSuccessful();
                            }
                        }, price);
                    }
                }
            });
        }
    }

    private BuyItemSuccess() {
        // log event
        LogEventManager.Instance.buyPackSuccess(this._infoPack.idBundle);
        DataInfoPlayer.Instance.CachePackBought(this._infoPack.idBundle);
        
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_REWARDS);
        CurrencySys.Instance.AddMoney(this._infoPack.listItems[0].value, `SHOP_PACK_${this._infoPack.idBundle}`, true, false);

        const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
        SupLogEvent.LogEventWithIAP(dataEventLog, this._infoPack.nameBundle, Number.parseFloat(this._infoPack.price), this._infoPack.idBundle, "Shop");
    }

    private async PlayAnimBuyItemSuccessful() {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

        let canContinueLogic: boolean = false;
        const listPrizes: IPrize[] = this._infoPack.listItems;
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


