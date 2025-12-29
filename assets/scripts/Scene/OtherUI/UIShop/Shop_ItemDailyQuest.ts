import { _decorator, Button, CCString, Component, easing, Label, Layout, Material, Node, ProgressBar, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { GameSoundEffect, IInfoJsonDailyQuest, IShareNormalData, PAGE_VIEW_LOBBY_NAME, STATUS_ITEM_QUEST, TYPE_CURRENCY, TYPE_PRIZE, TYPE_QUEST_DAILY, TYPE_UI_SHARE } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { ItemPrizeSuperCustom } from '../UIReceivePrize/ItemPrizeSuperCustom';
import { CurrencySys } from '../../CurrencySys';
import { SuperUIAnimCustom } from '../SuperUIAnimCustom';
import { Utils } from '../../../Utils/Utils';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../Others/AutoScale/TypeAutoScale';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { MConfigs } from '../../../Configs/MConfigs';
import { GameManager } from '../../GameManager';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import * as I18n from 'db://i18n/LanguageData';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { DataItemSys } from '../../DataItemSys';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { SoundSys } from '../../../Common/SoundSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { CheatingSys } from '../../CheatingSys';
import { PAGE_VIEW_SHOP } from './TypeShop';
import { DataEventsSys } from '../../DataEventsSys';
import SupLogEvent from '../../../LogEvent/SupLogEvent';
const { ccclass, property } = _decorator;

@ccclass('Shop_ItemDailyQuest')
export class Shop_ItemDailyQuest extends Component {
    @property(Label) lbNameDailyQuest: Label;
    @property(Label) lbProgress: Label;
    @property(ProgressBar) pbItemDailyQuest: ProgressBar;
    @property(ItemPrizeSuperCustom) itemPrizeSuperCustom: ItemPrizeSuperCustom;
    @property(Node) nNoti: Node;
    @property(Sprite) spVisualButton: Sprite;
    @property(SpriteFrame) sfBtnDone: SpriteFrame;
    @property(SpriteFrame) sfBtnNodeDone: SpriteFrame;
    @property(Button) btnClaim: Button;
    @property(Node) nLbTextClaim: Node;
    @property(Node) nLbTextClaimShadow: Node;
    @property(CCString) stringColorHexOutlineCoinReceive = "#5c5383";
    @property(Node) nStrokeProgress: Node;
    @property(Material) matGray: Material;
    @property(Node) nBtnGoTo: Node;

    private _infoDailyChallenge: IInfoJsonDailyQuest = null;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_DAILY_QUEST.UPDATE_UI_QUEST_DAILY_FORCE, this.UpdateUI, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_DAILY_QUEST.UPDATE_UI_QUEST_DAILY_FORCE, this.UpdateUI, this)
    }

    public SetUp(infoDailyChallenge: IInfoJsonDailyQuest) {
        this._infoDailyChallenge = infoDailyChallenge;

        this.lbNameDailyQuest.string = infoDailyChallenge.nameQuest;
        this.lbProgress.string = infoDailyChallenge.GetProgressString();
        this.pbItemDailyQuest.progress = infoDailyChallenge.GetProgressForPb();
        this.itemPrizeSuperCustom.SetUp(infoDailyChallenge.listPrize[0], Vec3.ZERO, "+");
        this.itemPrizeSuperCustom.icItem.node.scale = new Vec3(0.8, 0.8, 0.8);
        if (CheatingSys.Instance.IsAutoFillAllProgressQuest) {
            this.UpdateStatusItem(STATUS_ITEM_QUEST.WAIT_TO_CLAIM);
        } else {
            this.UpdateStatusItem(this._infoDailyChallenge.status);
        }
    }

    private UpdateUI() {
        this.lbNameDailyQuest.string = this._infoDailyChallenge.nameQuest;
        this.lbProgress.string = this._infoDailyChallenge.GetProgressString();
        const progressForPb: number = this._infoDailyChallenge.GetProgressForPb();
        // lý do làm như này bởi vì progress nếu để nhỏ hơn 0.03 thì Ui vô cùng xấu do không dùng mask mà chỉ dùng slice
        this.pbItemDailyQuest.progress = progressForPb > 0.03 ? progressForPb : 0;
        if (CheatingSys.Instance.IsAutoFillAllProgressQuest) {
            this.UpdateStatusItem(STATUS_ITEM_QUEST.WAIT_TO_CLAIM);
        } else {
            this.UpdateStatusItem(this._infoDailyChallenge.status);
        }
    }

    private UpdateStatusItem(status: STATUS_ITEM_QUEST) {
        const self = this;
        switch (status) {
            case STATUS_ITEM_QUEST.DONE:
                this.node.getComponent(UIOpacity).opacity = 0;
                const layoutComParent = this.node.parent.getComponent(Layout);
                this.nBtnGoTo.active = false;
                tween(this.node)
                    .to(0.2, { scale: new Vec3(1, 0, 1) }, {
                        easing: 'smooth', onUpdate(target, ratio) {
                            layoutComParent.updateLayout(true);
                        },
                    })
                    .call(() => {
                        this.node.active = false;
                        clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_SCROLL_SHOP);
                    })
                    .start();
                break;
            case STATUS_ITEM_QUEST.NOT_DONE:
                this.nNoti.active = false;
                this.spVisualButton.spriteFrame = this.sfBtnNodeDone;
                MConfigs.GrayAllNode([this.nLbTextClaim, this.nLbTextClaimShadow], this.matGray);
                this.btnClaim.getComponent(Button).interactable = false;
                this.nStrokeProgress.active = true;
                // chỉ show btn goto trong trường hợp người chơi đang ở PageHome
                this.nBtnGoTo.active = ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.LOBBY;
                break;
            case STATUS_ITEM_QUEST.WAIT_TO_CLAIM:
                this.nNoti.active = true;
                this.spVisualButton.spriteFrame = this.sfBtnDone;
                MConfigs.UnGrayAllNode([this.nLbTextClaim, this.nLbTextClaimShadow]);
                this.btnClaim.getComponent(Button).interactable = true;
                this.pbItemDailyQuest.progress = 1;
                this.nStrokeProgress.active = true;
                this.nBtnGoTo.active = false;

                // emit turn on noti at icon shop bottom
                clientEvent.dispatchEvent(MConst.EVENT_SHOP.SHOW_NOTI);
                break;
        }
    }

    private async PlayAnimReceivePrize() {
        // turn on block UI 
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        let canContinueLogic: boolean = false;
        let wPosEndCoin: Vec3 = Vec3.ZERO;
        let superUIAnimCustom_com: SuperUIAnimCustom = null;
        const valuePrize: number = this._infoDailyChallenge.listPrize[0].value;
        const wCoinStart: Vec3 = this.itemPrizeSuperCustom.node.worldPosition.clone();

        // get superUIAnimCustom_com
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.GET_UI_ANIM_CUSTOM_COM, (uiAnimCustomCom) => {
            superUIAnimCustom_com = uiAnimCustomCom;
            canContinueLogic = true;
        });
        await Utils.WaitReceivingDone(() => { return canContinueLogic; });
        canContinueLogic = false;
        // chỉ chạy anim này nếu như là coin thôi
        switch (this._infoDailyChallenge.listPrize[0].typePrize) {
            case TYPE_PRIZE.MONEY:
                // get wPosStartCoin
                clientEvent.dispatchEvent(MConst.EVENT_SHOP.GET_WPOS_UI_COIN, (wPosUICoin: Vec3) => {
                    wPosEndCoin = wPosUICoin.clone();
                    canContinueLogic = true;
                })
                await Utils.WaitReceivingDone(() => { return canContinueLogic; });
                canContinueLogic = false;
                // =================================================================
                // ========================    anim coin ===========================
                // =================================================================
                // play VFX flash
                superUIAnimCustom_com.PlayVFXFlash(wCoinStart);

                await superUIAnimCustom_com.ReceivePrizeCoin(this.stringColorHexOutlineCoinReceive, valuePrize, wCoinStart, wPosEndCoin,
                    null,
                    (numMoneyIncrease: number) => {
                        CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numMoneyIncrease);
                        clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_SHOP);
                        clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_SHOP, null, null, MConfigs.FX_NEW_CUSTOM);
                    });


                // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                // turn off block UI
                break;
            default:
                // popUpPrize
                await AniTweenSys.playAnimPopUpItemUpper(this.itemPrizeSuperCustom.node, wCoinStart, superUIAnimCustom_com.nUIAnim, () => {
                    this.scheduleOnce(() => {
                        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.EFFECT_LEVEL_DONE_LOBBY);
                    }, 0.3);
                });
                break;
        }
    }


    //#region onBtn listener
    private async onBtnClaim() {
        //Log event
        LogEventManager.Instance.logButtonClick(`claim`, "Shop_ItemDailyQuest");
        const dataEventLog = DataEventsSys.Instance.GetParamEventWhenBoughtIAPSuccess();
        SupLogEvent.LogEventWithIAP(dataEventLog, 'daily_quest', 0, 'daily_quest', "Shop");


        // emit event claim and play anim receive item
        const prizeReceive = this._infoDailyChallenge.listPrize[0];
        const valuePrize: number = this._infoDailyChallenge.listPrize[0].value;
        switch (prizeReceive.typePrize) {
            case TYPE_PRIZE.MONEY:
                SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_REWARDS);
                CurrencySys.Instance.AddMoney(valuePrize, "SHOP_DAILY_QUEST", false, false);
                break;
            default:
                DataItemSys.Instance.AddItemPrize([prizeReceive], "SHOP_DAILY_QUEST", false);
                break;
        }

        // save quest
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.CLAIMED_QUEST_DAILY_QUEST, this._infoDailyChallenge.id);

        this.UpdateStatusItem(STATUS_ITEM_QUEST.DONE);
        await this.PlayAnimReceivePrize();
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.HIDE_NOTI);

        // update noti shop
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.UPDATE_NOTI_SHOP_DAILY_INDICATOR);
    }

    private async onBtnGoTo() {
        LogEventManager.Instance.logButtonClick(`goto`, "Shop_ItemDailyQuest");

        // check type quest => do the suitable action
        switch (this._infoDailyChallenge.typeQuest) {
            case TYPE_QUEST_DAILY.PLAY_NORMAL_GAME:
            case TYPE_QUEST_DAILY.USE_ITEM_SHUFFLE: case TYPE_QUEST_DAILY.USE_ITEM_SORT: case TYPE_QUEST_DAILY.USE_ITEM_VIP_SLOT:
                // play game / tut click play game at home
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
                if (GameManager.Instance.levelPlayerNow == 0) {
                    await GameManager.Instance.PreparePlayTutorial();
                } else {
                    const timePlayGame: number = GameManager.Instance.GetTimeSuitLevelNormal(GameManager.Instance.levelPlayerNow);

                    await GameManager.Instance.PreparePlayNormal(
                        GameManager.Instance.levelPlayerNow,
                        timePlayGame,
                        []
                    );
                }
                break;
            case TYPE_QUEST_DAILY.WATCH_ADS:
                // case watch ads cũng cùng trường hợp với spin vì trong spin có chế độ spin bằng ads
                // trong tường hợp người chơi chưa quay spin bằng ads thì ta có thể popUp spin lên 
                // < hãy nhớ rằng nếu người chơi đã xem ads coin rồi thì chắc chắn task này sẽ thành công>
                // trượt shop đến phần coins để xem ads
                clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_SHOP, PAGE_VIEW_SHOP.COIN, 1);
                break;
            case TYPE_QUEST_DAILY.SPIN:
                // emit to change the pageView
                clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.HOME);
                // emit show the UISpin
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPIN, 1);
                break;
            case TYPE_QUEST_DAILY.INVITE_FRIEND:
                if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.LOBBY) {
                    // emit change page to custom
                    clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.CUSTOM);
                }

                // show invite facebook
                clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
                let jsonShare: IShareNormalData = {
                    level: GameManager.Instance.levelPlayerNow
                }
                const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
                if (ins_share != null) {
                    ins_share.showShareMyScorePopup(jsonShare, TYPE_UI_SHARE.INVITE, (base64Image: string) => {
                        clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                        if (base64Image.length > 0) {
                            FBInstantManager.Instance.inviteFriend_222(base64Image, (err, success) => {
                                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                                // if (success == MConst.FB_CALLBACK_FAIL) {
                                //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Friend invitation failed"));
                                // } else if (success == MConst.FB_CALLBACK_SUCCESS) {
                                //     clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Friend invitation succeeded"));
                                // }
                            })
                        } else {
                            // clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("Friend invitation failed"));
                        }
                    });
                } else {
                    clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                }
                break;
            case TYPE_QUEST_DAILY.BUILD_A_CONSTRUCTOR:
                // trong trường hợp chưa đủ công trình thì sao?
                // trong trường hợp đã đủ công trình thì sao?
                // trượt sang page home 
                clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.HOME);
                break;
            case TYPE_QUEST_DAILY.FINISH_TOURNAMENT: case TYPE_QUEST_DAILY.PLAY_TOURNAMENT_GAME:
                clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.TOURNAMENT);
                // trượt sang page tournament
                break;
            case TYPE_QUEST_DAILY.USE_COIN:
                // nên hiển thị như nào?
                clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t("You can buy boosters by coins!"));
                break;
        }
    }

    //#endregion onBtn listener
}


