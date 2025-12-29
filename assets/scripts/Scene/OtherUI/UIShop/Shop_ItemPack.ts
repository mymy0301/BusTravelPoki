import { _decorator, CCBoolean, Color, Component, instantiate, Label, Layout, Node, Prefab, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { ConvertStringToEnumNamePack, ConvertTYPE_PRIZEToTYPE_ITEM, convertTYPE_PRIZEtoTYPE_ITEM, ENamePACK_UNLIMITED, EnumNamePack, EnumReasonEndPack, InfoPack, IPrize, TYPE_ITEM, TYPE_PRIZE, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
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
import { ShopItemPack_Prize_Base } from './Prize/ShopItemPack_Prize_Base';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { DataItemSys } from '../../DataItemSys';
import { CurrencySys } from '../../CurrencySys';
import { Shop_ItemPack_Ribbon } from './Shop_ItemPack_Ribbon';
import { DataEventsSys } from '../../DataEventsSys';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
import { DataHalloweenSys } from '../../../DataBase/DataHalloweenSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { DataChristmasSys } from '../../../DataBase/DataChristmasSys';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemPack')
export class Shop_ItemPack extends Component {
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
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIconSmallBundle: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIconMediumBundle: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIconLargeBundle: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIconHalloween: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfBgPackNormal: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfBgPackHalloween: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Sprite }) spIconPack: Sprite;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Sprite }) spBgHalloween: Sprite;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Sprite }) spBgNormal: Sprite;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Sprite }) listSpBgPackItem: Sprite[] = [];
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Sprite }) spLightNormal: Sprite;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Sprite }) spLightHalloween: Sprite;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Label }) lbCoin: Label;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Label }) lbCoinShadow: Label;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Node }) nSale: Node;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: Shop_ItemPack_Ribbon }) nRibbon: Shop_ItemPack_Ribbon;

    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIcShuffle: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIcVipSlot: SpriteFrame;
    @property({ group: { id: 'VisualIcon', name: 'VisualIcon' }, type: SpriteFrame }) sfIcSort: SpriteFrame;

    @property({ group: { id: 'BtnBuy', name: 'BtnBuy' }, type: SpriteFrame }) sfBtnBuyNormal: SpriteFrame;
    @property({ group: { id: 'BtnBuy', name: 'BtnBuy' }, type: SpriteFrame }) sfBtnBuyChirst: SpriteFrame;
    @property({ group: { id: 'BtnBuy', name: 'BtnBuy' }, type: Sprite }) spVisualBtnBuy: Sprite;

    @property({ group: { id: 'christ', name: 'christ' }, type: Node }) listNDecoCrist: Node[] = [];

    @property({ group: { id: 'Prize', name: 'Prize' } }) defaultRulePrice: boolean = true;
    @property({
        group: { id: 'Prize', name: 'Prize' }
        , visible(this: Shop_ItemPack) { return !this.defaultRulePrice; }
        , type: Node
    })
    nLayoutPrize_spe: Node;

    @property({
        group: { id: 'Time', name: 'Time' }
    })
    private needTimePack = false;

    @property({
        group: { id: 'Time', name: 'Time' }
        , visible(this: Shop_ItemPack) { return this.needTimePack; }
        , type: Label
    })
    private lbTimePack: Label;

    private _infoPack: InfoPack = null; public get InfoPack() { return this._infoPack; }
    private _shopItemPack_Prize: ShopItemPack_Prize_Base = null;

    private _colorText_halloween = new Color().fromHEX("#015356");
    private _colorText_halloween_shadow = new Color().fromHEX("#0b2885");

    private _colorText_title_normal = new Color().fromHEX("#431182");
    private _colorText_title_christ = new Color().fromHEX("#133a81");

    private _colorText_normal = new Color().fromHEX("#71110E");
    private _colorText_normal_shadow = new Color().fromHEX("#71110E");

    private _nItemPrize: Node = null;

    protected onEnable(): void {
        // listen event
        if (!clientEvent.isOnEvent(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this)) {
            clientEvent.on(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this); // listen from dataPackSys
        }
        if (this.needTimePack) {
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
        }
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT_PACK.REMOVE_PACK, this.RemovePack, this);
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUILbTime, this);
    }

    public async InitItemPack(dataPack: InfoPack, force: boolean = false) {
        this.node.active = true;
        this.node.scale = Vec3.ONE.clone();

        this._infoPack = dataPack;

        this.lbNamePack.string = dataPack.nameUI;
        const textPricePack = FBInstantManager.Instance.getPriceIAPPack_byProductID(dataPack.namePack);
        this.lbPricePack.string = textPricePack != null ? textPricePack : `${dataPack.price}$`;
        this.lbPriceShadowPack.string = textPricePack != null ? textPricePack : `${dataPack.price}$`;

        // check need set ribbon
        dataPack.isBestSellerRibbon ? this.nRibbon.Show() : this.nRibbon.Hide();

        // check need set sale
        if (dataPack.Sale > 0) {
            this.lbSalePack.string = `${dataPack.Sale}%`;
        } else {
            this.nSale.active = false;
        }

        // init item for pack
        if (this.defaultRulePrice) {
            await this.InitListItem(dataPack.Prizes);
        } else {
            if (force) {
                // destroy item và init lại
                this.nLayoutPrize_spe.removeAllChildren();
                this._shopItemPack_Prize = null;
            }
            await this.InitListItemSpecial(dataPack.Prizes);
        }

        // console.log(dataPack.namePack);

        //reset UI to normal
        this.spBgNormal.node.active = true;
        this.spBgHalloween.node.active = false;
        this.spLightNormal.node.active = true; this.spLightHalloween.node.active = false;
        this.listSpBgPackItem.forEach(spBgPack => { spBgPack.spriteFrame = this.sfBgPackNormal; })
        this._shopItemPack_Prize.ChangeColorTextPrize(this._colorText_normal, this._colorText_normal_shadow);
        this.lbCoin.outlineColor = this._colorText_normal;
        this.lbCoinShadow.color = this._colorText_normal_shadow;
        this.lbCoinShadow.outlineColor = this._colorText_normal_shadow;
        this.spVisualBtnBuy.spriteFrame = this.sfBtnBuyNormal;
        this.lbNamePack.outlineColor = this._colorText_title_normal;
        this.listNDecoCrist.forEach(n => n.active = false);

        // check pack is starterPack or greate deal
        switch (true) {
            case dataPack.namePack == EnumNamePack.StartedPack:
                this.spIconPack.spriteFrame = this.sfStartPack;
                break;
            case dataPack.namePack == EnumNamePack.GreateDealsPack_1: case dataPack.namePack == EnumNamePack.GreateDealsPack_2:
                this.spIconPack.spriteFrame = this.sfGreatDeal;
                break;
            case dataPack.type == "IAP_INFINITY" && dataPack.namePack == ENamePACK_UNLIMITED.SmallBundle:
                this.spIconPack.spriteFrame = this.sfIconSmallBundle;
                break;
            case dataPack.type == "IAP_INFINITY" && dataPack.namePack == ENamePACK_UNLIMITED.MediumBundle:
                this.spIconPack.spriteFrame = this.sfIconMediumBundle;
                break;
            case dataPack.type == "IAP_INFINITY" && dataPack.namePack == ENamePACK_UNLIMITED.LargeBundle:
                this.spIconPack.spriteFrame = this.sfIconLargeBundle;
                break;
            case dataPack.type == 'CHRISTMAS':
                this.lbNamePack.outlineColor = this._colorText_title_christ;
                this.listNDecoCrist.forEach(n => n.active = true);
            // NOTE: not break here => if break copy code below case to this
            case dataPack.type == 'HALLOWEEN':
                this.spIconPack.spriteFrame = this.sfIconHalloween;
                this.spBgHalloween.node.active = true;
                this.spBgNormal.node.active = false;
                this.spLightNormal.node.active = false; this.spLightHalloween.node.active = true;
                this.listSpBgPackItem.forEach(spBgPack => { spBgPack.spriteFrame = this.sfBgPackHalloween; })
                this._shopItemPack_Prize.ChangeColorTextPrize(this._colorText_halloween, this._colorText_halloween_shadow);
                this.lbCoin.outlineColor = this._colorText_halloween;
                this.lbCoinShadow.color = this._colorText_halloween_shadow;
                this.lbCoinShadow.outlineColor = this._colorText_halloween_shadow;
                this.spVisualBtnBuy.spriteFrame = this.sfBtnBuyChirst;
                break;
        }
    }

    public GetIdPack() { return this._infoPack.namePack; }

    private OnBuyItemPack() {
        const price = Number.parseFloat(this._infoPack.price);
        LogEventManager.Instance.logButtonClick(`buy_${this._infoPack.namePack}`, "UIShop");

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
        switch (this._infoPack.type) {
            case 'HALLOWEEN':
                DataHalloweenSys.Instance.BuyPackSuccess(false);
                break;
            case 'CHRISTMAS':
                DataChristmasSys.Instance.BuyPackSuccess(false);
                break;
        }

        // log event
        LogEventManager.Instance.buyPackSuccess(this._infoPack.namePack);
        DataInfoPlayer.Instance.CachePackBought(this._infoPack.namePack);
        const listPrizes = this._infoPack.Prizes;

        const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
        SupLogEvent.LogEventWithIAP(dataEventLog, this._infoPack.nameUI, Number.parseFloat(this._infoPack.price), this._infoPack.namePack, "Shop");

        // ================================ update logic ==========================
        let listItemPrize: TYPE_ITEM[] = [];
        let numberItemAdds: number[] = [];
        let typeItem: TYPE_ITEM = null;
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

        // save pack
        const enumNamePack: EnumNamePack = ConvertStringToEnumNamePack(this._infoPack.namePack);
        if (this._infoPack.type == 'IAP') {
            DataPackSys.Instance.AddNumAvailablePack(enumNamePack, -1);
        }

        // just only save + emit unlock event when in game
        if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.GAME) {
            this.SaveDataItemWhenBuyDone_game(listItemPrize, listPrizes, numberItemAdds);
            for (let i = 0; i < listPrizes.length; i++) {
                const typeItem: TYPE_ITEM = ConvertTYPE_PRIZEToTYPE_ITEM(listPrizes[i].typePrize);
                const numItemNow: number = DataItemSys.Instance.GetNumItem(typeItem);
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.UPDATE_NUM_ITEM, typeItem, numItemNow);
            }
        } else {
            this.SaveDataItemWhenBuyDone_lobby(listItemPrize, listPrizes, numberItemAdds);
        }
    }

    /**
    * just call this func when you are not at lobby and not call play anim item Successful at lobby
    */
    private SaveDataItemWhenBuyDone_game(listItemPrize: TYPE_ITEM[], listPrizes: IPrize[], numberItemAdds: number[]) {

        // add money and life
        for (let i = 0; i < listPrizes.length; i++) {
            const IPrize: IPrize = listPrizes[i];
            switch (IPrize.typePrize) {
                case TYPE_PRIZE.MONEY:
                    CurrencySys.Instance.AddMoney(IPrize.value, `SHOP_PACK_${this._infoPack.namePack}`);
                    break;
                case TYPE_PRIZE.TICKET:
                    CurrencySys.Instance.AddTicket(IPrize.value, `SHOP_PACK_${this._infoPack.namePack}`);
                    break;
            }
        }

        // add item and save data
        DataItemSys.Instance.AddItem(listItemPrize, numberItemAdds, `SHOP_PACK_${this._infoPack.namePack}`);
    }

    private SaveDataItemWhenBuyDone_lobby(listItemPrize: TYPE_ITEM[], listPrizes: IPrize[], numberItemAdds: number[]) {
        // add money and life
        for (let i = 0; i < listPrizes.length; i++) {
            const IPrize: IPrize = listPrizes[i];
            switch (IPrize.typePrize) {
                case TYPE_PRIZE.MONEY:
                    CurrencySys.Instance.AddMoney(IPrize.value, `SHOP_PACK_${this._infoPack.namePack}`, true, false);
                    break;
                case TYPE_PRIZE.TICKET:
                    CurrencySys.Instance.AddTicket(IPrize.value, `SHOP_PACK_${this._infoPack.namePack}`, true, false);
                    break;
            }
        }

        // add item and save data
        DataItemSys.Instance.AddItem(listItemPrize, numberItemAdds, `SHOP_PACK_${this._infoPack.namePack}`);
    }

    private async PlayAnimBuyItemSuccessful() {
        const listPrizes: IPrize[] = this._infoPack.Prizes;

        // check in case player buy item of shop lobby
        if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.LOBBY) {
            // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SHOP_PACK, this._infoPack.Prizes, `SHOP_PACK_${this._infoPack.namePack}`, null, null, this._infoPack.nameUI);
            // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        }
        else if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.GAME) {
            // notification buy item successfull
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
        }
    }

    //=======================================================
    //#region Init items pack
    private async InitListItem(listPrizes: IPrize[]) {
        for (let i = 0; i < listPrizes.length; i++) {
            const dataPrize: IPrize = listPrizes[i];
            this._nItemPrize = instantiate(this.pfItem);
            this._nItemPrize.getComponent(ItemPrizeLobby).SetUp(dataPrize, Vec3.ZERO, 0);
            this._nItemPrize.parent = this.nLayoutItem;
        }
    }

    private async InitListItemSpecial(listPrizes: IPrize[]) {
        //nếu đã có item => ko init nữa
        if (this._shopItemPack_Prize != null) { return; }

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
    //=======================================================

    //=======================================================
    //#region listen func
    private RemovePack(reasonEndPack: EnumReasonEndPack, namePack: EnumNamePack) {
        // console.log(reasonEndPack, namePack);
        // return;
        if (this._infoPack != null && namePack == this._infoPack.namePack) {
            try {
                const comLayoutParent: Layout = this.node.parent.getComponent(Layout);
                this.node.getComponent(UIOpacity).opacity = 0;
                tween(this.node)
                    .to(1, { scale: new Vec3(1, 0, 1) }, {
                        easing: 'smooth', onUpdate(target, ratio) {
                            comLayoutParent.updateLayout(true);
                        },
                    })
                    .call(() => {
                        this.node.active = false;
                        clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_SCROLL_SHOP);
                    })
                    .start();
            } catch (e) {
                console.error(e);
            }
        }
    }

    private UpdateUILbTime() {
        const timeNow = Utils.getCurrTime();
        const enumNamePack: EnumNamePack = ConvertStringToEnumNamePack(this._infoPack.namePack);
        const infoPackStarter = DataPackSys.Instance.getInfoPackSave(enumNamePack);
        const timeLimit = infoPackStarter.timeLimit;
        const timeRemaining = timeLimit - timeNow;

        if (timeRemaining <= 0) {
            // force turn off pack can not click any more
            this.node.active = false;
        } else {
            this.lbTimePack.string = Utils.convertTimeLengthToFormat(timeRemaining);
        }
    }
    //#endregion listen func
    //=======================================================
}


