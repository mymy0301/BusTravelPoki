import { _decorator, AnimationComponent, Component, instantiate, Label, Node, RecyclePool, Sprite, SpriteFrame, tween, Tween, UIOpacity, Vec3, TweenEasing, TweenAction, RealCurve } from 'cc';
import { InfoPackEndlessTreasure, IPrize, TYPE_EVENT_GAME, TYPE_PRIZE } from '../../../Utils/Types';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { DataEndlessTreasureSys } from '../../../DataBase/DataEndlessTreasureSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_ENDLESS_TREASURE, STATE_INFO_PACK_ET } from './TypeEventEndlessTreasure';
import * as I18n from 'db://i18n/LanguageData';
import { MConst } from '../../../Const/MConst';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { Utils } from '../../../Utils/Utils';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { PokiSDKManager } from '../../../Utils/poki/PokiSDKManager';

const { ccclass, property } = _decorator;

enum ANIM_OFER {
    Unlock,
    LockIdle,
    BuySuccess
}

@ccclass('ItemOfferET')
export class ItemOfferET extends Component {
    @property(Node) listNCaseItemShow: Node[] = [];
    @property(Node) listNCaseLbItemShow: Node[] = [];

    @property(Label) lbPrice: Label;
    @property(Label) lbShadowPrice: Label;
    @property(Node) nLock: Node;
    @property(Node) nV: Node;
    @property(Node) listNBtn: Node[] = [];
    @property(Node) nOnClickAllItem: Node;

    @property(Node)
    groupFree: Node = null;

    @property(Node)
    groupWatchAd: Node = null;

    private _stateItem: STATE_INFO_PACK_ET = STATE_INFO_PACK_ET.LOCK;
    private _infoPack: InfoPackEndlessTreasure = null;
    private _nCaseLbShowing: Node = null;
    private _nCaseItemShowing: Node = null;


    private readonly timeAnimLock: number = 0.6;
    private _animCom: AnimationComponent = null;

    private get animCom(): AnimationComponent {
        if (this._animCom == null) { this._animCom = this.node.getComponent(AnimationComponent) }
        return this._animCom;
    }

    //=====================================
    //#region SetUp
    public SetUp(infoPack: InfoPackEndlessTreasure) {
        this.node.name = `pack_${infoPack.idBundle}`;

        const self = this;
        this._infoPack = infoPack;

        // set UI
        //---------------------------
        // price
        this.groupFree.active = false;
        this.groupWatchAd.active = false;
        if (this._infoPack.price == 0) {
            // free
            // this.lbPrice.string = "Free";
            // this.lbShadowPrice.string = "Free";
            this.groupFree.active = true;
        } else {
            // const priceFB = FBInstantManager.Instance.getPriceIAPPack_byProductID(this._infoPack.idBundle);
            // const valuePriceShow = priceFB == null ? `${this._infoPack.price}$` : priceFB;
            // this.lbPrice.string = valuePriceShow;
            // this.lbShadowPrice.string = valuePriceShow;
            this.groupWatchAd.active = true;
        }

        //---------------------------
        // rewards
        function showRewards(nCaseReward: Node, nCaseLbReward: Node, rewards: IPrize[]) {

            rewards.forEach(async (reward: IPrize, index: number) => {
                let imgReward = null;
                if (reward.typePrize == TYPE_PRIZE.MONEY) {
                    let waitReceiveDone = false;
                    clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.GET_IMAGE_COIN, rewards.length, (imgCoin: SpriteFrame) => {
                        waitReceiveDone = true;
                        imgReward = imgCoin;
                    })
                    await Utils.WaitReceivingDone(() => { return waitReceiveDone });
                } else {
                    imgReward = await MConfigResourceUtils.getImageItem(reward.typePrize, reward.typeReceivePrize);
                }
                const sfNow = nCaseReward.children[index].getComponent(Sprite).spriteFrame;
                if (sfNow != imgReward) {
                    nCaseReward.children[index].getComponent(Sprite).spriteFrame = imgReward;
                }
                nCaseLbReward.children[index].getComponent(Label).string = reward.GetStringValue_2();
                nCaseReward.active = true;
                nCaseLbReward.active = true;
            })
        }
        const numRewards = this._infoPack.rewards.length;
        this._nCaseItemShowing = this.listNCaseItemShow[numRewards - 1];
        this._nCaseLbShowing = this.listNCaseLbItemShow[numRewards - 1]
        this.listNCaseItemShow.forEach((node, index) => { if (index != numRewards - 1) node.active = false });
        this.listNCaseLbItemShow.forEach((node, index) => { if (index != numRewards - 1) node.active = false });
        showRewards(this._nCaseItemShowing, this._nCaseLbShowing, this._infoPack.rewards);

