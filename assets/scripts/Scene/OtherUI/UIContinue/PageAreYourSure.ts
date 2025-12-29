/**
 * 
 * dinhquangvinhdev
 * Thu Sep 04 2025 11:28:50 GMT+0700 (Indochina Time)
 * PageAreYourSure
 * db://assets/scripts/Scene/OtherUI/UIContinue/PageAreYourSure.ts
*
*/
import { _decorator, Component, Label, Layout, Node, RichText, Sprite, tween, UIOpacity, Vec3 } from 'cc';
import { AnimIconHomeSys } from '../../../AnimsPrefab/AnimIconHomeSys';
import { NameAnimIconHome_Active } from '../../../Utils/TypeAnimChest';
import { DataTreasureTrailSys } from '../../../DataBase/DataTreasureTrailSys';
import { CONFIG_TT, STATE_TT } from '../UITreasureTrail/TypeTreasureTrail';
import { DataSkyLiftSys } from '../../../DataBase/DataSkyLiftSys';
import { DataSpeedRace } from '../../../DataBase/DataSpeedRace';
import { CONFIG_SR, STATE_SPEED_RACE } from '../UISpeedRace/TypeEventSpeedRace';
import { STATE_SL } from '../UISkyLift/TypeSkyLift';
import { TYPE_EVENT_GAME } from '../../../Utils/Types';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
import { STATE_EVENT_LEVEL_PROGRESS } from '../UILevelProgression/TypeLevelProgress';
import { GameInfoSys } from '../../GameScene/GameInfoSys';
import { GameManager } from '../../GameManager';
import { TYPE_GAME } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('PageAreYourSure')
export class PageAreYourSure extends Component {
    @property(RichText) rt: RichText;
    @property(Layout) layoutHeadIcon: Layout;
    @property(Layout) layoutBody: Layout;
    @property(AnimIconHomeSys) animIconTT: AnimIconHomeSys;
    @property(AnimIconHomeSys) animIconSL: AnimIconHomeSys;
    @property(AnimIconHomeSys) animIconSR: AnimIconHomeSys;
    @property(Node) nPumpkins: Node;
    @property(Label) lbEventTreasureTrail: Label;
    @property(Label) lbEventSkyLift: Label;
    @property(Label) lbEventSpeedRace: Label;
    @property(Label) lbEventLevelProgress: Label;
    private readonly DELAY_TIME_LOOP_ANIM = 2;

    private readonly COLOR_RED = "#c40c0c";
    private readonly COLOR_GREEN = "#1b9200";
    private readonly POS_Y_LB: number = -20;

    private readonly MAX_EVENT_SHOWING = 3;

    public _isShowTT: boolean = false;
    public _isShowSL: boolean = false;
    public _isShowSR: boolean = false;
    public _isShowLP: boolean = false;
    //==========================================
    //#region base
    protected onDisable(): void {
        this.animIconTT.StopAnim();
        this.animIconSL.StopAnim();
        this.animIconSR.StopAnim();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public CanShowSelf(): boolean {
        if (GameManager.Instance.TypeGamePlay != TYPE_GAME.NORMAL) { return false; }

        return this.CanShowByTypeEvent(TYPE_EVENT_GAME.TREASURE_TRAIL)
            || this.CanShowByTypeEvent(TYPE_EVENT_GAME.SKY_LIFT)
            || this.CanShowByTypeEvent(TYPE_EVENT_GAME.SPEED_RACE)
            || this.CanShowByTypeEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);
    }

