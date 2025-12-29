import { _decorator, Component, Node, SpriteFrame, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { GameSoundEffect, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { SoundSys } from '../../../Common/SoundSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { ListItemProgressSpeedRace } from './ListItemProgressSpeedRace';
const { ccclass, property } = _decorator;

@ccclass('UISpeedRaceProgress')
export class UISpeedRaceProgress extends UIBaseSys {
    @property(ListItemProgressSpeedRace) listItemProgressSpeedRace: ListItemProgressSpeedRace;

    //=========================
    //#region func logic
    protected onEnable(): void {
        this.listItemProgressSpeedRace.UpdateAllItems();
    }

    protected start(): void {
        // init item
        this.listItemProgressSpeedRace.InitData();
    }
    //#endregion func logic
    //=========================

    //=========================
    //#region btn
    private OnBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISpeedRaceProgress");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SPEED_RACE_PROGRESS, 1);
    }
    //#endregion btn
    //=========================
}


