import { _decorator, Button, Color, Component, EventHandle, instantiate, Label, Node, NodeEventType, Sprite, Vec3 } from 'cc';
import { ItemBoosterUIPrepareNG } from './ItemBoosterUIPrepareNG';
import { PlayerData } from '../../../Utils/PlayerData';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { clientEvent } from '../../../framework/clientEvent';
import { UITutLobby } from '../../LobbyScene/UITutLobby';
import { DataItemSys } from '../../DataItemSys';
import { Utils } from '../../../Utils/Utils';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { PAGE_VIEW_LOBBY_NAME, STATE_BOOSTER_LOCK, TYPE_ITEM } from '../../../Utils/Types';
import { DataCustomUIShop } from '../UIShop/TypeShop';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('BoosterLock')
export class BoosterLock extends Component {
    private _stateBooster: STATE_BOOSTER_LOCK = STATE_BOOSTER_LOCK.LOCK;
    private _fakeNUITut: Node[] = [];
    private _typeItem: TYPE_ITEM = null;
    private readonly ColorLock = new Color(180, 180, 180, 180);
    private readonly ColorUnLock = new Color(255, 255, 255, 255);

    @property(ItemBoosterUIPrepareNG) itemBoosterUIPrepareNG: ItemBoosterUIPrepareNG;
    @property({ group: "UI_FAKE_TUT", type: Node }) UI_FAKE_TUT_Bg: Node;
    @property({ group: "UI_FAKE_TUT", type: Node }) UI_FAKE_TUT_Icon: Node;

    @property({ group: "UI_Normal", type: Node }) UI_Normal_nLb: Node;
    @property({ group: "UI_Normal", type: Node }) UI_Normal_bgChoice: Node
    @property({ group: "UI_Normal", type: Node }) UI_Normal_icon: Node;
    @property({ group: "UI_Normal", type: Node }) UI_Normal_add_icon: Node;

    @property({ group: "UI_Infi", type: Node }) UI_Infi_nOnItem: Node;
    @property({ group: "UI_Infi", type: Node }) UI_Infi_nInfi: Node;
    @property({ group: "UI_Infi", type: Node }) UI_Infi_nLbTime: Node;

    @property({ group: "UI_Num_Item", type: Node }) UI_Num_Item_bg: Node;
    @property({ group: "UI_Num_Item", type: Node }) UI_Num_Item_nLb: Node;

    @property({ group: "UI_Tut", type: Node }) UI_Tut_nLbFree: Node;

    @property({ group: "UI_Lock", type: Node }) UI_Lock_nLock: Node;
    @property({ group: "UI_Lock", type: Node }) UI_Lock_nLbLock: Node;


