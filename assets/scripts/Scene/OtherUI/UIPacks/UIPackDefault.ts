import { _decorator, CCBoolean, CCString, Component, Label, Node } from 'cc';
import { EnumNamePack, InfoPack, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { Utils } from '../../../Utils/Utils';
import { CheatingSys } from '../../CheatingSys';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import * as I18n from 'db://i18n/LanguageData';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
const { ccclass, property } = _decorator;

export interface IUIPackDefault {
    CloseUI(): void;
    CustomLogicAfterBuySuccess(): Promise<void>;
}

@ccclass('UIPackDefault')
export class UIPackDefault extends UIBaseSys {
    @property(CCString) namePack: EnumNamePack = EnumNamePack.StartedPack;
    @property(Label) lbTitle: Label;
    @property(Label) lbTitleShadow: Label;
    @property(Label) lbPrice: Label;
    @property(Label) lbPriceShadow: Label;
    @property(Label) lbTime: Label;
    @property(Label) lbAmount: Label;
    @property(Label) lbSale: Label;
    @property(Node) nClose: Node;
    @property(CCBoolean) runTime: boolean = false;

    private readonly timeShowNClose: number = 3;
    private iUIPackDefault: IUIPackDefault = null;
    private _infoPack: InfoPack = null;

    protected onLoad(): void {
        // update UI
        const infoPack: InfoPack = DataPackSys.Instance.getInfoPackSave(this.namePack);
        const infoPackFromRoot = DataPackSys.Instance.getInfoPackFromRoot(this.namePack);
        const maxAmountPack = infoPackFromRoot.numAvaliable;
        this._infoPack = infoPack;
        this.lbTitle.string = infoPack.nameUI;
        this.lbTitleShadow.string = infoPack.nameUI;
        let pricePack = FBInstantManager.Instance.getPriceIAPPack_byProductID(infoPack.namePack);
        this.lbPrice.string = (pricePack != null ? pricePack.toString() : `${infoPack.price}$`);
        this.lbPriceShadow.string = this.lbPrice.string;
        if (this.runTime) {
            this.UpdateUILbTime();
        } else {
            this.lbAmount.string = `Amount: ${infoPack.numAvaliable.toString()}/${maxAmountPack}`;
        }
        this.lbSale.string = `${infoPack.Sale}%`;
    }

    protected onEnable(): void {
        // this.nClose.active = false;
        // this.scheduleOnce(() => {
        //     this.nClose.active = true
        // }, this.timeShowNClose);

        if (this.runTime) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
        }
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
    }

    public Init(IUIPackDefault: IUIPackDefault) {
        this.iUIPackDefault = IUIPackDefault;
    }

    private UpdateUILbTime() {
        const timeNow = Utils.getCurrTime();
        let infoPack = DataPackSys.Instance.getInfoPackSave(this.namePack);
        if (infoPack == null || this.iUIPackDefault == null) {
            // this.iUIPackDefault.CloseUI(); 
            return;
        };
        const timeLimit = infoPack.timeLimit;
        const timeRemaining = timeLimit - timeNow;

        if (timeRemaining <= 0) {
            this.iUIPackDefault.CloseUI();
        } else {
            this.lbTime.string = `Ends in: ${Utils.convertTimeLengthToFormat(timeRemaining)}`;
        }
    }

    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, this.node.name);

        this.iUIPackDefault.CloseUI();
    }

    private onBtnBuyPack() {
        const price = Number.parseFloat(this._infoPack.price);
        LogEventManager.Instance.logButtonClick(`buy`, this.node.name);

        if (CheatingSys.Instance.isCheatStore) {
            // case buy successfull
            this.OnBuySuccessfull();
            return;
        }

        const self = this;
        const namePack = this._infoPack.namePack;

        LogEventManager.Instance.logIAP_PurchaseItem(namePack, price)

        // else call check buy pack
        FBInstantManager.Instance.getListIAP_Purchase((err: Error, success: string) => {
            if (err) {
                FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
                    if (err) {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                    } else {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                        self.OnBuySuccessfull();
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
                            self.OnBuySuccessfull();
                        }
                    });
                } else {
                    FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
                        if (err) {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                        } else {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                            self.OnBuySuccessfull();
                        }
                    }, price);
                }
            }
        });
    }

    private async OnBuySuccessfull() {

        // hide this node and bg shadow
        this.node.active = false;
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY);
        DataInfoPlayer.Instance.CachePackBought(this._infoPack.namePack);

        // save prize
        PrizeSys.Instance.AddPrize(this._infoPack.Prizes, "UIPopUpPack_Pack_" + this._infoPack.namePack, false, false);

        // nếu như check numAvaliable == 1 => sau khi nhận thưởng xong thì sẽ tắt giao diện
        const numAvaliable = DataPackSys.Instance.getInfoPackSave(this.namePack).numAvaliable;

        // save data
        DataPackSys.Instance.AddNumAvailablePack(this.namePack, -1);

        // emit receive data in lobby
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY, false);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.PACK, this._infoPack.Prizes, `UIPopUpPack_Pack_${this._infoPack.namePack}`, null, null, this._infoPack.nameUI);

        if (numAvaliable == 1) {
            this.iUIPackDefault.CloseUI();
        }

        // run logic custom
        await this.iUIPackDefault.CustomLogicAfterBuySuccess();
    }
}


