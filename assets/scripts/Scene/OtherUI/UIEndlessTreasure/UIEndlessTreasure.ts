import { _decorator, Component, Label, Node, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import { EVENT_ENDLESS_TREASURE } from './TypeEventEndlessTreasure';
import { UIReceivePrizeLobby } from '../../LobbyScene/UIReceivePrizeLobby';
import { TYPE_RECEIVE_PRIZE_LOBBY, InfoPackEndlessTreasure, GameSoundEffect } from '../../../Utils/Types';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { SoundSys } from '../../../Common/SoundSys';
import { ListOfferET2 } from './ListOfferET2';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
import { DataEndlessTreasureSys } from '../../../DataBase/DataEndlessTreasureSys';
import { Utils } from '../../../Utils/Utils';
import * as I18n from 'db://i18n/LanguageData';
import { ShadowGameUI } from '../../GameScene/OtherUI/ShadowGameUI';
const { ccclass, property } = _decorator;

@ccclass('UIEndlessTreasure')
export class UIEndlessTreasure extends UIBaseSys {
    // @property(ListItemOfferET) listItemOfferET: ListItemOfferET;
    @property(ListOfferET2) listOfferET2: ListOfferET2;
    @property(SpriteFrame) sfCoin1: SpriteFrame;
    @property(SpriteFrame) sfCoin2: SpriteFrame;
    @property(Label) lbTime: Label;
    @property(Node) nUIEnsureOut: Node;
    @property(ShadowGameUI) nShadowUIEnsureOut: ShadowGameUI;

    @property(Node) nUIReceivePrize: Node;
    private readonly timeReceivePrize: number = 0.3;

    private isInitPack = false;

    protected onLoad(): void {
        clientEvent.on(EVENT_ENDLESS_TREASURE.GET_IMAGE_COIN, this.GetImageCoin, this);
        clientEvent.on(EVENT_ENDLESS_TREASURE.UPDATE_UI_INCREASE_ENDLESS_TREASURE, this.UpdateUI, this);
    }

    protected onEnable(): void {
        clientEvent.on(EVENT_ENDLESS_TREASURE.BUY_PACK_SUCCESS, this.BuyPackSuccess, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_ENDLESS_TREASURE.BUY_PACK_SUCCESS, this.BuyPackSuccess, this);
        this.UnRegisterTime();
    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_ENDLESS_TREASURE.GET_IMAGE_COIN, this.GetImageCoin, this);
        clientEvent.off(EVENT_ENDLESS_TREASURE.BUY_PACK_SUCCESS, this.BuyPackSuccess, this);
        clientEvent.off(EVENT_ENDLESS_TREASURE.UPDATE_UI_INCREASE_ENDLESS_TREASURE, this.UpdateUI, this);
    }

    public async PrepareDataShow(): Promise<void> {
        if (!this.isInitPack) {
            this.isInitPack = true;
            this.listOfferET2.InitListPack();
        }

        this.UpdateUITime();
        const timeRemaining = DataEndlessTreasureSys.Instance.GetTimeToDiplay();
        if (timeRemaining > 0) {
            this.RegisterTime();
        }

        this.nUIEnsureOut.active = false;
    }

    public async UICloseDone(): Promise<void> {
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
    }

    //======================================
    //#region time
    private RegisterTime() {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    private UnRegisterTime() {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    private UpdateUITime() {
        const timeShow = DataEndlessTreasureSys.Instance.GetTimeToDiplay();
        if (timeShow < 0) {
            this.UnRegisterTime();
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            this.lbTime.string = Utils.convertTimeLengthToFormat(timeShow);
        }
    }
    //#endregion time
    //======================================

    //======================================
    //#region event listen
    private async BuyPackSuccess(dataPack: InfoPackEndlessTreasure, typeAnim: 'Anim1' | 'Anim2' = 'Anim1', listVisualNode: Node[] = [], listWPos: Vec3[] = []) {
        switch (typeAnim) {
            case 'Anim1':
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_ENLESSTREASURE, 1);
                await this.AnimReceivePrize_1(dataPack);
                break;
            case 'Anim2':
                await this.AnimReceivePrize_2(listVisualNode, listWPos);
                break;
        }
    }

    private GetImageCoin(numPrize: number, cb: CallableFunction) {
        if (numPrize == 1) {
            cb(this.sfCoin1);
        } else {
            cb(this.sfCoin2);
        }
    }

    /**
     * this func is called when the previous pack was bought
     */
    private UpdateUI() {
        this.listOfferET2.AnimMovePack();
        // this.listItemOfferET.UpdateItem(PlayerData.Instance.ET_numPackUnlocked);
    }
    //#endregion event listen
    //======================================


    //======================================
    //#region self
    private ShowUI() {
        const timeHideUI: number = 0.2;
        tween(this.node.getComponent(UIOpacity))
            .to(timeHideUI, { opacity: 255 })
            .start();
    }

    private HideUI() {
        const timeHideUI: number = 0.5;
        tween(this.node.getComponent(UIOpacity))
            .to(timeHideUI, { opacity: 0 })
            .start();
    }

    private async AnimReceivePrize_1(dataPack: InfoPackEndlessTreasure) {
        // hiển thị giao diện nhận thưởng
        this.HideUI();
        await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.ENDLESS_TREASURE, dataPack.rewards, "UIEndlessTreasure", -1, null, "Endless Treasure");
        this.ShowUI();
    }

    private async AnimReceivePrize_2(listVisualPrize: Node[], listWPos: Vec3[]) {
        // popUp nhận thưởng item
        for (let i = 0; i < listVisualPrize.length; i++) {
            const visualPrize = listVisualPrize[i];
            const wPos = listWPos[i];
            AniTweenSys.playAnimPopUpItemUpper(visualPrize, wPos, this.nUIReceivePrize, () => {
                this.scheduleOnce(() => {
                    SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.EFFECT_LEVEL_DONE_LOBBY);
                }, this.timeReceivePrize);
            });
        }
    }
    //#endregion self
    //======================================

    //======================================
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIEndlessTreasure");
        // check is endEvent + had prize to receive
        const valid1 = DataEndlessTreasureSys.Instance.GetTimeToDiplay();
        const valid2 = DataEndlessTreasureSys.Instance.HasAnyPackCanBuyOrClaim();
        if (valid1 <= 0 && valid2) {
            this.ShowUI_ensure_et();
        } else {
            clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_ENLESSTREASURE, 1);
        }
    }
    //#endregion btn
    //======================================

    //======================================
    //#region ui ensure close et
    public ShowUI_ensure_et() {
        this.nShadowUIEnsureOut.Show();
        this.animShowAndMove.ComeUpWithOpacityShow(this.nUIEnsureOut);
    }

    public CloseUI_ensure_et() {
        this.nShadowUIEnsureOut.Hide();
        this.animShowAndMove.ComeDownWithOpacityClose(this.nUIEnsureOut);
    }

    public BtnYesUIEnsure_et() {
        LogEventManager.Instance.logButtonClick(`yes_enssure_quit`, "UIEndlessTreasure");
        this.CloseUI_ensure_et();
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_ENLESSTREASURE, 1);
    }

    public BtnCloseUIEnsure_et() {
        LogEventManager.Instance.logButtonClick(`close`, "UIEndlessTreasure");
        this.CloseUI_ensure_et();
    }
    //#endregion ui ensure close et 
    //======================================
}


