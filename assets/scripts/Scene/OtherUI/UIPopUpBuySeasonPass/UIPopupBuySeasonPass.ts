import { _decorator, Component, Label, Node, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { UIReceivePrizePopupSeasonPass } from './UIReceivePrizePopupSeasonPass';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { CaculTimeEvents2 } from '../../LobbyScene/CaculTimeEvents2';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { DataSeasonPassSys } from '../../../DataBase/DataSeasonPassSys';
import { DataShopSys } from '../../DataShopSys';
import * as I18n from 'db://i18n/LanguageData';
import { CheatingSys } from '../../CheatingSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { CONFIG_SP, EVENT_SEASON_PASS } from '../UISeasonPass/TypeSeasonPass';
import { MConfigs } from '../../../Configs/MConfigs';
import { DataInfoPlayer } from '../../DataInfoPlayer';
const { ccclass, property } = _decorator;

@ccclass('UIPopupBuySeasonPass')
export class UIPopupBuySeasonPass extends UIBaseSys {
    @property(Node) nUIRoot: Node;
    @property(Label) lbTime: Label;
    @property(Label) lbPrice: Label;
    @property(Label) lbPriceShadow: Label;
    @property(UIReceivePrizePopupSeasonPass) UIReceivePrizePopupSeasonPass: UIReceivePrizePopupSeasonPass;

    private _idBundle: string = '';

    public onLoad(): void {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);

        // update price
        this._idBundle = DataShopSys.Instance.getIdBundle('SeasonPass');
        const pricePackIAP = FBInstantManager.Instance.getPriceIAPPack_byProductID(this._idBundle);
        this.lbPrice.string = pricePackIAP != null ? pricePackIAP : `${CONFIG_SP.PRICE_ACTIVE_PRENIUM}$`;
        this.lbPriceShadow.string = pricePackIAP != null ? pricePackIAP : `${CONFIG_SP.PRICE_ACTIVE_PRENIUM}$`;
    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    //#region func UIBase
    public async PrepareDataShow(): Promise<void> {
        //update time
        this.UpdateUITime();
    }

    public async UICustomShow(): Promise<void> {
        // bubble the UI root
        this.node.getComponent(UIOpacity).opacity = 255;
        this.node.position = new Vec3(0, 0, 0);
        this.animShowAndMove.ComeUpWithOpacityShow(this.nUIRoot);
    }

    public async UICustomClose(typeClose: number): Promise<void> {
        // bubble the UI root
        await this.animShowAndMove.ComeDownWithOpacityClose(this.nUIRoot);
        this.node.active = false;
    }

    public async UIShowDone(): Promise<void> {
        // because you call show block ui in the UITilePass + UI Store + UI EndPhase
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_GAME);
    }
    //#endregion func UIBase

    //#region private func
    private UpdateUITime() {
        let time = CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.SEASON_PASS);
        if (time <= 0) {
            this.lbTime.string = "FINISHED";
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat(time);
        }
    }


    private BuyItemSuccessful() {
        if (this._idBundle != '') {
            // log event
            LogEventManager.Instance.buyPackSuccess(this._idBundle);
            DataInfoPlayer.Instance.CachePackBought(this._idBundle);
        }

        LogEventManager.logEvent("SEASON_PASS_ACTIVE");
        // buy item in shop
        DataSeasonPassSys.Instance.ActiveSuccessSeasonPass();
        clientEvent.dispatchEvent(EVENT_SEASON_PASS.ACTIVE_SUCCESS_PASS);
        this.onBtnClose();
    }

    //#endregion


    //#region func btn
    private onBtnActivePass() {
        const price = CONFIG_SP.PRICE_ACTIVE_PRENIUM;
        LogEventManager.Instance.logButtonClick(`active`, "UIPopUpBuySeasonPass");

        const self = this;

        // check cheat first
        if (CheatingSys.Instance.isCheatStore) {
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
            self.BuyItemSuccessful();
            return;
        }

        // log event
        LogEventManager.Instance.buyPack(this._idBundle);

        LogEventManager.Instance.logIAP_PurchaseItem(this._idBundle, price)

        // buy normal
        FBInstantManager.Instance.getListIAP_Purchase((err: Error, success: string) => {
            if (err) {
                FBInstantManager.Instance.buyIAP_consumePackID(this._idBundle, (err: Error, success: string) => {
                    if (err) {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                    } else {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                        self.BuyItemSuccessful();
                    }
                }, price);

            } else {
                let purchaseToken: string = FBInstantManager.Instance.iap_checkPurchaseInfo(this._idBundle);
                if (purchaseToken != "") {
                    FBInstantManager.Instance.iap_consumePackID(purchaseToken, (err: Error, success: string) => {
                        if (err) {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                        } else {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                            self.BuyItemSuccessful();
                        }
                    });
                } else {
                    FBInstantManager.Instance.buyIAP_consumePackID(this._idBundle, (err: Error, success: string) => {
                        if (err) {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                        } else {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                            self.BuyItemSuccessful();
                        }
                    }, price);
                }
            }
        });
    }

    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIPopUpBuySeasonPass");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_BUY_SEASON_PASS, 1);
    }

    //#endregion func btn
}


