import { _decorator, Component, Label, Node, Sprite, Tween, tween, Vec3, UITransform, Size, Color, SpriteFrame } from 'cc';
import { GameSoundEffect, IPrize, TYPE_PRIZE, TYPE_RECEIVE } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { Bezier } from '../../../framework/Bezier';
import { AniTweenSys } from '../../../Utils/AniTweenSys';
import { SoundSys } from '../../../Common/SoundSys';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { DataSeasonPassSys } from '../../../DataBase/DataSeasonPassSys';
const { ccclass, property } = _decorator;

/**
 * Xin hãy tối ưu hết mức có thể cho class này
 * Class này có xu hướng đc tái sử dụng cho nhiều tình huống và nhiều dự án khác nhau
 */

@ccclass('ItemPrizeSuperCustom')
export class ItemPrizeSuperCustom extends Component {
    @property(Sprite) icItem: Sprite;
    @property(Label) lbNum: Label;
    @property(Label) lbNumShadow: Label = null;
    @property(Size) defaultSize: Size = new Size(0, 0);
    private _iPRize: IPrize = null;
    private _baseItem: Vec3;

    public SetUp(data: IPrize, basePos: Vec3, suffTextNum: string = 'x', isNeedUpdateVisualItem: boolean = true) {
        this._iPRize = data;
        const indexKeyPass = DataSeasonPassSys.Instance.getIndexSeasonPass();

        // set icon
        // lý do cho việc tách ra như này là vì chấp nhận sẽ có lúc ảnh bị load sau nhưng hiệu ứng và anim vẫn sẽ phải chạy đúng nhịp ko có thời gian chờ
        if (isNeedUpdateVisualItem) {
            (async () => {
                try {

                    let sfPrize = await MConfigResourceUtils.getImageItem(this._iPRize.typePrize, this._iPRize.typeReceivePrize, indexKeyPass);
                    // const sizePrize: Size = sfPrize.originalSize;
                    // let rightSize: Size = this.ScaleItemToSuitWithDefaultSize(sizePrize, this.defaultSize);
                    this.icItem.spriteFrame = sfPrize;
                    // this.icItem.node.getComponent(UITransform).contentSize = rightSize;
                } catch (e) {
                    // case này chỉ xảy ra khi destroy object trước khi kịp update
                }
            })();
        }

        // You can change angle icon in here

        // set lb
        let lbResult = '';
        if (data.typeReceivePrize == TYPE_RECEIVE.TIME_HOUR) {
            lbResult = `${data.value}h`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE) {
            lbResult = `${data.value}m`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.NUMBER) {
            lbResult = `${suffTextNum}${data.value.toString()}`;
        }
        this.lbNum.string = lbResult;
        if (this.lbNumShadow != null) { this.lbNumShadow.string = lbResult; }
        this._baseItem = basePos.clone();
    }

    public SetUp_2(data: IPrize, basePos: Vec3, suffTextNum: string = 'x', sfPrize: SpriteFrame) {
        this._iPRize = data;

        this.icItem.spriteFrame = sfPrize;

        // set lb
        let lbResult = '';
        if (data.typeReceivePrize == TYPE_RECEIVE.TIME_HOUR) {
            lbResult = `${data.value}h`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.TIME_MINUTE) {
            lbResult = `${data.value}m`;
        } else if (data.typeReceivePrize == TYPE_RECEIVE.NUMBER) {
            lbResult = `${suffTextNum}${data.value.toString()}`;
        }
        this.lbNum.string = lbResult;
        if (this.lbNumShadow != null) { this.lbNumShadow.string = lbResult; }
        this._baseItem = basePos.clone();
    }

    public ChangeColorTextPrize(colorFront: Color, colorShadow: Color) {
        this.lbNum.outlineColor = colorFront;
        if (this.lbNumShadow != null) {
            this.lbNumShadow.outlineColor = colorShadow;
            this.lbNumShadow.color = colorShadow;
        }
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

    public async MoveToBaseWPos(startPos: Vec3, time: number) {
        // ============== new way ===============
        let endPos = this._baseItem.clone();
        let midPos = new Vec3(endPos.x, startPos.y, 0);
        let listVec3MoveTo = Bezier.GetListPointsToTween3(10, startPos.clone(), midPos, endPos);
        // ============== new way ===============
        this.node.worldPosition = startPos;
        const scaleEnd = new Vec3(1.5, 1.5, 1.5);
        await AniTweenSys.TweenToListVec3(this.node, listVec3MoveTo, time, new Vec3(0.3, 0.3, 0.3), scaleEnd);

        // just call scale button play if it is the item suit with kind of that
        // if (this.getType() == TYPE_PRIZE.SORT || this.getType() == TYPE_PRIZE.SHUFFLE
        //     || this.getType() == TYPE_PRIZE.HAMMER || this.getType() == TYPE_PRIZE.TIME
        //     || this.getType() == TYPE_PRIZE.MAGNIFYING_GLASS || this.getType() == TYPE_PRIZE.VIP_SLOT) {
        //     clientEvent.dispatchEvent(MConst.EVENT.SCALE_BUTTON_PLAY);
        // }
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

    public IsTypeMoney(): boolean { return this._iPRize.typePrize == TYPE_PRIZE.MONEY; }
    public getType(): TYPE_PRIZE { return this._iPRize.typePrize; }
    public getValueItem(): number { return this._iPRize.value; }
    public getTypeReceivePrize(): TYPE_RECEIVE { return this._iPRize.typeReceivePrize; }


    private ScaleItemToSuitWithDefaultSize(newSize: Size, defaultSize: Size): Size {
        let newH: number = 0;
        let newW: number = 0;
        let scaleW = newSize.width / defaultSize.width;
        let scaleH = newSize.height / defaultSize.height;
        if (scaleW < scaleH) {
            newW = newSize.width / scaleH;
            newH = defaultSize.height;
        }
        else {
            newH = newSize.height / scaleW;
            newW = defaultSize.width;
        }

        return new Size(newW, newH);
    }
}


