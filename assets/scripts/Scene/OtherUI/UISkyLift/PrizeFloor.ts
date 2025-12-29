/**
 * 
 * dinhquangvinhdev
 * Wed Aug 27 2025 16:44:00 GMT+0700 (Indochina Time)
 * PrizeFloor
 * db://assets/scripts/Scene/OtherUI/UISkyLift/PrizeFloor.ts
*
*/
import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { EVENT_SKY_LIFT } from './TypeSkyLift';
import { IPrize } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('PrizeFloor')
export class PrizeFloor extends Component {
    @property(Node) nParentNoti: Node;
    @property(Sprite) sfHead: Sprite;
    @property(Sprite) sfShadow: Sprite;
    @property(Sprite) sfBody: Sprite;
    private _dataPrize: IPrize[] = [];
    //==========================================
    //#region base
    public SetPrize(dataPrize: IPrize[]) {
        this._dataPrize = dataPrize;
    }
    public SetUI(listSfPrize: SpriteFrame[]) {
        if (listSfPrize.length == 3) {
            this.sfHead.spriteFrame = listSfPrize[0];
            this.sfShadow.spriteFrame = listSfPrize[1];
            this.sfBody.spriteFrame = listSfPrize[2];
        }
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
    public OnBtnSelf() {
        // console.log(this._dataPrize);
        clientEvent.dispatchEvent(EVENT_SKY_LIFT.NOTIFICATION, this.nParentNoti, this._dataPrize);
    }
    //#endregion btn
    //==========================================
}