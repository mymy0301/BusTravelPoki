import { _decorator, Button, Component, Label, macro, Material, Node, ProgressBar, randomRangeInt, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { DataSeasonPassSys } from '../../DataBase/DataSeasonPassSys';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { IPrize, TYPE_EVENT_GAME, TYPE_PRIZE, TYPE_RECEIVE } from '../../Utils/Types';
import { DataEventsSys } from '../DataEventsSys';
import { Utils } from '../../Utils/Utils';
import { EVENT_SEASON_PASS } from '../OtherUI/UISeasonPass/TypeSeasonPass';
import { UIBlinh } from './UIBlinh';
import { AnimPrefabsBase } from '../../AnimsPrefab/AnimPrefabBase';
import { NameAnimIconHome_Receive } from '../../Utils/TypeAnimChest';
const { ccclass, property } = _decorator;

@ccclass('SeasonPassUI')
export class SeasonPassUI extends Component {
    @property(Label) lbProgressSeasonPass: Label;
    @property(Node) nAnimKey: Node;
    @property(Node) nTemp: Node;
    @property(ProgressBar) progressBar: ProgressBar;
    @property(Sprite) spIconReward: Sprite;
    @property(Label) lbNumIconReward: Label;
    @property(Node) nLbX2Key: Node;
    @property([Node]) listNGray: Node[] = [];
    @property(Node) nIconLock: Node;
    @property(UIBlinh) uiBlinh: UIBlinh;

    @property(Material) matGray: Material;

    private _isPlayingAnim: boolean = false;
    private _oldProgress = 0;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_GAME.END_TIME_EVENT, this.EndTime, this);
        clientEvent.on(MConst.EVENT_GAME.CREATE_EVENT, this.CreateEvent, this);
        clientEvent.on(EVENT_SEASON_PASS.UPDATE_UI_SEASON_PASS, this.UpdateUISeasonPass, this);

        this.nLbX2Key.active = false;

        if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            this.UpdateUISeasonPass();
        }
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_GAME.END_TIME_EVENT, this.EndTime, this);
        clientEvent.off(MConst.EVENT_GAME.CREATE_EVENT, this.CreateEvent, this);
        clientEvent.off(EVENT_SEASON_PASS.UPDATE_UI_SEASON_PASS, this.UpdateUISeasonPass, this);
        this.unschedule(this.TryUnActiveNode);
    }

    private UpdateUISeasonPass() {
        // set the ui key , ui bg , ui progress in here
        let indexSeasonPass = DataSeasonPassSys.Instance.getIndexSeasonPass();

        if (indexSeasonPass == 0) {
            this.lbProgressSeasonPass.node.active = false;
            this.spIconReward.node.active = false;
            this.lbNumIconReward.node.active = false;
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
            this.progressBar.progress = 0;
            this.nIconLock.active = true;

            // gray UI
            // MConfigs.GrayAllNode(this.listNGray, this.matGray);
        } else {
            //unGray UI
            // MConfigs.UnGrayAllNode(this.listNGray);
            clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
            this.spIconReward.node.active = true;
            this.lbNumIconReward.node.active = true;
            this.lbProgressSeasonPass.node.active = true;
            this.nIconLock.active = false;
        }

        // this.progressBar.node.getComponent(Sprite).spriteFrame = MConfigResourceUtils.getBgSeasonPass(indexSeasonPass);
        // this.progressBar.node.children[0].getComponent(Sprite).spriteFrame = MConfigResourceUtils.getProgressSeasonPass(indexSeasonPass);
    }

    private EndTime(type: TYPE_EVENT_GAME) {
        if (type == TYPE_EVENT_GAME.SEASON_PASS && !DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            // this.schedule(this.TryUnActiveNode, 0.5, macro.REPEAT_FOREVER, 0);
        }
    }

    private CreateEvent(typeEvent: TYPE_EVENT_GAME) {
        if (typeEvent != TYPE_EVENT_GAME.SEASON_PASS) return;
        this.lbProgressSeasonPass.node.active = true;
        this.lbNumIconReward.node.active = true;
        this.spIconReward.node.active = true;

        this.lbProgressSeasonPass.string = `0/1`;
        this.progressBar.progress = 0;
        this.UpdateUISeasonPass();
    }

    private TryUnActiveNode() {
        if (!this._isPlayingAnim) {
            this.unschedule(this.TryUnActiveNode);
            // this.node.active = false;
            // set the node can not click to open event
            this.node.getComponent(Button).interactable = false;
        }
    }

    public async SetUp(oldProgress: number, needSetUpNextReward: boolean = true) {
        // Set UI with old data
        const dataOld = DataSeasonPassSys.Instance.getProgressAndLevel(oldProgress);
        const oldLevel = dataOld.level;
        const oldRightProgressAtLevel = dataOld.progress;
        const maxProgressOldLevel = DataSeasonPassSys.Instance.GetMaxStarAtLevel(oldLevel);
        this.progressBar.progress = oldRightProgressAtLevel / maxProgressOldLevel;
        this.lbProgressSeasonPass.string = `${oldRightProgressAtLevel}/${maxProgressOldLevel}`;

        this._oldProgress = oldProgress;

        if (DataEventsSys.Instance.IsLockEvent(TYPE_EVENT_GAME.SEASON_PASS)) {
            this.lbNumIconReward.string = 'LOCK';
        } else if (needSetUpNextReward) {
            this.SetUpNextReward(oldLevel);
            this.UpdateUISeasonPass();
            if (this.uiBlinh != null && !this.uiBlinh.IsInit()) {
                this.uiBlinh.InitParticle();
            }
        }

        // set up has prize not receive turn on notification
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
    }

    public async ReceivedKeySeasonPass(numberKey: number) {
        this._isPlayingAnim = true;

        if (numberKey == 0) { this._isPlayingAnim = false; return; }

        // // =========================== WAY 1 ==============================
        // const posSwapKey = this.node.worldPosition.clone().add3f(0, -Utils.getSizeWindow().y / 2, 0);

        // let listPosEndPhase2: Vec3[] = [];
        // let listPosEndPhase1: Vec3[] = [];
        // const highPhase2 = 20;
        // // spawn loc for key move prepare
        // for (let i = 0; i < numberKey; i++) {
        //     let nRandomLocX = randomRangeInt(-30, 30);
        //     let nRandomLocY = randomRangeInt(-30, 30);
        //     listPosEndPhase2.push(posSwapKey.clone().add3f(nRandomLocX, nRandomLocY, 0));
        // }
        // for (let i = 0; i < numberKey; i++) {
        //     let locX = listPosEndPhase2[i].x / 2;
        //     listPosEndPhase1.push(posSwapKey.clone().add3f(locX, highPhase2, 0));
        // }

        // // generate Key to the node temp gen play anim move to this node
        // const posEnd = this.nAnimKey.worldPosition.clone();
        // for (let i = 0; i < numberKey; i++) {
        //     let nKey = new Node();
        //     nKey.addComponent(UITransform);
        //     nKey.addComponent(Sprite);
        //     nKey.scale = Vec3.ZERO;
        //     nKey.setParent(this.nTemp);
        //     nKey.worldPosition = listPosEndPhase2[i].clone();

        //     const WPosS = listPosEndPhase2[i].clone();
        //     const WPosE = posEnd;
        //     const WMidPos = new Vec3(posEnd.x, WPosS.y);
        //     let listWPos = Bezier.GetListPointsToTween3(10, WPosS, WMidPos, WPosE);
        //     if (i != numberKey - 1) {
        //         (async () => {
        //             await AniTweenSys.Scale(nKey, Vec3.ONE, 0.3);
        //             await Utils.delay(0.2 * 1000);
        //             await AniTweenSys.TweenToListVec3_2(nKey, listWPos);
        //             nKey.destroy();
        //         })();
        //         await Utils.delay(0.05 * 1000);
        //     } else {
        //         await AniTweenSys.Scale(nKey, Vec3.ONE, 0.3);
        //         await Utils.delay(0.2 * 1000);
        //         await AniTweenSys.TweenToListVec3_2(nKey, listWPos);
        //         nKey.destroy();
        //         await this.ReceivedKeyAnimProgress(numberKey);
        //     }
        // }

        // =========================== WAY 2 ==============================
        await this.ReceivedKeyAnimProgress_2(numberKey);

        this.SetUp(DataSeasonPassSys.Instance.GetTotalProgress(), false);

        this._isPlayingAnim = false;
    }

    private async ReceivedKeyAnimProgress(numberKey: number) {

        // MUST REMEMBER IN CASE RECEIVE ANIM BUT THE TIME IS DONE => YOU MUST WAIT RECEIVE KEY DONE THEN YOU CAN TURN OFF THE BATTLE PASS
        //do not worry the data was saved when player play done the game => so all you need in here just update UI not the data
        const timeAnim = 1.5;
        const dataNow = DataSeasonPassSys.Instance.GetLevelNow();
        const levelRightNow = dataNow.level;

        const dataOld = DataSeasonPassSys.Instance.getProgressAndLevel(this._oldProgress);
        const oldProgressRightAtLevel = dataOld.progress;
        const oldLevel = dataOld.level;
        const maxProgressOldLevel = DataSeasonPassSys.Instance.GetMaxStarAtLevel(oldLevel);
        const nowProgressRightAtLevel = dataNow.progress;

        // console.log(
        //     "dataOld", dataOld, '\n',
        //     "oldProgressRightAtLevel", oldProgressRightAtLevel, '\n',
        //     "oldLevel", oldLevel, '\n',
        //     "maxProgressOldLevel", maxProgressOldLevel, '\n',
        //     "dataNow", dataNow, '\n',
        //     "nowProgressRightAtLevel", nowProgressRightAtLevel, '\n'
        // );


        // //test
        // const oldProgressRightAtLevel = 0;
        // const oldLevel = 0;
        // const maxProgressOldLevel = 1;
        // const nowProgressRightAtLevel = 1;
        // const levelRightNow = 2;

        // case 1 : new number key not enough to reach max progress
        if (oldProgressRightAtLevel + numberKey < maxProgressOldLevel) {
            this.TweenLabel(oldProgressRightAtLevel, nowProgressRightAtLevel - oldProgressRightAtLevel, maxProgressOldLevel, timeAnim);
            await this.TweenProgress(oldProgressRightAtLevel / maxProgressOldLevel, nowProgressRightAtLevel / maxProgressOldLevel, timeAnim);
        }

        // case 2 : new number key is enough to reach max progress
        else {
            const levelIncrease = levelRightNow - oldLevel;
            for (let i = 0; i <= levelIncrease; i++) {
                let timeAnimEachLevel = timeAnim / (levelIncrease + 1);
                if (i == 0) {
                    // const trueEndingProgress = (maxProgressOldLevel - oldProgressRightAtLevel) / maxProgressOldLevel;
                    this.TweenLabel(oldProgressRightAtLevel, maxProgressOldLevel - oldProgressRightAtLevel, maxProgressOldLevel, timeAnimEachLevel);
                    await this.TweenProgress(oldProgressRightAtLevel / maxProgressOldLevel, 1, timeAnimEachLevel);
                    // console.log("11111", oldProgressRightAtLevel / maxProgressOldLevel, 1);
                    // this.AnimReceivePrize(oldLevel);
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
                    this.SetUpNextReward(oldLevel + 1);
                }
                else if (i == levelIncrease) {
                    const dataNow = DataSeasonPassSys.Instance.GetLevelNow();

                    let maxProgressAtThisLevel = DataSeasonPassSys.Instance.GetMaxStarAtLevel(dataNow.level);
                    const trueEndingProgress = dataNow.progressBar;
                    this.TweenLabel(0, nowProgressRightAtLevel, maxProgressAtThisLevel, timeAnimEachLevel);
                    // console.log("22222", trueEndingProgress);
                    await this.TweenProgress(0, trueEndingProgress, timeAnimEachLevel);

                    // check if you can receive next level
                    if (levelRightNow == DataSeasonPassSys.Instance.GetMaxLevel() - 1) {
                        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
                        // this.AnimReceivePrize(oldLevel + i);
                    }
                }
                else {
                    let maxProgressAtThisLevel = DataSeasonPassSys.Instance.GetMaxStarAtLevel(oldLevel + i);
                    this.TweenLabel(0, maxProgressAtThisLevel, maxProgressAtThisLevel, timeAnimEachLevel);
                    await this.TweenProgress(0, 1, timeAnimEachLevel);
                    // console.log("3333");
                    // this.AnimReceivePrize(oldLevel + i);
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS);
                    this.SetUpNextReward(oldLevel + 1 + i);
                }
            }
        }
    }

    private async ReceivedKeyAnimProgress_2(numberKey: number) {
        // chỉ cần play anim là đc
        let nAnimKey = this.nAnimKey.children[0];
        if (nAnimKey == null) return;
        const comAnim = nAnimKey.getComponent(AnimPrefabsBase);
        comAnim.PlayAnim(NameAnimIconHome_Receive.seasonPass, false);
        await Utils.delay(comAnim.GetTimeAnim(NameAnimIconHome_Receive.seasonPass) * 1000);
        this.ReceivedKeyAnimProgress(numberKey);
    }

    /**
     * remember this func just only use for update UI not for logic data
     * @param level 
     */
    private async AnimReceivePrize(level: number) {
        // reset the progress and update UI
        // 1 : know what type prize you receive
        // 2 : move the prize or dispatch right event to match the prize
        const prizeReceive: IPrize = DataSeasonPassSys.Instance.GetListPrizeAtLevel(level).free[0];
        const wPosS = this.spIconReward.node.worldPosition.clone();
        let wPosE = Vec3.ZERO;
        let canNextLogic = false;
        switch (prizeReceive.typePrize) {
            case TYPE_PRIZE.MONEY:
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_COIN, (wPosUICoin: Vec3) => {
                    canNextLogic = true;
                    wPosE = wPosUICoin;
                })
                await Utils.WaitReceivingDone(() => { return canNextLogic })
                break;
            case TYPE_PRIZE.TICKET:
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_TICKET, (wPosUITicket: Vec3) => {
                    canNextLogic = true;
                    wPosE = wPosUITicket;
                })
                await Utils.WaitReceivingDone(() => { return canNextLogic })
            default:
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_UI_BTN_PLAY, (wPosBtnPlay: Vec3) => {
                    canNextLogic = true;
                    wPosE = wPosBtnPlay;
                })
                await Utils.WaitReceivingDone(() => { return canNextLogic })
                break;
        }
        const timeMove = 0.8;
        const useBezier = true;
        clientEvent.dispatchEvent(MConst.EVENT.PLAY_ANIM_RECEIVE_IPRIZE_LOBBY, prizeReceive, wPosS, wPosE, useBezier, 'SeasonPass', timeMove);
        await Utils.delay(timeMove * 1000 + 0.1);
    }

    private TweenProgress(baseProgress: number, endValue: number, timeAnim: number) {
        let self = this;
        const increaseValue = endValue - baseProgress;
        return new Promise<void>(resolve => {
            tween(this.progressBar.node)
                .to(timeAnim, {}, {
                    easing: 'smooth', onUpdate(target, ratio) {
                        self.progressBar.progress = baseProgress + increaseValue * ratio;
                    },
                })
                .call(resolve)
                .start();
        })
    }

    private TweenLabel(baseProgress: number, increaseValue: number, maxProgressAtLevel: number, timeAnim: number) {
        let self = this;

        tween(this.lbProgressSeasonPass.node)
            .to(timeAnim - 0.1, {}, {
                easing: 'smooth', onUpdate(target, ratio) {
                    self.lbProgressSeasonPass.string = `${Math.floor(baseProgress + increaseValue * ratio)}/${maxProgressAtLevel}`;
                },
            })
            .start();
    }

    private SetUpNextReward(indexLevel: number) {
        // set up next reward
        let listPrize: IPrize[] = DataSeasonPassSys.Instance.GetListPrizeAtLevel(indexLevel).free;
        const dataPrize = listPrize[0];
        let resultLb = '';
        switch (dataPrize.typeReceivePrize) {
            case TYPE_RECEIVE.NUMBER:
                resultLb = `x${dataPrize.value}`;
                break;
            case TYPE_RECEIVE.TIME_HOUR:
                resultLb = `${dataPrize.value}h`;
                break;
            case TYPE_RECEIVE.TIME_MINUTE:
                resultLb = `${dataPrize.value}m`;
                break;
        }

        this.lbNumIconReward.string = resultLb;
        const indexKeyBattlePass = DataSeasonPassSys.Instance.getIndexSeasonPass();
        // bạn có thể custom góc quay cho phù hợp với UI
        // if (dataPrize.typePrize == TYPE_PRIZE.LIGHTNING) {
        //     this.spIconReward.node.angle = 17;
        // } else {
        //     this.spIconReward.node.angle = 0;
        // }

        // switch (dataPrize.typePrize) {
        //     case TYPE_PRIZE.DOUBLE_KEY_SEASON_PASS:
        //         this.nLbX2Key.active = true;
        //         this.nLbX2Key.getComponent(Label).outlineColor = DataSeasonPassSys.Instance.getColorOutlineTextX2();
        //         break;
        //     default:
        //         this.nLbX2Key.active = false;
        //         break;
        // }

        MConfigResourceUtils.setImageItem(this.spIconReward, dataPrize.typePrize, dataPrize.typeReceivePrize, indexKeyBattlePass);

        const timeScale = 0.1;
        tween(this.lbNumIconReward.node)
            .to(timeScale / 2, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'smooth' })
            .to(timeScale / 2, { scale: new Vec3(1, 1, 1) }, { easing: 'smooth' })
            .start();
        tween(this.spIconReward.node)
            .to(timeScale / 2, { scale: new Vec3(1, 1, 1) }, { easing: 'smooth' })
            .to(timeScale / 2, { scale: new Vec3(0.7, 0.7, 0.7) }, { easing: 'smooth' })
            .start();
    }

    private btnTest() {
        if (!this._isPlayingAnim) {
            this._isPlayingAnim = true;
            const numProgressAdd = 5;
            // DataSeasonPassSys.Instance.AddProgress(true, numProgressAdd);
            this.ReceivedKeySeasonPass(numProgressAdd);
        }
    }
}