    public CanShowByTypeEvent(typeEvent: TYPE_EVENT_GAME): boolean {
        if (GameManager.Instance.TypeGamePlay != TYPE_GAME.NORMAL) { return false; }

        switch (true) {
            case typeEvent == TYPE_EVENT_GAME.TREASURE_TRAIL:
                return DataTreasureTrailSys.Instance.STATE == STATE_TT.JOINING;
            case typeEvent == TYPE_EVENT_GAME.SKY_LIFT:
                const progressNowSL = DataSkyLiftSys.Instance.ProgressNow;
                return DataSkyLiftSys.Instance.STATE == STATE_SL.JOINING
                    && progressNowSL > 0
                    && !DataSkyLiftSys.Instance.IsIndexIsSavePoint(progressNowSL);
            case typeEvent == TYPE_EVENT_GAME.SPEED_RACE:
                return DataSpeedRace.Instance.GetState == STATE_SPEED_RACE.JOINING;
            case typeEvent == TYPE_EVENT_GAME.LEVEL_PROGRESSION:
                return DataLevelProgressionSys.Instance.STATE == STATE_EVENT_LEVEL_PROGRESS.JOINING && GameInfoSys.Instance.getNumCarLevelProgress() > 0;
        }
        return false;
    }

    private IsStreakTTEqual0() { return DataTreasureTrailSys.Instance.ProgressNow == 0; }

