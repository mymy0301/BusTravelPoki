import { _decorator, Component, director, EditBox, Label, Layout, Node, PhysicsSystem2D, Size, Sprite, SpriteFrame, UITransform, Widget } from 'cc';
import { UISceneSysBase } from '../../Common/UISceneSysBase';
import { ShadowGameUI } from './OtherUI/ShadowGameUI';
import { clientEvent } from '../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../Const/MConst';
import { UISignUpNumPassenger } from './OtherUI/UISignUpNumPassenger';
import { Utils } from '../../Utils/Utils';
import { GameManager } from '../GameManager';
import { MConfigs, TYPE_GAME } from '../../Configs/MConfigs';
import { ENV_TYPE, MConfigFacebook } from '../../Configs/MConfigFacebook';
import * as I18n from 'db://i18n/LanguageData';
import { languages } from 'db://assets/resources/i18n/en';
import { IUIPopUpRemoveAds, STATE_GAME, TYPE_ITEM } from '../../Utils/Types';
import { DataCustomUIShop, PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../OtherUI/UIShop/TypeShop';
import { LogEventManager } from '../../LogEvent/LogEventManager';
import { DataLogEventSys } from '../../LogEvent/DataLogEventSys';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { DataBuildingSys } from '../../DataBase/DataBuildingSys';
import { GroupInfoTournament } from '../OtherUI/UITournament/GroupInfoTournament';
import { LEVEL_TUT_IN_GAME } from '../OtherUI/UITutorialInGame/TypeTutorialInGame';
import { PlayWithFriendGroup } from '../../WithFriend/PlayWithFriendGroup';
import { DataInfoPlayer } from '../DataInfoPlayer';
import { FBInstantManager } from '../../Utils/facebooks/FbInstanceManager';
import { GameSys } from './GameSys';
import { InfoTournamentTitleGroup } from '../OtherUI/UITournament/InfoTournamentTitleGroup';
import { CurrencyUIBaseSys } from '../../DataBase/Currency/CurrencyUIBaseSys';
import { ResourceUtils } from '../../Utils/ResourceUtils';
import { UICooldownTimeCar } from './OtherUI/UICooldownTimeCar/UICooldownTimeCar';
import SupLogEvent from '../../LogEvent/SupLogEvent';
import { CurrencySys } from '../CurrencySys';
const { ccclass, property } = _decorator;

@ccclass('GameUISys')
export class GameUISys extends UISceneSysBase {
    public static Instance: GameUISys = null;
    @property(ShadowGameUI) shadowGameUI: ShadowGameUI;
    @property(UISignUpNumPassenger) uiSignUpNumPassenger: UISignUpNumPassenger;
    @property(Label) lbLevel: Label;
    @property(Label) lbLevelChrist: Label;
    // @property(Node) nBtnAds: Node;
    // @property(Node) nBtnTicket: Node;
    @property(Sprite) spBgGame: Sprite;

    @property(Node) nUICoin: Node;
    // @property(Node) nUITicket: Node;

    @property(Node) nUIReplay: Node;
    @property(Node) nUIReplay2: Node;


    @property({ group: "UI_GAME_2", type: Node }) nUIGame2: Node;
    @property({ group: "UI_GAME_2", type: Node }) nUIBottom: Node;

    @property({ group: "Test", type: EditBox }) edtLevelSkip: EditBox = null;

    @property(Node) groupInfoNormal: Node;
    @property(GroupInfoTournament) groupInfoTournament: GroupInfoTournament;
    @property(InfoTournamentTitleGroup) infoTournamentTitleGroup: InfoTournamentTitleGroup = null;
    @property(PlayWithFriendGroup) playWithFriendGroup: PlayWithFriendGroup = null;
    @property(UICooldownTimeCar) uiCooldownTimeCar: UICooldownTimeCar;
    @property(Node) nGroupInfoChrist: Node;

    @property(Node) nBtnSort: Node;
    @property(Node) nBtnShuffle: Node;
    @property(Node) nBtnVipSlot: Node;
    @property(Node) nShop: Node;

    public MLoad(): void {
        if (GameUISys.Instance == null) GameUISys.Instance = this;
        const typeGamePlaying = GameManager.Instance.TypeGamePlay;
        const levelNow = DataBuildingSys.Instance.GetIndexMapNow();
        MConfigResourceUtils.GetImageMapGameUntilLoad(levelNow, (level, sf: SpriteFrame) => {
            try {
                switch (typeGamePlaying) {
                    case TYPE_GAME.CHRISTMAS:
                        if (sf != null) { this.spBgGame.spriteFrame = sf; }
                        break;
                    default:
                        if (levelNow == level) {
                            this.spBgGame.spriteFrame = sf;
                        }
                        break;
                }
            } catch (e) {

            }
        }, GameManager.Instance.TypeGamePlay == TYPE_GAME.CHRISTMAS ? 'Christmas' : 'Normal');
        // this.spBgGame.spriteFrame = MConfigResourceUtils.GetImageMapGame(levelNow);
        // Utils.DrawPhysicsDebugging();

        // this.nBtnAds.active = false;
    }

    public MOnEnable(): void {
        this.shadowGameUI.Hide();
        clientEvent.on(MConst.EVENT.SHOW_SHADOW_GAME, this.ShowShadowGame, this);
        clientEvent.on(MConst.EVENT.SHOW_SHADOW_GAME_WITH_NO_OPACITY, this.ShowShadowGameWithNoOpacity, this);
        clientEvent.on(MConst.EVENT.HIDE_SHADOW_GAME, this.HideShadowGame, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetNewGame, this);
        clientEvent.on(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
        clientEvent.on(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);
        clientEvent.on(MConst.EVENT.BUY_NO_ADS_SUCCESS, this.OnBuyNoAdsSuccessful, this);
        clientEvent.on(MConst.EVENT.GET_WPOS_BOOSTER, this.GetWPosBooster, this);
    }

    public MOnDisable(): void {
        GameUISys.Instance = null;
        clientEvent.off(MConst.EVENT.SHOW_SHADOW_GAME, this.ShowShadowGame, this);
        clientEvent.off(MConst.EVENT.SHOW_SHADOW_GAME_WITH_NO_OPACITY, this.ShowShadowGameWithNoOpacity, this);
        clientEvent.off(MConst.EVENT.HIDE_SHADOW_GAME, this.HideShadowGame, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetNewGame, this);
        clientEvent.off(MConst.EVENT.RESUME_GAME, this.ResumeGame, this);
        clientEvent.off(MConst.EVENT.PAUSE_GAME, this.PauseGame, this);
        clientEvent.off(MConst.EVENT.BUY_NO_ADS_SUCCESS, this.OnBuyNoAdsSuccessful, this);
        clientEvent.off(MConst.EVENT.GET_WPOS_BOOSTER, this.GetWPosBooster, this);

        SupLogEvent.SetIsInWayLogLoseEventStreak = false;
        SupLogEvent.SetIsInWayLogLoseNormal = false;
    }

    public MStart(): void {
        // log event
        if (!DataLogEventSys.Instance.GetIsLogSplashToHome()) {
            DataLogEventSys.Instance.SetIsLogSplashToHome(true);
            let timeLoad: number = DataLogEventSys.Instance.GetTimeSplashToHome(Utils.getSecondNow());
            LogEventManager.Instance.logSplashToHome(timeLoad);
        }


        this.ResetNewGame(true);
        this.groupInfoNormal.active = false;
        this.nGroupInfoChrist.active = false;
        this.groupInfoTournament.node.active = false;
        this.playWithFriendGroup.node.active = false;
        this.infoTournamentTitleGroup.node.active = false;
        this.nUIReplay.active = true;
        this.nUIReplay2.active = false;
        this.nUICoin.active = true;
        // this.nUITicket.active = true;
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.TUTORIAL:
                this.nUICoin.getComponent(CurrencyUIBaseSys).UnRegisterClick();
                // this.nUITicket.getComponent(CurrencyUIBaseSys).UnRegisterClick();
                this.nUIReplay.active = false;
                // this.nBtnAds.active = false;
                this.groupInfoNormal.active = false;
                this.nGroupInfoChrist.active = false;
                break;
            case TYPE_GAME.NORMAL:
                if (GameManager.Instance.JsonPlayGame.LEVEL == 2) {
                    this.nUICoin.getComponent(CurrencyUIBaseSys).UnRegisterClick();
                    // this.nUITicket.getComponent(CurrencyUIBaseSys).UnRegisterClick();
                }
                this.groupInfoNormal.active = true;
                break;
            case TYPE_GAME.TOURNAMENT:
                this.groupInfoTournament.node.active = true;
                this.groupInfoTournament.initTournament();
                break;
            case TYPE_GAME.WITH_FRIEND:
                this.nUIReplay.active = false;
                this.nUIReplay2.active = true;
                this.nUICoin.active = false;
                // this.nUITicket.active = false;

                this.playWithFriendGroup.node.active = true;
                this.playWithFriendGroup.initWithFriendGroup(DataInfoPlayer.Instance.currWithFriendDataInfo);
                break;
            case TYPE_GAME.CHRISTMAS:
                this.nGroupInfoChrist.active = true;
                break;
        }

        // if (FBInstantManager.Instance.IsForceOffIAP) {
        //     this.nBtnTicket.active = false;
        // }
    }

    public ShowInfoGroupTitleTournament(callBack: any) {
        if (GameManager.Instance.JsonPlayTournament.LEVEL == 1) {
            this.infoTournamentTitleGroup.showTitle(GameManager.Instance.ModeGame.TOURNAMENT.name_leaderboard, callBack);
        }
    }
    //=======================================================================
    //#region self func
    private ResetNewGame(isFromStart: boolean = false) {
        // NOTE
        // you can set your logic here in 2 case
        // 1. call another scene to scene game
        // 2. call from in game scene like: btnResetGame or something like that
        this.uiCooldownTimeCar.ReUseAllNoti();
    }

    private ResumeGame() {
        //NOTE update UI in here
    }

    private PauseGame() {
        //NOTE update UI in here
    }

    override callbackWhenPrepareShowUI(typeUI: TYPE_UI, showShadow: boolean): void {
        if (showShadow) {
            this.shadowGameUI.Show();
        }
    }

    private ShowShadowGame(isUseOpacity = true) {
        this.shadowGameUI.Show(isUseOpacity);
    }

    private ShowShadowGameWithNoOpacity() {
        this.shadowGameUI.ShowShadowBlockNoShadow();
    }

    private HideShadowGame(isUseOpacity = true, timeHideShadow: number = -1) {

        // console.log("hide shadow game", isUseOpacity, timeHideShadow);

        if (timeHideShadow > 0) {
            this.shadowGameUI.Hide(isUseOpacity, timeHideShadow);
        } else {
            this.shadowGameUI.Hide(isUseOpacity);
        }
    }

    override callbackWhenShowUIDone(typeUI: TYPE_UI): void {

    }

    override callbackWhenCloseUIDone(typeUI: TYPE_UI): void {
        // MConsolLog.Log("call callbackWhenCloseUIDone: " + !this.CheckHasAnyUIShow());

        if (!this.CheckHasAnyUIShow()) {
            this.shadowGameUI.Hide();
            // you can do something in here such as popup event
        }
    }

    override callbackWhenCloseAllUIDone(): void {
        this.shadowGameUI.Hide();
    }

    private GetWPosBooster(typeItem: LEVEL_TUT_IN_GAME, cb: CallableFunction) {
        switch (typeItem) {
            case LEVEL_TUT_IN_GAME.SORT: cb(this.nBtnSort.worldPosition.clone()); break;
            case LEVEL_TUT_IN_GAME.SHUFFLE: cb(this.nBtnShuffle.worldPosition.clone()); break;
            case LEVEL_TUT_IN_GAME.VIP_SLOT: cb(this.nBtnVipSlot.worldPosition.clone()); break;
        }
    }

    public PreloadAllUINeed() {
        // check type game play to preload suit
        /**Sample code **/
        if (MConfigs.wasPreloadUIGame) return;
        ResourceUtils.preLoadSceneBundle(MConst.NAME_SCENE.LOBBY, MConst.BUNDLE_SCENES, () => {
            console.log("Finished:", MConst.NAME_SCENE.LOBBY);
        })
        MConfigs.wasPreloadUIGame = true;

        let listTypeUISuitTypeGame: TYPE_UI[] = [];
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.NORMAL:
                listTypeUISuitTypeGame.push(TYPE_UI.UI_WIN);
                listTypeUISuitTypeGame.push(TYPE_UI.UI_QUIT);
                break;
            case TYPE_GAME.TOURNAMENT:
                listTypeUISuitTypeGame.push(TYPE_UI.UI_WIN_TOURNAMENT);
                break;
            case TYPE_GAME.WITH_FRIEND:
                listTypeUISuitTypeGame.push(TYPE_UI.UI_WIN_WITHFRIEND);
                break;
        }

        clientEvent.dispatchEvent(MConst.EVENT.PRELOAD_UI_QUEUE, [
            TYPE_UI.UI_TUTORIAL_IN_GAME,
            TYPE_UI.UI_ENSURE_RESET_GAME,
            TYPE_UI.UI_PAUSE,
            TYPE_UI.UI_LOSE,
            TYPE_UI.UI_UNLOCK_PARKING,
            TYPE_UI.UI_CONTINUE,
            TYPE_UI.UI_POPUP_BUY_ITEM,
            TYPE_UI.UI_POPUP_REMOVE_ADS,
            TYPE_UI.UI_SHOP,
            ...listTypeUISuitTypeGame
        ]);
    }
    //#endregion self func
    //=======================================================================

    //=======================================================================
    //#region setUI
    public SetGamePreparePlayNormal(numPassengers: number) {
        this.uiSignUpNumPassenger.SetNumPassenger(numPassengers, GameManager.Instance.TypeGamePlay == TYPE_GAME.CHRISTMAS ? 'christ' : 'normal');
        switch (GameManager.Instance.TypeGamePlay) {
            case TYPE_GAME.CHRISTMAS:
                this.uiSignUpNumPassenger.SetNumPassenger(numPassengers, 'christ');
                this.lbLevelChrist.string = `CHRISTMAS LEVEL ${GameManager.Instance.JsonPlayChristmas.LEVEL}`;
                break;
            default:
                this.uiSignUpNumPassenger.SetNumPassenger(numPassengers, 'normal');
                this.lbLevel.string = `LEVEL ${GameManager.Instance.JsonPlayGame.LEVEL}`;
                break;
        }
    }

    public async OnBuyNoAdsSuccessful() {
        // sẽ có thể xảy ra trường hợp là người chơi thanh toán khi đã win
        // Khi win giao diện đã được thay đổi để nhường chỗ cho anim 
        // cần phải check nếu trong trường hợp người chơi từ đang ở trạng thái win thì sẽ không cập nhật giao diện theo như ở dưới
        let canRunLogic = false;
        let canTweenUI = true;
        clientEvent.dispatchEvent(MConst.EVENT_GAME_SYS_CB.GET_STATE_GAME, (stateGame: STATE_GAME) => {
            if (stateGame == STATE_GAME.WIN_GAME) {
                canTweenUI = false;
            }
            canRunLogic = true;
        })
        await Utils.WaitReceivingDone(() => canRunLogic);

        // hide btn ads
        // this.nBtnAds.active = false;

        if (!canTweenUI) return;


        // ở đây vì chúng ta neo theo top cho nên khi kéo dài chiều cao ra thì auto UI sẽ nới rộng xuống dưới
        // đối vs IOS thì thanh homeIndicator có chiều cao mặc định là 34pts do đó chúng ta sẽ 
        // lấy chiều cao của toàn màn hình - chiều cao mặc định của IOS là được < chỉnh là 40 để cho nó cao thêm chút>
        const heightOfScreen = Utils.getSizeWindow().height;
        const defaultHomeIndicatorIOS = 40;
        const nowContentSizeUIGame: Size = this.nUIGame2.getComponent(UITransform).contentSize.clone();
        let contentSizeChoice: Size = new Size();
        // check xem máy có phải IOS hay không
        if (MConfigFacebook.Instance.envType == ENV_TYPE.FB && FBInstant.getPlatform() === "IOS") {
            contentSizeChoice = new Size(nowContentSizeUIGame.width, heightOfScreen - defaultHomeIndicatorIOS)
        } else {
            contentSizeChoice = new Size(nowContentSizeUIGame.width, heightOfScreen);
        }

        this.nUIGame2.getComponent(UITransform).setContentSize(contentSizeChoice);
        this.nUIBottom.getComponent(Widget).bottom = 0;
        this.nUIBottom.getComponent(Widget).updateAlignment();
    }

    public HideUIAds() {
        // this.nBtnAds.active = false;
    }

    public HideUIShop() {
        this.nShop.active = false;
        this.nUIBottom.getComponent(Layout).spacingX = 30;
        this.nUIBottom.getComponent(Layout).updateLayout(true);
    }

    //#endregion setUI
    //=======================================================================

    //=======================================================================
    //#region btnUI
    private BtnReset() {
        LogEventManager.Instance.logButtonClick("reset", "game");

        // check case can pause game or not
        if (GameSys.Instance.GetStateGame() != STATE_GAME.PLAYING) { return; }
        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_ENSURE_RESET_GAME, 1);
    }
    private BtnPause() {
        LogEventManager.Instance.logButtonClick("pause", "game");

        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PAUSE, 1);
    }

    private BtnAds() {
        LogEventManager.Instance.logButtonClick("remove_ads", "game");

        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);
        // hiển thị gói no ads
        const dataCustom: IUIPopUpRemoveAds = {
            isEmitContinue: true
        }
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_POPUP_REMOVE_ADS, 1, true, dataCustom);
    }

    private BtnShop() {
        LogEventManager.Instance.logButtonClick("shop", "game");

        // if (MConfigs.numIAPTicketHave > 0) {
        //     this.LogicShowShop(PAGE_VIEW_SHOP.PACKAGE);
        // } else {
        //     this.LogicShowShop(PAGE_VIEW_SHOP_2.DAILY_QUEST);
        // }
    }

    private BtnShopCoin() {
        LogEventManager.Instance.logButtonClick("coin", "game");

        // if (MConfigs.numIAPTicketHave > 0) {
        //     this.LogicShowShop(PAGE_VIEW_SHOP.COIN);
        // } else {
        //     this.LogicShowShop(PAGE_VIEW_SHOP_2.COIN);
        // }
    }

    private BtnShopSkipIts() {
        LogEventManager.Instance.logButtonClick("skip_ads", "game");

        // if (MConfigs.numIAPTicketHave > 0) {
        //     this.LogicShowShop(PAGE_VIEW_SHOP.SKIP_ITS);
        // }
    }


    private async LogicShowShop(pageViewStart: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2) {
        // check ko có xe di chuyển , 
        // check ko có người đang lên xe mới cho bật UI Shop
        let hasCarIsMoving: boolean = false;
        let hasPassMoving: boolean = false;
        let canRunLogic: boolean = false;

        // chỉ mở trong trường hợp người chơi đang trong chế độ chơi game
        let canKeepLogic: boolean = true;
        let canContinueLogic: boolean = false;
        clientEvent.dispatchEvent(MConst.EVENT_GAME_SYS_CB.GET_STATE_GAME, (stateGame: STATE_GAME) => {
            if (stateGame != STATE_GAME.PLAYING) {
                canKeepLogic = false
            }
            canContinueLogic = true;
        })
        await Utils.WaitReceivingDone(() => canContinueLogic);
        if (!canKeepLogic) {
            return;
        }

        // check car is moving
        clientEvent.dispatchEvent(MConst.EVENT_GAME_SYS_CB.IS_CAR_MOVING, (result) => {
            hasCarIsMoving = result;
            canRunLogic = true;
        })
        await Utils.WaitReceivingDone(() => canRunLogic);
        canRunLogic = false;
        if (hasCarIsMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, I18n.t(languages['Car is moving, please wait!']));
            return;
        }

        // check pass is moving
        clientEvent.dispatchEvent(MConst.EVENT_GAME_SYS_CB.IS_PASS_MOVING, (result) => {
            hasPassMoving = result;
            canRunLogic = true;
        })
        await Utils.WaitReceivingDone(() => canRunLogic);
        canRunLogic = false;
        if (hasPassMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, I18n.t(languages['Passenger is moving, please wait!']));
            return;
        }

        // // if pass all case show ui shop
        // let dataCustomUIShop: DataCustomUIShop = {
        //     isActiveClose: true,
        //     openUIAfterClose: null,
        //     pageViewShop_ScrollTo: pageViewStart,
        //     canAutoResumeGame: true
        // }
        // clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);
        // // clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_GAME_WITH_NO_OPACITY);
        // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SHOP_SHORT, 2, true, dataCustomUIShop, false);
    }
    //#endregion btnUI
    //=======================================================================

    //=======================================================================
    //#region  btn test
    private BtnShowDebug() {
        Utils.DrawPhysicsDebugging();
    }

    private BtnHideDebug() {
        Utils.UnDrawPhysicsDebugging();
    }

    private BtnNextMap() {
        if (this.edtLevelSkip != null && this.edtLevelSkip.string != "") {
            try {
                let lvSkipTo: number = Number.parseInt(this.edtLevelSkip.string);
                if (lvSkipTo >= 1) {
                    GameManager.Instance.JsonPlayGame.LEVEL = MConfigs.GetLevelGame(lvSkipTo - 1);
                }
                GameManager.Instance.PreparePlayNormal(GameManager.Instance.JsonPlayGame.LEVEL, 0, []);
            } catch (e) {

            }
        } else {
            // change JSOn
            GameManager.Instance.PreparePlayNormal(GameManager.Instance.JsonPlayGame.LEVEL + 1, 0, []);
        }
    }

    private BtnPreviousMap() {
        GameManager.Instance.JsonPlayGame.LEVEL -= 2;
        if (GameManager.Instance.JsonPlayGame.LEVEL < -1)
            GameManager.Instance.JsonPlayGame.LEVEL = -1;
        clientEvent.dispatchEvent(MConst.EVENT.NEXT_LEVEL);
    }

    private BtnWinGame(event: CustomEvent) {
        // if (!CheatingSys.Instance.canCheatCode) return;
        GameSys.Instance.ChangeStateGame(STATE_GAME.WIN_GAME);
    }

    private BtnMapAmbulance() {
        GameManager.Instance.CHEAT_LEVEL(LEVEL_TUT_IN_GAME.AMBULANCE);
        GameManager.Instance.PreparePlayNormal(LEVEL_TUT_IN_GAME.AMBULANCE, 0, []);
    }

    private BtnMapCarDirection() {
        GameManager.Instance.CHEAT_LEVEL(LEVEL_TUT_IN_GAME.CAR_TWO_WAY);
        GameManager.Instance.PreparePlayNormal(LEVEL_TUT_IN_GAME.CAR_TWO_WAY, 0, []);
    }

    private BtnMapCarKeyLock() {
        GameManager.Instance.CHEAT_LEVEL(LEVEL_TUT_IN_GAME.KEY_LOCK);
        GameManager.Instance.PreparePlayNormal(LEVEL_TUT_IN_GAME.KEY_LOCK, 0, []);
    }

    private BtnMapFire() {
        GameManager.Instance.CHEAT_LEVEL(191);
        GameManager.Instance.PreparePlayNormal(191, 0, []);
    }

    private BtnMapNormalNew() {
        GameManager.Instance.CHEAT_LEVEL(223);
        GameManager.Instance.PreparePlayNormal(223, 0, []);
    }

    private BtnMapPolice() {
        GameManager.Instance.CHEAT_LEVEL(239);
        GameManager.Instance.PreparePlayNormal(239, 0, []);
    }

    private BtnAddCoin() {
        CurrencySys.Instance.AddMoney(99999, "cheat", true, true, false);
    }
    //#endregion  btn test
    //=======================================================================
}



