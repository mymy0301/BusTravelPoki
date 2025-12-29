/**
 * 
 * anhngoxitin01
 * Mon Nov 10 2025 10:40:21 GMT+0700 (Indochina Time)
 * UITutorialLevelChrist
 * db://assets/scripts/Scene/OtherUI/UITutorialLevelChrist/UITutorialLevelChrist.ts
*
*/
import { _decorator, CCFloat, Component, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
const { ccclass, property } = _decorator;

@ccclass('UITutorialLevelChrist')
export class UITutorialLevelChrist extends UIBaseSys {
    private _cbCallWhenClose: CallableFunction = null;
    @property(CCFloat) timeDelayShowContinue: number = 1;
    @property(InfoUIBase) infoTut: InfoUIBase;

    //==========================================
    //#region base
    public async PrepareDataShow(): Promise<void> {
        // check dataCustom to know which UI Show
        this._cbCallWhenClose = null;

        if (this._dataCustom != null && this._dataCustom.cbCloseUI != null) {
            this._cbCallWhenClose = this._dataCustom.cbCloseUI;
        }

        this.infoTut.registerCallback(() => { })
        this.infoTut.Show();
    }

    public async UIShowDone(): Promise<void> {
        await Utils.delay(this.timeDelayShowContinue * 1000);
    }

    public async UICloseDone(): Promise<void> {
        if (this._cbCallWhenClose) {
            this._cbCallWhenClose();
        }
    }
    //#endregion base
}