import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { InfoPack, instanceOfIUIKeepTutAndReceiveLobby, IPrize, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import * as I18n from 'db://i18n/LanguageData';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { DataChristmasSys } from '../../../DataBase/DataChristmasSys';
import { AnimPackChritsmas } from '../../../AnimsPrefab/Christmas/AnimPackChritsmas';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIPackChirstmas')
export class UIPackChirstmas extends UIBaseSys {
    @property(Label) lbTitle: Label;
    @property(Label) lbTitleShadow: Label;
    @property(Label) lbPrice: Label;
    @property(Label) lbPriceShadow: Label;
    @property(Label) lbSale: Label;
    @property(Label) lbTime: Label;
    @property(Node) nClose: Node;

    @property(Label) listLbCoin: Label[] = [];
    @property(Label) listLbSort: Label[] = [];
    @property(Label) listLbVip: Label[] = [];
    @property(Label) listLbShuffle: Label[] = [];

    @property(AnimPackChritsmas) animPackChristmas: AnimPackChritsmas = null;

    private _infoPack: InfoPack = null;
    private _wasSetData: boolean = false;
    private _timeRemain: number = 0;


    //=====================================================
    //#region baseUI
    public async PrepareDataShow(): Promise<void> {
        this._infoPack = DataChristmasSys.Instance.InfoPackChristmasWorking;
        if (this._infoPack == null) { this.node.active = false; return; }

        // update bg and ske
        if (!this._wasSetData) {
            this._wasSetData = true;
            this.animPackChristmas.SetData(MConfigResourceUtils._skeChristmas);
            this.animPackChristmas.PlayPack1();
        }

        // update UI
        this.lbTitle.string = this._infoPack.nameUI;
        this.lbTitleShadow.string = this._infoPack.nameUI;
        this.lbPrice.string = `${this._infoPack.price}$`;
        this.lbPriceShadow.string = this.lbPrice.string;
        this.lbSale.string = `${this._infoPack.Sale}%`;

        // update lb prize
        this.UpdateLbItem(this._infoPack.Prizes);

        //update lbTime
        this.UpdateUITime();
    }

    public async UIShowDone(): Promise<void> {
        // check can need force close
        if (this._infoPack == null) { clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_CHRISTMAS, 2) }
        this.RegisterTime();
    }

    public async UICloseDone(): Promise<void> {
        // check can emit conintue lobby
        if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
            clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
        }
    }

    protected onDisable(): void {
        this.UnRegisterTime();
    }
    //#endregion baseUI
    //=====================================================

    //=====================================================
    //#region private
    private UpdateLbItem(listPrize: IPrize[]) {
        listPrize.forEach(v => {
            switch (v.typePrize) {
                case TYPE_PRIZE.MONEY:
                    this.listLbCoin.forEach(lb => lb.string = v.GetStringValue_2())
                    break;
                case TYPE_PRIZE.SORT:
                    this.listLbSort.forEach(lb => lb.string = v.GetStringValue_2())
                    break;
                case TYPE_PRIZE.VIP_SLOT:
                    this.listLbVip.forEach(lb => lb.string = v.GetStringValue_2())
                    break;
                case TYPE_PRIZE.SHUFFLE:
                    this.listLbShuffle.forEach(lb => lb.string = v.GetStringValue_2())
                    break;
            }
        })
    }
    //#endregion private
    //=====================================================

    //=====================================================
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, this.node.name);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_CHRISTMAS, 1);
    }

    private onBtnBuyPack() {
        const price = Number.parseFloat(this._infoPack.price);
        LogEventManager.Instance.logButtonClick(`buy`, this.node.name);

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
    //#endregion btn
    //=====================================================


    //=====================================================
    //#region buy
    private async OnBuySuccessfull() {
        DataChristmasSys.Instance.BuyPackSuccess(false);
        DataInfoPlayer.Instance.CachePackBought(this._infoPack.namePack);

        // hide this node and bg shadow
        this.node.active = false;

        // save prize
        PrizeSys.Instance.AddPrize(this._infoPack.Prizes, "UIPopUpPack_Pack_" + this._infoPack.namePack, true, false);

        // emit receive data in lobby
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY, false);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.PACK, this._infoPack.Prizes, `UIPopUpPack_Pack_${this._infoPack.namePack}`, null, null, this._infoPack.nameUI);

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_CHRISTMAS, 1);
    }
    //#endregion buy
    //=====================================================

    //=====================================================
    //#region time
    private RegisterTime() {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    private UpdateUITime() {
        this._timeRemain = DataChristmasSys.Instance.GetTimeRemainReInit();
        if (this._timeRemain <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(this._timeRemain);
            this.lbTime.string = `${resultTime}`;
        }
    }
    //#endregion time
    //=====================================================
}


