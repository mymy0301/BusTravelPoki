import { _decorator, CCFloat, Component, Label, Node, RichText, Sprite, SpriteFrame, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { GameSoundEffect, GetNameTypeItem, IPopUpBuyItemInGame, TYPE_CURRENCY, TYPE_ITEM, TYPE_QUEST_DAILY } from '../../../Utils/Types';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { DataItemSys } from '../../DataItemSys';
import { VisualCoinInGame } from '../Others/VisualCoinInGame';
import { CurrencySys } from '../../CurrencySys';
import { DataCustomUIShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../UIShop/TypeShop';
import { MConfigs } from '../../../Configs/MConfigs';
import { GameSys } from '../../GameScene/GameSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { SoundSys } from '../../../Common/SoundSys';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';
const { ccclass, property } = _decorator;

@ccclass('UIPopUpBuyItem')
export class UIPopUpBuyItem extends UIBaseSys {
    @property(VisualCoinInGame) VisualCoinInGame: VisualCoinInGame;
    @property(Label) lbTitle: Label;
    @property(Label) lbTitleShadow: Label;
    @property(RichText) lbContent: RichText;
    @property(Label) lbPriceShadow: Label;
    @property(Label) lbPrice: Label;
    @property(Sprite) spIcon: Sprite;
    @property(Node) nBtnCoin_Disable: Node;
    @property(Label) lbPriceShadow_Disable: Label;
    @property(Label) lbPrice_Disable: Label;
    @property(Sprite) spIcon_Disable: Sprite;
    @property({ tooltip: "remember it follow the rule TYPE_ITEM", type: [SpriteFrame] }) listSfIcon: SpriteFrame[] = [];

    @property(Node) nBtnCoin: Node;
    @property(Node) nBtnWatchAds: Node;

    @property(Sprite) spIcAds: Sprite;
    // @property(SpriteFrame) sfAds: SpriteFrame;
    // @property(SpriteFrame) sfTicket: SpriteFrame;
    @property(Label) lbWatchedAds: Label;
    @property(Label) lbShadowWatchedAds: Label;

    @property(CCFloat) diffPosX_IcVip: number = 10;
    @property(CCFloat) diffPosY_IcVip: number = -5;
    @property(CCFloat) diffPosY_textVip: number = -10;
    private _base_pos_icon: Vec3 = new Vec3(0, 94.244, 0);
    private _baseY_textContent: number = -57.184;
    private readonly _posNBtnCoinWhen2Btn: Vec3 = new Vec3(-144.629, -182.377, 0);
    private _dataPopUpBuyItem: IPopUpBuyItemInGame = null;

    protected onEnable(): void {
        super.onEnable();
        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);
    }

    //#region func base UI
    public async PrepareDataShow(): Promise<void> {
        // update visual
        if (this._dataCustom != null) {
            let jsonUI: IPopUpBuyItemInGame = this._dataCustom as IPopUpBuyItemInGame;
            this._dataPopUpBuyItem = jsonUI;
            this.lbTitle.string = this.GetNameTitle(jsonUI.typeItemBuy);
            this.lbTitleShadow.string = this.GetNameTitle(jsonUI.typeItemBuy);
            this.lbPrice.string = this.GetPrice(jsonUI.typeItemBuy).toString();
            this.lbPriceShadow.string = this.GetPrice(jsonUI.typeItemBuy).toString();

            this.lbPrice_Disable.string = this.GetPrice(jsonUI.typeItemBuy).toString();
            this.lbPriceShadow_Disable.string = this.GetPrice(jsonUI.typeItemBuy).toString();

            if(CurrencySys.Instance.GetMoney() >= this.GetPrice(jsonUI.typeItemBuy)) {
                this.nBtnCoin_Disable.active = false;
            }else {
                this.nBtnCoin_Disable.active = true;
            }

            const posY: number = (jsonUI.typeItemBuy == TYPE_ITEM.VIP_SLOT ? this.diffPosY_textVip : 0) + this._baseY_textContent;
            this.lbContent.node.setPosition(0, posY, 0);
            this.lbContent.string = this.GetContent(jsonUI.typeItemBuy);

            switch (jsonUI.typeItemBuy) {
                case TYPE_ITEM.SORT: 
                    this.spIcon.spriteFrame = this.listSfIcon[0]; 
                    this.spIcon.node.setPosition(this._base_pos_icon.clone()); 
                    this.spIcon_Disable.spriteFrame = this.listSfIcon[0]; 
                    this.spIcon_Disable.node.setPosition(this._base_pos_icon.clone()); 
                    break;
                case TYPE_ITEM.SHUFFLE: 
                    this.spIcon.spriteFrame = this.listSfIcon[1]; 
                    this.spIcon.node.setPosition(this._base_pos_icon.clone()); 
                    this.spIcon_Disable.spriteFrame = this.listSfIcon[1]; 
                    this.spIcon_Disable.node.setPosition(this._base_pos_icon.clone()); 
                    break;
                case TYPE_ITEM.VIP_SLOT: 
                    this.spIcon.spriteFrame = this.listSfIcon[2]; 
                    this.spIcon.node.setPosition(this._base_pos_icon.clone().add3f(this.diffPosX_IcVip, this.diffPosY_IcVip, 0)); 
                    this.spIcon_Disable.spriteFrame = this.listSfIcon[2]; 
                    this.spIcon_Disable.node.setPosition(this._base_pos_icon.clone().add3f(this.diffPosX_IcVip, this.diffPosY_IcVip, 0)); 
                    break;
            }

            this.UpdateUI();
        }

        // update button ads
        this.UpdateBtnAds();
    }
    //#endregion func base UI

    //#region self func
    private GetNameTitle(typeItem: TYPE_ITEM): string {
        switch (typeItem) {
            case TYPE_ITEM.SORT: return "SORT";
            case TYPE_ITEM.SHUFFLE: return "SHUFFLE";
            case TYPE_ITEM.VIP_SLOT: return "VIP SLOT";
        }
    }

    private GetContent(typeItem: TYPE_ITEM): string {
        function getTextGreen(text: string): string {
            return `<color=#219A00>${text}</color>`;
        }

        function getTextYellow(text: string): string {
            return `<color=#f69134>${text}</color>`;
        }

        switch (typeItem) {
            case TYPE_ITEM.SORT: return `<color=#33416e>Sort the ${getTextGreen("Passengers")} according to\nvehicle colors</color>`;
            case TYPE_ITEM.SHUFFLE: return `<color=#33416e>Rearrange the ${getTextGreen("Colors")} of the\nvehicles in parking lot</color>`;
            case TYPE_ITEM.VIP_SLOT: return `<color=#33416e>Move any ${getTextGreen("Car")} to the ${getTextGreen("V.I.P Parking Space")}</color>`;
        }
    }

    private GetPrice(typeItem: TYPE_ITEM): number {
        switch (typeItem) {
            case TYPE_ITEM.SORT: return 1500;
            case TYPE_ITEM.SHUFFLE: return 800;
            case TYPE_ITEM.VIP_SLOT: return 1200;
        }
    }

    private UpdateBtnAds() {
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     this.spIcAds.spriteFrame = this.sfTicket;
        //     this.lbWatchedAds.string = "Free(1)";
        //     this.lbShadowWatchedAds.string = "Free(1)";
        // } else {
        //     this.spIcAds.spriteFrame = this.sfAds;
        //     this.lbWatchedAds.string = "Free(1)";
        //     this.lbShadowWatchedAds.string = "Free(1)";
        // }
    }
    //#endregion self func

    //#region UI
    private UpdateUI() {
        // let canShowBtnWatchAds: boolean = true;
        // // kiểm tra xem có ticket sử dụng hay không
        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     canShowBtnWatchAds = true;
        // }
        // // kiểm tra xem lượt này có xem được quảng cáo hya không
        // if (GameSys.Instance.CheckWatchedAdsBuyItem(this._dataPopUpBuyItem.typeItemBuy)) {
        //     canShowBtnWatchAds = false;
        // }

        // if (canShowBtnWatchAds) {
        //     this.nBtnCoin.position = this._posNBtnCoinWhen2Btn;
        //     this.nBtnWatchAds.active = true;
        // } else {
        //     this.nBtnCoin.position = new Vec3(0, this._posNBtnCoinWhen2Btn.y, 0);
        //     this.nBtnWatchAds.active = false;
        // }
    }
    //#endregion UI

    //#region func btn
    private async AddMoreItemSuccess() {
        // ||**DQ**||
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_BUY_SUCCESS);
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.BUY_ITEM_BOOSTER, 1);

        DataItemSys.Instance.AddItem([this._dataCustom.typeItemBuy], [1], `UIPopUpBuyItem`);
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_BUY_ITEM, 1, () => {
            // if buy success use it now
            clientEvent.dispatchEvent(MConst.EVENT.USE_ITEM_WHEN_BUY_SUCCESS, this._dataCustom.typeItemBuy);
        });
        clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
    }

    private BtnWatchAds() {
        LogEventManager.Instance.logButtonClick(`${GetNameTypeItem(this._dataCustom.typeItemBuy)}_ads`, "UIPopUpBuyItem");

        const self = this;

        async function UseSuccess() {
            self.AddMoreItemSuccess();
            self.UpdateBtnAds();
            GameSys.Instance.SetWatchedAdsBuyItem(self._dataPopUpBuyItem.typeItemBuy);
            self.UpdateUI();
        }

        // if (CurrencySys.Instance.GetTicket() > 0) {
        //     CurrencySys.Instance.AddTicket(-1, `UIPopUpBuyItem`);
        //     UseSuccess()
        //     return;
        // }

        // FBInstantManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
        //     if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
        //         UseSuccess();
        //     }
        // })

        PokiSDKManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
            if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
                UseSuccess();
            }
        });
    }

    private BtnBuyItemByMoney() {
        LogEventManager.Instance.logButtonClick(`${GetNameTypeItem(this._dataCustom.typeItemBuy)}_coin`, "UIPopUpBuyItem");

        const prizeCoin = this.GetPrice(this._dataCustom.typeItemBuy);

        if (CurrencySys.Instance.AddMoney(-prizeCoin, `UIPopUpBuyItem_${this._dataCustom.typeItemBuy}`, true)) {
            this.AddMoreItemSuccess();
        } else {
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Not enough Coins!");

            // Close this UI and open UIShop to coin
            // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, TYPE_UI.UI_POPUP_BUY_ITEM, 2);
            // // if pass all case show ui shop
            // let dataCustomUIShop: DataCustomUIShop = {
            //     isActiveClose: true,
            //     openUIAfterClose: null,
            //     pageViewShop_ScrollTo: MConfigs.numIAPTicketHave > 0 ? PAGE_VIEW_SHOP.COIN : PAGE_VIEW_SHOP_2.COIN,
            //     canAutoResumeGame: true
            // }
            // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SHOP_SHORT, 2, true, dataCustomUIShop, false);

        }
    }

    private BtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIPopUpBuyItem");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_POPUP_BUY_ITEM, 1);
        clientEvent.dispatchEvent(MConst.EVENT.RESUME_GAME);
    }
    //#endregion func btn
}


