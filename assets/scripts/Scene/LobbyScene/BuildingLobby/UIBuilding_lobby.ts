import { _decorator, CCFloat, Component, instantiate, Label, Node, Prefab, randomRange, tween, UIOpacity, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { ItemBuilding_lobby } from './ItemBuilding_lobby';
import { MConfigs } from '../../../Configs/MConfigs';
import { MConst } from '../../../Const/MConst';
import { UITopBuilding_lobby } from './UITopBuilding_lobby';
import { DataBuildingSys } from '../../../DataBase/DataBuildingSys';
import { ShowChildWithOpa } from '../../../Common/ShowChildWithOpa';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
import { MoveToByCode_2 } from '../../../Utils/Effects/MoveToByCode_2';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;


enum EUIBuilding {
    HOLD_ON,
    NOTTHING
}

enum EClips {
    CLOSE,
    OPENING_HAVE_BLOCK,
    OPENING_NO_BLOCK
}

@ccclass('UIBuilding_lobby')
export class UIBuilding_lobby extends Component {
    @property(Node) nPosSpawnBuilding: Node;
    @property(Node) nTempSpawnItemBuilding: Node;
    @property(Label) lbBlockRemaining: Label;
    @property(Prefab) pfItemBuilding: Prefab;

    @property(Node) nBtnClose: Node;
    @property(Node) nBtnContinue: Node;
    @property(Node) nBtnClick: Node;
    @property(UITopBuilding_lobby) uiTopBuildingLobby: UITopBuilding_lobby;
    @property([MoveToByCode_2]) listAnimMoveUI: MoveToByCode_2[] = [];
    @property(Node) nUIHide: Node;
    @property(Node) nChest: Node;

    private readonly timeShadow: number = 0.5;
    private _state: EUIBuilding = EUIBuilding.NOTTHING;
    private _numBlockRemaining: number = 0;
    private _numBlockHave: number = 0;
    private _nConBuilding: Node = null;

    private _cooldownNextSpawn: number = 0;

    private _registerring: boolean = false;

    protected onLoad(): void {
        this.AutoUpdateTimeSound();
    }


    protected onEnable(): void {
        if (!clientEvent.isOnEvent(MConst.EVENT_BUILDING.SHOW_UI_BUILDING, this.ShowUI, this)) {
            clientEvent.on(MConst.EVENT_BUILDING.SHOW_UI_BUILDING, this.ShowUI, this);
        }
    }

    protected onDisable(): void {
        this.UnResgisterHoldToBuild();
        clientEvent.off(MConst.EVENT_BUILDING.SHOW_UI_BUILDING, this.ShowUI, this);
    }

    protected update(dt: number): void {
        if (this._state == EUIBuilding.HOLD_ON) {
            // increase progress
            this._cooldownNextSpawn += MConfigs.STEP_SPAWN_NEXT_ITEM_BUILD * dt / MConfigs.TIME_INCREASE_SPEED_UP;
            if (this._cooldownNextSpawn >= MConfigs.MAX_TIME_NEXT_SPAWN_ITEM_BUILD * MConfigs.TIME_INCREASE_SPEED_UP) {
                // spawn item with anim
                this.SpawnItemBuilding();
                // reset the cooldown
                this._cooldownNextSpawn = 0;
            }

            // increase speed time hold
            if (MConfigs.TIME_INCREASE_SPEED_UP > MConfigs.LIMIT_TIME_INCREASE_SPEED_UP) {
                MConfigs.TIME_INCREASE_SPEED_UP -= dt * MConfigs.STEP_INCREASE_SPEED_UP;
            }
        }
    }

    protected start(): void {
        this.listAnimMoveUI.forEach(child => {
            child.TryUpdatePosStart();
            child.SetToPosPrepare_MoveIn();
        });
    }

    //#region UI

    private UpdateUIHeader() {
        // update data UI
        let dataHeader = DataBuildingSys.Instance.GetInfo_TopUI_BuildingNow();
        if (dataHeader != null) {
            this.uiTopBuildingLobby.SetUpData(dataHeader.title, dataHeader.listPrize);
        }
    }

    private async ShowUI(numBlock: number, blockRemaining: number, nConBuilding: Node) {
        this.indexSoundBuilding = 1;
        // ensure it not hide
        this.nUIHide.getComponent(UIOpacity).opacity = 255;

        //reset info
        this._cooldownNextSpawn = 0;
        this._listItemBuilding = [];
        this.lbBlockRemaining.string = numBlock.toString();
        this._numBlockRemaining = blockRemaining;
        this._numBlockHave = numBlock;
        this._nConBuilding = nConBuilding;

        // in case no num block have 
        this._numBlockHave == 0 ? this.ShowUI_incase_noBlock() : this.ShowUI_incase_haveBlock();

        // update header
        this.UpdateUIHeader();

        // await AniTweenSys.ShowNodeWithOpacity(this.bgBlack, this.timeShadow);
        // const clipsOpening = this.node.getComponent(AnimationComponent).clips[EClips.OPENING_HAVE_BLOCK];
        // const timeClips: number = clipsOpening.duration;
        // this.node.getComponent(AnimationComponent).play(clipsOpening.name);
        // await Utils.delay(timeClips * 1000);

        this.nBtnClose.active = true;
    }

    private async HideUI() {
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        this.nBtnClick.active = false;
        this.nBtnClose.active = false;
        this.nBtnContinue.active = false;
        this.listAnimMoveUI.forEach(child => child.MoveOut());

        // logic
        this.UnResgisterHoldToBuild();

        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.CLOSE_UI_BUILDING);
    }

    private ShowUI_incase_noBlock(force: boolean = false) {
        this.nBtnContinue.active = true;
        this.nBtnClose.active = false;
        this.nBtnClick.active = false;
        if (!force) {
            this.listAnimMoveUI.forEach(child => child.MoveIn());
        } else {
            this.listAnimMoveUI.forEach(child => child.SetToPosPrepare_MoveOut())
        }

        this.UnResgisterHoldToBuild();
    }

    private ShowUI_incase_haveBlock() {
        this.nBtnContinue.active = false;
        this.nBtnClose.active = true;
        this.nBtnClick.active = true;
        this.listAnimMoveUI.forEach(child => child.MoveIn());

        // reigster click
        this.RegisterHoldToBuild();
    }

    private HideUI_WhenBuildingFinish() {
        const timeHideUI: number = 0.5;
        tween(this.nUIHide.getComponent(UIOpacity))
            .to(timeHideUI, { opacity: 0 })
            .start();
    }

    private ShowUI_AfterUnlockNewConstructor() {
        // check loại UI nào
        /** 
         * có 2 loại UI ở đây 
         * 1. là khi người chơi còn đồ để build
         * 2. là khi người chơi không còn đồ để build
        */
        if (this._numBlockHave == 0 && this._listItemBuilding.length == 0) {
            //==== 2.
            this.ShowUI_incase_noBlock();
        } else {
            //==== 1.
            this.ShowUI_incase_haveBlock();
        }


        // update opacity game
        const timeHideUI: number = 0.5;
        tween(this.nUIHide.getComponent(UIOpacity))
            .to(timeHideUI, { opacity: 255 })
            .start();
    }
    //#endregion UI

    //#region sound
    @property({ group: "Sound" }) timeCanCallNext: number = 0.02;  // this will auto update sound
    private _canPlaySound: boolean = true;
    private _isUpdateSuccess: boolean = false;
    private _isUpdating: boolean = false;

    private async AutoUpdateTimeSound() {
        return;
        if (this._isUpdating) { return; }
        this._isUpdating = true;
        let timeCheck = await SoundSys.Instance.GetTimeSound(GameSoundEffect.SOUND_BUILD);
        this._isUpdating = false;
        if (timeCheck == null || timeCheck <= 0) { return; }

        this.timeCanCallNext = timeCheck;
        this._isUpdateSuccess = true;
    }

    private CanCallNextSound() {
        return this._canPlaySound;
    }

    indexSoundBuilding: number = 1;
    private async TryPlaySound() {
        // try update sound
        if (!this._isUpdateSuccess) { this.AutoUpdateTimeSound(); }

        // check can play sound
        if (this.CanCallNextSound()) {
            SoundSys.Instance.playSoundEffectOneShot_Path(GameSoundEffect.SOUND_BUILD + this.indexSoundBuilding);
            this.indexSoundBuilding++;
            if (this.indexSoundBuilding > 5) this.indexSoundBuilding = 1;
            this._canPlaySound = false;

            this.scheduleOnce(() => {
                try {
                    this._canPlaySound = true;
                } catch (e) {

                }
            }, this.timeCanCallNext);
        }
    }
    //#endregion sound

    private RegisterHoldToBuild() {
        if (this._registerring) { return; }
        this._registerring = true;
        this.nBtnClick.active = true;
        this.nBtnClick.on(Node.EventType.TOUCH_START, this.BuildingListener, this);
        this.nBtnClick.on(Node.EventType.TOUCH_END, this.EndBuildingListener, this);
        this.nBtnClick.on(Node.EventType.TOUCH_CANCEL, this.EndBuildingListener, this);
    }

    private UnResgisterHoldToBuild() {
        try {
            if (!this._registerring) { return; }  // hàm này đc sử dụng vì bị maxStack call when onEnd và cancel trong
            this._registerring = false;
            this.EndBuildingListener();

            this.nBtnClick.off(Node.EventType.TOUCH_START, this.BuildingListener, this);
            this.nBtnClick.off(Node.EventType.TOUCH_END, this.EndBuildingListener, this);
            this.nBtnClick.off(Node.EventType.TOUCH_CANCEL, this.EndBuildingListener, this);
        } catch (error) {
            console.log("error when destroy", error);
        }
    }

    private BuildingListener() {
        LogEventManager.Instance.logButtonClick(`build`, "UIBuilding_lobby");

        this._state = EUIBuilding.HOLD_ON;
    }

    private EndBuildingListener() {
        this._state = EUIBuilding.NOTTHING;
        MConfigs.TIME_INCREASE_SPEED_UP = 1;
        // check trong trường hợp người chơi xài hết gạch
        if (this._numBlockHave == 0 && this._registerring) {
            this.UnResgisterHoldToBuild();
            this.ShowUI_incase_noBlock(true);
        }
    }

    public UpdateNumBlockHave(numBlockHave: number) {
        this._numBlockHave = numBlockHave;
        this.lbBlockRemaining.string = numBlockHave.toString();
    }

    /**
    * Trường hợp này xảy ra khi người chơi đã mở khóa hoàn toàn phần xây dựng:
    * 1. Tạm thời ẩn giao diện build bằng cách chỉnh opacity.
    * 2. Chạy animation hiển thị `subItem` cho constructor.
    * 3. Bắn event để di chuyển đến vị trí build constructor tiếp theo.
    *      - Nếu đã đầy thì sẽ đưa thẳng về màn home 
    *        và thay button "Build" thành button "Unlock Map".
    * 4. Chạy animation hiển thị UI constructor mới.
    * 5. Hiển thị lại UI Building của lobby.
    */
    public StreamFinishConstructor() {
        const nPrizeCoin: Node = this.uiTopBuildingLobby.GetPrizeCoin();
        const nPrizeTicket: Node = this.uiTopBuildingLobby.GetPrizeTicket();
        const listNOtherPrize: Node[] = this.uiTopBuildingLobby.GetListOtherPrize();
        const wPosNChest: Vec3 = this.nChest.worldPosition.clone();
        const scaleChest: Vec3 = new Vec3(0.5, 0.5, 0.5);

        this.uiTopBuildingLobby.HideGroup();
        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.FINISH_BUILDING_CONSTRUCTOR_NOW, this._nConBuilding, nPrizeTicket, listNOtherPrize, wPosNChest, scaleChest, () => {
            // UIPageHomeSys.ts
            clientEvent.dispatchEvent(MConst.EVENT_BUILDING.SHOW_NEXT_CONSTRUCTOR, this.StreamCbShowNextConstructor.bind(this))
        })
    }

    public StreamCbShowNextConstructor(isUnlockFullMap: boolean, newConstructor?: Node, newNumBLockRemaining?: number) {
        // this is cb after move to next constructor

        // trong trường hợp unlock full constructor
        if (isUnlockFullMap) {
            // chạy anim building map done
            clientEvent.dispatchEvent(MConst.EVENT_BUILDING.ANIM_BUILDING_MAP_DONE, this.StreamReceivePrizeUnlockFullMap.bind(this));
        }

        // trong trường hợp không unlock full constructor
        else {
            this._numBlockRemaining = newNumBLockRemaining;

            this._nConBuilding = newConstructor;

            this.UpdateUIHeader();

            this.ShowUI_AfterUnlockNewConstructor();
        }
    }

    public StreamReceivePrizeUnlockFullMap(newConstructor, newNumBlockRemaining) {
        // update lại header và _nConBuilding
        this.UpdateUIHeader();
        this.uiTopBuildingLobby.ShowGroup();
        this._nConBuilding = newConstructor;
        this._numBlockRemaining = newNumBlockRemaining;

        // hiển thị lại giao diện build
        this.ShowUI_AfterUnlockNewConstructor();
    }

    private _listItemBuilding = [];
    private _previousDistanceMid: Vec3 = null;
    private SpawnItemBuilding() {
        if (this._numBlockHave == 0) { return; }

        //decrease num block
        this._numBlockHave -= 1;
        this._numBlockRemaining -= 1;

        this.lbBlockRemaining.string = this._numBlockHave.toString();

        switch (true) {
            // kiểm tra trong trường hợp người chơi đã hoàn thành công trình
            case this._numBlockRemaining == 0:
                this.UnResgisterHoldToBuild();
                this.HideUI_WhenBuildingFinish();
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
                break;
            // kiểm tra trong trường hợp người chơi xài hết gạch
            case this._numBlockHave == 0:
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
                break;
        }

        // gen item and move to the midder of the screen
        // after move done => emit event to increase the building
        // then reUse it
        let nItemBuilding: Node = this.GenItemBuilding();
        nItemBuilding.parent = this.node;
        nItemBuilding.position = this.nPosSpawnBuilding.position.clone();
        nItemBuilding.active = true;
        this._listItemBuilding.push(nItemBuilding);
        const wPosStart: Vec3 = this.nPosSpawnBuilding.worldPosition.clone();
        const wPosEnd: Vec3 = this._nConBuilding.worldPosition.clone();
        const wPosMid: Vec3 = getRandomMidPos(this._previousDistanceMid);
        this._previousDistanceMid = wPosMid;
        nItemBuilding.getComponent(ItemBuilding_lobby)
            .AnimMoveToBuilding_4(wPosStart, wPosMid, wPosEnd, MConfigs.TIME_ANIM_MOVE_ITEM_BUILDING * MConfigs.TIME_INCREASE_SPEED_UP, () => {
                this.TryPlaySound();

                clientEvent.dispatchEvent(MConst.EVENT_BUILDING.INCREASE_PROGRESS_BUILDING);

                // reUse item building
                this.ReUseItemBuilding(nItemBuilding);

                this._listItemBuilding.pop();
                // bạn có thể check thêm việc nếu như không còn item building nào + chưa build xong => có thể hiển thị nút close để người chơi quay lại màn hình thường và để họ tích lại gạch

                if (this._listItemBuilding.length == 0 && this._numBlockRemaining == 0) {
                    this.StreamFinishConstructor();
                }

                // check nếu người chơi chưa mở khóa xong mà hết gạch để xây thì ta sẽ vào trường hợp này
                else if (this._listItemBuilding.length == 0 && this._numBlockHave == 0) {
                    // cần phải tắt block lobby đi bởi vì ta bật block khi người chơi hết gạch để xây
                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                    // this.ShowUI_incase_noBlock();
                }
            });


    }

    // #region BUILDING
    private GenItemBuilding(): Node {
        if (this.nTempSpawnItemBuilding.children.length > 0) {
            return this.nTempSpawnItemBuilding.children[0];
        } else {
            let nEf = instantiate(this.pfItemBuilding);
            return nEf;
        }
    }
    private ReUseItemBuilding(nEf: Node) {
        nEf.active = false;
        nEf.parent = this.nTempSpawnItemBuilding;
    }
    // #endregion BUILDING 

    //#region button
    private btnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UIBuilding_lobby");

        this.HideUI();
    }
    //#endregion button
}

function getRandomMidPos(oldMidPos: Vec3 = null, maxDistance: number = 150) {
    // nếu oldMidPos là null thì random phải hay trái trước đều dc
    if (oldMidPos == null) {
        oldMidPos = new Vec3();
        oldMidPos.x = randomRange(-maxDistance, maxDistance);
    }

    let result = new Vec3();

    // trái
    if (oldMidPos.x < 0) {
        // thì kết quả mới sẽ random về phía bên phải
        result.x = randomRange(- maxDistance / 2, maxDistance);
    }
    // phải 
    else {
        // thì kết quả mới sẽ random về phía bên trái
        result.x = randomRange(-maxDistance, maxDistance / 2);
    }

    return result;
}

