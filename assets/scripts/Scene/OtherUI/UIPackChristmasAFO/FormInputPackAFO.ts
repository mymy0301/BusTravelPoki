/**
 * 
 * anhngoxitin01
 * Sun Nov 30 2025 09:18:54 GMT+0700 (Indochina Time)
 * Bibibla_template_script
 * db://assets/scripts/Scene/OtherUI/UIPackChristmasAFO/Bibibla_template_script.ts
*
*/
import { _decorator, Component, Label, Node } from 'cc';
import { IPrize } from '../../../Utils/Types';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { DataInfoPlayer } from '../../DataInfoPlayer';

const { ccclass, property } = _decorator;

@ccclass('FormInputPackAFO')
export class FormInputPackAFO extends Component {
    @property(Label) listLbItem: Label[] = [];
    @property(Label) listLbPrice: Label[] = [];

    private _idPack: string = '';
    private _indexPack: number = 0;
    private _infoPack: { namePack: string, price: number, Prizes: IPrize[] }; public get InfoPack() { return this._infoPack; }
    private cbBuyDone: () => void = null;


    public SetUp(_idPack: string, indexPack: number, infoPack: { namePack: string, price: number, Prizes: IPrize[] }, cbBuyDone?: () => void) {
        this._infoPack = infoPack;
        this._indexPack = indexPack;
        this._idPack = _idPack;
        this.cbBuyDone = cbBuyDone || null;

        this.UpdateUI(infoPack);
    }

    private UpdateUI(infoPack: { namePack: string, price: number, Prizes: IPrize[] }) {
        Array.from(infoPack.Prizes).reverse().forEach((prize, index) => {
            this.listLbItem[index * 2].string = this.listLbItem[index * 2 + 1].string = prize.GetStringValue_2();
        });
        this.listLbPrice.forEach(lbPrice => { lbPrice.string = `${infoPack.price}$` });
    }


    private onBtnBuyPack() {
        const price = this._infoPack.price;
        LogEventManager.Instance.logButtonClick(`buy`, `pack_choose_one`);

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

    private OnBuySuccessfull() {
        if (this.cbBuyDone) {
            this.cbBuyDone();
        }
    }
}