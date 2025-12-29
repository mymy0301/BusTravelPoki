import { _decorator, Button, Component, Label, macro, Material, Node, ProgressBar, randomRangeInt, RealCurve, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { DataLobbyJson, IPrize, TYPE_EVENT_GAME } from '../../Utils/Types';
import { DataEventsSys } from '../DataEventsSys';
import { UIBlinh } from './UIBlinh';
import { CONFIG_LPr, EVENT_LEVEL_PROGRESS, STATE_EVENT_LEVEL_PROGRESS } from '../OtherUI/UILevelProgression/TypeLevelProgress';
import { DataLevelProgressionSys } from '../../DataBase/DataLevelProgressionSys';
import { Utils } from '../../Utils/Utils';
import { AnimReceiveLevelProgresion } from './AnimReceive/AnimReceiveLevelProgresion';
import { UILobbySys } from './UILobbySys';
import { DataLobbyJsonSys } from '../DataLobbyJsonSys';
const { ccclass, property } = _decorator;

@ccclass('LevelProgressionUI')
export class LevelProgressionUI extends Component {
    @property(Label) lbProgressLevelProgression: Label;
    @property(Label) lbNumIconReward: Label;
    @property(Node) nTemp: Node;
    @property(Node) nGroupIconKey: Node[] = [];
    @property(Sprite) spIconKey: Sprite;
    @property(ProgressBar) progressBar: ProgressBar;
    @property(Sprite) spIconReward: Sprite;
    @property(Node) nIconLock: Node;
    @property(UIBlinh) uiBlinh: UIBlinh;
    @property(Node) nAnimKey: Node;
    @property(Node) nKey: Node;
    @property(RealCurve) rvScale: RealCurve = new RealCurve();

    @property(Sprite) listSpGray: Sprite[] = [];
    @property(Label) listLbGray: Label[] = [];
    @property(Material) matGray: Material;

    @property(AnimReceiveLevelProgresion) animLPr: AnimReceiveLevelProgresion;

    private _isPlayingAnim: boolean = false;
    private _oldProgress = 0;


    //============================================
    //#region base
    protected onLoad(): void {
        clientEvent.on(EVENT_LEVEL_PROGRESS.INIT_NEW_EVENT, this.OnEventInit, this);
        clientEvent.on(EVENT_LEVEL_PROGRESS.UPDATE_UI_LEVEL_PROGRESSION, this.UpdateUILPr, this);


    }

    protected onDestroy(): void {
        clientEvent.off(EVENT_LEVEL_PROGRESS.INIT_NEW_EVENT, this.OnEventInit, this);
        clientEvent.off(EVENT_LEVEL_PROGRESS.UPDATE_UI_LEVEL_PROGRESSION, this.UpdateUILPr, this);
        this.unschedule(this.TryUnActiveNode);
    }

    protected start(): void {

        switch (true) {
            // case có anim unlock tut event levelProgress
            case !DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION) && UILobbySys.Instance.logicCheckTutInLobby.JustCheckLogicEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION):
                DataLevelProgressionSys.Instance.GetSfKeyEvent(1);
                break;
            // case event đang chưa unlock tut dc
            case DataLevelProgressionSys.Instance.STATE == STATE_EVENT_LEVEL_PROGRESS.LOCK:
                this.SetUp(0);
                break;
            // case event đã unlock tut
            default:
                const progressOld = DataLobbyJsonSys.Instance.GetLevelProgress();
                this.SetUp(progressOld);
                break;
        }
    }

    // protected start(): void {
    //     (async () => {
    //         await Utils.delay(2000);
    //         this.animLPr.PlayAnim(async () => {
    //             this.PlayAnimScaleNKey();
    //             // console.log("1111");
    //             await this.ReceivedKeyAnimProgress(1);
    //         });
    //     })();
    // }
    //#endregion base
    //============================================


    //============================================
    //#region private
    private TryUnActiveNode() {
        if (!this._isPlayingAnim) {
            this.unschedule(this.TryUnActiveNode);
            this.node.getComponent(Button).interactable = false;
        }
    }

    private UpdateUIProgress(progressSet: number) {
        // Set UI with old data
        const dataOld = DataLevelProgressionSys.Instance.GetInfoToShowUI(progressSet);
        const ratioOld = dataOld.progressRemaining / dataOld.progressTotal;
        this.progressBar.progress = ratioOld;
        this.lbProgressLevelProgression.string = `${dataOld.progressRemaining}/${dataOld.progressTotal}`;
    }

    public async UpdateSfKey(useImgNextKey: boolean = false) {
        try {
            const idKey = !useImgNextKey ? -1 : DataLevelProgressionSys.Instance.GetIdEventNow() + 1;
            const sfKey = await DataLevelProgressionSys.Instance.GetSfKeyEvent(idKey);
            this.spIconKey.spriteFrame = sfKey;
        } catch (e) {

        }
    }

    private TryGenBlink() {
        // init blink
        if (this.uiBlinh != null && !this.uiBlinh.IsInit()) {
            this.uiBlinh.InitParticle();
        }
    }

    private SetGrayUI(isGray: boolean) {
        this.listSpGray.forEach(item => item.grayscale = isGray);
        this.listLbGray.forEach(lb => lb.customMaterial = isGray ? this.matGray : null)
    }

    //#endregion private
    //============================================

    public async SetUp(oldProgress: number) {
        this._oldProgress = oldProgress;

        // get state event and update event suit with it
        const stateEventNow = DataLevelProgressionSys.Instance.STATE;
        switch (stateEventNow) {
            case STATE_EVENT_LEVEL_PROGRESS.LOCK:
                this.ShowUILock(0);
                break;
            case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN:
                this.TryGenBlink();
                this.ShowUIWaitToJoin(0);
                break;
            case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_RECEIVE_END_EVENT:
                this.TryGenBlink();
                this.ShowUIJoin(oldProgress);
                break;
            case STATE_EVENT_LEVEL_PROGRESS.JOINING:
                this.TryGenBlink();
                this.ShowUIJoin(oldProgress);
                break;
        }

        // set up has prize not receive turn on notification
        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
    }

    public async ReceivedKeyLevelProgression(numberKey: number) {
        this._isPlayingAnim = true;

        if (numberKey == 0) { this._isPlayingAnim = false; return; }

        await this.ReceivedKeyAnimProgress_2(numberKey);

        this.SetUp(DataLevelProgressionSys.Instance.GetProgressNow());

        this._isPlayingAnim = false;
    }

    private async ReceivedKeyAnimProgress(numberKey: number) {

        // MUST REMEMBER IN CASE RECEIVE ANIM BUT THE TIME IS DONE => YOU MUST WAIT RECEIVE KEY DONE THEN YOU CAN TURN OFF THE BATTLE PASS
        //do not worry the data was saved when player play done the game => so all you need in here just update UI not the data
        const timeAnim = 1.5;
        const progressNow = DataLevelProgressionSys.Instance.GetProgressNow();
        const infoUINow = DataLevelProgressionSys.Instance.GetInfoToShowUI(progressNow);
        // const infoUINow = DataLevelProgressionSys.Instance.GetInfoToShowUI(this._oldProgress + numberKey);
        const infoUIOld = DataLevelProgressionSys.Instance.GetInfoToShowUI(this._oldProgress);

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
        if (infoUIOld.progressRemaining + numberKey < infoUIOld.progressTotal) {
            this.TweenLabel(infoUIOld.progressRemaining, infoUINow.progressRemaining - infoUIOld.progressRemaining, infoUINow.progressTotal, timeAnim);
            await this.TweenProgress(infoUIOld.progressRemaining / infoUIOld.progressTotal, infoUINow.progressRemaining / infoUINow.progressTotal, timeAnim);
        }
        // case 2 : new number key is enough to reach max progress
        else {
            const levelIncrease = infoUINow.levelReach - infoUIOld.levelReach;
            for (let i = 0; i <= levelIncrease; i++) {
                let timeAnimEachLevel = timeAnim / (levelIncrease + 1);
                if (i == 0) {
                    this.TweenLabel(infoUIOld.progressRemaining, infoUIOld.progressTotal - infoUIOld.progressRemaining, infoUIOld.progressTotal, timeAnimEachLevel);
                    await this.TweenProgress(infoUIOld.progressRemaining / infoUIOld.progressTotal, 1, timeAnimEachLevel);
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
                    this.SetUpNextReward(infoUIOld.levelReach + 1);
                }
                else if (i == levelIncrease) {
                    this.TweenLabel(0, infoUINow.progressRemaining, infoUINow.progressTotal, timeAnimEachLevel);
                    await this.TweenProgress(0, infoUINow.progressRemaining / infoUINow.progressTotal, timeAnimEachLevel);

                    // check if you can receive next level
                    if (infoUINow.levelReach == CONFIG_LPr.MAX_PRIZE_LEVEL_PROGRESSION) {
                        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
                    }
                }
                else {
                    const levelCheck = infoUIOld.levelReach + i;
                    const infoPrizeJustPass = DataLevelProgressionSys.Instance.GetAllDataPrizeJson()[levelCheck - 1];
                    const infoUIAtLevel = DataLevelProgressionSys.Instance.GetInfoToShowUI(infoPrizeJustPass.require_progress);
                    this.TweenLabel(0, infoUIAtLevel.progressTotal, infoUIAtLevel.progressTotal, timeAnimEachLevel);
                    await this.TweenProgress(0, 1, timeAnimEachLevel);
                    clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
                    this.SetUpNextReward(levelCheck + 1);
                }
            }
        }
    }

    private async ReceivedKeyAnimProgress_2(numberKey: number) {
        // scale ic
        // const keyScale: Vec3 = Vec3.ONE.clone().multiplyScalar(0.6);
        // await new Promise<void>(resolve => {
        //     tween(this.spIconKey.node)
        //         .to(0.5, { scale: Vec3.ONE.clone().multiplyScalar(0.8) })
        //         .to(0.5, { scale: keyScale })
        //         .call(() => { resolve() })
        //         .start();
        // });
        // this.ReceivedKeyAnimProgress(numberKey);

        // chỉ cần play anim là đc
        // let nAnimKey = this.nAnimKey.children[0];
        // if (nAnimKey == null) return;
        // const comAnim = nAnimKey.getComponent(AnimPrefabsBase);
        // comAnim.PlayAnim(NameAnimIconHome_Receive.seasonPass, false);
        // const timeFirstItemMoveToTheRoot = 1.2 / comAnim.GetTimeScale();
        // await Utils.delay(timeFirstItemMoveToTheRoot * 1000);
        // await this.ReceivedKeyAnimProgress(numberKey);

        let doneAnim = false;
        this.animLPr.PlayAnim(async () => {
            this.PlayAnimScaleNKey();
            await this.ReceivedKeyAnimProgress(numberKey);
            doneAnim = true;
        })

        await Utils.WaitReceivingDone(() => doneAnim);
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
        // console.log(baseProgress, increaseValue, Math.floor(baseProgress + increaseValue * 0.5));

        tween(this.lbProgressLevelProgression.node)
            .to(timeAnim - 0.1, {}, {
                easing: 'smooth', onUpdate(target, ratio) {
                    self.lbProgressLevelProgression.string = `${Math.floor(baseProgress + increaseValue * ratio)}/${maxProgressAtLevel}`;
                },
            })
            .start();
    }

    private PlayAnimScaleNKey(numberRepeat: number = 4) {
        const timeScale = 0.23;
        const self = this;
        let tweenRepeat = tween(this.nKey)
            .to(timeScale, {}, {
                onUpdate(target, ratio) {
                    const newScale = self.rvScale.evaluate(ratio);
                    self.nKey.scale = Vec3.ONE.clone().multiplyScalar(newScale);
                },
            })

        tween(this.nKey)
            .repeat(numberRepeat, tweenRepeat)
            .start();
    }

    private SetUpNextReward(level: number, useAnim: boolean = true) {
        // set up next reward
        const listPrizeJson = DataLevelProgressionSys.Instance.GetAllDataPrizeJson()
        if (level - 1 < 0 || level - 1 >= listPrizeJson.length) { return; }
        let listPrize: IPrize[] = listPrizeJson[level - 1].listPrize;
        const dataPrize = listPrize[0];
        this.lbNumIconReward.string = dataPrize.GetStringValue_2();
        const idEventLevelProgress = DataLevelProgressionSys.Instance.GetIdEventNow();

        MConfigResourceUtils.setImageItem(this.spIconReward, dataPrize.typePrize, dataPrize.typeReceivePrize, idEventLevelProgress);

        const timeScale = 0.1;
        if (useAnim) {
            tween(this.lbNumIconReward.node)
                .to(timeScale / 2, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'smooth' })
                .to(timeScale / 2, { scale: new Vec3(1, 1, 1) }, { easing: 'smooth' })
                .start();
            tween(this.spIconReward.node)
                .to(timeScale / 2, { scale: new Vec3(1, 1, 1) }, { easing: 'smooth' })
                .to(timeScale / 2, { scale: new Vec3(0.7, 0.7, 0.7) }, { easing: 'smooth' })
                .start();
        }
    }

    private btnTest() {
        if (!this._isPlayingAnim) {
            this._isPlayingAnim = true;
            const numProgressAdd = 5;
            this.ReceivedKeyAnimProgress_2(numProgressAdd);
        }
    }

    //==============================================================
    //#region UI
    private ShowUILock(progressSet: number) {
        this.nGroupIconKey.forEach(item => item.active = false);
        this.progressBar.progress = 0;
        this.nIconLock.active = true;

        this.SetGrayUI(true);

        this.SetUpNextReward(1);

        this.UpdateUIProgress(progressSet);

        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
    }

    private ShowUIJoin(progressSet: number) {
        this.nIconLock.active = false;

        this.SetGrayUI(false);

        // udpate lb progress
        this.UpdateUIProgress(progressSet);

        // set up prize
        const levelReach = DataLevelProgressionSys.Instance.GetInfoToShowUI(progressSet).levelReach;
        this.SetUpNextReward(levelReach, false);

        // update key
        this.nGroupIconKey.forEach(item => item.active = true);
        this.UpdateSfKey();

        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
    }

    private ShowUIWaitToJoin(progressSet: number) {
        this.nIconLock.active = false;

        this.SetGrayUI(false);

        // set up prize
        this.SetUpNextReward(1);

        // udpate lb progress
        this.UpdateUIProgress(progressSet);

        // update key
        this.nGroupIconKey.forEach(item => item.active = true);
        this.UpdateSfKey(true);

        clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PROGRESSION);
    }
    //#endregion UI
    //==============================================================


    //==============================================================
    //#region func listen
    private OnEventInit(autoUpdateUINow: boolean = true) {
        // update UI
        this.ShowUIJoin(0);
    }

    private UpdateUILPr() {
        // get state event to update suitable
        const stateEvent = DataLevelProgressionSys.Instance.STATE;
        switch (stateEvent) {
            case STATE_EVENT_LEVEL_PROGRESS.WAIT_TO_JOIN:
                this.ShowUIWaitToJoin(0);
                break;
        }
    }
    //#endregion func listen
    //==============================================================
}


