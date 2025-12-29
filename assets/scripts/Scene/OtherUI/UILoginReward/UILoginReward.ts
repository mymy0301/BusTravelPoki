import { _decorator, Component, Label, Node, Prefab, ProgressBar, RealCurve, Sprite, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { instanceOfIOpenUIBaseWithInfo, instanceOfIUIKeepTutAndReceiveLobby, IUIKeepTutAndReceiveLobby } from '../../../Utils/Types';
import { DataLoginRewardSys } from '../../../DataBase/DataLoginRewardSys';
import { ItemLoginReward, STATE_ITEM_LOGIN_REWARD } from './ItemLoginReward';
import { STATE_UI_PRIZE_LOGIN_REWARD, UIPrizeProgressLoginReward } from './UIPrizeProgressLoginReward';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { Utils } from '../../../Utils/Utils';
import { EVENT_TUT_LOBBY } from '../UITutorialInGame/TypeTutorialInLobby';
const { ccclass, property } = _decorator;

@ccclass('UILoginReward')
export class UILoginReward extends UIBaseSys {
    @property(ProgressBar) pbBar: ProgressBar;
    @property(Node) nBtnReceive: Node;
    @property(Node) nCar: Node;
    @property(RealCurve) rcAnimProgress: RealCurve = new RealCurve();

    // the lass item of this list always the item biggest
    @property([ItemLoginReward]) itemLoginReward: ItemLoginReward[] = [];

    @property([UIPrizeProgressLoginReward]) uiPrizeProgressLoginReward: UIPrizeProgressLoginReward[] = [];

    private _itemReceiveToday: ItemLoginReward = null;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_LOGIN_REWARD.INCREASE_PROGRESS, this.IncreaseProgress, this);
        clientEvent.on(MConst.EVENT_LOGIN_REWARD.CHECK_RESET_30_DAYS_REWARD, this.TryReset30DaysReward, this);
        clientEvent.on(MConst.EVENT_LOGIN_REWARD.HIDE_EVENT, this.HideEvent, this);
        clientEvent.on(MConst.EVENT_LOGIN_REWARD.SHOW_EVENT, this.ShowEvent, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_LOGIN_REWARD.INCREASE_PROGRESS, this.IncreaseProgress, this);
        clientEvent.off(MConst.EVENT_LOGIN_REWARD.CHECK_RESET_30_DAYS_REWARD, this.TryReset30DaysReward, this);
        clientEvent.off(MConst.EVENT_LOGIN_REWARD.HIDE_EVENT, this.HideEvent, this);
        clientEvent.off(MConst.EVENT_LOGIN_REWARD.SHOW_EVENT, this.ShowEvent, this);
    }

    public async PrepareDataShow(): Promise<void> {
        this._itemReceiveToday = null;

        // check data custom is true or false to know is click from tutorial 
        if (instanceOfIOpenUIBaseWithInfo(this._dataCustom) && this._dataCustom.isShowInfo) {
            // this.onBtnShowInfo();
        }

        this.UpdateUISuitWithData();

        this.ShowEvent(true);
    }

    public async UIShowDone(): Promise<void> {
        let allPromise: Promise<void>[] = []
        try {
            // add the anim car and progress move done
            const progressNow = this.GetProgressNowToSet();
            allPromise.push(this.AnimIcreaseProgress(progressNow, 0));

            // check để xuất hiện button collect
            // check tích xanh ngày hôm nay
            // try catch vì trong trường hợp người chơi close trước khi chạy xong
            if (this._itemReceiveToday != null) {
                allPromise.push(
                    new Promise<void>(async resolve => {
                        this.nBtnReceive.active = true;
                        await Utils.delay(0.5 * 1000);
                        if (this != null || this._itemReceiveToday != null) {
                            this._itemReceiveToday.UpdateState(STATE_ITEM_LOGIN_REWARD.UNLOCK);
                        }
                    })
                )
            }

            // await all promise
            await Promise.all(allPromise);
        } catch (e) {

        }
    }

    public async UICloseDone(): Promise<void> {
        if (this._dataCustom != null) {
            const dataKeepTutAndReceive: IUIKeepTutAndReceiveLobby = this._dataCustom.find(data => instanceOfIUIKeepTutAndReceiveLobby(data));
            if (dataKeepTutAndReceive != null && dataKeepTutAndReceive.canKeepTutAndReceiveLobby) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }

        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.CHANGE_ENABLE_CHECK_LOGIC_TUT, true);
    }


    private UpdateUISuitWithData() {
        // reset UI to base
        this.ResetStatusBtnReceive();

        // check status for each item

        const progressPlayerNow = DataLoginRewardSys.Instance.GetProgressRewardLogin();
        const listPrizeCanReceiveThisWeekWithProgress = DataLoginRewardSys.Instance.GetListPrizeThisWeekWithProgress(progressPlayerNow);
        let indexWeek = DataLoginRewardSys.Instance.GetIndexWeek(progressPlayerNow);
        const isRewardPrizeToday = DataLoginRewardSys.Instance.isRewardLoginToDay();

        // trong trường hợp người chơi đã nhận thưởng hết tuần và họ chưa sẵn sàng nhận thưởng của tuần tiếp theo
        // thì ta sẽ hiển thị giao diện sao cho hiển thị đã nhận thưởng hết tuần cũ 
        if (isRewardPrizeToday && progressPlayerNow % 7 == 0) {
            indexWeek -= 1;
        }

        // prize top update auto on load
        // if receive prize will update manual by code

        // ============= update progress bar
        this.SetUIPreAnimProgress();

        // ============= update bottom which item can receive
        for (let i = 0; i < listPrizeCanReceiveThisWeekWithProgress.length; i++) {
            const listPrizeHas = listPrizeCanReceiveThisWeekWithProgress[i];
            const day = indexWeek * 7 + i;
            // nếu là ngày hôm nay thì unlock
            let state;
            switch (true) {
                case day == progressPlayerNow && !isRewardPrizeToday: state = STATE_ITEM_LOGIN_REWARD.UNLOCK; break;
                // bởi vì theo logic sẽ luôn tăng tiến độ khi nhận thưởng xong cho nên trong trường hợp này luôn là khóa
                case day == progressPlayerNow && isRewardPrizeToday: state = STATE_ITEM_LOGIN_REWARD.LOCK; break;
                case day < progressPlayerNow: state = STATE_ITEM_LOGIN_REWARD.IS_CLAIMED; break;
                case day > progressPlayerNow: state = STATE_ITEM_LOGIN_REWARD.LOCK; break;
            }

            // console.log(i, listPrizeHas[0]);

            if (state == STATE_ITEM_LOGIN_REWARD.UNLOCK) {
                this._itemReceiveToday = this.itemLoginReward[i];
            }

            this.itemLoginReward[i].UpdateUI(listPrizeHas[0], day, state == STATE_ITEM_LOGIN_REWARD.UNLOCK ? STATE_ITEM_LOGIN_REWARD.LOCK : state);
        }

        // hide other day
        for (let i = listPrizeCanReceiveThisWeekWithProgress.length; i < this.itemLoginReward.length; i++) {
            this.itemLoginReward[i].node.active = false;
        }
    }

    private ResetStatusBtnReceive() {
        this._itemReceiveToday = null;
        this.nBtnReceive.active = false;
    }


    //=====================================================
    //#region progress anim
    private GetProgressNowToSet(): number {
        const progressNow: number = DataLoginRewardSys.Instance.GetProgress30DaysReward();
        const totalProgress: number = DataLoginRewardSys.Instance.GetMaxProgress30DayReward();
        let progressBar = progressNow / totalProgress;
        progressBar = progressBar > 1 ? 1 : progressBar;

        return progressBar;
    }

    private SetUIPreAnimProgress() {
        this.pbBar.progress = 0;
        const posSetDefault = this.GetRightPosForCar(0);
        this.nCar.position = posSetDefault;
    }

    private GetRightPosForCar(progressBar: number): Vec3 {
        const nBar = this.pbBar.node.children[0];
        const posProgress: Vec3 = this.pbBar.node.position.clone();
        const posBar: Vec3 = nBar.position.clone();
        const widthBar: number = this.pbBar.totalLength * progressBar;

        const posReach = posProgress.add(posBar).add3f(widthBar, 0, 0);
        return posReach;
    }

    private AnimIcreaseProgress(progressNew: number, progressOld: number): Promise<void> {
        return new Promise<void>(resolve => {
            // check khác progress hay không? nếu giống nhau => resolve 
            if (progressNew == progressOld) { resolve() }

            //tween move car to the right pos
            const self = this;
            const timeMoveCar: number = 0.5;
            const posReach = this.GetRightPosForCar(progressNew);
            const distanceProgressOldAndNow = progressNew - progressOld;
            const posCarXOld = this.nCar.position.x;
            const distancePosOldAndNow = posReach.x - this.nCar.position.x;
            const rightPosY = this.nCar.position.y;
            tween(this.nCar)
                .to(timeMoveCar, {}, {
                    onUpdate(target, ratio) {
                        const rightPosX = distancePosOldAndNow * self.rcAnimProgress.evaluate(ratio);
                        const rightProgress = distanceProgressOldAndNow * self.rcAnimProgress.evaluate(ratio);
                        self.nCar.position = new Vec3(posCarXOld + rightPosX, rightPosY);
                        self.pbBar.progress = progressOld + rightProgress;
                    },
                })
                .call(() => {
                    this.pbBar.progress = progressNew;
                    resolve()
                })
                .start();
        })
    }
    //#endregion progress anim
    //=====================================================

    //=====================================================
    //#region button 
    onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UILoginReward");

        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LOGIN_REWARD, 1);
    }

    async onBtnReceivePrize() {
        LogEventManager.Instance.logButtonClick(`claim_daily`, "UILoginReward");

        if (this._itemReceiveToday == null)
            return;

        // ẩn ui này đi đợi đến khi nhận thưởng xong thì bật lại
        this.HideEvent();
        await this._itemReceiveToday.OnClickItem();
        this.ResetStatusBtnReceive();
        this.onBtnClose();
        // this.ShowEvent();
        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.NO_SPINE);
    }
    //#endregion button
    //=====================================================

    //=====================================================
    //#region func event
    private IncreaseProgress() {
        //increase progress
        const progressNow = this.GetProgressNowToSet();
        const progressProgressBarNow = this.pbBar.progress;
        if (progressNow > progressProgressBarNow) {
            this.AnimIcreaseProgress(progressNow, progressProgressBarNow);
        }

        // check can unlock prize => update UI
        clientEvent.dispatchEvent(MConst.EVENT_LOGIN_REWARD.ITEM.EVENT_UPDATE_UI);
    }

    private TryReset30DaysReward() {
        // check all prize was change to state unlock all
        let unlockAll: boolean = true;
        for (let i = 0; i < this.uiPrizeProgressLoginReward.length; i++) {
            if (this.uiPrizeProgressLoginReward[i].State != STATE_UI_PRIZE_LOGIN_REWARD.RECEIVED) {
                unlockAll = false;
                break;
            }
        }

        // nếu như đã unlock hết 
        // emit reset data progress
        // update lại UI cho phù hợp
        if (unlockAll) {
            DataLoginRewardSys.Instance.Reset30DayReward();

            this.uiPrizeProgressLoginReward.forEach(element => {
                element.UpdateDataForce();
            })

            // update lại progress
            this.SetUIPreAnimProgress();
        }
    }

    private HideEvent() {
        this.node.active = false;
    }

    private ShowEvent(force: boolean = false) {
        if (force) {
            this.node.active = true;
            this.node.getComponent(UIOpacity).opacity = 255;
            return;
        }

        const opa = this.node.getComponent(UIOpacity);
        opa.opacity = 155;

        this.node.active = true;

        tween(opa)
            .to(0.5, { opacity: 255 })
            .call(() => {
                const progressNow = this.GetProgressNowToSet();
                this.AnimIcreaseProgress(progressNow, this.pbBar.progress);
            })
            .start();
    }
    //#endregion func event
    //=====================================================
}


