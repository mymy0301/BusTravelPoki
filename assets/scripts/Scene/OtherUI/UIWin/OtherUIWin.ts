import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { STATE_SPEED_RACE } from '../UISpeedRace/TypeEventSpeedRace';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { UISubSpeedRace } from '../SubSpeedRace/UISubSpeedRace';
import { GameManager } from '../../GameManager';
import { MConst } from '../../../Const/MConst';
import { DataEventsSys } from '../../DataEventsSys';
import { InfoBot_DashRush, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { DataDashRush } from '../../DataDashRush';
import { UISubDashRush } from '../SupDashRush/UISubDashRush';
import { Utils } from '../../../Utils/Utils';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { STATE_SL } from '../UISkyLift/TypeSkyLift';
import { UISupSkyLift } from '../SupSkyLift/UISupSkyLift';
const { ccclass, property } = _decorator;

@ccclass('OtherUIWin')
export class OtherUIWin extends Component {
    @property(Node) nBlockUI: Node;
    private _nSubSpeedRace: Node = null;
    private _nSubDashRush: Node = null;
    private _nSubSkyLift: Node = null;

    public async TryHideUIShowing() {
        switch (true) {
            case this._nSubSpeedRace != null:
                this._nSubSpeedRace.getComponent(UISubSpeedRace).HideUI();
                break;
            case this._nSubDashRush != null && this.CanShowSubDashRush():
                this._nSubDashRush.getComponent(UISubDashRush).Hide();
                break;
            case this._nSubSkyLift != null:
                this._nSubSkyLift.getComponent(UISupSkyLift).HideUI();
                break;
        }
    }

    public async TryShowUIShowing() {
        try {
            switch (true) {
                case this._nSubDashRush != null && this.CanShowSubDashRush():
                    await this._nSubDashRush.getComponent(UISubDashRush).ShowUI_when_joinning(Utils.CloneListDeep(GameManager.Instance.JsonAllTypeGame.DASH_RUSH_CACHE));
                    GameManager.Instance.UpdateDashRushCache();
                    break;
                case this._nSubSkyLift != null && this.CanShowSubSkyLift():
                    this.nBlockUI.active = true;
                    DataSkyLiftSys.Instance.UpdateProgressOldForceMinusNow(1);
                    await Utils.WaitReceivingDone(() => { return this.isValid && this._nSubSkyLift != null }, 1);
                    await this._nSubSkyLift.getComponent(UISupSkyLift).Show();
                    DataSkyLiftSys.Instance.TryReceivePrize(false);
                    DataSkyLiftSys.Instance.UpdateListPrizeReceived();
                    DataSkyLiftSys.Instance.TryEndGameByFullScore(true, false);
                    DataSkyLiftSys.Instance.UpdateProgressOld();
                    this.nBlockUI.active = false;
                    break;
                case this._nSubSpeedRace != null && this.CanShowSubSpeedRace():
                    await this._nSubSpeedRace.getComponent(UISubSpeedRace).ShowUI(GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE);
                    GameManager.Instance.UpdateSpeedRaceCache();
                    break;
            }
        } catch (e) {

        }
    }

    public TryInitUIShowing(): boolean {
        let hasInit: boolean = false;

        const canShowSkyLift: boolean = this.CanShowSubSkyLift();
        const canShowSpeedRace: boolean = this.CanShowSubSpeedRace();
        const canShowDashRush: boolean = this.CanShowSubDashRush();
        switch (true) {
            case !canShowSpeedRace && !canShowDashRush && canShowSkyLift:
                this.LoadPfSkyLift();
                hasInit = true;
                break;
            case !canShowSpeedRace && canShowDashRush && !canShowSkyLift:
                this.LoadPfDashRush();
                hasInit = true;
                break;
            case canShowSpeedRace && !canShowDashRush && !canShowSkyLift:
                this.LoadPfSpeedRace();
                hasInit = true;
                break;
            default:
                const canPlayAnimDR = this.CanPlayAnimDR();
                const canPlayAnimSR = this.CanPlayAnimSR();
                const canPlaySkyLift = this.CanPlayAnimSL();
                switch (true) {
                    case canShowSkyLift && canPlaySkyLift:
                        this.LoadPfSkyLift();
                        hasInit = true;
                        break;
                    case canShowDashRush && canPlayAnimDR:
                        this.LoadPfDashRush();
                        hasInit = true;
                        break;
                    case canShowSpeedRace && canPlayAnimSR:
                        this.LoadPfSpeedRace();
                        hasInit = true;
                        break;
                }
                break;
        }


        return hasInit;
    }

    //==================================================
    //#region SkyLift
    public CanShowSubSkyLift(): boolean {
        const insSkyLift = DataSkyLiftSys.Instance;
        return insSkyLift.STATE == STATE_SL.JOINING && insSkyLift.ProgressOld != insSkyLift.ProgressNow;
    }

    public CanPlayAnimSL(): boolean {
        return this.CanShowSubSkyLift();
    }
    //#endregion SkyLift
    //==================================================

    //==================================================
    //#region SpeedRace
    public CanShowSubSpeedRace(): boolean {
        return GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE != null
            && DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.JOINING;
    }

    public CanPlayAnimSR(): boolean {
        return GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE != DataSpeedRace.Instance.GetIndexMutilply();
    }
    //#endregion SpeedRace
    //==================================================

    //==================================================
    //#region DashRush
    public CanShowSubDashRush(): boolean {
        const isUnlockDashRush = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.DASH_RUSH);
        const isJoinDashRush = DataDashRush.Instance.IsJoiningDashRush();
        return isUnlockDashRush && isJoinDashRush;
    }

    public CanPlayAnimDR(): boolean {
        const dataBotOld = SortData(Utils.CloneListDeep(GameManager.Instance.JsonAllTypeGame.DASH_RUSH_CACHE));
        if (dataBotOld == null) { return false; }
        const dataBotNow = SortData(Utils.CloneListDeep(DataDashRush.Instance.GetDataBot()));
        if (dataBotNow == null) { return false; }

        try {
            let indexBotDiff = dataBotNow.findIndex(botNow => {
                if (botNow.bot.id == MConfigFacebook.Instance.playerID) {
                    const botCache = dataBotOld.find(botCache => botCache.bot.id == botNow.bot.id)
                    return botCache != null && botCache.bot.rank != botNow.bot.rank;
                }
                return false;
            })
            return indexBotDiff != -1;
        } catch (e) {
            console.log(dataBotOld);
            console.log(dataBotNow);
            console.error("error", e);
        }
    }
    //#endregion DashRush
    //==================================================

    //===============================================
    //#region Utils
    public async LoadPfSpeedRace() {
        if (this._nSubSpeedRace != null) { return; }
        this._nSubSpeedRace = await this.LoadPf(MConst.PATH.PF_SUB_SPEED_RACE);
    }

    public async LoadPfDashRush() {
        if (this._nSubDashRush != null) { return; }
        this._nSubDashRush = await this.LoadPf(MConst.PATH.PF_SUB_DASH_RUSH);
    }

    public async LoadPfSkyLift() {
        if (this._nSubSkyLift != null) { return; }
        this._nSubSkyLift = await this.LoadPf(MConst.PATH.PF_SUP_SKY_LIFT);
        this._nSubSkyLift.getComponent(UISupSkyLift).Init();
    }

    private async LoadPf(path: string) {
        const pfInit: Prefab = await ResourceUtils.loadPrefab(path);
        let result = instantiate(pfInit);
        result.active = false;
        result.parent = this.node;
        return result;
    }
    //#endregion Utils
    //===============================================
}

function SortData(data: InfoBot_DashRush[]): any[] {
    if (data == null) { return null; }
    return data
        .map((bot) => ({ bot, progress: bot.progress }))
        .sort((a, b) => b.progress - a.progress)
        .map((item, rank) => ({ ...item, rank: rank + 1 }));
}


