import { _decorator, Button, CCBoolean, Component, Label, Node, ProgressBar, RichText, Skeleton, sp, Tween, tween, UIOpacity, Vec3, find } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { DataPiggySys, STATUS_PIGGY_PANK } from '../../../DataBase/DataPiggySys';
import { AnimPiggySys } from '../../../AnimsPrefab/AnimPiggySys';
import { Utils } from '../../../Utils/Utils';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { UIPageHomeSys } from '../../LobbyScene/PageSys/UIPageHomeSys';
import { CurrencySys } from '../../CurrencySys';
import { instanceOfIOpenUIBaseWithInfo, instanceOfIUIKeepTutAndReceiveLobby, TYPE_CURRENCY, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import { UILobbySys } from '../../LobbyScene/UILobbySys';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { DataInfoPlayer } from '../../DataInfoPlayer';

const { ccclass, property } = _decorator;

@ccclass('UIPiggyBank')
export class UIPiggyBank extends UIBaseSys {
    @property(InfoUIBase) info: InfoUIBase;
    @property(Label) lbPrice: Label;
    @property(Label) lbShadowPrice: Label;
    @property(Label) lbPrice_unbuy: Label;
    @property(Label) lbShadowPrice_unbuy: Label;
    @property(AnimPiggySys) animPiggySys: AnimPiggySys;
    @property(Label) lbProgressNow: Label;
    @property(Label) lbProgressMax: Label;
    @property(Label) lbNotiProgress: Label;
    @property(ProgressBar) pb: ProgressBar;
    @property(Node) nNotification: Node;
    // @property(Label) lbContent: Label;
    @property(RichText) rtContent: RichText;
    @property([Node]) listUIHide: Node[] = [];

    @property(Node) nBtnBuy: Node;
    @property(Node) nBtnPlay: Node;

    private readonly posNotiDefault = new Vec3(0, 256, 0);
    private readonly distanceShowNotiY = 30;
    private _priceIAP: number = -1;
    private readonly timeHide: number = 0.5;
    private readonly timeShow: number = 0.2;
    private readonly timeShowNoti: number = 0.2;
    private readonly soonerTimeShowNoti: number = 0.2;

    private _statusNow: STATUS_PIGGY_PANK = STATUS_PIGGY_PANK.Normal;

    //#region Node
    protected onDisable(): void {
        Tween.stopAllByTarget(this.nNotification);
        Tween.stopAllByTarget(this.node);
    }
    //#endregion Node

    //################################################################
    //#region BaseUI
    public async PrepareDataShow(): Promise<void> {
        const statusNow = DataPiggySys.Instance.GetStatusPiggyNow();
        this._statusNow = statusNow;

        // update UIPrepare anim
        this.PrepareUIAnim();

        // set the anim to the right UI
        this.PlayAnimOpen(statusNow);


    }

    public async PrepareDataClose(): Promise<void> {
        Tween.stopAllByTarget(this.node);
    }

    public async UICloseDone(): Promise<void> {
        if (this._dataCustom != null && this._dataCustom.length != null && this._dataCustom.length > 0) {
            if (this._dataCustom.find(item => instanceOfIUIKeepTutAndReceiveLobby(item))) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
    }

    public async UIShowDone(): Promise<void> {
        if (this._dataCustom != null && this._dataCustom.length != null && this._dataCustom.length > 0) {
            if (this._dataCustom.find(item => instanceOfIOpenUIBaseWithInfo(item))) {
                this.info.Show();
            }
        }
    }
    //#endregion BaseUI
    //################################################################


    //################################################################
    //#region self
    private async PlayAnimOpen(status: STATUS_PIGGY_PANK) {
        const timePiggyApear = this.animPiggySys.GetTimeAnimPiggy('piggy_appear');
        const timePiggyReceiveCoin = this.animPiggySys.GetTimeAnimPiggy('piggy_bank_idle');
        switch (status) {
            case STATUS_PIGGY_PANK.Normal:
                this.animPiggySys.PlayQueueAnimOpen('normal');
                await Utils.delay((timePiggyApear - this.soonerTimeShowNoti) * 1000);
                if (this.isValid && this.node.active) {
                    this.ActiveNNotification(true);
                }
                break;
            case STATUS_PIGGY_PANK.Collecting:
                this.animPiggySys.PlayQueueAnimOpen('receive_coin');
                await Utils.delay(timePiggyApear * 1000);
                if (this.isValid && this.node.active) {
                    this.IncreaseCoin();
                }
                await Utils.delay((timePiggyReceiveCoin - this.soonerTimeShowNoti) * 1000);
                if (this.isValid && this.node.active) {
                    this.ActiveNNotification(true);
                }
                break;
            case STATUS_PIGGY_PANK.Full:
                this.animPiggySys.PlayQueueAnimOpen('receive_coin');
                await Utils.delay(timePiggyApear * 1000);
                if (this.isValid && this.node.active) {
                    this.IncreaseCoin();
                }
                await Utils.delay((timePiggyReceiveCoin - this.soonerTimeShowNoti) * 1000);
                if (this.isValid && this.node.active) {
                    this.ActiveNNotification(true);
                    this.ShowNBtn();
                }
                break;
        }
    }

    private ShowNBtn() {
        this.nBtnBuy.active = true;
        this.nBtnPlay.active = false;
        const opaBtn = this.nBtnBuy.getComponent(UIOpacity);
        opaBtn.opacity = 0;
        tween(opaBtn)
            .to(0.2, { opacity: 255 })
            .start()
    }

    private PrepareUIAnim() {
        const iapNow = DataPiggySys.Instance.GetIAPPiggyNow();
        const maxProgress = DataPiggySys.Instance.GetProgressMax(iapNow);
        const progressNow = DataPiggySys.Instance.GetProgressNow();

        // price
        const priceFromFb = FBInstantManager.Instance.getPriceIAPPack_byProductID(iapNow);
        const priceDefault = DataPiggySys.Instance.GetPricePiggyNow(iapNow);
        const priceChoice = priceFromFb != null ? priceFromFb : `${priceDefault}$`;

        this.lbPrice.string = this.lbPrice_unbuy.string = `Break ${priceChoice}`;
        this.lbShadowPrice.string = this.lbShadowPrice_unbuy.string = `Break ${priceChoice}`;
        this._priceIAP = priceDefault;

        // set lbCoin về 0
        this.lbProgressNow.string = "0";
        this.lbProgressNow.string = "0";
        this.pb.progress = 0;
        this.ActiveNNotification(false);
        switch (this._statusNow) {
            case STATUS_PIGGY_PANK.Normal:
                this.nBtnPlay.active = true;
                this.nBtnBuy.active = false;
                break;
            case STATUS_PIGGY_PANK.Collecting:
                this.nBtnBuy.active = false;
                this.nBtnPlay.active = true;
                break;
            case STATUS_PIGGY_PANK.Full:
                this.nBtnBuy.active = false;
                this.nBtnPlay.active = false;
                break;
        }
        this.lbNotiProgress.string = (maxProgress - progressNow).toString();
        this.lbProgressMax.string = maxProgress.toString();
        // this.lbContent.string = `Collect ${maxProgress} coins to break the\nPiggy Bank at a special price!`
        if (progressNow == maxProgress) {
            this.rtContent.string = `<color=#2E416F>Piggy Bank is FULL!\nHurry up and break it at a great price!</color>`
        } else {
            this.rtContent.string = `<color=#2E416F>Collect <color=#01B003>${maxProgress}</color> coins to break the\nPiggy Bank at a special price!</color>`
        }
    }

    private IncreaseCoin() {
        const timeAnimReceiveCoin = this.animPiggySys.GetTimeAnimPiggy('piggy_bank_idle');
        const progressNow = DataPiggySys.Instance.GetProgressNow();
        const maxProgressNow = DataPiggySys.Instance.GetProgressMax(DataPiggySys.Instance.GetIAPPiggyNow());
        const self = this;
        // play anim receive coin == time anim receive coin
        tween(this.node)
            .to(timeAnimReceiveCoin, {}, {
                onUpdate(target, ratio) {
                    const result = Number.parseInt((progressNow * ratio).toFixed(0));
                    const progress = result / maxProgressNow;
                    self.lbProgressNow.string = result.toString();
                    self.pb.progress = progress;
                },
            })
            .start();
    }

    private ActiveNNotification(active: boolean) {
        // hide => ẩn luôn
        if (!active || DataPiggySys.Instance.GetStatusPiggyNow() == STATUS_PIGGY_PANK.Full) {
            this.nNotification.active = false;
        } else {
            const opaCom = this.nNotification.getComponent(UIOpacity);

            this.nNotification.position = this.posNotiDefault.clone().add3f(0, this.distanceShowNotiY, 0);
            opaCom.opacity = 0;
            this.nNotification.active = true;

            tween(this.nNotification)
                .to(this.timeShowNoti, { position: this.posNotiDefault }, {
                    onUpdate(target, ratio) {
                        opaCom.opacity = 255 * ratio;
                    }
                })
                .start();
        }
        // show => hiển thị từ từ dịch lên trên chút
    }

    private HideAndUpdateUI(): Promise<void> {
        const self = this;
        return new Promise<void>(async resolve => {
            // ẩn UI đi
            this.listUIHide.forEach(item => {
                const opaCom = item.getComponent(UIOpacity);
                tween(item)
                    .to(self.timeHide, {}, {
                        onUpdate(target, ratio) {
                            opaCom.opacity = 255 * (1 - ratio);
                        },
                    })
                    .start();
            })

            // cập nhật lại giao diện
            this.PrepareUIAnim();

            await Utils.delay(self.timeHide * 1000);

            resolve();
        })
    }

    private ShowUIAfterHide() {
        const self = this;
        return new Promise<void>(async resolve => {
            // show UI
            this.listUIHide.forEach(item => {
                const opaCom = item.getComponent(UIOpacity);
                tween(item)
                    .to(self.timeShow, {}, {
                        onUpdate(target, ratio) {
                            opaCom.opacity = 255 * ratio;
                        },
                    })
                    .start();
            })

            await Utils.delay(self.timeShow * 1000);

            resolve();
        })
    }
    //#endregion self
    //################################################################

    //################################################################
    //#region Buy
    private async OnBuySuccessfull(idBundle: string) {
        LogEventManager.Instance.buyPackSuccess(idBundle);
        DataInfoPlayer.Instance.CachePackBought(idBundle);

        //======== save data ============
        const maxCoinNow = DataPiggySys.Instance.GetProgressMax(DataPiggySys.Instance.GetIAPPiggyNow());
        DataPiggySys.Instance.BuySuccessPiggyNow();

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.PIGGY_BANK);

        //======== play anim ============
        this.animPiggySys.PlayQueueAnimOpen("full");
        await Utils.delay(this.animPiggySys.GetTimeAnimPiggy('piggy_boom') * 1000);

        //======== play effect receiveCoin ============
        const wPosCoin = this.nVisual.worldPosition.clone();
        const wPosEndCoin = UIPageHomeSys.Instance.GetWPosCoin_2();


        // ẩn giao diện
        const animHideAndUpdateUI = this.HideAndUpdateUI();

        // anim coin
        const animCoin = new Promise<void>(async resolve => {
            // noti to show coin
            UILobbySys.Instance.ShowForwardUI();

            // show prize piggy
            UIReceivePrizeLobby.Instance.node.setSiblingIndex(999);
            await UIReceivePrizeLobby.Instance.superUIAnimCustom.ReceivePrizeCoin(null, maxCoinNow, wPosCoin, wPosEndCoin,
                null,
                (numCoinIncrease: number) => {
                    CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);
                    clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_PAGE_HOME);
                    clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_PAGE_HOME, null, null, MConfigs.FX_NEW_CUSTOM);
                });

            UILobbySys.Instance.HideForwardUI();

            resolve();
        })

        await Promise.all([
            animCoin,                            // đợi anim kết thúc
            animHideAndUpdateUI                  // đợi giao diện đã ẩn hết và cập nhật xong
        ]);

        //========= play lại anim như khi mở giao diện =============
        this.PlayAnimOpen(STATUS_PIGGY_PANK.Normal);

        // hiển thị lại giao diện
        await this.ShowUIAfterHide();

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }
    //#endregion Buy
    //################################################################


    //################################################################
    //#region Button
    private OnBtnShowInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UIPiggyBank");
        this.info.Show();
    }

    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIPiggyBank");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PIGGY_BANK, 1);
    }

    private OnBtnBuy() {
        const IAP_Now = DataPiggySys.Instance.GetIAPPiggyNow();
        const self = this;

        // real
        LogEventManager.Instance.buyPack(IAP_Now);
        LogEventManager.Instance.logButtonClick(`buy_${IAP_Now}`, "UIPiggyBank");
        LogEventManager.Instance.logIAP_PurchaseItem(IAP_Now, this._priceIAP);

        FBInstantManager.Instance.getListIAP_Purchase((err: Error, success: string) => {
            if (err) {
                FBInstantManager.Instance.buyIAP_consumePackID(IAP_Now, (err: Error, success: string) => {
                    if (err) {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                    } else {
                        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                        self.OnBuySuccessfull(IAP_Now);
                    }
                }, this._priceIAP);

            } else {
                let purchaseToken: string = FBInstantManager.Instance.iap_checkPurchaseInfo(IAP_Now);
                if (purchaseToken != "") {
                    FBInstantManager.Instance.iap_consumePackID(purchaseToken, (err: Error, success: string) => {
                        if (err) {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                        } else {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                            self.OnBuySuccessfull(IAP_Now);
                        }
                    });
                } else {
                    FBInstantManager.Instance.buyIAP_consumePackID(IAP_Now, (err: Error, success: string) => {
                        if (err) {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Failed!"));
                        } else {
                            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Buy Successfully!"));
                            self.OnBuySuccessfull(IAP_Now);
                        }
                    }, this._priceIAP);
                }
            }
        });
    }

    private OnBtnUnBuy() {
        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Keep collecting to unlock");
    }

    private async OnBtnPlay() {
        LogEventManager.Instance.logButtonClick('Play', "UIPiggyBank");
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        // vô luôn game
        await UIPageHomeSys.Instance.PlayGame();
    }
    //#endregion Button
    //################################################################
}