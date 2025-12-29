import { _decorator, Component, instantiate, Label, macro, Node, Prefab, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { IDataLeaderboard, IDataPlayer_LEADERBOARD } from '../../../Utils/server/ServerPegasus';
import { nTopPlayer } from './nTopPlayer';
import { IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { ListLeaderboardUI_2 } from './ListLeaderboardUI_2';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { UILoadingSys_2 } from '../UILoadingSys_2';
import { DataWeeklySys } from '../../../DataBase/DataWeeklySys';
const { ccclass, property } = _decorator;

@ccclass('PageWeekly_UIRank')
export class PageWeekly_UIRank extends Component {
    @property(UILoadingSys_2) nLoading: UILoadingSys_2;
    @property(ListLeaderboardUI_2) listLeaderboardUI: ListLeaderboardUI_2;
    @property(Label) lbTime: Label;
    @property(Node) bgTop: Node;
    private isLoadData: boolean = false;

    @property(Prefab) pfTop1: Prefab;
    @property(Prefab) pfTop2: Prefab;
    @property(Prefab) pfTop3: Prefab;
    @property(Vec3) posTop1: Vec3 = new Vec3();
    @property(Vec3) posTop2: Vec3 = new Vec3();
    @property(Vec3) posTop3: Vec3 = new Vec3();
    @property(Node) nTopPlayer: Node = null;

    private _listPrize: IPrize[][] = [];

    protected onEnable(): void {
        clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    protected onDisable(): void {
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateTime, this);
    }

    private async LoadSv() {
        //NOTE update lại dữ liệu mới
        if (this.isLoadData) { 
            this.nLoading.Close(); 
            return;
        }
        this.isLoadData = true;
        this._listPrize = await DataWeeklySys.Instance.GetPrizeWeek();
        this.listLeaderboardUI.RegisterCb(() => { this.LoadTopPlayer() });
        await Utils.WaitReceivingDone(() => { return this.listLeaderboardUI._isInitInface });
        this.listLeaderboardUI.SetData();

        this.nLoading.Close();
    }

    private LoadTopPlayer() {
        const self = this;
        let data: IDataPlayer_LEADERBOARD[] = this.listLeaderboardUI.GetData;
        // init top 1,2,3 player

        function initTopPlayer(data: IDataPlayer_LEADERBOARD, template: Prefab, pos: Vec3, prize: IPrize[]) {
            if (data == null) return;
            let top = instantiate(template);
            top.parent = self.nTopPlayer;
            top.setPosition(pos);
            top.getComponent(nTopPlayer).SetUp(data, prize);
        }

        // function initEmptyPlayer(template: Prefab, pos: Vec3, prize: IPrize[]) {
        //     let top = instantiate(template);
        //     top.parent = self.nTopPlayer;
        //     top.setPosition(pos);
        //     top.getComponent(nTopPlayer).SetUpEmptyPlayer(prize);
        // }

        initTopPlayer(data[0], this.pfTop1, this.posTop1, this._listPrize[0]);
        initTopPlayer(data[1], this.pfTop2, this.posTop2, this._listPrize[1]);
        initTopPlayer(data[2], this.pfTop3, this.posTop3, this._listPrize[2]);

        // show UILoading done
        this.bgTop.active = true;
        this.nLoading.Close();
    }

    private UpdateTime() {
        let timeUntilNextWeek = Utils.getTimeRemainingFromNowToEndWeek() / 1000;
        this.lbTime.string = Utils.convertTimeLengthToFormat(timeUntilNextWeek);
    }

    protected onDestroy(): void {
        if (this._idInterval != -1) {
            clearInterval(this._idInterval);
        }
    }

    private _hasData: boolean = false;
    private _dataLeaderboardFirstCall: IDataPlayer_LEADERBOARD[] = [];
    private _idInterval: number = -1;
    private _timeCheckInterval: number = 0;
    private readonly MAX_TIME_CHECK_INTERVAL = 5; // 1'
    public TryCallDataUntilHaveData(forceUpdate: boolean = false) {
        if (this._hasData && !forceUpdate) { return; }

        this.nLoading.Show();
        this.bgTop.active = false;
        this._idInterval = setInterval(() => {
            if (this._dataLeaderboardFirstCall.length > 0) {
                // console.warn("has dataLeaderboardFirstCall SOCIAL", Array.from(this._dataLeaderboardFirstCall));
                this._hasData = true;
            } else {
                this.CheckDataAgain();
            }

            // add time
            this._timeCheckInterval += 1;

            if (this._hasData || this._timeCheckInterval == this.MAX_TIME_CHECK_INTERVAL) {
                // console.warn("clear Interval SOCIAL because", this._hasData, this._timeCheckInterval);
                clearInterval(this._idInterval);
                

                this.LoadSv();
            }
        }, 1000, macro.REPEAT_FOREVER, 0)
    }

    private CheckDataAgain() {
        if (this._dataLeaderboardFirstCall.length == 0) {
            // check if the data leaderboard was change => reload data
            let dataPlayerWeekly: IDataPlayer_LEADERBOARD[] = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(DataLeaderboardSys.Instance.ID_LEADERBOARD_WEEKLY));
            // let dataPlayerWeekly: IDataPlayer_LEADERBOARD[] = [];

            if (dataPlayerWeekly.length > 0) {
                this._dataLeaderboardFirstCall = Array.from(dataPlayerWeekly);
            }
        }
    }
}


