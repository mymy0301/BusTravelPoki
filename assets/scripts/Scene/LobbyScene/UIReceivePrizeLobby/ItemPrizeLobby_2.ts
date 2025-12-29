import { _decorator, Component, Label, Node, Skeleton, sp, Sprite, Tween, tween, UIOpacity, Vec3 } from 'cc';
import { GameSoundEffect, IPrize, TYPE_PRIZE } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { SoundSys } from '../../../Common/SoundSys';
import { AnimFxStarLight } from '../../../AnimsPrefab/fx_star_light/AnimFxStarLight';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('ItemPrizeLobby_2')
export class ItemPrizeLobby_2 extends Component {
    @property(Sprite) spPrize: Sprite;
    @property(AnimFxStarLight) animFxStarLight: AnimFxStarLight;
    @property(Label) lbPrize: Label;
    @property(Label) lbPrize_mid: Label;
    @property(Node) nVisual: Node;
    private _prizeData: IPrize = null; public get prizeData() { return this._prizeData; }

    /**
     * hàm này sẽ quyết định xem hiển thị UI như nào
     * @param prize loại phần thưởng
     * @param totalPrizeHave số lượng phần thưởng => quy định về tỉ lệ scale của chữ
     */
    public SetUp(prize: IPrize, isSetDefaultFontSize: boolean = true) {
        this._prizeData = prize;
        this.lbPrize.string = `x${prize.value}`;
        this.lbPrize_mid.string = `x${prize.value}`;

        let isTypeCoin = prize.typePrize == TYPE_PRIZE.MONEY;
        this.lbPrize_mid.node.active = isTypeCoin;
        this.lbPrize.node.active = !isTypeCoin;

        MConfigResourceUtils.setImageItemBig(this.spPrize, prize.typePrize, prize.typeReceivePrize);

        // check for label
        if (isSetDefaultFontSize) {
            this.lbPrize.fontSize = MConfigs.UIReceivePrize_fontSizeLb_min_1_item;
            this.lbPrize_mid.fontSize = MConfigs.UIReceivePrize_fontSizeLb_min_1_item;
            this.lbPrize.node.position = MConfigs.LocLbDefault;
            this.lbPrize_mid.node.position = MConfigs.LocLbDefault;
        }
    }

    public SetSizeLabel(scale: number) {
        this.lbPrize.fontSize = scale;
        this.lbPrize_mid.fontSize = scale;
    }

    public SetLocLabel(pos: Vec3) {
        this.lbPrize.node.position = pos;
        this.lbPrize_mid.node.position = pos;
    }

    //#region func UI
    public HideVisualNode(time: number = 0.5) {
        const opaItem = this.nVisual.getComponent(UIOpacity);
        if (time == 0) {
            opaItem.opacity = 0;
            return;
        }
        tween(opaItem)
            .to(time, { opacity: 0 })
            .start();
    }

    public ShowVisualNode(time: number = 0.5, opaStart: number = 0) {
        const opaItem = this.nVisual.getComponent(UIOpacity);
        opaItem.opacity = opaStart;
        tween(opaItem)
            .to(time, { opacity: 255 })
            .start();
    }

    public MoveItemToPlaceEnd(wPos: Vec3, _callbackReUse: CallableFunction, scale: Vec3 = null, time: number = 0.4) {
        return new Promise<void>(resolve => {
            let tweenMove = tween(this.node).to(time, { worldPosition: wPos.clone() })
            let tweenScale = scale != null ? tween(this.node).to(time, { scale: scale }) : tween(this.node).to(0.1, {});

            tween(this.node)
                .parallel(
                    tweenMove,
                    tweenScale
                )
                .call(() => {
                    _callbackReUse(this.node);
                    SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.SOUND_RECEIVE_ITEM_DONE);
                    resolve();
                })
                .start();
        });
    }
    //#endregion func UI

    //#region Skeleton
    public HideSkeleton() {
        this.animFxStarLight.HideAnim();
    }

    public ShowSkeleton() {
        this.animFxStarLight.ShowAnim();
        this.animFxStarLight.PlayAnimLightWithStarWithOpacity();
    }
    //#endregion Skeleton
}


