import { _decorator, Component, Label, Node, ProgressBar, tween, Tween } from 'cc';
import { DataSpinSys } from '../../../DataBase/DataSpinSys';
import { STATE_UI_PRIZE_SPIN, UIPrizeProgressSpinReward } from './UIPrizeProgressSpinReward';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('ProgressCummulativeReward')
export class ProgressCummulativeReward extends Component {
    @property(ProgressBar) pbSpin: ProgressBar;
    @property(Label) lbProgress: Label;
    @property([Node]) listNPrizeProgressSpinReward: Node[] = [];

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SPIN.CHECK_RESET_30_DAYS_SPIN, this.CheckReset30DaysSpin, this);
    }

    protected onDestroy(): void {
        clientEvent.on(MConst.EVENT_SPIN.CHECK_RESET_30_DAYS_SPIN, this.CheckReset30DaysSpin, this);
    }

    private CheckReset30DaysSpin() {
        // check all prize was change to state unlock all
        let unlockAll: boolean = true;
        for (let i = 0; i < this.listNPrizeProgressSpinReward.length; i++) {
            if (this.listNPrizeProgressSpinReward[i].getComponent(UIPrizeProgressSpinReward).State != STATE_UI_PRIZE_SPIN.RECEIVED) {
                unlockAll = false;
                break;
            }
        }

        // nếu như đã unlock hết 
        // emit reset data progress
        // update lại UI cho phù hợp
        if (unlockAll) {
            DataSpinSys.Instance.Reset30DaySpin();

            this.UpdateForce();
        }
    }

    public async UpdateUIProgress(playAnim: boolean = false) {
        // set progress
        let progressSpinDone = DataSpinSys.Instance.ProgressSpinNow();
        const MAX_PROGRESS_SPIN = DataSpinSys.Instance.GetMaxSpin();

        //=========================
        // update progress bar
        //=========================
        if (playAnim) {
            Tween.stopAllByTarget(this.pbSpin);
            const timeIncreaseBar = 0.5;
            const self = this;
            const oldProgress = parseInt(this.lbProgress.string.slice(1));
            const distanceWithOldProgress = progressSpinDone - oldProgress;
            tween(this.pbSpin)
                .to(timeIncreaseBar, { progress: progressSpinDone / MAX_PROGRESS_SPIN }, {
                    easing: 'smooth', onUpdate(target, ratio) {
                        self.lbProgress.string = `x${oldProgress + Math.floor(distanceWithOldProgress * ratio)}`;
                    },
                })
                .start();
        }

        //=========================
        // in case not play anim
        //=========================
        else {
            this.UpdateForce();
        }
    }

    private UpdateForce() {
        let progressSpinDone = DataSpinSys.Instance.ProgressSpinNow();
        const MAX_PROGRESS_SPIN = DataSpinSys.Instance.GetMaxSpin();

        this.pbSpin.progress = progressSpinDone / MAX_PROGRESS_SPIN;
        this.lbProgress.string = `${progressSpinDone}/${MAX_PROGRESS_SPIN}`;
        // emit event to update UI Spin
        const infoPrizeSpin = DataSpinSys.Instance.getJsonProgressSpin();
        this.listNPrizeProgressSpinReward.forEach((node: Node, index: number) => {
            const isReceivePrize: boolean = DataSpinSys.Instance.IsPrizeProgressWasReceive(index);
            const canReceivePrize: boolean = progressSpinDone >= infoPrizeSpin[index].progress;
            let state;
            switch (true) {
                case isReceivePrize && canReceivePrize:
                    state = STATE_UI_PRIZE_SPIN.RECEIVED;
                    break;
                case !isReceivePrize && canReceivePrize:
                    state = STATE_UI_PRIZE_SPIN.WAIT_TO_RECEIVE;
                    break;
                default:
                    state = STATE_UI_PRIZE_SPIN.CAN_NOT_RECEIVE;
                    break;
            }

            node.getComponent(UIPrizeProgressSpinReward).UpdateUIVisual(infoPrizeSpin[index], state);
        })
    }
}