    private listContentBooster: string[] = [
        "Let start the game with booster rocket to destroy 3 tiles",
        "Let start the game with booster time to get extra 30 seconds",
    ]

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_ITEM.END_TIME_INFI, this.EndTimeInfinity, this);
        clientEvent.on(MConst.EVENT_ITEM.UPDATE_TIME_INFI, this.UpdateTimeInfinity, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_ITEM.END_TIME_INFI, this.EndTimeInfinity, this);
        clientEvent.off(MConst.EVENT_ITEM.UPDATE_TIME_INFI, this.UpdateTimeInfinity, this);
        this.node.off(Node.EventType.TOUCH_START, this.ShowShop, this);
    }

    //#region listenFunc
    public CheckLevelToSetState(typeItem: any) {
        const self = this;
        this._typeItem = this.itemBoosterUIPrepareNG.GetTypeItem();
        if (typeItem != this._typeItem) { return; }

        function CheckStateItem(levelTut: number) {
            if (PlayerData.Instance._levelPlayer == levelTut) {
                if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.LOBBY) {
                    self.ChangeState(STATE_BOOSTER_LOCK.TUTORIAL);
                } else if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.GAME) {
                    self.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_TUTORIAL);
                }
            } else if (PlayerData.Instance._levelPlayer > levelTut) {
                if (DataItemSys.Instance.IsInfinityTime(self._typeItem)) {
                    self.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_INFINITY);
                } else if (DataItemSys.Instance.GetNumItem(self._typeItem) <= 0) {
                    self.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_NO_MORE_ITEM);
                } else {
                    self.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_NO_CHOICE);
                }
            } else {
                self.ChangeState(STATE_BOOSTER_LOCK.LOCK);
            }
        }

        switch (this._typeItem) {
            case TYPE_ITEM.TIME:
                CheckStateItem(MConfigs.LEVEL_TUTORIAL_ITEM.BOOSTER_TIME);
                break;
        }
    }

    private EndTimeInfinity(typeItem: TYPE_ITEM) {
        if (typeItem == this.itemBoosterUIPrepareNG.GetTypeItem() && this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_INFINITY) {
            this.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_NO_CHOICE);
        }
    }

    private UpdateTimeInfinity(typeItem: TYPE_ITEM, timeRemaining: number) {
        if (typeItem == this.itemBoosterUIPrepareNG.GetTypeItem()
            && (this._stateBooster != STATE_BOOSTER_LOCK.UNLOCK_INFINITY && (this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_NO_CHOICE || this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_CHOICE))) {
            this.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_INFINITY);
        }
    }
    //#endregion listenFunc

    private ChangeState(state: STATE_BOOSTER_LOCK) {
        this._stateBooster = state;
        this.node.off(Node.EventType.TOUCH_START, this.ShowShop, this);
        switch (this._stateBooster) {
            case STATE_BOOSTER_LOCK.LOCK:
                this.HideUIInfinity();
                this.HideNumItem();
                this.HideIcon();
                this.ActiveUILock();
                this.node.getComponent(Button).enabled = true;
                break;
            case STATE_BOOSTER_LOCK.TUTORIAL:

                this.HideUILock();
                this.HideUIInfinity();
                this.HideNumItem();
                this.ShowIcon();
                this.ActiveUITut();

                let wPosPointHand = this.node.worldPosition.clone();
                clientEvent.dispatchEvent(MConst.EVENT_HAND.POINT_HAND_TO, wPosPointHand.clone());
                let wPosShowPopUp = this.node.worldPosition.clone();
                const windowSize = Utils.getSizeWindow();
                wPosShowPopUp.x = windowSize.x / 2;
                wPosShowPopUp.y -= 200;
                const contentLabel = this.listContentBooster[this._typeItem == TYPE_ITEM.TIME ? 0 : 1];
                UITutLobby.Instance.ShowPopUp(wPosShowPopUp.clone(), contentLabel, false);
                this.GenFakeTut();
                this.node.getComponent(Button).enabled = false;
                break;
            case STATE_BOOSTER_LOCK.UNLOCK_TUTORIAL:
                this.HideUILock();
                this.HideNumItem();
                this.ShowIcon();
                this.ActiveUIUnLockTut();
                this.node.getComponent(Button).enabled = false;
                break;
            case STATE_BOOSTER_LOCK.UNLOCK_NO_CHOICE:
                this.HideUIInfinity();
                this.HideUILock();
                this.HideUiUnlockChoice();
                this.ShowNumItem();
                this.ShowIcon();
                this.node.getComponent(Button).enabled = true;
                break;
            case STATE_BOOSTER_LOCK.UNLOCK_CHOICE:
                this.HideUIInfinity();
                this.HideUILock();
                this.ShowNumItem();
                this.ShowIcon();
                this.ActiveUIUnlockChoice();
                this.node.getComponent(Button).enabled = true;
                break;
            case STATE_BOOSTER_LOCK.UNLOCK_INFINITY:
                this.HideUILock();
                this.HideNumItem();
                this.ShowIcon();
                this.ActiveUIInfinity();
                this.node.getComponent(Button).enabled = false;
                break;
            case STATE_BOOSTER_LOCK.UNLOCK_NO_MORE_ITEM:
                this.HideUILock();
                this.HideNumItem();
                this.ShowIcon();
                this.ActiveUIUnlockNoMoreItem();
                this.node.getComponent(Button).enabled = false;
                this.node.on(Node.EventType.TOUCH_START, this.ShowShop, this);
                break;
        }
    }

    private GenFakeTut() {
        let fBg = instantiate(this.UI_FAKE_TUT_Bg);
        let fIcon = instantiate(this.UI_FAKE_TUT_Icon);
        this._fakeNUITut.push(fBg, fIcon);
        fBg.setParent(UITutLobby.Instance.node); fBg.active = true;
        fIcon.setParent(UITutLobby.Instance.node); fIcon.active = true;
        const wPosBg = this.UI_FAKE_TUT_Bg.worldPosition.clone();
        const wPosIcon = this.UI_FAKE_TUT_Icon.worldPosition.clone();
        fBg.worldPosition = wPosBg;
        fIcon.worldPosition = wPosIcon;
        fBg.on(Node.EventType.TOUCH_START, this.onBtnClickTutorial, this);
        // fIcon.on(Node.EventType.TOUCH_START, this.onBtnClickTutorial, this);
    }

    //#region func button

    public onBtnClickTutorial() {
        this.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_TUTORIAL);
        UITutLobby.Instance.ClosePopUp();

        this._fakeNUITut.forEach(element => element.destroy());
        clientEvent.dispatchEvent(MConst.EVENT_HAND.HIDE_HAND);
        event.stopPropagation();
    }

    /**
     * logic: this func only bind to btn when player in case UIUnlockNoChoice | UIUnlockChoice
     */
    public onBtnClickNormal() {
        if (this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_NO_CHOICE) {
            this.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_CHOICE);
        } else if (this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_CHOICE) {
            this.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_NO_CHOICE);
        }
    }
    //#endregion

    //#region self func
    private ActiveUILock() {
        this.UI_Lock_nLbLock.active = true;
        this.UI_Lock_nLock.active = true;
        let levelTut: number = -1;
        switch (this._typeItem) {
            case TYPE_ITEM.TIME: levelTut = MConfigs.LEVEL_TUTORIAL_ITEM.BOOSTER_TIME; break;
        }
        this.UI_Normal_icon.active = true;
        this.UI_Normal_icon.getComponent(Sprite).color = this.ColorLock;
        this.UI_Lock_nLbLock.getComponent(Label).string = `Lv.${levelTut}`;
        this.HideIconAddMoreItem();
    }

    private HideUILock() {
        this.UI_Lock_nLock.active = false;
        this.UI_Lock_nLbLock.active = false;
    }

    private ActiveUITut() {
        this.UI_Tut_nLbFree.active = true;
        this.UI_Tut_nLbFree.getComponent(Label).string = `FREE`;
        this.HideIconAddMoreItem();
    }

    private ActiveUIUnLockTut() {
        this.UI_Normal_bgChoice.active = true;
        this.UI_Infi_nOnItem.active = true;
        this.UI_Lock_nLbLock.active = true;
        this.UI_Lock_nLbLock.getComponent(Label).string = 'FREE';
        this.HideNumItem();
        this.HideIconAddMoreItem();
    }

    private ActiveUIInfinity() {
        this.UI_Normal_bgChoice.active = true;
        this.UI_Infi_nInfi.active = true;
        this.UI_Infi_nOnItem.active = true;
        this.UI_Infi_nLbTime.active = true;
        this.HideNumItem();
        this.HideIconAddMoreItem();
    }

    private ActiveUIUnlockChoice() {
        this.UI_Normal_bgChoice.active = true;
        this.HideIconAddMoreItem();
    }

    private ActiveUIUnlockNoMoreItem() {
        this.ShowIconAddMoreItem();
        this.HideNumItem();
    }

    private HideUiUnlockChoice() {
        this.UI_Normal_bgChoice.active = false;
    }

    private HideUIInfinity() {
        this.UI_Normal_bgChoice.active = false;
        this.UI_Infi_nInfi.active = false;
        this.UI_Infi_nOnItem.active = false;
        this.UI_Infi_nLbTime.active = false;
    }

    private HideNumItem() {
        this.UI_Num_Item_bg.active = false;
        this.UI_Num_Item_nLb.active = false;
    }

    private ShowNumItem() {
        this.UI_Num_Item_bg.active = true;
        this.UI_Num_Item_nLb.active = true;
    }

    private ShowIcon() {
        this.UI_Normal_icon.active = true;
        this.UI_Normal_icon.getComponent(Sprite).color = this.ColorUnLock;
    }

    private HideIcon() {
        this.UI_Normal_icon.active = false;
    }

    private ShowIconAddMoreItem() {
        this.UI_Normal_add_icon.active = true;
    }

    private HideIconAddMoreItem() {
        this.UI_Normal_add_icon.active = false;
    }
    //#endregion self func

    //#region func ShowShop
    private ShowShop() {
        // check in case player in the game sys
        const typeSceneChange: TYPE_SCENE_USING = ChangeSceneSys.Instance.GetTypeSceneUsing();
        switch (typeSceneChange) {
            case TYPE_SCENE_USING.GAME:
                // case end game
                let dataCustomShop: DataCustomUIShop = {
                    isActiveClose: true,
                    openUIAfterClose: null,
                    pageViewShop_ScrollTo: 0,
                    canAutoResumeGame: false
                }
                clientEvent.dispatchEvent(MConst.EVENT.SET_INDEX, TYPE_UI.UI_SHOP_SHORT, 20);
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SHOP_SHORT, 1, true, dataCustomShop);
                break;
            case TYPE_SCENE_USING.LOBBY:
                // case prepare normal + prepare dailyChallenge
                clientEvent.dispatchEvent(MConst.EVENT.CLOSE_ALL_UI_SHOWING);
                clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, PAGE_VIEW_LOBBY_NAME.SHOP);
                break;
        }
    }
    //#endregion func ShowShop

    //#region common
    public ResetUnChoice(): void {
        // check in case item not lock
        if (this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_CHOICE) {
            this.ChangeState(STATE_BOOSTER_LOCK.UNLOCK_NO_CHOICE);
        }
    }

    public IsChoice() {
        if (this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_INFINITY || this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_CHOICE || this._stateBooster == STATE_BOOSTER_LOCK.UNLOCK_TUTORIAL) {
            return true;
        }
        return false;
    }

    public GetStateItem(): STATE_BOOSTER_LOCK {
        return this._stateBooster;
    }

    public GetTypeItemSupport(): TYPE_ITEM {
        return this.itemBoosterUIPrepareNG.GetTypeItemSupport();
    }
    //#endregion common
}


