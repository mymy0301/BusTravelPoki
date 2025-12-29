import { _decorator, Component, Label, Node, Sprite, Tween, tween, Vec3, UITransform, Size, Color, UIOpacity, CCFloat, Vec2, randomRange, SpriteFrame, ParticleSystem } from 'cc';
import { GameSoundEffect, IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { Bezier } from '../../../framework/Bezier';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { SoundSys } from '../../../Common/SoundSys';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ItemPrizeLobby')
export class ItemPrizeLobby extends Component {
    @property(Sprite) icItem: Sprite;
    @property(Label) lbNum: Label;
    @property(Label) lbOther: Label;
    @property(ParticleSystem) particle: ParticleSystem;
    @property(Node) nLight: Node;
    private _iPRize: IPrize = null;
    private _baseItem: Vec3;

    private readonly basePosLabel1: Vec3 = new Vec3(14.5, -25.883, 0);
    private readonly basePosLabel2: Vec3 = new Vec3(0, -25.883, 0);
    private readonly basePosIcItem1: Vec3 = new Vec3(-7.713, -0.729, 0);
    private readonly basePosIcItem2: Vec3 = new Vec3(0, -0.729, 0);

    public SetUp(data: IPrize, basePos: Vec3, typePosLabel: number = 0 | 1 | 2, setImageAuto: boolean = true) {
        this._iPRize = data;

        setImageAuto && MConfigResourceUtils.setImageItem(this.icItem, this._iPRize.typePrize, this._iPRize.typeReceivePrize);

        // /**
        //  * Change angle for rocket item
        //  */
        // this.icItem.node.angle = this._iPRize.typePrize == TYPE_PRIZE.LIGHTNING ? 17 : 0
        this.TurnOffDoubleKeyVisual();
        this.TurnOffLight();

        // set lb
        let lbResult = '';
        if (data.typeReceivePrize == TYPE_RECEIVE.TIME_HOUR) {
            lbResult = `${data.value}h`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE) {
            lbResult = `${data.value}m`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.NUMBER) {
            lbResult = `x${data.value.toString()}`;
        }
        this.lbNum.string = lbResult;
        switch (typePosLabel) {
            case 0:
                this.lbNum.node.position = this.basePosLabel1.clone();
                this.icItem.node.position = this.basePosIcItem1.clone();
                break;
            case 1:
                this.lbNum.node.position = this.basePosLabel2.clone();
                this.icItem.node.position = this.basePosIcItem2.clone();
                break;
        }
        this._baseItem = basePos.clone();
    }

    public SetUp_WithOutSf(data: IPrize, basePos: Vec3, typePosLabel: number = 0 | 1 | 2) {
        this._iPRize = data;

        // /**
        //  * Change angle for rocket item
        //  */
        // this.icItem.node.angle = this._iPRize.typePrize == TYPE_PRIZE.LIGHTNING ? 17 : 0
        this.TurnOffDoubleKeyVisual();
        this.TurnOffLight();

        // set lb
        let lbResult = '';
        if (data.typeReceivePrize == TYPE_RECEIVE.TIME_HOUR) {
            lbResult = `${data.value}h`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE) {
            lbResult = `${data.value}m`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.NUMBER) {
            lbResult = `x${data.value.toString()}`;
        }
        this.lbNum.string = lbResult;
        switch (typePosLabel) {
            case 0:
                this.lbNum.node.position = this.basePosLabel1.clone();
                this.icItem.node.position = this.basePosIcItem1.clone();
                break;
            case 1:
                this.lbNum.node.position = this.basePosLabel2.clone();
                this.icItem.node.position = this.basePosIcItem2.clone();
                break;
        }
        this._baseItem = basePos.clone();
    }

    public MoveItemToPlace(wPos: Vec3[], time: number = 1) {
        let listCommandTween: Tween<Node>[] = [];
        for (let i = 0; i < wPos.length; i++) {
            const timePlayerTween = time / wPos.length;
            let commandTween = tween(this.node)
                .to(timePlayerTween, { worldPosition: wPos[i] });
            listCommandTween.push(commandTween);
        }

        return new Promise<void>(resolve => {
            tween(this.node)
                .sequence(...listCommandTween)
                .call(() => {
                    clientEvent.dispatchEvent(MConst.EVENT.RECEIVE_ITEM_PRIZE_LOBBY_DONE, this._iPRize);
                    this.node.destroy();
                    resolve();
                })
                .start();
        });
    }

    public async MoveToBaseWPos(startPos: Vec3, time: number, useParticle: boolean = false) {
        // ============== new way ===============
        let endPos = this._baseItem.clone();
        let midPos = new Vec3(endPos.x, startPos.y, 0);
        let listVec3MoveTo = Bezier.GetListPointsToTween3(10, startPos.clone(), midPos, endPos);
        // ============== new way ===============
        this.node.worldPosition = startPos;
        const scaleEnd = new Vec3(1.5, 1.5, 1.5);
        await AniTweenSys.TweenToListVec3(this.node, listVec3MoveTo, time, new Vec3(0.3, 0.3, 0.3), scaleEnd);

        if (useParticle) {
            this.PlayParticle();
        }

        // // just call scale button play if it is the item suit with kind of that
        // if (this.getType() == TYPE_PRIZE.SORT || this.getType() == TYPE_PRIZE.SHUFFLE
        //     || this.getType() == TYPE_PRIZE.HAMMER || this.getType() == TYPE_PRIZE.TIME
        //     || this.getType() == TYPE_PRIZE.MAGNIFYING_GLASS || this.getType() == TYPE_PRIZE.VIP_SLOT) {
        //     clientEvent.dispatchEvent(AUTO_SCALE_CUSTOM, TYPE_AUTO_SCALE.BTN_PLAY_LOBBY);
        // }
    }

    public async ScaleAtBaseWPos(time: number, useParticle: boolean = false) {
        const self = this;

        // auto turn on light
        this.node.worldPosition = this._baseItem.clone();

        const scaleStart: Vec3 = new Vec3(0.2, 0.2, 0.2);
        const scaleEnd: Vec3 = new Vec3(1.5, 1.5, 1.5);
        const opaStart: number = 100;
        const opaCom = this.node.getComponent(UIOpacity);

        opaCom.opacity = opaStart;
        this.node.scale = scaleStart;


        await new Promise<void>(resolve => {
            tween(this.node)
                .to(time, { scale: scaleEnd }, {
                    easing: 'backOut',
                    onUpdate(target, ratio) {
                        opaCom.opacity = opaStart + (255 - opaStart) * ratio;
                    },
                })
                .call(() => {
                    useParticle && self.PlayParticle();
                    resolve();
                })
                .start();
        })

    }

    private readonly baseFontSize: number = 28;
    public ScaleSelfSpecial(scaleTo: Vec3) {
        this.icItem.node.scale = scaleTo;
        this.nLight.scale = scaleTo;
        this.lbNum.fontSize = this.baseFontSize * scaleTo.x;
    }

    public MoveItemToPlaceEnd(wPos: Vec3, _callbackReUse: CallableFunction, time: number = 0.4) {
        return new Promise<void>(resolve => {
            tween(this.node)
                .to(time, { worldPosition: wPos.clone() })
                .call(() => {
                    clientEvent.dispatchEvent(MConst.EVENT.RECEIVE_ITEM_PRIZE_LOBBY_DONE, this._iPRize);
                    _callbackReUse(this.node);
                    SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RECEIVE_ITEM_DONE);
                    resolve();
                })
                .start();
        });
    }

    public HideItemByOpacity(time: number = 0.5) {
        const opaItem = this.node.getComponent(UIOpacity);
        tween(opaItem)
            .to(time, { opacity: 0 })
            .start();
    }

    public IsTypeMoney(): boolean { return this._iPRize.typePrize == TYPE_PRIZE.MONEY; }
    public getType(): TYPE_PRIZE { return this._iPRize.typePrize; }
    public getValueItem(): number { return this._iPRize.value; }
    public getTypeReceivePrize(): TYPE_RECEIVE { return this._iPRize.typeReceivePrize; }
    public TurnOnDoubleKeyVisual() {
        this.lbOther.node.active = true;
        // this.lbOther.outlineColor = DataSeasonPassSys.Instance.getColorOutlineTextX2();
    }
    public TurnOffDoubleKeyVisual() {
        if (this.lbOther != null) {
            this.lbOther.node.active = false;
        }
    }

    //#region light
    public TurnOnLight() {
        this.nLight.active = true;
    }

    public TurnOffLight() {
        this.nLight.active = false;
    }
    //#endregion light

    //#region anim item bezier
    @property({ group: "AnimBezier", type: CCFloat }) timeAnimScale: number = 0.5;
    @property({ group: "AnimBezier", type: CCFloat }) speedIconMove: number = 0.1;
    public PrepareAnim_Bezier(wPosStart: Vec3) {
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.scale = new Vec3(0.7, 0.7, 0.7);
        this.node.worldPosition = wPosStart;
    }

    public async Anim_BezierMove(wPosEnd: Vec3, timeDelayAfterScale: number = 0) {
        const opaCom: UIOpacity = this.node.getComponent(UIOpacity);
        // B1: scale 
        tween(this.node)
            .to(this.timeAnimScale, { scale: Vec3.ONE }, {
                onUpdate(target, ratio) {
                    opaCom.opacity = ratio * 255;
                },
            })
            .start();

        await Utils.delay((this.timeAnimScale - 0.1) * 1000);

        // wait to move
        await Utils.delay(timeDelayAfterScale * 1000);

        // B2: move
        const wPosStart = this.node.worldPosition.clone();
        const wPosMid = randomWPosMidFromRec(wPosStart, new Vec2(100, 100), "DOWN", "LEFT");
        const listVec3MoveTo = Bezier.GetListPointsToTween3(10, wPosStart, wPosMid, wPosEnd);
        const listAngle: number[] = new Array(listVec3MoveTo.length).fill(0);
        const listTime: number[] = new Array(listVec3MoveTo.length).fill(this.speedIconMove);

        await AniTweenSys.TweenToListVec3_6(this.node, listVec3MoveTo, listAngle, listTime, () => { });

        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RECEIVE_ITEM_DONE);
    }

    //#region particle
    public async PlayParticle() {
        try {
            this.particle.node.active = true;
            this.particle.play();
            await Utils.WaitReceivingDone(() => this == null || this.particle == null || this.particle.isStopped);
            this.particle.node.active = false;
        } catch (e) {

        }
    }
    //#endregion particle

    //#region ShadowSelf
    private tempColorText: Color = null;
    public ShadowPrize(shadowProgress: number) {
        const colorShadow = new Color(shadowProgress, shadowProgress, shadowProgress);
        this.icItem.color = colorShadow;
        // lưu lại màu color text vì hiện tại không bt có code nào thay đổi màu text của item hay không
        this.tempColorText = this.lbNum.color.clone();
        this.lbNum.color = colorShadow;
    }

    public UnShadowPrize() {
        const colorWhite = new Color(255, 255, 255);
        this.icItem.color = colorWhite;
        this.lbNum.color = this.tempColorText == null ? colorWhite : this.tempColorText;
    }
    //#endregion endShadowSelf
}


function randomWPosMidFromRec(startPos: Vec3, rec: Vec2, directionUD: "UP" | "DOWN", directionLR: "LEFT" | "RIGHT"): Vec3 {
    let x, y;
    x = randomRange(startPos.x + (directionLR == "LEFT" ? -(rec.x / 2) : 0), startPos.x + (directionLR == "LEFT" ? 0 : (rec.x / 2)));
    y = randomRange(startPos.y + (directionUD == "UP" ? -(rec.y / 2) : 0), startPos.y + (directionUD == "UP" ? 0 : (rec.y / 2)));
    return new Vec3(x, y);
}


