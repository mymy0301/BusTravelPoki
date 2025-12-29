import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { IPrize, TYPE_PRIZE } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { AnimFxStarLight } from '../../../AnimsPrefab/fx_star_light/AnimFxStarLight';
import { DataLevelProgressionSys } from '../../../DataBase/DataLevelProgressionSys';
const { ccclass, property } = _decorator;

@ccclass('ItemPrizeUIWin')
export class ItemPrizeUIWin extends Component {
    @property(Label) lbPrize: Label;
    @property(Label) lbPrizeShadow: Label;
    @property(Sprite) spPrize: Sprite;
    @property(AnimFxStarLight) animFxStarLight: AnimFxStarLight;

    private readonly colorLbPrizeCoin: Color = new Color().fromHEX("#C05B00");
    private readonly colorLbShadowPrizeCoin: Color = new Color().fromHEX("#824E19");
    private readonly colorLbPrizeBuilding: Color = new Color().fromHEX("#0067b6ff")
    private readonly colorLbShadowPrizeBuilding: Color = new Color().fromHEX("#174180");

    private readonly scaleItemPrizeCoin: Vec3 = Vec3.ONE.clone().multiplyScalar(0.72);
    private readonly scaleItemPrizeBuilding: Vec3 = Vec3.ONE.clone();

    private _dataPrize: IPrize = null;

    public SetUp(dataPrize: IPrize) {
        // this.animFxStarLight.PrepareAnim();
        this._dataPrize = dataPrize;

        this.lbPrize.string = this.lbPrizeShadow.string = dataPrize.GetStringValue_2();
        switch (dataPrize.typePrize) {
            case TYPE_PRIZE.MONEY:
                this.spPrize.node.scale = this.scaleItemPrizeCoin;
                this.lbPrize.outlineColor = this.colorLbPrizeCoin;
                this.lbPrizeShadow.color = this.lbPrizeShadow.outlineColor = this.colorLbShadowPrizeCoin;
                break;
            case TYPE_PRIZE.BUILDING:
                this.spPrize.node.scale = this.scaleItemPrizeBuilding;
                this.lbPrize.outlineColor = this.colorLbPrizeBuilding;
                this.lbPrizeShadow.color = this.lbPrizeShadow.outlineColor = this.colorLbShadowPrizeBuilding;
                break;
        }

        this.UpdateImgItem(dataPrize);
    }

    public SetUpLbPrize(numItem: number) {
        this.lbPrize.string = this.lbPrizeShadow.string = `x${numItem.toString()}`;
    }

    public SetUpSpriteFrame(sfRight: SpriteFrame) {
        this.spPrize.spriteFrame = sfRight;
    }

    public SetUpScaleSp(customScale: Vec3) {
        this.spPrize.node.scale = customScale;
    }

    public GetDataPrize(): IPrize {
        return this._dataPrize;
    }

    public PlayAnimDoubleValue(timeIncreaseText: number) {
        const newValue = this._dataPrize.value * 2;
        const rootValue = this._dataPrize.value;

        const diffCoin: number = newValue - rootValue;
        const self = this;

        return new Promise<void>(resolve => {
            tween(this.lbPrize.node)
                .to(timeIncreaseText, {}, {
                    onUpdate(target, ratio) {
                        const text = `x${(rootValue + diffCoin * ratio).toFixed(0)}`;
                        self.lbPrize.string = text;
                        self.lbPrizeShadow.string = text;
                    },
                })
                .call(() => { resolve() })
                .start();
        });

    }

    public PlayAnimSkeLight(timeAnim: number) {
        this.animFxStarLight.PlayAnimLightWithStarWithOpacity_2(timeAnim);
    }

    //====================================
    //#region self
    private async UpdateImgItem(iPrize: IPrize) {
        try {
            const sfPrize = await MConfigResourceUtils.getImageItemBig(iPrize.typePrize, iPrize.typeReceivePrize);
            if (iPrize.typePrize == this._dataPrize.typePrize) {
                this.spPrize.spriteFrame = sfPrize;
            }
        } catch (e) {

        }
    }
    //#endregion self
    //====================================
}


