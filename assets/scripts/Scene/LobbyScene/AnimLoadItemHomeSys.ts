import { _decorator, Color, Component, instantiate, Material, Node, Prefab, Vec2, Vec3, Sprite, randomRange, director } from 'cc';
import { NameAnimIconHome_Active, NameAnimIconHome_Idle, NameAnimLock } from '../../Utils/TypeAnimChest';
import { Utils } from '../../Utils/Utils';
import { MConst, TYPE_UI } from '../../Const/MConst';
import { AnimPrefabsBase } from '../../AnimsPrefab/AnimPrefabBase';
import { AnimIconHomeSys } from '../../AnimsPrefab/AnimIconHomeSys';
import { MConfigs } from '../../Configs/MConfigs';
import { UILobbySys } from './UILobbySys';
import { EnumNamePack, PAGE_VIEW_LOBBY_NAME, TYPE_EVENT_GAME } from '../../Utils/Types';
import { clientEvent } from '../../framework/clientEvent';
import { DataEventsSys } from '../DataEventsSys';
import { EVENT_TUT_LOBBY } from '../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { DataLoginRewardSys } from '../../DataBase/DataLoginRewardSys';
import { DataPackSys } from '../../DataBase/DataPackSys';
import { DataHalloweenSys } from '../../DataBase/DataHalloweenSys';
import { DataChristmasSys } from '../../DataBase/DataChristmasSys';
const { ccclass, property } = _decorator;

@ccclass('ItemEventHomeCustom')
export class ItemEventHomeCustom {
    // đoạn code property dưới đây không tốt bởi vì root code đã config rất khó sửa nên mới vậy
    // kiến nghị nên chỉ nhét những thế có thể ở trong nVisual => như vậy chỉ cần tắt visual là được
    @property(Node) nParent: Node;
    @property(Node) nParentLock: Node = null;
    private animSys: AnimPrefabsBase = null; public get CheckIsValidAnim() { return this.animSys != null }
    private nameAnimOpen: string = ``; public set NameAnimOpen(_nameAnim: string) { this.nameAnimOpen = _nameAnim; }
    private nameAnimClose: string = ``;
    private _isPlaySkeDone: boolean = false;
    private _nAnimCheck: Node = null;
    private _nAnimLock: Node = null;

    private _typeEvent: TYPE_EVENT_GAME = null; public get typeEvent() { return this._typeEvent } public set typeEvent(_typeEvent: TYPE_EVENT_GAME) { this._typeEvent = this.typeEvent; }

    public async LoadAnimOpen(prefab: Prefab, nameAnim: string, timeDelayAnimChest: number, scale: Vec3 = Vec3.ONE) {
        // return;

        let nAnimChest: Node = instantiate(prefab);
        this._nAnimCheck = nAnimChest;
        if (this.nParent != null && this.nParent.isValid) {
            nAnimChest.parent = this.nParent;
            this.nameAnimOpen = nameAnim;
            nAnimChest.scale = scale;
            this.animSys = nAnimChest.getComponent(AnimPrefabsBase);
            // this.animSys.PlayAnimLoopWithDelay(nameAnim, timeDelayAnimChest, true);
            let timeAnim = this.animSys.GetTimeAnim(nameAnim);
            const insUILob = UILobbySys.Instance.pvLobbySys;
            if (insUILob.GetNumQueueCallChangePage == 0 && insUILob.GetPageShow == PAGE_VIEW_LOBBY_NAME.HOME) {
                this._isPlaySkeDone = true;
                this.animSys.PlayAnim(nameAnim, false, timeAnim);
            }
        }
    }

    public async LoadAnimLock(prefab: Prefab) {
        this._nAnimLock = instantiate(prefab);

        if (this.nParentLock != null && this.nParentLock.isValid) {
            this._nAnimLock.parent = this.nParentLock;
            const animLockCom = this._nAnimLock.getComponent(AnimPrefabsBase);
            animLockCom.PlayAnimLoopWithDelay(NameAnimLock.lock, 0, true);
        }
    }

    public async PlayAnimUnlock() {
        if (this._nAnimLock == null) { return; }

        if (this.nParent != null && this.nParent.isValid) {
            this.setUnGray();
        }

        const animLockCom = this._nAnimLock.getComponent(AnimPrefabsBase);
        await animLockCom.AwaitPlayAnim(NameAnimLock.unlock, false);
        this._nAnimLock.active = false;
    }


    /**
     * func này được tạo ra bởi vì khi người chơi vừa mới vô game,
     * họ click chuyển scene hay bằng cách nào đó effect chỉ dc tạo ra nhưng nếu chạy thì sẽ bị lỗi
     * do đó hàm này sẽ dc gọi mỗi khi onPageHome Enable
     */
    public PlayAnimFirstTimeAgain() {
        if (this._nAnimCheck != null && !this._isPlaySkeDone) {
            switch (true) {
                case this.nameAnimOpen != '':
                    let timeAnimOpen = this.animSys.GetTimeAnim(this.nameAnimOpen);
                    this.animSys.PlayAnim(this.nameAnimOpen, false, timeAnimOpen);
                    break;
                case this.nameAnimClose != '':
                    let timeAnimClose = this.animSys.GetTimeAnim(this.nameAnimClose);
                    this.animSys.PlayAnim(this.nameAnimClose, false, timeAnimClose);
                    this.PlayAnimLockAgain();
                    break;
            }
        }
    }

