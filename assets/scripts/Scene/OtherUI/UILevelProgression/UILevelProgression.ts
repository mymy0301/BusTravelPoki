import { _decorator, Component, Label, Node, Size, Sprite, UITransform, find } from 'cc';
import { ListLevelProgression } from './ListLevelProgression';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { BubbleSys } from '../Others/Bubble/BubbleSys';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_CLOCK_ON_TICK, MConst, TYPE_UI } from '../../../Const/MConst';
import * as I18n from 'db://i18n/LanguageData';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { InfoLevelProgress } from '../../../DataBase/InfoLevelProgress';
import { instanceOfIOpenUIBaseWithInfo, instanceOfIUIKeepTutAndReceiveLobby } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('UILevelProgression')
export class UILevelProgression extends UIBaseSys {
    @property(ListLevelProgression) listLvP: ListLevelProgression;
    @property(BubbleSys) bubbleSys: BubbleSys;
    @property(Sprite) spKey: Sprite;
    @property(Label) lbProgress: Label;
    @property(Label) lbLevel: Label;
    @property(Label) lbTime: Label;
    @property(Sprite) spProgress: Sprite;
    @property(InfoLevelProgress) infoUIBase: InfoLevelProgress;
    @property(Label) lbContentEvent: Label;
    @property(Label) lbShadowContentEvent: Label;


    private readonly MAX_WIDTH_PROGRESS: number = 512;

    //==========================================
    //#region base
    public async PrepareDataShow(): Promise<void> {
        this.listLvP.InitData();

        // registerTime
        const time = DataLevelProgressionSys.Instance.GetTimeDisplay();
        if (time > 0) {
            this.UpdateUITime();
            clientEvent.on(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
        } else {
            this.UpdateUITime();
        }

        // update content of info
        const idEventNow = DataLevelProgressionSys.Instance.GetIdEventNow();
        this.infoUIBase.SetTitle(DataLevelProgressionSys.Instance.GetContentEventNow(idEventNow));

        // update UI
        this.UpdateUI();
    }

    public async PrepareDataClose(): Promise<void> {
        if (this._dataCustom != null) {
            const dataKeepTut = this._dataCustom.find(dataAny => instanceOfIUIKeepTutAndReceiveLobby(dataAny))
            if (dataKeepTut != null) {
                clientEvent.dispatchEvent(MConst.EVENT.PAGE_HOME_CONTINUE);
            }
        }
        clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
    }

    public async UIShowDone(): Promise<void> {
        // check data custom that player show UI from tut => show info UI
        if (this._dataCustom != null) {
            const dataShowInfo = this._dataCustom.find(dataAny => instanceOfIOpenUIBaseWithInfo(dataAny))
            if (dataShowInfo != null) {
                this.BtnShowInfo();
            }
        }
    }

    protected start(): void {
        this.bubbleSys.SetAnchorView(this.listLvP.nView.worldPosition)
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private UpdateUI() {
        // get progress
        const progressNow = DataLevelProgressionSys.Instance.GetProgressNow();
        const infoToShowUI: { progressRemaining: number, progressTotal: number, levelReach: number } = DataLevelProgressionSys.Instance.GetInfoToShowUI(progressNow);

        // set lp progress
        this.lbLevel.string = infoToShowUI.levelReach.toString();
        this.lbProgress.string = `${infoToShowUI.progressRemaining}/${infoToShowUI.progressTotal}`;

        // set progress
        const ratio: number = infoToShowUI.progressRemaining / infoToShowUI.progressTotal;
        const widthProgress: number = ratio * this.MAX_WIDTH_PROGRESS;
        const comTransProgress: UITransform = this.spProgress.getComponent(UITransform);
        const rootSizeProgress: Size = comTransProgress.contentSize.clone();
        comTransProgress.contentSize = new Size(widthProgress, rootSizeProgress.height);

        // set lb level
        this.lbLevel.string = infoToShowUI.levelReach.toString();

        // set lb content
        const idEventNow = DataLevelProgressionSys.Instance.GetIdEventNow();
        const nameEvent = DataLevelProgressionSys.Instance.GetContentEventNow(idEventNow);
        // this.lbContentEvent.string = this.lbShadowContentEvent.string = nameEvent;

        // update key
        this.UpdateUIKeyEvent();
    }

    private UpdateUITime() {
        const time = DataLevelProgressionSys.Instance.GetTimeDisplay();
        if (time <= 0) {
            // ko lắng nghe sự kiện clock time
            clientEvent.off(EVENT_CLOCK_ON_TICK, this.UpdateUITime, this);
            this.lbTime.string = I18n.t("FINISHED");
        } else {
            const resultTime = Utils.convertTimeLengthToFormat_ForEvent(time);
            this.lbTime.string = resultTime;
        }
    }

    private async UpdateUIKeyEvent() {
        try {
            const sfKey = await DataLevelProgressionSys.Instance.GetSfKeyEvent();
            this.spKey.spriteFrame = sfKey;
        } catch (e) {

        }
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region btn
    private BtnShowInfo() {
        LogEventManager.Instance.logButtonClick(`ShowInfo`, "UILevelProgress");
        this.infoUIBase.Show();
    }

    private BtnClose() {
        LogEventManager.Instance.logButtonClick(`ShowInfo`, "UILevelProgress");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_LEVEL_PROGRESSION, 1);
    }
    //#endregion btn
    //==========================================
}


