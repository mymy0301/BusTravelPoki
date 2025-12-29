import { _decorator, CCFloat, Component, Label, Node, RealCurve, RichText, Sprite, SpriteFrame, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { GameSoundEffect, TYPE_EVENT_GAME, TYPE_ITEM } from '../../../Utils/Types';
import { SoundSys } from '../../../Common/SoundSys';
import { EVENT_TUT_LOBBY } from './TypeTutorialInLobby';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
const { ccclass, property } = _decorator;

@ccclass('UITutorialInLobby')
export class UITutorialInLobby extends UIBaseSys {
    private _cbCallWhenClose: CallableFunction = null;
    @property(CCFloat) timeDelayShowContinue: number = 1;
    @property(CCFloat) timeRecieveItem: number = 1.5;
    @property(CCFloat) timeHideShadow: number = 1;

    @property(Label) lbTitle: Label;
    @property(Label) lbTitleShadow: Label;
    @property(Label) content_1: Label;
    @property(Label) content_1_shadow: Label;
    @property(Label) content_2: Label;
    @property(Label) content_2_shadow: Label;
    @property(Node) nBgListenClick: Node;

    @property({ group: "Icon", type: Node }) nIconSpin: Node;
    @property({ group: "Icon", type: Node }) nIconLevelPass: Node;
    @property({ group: "Icon", type: Node }) nIconLoginReward: Node;
    @property({ group: "Icon", type: Node }) nIconPiggyBank: Node;
    @property({ group: "Icon", type: Node }) nIconDashRush: Node;
    @property({ group: "Icon", type: Node }) nIconSpeedRace: Node;
    @property({ group: "Icon", type: Node }) nIconTreasure: Node;
    @property({ group: "Icon", type: Node }) nIconSeasonPass: Node;
    @property({ group: "Icon", type: Node }) nIconTreasureTrail: Node;
    @property({ group: "Icon", type: Node }) nIconSkyLift: Node;
    @property({ group: "Icon", type: Node }) nIconChristmasEvent: Node;

    @property({ group: "UI", type: Node }) nUIBlock: Node;
    @property({ group: "UI", type: Node }) nUIItem: Node;

    @property(Node) nLight: Node;

    @property(RealCurve) cr1_x: RealCurve = new RealCurve();
    @property(RealCurve) cr1_y: RealCurve = new RealCurve();
    @property(RealCurve) crScale: RealCurve = new RealCurve();

    public async PrepareDataShow(): Promise<void> {
        // check dataCustom to know which UI Show

        this.nBgListenClick.active = false;

        this.SetUI();

        // turn off nUIBlock
        this.nUIBlock.active = false;
    }

    public async UIShowDone(): Promise<void> {
        await Utils.delay(this.timeDelayShowContinue * 1000);
        this.nBgListenClick.active = true;
    }

    public async UICloseDone(): Promise<void> {
        if (this._cbCallWhenClose) {
            this._cbCallWhenClose();
        }
    }

    private btnClose() {
        LogEventManager.Instance.logButtonClick(`tap_to_continue`, "UITutorialInLobby");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_TUTOIRAL_IN_LOBBY, 2);
    }

    private SetParentLight(nParent: Node) {
        this.nLight.setParent(nParent);
        this.nLight.setSiblingIndex(0);
        this.nLight.position = Vec3.ZERO;
        this.nLight.active = true;
    }

    private SetUI() {
        this.nUIItem.getComponent(UIOpacity).opacity = 255;

        const typeEventGame = this._dataCustom as TYPE_EVENT_GAME;

        switch (typeEventGame) {
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                this.nIconLoginReward.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconLoginReward);
                this.nIconLoginReward.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Login Reward !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "Login everyday to receive rewards!";
                break;
            case TYPE_EVENT_GAME.SPIN:
                this.nIconSpin.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconSpin);
                this.nIconSpin.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Spin !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "Spin the wheel to receive rewards!";
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                this.nIconLevelPass.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconLevelPass);
                this.nIconLevelPass.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Level Pass !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                this.nIconSeasonPass.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconSeasonPass);
                this.nIconSeasonPass.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Season Pass !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
            case TYPE_EVENT_GAME.PIGGY_BANK:
                this.nIconPiggyBank.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconPiggyBank);
                this.nIconPiggyBank.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Piggy Bank !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
            case TYPE_EVENT_GAME.DASH_RUSH:
                this.nIconDashRush.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconDashRush);
                this.nIconDashRush.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Dash Rush !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
            case TYPE_EVENT_GAME.SPEED_RACE:
                this.nIconSpeedRace.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconSpeedRace);
                this.nIconSpeedRace.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Speed Race !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                this.nIconTreasure.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconTreasure);
                this.nIconTreasure.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Endless Treasure !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "Bigger bundles, better treasures!";
                break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                this.nIconTreasureTrail.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconTreasureTrail);
                this.nIconTreasureTrail.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Treasure Trail !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                this.nIconSkyLift.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconSkyLift);
                this.nIconSkyLift.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "SkyLift !";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                this.nIconChristmasEvent.parent.children.forEach((item: Node) => item.active = false);
                this.SetParentLight(this.nIconChristmasEvent);
                this.nIconChristmasEvent.active = true;
                this.lbTitle.string = this.lbTitleShadow.string = "Christmas Event!";
                this.content_1.string = this.content_1_shadow.string = "Unlocked!";
                this.content_2.string = this.content_2_shadow.string = "The more you win\nThe bigger the rewards!";
                break;
        }
    }

    private async AnimReceivePrize() {
        this.nUIBlock.active = true;
        // check event tutorial to receive prize
        // Beizer receive anim to icon at home
        // and turn it off
        // close UI

        let iconChoice: Node = null;
        let wPosEnd: Vec3 = new Vec3(0, 0, 0);
        let isRunLogic: boolean = true;
        let typeEventTut: TYPE_EVENT_GAME = this._dataCustom as TYPE_EVENT_GAME;

        switch (typeEventTut) {
            case TYPE_EVENT_GAME.LOGIN_REWARD:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.LOGIN_REWARD, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconLoginReward;
                break;
            case TYPE_EVENT_GAME.SPIN:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.SPIN, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconSpin;
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.LEVEL_PASS, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconLevelPass;
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.SEASON_PASS, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconSeasonPass;
                break;
            case TYPE_EVENT_GAME.PIGGY_BANK:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.PIGGY_BANK, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconPiggyBank;
                break;
            case TYPE_EVENT_GAME.DASH_RUSH:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.DASH_RUSH, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconDashRush;
                break;
            case TYPE_EVENT_GAME.SPEED_RACE:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.SPEED_RACE, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconSpeedRace;
                break;
            case TYPE_EVENT_GAME.ENDLESS_TREASURE:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.ENDLESS_TREASURE, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconTreasure;
                break;
            case TYPE_EVENT_GAME.TREASURE_TRAIL:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.TREASURE_TRAIL, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconTreasureTrail;
                break;
            case TYPE_EVENT_GAME.SKY_LIFT:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.SKY_LIFT, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconSkyLift;
                break;
            case TYPE_EVENT_GAME.CHRISTMAS_EVENT:
                isRunLogic = false;
                clientEvent.dispatchEvent(MConst.EVENT_PAGE_HOME.GET_WPOS_NODE_EVENT, TYPE_EVENT_GAME.CHRISTMAS_EVENT, (wPos: Vec3) => {
                    wPosEnd = wPos;
                    isRunLogic = true;
                });
                await Utils.WaitReceivingDone(() => { return isRunLogic })
                iconChoice = this.nIconChristmasEvent;
                break;
        }

        if (iconChoice == null) { return; }

        HideOpacity(this.nUIItem, this.timeHideShadow / 2);
        this.HideShadow(true, this.timeHideShadow / 2);
        await animBooster(iconChoice, wPosEnd, this.cr1_x, this.cr1_y, this.crScale, this.timeRecieveItem);

        // check type event và push udpate notification
        switch (typeEventTut) {
            case TYPE_EVENT_GAME.SPIN:
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_NOTIFICATION, TYPE_EVENT_GAME.SPIN, true);
                break;
            case TYPE_EVENT_GAME.LEVEL_PASS:
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_INDEX_NOTIFICATION, TYPE_EVENT_GAME.LEVEL_PASS)
                break;
            case TYPE_EVENT_GAME.SEASON_PASS:
                clientEvent.dispatchEvent(MConst.EVENT_GAME.UPDATE_INDEX_NOTIFICATION, TYPE_EVENT_GAME.SEASON_PASS)
                break;
        }

        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.ANIM_UNLOCK_EVENT, typeEventTut);

        let timeAnimUnlock = 0;
        isRunLogic = false;
        clientEvent.dispatchEvent(EVENT_TUT_LOBBY.GET_TIME_ANIM_UNLOCK_EVENT, typeEventTut, (timeAnim: number) => {
            isRunLogic = true;
            timeAnimUnlock = timeAnim;
        });
        // opacity black event
        this.nShadowSelf.Hide();

        await Utils.WaitReceivingDone(() => { return isRunLogic });
        await Utils.delay(timeAnimUnlock * 1000);

        this.btnClose();

        // // check can play unlock event again
        // clientEvent.dispatchEvent(EVENT_TUT_LOBBY.RUN_LOGIC_CHECK_TUT, (hasAnyEventCanPlayTut: boolean) => {
        //     if (!hasAnyEventCanPlayTut) {
        //         clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
        //         this.nUIBlock.active = false;
        //         this.btnClose();
        //     }
        // });
    }
}