    public PlayAnimLockAgain() {
        if (this._nAnimLock != null) {
            const animLockCom = this._nAnimLock.getComponent(AnimPrefabsBase);
            animLockCom.PlayAnimLoopWithDelay(NameAnimLock.lock, 0, true);
        }
    }

    public async PlayAnim(nameAnimForce: string = "") {
        if (nameAnimForce != "") this.nameAnimOpen = nameAnimForce;
        this.animSys.PlayAnim(this.nameAnimOpen, false);
        await Utils.delay(this.animSys.GetTimeAnim(this.nameAnimOpen) * 1000);
    }

    public async PlayAnimIdle(typeEvent: TYPE_EVENT_GAME) {
        try {
            let nameAnim = null;
            switch (typeEvent) {
                case TYPE_EVENT_GAME.SPIN: nameAnim = NameAnimIconHome_Idle.spin; break;
                case TYPE_EVENT_GAME.INVITE_FRIEND: nameAnim = NameAnimIconHome_Idle.invite; break;
                case TYPE_EVENT_GAME.LEVEL_PASS: nameAnim = NameAnimIconHome_Idle.levelPass; break;
                case TYPE_EVENT_GAME.LOGIN_REWARD: nameAnim = NameAnimIconHome_Idle.daily; break;
                case TYPE_EVENT_GAME.PVP: nameAnim = NameAnimIconHome_Idle.PVP; break;
                case TYPE_EVENT_GAME.PIGGY_BANK: nameAnim = NameAnimIconHome_Idle.piggyBank; break;
                case TYPE_EVENT_GAME.DASH_RUSH: nameAnim = NameAnimIconHome_Idle.dashRush; break;
                case TYPE_EVENT_GAME.SPEED_RACE: nameAnim = NameAnimIconHome_Idle.speed_race; break;
                case TYPE_EVENT_GAME.ENDLESS_TREASURE: nameAnim = NameAnimIconHome_Idle.endless_treasure; break;
                case TYPE_EVENT_GAME.SEASON_PASS: nameAnim = NameAnimIconHome_Idle.seasonPass; break;
                case TYPE_EVENT_GAME.SEASON_PASS_2: nameAnim = NameAnimIconHome_Idle.seasonPass_2; break;
                case TYPE_EVENT_GAME.LEVEL_PROGRESSION: nameAnim = NameAnimIconHome_Idle.levelProgress; break;
                case TYPE_EVENT_GAME.TREASURE_TRAIL: nameAnim = NameAnimIconHome_Idle.treasureTraill; break;
                case TYPE_EVENT_GAME.SKY_LIFT: nameAnim = NameAnimIconHome_Idle.skyLift; break;
                case TYPE_EVENT_GAME.CHRISTMAS_EVENT: nameAnim = NameAnimIconHome_Idle.chirstmas; break;
            }

            this.nameAnimOpen = nameAnim;
            this.animSys.PlayAnim(nameAnim, false);
            await Utils.delay(this.animSys.GetTimeAnim(nameAnim) * 1000);
        } catch (e) {
            console.log(typeEvent);
            console.error(e);
        }
    }

    public async PlayAnimOpen(typeEvent: TYPE_EVENT_GAME) {
        let nameAnim = null;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.SPIN: nameAnim = NameAnimIconHome_Active.spin; break;
            case TYPE_EVENT_GAME.INVITE_FRIEND: nameAnim = NameAnimIconHome_Active.invite; break;
            case TYPE_EVENT_GAME.LEVEL_PASS: nameAnim = NameAnimIconHome_Active.levelPass; break;
            case TYPE_EVENT_GAME.LOGIN_REWARD: nameAnim = NameAnimIconHome_Active.daily; break;
            case TYPE_EVENT_GAME.PVP: nameAnim = NameAnimIconHome_Active.PVP; break;
            case TYPE_EVENT_GAME.PIGGY_BANK: nameAnim = NameAnimIconHome_Active.piggyBank; break;
            case TYPE_EVENT_GAME.DASH_RUSH: nameAnim = NameAnimIconHome_Active.dashRush; break;
            case TYPE_EVENT_GAME.SPEED_RACE: nameAnim = NameAnimIconHome_Active.speedRace; break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE: nameAnim = NameAnimIconHome_Active.endless_treasure; break;
            case TYPE_EVENT_GAME.SEASON_PASS: nameAnim = NameAnimIconHome_Idle.seasonPass; break;
            case TYPE_EVENT_GAME.SEASON_PASS_2: nameAnim = NameAnimIconHome_Active.seasonPass_2; break;
            case TYPE_EVENT_GAME.LEVEL_PROGRESSION: nameAnim = NameAnimIconHome_Active.levelProgress; break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL: nameAnim = NameAnimIconHome_Active.treasureTraill; break;
            case TYPE_EVENT_GAME.SKY_LIFT: nameAnim = NameAnimIconHome_Active.skyLift; break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT: nameAnim = NameAnimIconHome_Active.chirstmas; break;
        }

