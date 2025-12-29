import { _decorator, Component, director, Label, macro, Node, ParticleSystem, Sprite, SpriteFrame, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { BuildingLobbySys } from '../BuildingLobby/BuildingLobbySys';
import { ZoomMapLobbySys } from '../BuildingLobby/ZoomMapLobbySys';
import { ShowAndHideUIPageHome } from '../ShowAndHideUIPageHome';
import { Building_cb_afterUnlockNewConstructor, TYPE_RECEIVE_PRIZE_LOBBY, IPrize, TYPE_LEVEL_NORMAL, PAGE_VIEW_LOBBY_NAME, TYPE_UI_SHARE, FriendDataInfo, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { UIReceivePrizeLobby } from '../UIReceivePrizeLobby';
import { DataBuildingSys } from '../../../DataBase/DataBuildingSys';
import { CheatingSys } from '../../CheatingSys';
import { MoneyUISys } from '../../../DataBase/Currency/MoneyUISys';
import { TicketUISys } from '../../../DataBase/Currency/TicketUISys';
import { GameManager } from '../../GameManager';
import { ReadMapLobbyJson } from '../../../MJson/ReadMapLobbyJson';
import { BtnBuildingLobby } from '../BuildingLobby/BtnBuildingLobby';
import { MConfigs } from '../../../Configs/MConfigs';
import { PAGE_VIEW_SHOP, PAGE_VIEW_SHOP_2 } from '../../OtherUI/UIShop/TypeShop';
import { UILobbySys } from '../UILobbySys';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { CanvasLoadingSys } from '../../../Utils/CanvasLoadingSys';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { UIBuilding_lobby } from '../BuildingLobby/UIBuilding_lobby';
const { ccclass, property } = _decorator;

@ccclass('UIPageHomeSys')
export class UIPageHomeSys extends Component {
    public static Instance: UIPageHomeSys = null;

    @property(Node) private nBtnPlay: Node;
    @property(Node) nUIMoney: Node;
    @property(Node) private nUITicket: Node;
    @property(Node) nBtnBuilding: Node;
    @property(Node) nBtnTicket: Node;
    @property(Node) nBgBtnBuilding: Node;
    @property(BuildingLobbySys) buildingLobbySys: BuildingLobbySys;
    @property(ZoomMapLobbySys) zoomMapLobbySys: ZoomMapLobbySys;
    @property(ShowAndHideUIPageHome) showAndHideUIPageHome: ShowAndHideUIPageHome;
    @property(BtnBuildingLobby) btnBuildingLobby: BtnBuildingLobby;
    @property(Sprite) spAvatarPlayer: Sprite;
    @property(UIBuilding_lobby) uiBuildingLobby: UIBuilding_lobby;
    @property(ParticleSystem) parSnow: ParticleSystem[] = [];


    protected onLoad(): void {

    }

    protected onEnable(): void {
        if (UIPageHomeSys.Instance == null) {
            UIPageHomeSys.Instance = this;
        }

        clientEvent.on(MConst.EVENT_BUILDING.CLOSE_UI_BUILDING, this.CloseUIBuilding_AfterDone, this);
        clientEvent.on(MConst.EVENT_BUILDING.SHOW_NEXT_CONSTRUCTOR, this.ShowNextConstructor, this);
        clientEvent.on(MConst.EVENT_BUILDING.ANIM_BUILDING_MAP_DONE, this.NextMap, this);
        clientEvent.on(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_COIN, this.getWPosCoin, this);
        clientEvent.on(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_TICKET, this.getWPosTicket, this);
        clientEvent.on(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_BTN_PLAY, this.getWPosBtnPlay, this);
        clientEvent.on(MConst.EVENT_PAGE_HOME.GET_showAndHideUIPageHome, this.getShowAndHideUIPageHome, this);
    }

    protected onDestroy(): void {

    }

    protected onDisable(): void {
        UIPageHomeSys.Instance = null;

        clientEvent.off(MConst.EVENT_BUILDING.CLOSE_UI_BUILDING, this.CloseUIBuilding_AfterDone, this);
        clientEvent.off(MConst.EVENT_BUILDING.SHOW_NEXT_CONSTRUCTOR, this.ShowNextConstructor, this);
        clientEvent.off(MConst.EVENT_BUILDING.ANIM_BUILDING_MAP_DONE, this.NextMap, this);
        clientEvent.off(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_COIN, this.getWPosCoin, this);
        clientEvent.off(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_TICKET, this.getWPosTicket, this);
        clientEvent.off(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_BTN_PLAY, this.getWPosBtnPlay, this);
        clientEvent.off(MConst.EVENT_PAGE_HOME.GET_showAndHideUIPageHome, this.getShowAndHideUIPageHome, this);


        // event in function NextMap
        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE, this.ContinueFinishingMap, this);
        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE, this.ContinueFinishingMap, this);

        //stop par
        this.parSnow.forEach(par => {
            par.stop();
        });
    }

    protected start(): void {
        this.LoadImagePlayer();

        // gen map when pageHome is ready
        this.buildingLobbySys.GenMap();

        // check IAPTicket and turn it off click ticket if it no have
        if (FBInstantManager.Instance.IsForceOffIAP) {
            this.nBtnTicket.active = false;
        }

        // play particle snow
        this.parSnow.forEach(par => {
            par.play();
        });
    }

    private LoadImagePlayer() {
        const self = this;
        ResourceUtils.TryLoadImage(MConfigFacebook.Instance.playerPhotoURL, (pathAvatar: string, spriteFrame: SpriteFrame) => {
            if (pathAvatar == MConfigFacebook.Instance.playerPhotoURL && self.node != null && self.node.isValid) {
                self.spAvatarPlayer.spriteFrame = spriteFrame;
            }
        });
    }

    //=======================================================
    //#region func listener
    private async CloseUIBuilding_AfterDone() {
        await Promise.all([
            this.showAndHideUIPageHome.ShowUI(),
            this.zoomMapLobbySys.ZoomToBase()
        ]);

        /**
         * XIN HÃY LƯU Ý RẰNG BẠN LUÔN BẬT BLOCK UI LOBBY KHI BUILDING XONG <TRƯỚC KHI GỌI HÀM NÀY>
         */
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);

        // emit tiếp tục chạy anim ở pageHome
        clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
    }

    private async ShowNextConstructor(cb: Building_cb_afterUnlockNewConstructor) {
        let isUnlockFullMap: boolean = this.buildingLobbySys.IsUnlockFullMap();
        if (isUnlockFullMap) {
            DataBuildingSys.Instance.IncreaseNextMap();
            cb(isUnlockFullMap);
        } else {
            const infoConstructorNow = DataBuildingSys.Instance.GetInfoConstructorNow();
            const scaleNewConstructor = infoConstructorNow.scaleWhenZoom;
            const distanceWhenZoom = infoConstructorNow.distanceWhenZoom;
            await this.zoomMapLobbySys.FocusOnObj(this.buildingLobbySys.GetNFocusConstructor(), scaleNewConstructor, distanceWhenZoom);
            await this.buildingLobbySys.OpenConstructorNowToBuild();
            let newConstrutor: Node = this.buildingLobbySys.GetNConstructorBuidling();
            let newRemainingBlock = this.buildingLobbySys.GetRemaingProgressBuilding();
            cb(isUnlockFullMap, newConstrutor, newRemainingBlock);
        }
    }

    //#endregion func listener

    //#region self button
    private ShowInfoPlayer() {
        LogEventManager.Instance.logButtonClick("info_player", "home");

        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_INFO_PLAYER, 1);
    }

    public async PlayGame() {
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
    }

    private async OnBtnPlay() {
        LogEventManager.Instance.logButtonClick("play_normal", "home");

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        await this.PlayGame();
    }

    private OnBtnSetting() {
        LogEventManager.Instance.logButtonClick("setting", "home");

        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SETTING, 1);
    }

    private async OnBtnBuilding() {
        LogEventManager.Instance.logButtonClick("building", "home");

        // kiểm tra nếu trong trường hợp người chơi chưa chơi tut thì bắn emit tut done
        if (!DataBuildingSys.Instance.IsPlayTutBuilding()) {
            clientEvent.dispatchEvent(MConst.EVENT_BUILDING.TUT_BUILDING_DONE);
            DataBuildingSys.Instance.SetDoneTutBuidling();
        }

        await this.ZoomConstructorNowForBuild();
    }

    private async ZoomConstructorNowForBuild() {
        const nFocusConBuilding: Node = this.buildingLobbySys.GetNFocusConstructor();
        const infoConstructorNow = DataBuildingSys.Instance.GetInfoConstructorNow();
        const scaleNewConstructor = infoConstructorNow.scaleWhenZoom;
        const distanceWhenZoom = infoConstructorNow.distanceWhenZoom;

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        // anim zoom map
        await Promise.all([
            this.showAndHideUIPageHome.HideUI(),
            this.zoomMapLobbySys.FocusOnObj(nFocusConBuilding, scaleNewConstructor, distanceWhenZoom)
        ])
        // show UI building
        let numBlock: number = DataBuildingSys.Instance.GetNumBlockPlayerNow();
        let numBlockRemaing = this.buildingLobbySys.GetRemaingProgressBuilding()

        const numBlockCheating = CheatingSys.Instance.numBlockEachTimeBuild;
        if (CheatingSys.Instance.isCheatMapLobby && numBlockCheating > 0) {
            numBlock = numBlockCheating;
        }
        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.SHOW_UI_BUILDING, numBlock, numBlockRemaing, nFocusConBuilding);

        /**
         * XIN HÃY NHỚ RẰNG BẠN SẼ TẮT BLOCK UI LOBBY ĐI SAU KHI UI BUILDING ĐÃ SẴN SÀNG ĐỂ SỬ DỤNG
         */
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    public async ZoomConstructorNowToReceivePrize() {
        const nFocusConBuilding: Node = this.buildingLobbySys.GetNFocusConstructor();
        const infoConstructorNow = DataBuildingSys.Instance.GetInfoConstructorNow();
        const scaleNewConstructor = infoConstructorNow.scaleWhenZoom;
        const distanceWhenZoom = infoConstructorNow.distanceWhenZoom;

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        // anim zoom map
        await Promise.all([
            this.showAndHideUIPageHome.HideUI(),
            this.zoomMapLobbySys.FocusOnObj(nFocusConBuilding, scaleNewConstructor, distanceWhenZoom)
        ])

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);

        this.uiBuildingLobby.UpdateNumBlockHave(DataBuildingSys.Instance.GetNumBlockPlayerNow());
        this.uiBuildingLobby.StreamFinishConstructor();
    }

    public async ReceivePrizeUnlockFullMap() {
        DataBuildingSys.Instance.IncreaseNextMap(false);
        this.uiBuildingLobby.UpdateNumBlockHave(DataBuildingSys.Instance.GetNumBlockPlayerNow());
        await this.NextMap(this.uiBuildingLobby.StreamReceivePrizeUnlockFullMap.bind(this.uiBuildingLobby), true);
    }

    public async ForceNextMap() {
        DataBuildingSys.Instance.IncreaseNextMap(true);
        this.uiBuildingLobby.UpdateNumBlockHave(DataBuildingSys.Instance.GetNumBlockPlayerNow());
        await this.NextMap(this.uiBuildingLobby.StreamReceivePrizeUnlockFullMap.bind(this.uiBuildingLobby), true, true);
    }

    private async NextMap(cb: CallableFunction, skipStepZoomAndShow: boolean = false, skipReceivePrize: boolean = false) {
        // 0. lắng nghe các sự kiện cần thiết hoặc thiết lập dữ liệu của người chơi cho phù hợp nếu như 
        //    trong trường hợp bị out game khi đang trong quá trình diễn hoạt. 
        //    <Xin hãy lưu ý ở đây chúng ta ko có button new map vậy nên khi build hoàn thành các 
        // 1. HIDE UI Lobby
        // 2. Emit show popUp Done
        // 3. trượt UI vào và nhận thưởng
        // 4. bật UI loading scene để che UI đi nhưng ko load scene
        // 5. load map 
        // 6. tắt UI loading scene đi , 
        // 7. zoom lobby vào vật thể đầu tiên và unlock sau đó trượt UI lobby vào

        //===== 1.
        if (!skipStepZoomAndShow) {
            await Promise.all([
                // await this.showAndHideUIPageHome.HideUI(),
                await this.zoomMapLobbySys.ZoomToBase()
            ]);
        }
        //===== 2.
        // this._isBusyFinishingMap = true;
        // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_FINISH_MAP, 2);
        // await this.WaitFinishDone();
        //===== 3.
        if (!skipStepZoomAndShow) {
            await this.showAndHideUIPageHome.ShowUI();
        }

        if (!skipReceivePrize) {
            DataBuildingSys.Instance.SaveReceivePrizeFullMapDone(false);
            const prizeFinishMap: IPrize[] = this.buildingLobbySys.GetPrizeFinishMap();
            PrizeSys.Instance.AddPrize(prizeFinishMap, "finishMapLobby", true, false);
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.FINISH_MAP_LOBBY, prizeFinishMap, 'finishMapLobby', -1, null, this.buildingLobbySys.GetNameFinishMap());
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        // trong trường hợp level map đã có => thì sẽ thực hiện như trong case này
        const isMaxLevelInGame: boolean = DataBuildingSys.Instance.GetIndexMapNow() < MConfigs.MAX_LEVEL_MAP;

        //===== 4.
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_ON_WITH_OUT_CHANGE_SCENE);
        director.on(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE, this.ContinueFinishingMap, this);
        this._isBusyFinishingMap = true;
        await this.WaitFinishDone();
        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE, this.ContinueFinishingMap, this);
        //===== 5.
        // load data mới
        const levelMapLobby = DataBuildingSys.Instance.GetIndexMapNow();
        const indexConstructNow = DataBuildingSys.Instance.GetProgressConstructorNow();
        await ReadMapLobbyJson.Instance.LoadMap(levelMapLobby, indexConstructNow);
        // tắt UILobby
        await Promise.all([
            this.showAndHideUIPageHome.HideUI(),
            this.buildingLobbySys.GenMap()
        ])
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF_WITH_OUT_CHANGE_SCENE);
        director.on(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_OFF_WITH_OUT_CHANGE_SCENE, this.ContinueFinishingMap, this);
        this._isBusyFinishingMap = true;
        await this.WaitFinishDone();
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);


        director.off(MConst.EVENT.CHANGE_SCENE_ANIM.DONE_TURN_ON_WITH_OUT_CHANGE_SCENE, this.ContinueFinishingMap, this);
        //===== 7.
        const newConstructor = this.buildingLobbySys.GetNConstructorBuidling();
        const newNumBLockRemaining = this.buildingLobbySys.GetRemaingProgressBuilding();

        const infoConstructorNow = DataBuildingSys.Instance.GetInfoConstructorNow();
        const scaleNewConstructor = infoConstructorNow.scaleWhenZoom;
        const distanceWhenZoom = infoConstructorNow.distanceWhenZoom;
        await this.zoomMapLobbySys.FocusOnObj(newConstructor, scaleNewConstructor, distanceWhenZoom);

        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD);

        cb && cb(newConstructor, newNumBLockRemaining);
    }

    public PlayParticleSnow() {
        this.parSnow.forEach(par => par.play());
    }
    //#endregion self button

    //#region FINISH MAP
    private _isBusyFinishingMap: boolean = false;
    private ContinueFinishingMap() {
        this._isBusyFinishingMap = false;
    }
    private async WaitFinishDone() {
        const self = this;
        // wait until player received done
        return new Promise<void>((resolve) => {
            let ttId = setInterval(() => {
                if (self == null || !self._isBusyFinishingMap) {
                    clearInterval(ttId);
                    resolve();
                }
            }, 0.5, macro.REPEAT_FOREVER, 0)
        })
    }
    //#endregion FINISH MAP

    //#region func get wPos
    private getWPosBtnPlay(cb: CallableFunction) {
        cb(this.nBtnPlay.getWorldPosition());
    }

    private getWPosCoin(cb: CallableFunction) {
        cb(this.nUIMoney.getComponent(MoneyUISys).nIc.getWorldPosition());
    }

    public GetWPosCoin_2() {
        return this.nUIMoney.getComponent(MoneyUISys).nIc.getWorldPosition();
    }

    private getWPosTicket(cb: CallableFunction) {
        cb(this.nUITicket.getComponent(TicketUISys).nIc.getWorldPosition());
    }

    private getShowAndHideUIPageHome(cb: CallableFunction) {
        cb(UIPageHomeSys.Instance.showAndHideUIPageHome);
    }
    //#endregion func get wPos

    //#region btn show shop
    private BtnShopCoin() {
        LogEventManager.Instance.logButtonClick(`coin`, "home");

        if (MConfigs.numIAPTicketHave > 0) {
            this.LogicShowShop(PAGE_VIEW_SHOP.COIN);
        } else {
            this.LogicShowShop(PAGE_VIEW_SHOP_2.COIN);
        }
    }

    private BtnShopSkipIts() {
        LogEventManager.Instance.logButtonClick(`skip_ads`, "home");

        if (MConfigs.numIAPTicketHave > 0) {
            this.LogicShowShop(PAGE_VIEW_SHOP.SKIP_ITS);
        }
    }


    private async LogicShowShop(pageViewStart: PAGE_VIEW_SHOP | PAGE_VIEW_SHOP_2) {
        // check người chơi có đang nhận thưởng hay không
        if (UIReceivePrizeLobby.Instance.IsReceivingAnim) {
            return;
        }

        // check người chơi đang ở giao diện building hay không
        if (!this.showAndHideUIPageHome.IsShow) {
            return;
        }

        // check nếu có bất kỳ popUp nào đang được mở thì cũng ko thực hiện dc hành vi này
        if (UILobbySys.Instance.CheckHasAnyUIShow()) {
            return;
        }

        // change pageView
        clientEvent.dispatchEvent(MConst.EVENT_SHOP.CHANGE_PAGE_START_AT_LOBBY, pageViewStart);
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.SHOP);
    }

    //#endregion btn show shop

    //#region WITH FRIENDS
    public OnBtnWithFriend() {
        // GameManager.Instance.PreparePlayNormal(
        //     GameManager.Instance.levelPlayerNow,
        //     timePlayGame,
        //     []
        // );

        // if(MConfigFacebook.Instance.arrConnectedPlayerInfos.length == 0 || MConfigFacebook.Instance.arrTempConnectedPlayerInfos.length == 0){
        //     if(MConfigFacebook.Instance.arrConnectedPlayerInfos.length > 0){
        //         MConfigFacebook.Instance.arrTempConnectedPlayerInfos = lodash.cloneDeep(MConfigFacebook.Instance.arrConnectedPlayerInfos);
        //     }
        //     FBInstantManager.Instance.PlayWithFriend_ChooseAsync((err,success)=>{
        //         if(err){

        //         }else{
        //             DataInfoPlayer.Instance.currWithFriendDataInfo = new WithFriendDataInfo();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL = FBInstantManager.Instance.getPhotoUrl();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderName = FBInstantManager.Instance.getName();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderID = FBInstantManager.Instance.getID();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore = 9999;
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore = 9999;
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.level = lodash.random(5,10);
        //             GameManager.Instance.PreparePlayWithFriend();
        //             this.updateContextWithFriend();
        //         }
        //     });
        // }else{
        //     let indexTemp:number = lodash.random(0,MConfigFacebook.Instance.arrTempConnectedPlayerInfos.length);
        //     let friendInfo:FriendDataInfo = MConfigFacebook.Instance.arrTempConnectedPlayerInfos[indexTemp];
        //     let idFB:string = MConfigFacebook.Instance.arrTempConnectedPlayerInfos[indexTemp].id;

        //     MConfigFacebook.Instance.arrTempConnectedPlayerInfos.splice(indexTemp,1);
        //     FBInstantManager.Instance.PlayWithFriend_ID(idFB,(err,success)=>{
        //         if(err){

        //         }else{
        //             DataInfoPlayer.Instance.currWithFriendDataInfo = new WithFriendDataInfo();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderAvatarURL = FBInstantManager.Instance.getPhotoUrl();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderName = FBInstantManager.Instance.getName();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderID = FBInstantManager.Instance.getID();
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.senderScore = 9999;
        //             DataInfoPlayer.Instance.currWithFriendDataInfo.level = lodash.random(5,10);
        //             if(friendInfo != null){
        //                 DataInfoPlayer.Instance.currWithFriendDataInfo.receiverAvatarURL = friendInfo.photo;
        //                 DataInfoPlayer.Instance.currWithFriendDataInfo.receiverName = friendInfo.name;
        //                 DataInfoPlayer.Instance.currWithFriendDataInfo.receiverID = friendInfo.id;
        //                 DataInfoPlayer.Instance.currWithFriendDataInfo.receiverScore = 9999;
        //             }
        //             GameManager.Instance.PreparePlayWithFriend();

        //             this.updateContextWithFriend();
        //         }
        //     });
        // }

        LogEventManager.Instance.logButtonClick(`with_friend`, "home");
        clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_FRIENDS, 1);
    }

    async updateContextWithFriend() {
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        const ins_share = await CanvasLoadingSys.Instance.GetSharePopUp();
        if (ins_share != null) {
            ins_share.showShareMyScorePopup(DataInfoPlayer.Instance.currWithFriendDataInfo, TYPE_UI_SHARE.WITH_FRIEND, (base64Image: string) => {
                clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
                if (base64Image.length > 0) {
                    // console.log(base64Image);
                    FBInstantManager.Instance.UpdateContext_WithFriend(base64Image, DataInfoPlayer.Instance.currWithFriendDataInfo, (err, succ) => { });
                }
            });
        } else {
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
        }
    }
    //#endregion
}


