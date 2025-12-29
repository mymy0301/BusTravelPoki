import { _decorator, AnimationComponent, AnimationManager, Component, Label, Node, ParticleSystem, ProgressBar, Sprite, SpriteFrame, tween, UIOpacity, Vec3, VERSION } from 'cc';
import { GameSoundEffect, IPrize, TYPE_PRIZE } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
import { IcItemFake_ReceiveSR } from './IcItemFake_ReceiveSR';
const { ccclass, property } = _decorator;

enum NAME_ANIM_SR {
    IDLE = "IdleSR",
    SHOW = "ShowSR",
    INCREASE = "IncreaseSR",
    HIDE = "HideSR"
}

@ccclass('nReceiveSpeedRace')
export class nReceiveSpeedRace extends Component {
    @property(ProgressBar) progressBar: ProgressBar;
    @property(Sprite) spItem: Sprite;
    @property(Label) lbNumItem: Label;
    @property(ParticleSystem) particleStreak: ParticleSystem;
    @property(Node) nVisual: Node;
    @property(Label) lbStreak: Label;
    @property(AnimationComponent) animComSR: AnimationComponent;
    @property(IcItemFake_ReceiveSR) icItemFake: IcItemFake_ReceiveSR;


    @property({ group: { id: 'FakeItem', name: 'FakeItem' }, type: Sprite }) spItemFake: Sprite;
    @property({ group: { id: 'FakeItem', name: 'FakeItem' }, type: Label }) lbItemFake: Label;

    @property({ group: { id: 'resource', name: 'resource' }, type: [SpriteFrame] }) listSfItem: SpriteFrame[] = [];

    private _listPrizeReceive: IPrize[] = [];
    private _indexPrizeReceive: number = 0;
    private _prizeNext: IPrize = null;
    private _streakNext: number = 1;
    private _cbDoneAnim: CallableFunction = null;

    public PrepareAnimOpenReceiveItem() {
        this.animComSR.play(NAME_ANIM_SR.IDLE);
        this.icItemFake.PlayAnimIdle();
    }

    public async AnimOpenReceiveItem(listPrizeReceive: IPrize[] = [], prizeNext: IPrize = null, oldStreak: number, newStreak: number, cbDoneAnim: CallableFunction = null) {
        // trong trường hợp prizeNext == null 
        // thì ta chỉ cần cho chạy progress thôi và sau đó ẩn item đi là dc

        // === save data ===
        this._indexPrizeReceive = 0;
        this._listPrizeReceive = listPrizeReceive;
        this._streakNext = newStreak;
        this._prizeNext = prizeNext;
        this._cbDoneAnim = cbDoneAnim;

        // === set up prize old ===
        this.UpdateUIPrize(this._listPrizeReceive[this._indexPrizeReceive], this.spItem, this.lbNumItem);

        // === set strike ===
        this.UpdateUIStreak(oldStreak);


        this.animComSR.play(NAME_ANIM_SR.SHOW);
        await Utils.delay(this.GetTimeAnim(NAME_ANIM_SR.SHOW) * 1000);
        this.animComSR.play(NAME_ANIM_SR.INCREASE);
    }

    //======================
    //#region anim
    private GetClip(enumAnim: NAME_ANIM_SR) {
        return this.animComSR.clips[Utils.getIndexOfEnum(NAME_ANIM_SR, enumAnim)];
    }

    private GetTimeAnim(nameAnim: NAME_ANIM_SR) {
        const timeLengthAnim = this.animComSR.clips.find(clip => clip.name == nameAnim).duration;
        return timeLengthAnim;
    }
    //#endregion anim
    //======================

    //======================
    //#region self
    private UpdateUIPrize(prize: IPrize, spItem: Sprite, lbItem: Label) {
        if (prize == null) { spItem.node.active = lbItem.node.active = false; return; }
        const sfItem = this.listSfItem[prize.typePrize];
        spItem.spriteFrame = sfItem;
        lbItem.string = prize.GetStringValue_2();
        spItem.node.active = lbItem.node.active = true;
    }

    private UpdateUIStreak(streak: number) {
        this.lbStreak.string = `x${streak}`;
    }
    //#endregion self
    //======================


    //======================
    //#region cb Anim
    private playBubleItemFake() {
        this.UpdateUIPrize(this._listPrizeReceive[this._indexPrizeReceive], this.spItemFake, this.lbItemFake);
        this.icItemFake.PlayAnimBuble();
    }

    private EventAnimPlayParticleNewStreak() {
        this.particleStreak.play();
    }

    private EventAnimUpdateLbStreak() {
        this.UpdateUIStreak(this._streakNext);
    }

    private async TryEndProgressAnim() {
        // play Bubble Item Fake
        this.playBubleItemFake();

        // check can increase or not
        this._indexPrizeReceive += 1;
        if (this._indexPrizeReceive < this._listPrizeReceive.length) {
            this.UpdateUIPrize(this._listPrizeReceive[this._indexPrizeReceive], this.spItem, this.lbNumItem);
            this.animComSR.play(NAME_ANIM_SR.INCREASE);
        } else {
            this.UpdateUIPrize(this._prizeNext, this.spItem, this.lbNumItem);
            const timeDelaySeeItem: number = 1;
            await Utils.delay(timeDelaySeeItem * 1000);
            this.animComSR.play(NAME_ANIM_SR.HIDE);
            await Utils.delay(this.GetTimeAnim(NAME_ANIM_SR.HIDE) * 1000);
            this._cbDoneAnim && this._cbDoneAnim();
        }
    }
    //#endregion cb Anim
    //======================
}


