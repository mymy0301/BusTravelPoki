import { _decorator, CCBoolean, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, Vec3 } from 'cc';
import { ConvertStringToEnumNamePack, ConvertTYPE_PRIZEToTYPE_ITEM, convertTYPE_PRIZEtoTYPE_ITEM, EnumNamePack, EnumReasonEndPack, InfoPack, IPrize, TYPE_ITEM, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { CheatingSys } from '../../CheatingSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../../Const/MConst';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import * as I18n from 'db://i18n/LanguageData';
import { Utils } from '../../../Utils/Utils';
import { ItemPrizeLobby } from '../UIReceivePrize/ItemPrizeLobby';
import { ItemPrizeSuperCustom } from '../UIReceivePrize/ItemPrizeSuperCustom';
import { ShopItemPack_Prize_Base } from '../UIShop/Prize/ShopItemPack_Prize_Base';
import { CurrencySys } from '../../CurrencySys';
import { DataItemSys } from '../../DataItemSys';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { DataEventsSys } from '../../DataEventsSys';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
import { DataInfoPlayer } from '../../DataInfoPlayer';
const { ccclass, property } = _decorator;

@ccclass('UIContinue_ItemPack')
export class UIContinue_ItemPack extends Component {
    @property(Label) lbNamePack: Label;
    @property(Label) lbPricePack: Label;
    @property(Label) lbPriceShadowPack: Label;
    @property(Label) lbSalePack: Label;
    @property(Prefab) pfItem: Prefab;
    @property(Node) nLayoutItem: Node;

    @property({ group: { id: 'prefabPrize', name: 'prefabPrize' }, type: Prefab }) pfListItem_1: Prefab;
    @property({ group: { id: 'prefabPrize', name: 'prefabPrize' }, type: Prefab }) pfListItem_2: Prefab;
    @property({ group: { id: 'prefabPrize', name: 'prefabPrize' }, type: Prefab }) pfListItem_3: Prefab;

    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfStartPack: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfGreatDeal: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Sprite }) spIconPack: Sprite;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Label }) lbCoin: Label;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Label }) lbCoinShadow: Label;

    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIcShuffle: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIcVipSlot: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIcSort: SpriteFrame;

    @property({ group: { id: 'Prize', name: 'Prize' } }) defaultRulePrice: boolean = true;
    @property({
        group: { id: 'Prize', name: 'Prize' }
        , visible(this: UIContinue_ItemPack) { return !this.defaultRulePrice; }
        , type: Node
    })
    nLayoutPrize_spe: Node;

    private needTimePack = false;

    @property({
        group: { id: 'Time', name: 'Time' }
        , type: Label
    })
    private lbTimePack: Label;

    @property([Node]) listNTime: Node[] = [];

    private _infoPack: InfoPack = null;
    private _shopItemPack_Prize: ShopItemPack_Prize_Base = null;

    private _cbHideIndexPack: CallableFunction = null;
    private _cbUpdateUIContinue: CallableFunction = null;

    protected onEnable(): void {
        // listen event
        // clientEvent.on(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this); // listen from dataPackSys
        if (this.needTimePack) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
        }
    }

    protected onDisable(): void {
        // clientEvent.off(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this);
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
    }

    public async InitItemPack(dataPack: InfoPack, cbHideIndexPack: CallableFunction, cbUpdateUIContinue: CallableFunction) {
        this._cbHideIndexPack = cbHideIndexPack;
        this._cbUpdateUIContinue = cbUpdateUIContinue;

        this._infoPack = dataPack;

        this.lbNamePack.string = dataPack.nameUI;
        this.lbSalePack.string = `${dataPack.Sale}%`;
        const textPricePack = FBInstantManager.Instance.getPriceIAPPack_byProductID(dataPack.namePack);
        this.lbPricePack.string = textPricePack != null ? textPricePack : `${dataPack.price}$`;
        this.lbPriceShadowPack.string = textPricePack;

        // init item for pack
        if (this.defaultRulePrice) {
            await this.InitListItem(dataPack.Prizes);
        } else {
            await this.InitListItemSpecial(dataPack.Prizes);
        }

        // register time
        this.needTimePack = true;
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);

        // check pack is starterPack or greate deal
        switch (dataPack.namePack) {
            case EnumNamePack.TravelDeal:
                this.spIconPack.spriteFrame = this.sfStartPack;
                break;
            case EnumNamePack.HardLevelOffer: case EnumNamePack.SuperHardLevelOffer:
                this.spIconPack.spriteFrame = this.sfStartPack;
                break;
        }
    }

    public GetIdPack() { return this._infoPack.namePack; }

    private OnBuyItemPack() {
        const price = Number.parseFloat(this._infoPack.price);
        LogEventManager.Instance.logButtonClick("buy", "UIContinue_ItemPack");

        const self = this;

        // check cheating 
        if (CheatingSys.Instance.isCheatStore) {
            // save about data
            this.BuyItemSuccess();
            // play anim receive item
            this.PlayAnimBuyItemSuccessful();
        } else {
            const namePack: string = this._infoPack.namePack;

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
        LogEventManager.Instance.buyPackSuccess(this._infoPack.namePack);
        DataInfoPlayer.Instance.CachePackBought(this._infoPack.namePack);
        const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
        SupLogEvent.LogEventWithIAP(dataEventLog, this._infoPack.nameUI, Number.parseFloat(this._infoPack.price), this._infoPack.namePack, "UIContinue");

        // ================================ update logic ==========================
        let listItemPrize: TYPE_ITEM[] = [];
        let numberItemAdds: number[] = [];
        let typeItem: TYPE_ITEM = null;
        const listPrizes = this._infoPack.Prizes;
        for (let i = 0; i < listPrizes.length; i++) {
            const iPrize = listPrizes[i];
            typeItem = convertTYPE_PRIZEtoTYPE_ITEM(iPrize.typePrize);

            // check is typeItem or not
            if (typeItem != null) {
                listItemPrize.push(typeItem);
                numberItemAdds.push(iPrize.value);
            }

            typeItem = null;
        }

        const enumNamePack: EnumNamePack = ConvertStringToEnumNamePack(this._infoPack.namePack);
        DataPackSys.Instance.AddNumAvailablePackLose(enumNamePack, -1);


        //==================================================================================
        //=============================== check special case in game =======================
        //==================================================================================

        // just only save + emit  when in game
        if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.GAME) {
            this.SaveDataItemWhenBuyDone(listItemPrize, listPrizes, numberItemAdds);
            for (let i = 0; i < listPrizes.length; i++) {
                const typeItem: TYPE_ITEM = ConvertTYPE_PRIZEToTYPE_ITEM(listPrizes[i].typePrize);
                const numItemNow: number = DataItemSys.Instance.GetNumItem(typeItem);
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.UPDATE_NUM_ITEM, typeItem, numItemNow);
            }
        }
    }

    /**
     * just call this func when you are not at lobby and not call play anim item Successful at lobby
     */
    private SaveDataItemWhenBuyDone(listItemPrize: TYPE_ITEM[], listPrizes: IPrize[], numberItemAdds: number[]) {

        // add money and life
        for (let i = 0; i < listPrizes.length; i++) {
            const IPrize: IPrize = listPrizes[i];
            switch (IPrize.typePrize) {
                case TYPE_PRIZE.MONEY:
                    CurrencySys.Instance.AddMoney(IPrize.value, `UIContinue_PACK_${this._infoPack.namePack}`);
                    break;
                case TYPE_PRIZE.TICKET:
                    CurrencySys.Instance.AddTicket(IPrize.value, `UIContinue_PACK_${this._infoPack.namePack}`);
                    break;
            }
        }

        // add item and save data
        DataItemSys.Instance.AddItem(listItemPrize, numberItemAdds, `UIContinue_PACK_${this._infoPack.namePack}`);
    }

    private async PlayAnimBuyItemSuccessful() {
        // chỉ xảy ra trong trường hợp ở in game
        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
    }


    //==========================================
    //#region Init items pack
    private async InitListItem(listPrizes: IPrize[]) {
        for (let i = 0; i < listPrizes.length; i++) {
            const dataPrize: IPrize = listPrizes[i];
            const nIPrize: Node = instantiate(this.pfItem);
            nIPrize.getComponent(ItemPrizeLobby).SetUp(dataPrize, Vec3.ZERO, 0);
            nIPrize.parent = this.nLayoutItem;
        }
    }

    private async InitListItemSpecial(listPrizes: IPrize[]) {

        // bật layout item
        this.nLayoutPrize_spe.active = true;

        // đếm xem có bao nhiêu phần tử ko phải money thì load prefab tương ứng
        // điều này sẽ phụ thuộc vào từng dự án để load cho phù hợp
        const totalPrizeExceptMoney: number = listPrizes.filter(item => item.typePrize != TYPE_PRIZE.MONEY).length;
        // console.log("totalPrizeExceptMoney", totalPrizeExceptMoney);
        let nItemPrizeBase: Node = null;
        switch (totalPrizeExceptMoney) {
            case 1: nItemPrizeBase = instantiate(this.pfListItem_1); break;
            case 2: nItemPrizeBase = instantiate(this.pfListItem_2); break;
            case 3: nItemPrizeBase = instantiate(this.pfListItem_3); break;
        }
        nItemPrizeBase.setParent(this.nLayoutPrize_spe);
        nItemPrizeBase.position = Vec3.ZERO;
        this._shopItemPack_Prize = nItemPrizeBase.getComponent(ShopItemPack_Prize_Base);


        // init prize cho phù hợp
        let indexPrizeSpe: number = 0;
        for (let i = 0; i < listPrizes.length; i++) {
            const dataPrize: IPrize = listPrizes[i];
            if (dataPrize.typePrize == TYPE_PRIZE.MONEY) {
                this.lbCoin.string = dataPrize.value.toString();
                this.lbCoinShadow.string = dataPrize.value.toString();
                continue;
            }

            // set item prize
            const itemPrizeCom: ItemPrizeSuperCustom = this._shopItemPack_Prize.listItems[indexPrizeSpe];
            if (itemPrizeCom == null) return;
            itemPrizeCom.SetUp_2(dataPrize, Vec3.ZERO, 'x', this.GetSfPrizeSuit(dataPrize.typePrize));
            itemPrizeCom.node.active = true;
            // increase index
            indexPrizeSpe += 1;
        }
    }

    private GetSfPrizeSuit(typePrize: TYPE_PRIZE) {
        switch (typePrize) {
            case TYPE_PRIZE.SORT: return this.sfIcSort;
            case TYPE_PRIZE.VIP_SLOT: return this.sfIcVipSlot;
            case TYPE_PRIZE.SHUFFLE: return this.sfIcShuffle;
        }
    }
    //#endregion Init items pack
    //==========================================

    //==========================================
    //#region listen func
    private RemovePack(reasonEndPack: EnumReasonEndPack, namePack: EnumNamePack) {
        if (namePack == this._infoPack.namePack) {
            this.node.active = false;
        }
    }

    private UpdateUILbTime() {
        const timeNow = Utils.getCurrTime();
        const enumNamePack: EnumNamePack = ConvertStringToEnumNamePack(this._infoPack.namePack);
        const infoPack = DataPackSys.Instance.GetInfoPackLoseSave(enumNamePack);
        if (infoPack == null) return;
        const timeLimit = infoPack.timeLimit;
        const timeRemaining = timeLimit - timeNow;

        if (timeRemaining < 0 && this.node.active) {
            // force turn off pack can not click any more
            this.node.active = false;
            this._cbHideIndexPack && this._cbHideIndexPack(EnumReasonEndPack.EndTime, infoPack.namePack);
            this._cbUpdateUIContinue && this._cbUpdateUIContinue();
        } else {
            this.lbTimePack.string = Utils.convertTimeLengthToFormat(timeRemaining);
        }
    }
    //#endregion listen func
    //==========================================
}


