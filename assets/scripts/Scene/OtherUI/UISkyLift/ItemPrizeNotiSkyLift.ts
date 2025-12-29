/**
 * 
 * dinhquangvinhdev
 * Wed Aug 27 2025 15:33:58 GMT+0700 (Indochina Time)
 * ItemPrizeNotiSkyLift
 * db://assets/scripts/Scene/OtherUI/UISkyLift/ItemPrizeNotiSkyLift.ts
*
*/
import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { IPrize } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
const { ccclass, property } = _decorator;

@ccclass('ItemPrizeNotiSkyLift')
export class ItemPrizeNotiSkyLift extends Component {
    @property(Sprite) spIc: Sprite;
    @property(Label) lbPrizeShadow: Label;
    @property(Label) lbPrize: Label;
    //==========================================
    //#region base
    public async SetUp(iPrize: IPrize) {
        let sfPrize = await MConfigResourceUtils.getImageItem(iPrize.typePrize, iPrize.typeReceivePrize)
        this.spIc.spriteFrame = sfPrize;
        this.lbPrizeShadow.string = iPrize.GetStringValue_2();
        this.lbPrize.string = iPrize.GetStringValue_2();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private 
    //#endregion private
    //==========================================

    //==========================================
    //#region public
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