async function HideOpacity(target: Node, time: number) {
    Tween.stopAllByTarget(target);
    const opa = target.getComponent(UIOpacity);
    if (opa == null) return;
    // console.log("HideOpacity", target.name);
    tween(opa)
        .to(time, { opacity: 0 })
        .start();
}

async function animBooster(nIconMove: Node, wPosEnd: Vec3, curveX: RealCurve, curveY: RealCurve, curveScale: RealCurve, timeReceiveItem: number = 0.5) {
    let waitLogic: boolean = false;

    await Utils.WaitReceivingDone(() => !waitLogic);

    const wPosStart: Vec3 = nIconMove.worldPosition.clone();
    const distanceX = wPosEnd.x - wPosStart.x;
    const distanceY = wPosEnd.y - wPosStart.y;
    const scaleNow = nIconMove.scale.clone();
    const scaleEnd = Vec3.ONE.clone().multiplyScalar(0.7);
    const distanceScale = scaleEnd.x - scaleNow.x;
    await new Promise<void>(resolve => {
        tween(nIconMove)
            .to(timeReceiveItem, {}, {
                onUpdate(target, ratio) {
                    const ratiX = curveX.evaluate(ratio);
                    const ratiY = curveY.evaluate(ratio);
                    const ratiScale = curveScale.evaluate(ratio);
                    nIconMove.worldPosition = wPosStart.clone().add3f(ratiX * distanceX, ratiY * distanceY, 0)
                    nIconMove.scale = scaleNow.clone().add3f(ratiScale * distanceScale, ratiScale * distanceScale, ratiScale * distanceScale);
                },
            })
            .call(() => resolve())
            .start();
    })
    SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_UNLOCK_EVENT);

    nIconMove.active = false;

    clientEvent.dispatchEvent(EVENT_TUT_LOBBY.LOGIC_CHECK_SHOW_TUT_LOBBY_DONE);
}


