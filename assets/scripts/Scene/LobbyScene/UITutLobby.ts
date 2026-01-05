import { _decorator, Component, instantiate, Label, Node, Size, tween, UITransform, Vec2, Vec3 } from 'cc';
import { AniTweenSys } from '../../Utils/AniTweenSys';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { MaskCocos } from '../../framework/MaskCocos';
import { Utils } from '../../Utils/Utils';
import { ShadowGameUI } from '../GameScene/OtherUI/ShadowGameUI';
import { ShowChildWithOpa } from '../../Common/ShowChildWithOpa';
import { SeasonPassUI } from './SeasonPassUI';
import { AnimPrefabsBase } from '../../AnimsPrefab/AnimPrefabBase';
import { NameAnimIconHome_Idle } from '../../Utils/TypeAnimChest';
import { LevelProgressionUI } from './LevelProgressionUI';
const { ccclass, property } = _decorator;

export enum TYPE_TUT_EVENT_LOBBY {
    TUT_SPIN,
    // TUT_INVITE_FRIEND,
    // TUT_SEASON_PASS,
    TUT_LOGIN_REWARD,
    TUT_LEVEL_PASS,
    // TUT_PIGGY_BANK,
    TUT_DASH_RUSH,
    TUT_SPEED_RACE,
    TUT_ENDLESS_TREASURE,
    TUT_LEVEL_PROGRESSION,
    TUT_SKY_LIFT,
    TUT_CHRISTMAS_EVENT
}

/**
     * logic show tut ở đây như sau
     * bật block UI lobby lên,
     * dùng mask để thu gọn vào node cần click,
     * tắt block UI Lobby,
     * ```
     * ```
     * Khi click thành công,
     * tắt mask
     */
@ccclass('TutLobby_Type_2')
class TutLobby_Type_2 {
    @property(Node) nShadowMask: Node;
    private isShowingTut: boolean = false;

    private defaultSize: Size = new Size(3000, 3000);
    // default nShadowMask sẽ là 3000

    public async ShowTutType2(nChoice: Node, timeShadow: number, contentSizeCustom: Size = null) {
        if (this.isShowingTut == true) return;
        this.isShowingTut = true;

        // reset tut
        this.ResetDefaultStatusTut();

        const self = this;
        const transformShadow: UITransform = this.nShadowMask.getComponent(UITransform);

        // ================================= lấy dữ liệu cho anim ================================= 
        const wPosNChoice: Vec3 = nChoice.worldPosition.clone();
        // chỉ cập nhật contentSize nếu như không có custom
        let contentSizeNChoice: Size = contentSizeCustom;
        if (contentSizeCustom == null) {
            contentSizeNChoice = nChoice.getComponent(UITransform).contentSize.clone();
        }
        const diffContentSize: Size = new Size(
            this.defaultSize.width - contentSizeNChoice.width,
            this.defaultSize.height - contentSizeNChoice.height
        );

        // ================================= bật block + anim scale ================================= 
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        this.nShadowMask.worldPosition = wPosNChoice;
        this.nShadowMask.active = true;

        await new Promise<void>(resolve => {
            tween(this.nShadowMask)
                .to(timeShadow, {}, {
                    onUpdate(target, ratio) {
                        transformShadow.contentSize = new Size(self.defaultSize.width - diffContentSize.width * ratio, self.defaultSize.height - diffContentSize.height * ratio);
                    },
                })
                .call(() => {
                    resolve();
                })
                .start();
        })

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    public async TurnOffTutType2() {
        if (!this.isShowingTut) return;
        this.isShowingTut = false;
        this.nShadowMask.active = false;
        this.ResetDefaultStatusTut();
    }

    public ResetDefaultStatusTut() {
        //Add more code to change mask suit with data
        this.nShadowMask.worldPosition = Utils.getMiddleWPosWindow();
        this.nShadowMask.getComponent(UITransform).contentSize = this.defaultSize;
        this.nShadowMask.active = false;
    }
}

@ccclass('UITutLobby')
export class UITutLobby extends Component {
    @property({ group: "PopUp Tut", type: Node }) popUpUI: Node;
    @property({ group: "PopUp Tut", type: Label }) lbContent: Label;
    @property({ group: "PopUp Tut", type: Node }) btn: Node;
    @property({ group: "PopUp Tut", type: Label }) lbBtn: Label;
    @property({ group: "PopUp Tut", type: ShowChildWithOpa }) bgBlock: ShowChildWithOpa;
    @property(TutLobby_Type_2) tutLobbyType2: TutLobby_Type_2 = new TutLobby_Type_2();
    public static Instance: UITutLobby;
    public static EVENT_TUT_SHOW = "UI_TUT_LOBBY_EVENT_TUT_SHOW";
    public static EVENT_TUT_END = "UI_TUT_LOBBY_EVENT_TUT_END";
    public static EVENT_TUT_SHOW_SCALE_IMPRESS = "EVENT_TUT_SHOW_SCALE_IMPRESS";

