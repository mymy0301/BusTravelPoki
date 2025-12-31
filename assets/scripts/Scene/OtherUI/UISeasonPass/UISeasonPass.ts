import { _decorator, Component, Label, Node, ProgressBar, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { ReadDataJson } from '../../../ReadDataJson';
import { CaculTimeEvents2 } from '../../LobbyScene/CaculTimeEvents2';
import { addIPrizeToList, instanceOfIOpenUIBaseWithInfo, instanceOfIUIKeepTutAndReceiveLobby, IPrize, IUIKeepTutAndReceiveLobby, TYPE_EVENT_GAME, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConfigs } from '../../../Configs/MConfigs';
import * as I18n from 'db://i18n/LanguageData';
import { ListPrizeSeasonPass } from './ListPrizeSeasonPass';
import { DataSeasonPassSys } from '../../../DataBase/DataSeasonPassSys';
import { ItemPrizeSeasonPass, STATE_ITEM_PRIZE_SEASON_PASS } from './ItemPrizeSeasonPass';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { BubbleSys } from '../Others/Bubble/BubbleSys';
import { CONFIG_SP, EVENT_SEASON_PASS } from './TypeSeasonPass';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { CheatingSys } from '../../CheatingSys';
import { DataShopSys } from '../../DataShopSys';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { DataInfoPlayer } from '../../DataInfoPlayer';
const { ccclass, property } = _decorator;

@ccclass('UISeasonPass')
export class UISeasonPass extends UIBaseSys {
    @property({ group: "Header", type: Label }) lbTime: Label;
    @property({ group: "Header", type: Label }) lbProgressLevel: Label;
    @property({ group: "Header", type: Label }) lbLevel: Label;
    @property({ group: "Header", type: ProgressBar }) progressLevel: ProgressBar;
    // @property({ group: "Header", type: Node }) btnActivePass: Node;
    @property({ group: "Header", type: InfoUIBase }) info: InfoUIBase;
    @property(ListPrizeSeasonPass) listPrizeSeasonPass: ListPrizeSeasonPass;
    @property(BubbleSys) bubbleSys: BubbleSys;
    @property(Node) nLockPrize: Node;
    @property(Node) viewScroll: Node;
    @property(Node) contentScroll: Node;
    // @property(Node) nNoti: Node;

    private _isUIClosed: boolean = false;
    private _idBundle: string = '';

    protected onLoad(): void {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        clientEvent.on(EVENT_SEASON_PASS.ACTIVE_SUCCESS_PASS, this.ActiveUIPass, this);
        clientEvent.on(EVENT_SEASON_PASS.RECEIVE_CHEST, this.PlayAnimReceiveChest, this);
        clientEvent.on(EVENT_SEASON_PASS.RECEIVE_LIST_ITEM_PRIZE, this.ReceiveListItemPrize, this);

        this._idBundle = DataShopSys.Instance.getIdBundle('SeasonPass');
    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        clientEvent.off(EVENT_SEASON_PASS.ACTIVE_SUCCESS_PASS, this.ActiveUIPass, this);
        clientEvent.off(EVENT_SEASON_PASS.RECEIVE_CHEST, this.PlayAnimReceiveChest, this);
        clientEvent.off(EVENT_SEASON_PASS.RECEIVE_LIST_ITEM_PRIZE, this.ReceiveListItemPrize, this);
    }

    protected start(): void {
        // set anchor view cho bubble notification để kích hoạt chế độ auto choice bubble
        this.bubbleSys.SetAnchorView(this.listPrizeSeasonPass.viewSV.worldPosition)
    }

    //#region UI base func
    public async UIShowDone(): Promise<void> {
        // check data custom that player show UI from tut => show info UI
        if (this._dataCustom != null && this._dataCustom.length > 0) {
            const indexDataAny = this._dataCustom.findIndex(dataAny => instanceOfIOpenUIBaseWithInfo(dataAny));
            if (indexDataAny != -1) {
                this.btnShowInfo();
            }
        }
    }

    public async UICloseDone(): Promise<void> {
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
    }
    //#endregion

    //#region self func
    private _isFirstInit: boolean = true;
    public async PrepareDataShow(): Promise<void> {
        this.SetUpUI();
        //update time
        this.UpdateUITime();

        // update body item 
        await this.listPrizeSeasonPass.SetUp(ReadDataJson.Instance.GetListPrizeSeasonPass(), this.nLockPrize);

        this.bubbleSys.ForceClose();

        // scroll to the first item can receive
        this.listPrizeSeasonPass.ScrollToTheFirstItemWasUnlock(this._isFirstInit);

        this._isFirstInit = false;

        this._isUIClosed = false;
    }

    public async PrepareDataClose(): Promise<void> {
        // MConsolLog.Log("check seasonPass", DataSeasonPassSys.Instance.GetNumPrizeCanClaim(), CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.SEASON_PASS));

        this._isUIClosed = true;

        if (DataSeasonPassSys.Instance.GetNumPrizeCanClaim() == 0 && CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.SEASON_PASS) <= 0) {
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS, false);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_ADD_ON_SPE_01, TYPE_EVENT_GAME.SEASON_PASS, false);
        } else if (DataSeasonPassSys.Instance.GetNumPrizeCanClaim() == 0) {
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_ADD_ON_SPE_01, TYPE_EVENT_GAME.SEASON_PASS, false);
        } else if (DataSeasonPassSys.Instance.GetNumPrizeCanClaim() > 0) {
            // console.log("Check num can claim: ", DataTilePassSys.Instance.GetNumPrizeCanClaim());
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_INDEX_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_ADD_ON_SPE_01, TYPE_EVENT_GAME.SEASON_PASS, true);
        }
    }

    private SetUpUI() {
        // get max progress at level now
        const dataNow = DataSeasonPassSys.Instance.GetLevelNow();
        const progressAtLevelNow = dataNow.progress;
        const levelNow = dataNow.level;
        const maxProgress = DataSeasonPassSys.Instance.GetMaxStarAtLevel(levelNow);
        const progressSet = progressAtLevelNow / maxProgress
        this.progressLevel.progress = progressSet;
        this.lbProgressLevel.string = `${progressAtLevelNow}/${maxProgress}`;
        this.lbLevel.string = levelNow.toString();

        // console.log("2222222222222", progressSet, progressAtLevelNow, maxProgress, DataSeasonPassSys.Instance.GetTotalProgress());


        // set up button active 
        // this.btnActivePass.active = !DataSeasonPassSys.Instance.IsActivePass();
    }
    //#endregion

    //#region listen func
    private async ActiveUIPass() {
        // this.btnActivePass.active = false;
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // unlock all item that can unlock
        await this.listPrizeSeasonPass.unlockAllItemPremium();

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    private UpdateUITime() {
        let time = CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.SEASON_PASS);
        // console.log("check time in UI: ", time);
        if (time <= 0) {
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat(time);
        }
    }

    private async PlayAnimReceiveChest(dataIPrize: IPrize[], indexChest: number, reasonReceivePrize: string) {
        this.node.active = false;
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_CHEST, dataIPrize, reasonReceivePrize, indexChest, null, "Season Pass");
        if (!this._isUIClosed) {
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_LOBBY);
            this.node.active = true;
        }
    }

    /**
     * hàm này được gọi khi đã chắc chắn có nhiều hơn itemPrize trong danh sách nhận thưởng
     */
    private async ReceiveListItemPrize() {
        // loop and check all item prize in listPrizeSeasonPass than get list prize 
        // then show UI receive item at lobby

        let listPrize: IPrize[] = [];
        this.listPrizeSeasonPass.GetListNItemPrize().forEach((item: Node) => {
            const itemPrizeSeasonPassCom: ItemPrizeSeasonPass = item.getComponent(ItemPrizeSeasonPass);
            if (itemPrizeSeasonPassCom != null) {
                const listPrizeFreeCanReceive: IPrize[] = itemPrizeSeasonPassCom.GetPrizeFreeIfCanReceive();
                const listPrizePreniumReceive: IPrize[] = itemPrizeSeasonPassCom.GetPrizePremiumIfCanReceive();

                listPrize = addIPrizeToList(listPrize, listPrizeFreeCanReceive);
                listPrize = addIPrizeToList(listPrize, listPrizePreniumReceive);

                // trong trường hợp nhận thưởng của bất kỳ cái nào thì ta sẽ ngay lập tức update dữ liệu của những phần thưởng đó thành đã được nhận thưởng
                if (listPrizeFreeCanReceive.length > 0) {
                    itemPrizeSeasonPassCom.UpdateState(0, STATE_ITEM_PRIZE_SEASON_PASS.CLAIMED);
                    //save received prize item
                    DataSeasonPassSys.Instance.SaveClaimPrizeAtLevel(itemPrizeSeasonPassCom.InfoItem.index, 'free', true);
                }
                if (listPrizePreniumReceive.length > 0) {
                    itemPrizeSeasonPassCom.UpdateState(1, STATE_ITEM_PRIZE_SEASON_PASS.CLAIMED);
                    //save received prize item
                    DataSeasonPassSys.Instance.SaveClaimPrizeAtLevel(itemPrizeSeasonPassCom.InfoItem.index, 'prenium', true);
                }
            }
        })


        this.node.active = false;

        //nhận thưởng logic
        PrizeSys.Instance.AddPrize(listPrize, 'SeasonPass_ReceiveListItemPrize');
        // nhận thưởng UI
        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_LIST_PRIZE, listPrize, 'SeasonPass_ReceiveListItemPrize', null, null, "Season Pass");
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_LOBBY);

        this.node.active = true;
    }
    //#endregion


    //#region func btn
    private btnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISeasonPass");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SEASON_PASS, 2);
    }

    private btnShowInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UISeasonPass");

        this.info.Show();
    }

    // private btnActive() {
    //     LogEventManager.Instance.logButtonClick(`active`, "UISeasonPass");

    //     if (FBInstantManager.Instance.checkHaveIAPPack_byProductID(MConfigs.IAP_SEASON_PASS)) {
    //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
    //         clientEvent.dispatchEvent(MConst.EVENT.SET_INDEX, TYPE_UI.UI_POPUP_BUY_SEASON_PASS, 20);  // set it to the last to not under other UI
    //         clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_POPUP_BUY_SEASON_PASS, 1, true, null, false);

    //         // this.onBtnActivePass();
    //     } else {
    //         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
    //     }
    // }
    //#endregion

    //#region on buy seasonPass
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
    }

    //#endregion


    //#region func btn
    // private onBtnActivePass() {

    //     const self = this;

    //     this.nNoti.active = false;

    //     // check cheat first
    //     if (CheatingSys.Instance.isCheatStore) {
    //         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
    //         self.BuyItemSuccessful();
    //         return;
    //     }

    //     // log event
    //     LogEventManager.Instance.buyPack(this._idBundle);

    //     const price = CONFIG_SP.PRICE_ACTIVE_PRENIUM;
    //     LogEventManager.Instance.logIAP_PurchaseItem(this._idBundle, price)

    //     // buy normal
    //     FBInstantManager.Instance.getListIAP_Purchase((err: Error, success: string) => {
    //         if (err) {
    //             FBInstantManager.Instance.buyIAP_consumePackID(this._idBundle, (err: Error, success: string) => {
    //                 if (err) {
    //                     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
    //                 } else {
    //                     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
    //                     self.BuyItemSuccessful();
    //                 }
    //             }, price);

    //         } else {
    //             let purchaseToken: string = FBInstantManager.Instance.iap_checkPurchaseInfo(this._idBundle);
    //             if (purchaseToken != "") {
    //                 FBInstantManager.Instance.iap_consumePackID(purchaseToken, (err: Error, success: string) => {
    //                     if (err) {
    //                         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
    //                     } else {
    //                         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
    //                         self.BuyItemSuccessful();
    //                     }
    //                 });
    //             } else {
    //                 FBInstantManager.Instance.buyIAP_consumePackID(this._idBundle, (err: Error, success: string) => {
    //                     if (err) {
    //                         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
    //                     } else {
    //                         clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
    //                         self.BuyItemSuccessful();
    //                     }
    //                 }, price);
    //             }
    //         }
    //     });
    // }
    //#endregion on buy seasonPass
}


