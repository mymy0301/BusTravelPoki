import { _decorator, Component, game, Label, Node } from 'cc';
import { IUIPackDefault, UIPackDefault } from './UIPackDefault';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { InfoPack, InfoPackFromRootJson, instanceOfIUIKeepTutAndReceiveLobby, IPrize, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { DataPackBlackFriday } from '../../../DataBase/DataPackBlackFriday';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { FX_popup } from '../../../AnimsPrefab/FX_popup';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import * as I18n from 'db://i18n/LanguageData';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIPackBlackFriday')
export class UIPackBlackFriday extends UIBaseSys {
    @property(Label) lbTitle: Label;
    @property(Label) lbTitleShadow: Label;
    @property(Label) lbPrice: Label;
    @property(Label) lbPriceShadow: Label;
    @property(Node) nClose: Node;
    @property(Node) nSale: Node;

    @property(Node) listNPrize1: Node[] = [];
    @property(Node) listNPrize2: Node[] = [];


    @property(Label) listLbCoin: Label[] = [];
    @property(Label) listLbSort: Label[] = [];
    @property(Label) listLbVip: Label[] = [];
    @property(Label) listLbShuffle: Label[] = [];
    @property(Label) listLbSale: Label[] = [];

    @property(FX_popup) animPackBlackFriday: FX_popup = null;

    @property(Label) lbTime: Label;

    private _infoPack: InfoPackFromRootJson = null;
    private _wasSetData: boolean = false;
    private _timeRemainEndday: number = 0;

    //=====================================================
    //#region baseUI
    public async PrepareDataShow(): Promise<void> {
        // register time
        this._timeRemainEndday = Utils.getTimeLastDay() / 1000 - Utils.getCurrTime();
        this.RegisterTime();

        DataPackBlackFriday.Instance.SavePackWasShowToday();
        this._infoPack = DataPackBlackFriday.Instance.InfoPackCacheNow;
        if (this._infoPack == null) { this.node.active = false; return; }

        // trong trường hợp là pack ads thì sẽ có ads còn pack khác thì sẽ là pack khác
        if (this._infoPack.namePack == "blackfriday_ads") {
            this.nSale.active = false;
            this.listNPrize1.forEach(nCheck => nCheck.active = true);
            this.listNPrize2.forEach(nCheck => nCheck.active = false);
        } else {
            this.nSale.active = true;
            this.listNPrize1.forEach(nCheck => nCheck.active = false);
            this.listNPrize2.forEach(nCheck => nCheck.active = true);

            this.lbPrice.string = `${this._infoPack.price}$`;
            this.lbPriceShadow.string = this.lbPrice.string;
            this.listLbSale.forEach(lbSale => lbSale.string = `${this._infoPack.Sale}%`)
        }

        // update UI
        // this.lbTitle.string = this._infoPack.nameUI;
        // this.lbTitleShadow.string = this._infoPack.nameUI;

        try {
            // update lb prize
            this.UpdateLbItem(this._infoPack.Prizes);
        } catch (e) {
            console.error(e);
        }
    }

    public async UIShowDone(): Promise<void> {
        this.animPackBlackFriday.PlayAnimApearStarterPack();
    }

    public async UICloseDone(): Promise<void> {
        // check can emit conintue lobby
        if (this._dataCustom != null && instanceOfIUIKeepTutAndReceiveLobby(this._dataCustom)) {
            clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
        }
    }

    protected onDisable(): void { this.UnRegisterTime(); }
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
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_BLACK_FRIDAY, 1);
    }

    private onBtnBuyByAds() {
        LogEventManager.Instance.logButtonClick(`buy ads`, this.node.name);

        FBInstantManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
            if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
                this.OnBuySuccessfull();
            }
        });
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
        if (this._infoPack.namePack != "blackfriday_ads") {
            DataInfoPlayer.Instance.CachePackBought(this._infoPack.namePack, 1);
        }

        DataPackBlackFriday.Instance.BuyPackSuccess(false);

        // hide this node and bg shadow
        this.node.active = false;

        // save prize
        PrizeSys.Instance.AddPrize(this._infoPack.Prizes, "UIPopUpPack_Pack_" + this._infoPack.namePack, true, false);

        // emit receive data in lobby
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY, false);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.PACK, this._infoPack.Prizes, `UIPopUpPack_Pack_${this._infoPack.namePack}`, null, null, this._infoPack.nameUI);

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_BLACK_FRIDAY, 1);
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
        const time = this._timeRemainEndday;
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = `${resultTime}`;
        }
    }
    //#endregion time
    //=====================================================
}


