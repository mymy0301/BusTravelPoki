import { _decorator, Component, Label, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { PlayerData } from '../../../Utils/PlayerData';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConfigs } from '../../../Configs/MConfigs';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import * as I18n from 'db://i18n/LanguageData';
import { IUIPopUpRemoveAds } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('UIPopUpRemoveAds')
export class UIPopUpRemoveAds extends UIBaseSys {
    @property(Label) lbPrice_1: Label;
    @property(Label) lbPrice_2: Label;
    @property(Label) lbPrice_3: Label;

    protected onLoad(): void {
        // load price
        const price = FBInstantManager.Instance.getPriceIAPPack_byProductID(MConfigs.IAP_NO_ADS);
        this.lbPrice_1.string = price != null ? price : `${MConst.PRICE_BUY_NO_ADS}$`;
        this.lbPrice_2.string = price != null ? price : `${MConst.PRICE_BUY_NO_ADS}$`;
        this.lbPrice_3.string = price != null ? price : `${MConst.PRICE_BUY_NO_ADS}$`;
    }

    protected onDisable(): void {
        if (this._dataCustom && (this._dataCustom as IUIPopUpRemoveAds).isEmitContinue) {
            clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
        }
    }

    //#region listen button
    private OnBtnBuyRemoveAds() {
        LogEventManager.Instance.logButtonClick(`buy`, "UIPopUpRemoveAds");

        const namePack: string = MConfigs.IAP_NO_ADS;
        const self = this;

        // log event
        LogEventManager.Instance.buyPack(namePack);

        const price = MConst.PRICE_BUY_NO_ADS;
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

    private BuyItemSuccess() {
        PlayerData.Instance.SetCanShowAds(false);
        PlayerData.Instance.SaveSettingStatus();
        // hide the popUp remove ads
        FBInstantManager.Instance.Hide_BannerAd();
        // set banner and inter can not show ads
        FBInstantManager.Instance.CanShowBanner = PlayerData.Instance.CanShowAds;
        FBInstantManager.Instance.HideShowInter = PlayerData.Instance.CanShowAds;
    }

    private PlayAnimBuyItemSuccessful() {
        // emit to hide the button remove ads
        clientEvent.dispatchEvent(MConst.EVENT.BUY_NO_ADS_SUCCESS);
        // show popUp buy feature
        this.onBtnClose();
    }

    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIPopUpRemoveAds");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_REMOVE_ADS, 1);
    }
    //#endregion listen button
}


