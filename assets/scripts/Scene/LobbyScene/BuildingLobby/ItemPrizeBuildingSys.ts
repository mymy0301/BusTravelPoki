import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { IPrize } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('ItemPrizeBuildingSys')
export class ItemPrizeBuildingSys extends Component {
    @property(Sprite) icItem: Sprite;
    @property(Label) lbNum: Label;
    private _iPrize: IPrize = null;

    public SetUp(data: IPrize, needAutoLoadImage: boolean = true) {
        this._iPrize = data;
        this.lbNum.string = data.GetStringValue_2();
        // load image
        if(needAutoLoadImage){
            this.LoadImage();
        }
    }

    private async LoadImage() {
        try {
            const sfPrize: SpriteFrame = await MConfigResourceUtils.getImageItem(this._iPrize.typePrize, this._iPrize.typeReceivePrize);
            if (sfPrize != null) {
                this.icItem.spriteFrame = sfPrize;
            }
        } catch (e) {

        }
    }
}


