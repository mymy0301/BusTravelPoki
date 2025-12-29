import { _decorator, Button, CCFloat, CurveRange, Label, Material, Node, ParticleSystem, RealCurve, Sprite, SpriteFrame, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { GameSoundEffect, instanceOfIOpenUIBaseWithInfo, IPrize, PAGE_VIEW_LOBBY_NAME, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_QUEST_DAILY, TYPE_RECEIVE_PRIZE_LOBBY } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataSpinSys } from '../../../DataBase/DataSpinSys';
import { SoundSys } from '../../../Common/SoundSys';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { ProgressCummulativeReward } from './ProgressCummulativeReward';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
import { CurrencySys } from '../../CurrencySys';
import * as I18n from 'db://i18n/LanguageData';
import { languages } from 'db://assets/resources/i18n/en';
import { ListPhaseSpin } from './ListPhaseSpin';
import { AnimSpin } from './AnimSpin';
import { VisualSpin } from './VisualSpin';
import { DataItemSys } from '../../DataItemSys';
import { Utils } from '../../../Utils/Utils';
import { MConfigs } from '../../../Configs/MConfigs';
import { PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../UIShop/TypeShop';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
const { ccclass, property } = _decorator;

@ccclass('UISpin')
export class UISpin extends UIBaseSys {
    @property(ListPhaseSpin) listPhaseSpin: ListPhaseSpin;

    @property(AnimSpin) animSpin: AnimSpin;

    @property(ProgressCummulativeReward) progressCummulativeReward: ProgressCummulativeReward;

    @property(Button) btnBlockSpinBtn: Button;

    @property(InfoUIBase) infoSpin: InfoUIBase;

    @property(VisualSpin) visualSpin: VisualSpin;

    @property(RealCurve) mRealCurve: RealCurve = new RealCurve();

    @property(ParticleSystem) mParticle: ParticleSystem;

    @property(Node) nLayoutBtn: Node;

    @property(CCFloat) timeSpin: number = 10;

    private readonly MAX_PIE_SPIN = 8;

    private wasGenUI: boolean = false;
    private _dataPrize: IPrize = null;


    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SPIN.UPDATE_UI_SPIN, this.UpdateUISpin, this);
        clientEvent.on(MConst.EVENT_SPIN.HIDE_SPIN, this.HideUISpin, this);
        clientEvent.on(MConst.EVENT_SPIN.SHOW_SPIN, this.ShowUISpin, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SPIN.UPDATE_UI_SPIN, this.UpdateUISpin, this);
        clientEvent.off(MConst.EVENT_SPIN.HIDE_SPIN, this.HideUISpin, this);
        clientEvent.off(MConst.EVENT_SPIN.SHOW_SPIN, this.ShowUISpin, this);
    }

    //#region UI base func
    public async PrepareDataShow(): Promise<void> {
        // update lbSpin ads
        this.visualSpin.UpdateUI(true);

        this.ShowBtnLayout(false);

        this.animSpin.SetIdle();
        // update progress
        // this.progressCummulativeReward.UpdateUIProgress(false);

        clientEvent.dispatchEvent(MConst.EVENT_SPIN.NOTIFICATION.FORCE_CLOSE);

        // update UI phase
        if (!this.wasGenUI) {
            this.listPhaseSpin.SetUpData();
            this.wasGenUI = true;
        } else {
            // this.listPhaseSpin.listItemPhase.forEach(item => item.getComponent(ItemUIPhaseSpin).AddForceToImpressApear())
        }

        // unblock btn spin
        this.btnBlockSpinBtn.node.active = false;

        this.visualSpin.UpdateVisualBtn();
    }

    public async UIShowDone(): Promise<void> {
        if (instanceOfIOpenUIBaseWithInfo(this._dataCustom) && this._dataCustom.isShowInfo) {
            // this.onBtnShowInfo();
        }
    }

    public async PrepareDataClose(): Promise<void> {
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SPIN);
    }

    public async UICloseDone(): Promise<void> {
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
    }
    //#endregion

    //#region self func
    private UpdateUISpin(whenPrepareShowUI: boolean = false) {
        this.visualSpin.UpdateUI(whenPrepareShowUI);
        this.listPhaseSpin.UpdateSpecialUIItem();
    }

    private HideBtnLayout() {
        const opaCom = this.nLayoutBtn.getComponent(UIOpacity);
        tween(opaCom)
            .to(0.5, { opacity: 0 })
            .start();
    }

    private ShowBtnLayout(isUseOpa: boolean = true) {
        const opaCom = this.nLayoutBtn.getComponent(UIOpacity);

        if (isUseOpa) {
            opaCom.opacity = 255;
            return;
        }

        tween(opaCom)
            .to(1, { opacity: 255 })
            .start();
    }

    private ResetValue() {
        this._dataPrize = null;
        this.animSpin.ResetDataDefault();
    }

    private indexRandomPrize = 0;
    private RandomResult() {
        //random item first than random the angle to suit with the item
        const listPrize = Array.from(this.listPhaseSpin.listIInfoPrizeSpin);
        this.indexRandomPrize = DataSpinSys.Instance.randomPrizeReceiveSpin(listPrize);

        // save the prize
        this._dataPrize = listPrize[this.indexRandomPrize].listItem[0];

        let self = this;

        function getDistanceIndex(indexTest: number, oldIndex: number) {
            if (oldIndex == -1 || oldIndex == 0) { return indexTest; }
            else if (indexTest == oldIndex) { return self.MAX_PIE_SPIN; }
            else if (indexTest > oldIndex) { return indexTest - oldIndex; }
            else { return self.MAX_PIE_SPIN - oldIndex + indexTest; }
        }

        const distanceIndex = getDistanceIndex(this.indexRandomPrize, this.animSpin._oldIndex);
        this.animSpin.SetDataPrepareSpin(distanceIndex, this.indexRandomPrize);
    }

    private async Spin() {
        this.HideBtnLayout();

        this.btnBlockSpinBtn.node.active = true;
        const self = this;
        this.ResetValue();
        // random result
        this.RandomResult();

        const timeDelayDoneSpin = 2;

        await new Promise<void>(resolve => {
            // spin
            tween(this.animSpin.nListPhaseSpin)
                .call(() => {
                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
                    this.animSpin.Spin();
                    SoundSys.Instance.playSoundEffectWithLoop(GameSoundEffect.JACK_POT_LOOP_2);
                })
                .to(this.timeSpin, { angle: this.animSpin._angleEnd }, {
                    easing(k) {
                        if (k === 1) {
                            return 1;
                        }
                        return self.mRealCurve.evaluate(k);
                    },
                })
                .call(() => {
                    this.animSpin.DoneSpin();
                    SoundSys.Instance.stopSoundLoop();
                    SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.JACK_POT_DONE);
                    this.mParticle.play();
                })
                .delay(timeDelayDoneSpin)
                .call(() => {
                    this.animSpin.SetIdle();
                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                    resolve();
                })
                .start();
            // other UI
            tween(self.animSpin.nBgSpin)
                .to(this.timeSpin, { angle: this.animSpin._angleEnd }, {
                    easing(k) {
                        if (k === 1) {
                            return 1;
                        }
                        return self.mRealCurve.evaluate(k);
                    },
                })
                .delay(timeDelayDoneSpin)
                .call(() => {
                    self.ShowBtnLayout();
                })
                .start();
        })


    }

    private async RewardSpin(isX10: boolean = false) {
        this.HideUISpin();

        let prizeFake = JSON.parse(JSON.stringify(this._dataPrize));

        // x10 prize
        if (isX10) {
            prizeFake.value *= 10;
        }

        // trong trường hợp là prize special => tức index == 0
        // emit lưu trữ dữ liệu và udpate lại UI cho phù hợp
        if (this.animSpin._oldIndex == 0) {
            DataSpinSys.Instance.ReceveiSpecialItem();
        }

        // nhận thưởng phần thưởng
        console.log("value prize", prizeFake.value);


        switch (prizeFake.typePrize) {
            case TYPE_PRIZE.MONEY:
                CurrencySys.Instance.AddMoney(prizeFake.value, "UISpin", true, false);
                break;
            case TYPE_PRIZE.TICKET:
                CurrencySys.Instance.AddTicket(prizeFake.value, "UISpin", true, false);
                break;
            default:
                DataItemSys.Instance.AddItemPrize([prizeFake], "UISpin");
                break;
        }

        clientEvent.dispatchEvent(MConst.EVENT.HIDE_SHADOW_LOBBY, false);
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SPIN, [prizeFake], 'UISpin', null, null, "Spin Rewards");
        // show block UI but wait a little than turn it on
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        await Utils.delay(0.5 * 1000);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_LOBBY);
        // call update progress in UI Spin
        // this.progressCummulativeReward.UpdateUIProgress();
        // update UI Special Prize
        if (this.animSpin._oldIndex == 0) {
            this.listPhaseSpin.UpdateSpecialUIItem();
        }

        this.ShowUISpin();
    }

    private HideUISpin() {
        this.node.active = false;
    }

    private ShowUISpin() {
        this.btnBlockSpinBtn.node.active = false;
        const opa = this.node.getComponent(UIOpacity);
        opa.opacity = 155;

        this.node.active = true;

        tween(opa)
            .to(0.5, { opacity: 255 })
            .start()
    }
    //#endregion self func

    private async LogicShowShop(pageViewStart: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2) {
        // change pageView
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_START_AT_LOBBY, pageViewStart);
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.SHOP);
    }

    //#region func button
    public onBtnSpinAds() {
        LogEventManager.Instance.logButtonClick(`ads`, "UISpin");

        const self = this;

        async function UseSuccess() {
            DataSpinSys.Instance.useSpinAds();
            // ||**DQ**||
            clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.SPIN, 1);

            // update btn
            self.UpdateUISpin();
            await self.Spin();
            self.RewardSpin();

            self.visualSpin.UpdateVisualBtn();
        }

        if (DataSpinSys.Instance.getNumSpinAdsTodayWasUse() < MConfigs.MAX_SPIN_ADS_PER_DAY) {
            FBInstantManager.Instance.Show_RewardedVideoAsync(this.node.name, "btnWatchAds", async (err, succ) => {
                if (succ == MConst.FB_REWARD_CALLBACK_SUCCESS) {
                    UseSuccess();
                } else {
                    // MConsolLog.Log("=================2 call failed");
                    // MConsolLog.Log("Can not load ad");
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, I18n.t(languages["You have used all ads today"]));
        }
    }

    public async onBtnSpinFree() {
        LogEventManager.Instance.logButtonClick(`free`, "UISpin");

        DataSpinSys.Instance.useSpinFree();
        // update btn
        await this.Spin();
        this.UpdateUISpin();
        this.RewardSpin();
        this.visualSpin.UpdateVisualBtn();

        // ||**DQ**||
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.SPIN, 1);
    }

    public async onBtnSkipIts_10() {
        LogEventManager.Instance.logButtonClick(`skip_ads_10`, "UISpin");

        if (CurrencySys.Instance.GetTicket() < 10) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, I18n.t(languages['Not enough Tickets!']));
            // trượt sang tab shop và close UISpin
            this.onBtnClose();

            if (MConfigs.numIAPTicketHave > 0) {
                this.LogicShowShop(PAGE_VIEW_SHOP.SKIP_ITS);
            } else {
                // this.LogicShowShop(PAGE_VIEW_SHOP_2.COIN);
            }
            return;
        }

        CurrencySys.Instance.AddTicket(-10, "UISpin");
        await this.Spin();
        this.UpdateUISpin();
        this.RewardSpin(true);
        this.visualSpin.UpdateVisualBtn();

        // ||**DQ**||
        clientEvent.dispatchEvent(MConst.EVENT_DAILY_QUEST.UPDATE_QUEST_DAILY_QUEST, TYPE_QUEST_DAILY.SPIN, 10);
    }

    public async onBtnSkipIts_1() {
        LogEventManager.Instance.logButtonClick(`skip_ads_1`, "UISpin");

        if (CurrencySys.Instance.GetTicket() <= 0) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, I18n.t(languages['Not enough Tickets!']));
            return;
        }

        CurrencySys.Instance.AddTicket(-1, "UISpin");
        await this.Spin();
        this.UpdateUISpin();
        this.RewardSpin();
        this.visualSpin.UpdateVisualBtn();
    }

    public onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISpin");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SPIN, 1);
    }

    public onBtnShowInfo() {
        LogEventManager.Instance.logButtonClick(`info`, "UISpin");

        this.infoSpin.Show();
    }
    //#endregion func button
}




