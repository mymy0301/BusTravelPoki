import { _decorator, Color, Component, Label, Node, Sprite, randomRangeInt, tween, UIOpacity, Tween, SpriteFrame } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { GameManager } from '../../GameManager';
import { TYPE_ITEM } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('UIPreparePlayNormalGame')
export class UIPreparePlayNormalGame extends UIBaseSys {
    // @property(LogicTutEventWinStreak) logicTutEventWinStreak: LogicTutEventWinStreak;
    // @property(ListTileRace) listTitleRace: ListTileRace;
    // @property(Node) nUITileRace: Node;
    // @property(Node) nUIJoinTileRace: Node;
    @property(Label) lbLevel: Label;
    @property(Node) nBtnInfo: Node;
    @property(Node) nBgBlack: Node;
    // @property(DoubleKeyVisualSys) nDoubleKeyVisual: DoubleKeyVisualSys;

    // @property({ group: "STREAK", type: Node }) nProgressStreak: Node;
    // @property({ group: "STREAK", type: Node }) nLightStreak: Node;
    // @property({ group: "STREAK", type: Label }) lbProgressStreak: Label;
    // @property({ group: "STREAK", type: Label }) lbLockStreak: Label;
    // @property({ group: "STREAK", type: Label }) lbWinStreak: Label;
    // @property({ group: "STREAK", type: Node }) nUIWinStreakUnlock: Node;
    // @property({ group: "STREAK", type: Node }) nUIWinStreakLock: Node;
    // @property({ group: "STREAK", type: AnimChestSys }) animChestSys: AnimChestSys;

    // @property({ tooltip: "Booster", type: Node }) boosterRocket: Node;
    // @property({ tooltip: "Booster", type: Node }) boosterTime: Node;


    protected onLoad(): void {
        clientEvent.on(MConst.EVENT.CLOSE_UI, this.TryHideBg, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT.CLOSE_UI, this.TryHideBg, this);
    }

    public async PrepareDataShow(): Promise<void> {
        const levelPlayerNow = GameManager.Instance.levelPlayerNow;
        this.lbLevel.string = "Level " + levelPlayerNow.toString();
        this.nBgBlack.active = false;


        // this.PrepareDataTileRace();
        // this.PrepareDataStrike();


        // // just update event when not tutorial
        // if (levelPlayerNow != MConst.LEVEL_TUTORIAL_ITEM.BOOSTER_ROCKET) {
        //     this.boosterRocket.getComponent(BoosterLock).CheckLevelToSetState(TYPE_ITEM.ROCKET);
        // }
        // if (levelPlayerNow != MConst.LEVEL_TUTORIAL_ITEM.BOOSTER_TIME) {
        //     this.boosterTime.getComponent(BoosterLock).CheckLevelToSetState(TYPE_ITEM.TIME);
        // }

        // // Setup double key visual
        // this.nDoubleKeyVisual.SetUp();
    }

    public async UIShowDone(): Promise<void> {
        // this.logicTutEventWinStreak.CheckLogic();

        // // just update event when tutorial
        // if (PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.BOOSTER_ROCKET) {
        //     this.boosterRocket.getComponent(BoosterLock).CheckLevelToSetState(TYPE_ITEM.ROCKET);
        // }
        // if (PlayerData.Instance._levelPlayer == MConst.LEVEL_TUTORIAL_ITEM.BOOSTER_TIME) {
        //     this.boosterTime.getComponent(BoosterLock).CheckLevelToSetState(TYPE_ITEM.TIME);
        // }

        // // hide the btn info if player not reach logic to unlock Tut Event Win streak
        // if (GameManager.Instance.GetLevelPlayerNow() < MConst.LEVEL_TUTORIAL_EVENT.WinStreak) {
        //     this.nBtnInfo.active = false;
        // }

        // // check anim streak
        // this.CheckPlayAnimStreak();

    }

    public async UICloseDone(): Promise<void> {
        // this.boosterRocket.getComponent(BoosterLock).ResetUnChoice();
        // this.boosterTime.getComponent(BoosterLock).ResetUnChoice();
    }