    public SetUp(setUpAnim: boolean = true) {
        let numEventShowing = 0;

        const self = this;

        const isHasEventTT: boolean = this.CanShowByTypeEvent(TYPE_EVENT_GAME.TREASURE_TRAIL);
        const isStreakTTEqual0: boolean = this.IsStreakTTEqual0();
        const isHasEventSL: boolean = this.CanShowByTypeEvent(TYPE_EVENT_GAME.SKY_LIFT);
        const isHasEventSR: boolean = this.CanShowByTypeEvent(TYPE_EVENT_GAME.SPEED_RACE);
        const isHasEventLP: boolean = this.CanShowByTypeEvent(TYPE_EVENT_GAME.LEVEL_PROGRESSION);

        this._isShowSL = this._isShowSR = this._isShowTT = this._isShowLP = false;

        //================= treasure trail ==================
        this.animIconTT.StopAnim();
        this.animIconTT.node.active = isHasEventTT;
        this.lbEventTreasureTrail.node.active = isHasEventTT;
        if (isHasEventTT) {
            numEventShowing += 1;
            this._isShowTT = true;
            setUpAnim && this.animIconTT.PlayAnimLoopWithDelay(NameAnimIconHome_Active.treasureTraill, this.DELAY_TIME_LOOP_ANIM, true);
            !setUpAnim && this.animIconTT.PlayAnimAndStopAtFrame(NameAnimIconHome_Active.treasureTraill, 0);
            this.lbEventTreasureTrail.string = `${DataTreasureTrailSys.Instance.ProgressNow}/${CONFIG_TT.LEVEL_PLAY}`;
        }

        //================= sky lift ==================
        this.animIconSL.StopAnim();
        this.animIconSL.node.active = isHasEventSL;
        this.lbEventSkyLift.node.active = isHasEventSL;
        if (isHasEventSL) {
            numEventShowing += 1;
            this._isShowSL = true;
            setUpAnim && this.animIconSL.PlayAnimLoopWithDelay(NameAnimIconHome_Active.skyLift, this.DELAY_TIME_LOOP_ANIM, true);
            !setUpAnim && this.animIconSL.PlayAnimAndStopAtFrame(NameAnimIconHome_Active.skyLift, 0);
            this.lbEventSkyLift.string = `${DataSkyLiftSys.Instance.ProgressNow}`;
        }

        //================= speed race ==================
        this.animIconSR.StopAnim();
        this.animIconSR.node.active = isHasEventSR;
        this.lbEventSpeedRace.node.active = isHasEventSR;
        if (isHasEventSR) {
            numEventShowing += 1;
            this._isShowSR = true;
            setUpAnim && this.animIconSR.PlayAnimLoopWithDelay(NameAnimIconHome_Active.speedRace, this.DELAY_TIME_LOOP_ANIM, true);
            !setUpAnim && this.animIconSR.PlayAnimAndStopAtFrame(NameAnimIconHome_Active.speedRace, 0);
            this.lbEventSpeedRace.string = `x${CONFIG_SR.SR_MULTIPLIER[DataSpeedRace.Instance.GetIndexMutilply()]}`;
        }

        //================= level Progress ==================
        this.nPumpkins.active = false;
        if (numEventShowing < this.MAX_EVENT_SHOWING) {
            this.nPumpkins.active = isHasEventLP;
            this.lbEventLevelProgress.node.active = isHasEventLP;
            if (isHasEventLP) {
                numEventShowing += 1;
                this._isShowLP = true;
                this.lbEventLevelProgress.string = `x${GameInfoSys.Instance.getNumCarLevelProgress()}`;
            }
        }


        //================ rich text ==============
        function GetPrefix(numEvent: number = 0) {
            switch (numEvent) {
                case 1: return `<color=${self.COLOR_RED}>, </color>`;
                case 2: return `<color=${self.COLOR_RED}>and </color>`;
                default: return '';
            }
        }

        function GetSuffix(numEvent: number = 0) {
            switch (numEvent) {
                case 1: return `\n`;
                default: return '';
            }
        }

        let content = `<color=${this.COLOR_RED}>You will lose the streak of\n`;
        if (isHasEventTT && !isHasEventSL && !isHasEventSR && isStreakTTEqual0) {
            content = `<color=${this.COLOR_RED}>You will fail the `;
        }

        let numEventHas = 0;

        if (isHasEventTT) { content += `${GetPrefix(numEventHas)}<color=${this.COLOR_GREEN}>Treasure trail</color>${GetSuffix(numEventHas)}`; numEventHas += 1; }
        if (isHasEventSL) { content += `${GetPrefix(numEventHas)}<color=${this.COLOR_GREEN}>Sky Streak</color>${GetSuffix(numEventHas)}`; numEventHas += 1; }
        if (isHasEventSR) { content += `${GetPrefix(numEventHas)}<color=${this.COLOR_GREEN}>Speed Race</color>${GetSuffix(numEventHas)}`; numEventHas += 1; }
        if (isHasEventLP) { content += `${GetPrefix(numEventHas)}<color=${this.COLOR_GREEN}>and some cars!</color>${GetSuffix(numEventHas)}`; numEventHas += 1; }

        // trong trường hợp chỉ có mỗi levelProgress
        if (!isHasEventTT && !isHasEventSL && !isHasEventSR && isHasEventLP) {
            content = `<color=${this.COLOR_RED}>You will lose progress in ICE RIDE!\n`;
        }

        //check content has last is "/n" remove it
        if (content.endsWith("\n")) {
            content = content.slice(0, -1);
        }
        content += `</color>`;

        this.rt.string = content;

        this.layoutHeadIcon.updateLayout(true);
        this.layoutBody.updateLayout(true);

        // update UI
        if (isHasEventTT) {
            this.lbEventTreasureTrail.node.worldPosition = new Vec3(this.animIconTT.node.worldPosition.clone().x, 0, 0);
            this.lbEventTreasureTrail.node.position = new Vec3(this.lbEventTreasureTrail.node.position.x, this.POS_Y_LB, 0);
        }
        if (isHasEventSL) {
            this.lbEventSkyLift.node.worldPosition = new Vec3(this.animIconSL.node.worldPosition.clone().x, 0, 0)
            this.lbEventSkyLift.node.position = new Vec3(this.lbEventSkyLift.node.position.x, this.POS_Y_LB, 0)
        }
        if (isHasEventSR) {
            this.lbEventSpeedRace.node.worldPosition = new Vec3(this.animIconSR.node.worldPosition.clone().x, 0, 0)
            this.lbEventSpeedRace.node.position = new Vec3(this.lbEventSpeedRace.node.position.x, this.POS_Y_LB, 0)
        }
        if (isHasEventLP) {
            this.lbEventLevelProgress.node.worldPosition = new Vec3(this.nPumpkins.worldPosition.clone().x, 0, 0);
            this.lbEventLevelProgress.node.position = new Vec3(this.lbEventLevelProgress.node.position.x, this.POS_Y_LB, 0);
        }
    }

    public Hide() { this.node.getComponent(UIOpacity).opacity = 0; }
    public Show(timeShow: number = 1) {
        tween(this.node.getComponent(UIOpacity))
            .to(timeShow, { opacity: 255 })
            .start();
        this.node.getComponent(UIOpacity).opacity = 255;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
}