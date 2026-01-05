import { _decorator, Component, director, macro, Node, Vec3 } from 'cc';
import { GameManager } from '../../GameManager';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { DataPackSys } from '../../../DataBase/DataPackSys';
import { IcEvent_PackStarter } from '../IconEventLobby/IcEvent_PackStarter';
import { CheatingSys } from '../../CheatingSys';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { EnumNamePack, GameSoundEffect, IOpenUIInviteFriend, IPrize, IUIKeepTutAndReceiveLobby, TYPE_CURRENCY, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE, TYPE_RECEIVE_PRIZE_LOBBY, TYPE_SPECIAL_LOBBY } from '../../../Utils/Types';
import { UIReceivePrizeLobby } from '../UIReceivePrizeLobby';
import { PlayerData } from '../../../Utils/PlayerData';
import { DataLoginRewardSys } from '../../../DataBase/DataLoginRewardSys';
import { DataEventsSys, STATE_EVENT } from '../../DataEventsSys';
import { DataSeasonPassSys } from '../../../DataBase/DataSeasonPassSys';
import { DataLobbyJsonSys } from '../../DataLobbyJsonSys';
import { CaculTimeEvents2 } from '../CaculTimeEvents2';
import { Utils } from '../../../Utils/Utils';
import { DataLevelPassSys } from '../../../DataBase/DataLevelPassSys';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { AnimLoadItemHomeSys } from '../AnimLoadItemHomeSys';
import { IcEvent_PackGreatDeal } from '../IconEventLobby/IcEvent_PackGreatDeal';
import { IcEvent_PackGreatDeal_2 } from '../IconEventLobby/IcEvent_PackGreatDeal_2';
import { DataBuildingSys } from '../../../DataBase/DataBuildingSys';
import { UIPageHomeSys } from './UIPageHomeSys';
import { CurrencySys } from '../../CurrencySys';
import { AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE } from '../../OtherUI/Others/AutoScale/TypeAutoScale';
import { EVENT_FX_BUILDING_PLAY, Type_FxBuilding } from '../../../AnimsPrefab/Fx_building/Type_FxBuilding';
import { DataFriendJoinedSys } from '../../../DataBase/DataFriendJoinedSys';
import { MConfigs } from '../../../Configs/MConfigs';
import { PageLobbyBase } from '../../../Common/PageLobbyBase';
import { DataWeeklySys } from '../../../DataBase/DataWeeklySys';
import { DataDailyQuestSys } from '../../../DataBase/DataDailyQuestSys';
import { DataShopSys } from '../../DataShopSys';
import { EVENT_TUT_LOBBY } from '../../OtherUI/UITutorialInGame/TypeTutorialInLobby';
import { DataItemSys } from '../../DataItemSys';
import { DataInfoPlayer } from '../../DataInfoPlayer';
import { BlockUITransparent } from '../../GameScene/BlockUITransparent';
import { AnimPrefabsBase } from '../../../AnimsPrefab/AnimPrefabBase';
import { NameAnimIconHome_Idle, NameAnimIconHome_Receive } from '../../../Utils/TypeAnimChest';
import { PrizeSys } from '../../../DataBase/PrizeSys';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { AnimReceiveSpeedRaceSys } from '../../OtherUI/UISpeedRace/AnimReceiveSpeedRaceSys';
import { UILobbySys } from '../UILobbySys';
import { DataPiggySys } from '../../../DataBase/DataPiggySys';
import { DataDashRush } from '../../DataDashRush';
import { SoundSys } from '../../../Common/SoundSys';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { STATE_EVENT_LEVEL_PROGRESS } from '../../OtherUI/UILevelProgression/TypeLevelProgress';
import { STATE_DR } from '../../OtherUI/UIDashRush/TypeDashRush';
import { ControlItemsEvent } from '../../ControlItemsEvent';
import { LevelProgressionUI } from '../LevelProgressionUI';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { STATE_SL } from '../../OtherUI/UISkyLift/TypeSkyLift';
import { DataHalloweenSys } from '../../../DataBase/DataHalloweenSys';
import { GameInfoSys } from '../../GameScene/GameInfoSys';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { DataPackBlackFriday } from '../../../DataBase/DataPackBlackFriday';
import { DataChristmasSys } from '../../../DataBase/DataChristmasSys';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { STATE_HAT_RACE } from '../../OtherUI/UIChristmasEvent/HatRace/TypeHatRace';
import { IDataUIEventReceiveHatRaceFromHome, MCONFIG_CHRISTMAS_EVENT } from '../../OtherUI/UIChristmasEvent/TypeChristmasEvent';
import { CONFIG_LR_CHRIST } from '../../OtherUI/UIChristmasEvent/LightRoad/TypeLightRoad';
import { DataLightRoad_christ } from '../../../DataBase/DataLightRoad_christ';
const { ccclass, property } = _decorator;

@ccclass('PageHomeSys')
export class PageHomeSys extends PageLobbyBase {
    public static Instance: PageHomeSys = null;

    // pack
    @property(IcEvent_PackStarter) icEventPackStarter: IcEvent_PackStarter;
    @property(IcEvent_PackGreatDeal) icEventPackGreateDeal_1: IcEvent_PackGreatDeal;
    @property(IcEvent_PackGreatDeal_2) icEventPackGreateDeal_2: IcEvent_PackGreatDeal_2;
    // home
    @property(AnimLoadItemHomeSys) animLoadItemHomeSys: AnimLoadItemHomeSys;
    @property(BlockUITransparent) blockUITransparent: BlockUITransparent;

    @property({ group: { name: "Anim pass level", id: "Anim pass level" } }) posCoin: Vec3 = new Vec3(0, 0, 0);
    @property({ group: { name: "Anim pass level", id: "Anim pass level" } }) posItemBuilding: Vec3 = new Vec3(0, 0, 0);


    private isRunningOtherLogic = false;

    protected onLoad(): void {
        if (PageHomeSys.Instance == null) {
            PageHomeSys.Instance = this;
            director.on("DONE_TRANSITIONS_TURN_OFF", this.DoneAnimTurnOffLoadScene, this);
            // check new spin
            clientEvent.dispatchEvent(MConst.EVENT_SPIN.EVENT_CHECK_NEW_DAY);
            this.blockUITransparent.Show();
        }
    }

    protected onEnable(): void {
        this.animLoadItemHomeSys.LoadSkeAgain();

        // try update all pack in halloween
        DataHalloweenSys.Instance.TryGenPack(DataHalloweenSys.Instance.GetIndexPackNow());
    }

