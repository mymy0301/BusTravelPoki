import { _decorator, Component, Label, Node, Sprite, UITransform, Vec2, Vec3 } from 'cc';
import { convertTYPE_PRIZEtoTYPE_ITEM, InfoItemBundleStore, IPrize, TYPE_CURRENCY, TYPE_ITEM, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { CheatingSys } from '../../CheatingSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { CurrencySys } from '../../CurrencySys';
import { Anim_di_chuyen_vong_cung } from '../SuperAnimCustom';
import { Utils } from '../../../Utils/Utils';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
import { SuperUIAnimCustom } from '../SuperUIAnimCustom';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
import { DataEventsSys } from '../../DataEventsSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemTicket')
export class Shop_ItemTicket extends Component {
    @property(Label) lbNumTicket: Label;
    @property(Label) lbPrice: Label;
    @property(Label) lbShadowPrice: Label;
    @property({ group: "Ribbon", type: Node }) nRibbon: Node;
    @property({ group: "Ribbon", type: Label }) lbRibbon: Label;
    @property(Node) nVisualBtn: Node;
    @property(Node) nBtn: Node;
    @property(Node) nWPosStartTicket: Node;

    private _infoPack: InfoItemBundleStore = null;

    private readonly paddingRightAndLeft = 21 * 2;

    public SetUp(data: InfoItemBundleStore, maxWidthText: number) {
        this._infoPack = data;

        // udpate visual
        this.lbNumTicket.string = data.listItems[0].value.toString();

        // update ribbon
        if (data.typeUI == 2) {
            this.nRibbon.active = this.lbRibbon.node.active = true;
        } else {
            this.nRibbon.active = this.lbRibbon.node.active = false;
        }

        // update price
        const textPrice: string = FBInstantManager.Instance.getPriceIAPPack_byProductID(data.idBundle);
        this.lbPrice.string = textPrice != null ? textPrice : this._infoPack.price.toString();
        this.lbShadowPrice.string = textPrice != null ? textPrice : this._infoPack.price.toString();

        // update visual btn
        this.nVisualBtn.getComponent(UITransform).width = maxWidthText + this.paddingRightAndLeft;
        this.nBtn.getComponent(UITransform).width = maxWidthText + this.paddingRightAndLeft;

        // update pos label coin
        const posBasePrice = this.lbPrice.node.position.clone();
        const posBasePriceShadow = this.lbShadowPrice.node.position.clone();
        const posLabelCoin = (maxWidthText + this.paddingRightAndLeft) / 2;
        this.lbPrice.node.position = new Vec3(-posLabelCoin, posBasePrice.y, posBasePrice.z);
        this.lbShadowPrice.node.position = new Vec3(-posLabelCoin, posBasePriceShadow.y, posBasePriceShadow.z);
    }

    private onBtnBuyItem() {
        const price = Number.parseFloat(this._infoPack.price);
        LogEventManager.Instance.logButtonClick(`buy_${this._infoPack.idBundle}`, "UIShop");

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

        const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
        SupLogEvent.LogEventWithIAP(dataEventLog, this._infoPack.nameBundle, Number.parseFloat(this._infoPack.price), this._infoPack.idBundle, "Shop");

        CurrencySys.Instance.AddTicket(this._infoPack.listItems[0].value, `SHOP_PACK_${this._infoPack.idBundle}`, true, false);
    }

    private async PlayAnimBuyItemSuccessful() {
        let canContinueLogic: boolean = false;

        const listPrizes: IPrize[] = this._infoPack.listItems;
        const valueTicket: number = listPrizes[0].value;
        const wPosSpawn: Vec3 = this.nWPosStartTicket.worldPosition.clone();
        let wPosEnd: Vec3 = Vec3.ZERO;
        const distanceRandom: Vec2 = new Vec2(30, 30);
        const sfTicket = await MConfigResourceUtils.getImageItem(TYPE_PRIZE.TICKET);
        let superUIAnimCustom_com: SuperUIAnimCustom = null;

        // get WPosEnd
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.GET_WPOS_UI_TICKET, (wPosUITicket: Vec3) => {
            wPosEnd = wPosUITicket;
            canContinueLogic = true;
        })
        await Utils.WaitReceivingDone(() => canContinueLogic);
        canContinueLogic = false;

        // get superUIAnimCustom_com
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.GET_UI_ANIM_CUSTOM_COM, (uiAnimCustomCom) => {
            superUIAnimCustom_com = uiAnimCustomCom;
            canContinueLogic = true;
        });
        await Utils.WaitReceivingDone(() => { return canContinueLogic; });
        canContinueLogic = false;


        //===================================================================
        //==========================  anim     ==============================
        //===================================================================
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_GAME);

        await Anim_di_chuyen_vong_cung(
            5,
            sfTicket,
            null,
            wPosSpawn,
            wPosEnd,
            distanceRandom,
            (index: number) => {
                if (index == 0) {
                    // emit update UI
                    CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.TICKET, valueTicket);
                }
                clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_TICKET_SHOP);
                clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_TICKET_SHOP, null, null, MConfigs.FX_NEW_CUSTOM);
            },
            superUIAnimCustom_com.ReUseNItem.bind(superUIAnimCustom_com),
            (): Node => {
                let nItem = superUIAnimCustom_com.GetNItem();
                if (nItem.getComponent(Sprite) == null) nItem.addComponent(Sprite);
                if (!nItem.active) nItem.active = true;
                if (nItem.parent != superUIAnimCustom_com.nUIAnim) nItem.parent = superUIAnimCustom_com.nUIAnim;
                return nItem;
            }
        )

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
    }
}