    private PrepareDataTileRace() {
        // // you must check the player was join tileRace
        // // if not show another UI
        // // if yet show data tileRace
        // if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TILE_RACE) || !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TILE_RACE)) {
        //     this.nUIJoinTileRace.active = false;
        //     this.nUITileRace.active = false;
        //     return;
        // }

        // const canShowNotification = DataTileRaceSys.Instance.CanShowNotificationJoin();
        // if (!canShowNotification) {
        //     this.nUIJoinTileRace.active = false;
        //     this.nUITileRace.active = true;
        //     // create data temp
        //     const tempData = DataTileRaceSys.Instance.GetListDataTileRace();
        //     this.listTitleRace.SetUp(tempData);
        // } else {
        //     this.nUITileRace.active = false;
        //     this.nUIJoinTileRace.active = true;
        // }
    }

    private PrepareDataStrike() {

        // // check from player data player
        // let streak = 0;

        // // check cheating data
        // if (CheatingSys.Instance.isCheatStreakEvent) {
        //     streak = CheatingSys.Instance.progressStreakEvent;
        // } else {
        //     streak = DataStreakSys.Instance.getStreak();
        // }

        // const maxStreak = DataStreakSys.Instance.getMaxStreak();
        // const rateStreak = streak / maxStreak;
        // this.nProgressStreak.getComponent(Sprite).fillRange = rateStreak;
        // this.lbProgressStreak.string = `${streak}/${maxStreak}`;
        // this.lbLockStreak.string = `Unlock at lv.${MConst.LEVEL_TUTORIAL_EVENT.WinStreak}`;

        // // set anim chest
        // let nameAnim = NameAnimChest_Streak_idle_close[`Streak_${1}`];
        // if (streak > 0) {
        //     nameAnim = NameAnimChest_Streak_idle_close[`Streak_${streak}`];
        // }
        // this.animChestSys.PlayAnim(nameAnim);

        // if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.WIN_STREAK)) {
        //     // this.nUIWinStreakUnlock.active = false;
        //     this.nUIWinStreakLock.active = true;
        //     // hide the label in uiWinStreak unlock
        //     this.lbWinStreak.node.active = false;
        //     this.lbProgressStreak.node.active = false;
        //     this.nLightStreak.active = false;
        //     // this.nBtnInfo.active = false;
        // } else {
        //     this.nUIWinStreakUnlock.active = true;
        //     this.nUIWinStreakLock.active = false;
        //     // show the label in uiWinStreak unlock
        //     this.lbWinStreak.node.active = true;
        //     this.lbProgressStreak.node.active = true;
        //     this.nBtnInfo.active = true;
        // }
    }

    private GetListBoosterChoicing(): TYPE_ITEM[] {
        // let listItemSupport: TYPE_ITEM_SUPPORT[] = [];
        // if (this.boosterRocket.getComponent(BoosterLock).IsChoice()) {
        //     listItemSupport.push(TYPE_ITEM_SUPPORT.ROCKET);
        // }
        // if (this.boosterTime.getComponent(BoosterLock).IsChoice()) {
        //     listItemSupport.push(TYPE_ITEM_SUPPORT.ADD_TIME);
        // }

        // return listItemSupport;

        return null;
    }

    private timeToNextPlay: number = 0;
    private async CheckPlayAnimStreak() {
        // let streak = 0;

        // // check cheating data
        // if (CheatingSys.Instance.isCheatStreakEvent) {
        //     streak = CheatingSys.Instance.progressStreakEvent;
        // } else {
        //     streak = DataStreakSys.Instance.getStreak();
        // }

        // // just play anim open chest if streak more than 0
        // if (streak > 0) {
        //     this.nLightStreak.active = true;
        //     let nameAnimOpen = NameAnimChest_Streak_open[`Streak_${streak}`];
        //     let nameAnimIdleOpenDone = NameAnimChest_Streak_idle_after_open[`Streak_${streak}`];
        //     this.timeToNextPlay = Utils.getCurrTime() + this.animChestSys.GetTimeAnim(nameAnimOpen);
        //     await this.animChestSys.AwaitPlayAnim(nameAnimOpen, false);
        //     if (this.animChestSys != null && this.timeToNextPlay <= Utils.getCurrTime()) {
        //         this.animChestSys.PlayAnim(nameAnimIdleOpenDone);
        //     }
        // }
    }

