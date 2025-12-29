import { _decorator, Component, Node, ParticleSystem, Sprite, SpriteFrame, Vec3 } from 'cc';
import { MConst, TYPE_UI } from '../../Const/MConst';
import { UISceneSysBase } from '../../Common/UISceneSysBase';
import { clientEvent } from '../../framework/clientEvent';
import { LogicCheckTutInLobby } from '../Tutorial/OtherUI/LogicCheckTutInLobby';
import { LogEventManager } from '../../LogEvent/LogEventManager';
import { Utils } from '../../Utils/Utils';
import { DataLogEventSys } from '../../LogEvent/DataLogEventSys';
import { PageViewLobbySys2 } from './PageViewLobbySys2';
import { ShadowGameUI } from '../GameScene/OtherUI/ShadowGameUI';
import { InfoControlUIAdsAndNoAds } from './InfoControlUIAdsAndNoAds';
import { PlayerData } from '../../Utils/PlayerData';
import { CheatingSys } from '../CheatingSys';
import { PAGE_VIEW_LOBBY_NAME } from '../../Utils/Types';
import { UIPageHomeSys } from './PageSys/UIPageHomeSys';
import { MConfigs } from '../../Configs/MConfigs';
import { ResourceUtils } from '../../Utils/ResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('UILobbySys')
export class UILobbySys extends UISceneSysBase {
    public static Instance: UILobbySys;
    @property(ShadowGameUI) shadowGameUI: ShadowGameUI;
    @property(PageViewLobbySys2) pvLobbySys: PageViewLobbySys2;
    @property(LogicCheckTutInLobby) logicCheckTutInLobby: LogicCheckTutInLobby;
    @property(Node) nTabHome: Node;
    @property(InfoControlUIAdsAndNoAds) infoControlUIAdsAndNoAds: InfoControlUIAdsAndNoAds;

    public MLoad(): void {
        if (UILobbySys.Instance == null) {
            UILobbySys.Instance = this;

            // prepare UI
            this.shadowGameUI.node.active = false;
        }
    }

    public MOnEnable(): void {
        // register listen event
        clientEvent.on(MConst.EVENT.HIDE_SHADOW_LOBBY, this.HideShadowLobby, this);
        clientEvent.on(MConst.EVENT.SHOW_SHADOW_LOBBY, this.ShowShadowLobby, this);
        clientEvent.on(MConst.EVENT_LOBBY.GET_WPOS_TAB_HOME, this.getWPosTabHome, this);
    }

    public MOnDisable(): void {
        clientEvent.off(MConst.EVENT.HIDE_SHADOW_LOBBY, this.HideShadowLobby, this);
        clientEvent.off(MConst.EVENT.SHOW_SHADOW_LOBBY, this.ShowShadowLobby, this);
        clientEvent.off(MConst.EVENT_LOBBY.GET_WPOS_TAB_HOME, this.getWPosTabHome, this);
    }

    public MOnDestroy(): void {
        UILobbySys.Instance = null;
    }