    protected onLoad(): void {
        if (UITutLobby.Instance == null) {
            UITutLobby.Instance = this;
            this.bgBlock.Hide(false);
            this.popUpUI.active = false;
        }
    }

    protected onEnable(): void {
        clientEvent.on(UITutLobby.EVENT_TUT_SHOW, this.ShowTutHand, this);
        clientEvent.on(UITutLobby.EVENT_TUT_END, this.HideTutHand, this);
        clientEvent.on(MConst.EVENT_BUILDING.PLAY_TUT_BUILDING, this.PlayTutBuilding, this);
        clientEvent.on(MConst.EVENT_BUILDING.TUT_BUILDING_DONE, this.DoneTutBuilding, this);
        clientEvent.on(UITutLobby.EVENT_TUT_SHOW_SCALE_IMPRESS, this.ShowTutScaleImpress, this);
    }

    protected onDisable(): void {
        clientEvent.off(UITutLobby.EVENT_TUT_SHOW, this.ShowTutHand, this);
        clientEvent.off(UITutLobby.EVENT_TUT_END, this.HideTutHand, this);
        clientEvent.off(UITutLobby.EVENT_TUT_SHOW_SCALE_IMPRESS, this.ShowTutScaleImpress, this);
    }

    protected onDestroy(): void {
        UITutLobby.Instance = null;
        clientEvent.off(UITutLobby.EVENT_TUT_SHOW, this.ShowTutHand, this);
        clientEvent.off(UITutLobby.EVENT_TUT_END, this.HideTutHand, this);
    }

    //#region UI pop up tut
    public ShowPopUp(wPosShow: Vec3, contentShow: string, requiredButton: boolean) {
        this.bgBlock.Show();
        //set button
        this.btn.active = requiredButton;
        //set label
        this.lbContent.string = contentShow;
        // scale pop up
        this.popUpUI.worldPosition = wPosShow.clone();
        this.popUpUI.active = true;
        // may be you need tween for it bubble 
        AniTweenSys.scaleBubble(this.popUpUI);
    }

    public ClosePopUp() {
        this.bgBlock.Hide();
        AniTweenSys.baseScale(this.popUpUI, Vec3.ZERO);
        this.popUpUI.active = false;
    }
    // #endregion
    //================================================================