        //----------------------------
        // state
        const stateItem = DataEndlessTreasureSys.Instance.GetStatePack(this._infoPack.idBundle);
        this.UpdateState(stateItem);
    }
    //#endregion SetUp
    //=====================================

    //=====================================
    //#region self
    private UpdateState(state: STATE_INFO_PACK_ET) {
        this._stateItem = state;

        switch (state) {
            case STATE_INFO_PACK_ET.LOCK:
                this.nV.active = false;
                this.listNBtn.forEach(item => { item.active = true; item.getComponent(UIOpacity).opacity = 255 })
                this.nLock.active = true;
                this.animCom.play("LockIdle");
                this.nOnClickAllItem.active = true;
                break;
            case STATE_INFO_PACK_ET.UNLOCK:
                this.nV.active = false;
                this.nLock.active = false;
                this.nOnClickAllItem.active = false;
                this.listNBtn.forEach(item => { item.active = true; item.getComponent(UIOpacity).opacity = 255 })
                break;
            case STATE_INFO_PACK_ET.BUY_DONE:
                this.groupFree.active = false;
                this.groupWatchAd.active = false;
                this.listNBtn.forEach(item => item.active = false)
                this.nLock.active = false;
                this.nOnClickAllItem.active = false;
                this.nV.active = true;
                break;
        }
    }

    private BuySuccess(nameBundle: string = null) {
        //log event
        if (nameBundle != null) {
            LogEventManager.Instance.buyPackSuccess(nameBundle);
            DataInfoPlayer.Instance.CachePackBought(nameBundle);
        }

        this.UpdateState(STATE_INFO_PACK_ET.BUY_DONE);
        // save prize
        // đối với anim 1 thì ta cần gọi update data , còn đối với anim 2 thì sẽ chạy anim và update dataUI nên chúng ta không cần update data ở đây
        PrizeSys.Instance.AddPrize(this._infoPack.rewards, "UIEndlessTreasure", false, !this.IsLastPrize());
        DataEndlessTreasureSys.Instance.IncreasePackUnlocked();
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.ENDLESS_TREASURE);
    }

    private async PlayAnimBuyItemSuccessful() {
        // anim prize
        let listVisualPrize = [];
        let listWPosPrize = [];
        for (let i = 0; i < this._nCaseItemShowing.children.length; i++) {
            const nItem = this._nCaseItemShowing.children[i];
            const nLb = this._nCaseLbShowing.children[i];
            const nodeCopyItem = instantiate(nItem);
            const nodeCopyLb = instantiate(nLb);
            nodeCopyLb.setParent(nodeCopyItem, true);
            listVisualPrize.push(nodeCopyItem);
            listWPosPrize.push(nItem.worldPosition.clone());
        }
        if (!this.IsLastPrize()) {
            clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.BUY_PACK_SUCCESS, this._infoPack, 'Anim2', listVisualPrize, listWPosPrize);
        } else {
            clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.BUY_PACK_SUCCESS, this._infoPack, 'Anim1', listVisualPrize, listWPosPrize);
        }
    }

    private IsLastPrize() {
        // console.log(this._infoPack.GetIndexBundle(), DataEndlessTreasureSys.Instance.GetDataPack().length);
        return this._infoPack.GetIndexBundle() == DataEndlessTreasureSys.Instance.GetDataPack().length;
    }

    public async UnlockItem() {
        // anim unLock item
        this.animCom.stop();
        this.animCom.play(this.animCom.clips[ANIM_OFER.Unlock].name);
        const timeAnim = this.animCom.clips[ANIM_OFER.Unlock].duration;
        await Utils.delay(timeAnim * 1000);

        this.UpdateState(STATE_INFO_PACK_ET.UNLOCK);
    }
    //#endregion self
    //=====================================

    //===================================
    //#region btn
    public OnBtnClickItem() {
        LogEventManager.Instance.logButtonClick("itemLock", "UIEndlessTreasure");
        // rung lắc ổ khóa và thông báo
        animLock(this.nLock, this.timeAnimLock);
        // thông báo
        clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("ET_NOTI_LOCK"));
    }

    public OnBtnBuyPack() {
        if (this._infoPack.price == 0) {
            LogEventManager.Instance.logButtonClick(`buy_pack_free_${DataEndlessTreasureSys.Instance.GetIndexPack(this._infoPack)}`, "UIEndlessTreasure");
            clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Successfully!"));
            this.BuySuccess();
            this.PlayAnimBuyItemSuccessful();
        } else {
            this.OnBtnBuyPackByMoney();
        }
    }

    private OnBtnBuyPackByMoney() {
        const price = this._infoPack.price;
        LogEventManager.Instance.logButtonClick(`buy_${this._infoPack.idBundle}`, "UIEndlessTreasure");

        // const self = this;
        // const namePack: string = this._infoPack.idBundle;

        // // log event
        // LogEventManager.Instance.buyPack(namePack);

        // LogEventManager.Instance.logIAP_PurchaseItem(namePack, price)

        // // buy item
        // FBInstantManager.Instance.getListIAP_Purchase((err: Error, success: string) => {
        //     if (err) {
        //         FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
        //             if (err) {
        //                 clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Failed!"));
        //             } else {
        //                 clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Successfully!"));
        //                 self.BuySuccess(namePack);
        //                 self.PlayAnimBuyItemSuccessful();
        //             }
        //         }, price);

        //     } else {
        //         let purchaseToken: string = FBInstantManager.Instance.iap_checkPurchaseInfo(namePack);
        //         if (purchaseToken != "") {
        //             FBInstantManager.Instance.iap_consumePackID(purchaseToken, (err: Error, success: string) => {
        //                 if (err) {
        //                     clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Failed!"));
        //                 } else {
        //                     clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Successfully!"));
        //                     self.BuySuccess(namePack);
        //                     self.PlayAnimBuyItemSuccessful();
        //                 }
        //             });
        //         } else {
        //             FBInstantManager.Instance.buyIAP_consumePackID(namePack, (err: Error, success: string) => {
        //                 if (err) {
        //                     clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Failed!"));
        //                 } else {
        //                     clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Successfully!"));
        //                     self.BuySuccess(namePack);
        //                     self.PlayAnimBuyItemSuccessful();
        //                 }
        //             }, price);
        //         }
        //     }
        // });

        PokiSDKManager.Instance.Show_RewardedVideoAsync("UIEndlessTreasure", ""+this._infoPack.idBundle, (err: Error, success: string) => {
            if (err) {
                clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Failed!"));
            } else {
                clientEvent.dispatchEvent(EVENT_ENDLESS_TREASURE.NOTIFICATION, I18n.t("Buy Successfully!"));
                this.BuySuccess();
                this.PlayAnimBuyItemSuccessful();
            }
        })
    }
    //#endregion btn
    //===================================

    //===================================
    //#region Anim item
    public async AnimBuySucess() {
        // // hide opa item
        // const opaCom: UIOpacity = this.node.getComponent(UIOpacity);
        // const self = this;

        // const timeHideBtn = 0.5;
        // const timeShowTich = 1;

        // tween(this.listNBtn[0])
        //     .to(timeHideBtn, {}, {
        //         onUpdate(target, ratio) {
        //             self.listNBtn.forEach(item => item.getComponent(UIOpacity).opacity = (1 - ratio) * 255)
        //         },
        //     })
        //     .start()

        // await Utils.delay(timeHideBtn * 1000);

        // const opaTich = this.nV.getComponent(UIOpacity);
        // this.nV.scale = new Vec3(1.2, 1.2, 1.2);
        // // opaTich.opacity = 0;
        // this.nV.active = true;
        // tween(this.nV)
        //     .to(0.6, { scale: Vec3.ONE }, { easing: 'backIn' })
        //     .start()

        // await Utils.delay(timeShowTich * 1000);

        this.animCom.play("BuySuccess");
        const timeAnim = this.animCom.clips[ANIM_OFER.BuySuccess].duration;
        await Utils.delay((timeAnim - 0.2) * 1000);
    }
    //#endregion anim item
    //===================================
}

function animLock(icLock: Node, timeAnim: number) {
    Tween.stopAllByTarget(icLock);
    icLock.angle = 0;
    tween(icLock)
        .to(timeAnim / 24, { angle: 20 }, { easing: 'smooth' })
        .to(timeAnim / 12, { angle: -20 }, { easing: 'smooth' })
        .to(timeAnim / 12, { angle: 20 }, { easing: 'smooth' })
        .to(timeAnim / 12, { angle: -20 }, { easing: 'smooth' })
        .to(timeAnim / 12, { angle: 20 }, { easing: 'smooth' })
        .to(timeAnim / 24, { angle: 0 }, { easing: 'smooth' })
        .start();
}
