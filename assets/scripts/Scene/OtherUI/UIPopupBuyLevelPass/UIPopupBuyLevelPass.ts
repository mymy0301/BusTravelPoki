import { _decorator, Component, Label, Node, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { UIReceivePrizePopupLevelPass } from './UIReceivePrizePopupLevelPass';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { CaculTimeEvents2 } from '../../LobbyScene/CaculTimeEvents2';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { DataLevelPassSys } from '../../../DataBase/DataLevelPassSys';
import { DataShopSys } from '../../DataShopSys';
import { CheatingSys } from '../../CheatingSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import * as I18n from 'db://i18n/LanguageData';
import { CONFIG_LP, EVENT_LEVEL_PASS } from '../UILevelPass/TypeLevelPass';
import { DataInfoPlayer } from '../../DataInfoPlayer';
const { ccclass, property } = _decorator;

@ccclass('UIPopupBuyLevelPass')
export class UIPopupBuyLevelPass extends UIBaseSys {
    @property(Node) nUIRoot: Node;
    @property(Label) lbTime: Label;
    @property(Label) lbPrice: Label;
    @property(Label) lbPriceShadow: Label;
    @property(UIReceivePrizePopupLevelPass) UIReceivePrizePopupLevelPass: UIReceivePrizePopupLevelPass;

    private _idBundle: string = '';

    public onLoad(): void {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);

        // update price
        this._idBundle = DataShopSys.Instance.getIdBundle('LevelPass');
        const price = FBInstantManager.Instance.getPriceIAPPack_byProductID(this._idBundle);
        this.lbPrice.string = price != null ? price : "2.99$";
        this.lbPriceShadow.string = price != null ? price : "2.99$";
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
        let time = CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.LEVEL_PASS);
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

        LogEventManager.logEvent("LEVEL_PASS_ACTIVE");
        // buy item in shop
        DataLevelPassSys.Instance.ActiveSuccessLevelPass();
        clientEvent.dispatchEvent(EVENT_LEVEL_PASS.ACTIVE_SUCCESS_PASS);
        this.onBtnClose();
    }

    //#endregion


    //#region func btn
    private onBtnActivePass() {
        const price = CONFIG_LP.PRICE_ACTIVE_PRENIUM;
        LogEventManager.Instance.logButtonClick(`active`, "UIPopUpBuyLevelPass");

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
        LogEventManager.Instance.logButtonClick(`close`, "UIPopUpBuyLevelPass");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_BUY_LEVEL_PASS, 1);
    }

    //#endregion func btn
}