        this.nameAnimOpen = nameAnim;
        this.animSys.PlayAnim(nameAnim, false);
        await Utils.delay(this.animSys.GetTimeAnim(nameAnim) * 1000);
    }

    public LoadAnimClose(prefab: Prefab, nameAnim: string, scale: Vec3 = Vec3.ONE) {
        // return;
        let nAnimChest: Node = instantiate(prefab);
        this._nAnimCheck = nAnimChest;
        this.nameAnimClose = nameAnim;
        if (this.nParent != null && this.nParent.isValid) {
            nAnimChest.scale = scale;
            nAnimChest.parent = this.nParent;
            this.animSys = nAnimChest.getComponent(AnimPrefabsBase);
            this.animSys.PlayAnim(nameAnim)
            this.setGray();
        }
    }

    public setGray() {
        if (this.animSys != null && this.animSys.node.getComponent(AnimIconHomeSys) != null) {
            this.animSys.node.getComponent(AnimIconHomeSys).SetGrayIcon();
        }
    }

    public setUnGray() {
        if (this.animSys != null && this.animSys.node.getComponent(AnimIconHomeSys) != null) {
            this.animSys.node.getComponent(AnimIconHomeSys).SetUnGrayIcon();
        }
    }

    public GetTimeAnim(nameAnim: string): number {
        return this.animSys.GetTimeAnim(nameAnim);
    }

    public RegisterAutoUpdateAnimWhenOnEnable() {
        if (this.animSys != null) {
            this.animSys.node.getComponent(AnimIconHomeSys).RegisterTriggerOnEnable(async () => {
                if (this._nAnimCheck != null && !this._isPlaySkeDone) {
                    this.PlayAnimFirstTimeAgain();
                }
            })
        }
    }
}

@ccclass('AnimLoadItemHomeSys')
export class AnimLoadItemHomeSys extends Component {
    @property(Prefab) prefabAnimEvent: Prefab;
    @property(Material) matGrayIcon: Material;
    @property(ItemEventHomeCustom) itemEventPiggyBank: ItemEventHomeCustom; private readonly scalePiggyBank: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventSpin: ItemEventHomeCustom; private readonly scaleSpin: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventInvite: ItemEventHomeCustom; private readonly scaleInviteFriend: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventLoginReward: ItemEventHomeCustom; private readonly scaleLoginReward: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventLevelPass: ItemEventHomeCustom; private readonly scaleLevelPass: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventSpeedRace: ItemEventHomeCustom; private readonly scaleSpeedRace: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventDashRush: ItemEventHomeCustom; private readonly scaleDashRush: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventPVP: ItemEventHomeCustom; private readonly scalePVP: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventEndlessTreasure: ItemEventHomeCustom; private readonly scaleEndlessTreasure: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventSeasonPass: ItemEventHomeCustom; private readonly scaleSeasonPass: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventTreasureTrail: ItemEventHomeCustom; private readonly scaleTreasureTrail: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventSkyLift: ItemEventHomeCustom; private readonly scaleSkyLift: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventLevelProgress: ItemEventHomeCustom; private readonly scaleLevelProgress: Vec3 = new Vec3(0.65, 0.65, 1);
    @property(ItemEventHomeCustom) itemEventPackStarter: ItemEventHomeCustom; private readonly scalePackStarter: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventGreateDeal_1: ItemEventHomeCustom; private readonly scaleGreateDeal_1: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventGreateDeal_2: ItemEventHomeCustom; private readonly scaleGreateDeal_2: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventPackHalloween: ItemEventHomeCustom; private readonly scalePackHalloween: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventPackChristmas: ItemEventHomeCustom; private readonly scalePackChirstmas: Vec3 = new Vec3(1, 1, 1);
    @property(ItemEventHomeCustom) itemEventChristmas: ItemEventHomeCustom; private readonly scaleChristmasEvent: Vec3 = new Vec3(1, 1, 1);

    private stopInit: boolean = false;

    private readonly waitingTimeEachAnim: number = 0.1;
    private readonly waitingTimeNextLoop: number = 5;

    protected onEnable(): void {
        this.stopInit = false;
        clientEvent.on(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, this.GetWPosNodeEvent, this);
        clientEvent.on(EVENT_TUT_LOBBY.ANIM_UNLOCK_EVENT, this.PlayAnimEventUnlock, this);
        clientEvent.on(EVENT_TUT_LOBBY.GET_TIME_ANIM_UNLOCK_EVENT, this.GetTimeAnimEventUnlock, this);
        clientEvent.on(MConst.EVENT_LOGIN_REWARD.NO_SPINE, this.PlayAnimIdleLoginRewardForce, this);
    }

    protected onDisable(): void {
        this.stopInit = true;
        clientEvent.off(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, this.GetWPosNodeEvent, this);
        clientEvent.off(EVENT_TUT_LOBBY.ANIM_UNLOCK_EVENT, this.PlayAnimEventUnlock, this);
        clientEvent.off(EVENT_TUT_LOBBY.GET_TIME_ANIM_UNLOCK_EVENT, this.GetTimeAnimEventUnlock, this);
        clientEvent.off(MConst.EVENT_LOGIN_REWARD.NO_SPINE, this.PlayAnimIdleLoginRewardForce, this);
    }