    public MStart(): void {
        if (!DataLogEventSys.Instance.GetIsLogSplashToHome()) {
            DataLogEventSys.Instance.SetIsLogSplashToHome(true);
            let timeLoad: number = DataLogEventSys.Instance.GetTimeSplashToHome(Utils.getSecondNow());
            LogEventManager.Instance.logSplashToHome(timeLoad);
        }

        // update UINoAds
        // check if player was buy no ads => turn on UINoAds
        if (!PlayerData.Instance.CanShowAds || CheatingSys.Instance.isCheatNoAdsFeature) {
            // this.infoControlUIAdsAndNoAds.UseUINoAds();
        }

        if (!MConfigs.wasPreloadUIHome) {
            // preload scene game
            ResourceUtils.preLoadSceneBundle(MConst.NAME_SCENE.GAME, MConst.BUNDLE_SCENES, () => {
                console.log("Finished:", MConst.NAME_SCENE.GAME);
            });

            //preload UI
            clientEvent.dispatchEvent(MConst.EVENT.PRELOAD_UI_QUEUE, [
                TYPE_UI.UI_SPIN,
                TYPE_UI.UI_SETTING,
                TYPE_UI.UI_PACK_STARTER,
                TYPE_UI.UI_PACK_GREATE_DEALS_1,
                TYPE_UI.UI_PACK_GREATE_DEALS_2,
                TYPE_UI.UI_INVITE_FRIEND,
                TYPE_UI.UI_SEASON_PASS,
                TYPE_UI.UI_LOGIN_REWARD,
                TYPE_UI.UI_POPUP_BUY_LEVEL_PASS,
                TYPE_UI.UI_POPUP_BUY_SEASON_PASS,
                TYPE_UI.UI_LEVEL_PASS,
                TYPE_UI.UI_RANK,
                TYPE_UI.UI_TOURNAMENT,
                TYPE_UI.UI_RANK_TOURNAMENT,
                TYPE_UI.UI_CUSTOM_INVITE,
                TYPE_UI.UI_TUTOIRAL_IN_LOBBY,
                TYPE_UI.UI_WIN_WITHFRIEND,
                TYPE_UI.UI_FRIENDS,
                TYPE_UI.UI_PIGGY_BANK,
                TYPE_UI.UI_DASH_RUSH,
                TYPE_UI.UI_DASH_RUSH_PREPARE,
                TYPE_UI.UI_INFO_PLAYER,
                TYPE_UI.UI_LEVEL_PROGRESSION,
                TYPE_UI.UI_ENLESSTREASURE,
                TYPE_UI.UI_SPEED_RACE_PREPARE,
                TYPE_UI.UI_SPEED_RACE,
                TYPE_UI.UI_SKY_LIFT_DELAY,
                TYPE_UI.UI_SKY_LIFT
            ]);

            MConfigs.wasPreloadUIHome = true;
        }
    }

    private HideShadowLobby(isUseOpacity: boolean = true, timeHideShadow: number = 0) {
        if (timeHideShadow > 0) {
            this.shadowGameUI.Hide(isUseOpacity, timeHideShadow);
        } else {
            this.shadowGameUI.Hide(isUseOpacity);
        }
    }

    private ShowShadowLobby(isUseOpacity: boolean = true) {
        this.shadowGameUI.Show(isUseOpacity);
    }

    override callbackWhenPrepareShowUI(typeUI: TYPE_UI, showShadow: boolean): void {
        if (showShadow) {
            this.shadowGameUI.Show();
        }
    }

    override callbackWhenShowUIDone(typeUI: TYPE_UI): void {

    }

    override callbackWhenCloseUIDone(typeUI: TYPE_UI, isUseOpacity: boolean = true): void {
        // MConsolLog.Log("call callbackWhenCloseUIDone: " + !this.CheckHasAnyUIShow());

        if (!this.CheckHasAnyUIShow()) {
            this.shadowGameUI.Hide(isUseOpacity);
            // you can do something in here such as popup event
        }
    }

    override callbackWhenCloseAllUIDone(isUseOpacity: boolean = true): void {
        this.shadowGameUI.Hide(isUseOpacity);
    }

    //#region fun common
    public GetIndexPageShow(): number {
        return this.pvLobbySys.getPageIndexNow();
    }
    //#endregion

    //#region cb emit
    private getWPosTabHome(cb: CallableFunction) {
        const self = this;
        cb(self.nTabHome.getWorldPosition());
    }
    //#endregion cb emit


    //###############################
    //#region Other
    @property(Node) nForwardUI: Node;
    @property(Node) nCoinForward: Node;
    public ShowForwardUI() {
        this.nCoinForward.worldPosition = this.pvLobbySys.GetPageByType(PAGE_VIEW_LOBBY_NAME.HOME).getComponent(UIPageHomeSys).nUIMoney.worldPosition.clone();
        this.nForwardUI.active = true;
    }

    public HideForwardUI() {
        this.nForwardUI.active = false;
    }
    //#endregion Other
    //###############################

    private onBtnTryShowLevelProgression() {
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1);
    }
}


