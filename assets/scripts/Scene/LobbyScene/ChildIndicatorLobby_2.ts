import { _decorator, CCFloat, Component, Label, Node, Size, Sprite, SpriteFrame, TransformBit, Tween, tween, TweenEasing, UITransform, Vec3 } from 'cc';
import { MConfig_TypeMIndicator2, STATE_INDICATOR, getSizeContainerChoice, getSizeContainerUnChoice, getSizeOfSfChoice } from './TypeMIndicator2';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { GameSoundEffect, PAGE_VIEW_LOBBY_NAME } from '../../Utils/Types';
import { LogEventManager } from '../../LogEvent/LogEventManager';
import { SoundSys } from '../../Common/SoundSys';
const { ccclass, property } = _decorator;

@ccclass('ChildIndicatorLobby_2')
export class ChildIndicatorLobby_2 extends Component {
    @property({ type: PAGE_VIEW_LOBBY_NAME }) pbLName: PAGE_VIEW_LOBBY_NAME = PAGE_VIEW_LOBBY_NAME.HOME;

    private _stateIndi: STATE_INDICATOR = STATE_INDICATOR.Unchoice;
    private _cbChoiceTab: CallableFunction = null;
    private _sfBgUnChoice: SpriteFrame = null;
    private _sfBgChoice: SpriteFrame = null;

    protected onEnable(): void {
        this.node.on(Node.EventType.TRANSFORM_CHANGED, this.UpdateWPosVisual, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TRANSFORM_CHANGED, this.UpdateWPosVisual, this);
        this.UnRegisterClick();
    }

    public async ChangeState(state: STATE_INDICATOR, force: boolean = false) {
        const oldState = this._stateIndi;
        this._stateIndi = state;
        await this.ChangeVisualState(oldState, state, force);
    }

    public RegisterClick(cb: CallableFunction, sfBgChoice: SpriteFrame, sfBgUnChocie: SpriteFrame) {
        this._cbChoiceTab = cb;
        this._sfBgChoice = sfBgChoice;
        this._sfBgUnChoice = sfBgUnChocie;
        this.node.on(Node.EventType.TOUCH_END, this.onClickSelf, this);

        // check xem đã gán dữ liệu chưa phòng trường hợp bạn cập nhật data sau vì lý do nào đó
        const spBg: Sprite = this.nVisualBg.getComponent(Sprite);
        if (spBg.spriteFrame == null) {
            switch (this._stateIndi) {
                case STATE_INDICATOR.Choice:
                    spBg.spriteFrame = this._sfBgChoice;
                    break;
                case STATE_INDICATOR.Unchoice:
                    spBg.spriteFrame = this._sfBgUnChoice;
                    break;
            }
        }
    }

    public UnRegisterClick() {
        this.node.off(Node.EventType.TOUCH_END, this.onClickSelf, this);
    }

    private async ChangeVisualState(oldState: STATE_INDICATOR, newState: STATE_INDICATOR, force: boolean = false) {

        const time = MConfig_TypeMIndicator2.speed_tween;
        const easingChoice: TweenEasing = newState == STATE_INDICATOR.Choice ? 'backOut' : 'quadOut';

        if (force) {
            switch (newState) {
                case STATE_INDICATOR.Choice:
                    this.AnimILChoice(time, easingChoice, true);
                    this.AnimBgChoice(time, easingChoice, true);
                    break;
                case STATE_INDICATOR.Unchoice:
                    this.AnimILUnchoice(time, easingChoice, true);
                    this.AnimBgUnChoice(time, easingChoice, true);
                    break;
            }
            return;
        }

        // không chấp nhận trường hợp này
        if (oldState == newState) return;

        switch (newState) {
            case STATE_INDICATOR.Choice:
                this.AnimILChoice(time, easingChoice);
                await this.AnimBgChoice(time, easingChoice);
                break;
            case STATE_INDICATOR.Unchoice:
                this.AnimILUnchoice(time, easingChoice);
                await this.AnimBgUnChoice(time, easingChoice);
                break;
        }
    }