    //================================================================
    //region show tut scale impress
    isShowLevelProgress: boolean = false;
    private ShowTutScaleImpress(typeEvent: TYPE_TUT_EVENT_LOBBY, nodeShow: Node, cbDone: CallableFunction) {
        // check valid
        if (this.isShowLevelProgress) { return; }
        if (typeEvent == TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PROGRESSION) { this.isShowLevelProgress = true; }

        // show UI
        this.bgBlock.Show();

        const self = this;

        const pointHandToWPos = nodeShow.worldPosition.clone()
        this._fakeNode = instantiate(nodeShow);
        this._fakeNode.active = false;
        this._fakeNode.setParent(this.node);
        this._fakeNode.worldPosition = pointHandToWPos.clone();
        this._fakeNode.active = true;

        switch (typeEvent) {
            case TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PROGRESSION:
                // đặt anim cho item event
                this._fakeNode.getComponent(LevelProgressionUI).UpdateSfKey(true);
                const timeScale: number = 1;
                const scaleBase: Vec3 = this._fakeNode.scale.clone();
                const scaleBigger: Vec3 = scaleBase.clone().add3f(0.1, 0.1, 0.1);
                // tween scale node event
                tween(this._fakeNode)
                    .to(timeScale / 2, { scale: scaleBigger }, { easing: "circOut" })
                    .to(timeScale / 2, { scale: scaleBase }, { easing: "circIn" })
                    .call(() => {
                        self.bgBlock.Hide();
                        if (self._fakeNode != null) {
                            self._fakeNode.active = false;
                            self._fakeNode.setParent(null);
                            self._fakeNode.destroy();
                            self._fakeNode = null;
                        }
                        cbDone && cbDone()
                    })
                    .start();
                break;
        }
    }
    //endregion show tut scale impress
    //================================================================

    //#region UI show hand
    private _fakeNode: Node = null;
    private ShowTutHand(typeEvent: TYPE_TUT_EVENT_LOBBY, nodeShow: Node) {
        this.bgBlock.Show();

        const pointHandToWPos = nodeShow.worldPosition.clone()
        this._fakeNode = instantiate(nodeShow);
        this._fakeNode.active = false;
        this._fakeNode.setParent(this.node);
        this._fakeNode.worldPosition = pointHandToWPos.clone();
        this._fakeNode.active = true;

        switch (typeEvent) {
            // case TYPE_TUT_EVENT_LOBBY.TUT_SEASON_PASS:
            //     // đặt anim cho item event
            //     this._fakeNode.getComponent(SeasonPassUI).nAnimKey.children[0].getComponent(AnimPrefabsBase).PlayAnim(NameAnimIconHome_Idle.seasonPass, false);
            //     // console.log(this._fakeNode.getComponent(SeasonPassUI).nAnimKey.children[0]);
            //     break;
            case TYPE_TUT_EVENT_LOBBY.TUT_LEVEL_PROGRESSION:
                // đặt anim cho item event
                this._fakeNode.getComponent(LevelProgressionUI).UpdateSfKey(true);
                break;
        }

        clientEvent.dispatchEvent(MConst.EVENT_HAND.POINT_HAND_TO, pointHandToWPos.clone());
    }

    private HideTutHand(typeTut: TYPE_TUT_EVENT_LOBBY, nShow: Node) {
        this._fakeNode.active = false;
        this.bgBlock.Hide();
        if (this._fakeNode != null) {
            this._fakeNode.active = false;
            this._fakeNode.setParent(null);
            this._fakeNode.destroy();
            this._fakeNode = null;
        }
        clientEvent.dispatchEvent(MConst.EVENT_HAND.HIDE_HAND);
    }

    private ShowOnlyHand(nodeShow: Node) {
        const pointHandToWPos = nodeShow.worldPosition.clone();
        clientEvent.dispatchEvent(MConst.EVENT_HAND.POINT_HAND_TO, pointHandToWPos.clone());
    }

    private HideOnlyHand() {
        clientEvent.dispatchEvent(MConst.EVENT_HAND.HIDE_HAND);
    }
    //#endregion

    //#region tut buidling
    private async PlayTutBuilding(nodeShow: Node, timeShadow: number) {
        if (this == null || this.tutLobbyType2 == null) { return; }
        await this.tutLobbyType2.ShowTutType2(nodeShow, timeShadow);
        this.ShowOnlyHand(nodeShow);
    }

    private async DoneTutBuilding() {
        // turn off shadow
        // turn off hand
        if (this == null || this.tutLobbyType2 == null) { return; }
        this.tutLobbyType2.TurnOffTutType2();
        this.HideOnlyHand();
    }
    //#endregion tut buidling
}