    protected onDisable(): void {
        PageHomeSys.Instance = null;
        director.off("DONE_TRANSITIONS_TURN_OFF", this.DoneAnimTurnOffLoadScene, this);
        clientEvent.off(MConst.EVENT.PAGE_HOME_CONTINUE, this.ContinueReceivePrize, this);
    }

    protected onDestroy(): void {
        PageHomeSys.Instance = null;
        director.off("DONE_TRANSITIONS_TURN_OFF", this.DoneAnimTurnOffLoadScene, this);
        clientEvent.off(MConst.EVENT.PAGE_HOME_CONTINUE, this.ContinueReceivePrize, this);
    }

    protected start(): void {
        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD);
        // call load prefab anim item 
        const listTypeEventCanInit: TYPE_EVENT_GAME[] = ControlItemsEvent.Instance.GetAllEventsCanShow();
        this.animLoadItemHomeSys.InitItem(GameManager.Instance.levelPlayerNow, listTypeEventCanInit);
    }

    override ShowPage(): void {
        // throw new Error('Method not implemented.');
        UIPageHomeSys.Instance.PlayParticleSnow();
    }

    //#region func listen
    private DoneAnimTurnOffLoadScene() {
        // NOTE : Bạn có thể lấy property của các event và check thông số đã dc cập nhật ờ phần load của các event đó
        // để check xem liệu có pop up anim trước khi chạy giao diện nhận thưởng hoặc những cái khác hay không

        if (PageHomeSys.Instance == null) return;

        //pop up short cut and subcribe bot
        if (GameManager.Instance.JsonPlayGame.LEVEL > 3 && GameManager.Instance.JsonPlayGame.LEVEL % 3 == 0) {
            FBInstantManager.Instance.CreateShortcut();
        } else if (GameManager.Instance.JsonPlayGame.LEVEL >= MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY && GameManager.Instance.JsonPlayGame.LEVEL % MConfigs.LEVEL_CAN_CHANGE_SCENE_TO_LOBBY == 0) {
            FBInstantManager.Instance.SubcribeBot();
        }

        // try update the data player
        DataPackSys.Instance.TryResetAllPackLose(true);

        // play anim receive prize
        this.PlayAnimReceivePrizeAtLobby();
    }

    private ContinueReceivePrize() {
        this.isRunningOtherLogic = false;
    }
    //#endregion func listen

    private async WaitReceivingDone() {
        const self = this;
        // wait until player received done
        return new Promise<void>((resolve) => {
            let ttId = setInterval(() => {
                if (!self.isRunningOtherLogic) {
                    clearInterval(ttId);
                    resolve();
                }
            }, 0.5, macro.REPEAT_FOREVER, 0)
        })
    }

    //#region anim receive anim prize at lobby

    private async PlayAnimReceivePrizeAtLobby() {
        /**
         * Logic :
         * 1. register event receive done
         * 2. turn on block UI
         * 4.
         * 3. unRegister event receive done
         */
        console.log("PlayAnimReceivePrizeAtLobby");
        const self = this;
        let needSaveLobbyJson: boolean = false;

        let listQueueAnimReceivePrize: Promise<void>[] = [];
        function AddAnimToQueue(cb: Promise<void>, timeWaitNextQueue: number) {
            listQueueAnimReceivePrize.push(cb);
            listQueueAnimReceivePrize.push(new Promise<void>(async resolve => { await Utils.delay(timeWaitNextQueue * 1000); resolve(); }))
        }

        const dataCustomLobby = ChangeSceneSys.Instance.GetDataCustom();
        const isDoneLevel = dataCustomLobby == TYPE_SPECIAL_LOBBY.SHOW_DONE_LEVEL;
        const midWPosScreen = Utils.getMiddleWPosWindow();

        // pause time of event tilePass to ensure receive prize anim can play
        clientEvent.dispatchEvent(MConst.EVENT_GAME.PAUSE_TIME_EVENT, TYPE_EVENT_GAME.LEVEL_PASS);
        clientEvent.dispatchEvent(MConst.EVENT_GAME.PAUSE_TIME_EVENT, TYPE_EVENT_GAME.SEASON_PASS);

        // register event receive done
        clientEvent.on(MConst.EVENT.PAGE_HOME_CONTINUE, this.ContinueReceivePrize, this);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);

        //====================================================================================================================
        //======================            Done Level           =============================================================
        //====================================================================================================================
        let isTest = false;

        if (isDoneLevel || isTest) {
            // anim tiền bay về phía trên UI
            // anim buidling bay về nút building
            const numCoinReceive: number = isTest ? 200 : DataLobbyJsonSys.Instance.GetNumCoin();
            const numBuilding: number = isTest ? 50 : DataLobbyJsonSys.Instance.GetNumBuilding();
            const prizeBuilding: IPrize = new IPrize(TYPE_PRIZE.BUILDING, TYPE_RECEIVE.NUMBER, numBuilding);
            // để lấy vị trí wPos chính xác ta sẽ lấy wPosMidScreen + posItem đã lưu
            const wPosStartItemBuilding: Vec3 = midWPosScreen.clone().add(this.posItemBuilding);
            const wPosStartCoin: Vec3 = midWPosScreen.clone().add(this.posCoin);
            const wPosEndCoin: Vec3 = UIPageHomeSys.Instance.GetWPosCoin_2();
            const wPosEndBuilding: Vec3 = UIPageHomeSys.Instance.nBtnBuilding.worldPosition.clone();
            let listAnimReceive: Promise<void>[] = [];
            SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_COIN_APPEARS);

            if (numCoinReceive > 0 || isTest) {
                listAnimReceive.push(
                    UIReceivePrizeLobby.Instance.superUIAnimCustom.ReceivePrizeCoin(null, numCoinReceive, wPosStartCoin, wPosEndCoin,
                        () => {
                            // save data lobby after receive done
                            CurrencySys.Instance.AddMoney(numCoinReceive, `passLevel_InHome`, false, false);
                            DataLobbyJsonSys.Instance.SaveNumCoin(-1, false);
                            needSaveLobbyJson = true;
                        },
                        (numCoinIncrease: number) => {
                            CurrencySys.Instance.EmitUpdateUICurrency(TYPE_CURRENCY.MONEY, numCoinIncrease);
                            clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.UI_COIN_PAGE_HOME);
                            clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_COIN_PAGE_HOME, null, null, MConfigs.FX_NEW_CUSTOM);
                        })
                )
            }

            // listAnimReceive.push(
            //     new Promise<void>(async resolve => {
            //         await UILobbySys.Instance.pvLobbySys.mIndicatorLobby_2.PlayAnimStar();
            //         resolve();
            //     })
            // )

            if (numBuilding > 0 || isTest) {
                listAnimReceive.push(
                    new Promise<void>(async resolve => {
                        await UIReceivePrizeLobby.Instance.superUIAnimCustom.ReceivePrizeItem_1(prizeBuilding, wPosStartItemBuilding, wPosEndBuilding, true);
                        DataBuildingSys.Instance.AddBlock(numBuilding, false);
                        DataLobbyJsonSys.Instance.SaveNumBuilding(-1, false);
                        needSaveLobbyJson = true;
                        clientEvent.dispatchEvent(MConst.EVENT_BUILDING.UPDATE_UI_BTN_BUILD);
                        clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.BTN_BUILDING_LOBBY);
                        clientEvent.dispatchEvent(EVENT_FX_BUILDING_PLAY, Type_FxBuilding.UI_BTN_BUILD_PAGE_HOME, null, null, MConfigs.FX_BTN_LEVEL);
                        resolve();
                    })
                )
            }

            await Promise.all(listAnimReceive).then((values) => {
                console.log(values); // Output: [3, 'foo', 42]
            });
            // gọi thêm emit nữa cho chắc ăn
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        }

        //====================================================================================================================
        //======================            Done Level            ============================================================
        //====================================================================================================================

        // //====================================================================================================================
        // //======================            season Pass            ===========================================================
        // //====================================================================================================================
        // const seasonPass_timeNextAnim: number = 1;
        // if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS) && CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.SEASON_PASS) > 0) {
        //     const keySeasonNow = DataSeasonPassSys.Instance.GetTotalProgress();
        //     const keyReceive_seasonPass = keySeasonNow - DataLobbyJsonSys.Instance.GetSeasonPassProgress();

        //     if (keyReceive_seasonPass > 0) {
        //         let promise = new Promise<void>(async resolve => {
        //             DataLobbyJsonSys.Instance.SaveSeasonPassProgress(keySeasonNow, false);
        //             needSaveLobbyJson = true;
        //             await UIPageHomeSys.Instance.seasonPassUI.ReceivedKeySeasonPass(keyReceive_seasonPass);
        //             resolve();
        //         })
        //         AddAnimToQueue(promise, seasonPass_timeNextAnim);
        //     } else if (keyReceive_seasonPass < 0) {
        //         DataLobbyJsonSys.Instance.SaveSeasonPassProgress(keySeasonNow, false);
        //         needSaveLobbyJson = true;
        //     }
        // } else if (CheatingSys.Instance.isCheatSeasonPass) {
        //     let promise = new Promise<void>(async resolve => {
        //         await UIPageHomeSys.Instance.seasonPassUI.ReceivedKeySeasonPass(CheatingSys.Instance.numSeasonPassReward);
        //         resolve();
        //     })
        //     listQueueAnimReceivePrize.push(promise);
        // }
        // //====================================================================================================================
        // //======================            season Pass            ===========================================================
        // //====================================================================================================================

        //====================================================================================================================
        //======================            level Pass             ===========================================================
        //====================================================================================================================
        const levelPass_timeNextAnim: number = 1;
        const isEndEventLP = CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.LEVEL_PASS);
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PASS) && CaculTimeEvents2.Instance.GetTimeEvent(TYPE_EVENT_GAME.LEVEL_PASS) > 0 && !isEndEventLP) {
            const keyLevelNow = DataLevelPassSys.Instance.GetProgressNow();
            const keyReceive_levelPass = keyLevelNow - DataLobbyJsonSys.Instance.GetLevelPassProgress();
            console.log(keyLevelNow, keyReceive_levelPass, DataLobbyJsonSys.Instance.GetLevelPassProgress());
            if (keyReceive_levelPass > 0) {
                let promise = new Promise<void>(async resolve => {
                    DataLobbyJsonSys.Instance.SaveLevelPassProgress(keyLevelNow, false);
                    needSaveLobbyJson = true;
                    const animLevelPassCom = this.animLoadItemHomeSys.itemEventLevelPass.nParent.children[0].getComponent(AnimPrefabsBase);
                    animLevelPassCom.PlayAnim(NameAnimIconHome_Receive.levelPass, false);
                    await Utils.delay(animLevelPassCom.GetTimeAnim(NameAnimIconHome_Receive.levelPass) * 1000);
                    resolve();
                })
                AddAnimToQueue(promise, levelPass_timeNextAnim);
            } else if (keyReceive_levelPass < 0) {
                DataLobbyJsonSys.Instance.SaveLevelPassProgress(keyLevelNow, false);
                needSaveLobbyJson = true;
            }
        } else {
            if (CheatingSys.Instance.isCheatLevelPass) {
                let promise = new Promise<void>(async resolve => {
                    const animLevelPassCom = this.animLoadItemHomeSys.itemEventLevelPass.nParent.children[0].getComponent(AnimPrefabsBase);
                    animLevelPassCom.PlayAnim(NameAnimIconHome_Receive.levelPass, false);
                    await Utils.delay(animLevelPassCom.GetTimeAnim(NameAnimIconHome_Receive.levelPass) * 1000);
                    resolve();
                })
                AddAnimToQueue(promise, levelPass_timeNextAnim);
            }
        }
        //====================================================================================================================
        //======================            level Pass             ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================            speed Race             ===========================================================
        //====================================================================================================================
        const speedRace_timeNextAnim: number = 1;

        //test
        // if (true) {
        //     const promise_test = new Promise<void>(async resolve => {
        //         const animSpeedRaceCom = this.animLoadItemHomeSys.itemEventSpeedRace.nParent.children[0].getComponent(AnimPrefabsBase);
        //         animSpeedRaceCom.PlayAnim(NameAnimIconHome_Receive.speedRace, false);
        //         await Utils.delay(animSpeedRaceCom.GetTimeAnim(NameAnimIconHome_Receive.speedRace) * 1000);
        //         // play anim progress
        //         const animProgressSpeedRaceCom = this.animLoadItemHomeSys.itemEventSpeedRace.nParent.parent.getComponent(AnimReceiveSpeedRaceSys);
        //         animProgressSpeedRaceCom.TestTryPlayAnim(() => {
        //             resolve();
        //         });
        //     });
        //     listQueueAnimReceivePrize.push(promise_test);
        // }

        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SPEED_RACE) && !DataSpeedRace.Instance.IsEndEvent()) {
            const progressPrevious = DataSpeedRace.Instance.GetProgressForPlayAnimUI();
            const progressNow = DataSpeedRace.Instance.GetInfoPlayerNow()?.progress;

            if (progressNow != null && DataLobbyJsonSys.Instance.IsPlaySpeedRace() && progressPrevious < progressNow) {
                const promise_speedRace_eat = new Promise<void>(async resolve => {
                    const animSpeedRaceCom = this.animLoadItemHomeSys.itemEventSpeedRace.nParent.children[0].getComponent(AnimPrefabsBase);
                    animSpeedRaceCom.PlayAnim(NameAnimIconHome_Receive.speedRace, false);
                    await Utils.delay(animSpeedRaceCom.GetTimeAnim(NameAnimIconHome_Receive.speedRace) * 1000);
                    resolve();

                    // // check need to play more anim recevei prize
                    // if (DataSpeedRace.Instance.CanPlayAnimIncreaseProgressIcon(progressPrevious, progressNow)) {

                    //     const animProgressSpeedRaceCom = this.animLoadItemHomeSys.itemEventSpeedRace.nParent.parent.getComponent(AnimReceiveSpeedRaceSys);
                    //     // play anim progress
                    //     animProgressSpeedRaceCom.TryPlayAnim(() => {
                    //         resolve();
                    //     });
                    // } else {
                    //     resolve();
                    // }
                });
                listQueueAnimReceivePrize.push(promise_speedRace_eat);
                DataLobbyJsonSys.Instance.CanPlaySpeedRace(false, false);
                needSaveLobbyJson = true;
            }
        }

        //====================================================================================================================
        //======================            speed Race             ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             Sky Lift            =============================================================
        //====================================================================================================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SKY_LIFT) && DataSkyLiftSys.Instance.STATE == STATE_SL.JOINING) {
            if (DataSkyLiftSys.Instance.ProgressNow > DataSkyLiftSys.Instance.ProgressOld) {
                const promise_speedRace_eat = new Promise<void>(async resolve => {
                    const animSkyLiftCom = this.animLoadItemHomeSys.itemEventSkyLift.nParent.children[0].getComponent(AnimPrefabsBase);
                    animSkyLiftCom.PlayAnim(NameAnimIconHome_Receive.skyLift, false);
                    await Utils.delay(animSkyLiftCom.GetTimeAnim(NameAnimIconHome_Receive.skyLift) * 1000);
                    resolve();
                });
                listQueueAnimReceivePrize.push(promise_speedRace_eat);
            }
        }
        //====================================================================================================================
        //======================             Sky Lift            =============================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             piggy bank             ==========================================================
        //====================================================================================================================
        // const piggyBank_timeNextAnim: number = 1;
        // if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.PIGGY_BANK)) {
        //     if (DataLobbyJsonSys.Instance.IsPlayPiggy()) {
        //         let promise = new Promise<void>(async resolve => {
        //             DataLobbyJsonSys.Instance.CanPlayPiggy(false, false);
        //             needSaveLobbyJson = true;
        //             const animPiggyBankCom = this.animLoadItemHomeSys.itemEventPiggyBank.nParent.children[0].getComponent(AnimPrefabsBase);
        //             animPiggyBankCom.PlayAnim(NameAnimIconHome_Receive.piggyBank, false);
        //             await Utils.delay(animPiggyBankCom.GetTimeAnim(NameAnimIconHome_Receive.piggyBank) * 1000);
        //             resolve();
        //         })
        //         AddAnimToQueue(promise, piggyBank_timeNextAnim);
        //     }
        // }
        //====================================================================================================================
        //======================             piggy bank             ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             dash Rush            ============================================================
        //====================================================================================================================
        const dashRush_timeNextAnim: number = 1;
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.DASH_RUSH)) {
            const logic1 = DataDashRush.Instance.CanShowTimeDashRush();
            const logic2 = DataLobbyJsonSys.Instance.IsPlayDashRush();

            if (logic1 && logic2) {
                let promise = new Promise<void>(async resolve => {
                    DataLobbyJsonSys.Instance.CanPlayDashRush(false, false);
                    needSaveLobbyJson = true;
                    const icDashRush = this.animLoadItemHomeSys.itemEventDashRush.nParent.children[0];
                    if (icDashRush != null) {
                        const animDashRushCom = icDashRush.getComponent(AnimPrefabsBase);
                        animDashRushCom.PlayAnim(NameAnimIconHome_Receive.dashRush, false);
                        await Utils.delay(animDashRushCom.GetTimeAnim(NameAnimIconHome_Receive.dashRush) * 1000);
                    }
                    resolve();
                })
                AddAnimToQueue(promise, dashRush_timeNextAnim);
            }
        }

        //====================================================================================================================
        //======================             dash Rush             ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             level Progression             ===================================================
        //====================================================================================================================
        const levelProgress_timeNextAnim: number = 1;
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION)) {
            const logic1 = DataLevelProgressionSys.Instance.STATE == STATE_EVENT_LEVEL_PROGRESS.JOINING || DataLevelProgressionSys.Instance.STATE == STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_RECEIVE_END_EVENT;
            const progressLeveProgressNow = DataLevelProgressionSys.Instance.GetProgressNow();
            const progressReceive_levelProgression = (DataLevelProgressionSys.Instance.GetProgressNow() - DataLobbyJsonSys.Instance.GetNumLevelProgress());
            if (logic1) {
                if (progressReceive_levelProgression > 0) {
                    let promise = new Promise<void>(async resolve => {
                        DataLobbyJsonSys.Instance.SaveLevelPassProgress(progressLeveProgressNow, false);
                        needSaveLobbyJson = true;
                        await ControlItemsEvent.Instance.GetItemEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION).node.getComponent(LevelProgressionUI).ReceivedKeyLevelProgression(progressReceive_levelProgression);
                        resolve();
                    })
                    AddAnimToQueue(promise, levelProgress_timeNextAnim);
                } else if (progressReceive_levelProgression < 0) {
                    DataLobbyJsonSys.Instance.SaveLevelProgression(progressLeveProgressNow, false);
                    needSaveLobbyJson = true;
                }
            }
        }
        //====================================================================================================================
        //======================             level Progression             ===================================================
        //====================================================================================================================

        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // play anim receive prize at lobby
        // phần nhận thưởng sẽ được thêm vào danh sách theo thứ tự mà game yêu cầu
        // sau đó chạy anim nhận thưởng đợi hết toàn bộ anim nhận thưởng chung mới chạy tiếp
        if (needSaveLobbyJson) {
            DataLobbyJsonSys.Instance.SaveDataLobbyJson();
        }

        try {
            console.log("listQueueAnimReceivePrize", listQueueAnimReceivePrize);
            await Promise.all(listQueueAnimReceivePrize);
        } catch (e) {
            console.error("1111", e);
        }

        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //====================================================================================================================
        //======================            Login Reward       ===============================================================
        //====================================================================================================================
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LOGIN_REWARD)
            && !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.LOGIN_REWARD)
            && DataLoginRewardSys.Instance.CanShowWhenLogin()) {
            const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LOGIN_REWARD, 1, false, [canKeepTutAndReceiveLobby]);
            //turn off block UI
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            this.isRunningOtherLogic = true;
            // wait until player received done
            await this.WaitReceivingDone();
            //turn on block UI
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        }
        //====================================================================================================================
        //======================            Login Reward       ===============================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================            Check tournament       ===========================================================
        //====================================================================================================================
        // if (GameManager.Instance.levelPlayerNow >= MConfigs.LEVEL_TUTORIAL_EVENT.Tournament) {
        //     clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //     // check player can receive prize from event to show popUP receive prize
        //     await this.TryShowReceivePrizeTournament();
        //     await this.WaitReceivingDone();
        //     clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // }
        //====================================================================================================================
        //======================            Check tournament       ===========================================================
        //====================================================================================================================


        //====================================================================================================================
        //======================            Check weekly       ===============================================================
        //====================================================================================================================
        // get previous weekly and check player isReceive or not
        // const dataPreviousWeek = await DataWeeklySys.Instance.GetRankPlayerPreviousWeek();

        // // console.warn("check", dataPreviousWeek);

        // const rankPreviousWeek = dataPreviousWeek.rank;
        // if (GameManager.Instance.levelPlayerNow >= MConfigs.LEVEL_CAN_RECEIVE_PRIZE_WEEKLY && (rankPreviousWeek > 0 && rankPreviousWeek <= 3)) {
        //     // chỉ lấy top 3
        //     //turn off block UI
        //     const dataPrize = CheatingSys.Instance.isCheatWeekly ? dataPreviousWeek.prize[0] : dataPreviousWeek.prize[dataPreviousWeek.rank];
        //     if (dataPrize != null) {
        //         dataPrize.forEach(item => {
        //             if (item.typePrize == TYPE_PRIZE.MONEY) {
        //                 CurrencySys.Instance.AddMoney(item.value, "prize Weekly", false, false);
        //             } else if (item.typePrize == TYPE_PRIZE.TICKET) {
        //                 CurrencySys.Instance.AddTicket(item.value, "prize Weekly", false, false);
        //             }
        //         })
        //         DataItemSys.Instance.AddItemPrize(dataPrize, "prize Weekly", true, false);
        //         DataWeeklySys.Instance.ClaimPrizePreviousWeek(DataWeeklySys.Instance.GetNamePreviousWeek());

        //         // wait until player received done
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //         await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.WEEKLY, dataPrize, "prize Weekly", rankPreviousWeek, null, "Weekly Rewards");
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //     }
        // } else if (CheatingSys.Instance.isCheatWeekly) {
        //     const dataPrize = [
        //         new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1),
        //         new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1),
        //         new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1),
        //         new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 1),
        //     ]

        //     // wait until player received done
        //     clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //     await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.WEEKLY, dataPrize, "prize Weekly", 1, null, "Weekly Rewards");
        //     clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // }

        //====================================================================================================================
        //======================            Check weekly       ===============================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================  Invite new Friend            ===============================================================
        //====================================================================================================================

        // check if has new friend => show has new friend
        // if (MConfigs.CAN_SHOW_INVITE_AT_LOBBY && DataFriendJoinedSys.Instance.CanReceivePrizeAutoInLobby()) {
        //     this.isRunningOtherLogic = true;
        //     const dataCustomUIInvite: IOpenUIInviteFriend = {
        //         iOpenUIBaseWithInfo: {
        //             isShowInfo: false
        //         },
        //         isShowBtnClose: true
        //     }
        //     clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_INVITE_FRIEND, 1, true, dataCustomUIInvite);


        //     // wait until player received done
        //     clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //     await this.WaitReceivingDone();
        //     clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // }
        //====================================================================================================================
        //======================  Invite new Friend            ===============================================================
        //====================================================================================================================

        //====================================================================================================================
        // ==================================== check tut building ==============================
        //====================================================================================================================

        if (!DataBuildingSys.Instance.IsPlayTutBuilding()) {
            this.isRunningOtherLogic = true;
            const nBuilding: Node = UIPageHomeSys.Instance.nBgBtnBuilding;
            const timeShadow: number = 0.5;

            // wait until player received done
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            clientEvent.dispatchEvent(MConst.EVENT_BUILDING.PLAY_TUT_BUILDING, nBuilding, timeShadow);
            await this.WaitReceivingDone();
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        }

        //====================================================================================================================
        // ==================================== check tut building ==============================
        //====================================================================================================================


        //====================================================================================================================
        //======================            Pack               ===============================================================
        //====================================================================================================================
        // check popUp starterPack
        // if (this.icEventPackStarter != null && FBInstantManager.Instance.checkHaveIAPPack_byProductID(EnumNamePack.StartedPack)) {
        //     if (this.icEventPackStarter.TryShowPopUpAtLobby()) {
        //         //turn off block UI
        //         this.isRunningOtherLogic = true;

        //         // wait until player received done
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //         await this.WaitReceivingDone();
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //     }
        // }

        // // // check popUp receveive pack 1
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // if (this.icEventPackGreateDeal_1 != null && FBInstantManager.Instance.checkHaveIAPPack_byProductID(EnumNamePack.GreateDealsPack_1)) {
        //     if (this.icEventPackGreateDeal_1.TryShowPopUpAtLobby()) {
        //         //turn off block UI
        //         this.isRunningOtherLogic = true;

        //         // wait until player received done
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //         await this.WaitReceivingDone();
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //     }
        // }

        // // check popUp receveive pack 2
        // clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        // if (this.icEventPackGreateDeal_2 != null && FBInstantManager.Instance.checkHaveIAPPack_byProductID(EnumNamePack.GreateDealsPack_2)) {
        //     if (this.icEventPackGreateDeal_2.TryShowPopUpAtLobby()) {
        //         //turn off block UI
        //         this.isRunningOtherLogic = true;

        //         // wait until player received done
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //         await this.WaitReceivingDone();
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //     }
        // }

        //====================================================================================================================
        //======================            Pack               ===============================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             piggy bank             ==========================================================
        //====================================================================================================================
        // if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.PIGGY_BANK)) {
        //     if (DataPiggySys.Instance.IsMaxCoinAndNotPopUpYet()) {
        //         this.isRunningOtherLogic = true;

        //         // handle
        //         DataPiggySys.Instance.SavePopUpFull();
        //         let dataCustom: IUIKeepTutAndReceiveLobby = {
        //             canKeepTutAndReceiveLobby: true
        //         }
        //         clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PIGGY_BANK, 1, true, [dataCustom]);

        //         // wait until player received done
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //         await this.WaitReceivingDone();
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //     }
        // }
        //====================================================================================================================
        //======================             piggy bank             ==========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             dash rush              ==========================================================
        //====================================================================================================================
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.DASH_RUSH)) {
            const logic1 = DataDashRush.Instance.CanShowTimeDashRush();
            const logic2 = DataDashRush.Instance.GetPlayerMaxScore() != null;
            // console.log(logic1, logic2);
            const stateEventDR_now = DataDashRush.Instance.GetState();
            const logic3 = stateEventDR_now == STATE_DR.WAIT_TO_RECEIVE_PRIZE;
            const logic4 = stateEventDR_now == STATE_DR.WAIT_TO_RECEIVE_PRIZE && DataEventsSys.Instance.IsEventHide(TYPE_EVENT_GAME.DASH_RUSH);

            // trong trường hợp đang trong thời gian và player thua hoặc thắng => auto popUp show kết quả để người chơi quyết định có chơi tiếp hay không
            // trong trường hợp event đang hoạt động nhưng đã kết thúc event
            if ((logic1 && logic2) || (logic1 && logic3) || logic4) {
                // show popUp để nhận thưởng
                this.isRunningOtherLogic = true;

                // handle
                let dataCustom: IUIKeepTutAndReceiveLobby = {
                    canKeepTutAndReceiveLobby: true
                }
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_DASH_RUSH, 1, true, dataCustom);

                // wait until player received done
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                await this.WaitReceivingDone();
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            }
        }
        //====================================================================================================================
        //======================             dash rush              ==========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             Level Pass            ===========================================================
        //====================================================================================================================
        // check nếu như đã kết thúc event mà chưa nhận phần thưởng thì sẽ show popUp nhận thưởng của event đó
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PASS)) {
            // bởi vì đoạn này chúng ta chưa khởi tạo event => do đó sẽ check bằng code riêng không thông qua CaculTimeEvent2
            const logic1 = CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.LEVEL_PASS);
            const logic2 = DataLevelPassSys.Instance.HadPrizeNotReceive();
            const logic3 = !DataLevelPassSys.Instance.IsReceviePrizeAuto();
            if (logic1 && logic2 && logic3) {
                const listPrizeNotReceive = DataLevelPassSys.Instance.ReceiveAllPrizeCanReceive();

                // save data
                DataLevelPassSys.Instance.SetReceivePrizeAuto(true, false);
                DataLevelPassSys.Instance.ForceSetAllPrizeCanReceiveToTrue(false);
                PrizeSys.Instance.AddPrize(listPrizeNotReceive, "LevelPass_endTime", true, false);

                // wait until player received done
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PASS_LIST_PRIZE, listPrizeNotReceive, "LevelPass_endTime", null, null, "Level Pass");
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            }
        }
        //====================================================================================================================
        //======================             Level Pass            ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             Season Pass            ===========================================================
        //====================================================================================================================
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            // check nếu như đã kết thúc event mà chưa nhận phần thưởng thì sẽ show popUp nhận thưởng của event đó
            const logic1 = CaculTimeEvents2.Instance.IsEndEventBeforeCheckLogicToInitNewEvent(TYPE_EVENT_GAME.SEASON_PASS);
            const logic2 = DataSeasonPassSys.Instance.HadPrizeNotReceive();
            const logic3 = !DataSeasonPassSys.Instance.IsReceviePrizeAuto();
            if (logic1 && logic2 && logic3) {
                const listPrizeNotReceive = DataSeasonPassSys.Instance.ReceiveAllPrizeCanReceive();

                // save data
                DataSeasonPassSys.Instance.SetReceivePrizeAuto(true, false);
                DataSeasonPassSys.Instance.ForceSetAllPrizeCanReceiveToTrue(false);
                PrizeSys.Instance.AddPrize(listPrizeNotReceive, "SeasonPass_endTime", true, false);

                // wait until player received done
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.SEASON_PASS_LIST_PRIZE, listPrizeNotReceive, "SeasonPass_endTime", null, null, "Season Pass");
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            }
        }
        //====================================================================================================================
        //======================             Season Pass           ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================          SpeedRace            ===============================================================
        //====================================================================================================================
        if (!DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SPEED_RACE)) {
            // trong trường hợp end event đã kết thúc thì sẽ auto popUp hiển thị showUI
            const progressNow = DataSpeedRace.Instance.GetInfoPlayerNow()?.progress;
            if (progressNow != null && DataSpeedRace.Instance.IsEndEvent() && !DataSpeedRace.Instance.IsReceivePrizeSummery()) {
                this.isRunningOtherLogic = true;
                const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true }
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SPEED_RACE, 1, true, [canKeepTutAndReceiveLobby]);

                // wait until player received done
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                await this.WaitReceivingDone();
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
            }
        }
        //====================================================================================================================
        //======================          SpeedRace            ===============================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             Level Progression     ===========================================================
        //====================================================================================================================
        // check nếu như đã kết thúc event mà chưa nhận phần thưởng thì sẽ show popUp nhận thưởng của event đó
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION)) {
            // bởi vì đoạn này chúng ta chưa khởi tạo event => do đó sẽ check bằng code riêng không thông qua CaculTimeEvent2
            const logic1 = DataLevelProgressionSys.Instance.STATE == STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_RECEIVE_END_EVENT;
            const logic2 = DataLevelProgressionSys.Instance.HadPrizeNotReceive();
            const logic3 = !DataLevelProgressionSys.Instance.IsReceivedPrizeAuto();
            const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
            switch (true) {
                case logic1 && logic2 && logic3:
                    const listPrizeNotReceivedYet: IPrize[] = DataLevelProgressionSys.Instance.GetAllPrizeCanReceive();

                    // save data
                    DataLevelProgressionSys.Instance.SetIsReceivedPrizeAuto(true, false);
                    PrizeSys.Instance.AddPrize(listPrizeNotReceivedYet, "levelProgress_endTime", true, false);

                    // wait until player received done
                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                    await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.LEVEL_PROGRESSION_END_TIME, listPrizeNotReceivedYet, "LevelProgression_endTime", null, null, "Level Progression");
                    DataLevelProgressionSys.Instance.UpdateStateEvent(true);
                    this.isRunningOtherLogic = true;
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1, true, [canKeepTutAndReceiveLobby]);
                    break;
                case logic1 && !logic2:
                    DataLevelProgressionSys.Instance.UpdateStateEvent(true);
                    this.isRunningOtherLogic = true;
                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1, true, [canKeepTutAndReceiveLobby]);
                    await this.WaitReceivingDone();
                    break;
            }
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             Level Progression     ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             Treasure Trail        ===========================================================
        //====================================================================================================================
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.TREASURE_TRAIL)) {
            if (DataTreasureTrailSys.Instance.CanShowUIAtHome()) {
                this.isRunningOtherLogic = true;
                const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_TREASURE_TRAIL, 1, true, [canKeepTutAndReceiveLobby]);
                await this.WaitReceivingDone();
            }
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             Treasure Trail        ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             Sky Lift        =================================================================
        //====================================================================================================================
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.SKY_LIFT)) {
            const valid1 = DataSkyLiftSys.Instance.STATE == STATE_SL.JOINING;
            const valid2 = DataSkyLiftSys.Instance.ProgressNow != DataSkyLiftSys.Instance.ProgressOld;
            const valid3 = DataSkyLiftSys.Instance.IsReachPlatform();
            switch (true) {
                case valid1 && valid2 && valid3:
                    this.isRunningOtherLogic = true;
                    const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
                    clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_SKY_LIFT, 1, true, [canKeepTutAndReceiveLobby]);
                    await this.WaitReceivingDone();
                    break;
                case valid1 && valid2 && !valid3:
                    DataSkyLiftSys.Instance.UpdateProgressOld(true);
                    break;
            }
        }

        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             Sky Lift        ===========================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             Halloween        ===========================================================
        //====================================================================================================================
        // nếu user ở lv11 và có tồn tại pack halloween thì ta sẽ show popUp một lần
        if (GameManager.Instance.levelPlayerNow == 15 && DataHalloweenSys.Instance.GetTimeRemain() > 0) {
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            // show popUp halloween
            const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
            this.isRunningOtherLogic = true;
            director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);
            await MConfigResourceUtils.LoadSkeHalloween();
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_HALLOWEEN, 1, true, canKeepTutAndReceiveLobby)
            await this.WaitReceivingDone();
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             Halloween        =================================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             BlackFriday        ===========================================================
        //====================================================================================================================
        if (DataPackBlackFriday.Instance.InfoPackCacheNow != null && !DataPackBlackFriday.Instance.IsPackShowToday) {
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
            this.isRunningOtherLogic = true;
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_BLACK_FRIDAY, 1, true, canKeepTutAndReceiveLobby)
            await this.WaitReceivingDone();
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             BlackFriday        ==============================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             TUTORIAL        =================================================================
        //====================================================================================================================
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        // Check event can show on lobby => mới có thể
        let listEventCanShow: TYPE_EVENT_GAME[] = DataEventsSys.Instance._listTypeEventShow;
        switch (true) {
            case listEventCanShow.includes(TYPE_EVENT_GAME.LEVEL_PASS):
                CaculTimeEvents2.Instance.CheckCanResumeOrGenEvent(TYPE_EVENT_GAME.LEVEL_PASS);
                break;
            case listEventCanShow.includes(TYPE_EVENT_GAME.SEASON_PASS):
                CaculTimeEvents2.Instance.CheckCanResumeOrGenEvent(TYPE_EVENT_GAME.SEASON_PASS);
                break;
        }

        //=====================================  logic check tut event ============================
        this.isRunningOtherLogic = true;
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true, true, (hasEventRun: boolean) => {
            console.log("hasEventRun", hasEventRun);
            if (!hasEventRun) {
                console.log("MConfigs.IsTryShowPopUpStartEventLP", MConfigs.IsTryShowPopUpStartEventLP);
                // check can show LevelProgress
                const logic1 = DataLevelProgressionSys.Instance.STATE == STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN;
                if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION) && !MConfigs.IsTryShowPopUpStartEventLP && logic1) {
                    const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
                    clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_LEVEL_PROGRESSION_PREPARE, 1, true, [canKeepTutAndReceiveLobby]);
                } else {
                    this.isRunningOtherLogic = false;
                }
            }
        });
        await this.WaitReceivingDone();
        //====================================================================================================================
        //======================             TUTORIAL        =================================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             ChristmasPack        ============================================================
        //====================================================================================================================
        if (DataChristmasSys.Instance.InfoPackChristmasWorking != null
            && DataChristmasSys.Instance.IsActive
            && DataInfoPlayer.Instance.GetNumWin() >= MConfigs.LEVEL_TUTORIAL_EVENT.Pack_christmasEvent
            && MCONFIG_CHRISTMAS_EVENT.IS_SHOW_FIRST_TIME) {
            MCONFIG_CHRISTMAS_EVENT.IS_SHOW_FIRST_TIME = false;
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
            this.isRunningOtherLogic = true;
            director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);
            await MConfigResourceUtils.LoadSkeChristmas();
            const indexPackChristNow = DataChristmasSys.Instance.GetIndexPackNow()
            if (indexPackChristNow == 12 || indexPackChristNow == 13) {
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_CHRISTMAS_AFO, 1, true, canKeepTutAndReceiveLobby)
            } else {
                clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_PACK_CHRISTMAS, 1, true, canKeepTutAndReceiveLobby)
            }
            await this.WaitReceivingDone();
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             ChristmasPack        ============================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             LightRoad        ================================================================
        //====================================================================================================================
        const infoPrizeReceiveLR = DataLightRoad_christ.Instance.GetPrizeTriggerAtHome();
        if (infoPrizeReceiveLR != null && infoPrizeReceiveLR.listPrize.length > 0) {
            // trường hợp nếu có thể nhận thưởng lightRoad
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            // save lại phần thưởng đc nhận
            DataLightRoad_christ.Instance.ReceivePrize(infoPrizeReceiveLR.index);
            PrizeSys.Instance.AddPrize(infoPrizeReceiveLR.listPrize, "LightRoad", true, false);
            await UIReceivePrizeLobby.Instance.AddActionToQueue(TYPE_RECEIVE_PRIZE_LOBBY.LIGHT_ROAD, infoPrizeReceiveLR.listPrize, "LightRoad", null, null, "Light Road");
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             LightRoad        ================================================================
        //====================================================================================================================

        //====================================================================================================================
        //======================             HatRace        ===================================================================
        //=====================================================================================================================
        if (DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.CHRISTMAS_EVENT)
            && DataHatRace_christ.Instance.State == STATE_HAT_RACE.WAIT_RECEIVE
        ) {
            CONFIG_LR_CHRIST.AUTO_SHOW_AT_HOME = false;
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            // Show UIChristMas trỏ vào tab HatRace
            const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
            const receivePrizeHatRace: IDataUIEventReceiveHatRaceFromHome = { isFromHome: true }
            this.isRunningOtherLogic = true;
            director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_CHRISTMAS_EVENT, 1, true, [canKeepTutAndReceiveLobby, receivePrizeHatRace]);
            await this.WaitReceivingDone();
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================             HatRace        ===================================================================
        //=====================================================================================================================

        //====================================================================================================================
        //======================            Auto open hatRace        ==========================================================
        //=====================================================================================================================
        if (CONFIG_LR_CHRIST.AUTO_SHOW_AT_HOME) {
            CONFIG_LR_CHRIST.AUTO_SHOW_AT_HOME = false;
            clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
            const canKeepTutAndReceiveLobby: IUIKeepTutAndReceiveLobby = { canKeepTutAndReceiveLobby: true };
            this.isRunningOtherLogic = true;
            director.emit(MConst.EVENT.BLOCK_UI.SHOW_UI_LOADING);
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_CHRISTMAS_EVENT, 1, true, [canKeepTutAndReceiveLobby]);
            await this.WaitReceivingDone();
        }
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        //====================================================================================================================
        //======================            Auto open hatRace        ==========================================================
        //=====================================================================================================================


        //====================================================================================================================
        //======================             Building        =================================================================
        //====================================================================================================================
        switch (true) {
            case DataBuildingSys.Instance.CanReceivePrizeUnlockFullMap():
                UIPageHomeSys.Instance.ReceivePrizeUnlockFullMap();
                break;
            case DataBuildingSys.Instance.CanFinishConstructorNowFromHome():
                // zoom tới building để nhận thưởng
                UIPageHomeSys.Instance.ZoomConstructorNowToReceivePrize();
                break;
            case DataBuildingSys.Instance.WasReceivePrizeButDataIsDone():
                UIPageHomeSys.Instance.ForceNextMap();
                break;
            default:
                // unRegister event receive done
                // Bởi vì để nếu ta gọi ZoomConsructor sẽ gọi block looby nên chỉ khi ko có anim building mới gọi hide block
                clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
                break;
        }

        //====================================================================================================================
        //======================             Building        =================================================================
        //====================================================================================================================
        clientEvent.off(MConst.EVENT.PAGE_HOME_CONTINUE, this.ContinueReceivePrize, this);

        //=================================== logic check can show noti at shop =====================================
        // lý do cho thứ này để dưới cùng vì đợi chạy hết nhận thưởng các luồng xong thì user mưới có thể tương tác được
        // do đó sẽ lợi dụng một khoảng thời gian dài để đến thời điểm cooldown của free để nhận thưởng
        if (DataShopSys.Instance.CanShowNotiCoin() || DataShopSys.Instance.CanShowNotiQuest()) {
            clientEvent.dispatchEvent(MConst.EVENT_SHOP.SHOW_NOTI);
        }
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    }

    private async TryShowReceivePrizeTournament() {
        // console.log("check id weekly", DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY);

        // this is for test
        if (CheatingSys.Instance.IsTestReceivePrizeTour) {
            // try receive first tour you call but not save it was received
            let infoFTourTest = DataLeaderboardSys.Instance.GetListTouringByContextId().filter(tour =>
                tour.contextId != MConst.CONTEXT_ID_LEADERBOARD_SERVER.FRIEND && tour.contextId != MConst.CONTEXT_ID_LEADERBOARD_SERVER.WORLD &&
                tour.contextId != DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY
            )[0];

            // console.log("333333333333", infoFTourTest);

            if (infoFTourTest != null) {
                this.isRunningOtherLogic = true;
                for (let i = 0; i < 2; i++) {
                    let jsonToReceivePrizeTour = DataLeaderboardSys.Instance.GetJsonToReceivePrizeTournament(infoFTourTest.contextId);
                    // console.log("44444444444444444444", jsonToReceivePrizeTour);
                    if (jsonToReceivePrizeTour != null && jsonToReceivePrizeTour.listPrize.length > 0) {
                        // console.log("11111111111111111111_______________333333333333333333");
                        await UIReceivePrizeLobby.Instance.AddActionToQueue(
                            TYPE_RECEIVE_PRIZE_LOBBY.TOURNAMENT,
                            jsonToReceivePrizeTour.listPrize,
                            'tournament',
                            jsonToReceivePrizeTour.indexPlayer,
                            jsonToReceivePrizeTour.nameTournament,
                            jsonToReceivePrizeTour.nameTournament
                        )
                    }
                }
                this.isRunningOtherLogic = false;
            }
        }

        // normal case
        else {
            let contextIdCanReceive = DataLeaderboardSys.Instance.GetContextIdTournamentExprireToReceivePrize();
            // console.log("contextTour", contextIdCanReceive);

            if (contextIdCanReceive != null && contextIdCanReceive.length > 0) {
                for (let i = 0; i < contextIdCanReceive.length; i++) {
                    const contextIdCheck = contextIdCanReceive[i];
                    let jsonToReceivePrizeTour = DataLeaderboardSys.Instance.GetJsonToReceivePrizeTournament(contextIdCheck);
                    if (jsonToReceivePrizeTour != null) {
                        // chỉ có top 3 mới đc coi là thắng tournament
                        if (jsonToReceivePrizeTour.indexPlayer <= 3) {
                            DataInfoPlayer.Instance.IncreaseLeagueWin(false);
                        }
                        // save prize receive
                        PlayerData.Instance.SaveIdTourWasClaimed(contextIdCheck, false);
                        PrizeSys.Instance.AddPrize(jsonToReceivePrizeTour.listPrize, "tournament", true, false);
                        // console.log("receive tour", contextIdCheck, jsonToReceivePrizeTour.indexPlayer);

                        this.isRunningOtherLogic = true;
                        await UIReceivePrizeLobby.Instance.AddActionToQueue(
                            TYPE_RECEIVE_PRIZE_LOBBY.TOURNAMENT,
                            jsonToReceivePrizeTour.listPrize,
                            'tournament',
                            jsonToReceivePrizeTour.indexPlayer,
                            jsonToReceivePrizeTour.nameTournament,
                            jsonToReceivePrizeTour.nameTournament
                        )
                    }
                }
                this.isRunningOtherLogic = false;
            }
        }
    }

    //#endregion anim receive anim prize at lobby
}


