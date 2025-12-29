import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { InfoPack, InfoPackChristmasAFO, instanceOfIUIKeepTutAndReceiveLobby, IPrize, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
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
import { FormInputPackAFO } from './FormInputPackAFO';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIPackChristmasAFO')
export class UIPackChristmasAFO extends UIBaseSys {
    @property(Label) lbPriceTotal: Label;
    @property(Label) lbPriceTotalShadow: Label;
    @property(Node) nClose: Node;
    @property(Label) lbTime: Label;

    @property(FormInputPackAFO) listFormInputPackAFO: FormInputPackAFO[] = [];

    private _infoPack: InfoPackChristmasAFO = null;
    private _timeRemain: number = 0;

    //=====================================================
    //#region baseUI
    public async PrepareDataShow(): Promise<void> {
        this._infoPack = DataChristmasSys.Instance.InfoPackChristmasWorking;
        if (this._infoPack == null) { this.node.active = false; return; }

        this.UpdateUITime();

        // update lb prize
        this.UpdateUIPacks();

        this.lbPriceTotal.string = this.lbPriceTotalShadow.string = `${this._infoPack.PriceTotal}$`;
    }

    protected onDisable(): void {
        this.UnRegisterTime();
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
    //#endregion baseUI
    //=====================================================

    //=====================================================
    //#region private
    private UpdateUIPacks() {
        this._infoPack.allPack.forEach((pack, index) => {
            if (this.listFormInputPackAFO[index]) {
                this.listFormInputPackAFO[index].SetUp(
                    this._infoPack.namePack,
                    index,
                    pack,
                    () => {
                        this.OnBuySuccessfull(pack.namePack, pack.Prizes);
                    }
                );
            }
        });
    }
    //#endregion private
    //=====================================================

    //=====================================================
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, this.node.name);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PACK_CHRISTMAS_AFO, 1);
    }

    private onBtnBuyPack() {
        const price = Number.parseFloat(this._infoPack.PriceTotal);
        LogEventManager.Instance.logButtonClick(`buy`, this.node.name);

        const self = this;
        const namePack = this._infoPack.namePack;
        let totalPrize: IPrize[] = [];
        this.listFormInputPackAFO.forEach((form, index) => {
            if (form && this._infoPack.allPack[index]) {
                const totalPrizeCheck = this._infoPack.allPack[index].Prizes;
                totalPrizeCheck.forEach(prizeCheck => {
                    const existingPrize = totalPrize.find(prize => prize.typePrize === prizeCheck.typePrize && prize.typeReceivePrize == prizeCheck.typeReceivePrize);
                    if (existingPrize) {
                        existingPrize.value += prizeCheck.value;
                    } else {
                        totalPrize.push(prizeCheck);
                    }
                });
            }
        });

        DataInfoPlayer.Instance.CachePackBought(namePack, 1);
        LogEventManager.Instance.logIAP_PurchaseItem(namePack, price)

        // else call check buy pack
        FBInstantManager.Instance.getListIAP_Purchase((err: Error, success: string) => {
            if (err) {
                FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
                    if (err) {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                    } else {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                        self.OnBuySuccessfull(namePack, totalPrize);
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
                            self.OnBuySuccessfull(namePack, totalPrize);
                        }
                    });
                } else {
                    FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
                        if (err) {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                        } else {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                            self.OnBuySuccessfull(namePack, totalPrize);
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
    private async OnBuySuccessfull(namePack: string, listPrize: IPrize[]) {
        DataChristmasSys.Instance.BuyPackSuccess(false);
        DataInfoPlayer.Instance.CachePackBought(namePack);

        // hide this node and bg shadow
        this.node.active = false;

        // save prize
        PrizeSys.Instance.AddPrize(listPrize, "UIPopUpPack_Pack_" + namePack, true, false);

        // emit receive data in lobby
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY, false);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.PACK, listPrize, `UIPopUpPack_Pack_${namePack}`, null, null, this._infoPack.nameUI);

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