    public onClickSelf() {
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.UI_CLICK_SWEEP);
        LogEventManager.Instance.logButtonClick(`tab_${this.nVisualLabel.getComponent(Label).string}`, "home");
        // emit to change the pageView
        clientEvent.dispatchEvent(MConst.EVENT.CHANGE_PAGE_LOBBY, this.pbLName, true);
    }


    //#region Node
    private AnimBgChoice(time: number, easing: TweenEasing, force: boolean = false) {
        // dừng tween hiện tại
        Tween.stopAllByTarget(this.nContainer.getComponent(UITransform));
        Tween.stopAllByTarget(this.nVisualContainer.getComponent(UITransform));
        this.nVisualBg.getComponent(Sprite).spriteFrame = this._sfBgChoice;
        const sizeContainerChoice = getSizeContainerChoice();
        const sizeBgChoice = getSizeOfSfChoice(sizeContainerChoice);

        this.nVisualContainer.setSiblingIndex(999);

        if (force) {
            this.nContainer.getComponent(UITransform).contentSize = sizeContainerChoice;
            this.nVisualContainer.getComponent(UITransform).contentSize = sizeContainerChoice;
            this.nVisualBg.getComponent(UITransform).contentSize = sizeBgChoice;
            return;
        }

        return new Promise<void>((resolve) => {
            const self = this;

            tween(this.nVisualContainer.getComponent(UITransform))
                .to(time, { contentSize: sizeContainerChoice }, { easing: easing })
                .start();
            tween(this.nVisualBg.getComponent(UITransform))
                .to(time, { contentSize: sizeBgChoice }, { easing: easing })
                .start();
            tween(this.nContainer.getComponent(UITransform))
                .to(time, { contentSize: sizeContainerChoice }, { easing: easing })
                .call(() => { resolve() })
                .start();
        })
    }

    private AnimBgUnChoice(time: number, easing: TweenEasing, force: boolean = false) {
        // dừng tween hiện tại
        Tween.stopAllByTarget(this.nContainer.getComponent(UITransform));
        Tween.stopAllByTarget(this.nVisualContainer.getComponent(UITransform));
        const sizeContainerUnchoice: Size = getSizeContainerUnChoice();
        this.nVisualBg.getComponent(Sprite).spriteFrame = this._sfBgUnChoice;
        this.nContainer.getComponent(UITransform).height = sizeContainerUnchoice.height;
        this.nVisualContainer.getComponent(UITransform).height = sizeContainerUnchoice.height;
        this.nVisualBg.getComponent(UITransform).height = sizeContainerUnchoice.height;

        if (force) {
            this.nContainer.getComponent(UITransform).contentSize = sizeContainerUnchoice;
            this.nVisualContainer.getComponent(UITransform).contentSize = sizeContainerUnchoice;
            this.nVisualBg.getComponent(UITransform).contentSize = sizeContainerUnchoice;
            return;
        }

        return new Promise<void>((resolve) => {
            const self = this;
            tween(this.nVisualContainer.getComponent(UITransform))
                .to(time, { contentSize: sizeContainerUnchoice }, { easing: easing })
                .start();
            tween(this.nVisualBg.getComponent(UITransform))
                .to(time, { contentSize: sizeContainerUnchoice }, { easing: easing })
                .start();
            tween(this.nContainer.getComponent(UITransform))
                .to(time, { contentSize: sizeContainerUnchoice }, { easing: easing })
                .call(() => { resolve() })
                .start();
        })
    }

    private UpdateWPosVisual(type: TransformBit) {
        this.nVisualContainer.worldPosition = this.nContainer.worldPosition.clone();
        this.nVisualLabel.worldPosition = this.nLabel.worldPosition.clone();
        this.nVisualIcon.worldPosition = this.nIcon.worldPosition.clone();
    }
    //#endregion Node

    //#region Icon & Label
    @property(Node) nIcon: Node;
    @property(Node) nLabel: Node;
    @property(Node) nContainer: Node;
    @property(Node) nVisualIcon: Node;
    @property(Node) nVisualLabel: Node;
    @property(Node) nVisualContainer: Node;
    @property(Node) nVisualBg: Node;
    @property(Vec3) scaleIcon_start: Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) scaleIcon_end: Vec3 = new Vec3(1.1, 1.1, 1.1);
    @property(Vec3) posIcon_start: Vec3 = new Vec3(0, 18, 0);
    @property(Vec3) posIcon_end: Vec3 = new Vec3(0, 38, 0);
    @property(CCFloat) sizeText_start: number = 21;
    @property(CCFloat) sizeText_end: number = 33;
    private AnimILChoice(time: number, easing: TweenEasing, force: boolean = false) {
        Tween.stopAllByTarget(this.nIcon);
        Tween.stopAllByTarget(this.nVisualIcon);
        Tween.stopAllByTarget(this.nVisualLabel.getComponent(Label));

        const self = this;

        if (force) {
            this.nIcon.scale = this.scaleIcon_end;
            this.nIcon.position = this.posIcon_end;
            this.nVisualIcon.scale = this.scaleIcon_end;
            this.nVisualIcon.worldPosition = this.nIcon.worldPosition.clone();
            this.nVisualLabel.getComponent(Label).fontSize = this.sizeText_end;
            return;
        }

        tween(this.nIcon)
            .to(time, { scale: this.scaleIcon_end, position: this.posIcon_end }, { easing: easing })
            .start();
        tween(this.nVisualIcon)
            .to(time, { scale: this.scaleIcon_end }, { easing: easing })
            .start();
        tween(this.nVisualLabel.getComponent(Label))
            .to(time, { fontSize: this.sizeText_end }, { easing: easing })
            .start();
    }

    private AnimILUnchoice(time: number, easing: TweenEasing, force: boolean = false) {
        Tween.stopAllByTarget(this.nIcon);
        Tween.stopAllByTarget(this.nVisualIcon);
        Tween.stopAllByTarget(this.nVisualLabel.getComponent(Label));

        const self = this;

        if (force) {
            this.nIcon.scale = this.scaleIcon_start;
            this.nIcon.position = this.posIcon_start;
            this.nVisualIcon.scale = this.scaleIcon_start;
            this.nVisualIcon.worldPosition = this.nIcon.worldPosition.clone();
            this.nVisualLabel.getComponent(Label).fontSize = this.sizeText_start;
            return;
        }

        tween(this.nIcon)
            .to(time, { scale: this.scaleIcon_start, position: this.posIcon_start }, { easing: easing })
            .start();
        tween(this.nVisualIcon)
            .to(time, { scale: this.scaleIcon_start }, { easing: easing })
            .start();
        tween(this.nVisualLabel.getComponent(Label))
            .to(time, { fontSize: this.sizeText_start }, { easing: easing })
            .start();
    }
    //#endregion Icon & Label
}