    public LoadSkeAgain() {
        if (this.itemEventPiggyBank.nParent && this.itemEventPiggyBank.nParent.active) {
            this.itemEventPiggyBank.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventSpin.nParent && this.itemEventSpin.nParent.active) {
            this.itemEventSpin.PlayAnimFirstTimeAgain();
        }
        // if (this.itemEventInvite.nParent && this.itemEventInvite.nParent.active) {
        //     this.itemEventInvite.PlayAnimFirstTimeAgain();
        // }
        if (this.itemEventLoginReward.nParent && this.itemEventLoginReward.nParent.active) {
            this.itemEventLoginReward.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventLevelPass.nParent && this.itemEventLevelPass.nParent.active) {
            this.itemEventLevelPass.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventPVP.nParent && this.itemEventPVP.nParent.active) {
            this.itemEventPVP.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventPackStarter.nParent && this.itemEventPackStarter.nParent.active) {
            this.itemEventPackStarter.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventGreateDeal_1.nParent && this.itemEventGreateDeal_1.nParent.active) {
            this.itemEventGreateDeal_1.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventGreateDeal_2.nParent && this.itemEventGreateDeal_2.nParent.active) {
            this.itemEventGreateDeal_2.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventDashRush.nParent && this.itemEventDashRush.nParent.active) {
            this.itemEventDashRush.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventSpeedRace.nParent && this.itemEventSpeedRace.nParent.active) {
            this.itemEventSpeedRace.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventEndlessTreasure.nParent && this.itemEventEndlessTreasure.nParent.active) {
            this.itemEventEndlessTreasure.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventSeasonPass.nParent && this.itemEventSeasonPass.nParent.active) {
            this.itemEventSeasonPass.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventTreasureTrail.nParent && this.itemEventTreasureTrail.nParent.active) {
            this.itemEventTreasureTrail.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventSkyLift.nParent && this.itemEventSkyLift.nParent.active) {
            this.itemEventSkyLift.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventPackHalloween != null && this.itemEventPackHalloween.nParent && this.itemEventPackHalloween.nParent.active) {
            this.itemEventPackHalloween.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventPackChristmas != null && this.itemEventPackChristmas.nParent && this.itemEventPackChristmas.nParent.active) {
            this.itemEventPackChristmas.PlayAnimFirstTimeAgain();
        }
        if (this.itemEventChristmas != null && this.itemEventChristmas.nParent && this.itemEventChristmas.nParent.active) {
            this.itemEventChristmas.PlayAnimFirstTimeAgain();
        }
    }

    private InitSkeletonItem(item: ItemEventHomeCustom, nameAnimOpen: string, nameAnimClose: string,
        canLoadAnimEvent: boolean, isLockEvent: boolean, isPlayTut: boolean, timeDelay: number, scale: Vec3 = Vec3.ONE) {
        switch (true) {
            case isPlayTut:
                this._listAnim.push(item);
                switch (true) {
                    // check in case loginReward was receive just anim idle
                    case item.typeEvent == TYPE_EVENT_GAME.LOGIN_REWARD && !DataLoginRewardSys.Instance.CanShowWhenLogin(false):
                        item.LoadAnimOpen(this.prefabAnimEvent, nameAnimClose, timeDelay, scale);
                        break;
                    default:
                        item.LoadAnimOpen(this.prefabAnimEvent, nameAnimOpen, timeDelay, scale);
                        break;
                }
                break;
            case !canLoadAnimEvent && !isLockEvent && isPlayTut:
                item.LoadAnimClose(this.prefabAnimEvent, nameAnimClose, scale);
                break;
            case isLockEvent:
            default:
                item.LoadAnimClose(this.prefabAnimEvent, nameAnimClose, scale);
                item.LoadAnimLock(this.prefabAnimEvent);
                break;
        }

        item.RegisterAutoUpdateAnimWhenOnEnable();
    }