    //#region func btn
    public async onBtnPlay() {
        // // ============= check the item support
        // let listItemSupport: TYPE_ITEM_SUPPORT[] = this.GetListBoosterChoicing();

        // // =============check type Item support using then try use it
        // listItemSupport.forEach((item: TYPE_ITEM_SUPPORT) => {
        //     let itemUsed: TYPE_ITEM = null;
        //     let isFreeBoosterTut: boolean = false;
        //     switch (item) {
        //         case TYPE_ITEM_SUPPORT.ROCKET:
        //             isFreeBoosterTut = this.boosterRocket.getComponent(BoosterLock).GetStateItem() == STATE_BOOSTER_LOCK.UNLOCK_TUTORIAL;
        //             itemUsed = TYPE_ITEM.ROCKET; break;
        //         case TYPE_ITEM_SUPPORT.ADD_TIME:
        //             isFreeBoosterTut = this.boosterTime.getComponent(BoosterLock).GetStateItem() == STATE_BOOSTER_LOCK.UNLOCK_TUTORIAL;
        //             itemUsed = TYPE_ITEM.TIME;
        //             break;
        //     }
        //     if (itemUsed != null) {
        //         if (!DataItemSys.Instance.IsInfinityTime(itemUsed) && !isFreeBoosterTut) {
        //             LogEventManager.Instance.UseBooster(MConfigs.getNameTypeSuitWithTypeItem(itemUsed));
        //         } else {
        //             LogEventManager.Instance.UseBoosterInfinity(MConfigs.getNameTypeSuitWithTypeItem(itemUsed));
        //         }

        //         if (!isFreeBoosterTut) {
        //             DataItemSys.Instance.TryUseItem(itemUsed, null, false, -1, false);
        //         }
        //     }
        // })

        // // ============= check the streak
        // if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.WIN_STREAK)) {
        //     const listBoosterStreak = DataStreakSys.Instance.getListItemSupport();
        //     listItemSupport.push(...listBoosterStreak);
        // }

        // // ============== random the number yellow block 
        // // you can just random number yellow blocks in here if tile challenge is unlock
        // let numYellowBlocks = -1;
        // if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TILE_CHALLENGE) && !DataTileChallengeSys.Instance.IsReachLastLevel()
        //     && !CaculTimeEvents.Instance.CheckEventWasEnd(TYPE_EVENT_GAME.TILE_CHALLENGE)) {
        //     numYellowBlocks = randomRangeInt(MConst.MIN_KEY_TILE_CHALLENGE_EACH_GAME, MConst.MAX_KEY_TILE_CHALLENGE_EACH_GAME);
        //     if (DataTileChallengeSys.Instance.IsDoublingKey()) {
        //         numYellowBlocks *= 2;
        //     }
        // }

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

    public onBtnJoinTileRace() {
        // clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI_WITHOUT_TURN_OFF_SHADOW, TYPE_UI.UI_PREPARE_PLAY_NORMAL_GAME, 1);
        // clientEvent.dispatchEvent(MConst.EVENT.SHOW_SHADOW_LOBBY);
        // let jsonUITileRace: TYPE_UI_TILE_RACE_SHOW = {
        //     FORCE_DONE: false,
        //     FORCE_JOIN: true
        // }
        // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TILE_RACE, 1, true, jsonUITileRace);
    }

    public onBtnClose() {
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_PREPARE_PLAY_NORMAL_GAME, 1);
    }

    public onBtnShowInfo() {
        // // check the item support
        // let listItemSupport: TYPE_ITEM_SUPPORT[] = this.GetListBoosterChoicing();
        // const numYellowBlocks = DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.TILE_CHALLENGE) ? -1 : randomRangeInt(1, 5);
        // clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_INFO_WIN_STREAK, 1, true, { numYellowBlocks: numYellowBlocks, listItemSupport: listItemSupport });
        // this.logicTutEventWinStreak.CheckLogicDone();
        // this.ShowBgBlack();
    }
    //#endregion

    //#region control UI info
    private TryHideBg(typeUI: TYPE_UI, typeClose: number) {
        // if (typeUI == TYPE_UI.UI_INFO_WIN_STREAK) {
        //     this.HideBgBlack();
        // }
    }
    private ShowBgBlack() {
        const timeOpa = 0.5;
        Tween.stopAllByTarget(this.nBgBlack);
        this.nBgBlack.getComponent(UIOpacity).opacity = 0;
        this.nBgBlack.active = true;
        tween(this.nBgBlack.getComponent(UIOpacity))
            .to(timeOpa, { opacity: 255 })
            .start();
    }

    private HideBgBlack() {
        const timeHide = 0.5;
        Tween.stopAllByTarget(this.nBgBlack);
        this.nBgBlack.getComponent(UIOpacity).opacity = 255;
        tween(this.nBgBlack.getComponent(UIOpacity))
            .to(timeHide, { opacity: 0 })
            .call(() => {
                this.nBgBlack.active = false;
            })
            .start();
    }
    //#endregion  control UI info
}


