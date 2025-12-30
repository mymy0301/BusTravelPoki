import { _decorator, Button, Component, Label, Material, Node } from 'cc';
import { CurrencySys } from '../../CurrencySys';
import { DataSpinSys } from '../../../DataBase/DataSpinSys';
import { MConfigs } from '../../../Configs/MConfigs';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { CountDownTimeGroup } from '../../../Common/CountDownTimeGroup';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('VisualSpin')
export class VisualSpin extends Component {
    // @property(Node) nBtnSpin_x10: Node;
    // @property(Node) nBtnSpin_x1: Node;
    @property(Node) nBtnWatchAds: Node;
    @property(Node) nBtnFree: Node;
    @property([Node]) listNGraySpin_x10: Node[] = [];
    @property([Node]) listNGrayWatchAds: Node[] = [];
    @property(Material) matGray: Material;

    @property(Label) lbBtnSpinAds: Label;
    @property(Label) lbBtnSpinAdsShadow: Label;
    @property(Label) lbReduceTimeSpin: Label;

    @property(CountDownTimeGroup) countDownTimeGroup: CountDownTimeGroup;
    @property(Node) nOnNormal: Node;
    @property(Node) nBgBtnWatchAds: Node;

    @property(Node) nNotiWatchAds: Node;

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_SPIN.UPDATE_LABEL_TIME_REDUCE_NEW_SPIN, this.UpdateLabelTimeReduceNewSpin, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_SPIN.UPDATE_LABEL_TIME_REDUCE_NEW_SPIN, this.UpdateLabelTimeReduceNewSpin, this);
    }

    private UpdateLabelTimeReduceNewSpin(time: string) {
        this.lbReduceTimeSpin.string = time;
    }

    public UpdateUI(whenPrepareShowUI: boolean = false) {
        // update ui Label
        let InsDataSpin = DataSpinSys.Instance;
        const currentSpinAds = InsDataSpin.getNumSpinAdsTodayWasUse();
        const remaingingSpinAds = MConfigs.MAX_SPIN_ADS_PER_DAY - currentSpinAds;
        this.lbBtnSpinAds.string = `Free(${remaingingSpinAds})`;
        this.lbBtnSpinAdsShadow.string = `Free(${remaingingSpinAds})`;
        this.UpdateVisualBtn();

        // check in case HasFreeSpinToday
        if (whenPrepareShowUI) {
            this.lbReduceTimeSpin.string = "Loading...";
        }
    }

    public UpdateVisualBtn() {
        // update x10 btn
        // if (CurrencySys.Instance.GetTicket() >= 10) {
        //     MConfigs.UnGrayAllNode(this.listNGraySpin_x10);
        // } else {
        //     MConfigs.GrayAllNode(this.listNGraySpin_x10, MConfigs.CloneMat(this.matGray));
        // }

        // update watch ads
        if (!DataSpinSys.Instance.IsMaxSpinAdsToday()) {
            this.nNotiWatchAds.active = true;
            MConfigs.UnGrayAllNode(this.listNGrayWatchAds);
        } else {
            this.nNotiWatchAds.active = false;
            MConfigs.GrayAllNode(this.listNGrayWatchAds, MConfigs.CloneMat(this.matGray));
        }

        // update which btn show
        if (DataSpinSys.Instance.HasFreeSpinToday()) {
            this.nBtnFree.active = true;
            // this.nBtnSpin_x1.active = false;
            this.nBtnWatchAds.active = false;
            // this.nBtnSpin_x10.active = false;
        } 
        // else if (CurrencySys.Instance.GetTicket() > 0) {
        //     // this.nBtnSpin_x1.active = true;
        //     this.nBtnWatchAds.active = false;
        //     this.nBtnFree.active = false;
        //     // this.nBtnSpin_x10.active = true;
        // } 
        else {
            // this.nBtnSpin_x1.active = false;
            this.nBtnFree.active = false;
            this.nBtnWatchAds.active = true;
            // this.nBtnSpin_x10.active = true;

            // check in time coolDown
            const lastTimeSpinAds = DataSpinSys.Instance.getTimeLastUseSpinAds();
            const canWatchAds = Utils.getSecondNow() >= lastTimeSpinAds + MConfigs.TIME_COOLDOWN_SPIN_ADS;
            if (canWatchAds && !DataSpinSys.Instance.IsMaxSpinAdsToday()) {
                this.countDownTimeGroup.HideNode();
                this.nOnNormal.active = true;
                this.nBtnWatchAds.getComponent(Button).enabled = true;
                MConfigs.UnGrayAllNode([this.nBgBtnWatchAds]);
            } else {
                if (DataSpinSys.Instance.IsMaxSpinAdsToday()) {
                    this.countDownTimeGroup.initCountDownTime(Utils.getTimeToNextDay(), this.UpdateVisualBtn.bind(this));
                } else {
                    this.countDownTimeGroup.initCountDownTime(MConfigs.TIME_COOLDOWN_SPIN_ADS - (Utils.getSecondNow() - lastTimeSpinAds), this.UpdateVisualBtn.bind(this));
                }
                this.nOnNormal.active = false;
                this.countDownTimeGroup.ShowNode();
                this.nBtnWatchAds.getComponent(Button).enabled = false;
                MConfigs.GrayAllNode([this.nBgBtnWatchAds], this.matGray);
            }
        }
    }
}