    public async InitItem(levelPlayer: number, listTypeEvent: TYPE_EVENT_GAME[]) {
        const self = this;

        function initSkeletonSeasonPass(item: ItemEventHomeCustom, nameAnimOpen: string, nameAnimClose: string,
            canLoadAnimEvent: boolean, timeDelay: number, scale: Vec3 = Vec3.ONE) {
            if (canLoadAnimEvent) {
                item.LoadAnimOpen(self.prefabAnimEvent, nameAnimOpen, timeDelay, scale);
            } else {
                item.LoadAnimOpen(self.prefabAnimEvent, nameAnimClose, timeDelay, scale);
            }
        }

        // trong trường hợp game bị bug ở tut dẫn đến ko lưu lại tut đã mở tuy nhiên lại vượt qua level cần thiết dẫn đến giao diện load bị sai 
        // ta sẽ force chỉnh lại thành true luôn bỏ qua tut
        // nhớ lưu ý trong trường hợp sau này mình có mở thêm event thì mà level người chơi ở cao hơn level tut thì cần fix logic này 
        // thành nếu như người chơi chưa unlock mà ở level vượt lên trên thì sẽ chạy anim unlock

        // trong trường hợp level người chơi thấp hơn so với level config  mà user đã từng unlock event này rồi thì ta sẽ cho họ unlock luôn.
        // => ưu tiên trạng thái đã unlock hay chưa còn nếu update config thì sẽ ko sao

        // ================= piggy bank ===============
        if (listTypeEvent.includes(TYPE_EVENT_GAME.PIGGY_BANK)) {
            let isLockEvent_PiggyBank = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.PIGGY_BANK);
            let isPlayTut_PiggyBank = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.PIGGY_BANK);
            let canLoadAnimEvent_PiggyBank = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.PiggyBank;
            this.itemEventPiggyBank.typeEvent = TYPE_EVENT_GAME.PIGGY_BANK;
            this.InitSkeletonItem(this.itemEventPiggyBank, NameAnimIconHome_Active.piggyBank, NameAnimIconHome_Idle.piggyBank,
                canLoadAnimEvent_PiggyBank, isLockEvent_PiggyBank, isPlayTut_PiggyBank, 3, this.scalePiggyBank
            );
            await Utils.delay(this.waitingTimeEachAnim * 1000);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.PIGGY_BANK);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.SHOW_NAME_EVENT, TYPE_EVENT_GAME.PIGGY_BANK);

            if (this.stopInit) return;
        }

        // ================= spin ===================
        if (listTypeEvent.includes(TYPE_EVENT_GAME.SPIN)) {
            let isLockEvent_Spin = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SPIN);
            let isPlayTut_Spin = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SPIN);
            let canLoadAnimEvent_Spin = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.Spin;
            this.itemEventSpin.typeEvent = TYPE_EVENT_GAME.SPIN;
            this.InitSkeletonItem(this.itemEventSpin, NameAnimIconHome_Active.spin, NameAnimIconHome_Idle.spin,
                canLoadAnimEvent_Spin, isLockEvent_Spin, isPlayTut_Spin, 3, this.scaleSpin);
            await Utils.delay(this.waitingTimeEachAnim * 1000);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SPIN);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.SHOW_NAME_EVENT, TYPE_EVENT_GAME.SPIN);


            if (this.stopInit) return;
        }

        //================== invite ==================
        // let canLoadAnimEvent_invite = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.InviteFriend;
        // let wasUnlockEvent_invite = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.INVITE_FRIEND);
        // initSkeletonItem(this.itemEventInvite, NameAnimIconHome_Active.invite, NameAnimIconHome_Idle.invite,
        //     canLoadAnimEvent_invite, wasUnlockEvent_invite, 3, this.scaleInviteFriend);
        // await Utils.delay(0.3 * 1000);
        // if (this.stopInit) return;

        if (this.stopInit) return;

        //==================login reward =============
        if (listTypeEvent.includes(TYPE_EVENT_GAME.LOGIN_REWARD)) {
            let isLockEvent_LoginReward = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LOGIN_REWARD);
            let isPlayTut_LoginReward = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LOGIN_REWARD);
            let canLoadAnimEvent_LoginReward = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.LoginReward;
            this.itemEventLoginReward.typeEvent = TYPE_EVENT_GAME.LOGIN_REWARD;
            this.InitSkeletonItem(this.itemEventLoginReward, NameAnimIconHome_Active.daily, NameAnimIconHome_Idle.daily,
                canLoadAnimEvent_LoginReward, isLockEvent_LoginReward, isPlayTut_LoginReward, 3, this.scaleLoginReward);
            await Utils.delay(this.waitingTimeEachAnim * 1000);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LOGIN_REWARD);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.SHOW_NAME_EVENT, TYPE_EVENT_GAME.LOGIN_REWARD);

            if (this.stopInit) return;
        }

        //================= pvp ======================
        if (listTypeEvent.includes(TYPE_EVENT_GAME.PVP)) {
            let canLoadAnimEvent_pvp = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.PVP;
            // let wasUnlockEvent_pvp = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.PVP);
            this.itemEventPVP.typeEvent = TYPE_EVENT_GAME.PVP;
            this.InitSkeletonItem(this.itemEventPVP, NameAnimIconHome_Active.PVP, NameAnimIconHome_Idle.PVP,
                canLoadAnimEvent_pvp, true, true, 3, this.scalePVP);
            await Utils.delay(this.waitingTimeEachAnim * 1000);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.PVP);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.SHOW_NAME_EVENT, TYPE_EVENT_GAME.PVP);

            if (this.stopInit) return;
        }

        //================== level pass ==============
        // trong trường hợp event đã end thì sẽ ko có anim load nữa
        if (listTypeEvent.includes(TYPE_EVENT_GAME.LEVEL_PASS)) {
            let isLockEvent_levelPass = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PASS);
            let isPlayTut_LevelPass = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PASS);
            // let canLoadAnimEvent_levelPass = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.LevelPass;
            let canLoadAnimEvent_levelPass = true;
            this.itemEventLevelPass.typeEvent = TYPE_EVENT_GAME.LEVEL_PASS;
            this.InitSkeletonItem(this.itemEventLevelPass, NameAnimIconHome_Active.levelPass, NameAnimIconHome_Idle.levelPass,
                canLoadAnimEvent_levelPass, isLockEvent_levelPass, isPlayTut_LevelPass, 3, this.scaleLevelPass);
            await Utils.delay(this.waitingTimeEachAnim * 1000);
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PASS);
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.SHOW_NAME_EVENT, TYPE_EVENT_GAME.LEVEL_PASS);

            if (this.stopInit) return;
        }

        //================== season pass ==============
        if (listTypeEvent.includes(TYPE_EVENT_GAME.SEASON_PASS)) {
            let isLockEvent_seasonPass = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS);
            let isPlayTut_SeasonPass = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SEASON_PASS);
            // let canLoadAnimEvent_seasonPass = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.SeasonPass;
            let canLoadAnimEvent_seasonPass = true;
            this.itemEventSeasonPass.typeEvent = TYPE_EVENT_GAME.SEASON_PASS_2;
            this.InitSkeletonItem(this.itemEventSeasonPass, NameAnimIconHome_Active.seasonPass_2, NameAnimIconHome_Idle.seasonPass_2,
                canLoadAnimEvent_seasonPass, isLockEvent_seasonPass, isPlayTut_SeasonPass, 3, this.scaleSeasonPass);
            await Utils.delay(this.waitingTimeEachAnim * 1000);

            if (this.stopInit) return;
        }

        //================== dashRush =================
        if (listTypeEvent.includes(TYPE_EVENT_GAME.DASH_RUSH)) {
            let isLockEvent_DashRush = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.DASH_RUSH);
            let isPlayTut_DashRush = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.DASH_RUSH);
            let canLoadAnimEvent_DashRush = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.DashRush;
            this.itemEventDashRush.typeEvent = TYPE_EVENT_GAME.DASH_RUSH;
            this.InitSkeletonItem(this.itemEventDashRush, NameAnimIconHome_Active.dashRush, NameAnimIconHome_Idle.dashRush
                , canLoadAnimEvent_DashRush, isLockEvent_DashRush, isPlayTut_DashRush, 3, this.scaleDashRush
            );
            await Utils.delay(this.waitingTimeEachAnim * 1000);

            if (this.stopInit) return;
        }

        //================== speedRace =================
        if (listTypeEvent.includes(TYPE_EVENT_GAME.SPEED_RACE)) {
            let isLockEvent_SpeedRace = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SPEED_RACE);
            let isPlayTut_SpeedRace = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SPEED_RACE);
            let canLoadAnimEvent_SpeedRace = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.SpeedRace;
            this.itemEventSpeedRace.typeEvent = TYPE_EVENT_GAME.SPEED_RACE;
            this.InitSkeletonItem(this.itemEventSpeedRace, NameAnimIconHome_Active.speedRace, NameAnimIconHome_Idle.speed_race
                , canLoadAnimEvent_SpeedRace, isLockEvent_SpeedRace, isPlayTut_SpeedRace, 3, this.scaleSpeedRace
            );
            await Utils.delay(this.waitingTimeEachAnim * 1000);

            if (this.stopInit) return;
        }

        //================== endlessTreasure =================
        if (listTypeEvent.includes(TYPE_EVENT_GAME.ENDLESS_TREASURE)) {
            let isLockEvent_EndlessTreasure = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.ENDLESS_TREASURE);
            let isPlayTut_EndlessTreasure = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.ENDLESS_TREASURE);
            let canLoadAnimEvent_EndlessTreasure = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.EndlessTreasure;
            this.itemEventEndlessTreasure.typeEvent = TYPE_EVENT_GAME.ENDLESS_TREASURE;
            this.InitSkeletonItem(this.itemEventEndlessTreasure, NameAnimIconHome_Active.endless_treasure, NameAnimIconHome_Idle.endless_treasure
                , canLoadAnimEvent_EndlessTreasure, isLockEvent_EndlessTreasure, isPlayTut_EndlessTreasure, 3, this.scaleEndlessTreasure
            );
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.SHOW_NAME_EVENT, TYPE_EVENT_GAME.ENDLESS_TREASURE);
            await Utils.delay(this.waitingTimeEachAnim * 1000);

            if (this.stopInit) return;
        }

        //================= treasure trail ==================
        if (listTypeEvent.includes(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
            let isLockEvent_TreasureTrail = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
            let isPlayTut_TreasureTrail = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
            let canLoadAnimEvent_TreasureTrail = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.TreasureTrail;
            this.itemEventTreasureTrail.typeEvent = TYPE_EVENT_GAME.TREASURE_TRAIL;
            this.InitSkeletonItem(this.itemEventTreasureTrail, NameAnimIconHome_Active.treasureTraill, NameAnimIconHome_Idle.treasureTraill
                , canLoadAnimEvent_TreasureTrail, isLockEvent_TreasureTrail, isPlayTut_TreasureTrail, 3, this.scaleTreasureTrail
            );
            // clientEvent.dispatchEvent(MConst.EVENT_GAME.SHOW_NAME_EVENT, TYPE_EVENT_GAME.ENDLESS_TREASURE);
            await Utils.delay(this.waitingTimeEachAnim * 1000);

            if (this.stopInit) return;
        }

        //================= sky lift ============================
        if (listTypeEvent.includes(TYPE_EVENT_GAME.SKY_LIFT)) {
            let isLockEvent_SkyLift = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SKY_LIFT);
            let isPlayTut_SkyLift = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SKY_LIFT);
            let canLoadAnimEvent_SkyLift = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.SkyLift;
            this.itemEventSkyLift.typeEvent = TYPE_EVENT_GAME.SKY_LIFT;
            this.InitSkeletonItem(this.itemEventSkyLift, NameAnimIconHome_Active.skyLift, NameAnimIconHome_Idle.skyLift
                , canLoadAnimEvent_SkyLift, isLockEvent_SkyLift, isPlayTut_SkyLift, 3, this.scaleSkyLift
            );
            await Utils.delay(this.waitingTimeEachAnim * 1000);

            if (this.stopInit) return;
        }

        //================= halloween =========================
        if (this.itemEventPackHalloween.nParent != null && DataHalloweenSys.Instance.GetTimeRemain() > 0 && this.itemEventPackHalloween.nParent.active) {
            this.InitSkeletonItem(this.itemEventPackHalloween, NameAnimIconHome_Active.halloween, NameAnimIconHome_Idle.halloween
                , true, false, true, 3, this.scalePackHalloween
            );
        }

        //================= pack christmas ==========================
        if (this.itemEventPackChristmas.nParent != null && DataChristmasSys.Instance.GetTimeRemain() > 0 && this.itemEventPackChristmas.nParent.active) {
            this.InitSkeletonItem(this.itemEventPackChristmas, NameAnimIconHome_Active.pack_christmas, NameAnimIconHome_Idle.pack_christmas
                , true, false, true, 3, this.scalePackChirstmas
            )
        }

        //================= event christmas event ==============
        if (listTypeEvent.includes(TYPE_EVENT_GAME.CHRISTMAS_EVENT)) {
            let isLockEvent_Christmas = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.CHRISTMAS_EVENT);
            let isPlayTut_Christmas = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.CHRISTMAS_EVENT);
            let canLoadAnimEvent_Christmas = levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.ChristmasEvent;
            this.itemEventChristmas.typeEvent = TYPE_EVENT_GAME.CHRISTMAS_EVENT;
            this.InitSkeletonItem(this.itemEventChristmas, NameAnimIconHome_Active.chirstmas, NameAnimIconHome_Idle.chirstmas
                , canLoadAnimEvent_Christmas, isLockEvent_Christmas, isPlayTut_Christmas, 3, this.scaleChristmasEvent
            );
            await Utils.delay(this.waitingTimeEachAnim * 1000);

            if (this.stopInit) return;
        }


        //================== levelProgress ==================
        // let isLockEvent_levelProgress = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
        // let isPlayTut_levelProgress = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
        // let canLoadAnimEvent_levelProgress = isLockEvent_levelProgress && levelPlayer >= MConfigs.LEVEL_TUTORIAL_EVENT.LevelProgression;
        // this.itemEventLevelProgress.typeEvent = TYPE_EVENT_GAME.LEVEL_PROGRESSION;
        // initSkeletonSeasonPass(this.itemEventLevelProgress, NameAnimIconHome_Active.levelProgress, NameAnimIconHome_Idle.levelProgress
        //     , canLoadAnimEvent_levelProgress, 3, this.scaleLevelProgress);


        // init pack in here too
        // call load prefab anim item pack 
        if (DataPackSys.Instance.CheckLogicIsRemaingPack(EnumNamePack.StartedPack)) {
            this.InitAnimPackStarter();
            await Utils.delay(this.waitingTimeEachAnim * 1000);
        }
        if (DataPackSys.Instance.CheckLogicIsRemaingPack(EnumNamePack.GreateDealsPack_1)) {
            this.InitAnimPackGreatDeal_1();
            await Utils.delay(this.waitingTimeEachAnim * 1000);
        }
        if (DataPackSys.Instance.CheckLogicIsRemaingPack(EnumNamePack.GreateDealsPack_2)) {
            this.InitAnimPackGreatDeal_2();
            await Utils.delay(this.waitingTimeEachAnim * 1000);
        }

        // ============================================================
        // ================== after load done =========================
        // ============================================================
        this.PlayLoop();

        // emit turn off change scene
        director.emit(MConst.EVENT.CHANGE_SCENE_ANIM.TURN_OFF);
    }

    private _indexChoice: number = 0;
    private _listAnim: ItemEventHomeCustom[] = [];
    private async PlayLoop() {
        try {
            // check is valid
            if (this.node == null || !this.node.isValid || this._listAnim.length == 0) { return; }
            if (this.stopInit) { await Utils.delay(this.waitingTimeNextLoop * 1000); }
            // get anim to play
            let animChoice = this._listAnim[this._indexChoice];
            if (!animChoice.nParent.active) { await Utils.delay(this.waitingTimeNextLoop * 1000); }

            switch (true) {
                // case anim bị null
                case animChoice == null:
                    this._listAnim.splice(this._indexChoice, 1);
                    this.PlayLoop();
                    break;
                // case anim bị ẩn đi
                case animChoice.nParent != null && animChoice.nParent.parent != null && !animChoice.nParent.parent.active:
                    this._indexChoice += 1;
                    if (this._indexChoice == this._listAnim.length) { this._indexChoice = 0; }
                    this.PlayLoop();
                    break;
                // case có thể chạy anim
                default:
                    //play anim
                    // check in case can play anim
                    switch (true) {
                        case animChoice.typeEvent != null && animChoice.typeEvent == TYPE_EVENT_GAME.LOGIN_REWARD:
                            if (DataLoginRewardSys.Instance.isRewardLoginToDay()) {
                                await animChoice.PlayAnimIdle(TYPE_EVENT_GAME.LOGIN_REWARD);
                            } else {
                                await animChoice.PlayAnim(NameAnimIconHome_Active.daily);
                            }
                            break;
                        default:
                            await animChoice.PlayAnim();
                            break;
                    }

                    // delay if it just has only 1 item and you must wait 5s for next loop
                    if (this._listAnim.length <= 3) {
                        await Utils.delay(this.waitingTimeNextLoop * 1000);
                    }

                    // increase indexChoice
                    this._indexChoice += 1;
                    if (this._indexChoice == this._listAnim.length) { this._indexChoice = 0; }

                    // wait time
                    // await Utils.delay(timeRandom * 1000);
                    this.PlayLoop();
                    break;
            }
        } catch (e) {
            // console.error(e);
        }
    }

    public InitAnimPackStarter() {
        this.itemEventPackStarter.LoadAnimOpen(this.prefabAnimEvent, NameAnimIconHome_Active.starterPack, 3, this.scalePackStarter);
        this._listAnim.push(this.itemEventPackStarter);
    }

    public InitAnimPackGreatDeal_1() {
        this.itemEventGreateDeal_1.LoadAnimOpen(this.prefabAnimEvent, NameAnimIconHome_Active.greatDeals, 3, this.scaleGreateDeal_1);
        this._listAnim.push(this.itemEventGreateDeal_1);
    }

    public InitAnimPackGreatDeal_2() {
        this.itemEventGreateDeal_2.LoadAnimOpen(this.prefabAnimEvent, NameAnimIconHome_Active.greatDeals, 3, this.scaleGreateDeal_2);
        this._listAnim.push(this.itemEventGreateDeal_2);
    }

    //#region listen func
    private GetWPosNodeEvent(typeEvent: TYPE_EVENT_GAME, cb: CallableFunction) {
        switch (typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS: cb(this.itemEventLevelPass.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.LOGIN_REWARD: cb(this.itemEventLoginReward.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.SPIN: cb(this.itemEventSpin.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.PIGGY_BANK: cb(this.itemEventPiggyBank.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.DASH_RUSH: cb(this.itemEventDashRush.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.SPEED_RACE: cb(this.itemEventSpeedRace.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE: cb(this.itemEventEndlessTreasure.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.SEASON_PASS: cb(this.itemEventSeasonPass.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL: cb(this.itemEventTreasureTrail.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.SKY_LIFT: cb(this.itemEventSkyLift.nParent.worldPosition.clone()); break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT: cb(this.itemEventChristmas.nParent.worldPosition.clone()); break;
            default: cb(Vec3.ZERO); break;
        }
    }

    private async PlayAnimEventUnlock(typeEvent: TYPE_EVENT_GAME) {
        try {
            // bật block UI lobby
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            const self = this;

            async function addAnimEventToList(itemEvent: ItemEventHomeCustom, nameAnim: NameAnimIconHome_Active) {
                await itemEvent.PlayAnimUnlock();
                itemEvent.NameAnimOpen = nameAnim;
                !self._listAnim.includes(itemEvent) && self._listAnim.push(itemEvent);
            }

            switch (typeEvent) {
                case TYPE_EVENT_GAME.LEVEL_PASS:
                    await addAnimEventToList(this.itemEventLevelPass, NameAnimIconHome_Active.levelPass);
                    break;
                case TYPE_EVENT_GAME.INVITE_FRIEND:
                    await addAnimEventToList(this.itemEventInvite, NameAnimIconHome_Active.invite);
                    break;
                case TYPE_EVENT_GAME.LOGIN_REWARD:
                    await addAnimEventToList(this.itemEventLoginReward, NameAnimIconHome_Active.daily);
                    break;
                case TYPE_EVENT_GAME.SPIN:
                    await addAnimEventToList(this.itemEventSpin, NameAnimIconHome_Active.spin);
                    break;
                case TYPE_EVENT_GAME.PIGGY_BANK:
                    await addAnimEventToList(this.itemEventPiggyBank, NameAnimIconHome_Active.piggyBank);
                    break;
                case TYPE_EVENT_GAME.DASH_RUSH:
                    await addAnimEventToList(this.itemEventDashRush, NameAnimIconHome_Active.dashRush);
                    break;
                case TYPE_EVENT_GAME.SPEED_RACE:
                    await addAnimEventToList(this.itemEventSpeedRace, NameAnimIconHome_Active.speedRace);
                    break;
                case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                    await addAnimEventToList(this.itemEventEndlessTreasure, NameAnimIconHome_Active.endless_treasure);
                    break;
                case TYPE_EVENT_GAME.SEASON_PASS:
                    await addAnimEventToList(this.itemEventSeasonPass, NameAnimIconHome_Active.seasonPass_2);
                    break;
                case TYPE_EVENT_GAME.TREASURE_TRAIL:
                    await addAnimEventToList(this.itemEventTreasureTrail, NameAnimIconHome_Active.treasureTraill);
                    break;
                case TYPE_EVENT_GAME.SKY_LIFT:
                    await addAnimEventToList(this.itemEventSkyLift, NameAnimIconHome_Active.skyLift);
                    break;
                case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                    await addAnimEventToList(this.itemEventChristmas, NameAnimIconHome_Active.chirstmas);
                    break;

            }

            // show popUp event
            clientEvent.dispatchEvent(EVENT_TUT_LOBBY.TRY_SHOW_POP_UP_UI, typeEvent);

            // tắt block ui lobby
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        } catch (e) {

        }
    }

    private GetTimeAnimEventUnlock(typeEvent: TYPE_EVENT_GAME, cb: CallableFunction) {
        let result = 0;
        switch (typeEvent) {
            case TYPE_EVENT_GAME.LEVEL_PASS: result = this.itemEventLevelPass.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.INVITE_FRIEND: result = this.itemEventInvite.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.LOGIN_REWARD: result = this.itemEventLoginReward.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.SPIN: result = this.itemEventSpin.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.PIGGY_BANK: result = this.itemEventPiggyBank.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.DASH_RUSH: result = this.itemEventDashRush.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.SPEED_RACE: result = this.itemEventSpeedRace.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE: result = this.itemEventEndlessTreasure.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.SEASON_PASS: result = this.itemEventSeasonPass.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL: result = this.itemEventTreasureTrail.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.SKY_LIFT: result = this.itemEventSkyLift.GetTimeAnim(NameAnimLock.unlock); break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT: result = this.itemEventChristmas.GetTimeAnim(NameAnimLock.unlock); break;
        }
        cb(result);
    }

    private PlayAnimIdleLoginRewardForce() {
        this.itemEventLoginReward.PlayAnimIdle(TYPE_EVENT_GAME.LOGIN_REWARD);
    }
    //#endregion listen func
}