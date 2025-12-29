import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { UISubSpeedRace } from '../SubSpeedRace/UISubSpeedRace';
import { GameManager } from '../../GameManager';
import { UISubDashRush } from '../SupDashRush/UISubDashRush';
import { Utils } from '../../../Utils/Utils';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { STATE_SPEED_RACE } from '../UISpeedRace/TypeEventSpeedRace';
import { DataEventsSys } from '../../DataEventsSys';
import { DataDashRush } from '../../DataDashRush';
import { InfoBot_DashRush, TYPE_EVENT_GAME } from '../../../Utils/Types';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
import { MConst } from '../../../Const/MConst';
import { ResourceUtils } from '../../../Utils/ResourceUtils';
import { TYPE_GAME } from '../../../Configs/MConfigs';
import { DataHatRace_christ } from '../../../DataBase/DataHatRace_christ';
import { UISupHatRace } from '../SupHatRace/UISupHatRace';
const { ccclass, property } = _decorator;

enum UI_CHOICE {
    DASH_RUSH,
    SPEED_RACE,
    HAT_RACE
}

@ccclass('OtherUILose')
export class OtherUILose extends Component {
    private _nSubSpeedRace: Node = null;
    private _nSubDashRush: Node = null;
    private _nSubHatRace: Node = null;
    private _choiceWhichUI: UI_CHOICE = UI_CHOICE.DASH_RUSH;

    public async TryHideUIShowing() {
        switch (true) {
            case this._nSubSpeedRace != null && this._choiceWhichUI == UI_CHOICE.SPEED_RACE:
                this._nSubSpeedRace.getComponent(UISubSpeedRace).HideUI();
                break;
            case this._nSubDashRush != null && this._choiceWhichUI == UI_CHOICE.DASH_RUSH:
                await this._nSubDashRush.getComponent(UISubDashRush).AnimClose();
                break;
            case this._nSubHatRace != null && this._choiceWhichUI == UI_CHOICE.HAT_RACE:
                this._nSubHatRace.getComponent(UISupHatRace).HideUI();
                break;

        }
    }

    public async TryShowUIShowing() {
        try {
            if (this._choiceWhichUI == null) { return; }
            switch (true) {
                case this._choiceWhichUI == UI_CHOICE.DASH_RUSH:
                    // wait to load pf
                    await Utils.WaitReceivingDone(() => { return this.isValid && this._nSubDashRush != null }, 1);
                    await this._nSubDashRush.getComponent(UISubDashRush).ShowUI_when_joinning(Utils.CloneListDeep(GameManager.Instance.JsonAllTypeGame.DASH_RUSH_CACHE));
                    GameManager.Instance.UpdateDashRushCache();
                    break;
                case this._choiceWhichUI == UI_CHOICE.SPEED_RACE:
                    await Utils.WaitReceivingDone(() => { return this.isValid && this._nSubSpeedRace != null }, 1);
                    await this._nSubSpeedRace.getComponent(UISubSpeedRace).ShowUI(GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE);
                    GameManager.Instance.UpdateSpeedRaceCache();
                    break;
                case this._choiceWhichUI == UI_CHOICE.HAT_RACE:
                    await Utils.WaitReceivingDone(() => { return this.isValid && this._nSubHatRace != null }, 1);
                    await this._nSubHatRace.getComponent(UISupHatRace).ShowUI(DataHatRace_christ.Instance.GetIndexOldMutilply());
                    DataHatRace_christ.Instance.UpdateIndexMultiply();
                    break;
            }
        } catch (e) {

        }
    }

    public TryInitUIShowing(): boolean {
        let hasInit: boolean = false;
        this._choiceWhichUI == null;

        const typeGame = GameManager.Instance.TypeGamePlay;
        switch (typeGame) {
            case TYPE_GAME.NORMAL:
                const canShowSpeedRace: boolean = this.CanShowSubSpeedRace();
                const canShowDashRush: boolean = this.CanShowSubDashRush();
                switch (true) {
                    case canShowSpeedRace && !canShowDashRush:
                        this.LoadPfSpeedRace();
                        hasInit = true;
                        break;
                    case !canShowSpeedRace && canShowDashRush:
                        this.LoadPfDashRush();
                        hasInit = true;
                        break;
                    default:
                        const canPlayAnimDR = this.CanPlayAnimDR();
                        const canPlayAnimSR = this.CanPlayAnimSR();
                        switch (true) {
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
                break;
            case TYPE_GAME.CHRISTMAS:
                const canShowHatRace = this.CanPlayHatRace();
                if (canShowHatRace) {
                    this.LoadPfHatRace();
                    hasInit = true;
                }
                break;
        }

        return hasInit;
    }

    //==================================================
    //#region SpeedRace
    public CanShowSubSpeedRace(): boolean {
        return GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL
            && GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE != null
            && DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.JOINING;
    }

    public CanPlayAnimSR(): boolean {
        return GameManager.Instance.TypeGamePlay == TYPE_GAME.NORMAL
            && GameManager.Instance.JsonAllTypeGame.SPEED_RACE_CACHE != DataSpeedRace.Instance.GetIndexMutilply();
    }
    //#endregion SpeedRace
    //==================================================

    //==================================================
    //#region DashRush
    public CanShowSubDashRush(): boolean {
        if (GameManager.Instance.TypeGamePlay != TYPE_GAME.NORMAL) { return false; }
        const isUnlockDashRush = DataEventsSys.Instance.IsPlayTutorialEvent(TYPE_EVENT_GAME.DASH_RUSH);
        const isJoinDashRush = DataDashRush.Instance.IsJoiningDashRush();
        return isUnlockDashRush && isJoinDashRush;
    }

    public CanPlayAnimDR(): boolean {
        if (GameManager.Instance.TypeGamePlay != TYPE_GAME.NORMAL) { return false; }
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

    //==================================================
    //#region hatRace
    public CanPlayHatRace(): boolean {
        return GameManager.Instance.TypeGamePlay == TYPE_GAME.CHRISTMAS
            && DataHatRace_christ.Instance.GetIndexMutilply() < DataHatRace_christ.Instance.GetIndexOldMutilply();
    }
    //#endregion hatRace
    //==================================================

    //===============================================
    //#region Utils
    public async LoadPfSpeedRace() {
        this._choiceWhichUI = UI_CHOICE.SPEED_RACE;
        if (this._nSubSpeedRace != null) { return; }
        this._nSubSpeedRace = await this.LoadPf(MConst.PATH.PF_SUB_SPEED_RACE);
    }

    public async LoadPfDashRush() {
        this._choiceWhichUI = UI_CHOICE.DASH_RUSH;
        if (this._nSubDashRush != null) { return; }
        this._nSubDashRush = await this.LoadPf(MConst.PATH.PF_SUB_DASH_RUSH);
    }

    public async LoadPfHatRace() {
        this._choiceWhichUI = UI_CHOICE.HAT_RACE;
        if (this._nSubHatRace != null) { return; }
        this._nSubHatRace = await this.LoadPf(MConst.PATH.PF_SUP_HAT_RACE);
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