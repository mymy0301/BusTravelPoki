import { _decorator, Component, Node } from 'cc';
import { nReceiveSpeedRace } from './nReceiveSpeedRace';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
const { ccclass, property } = _decorator;

@ccclass('AnimReceiveSpeedRaceSys')
export class AnimReceiveSpeedRaceSys extends Component {
    @property(nReceiveSpeedRace) nReceiveSpeedRace: nReceiveSpeedRace;

    protected start(): void {
        this.nReceiveSpeedRace.PrepareAnimOpenReceiveItem();
    }

    public TryPlayAnim(cbDoneAnim: CallableFunction) {
        const progressOld = DataSpeedRace.Instance.GetProgressForPlayAnimUI();
        const progressNow = DataSpeedRace.Instance.GetInfoPlayerNow().progress;
        const dataProgress = DataSpeedRace.Instance.GetListPrizeReceiveFromProgressToProgress(progressOld, progressNow);
        const streakOld: number = DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(DataSpeedRace.Instance.GetIndexMutilplyForPlayAnimUI());
        const streakNow: number = DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(DataSpeedRace.Instance.GetIndexMutilply());
        this.nReceiveSpeedRace.AnimOpenReceiveItem(dataProgress.listPrizeReceive, dataProgress.nextPrize, streakOld, streakNow, cbDoneAnim);
    }

    public TestTryPlayAnim(cbDoneAnim: CallableFunction) {
        const prizePrevious: IPrize = new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 100);
        const prizeNext: IPrize = new IPrize(TYPE_PRIZE.SHUFFLE, TYPE_RECEIVE.NUMBER, 2);
        const streakOld: number = DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(1);
        const streakNow: number = DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(2);
        this.nReceiveSpeedRace.AnimOpenReceiveItem([prizePrevious], prizeNext, streakOld, streakNow, cbDoneAnim);
    }

    public Test() {
        const prizePrevious: IPrize = new IPrize(TYPE_PRIZE.MONEY, TYPE_RECEIVE.NUMBER, 100);
        const prizeNext: IPrize = new IPrize(TYPE_PRIZE.SHUFFLE, TYPE_RECEIVE.NUMBER, 2);
        const streakOld: number = DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(1);
        const streakNow: number = DataSpeedRace.Instance.GetMutiplyScoreSuitWithProgress(2);
        this.nReceiveSpeedRace.AnimOpenReceiveItem([prizePrevious], prizeNext, streakOld, streakNow, null);
    }
}


