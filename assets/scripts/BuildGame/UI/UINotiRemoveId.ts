/**
 * 
 * anhngoxitin01
 * Tue Nov 11 2025 08:45:10 GMT+0700 (Indochina Time)
 * UINotiRemoveId
 * db://assets/scripts/BuildGame/UI/UINotiRemoveId.ts
*
*/
import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UINotiRemoveId')
export class UINotiRemoveId extends Component {
    @property(Label) lbContent: Label;
    private _cbYes: CallableFunction = null;
    public Show(idRemove: number, cbYes: CallableFunction) {
        this.lbContent.string = `Bạn có chắc muốn xóa id ${idRemove}?`;
        this.node.active = true;
        this._cbYes = cbYes;
    }

    public Hide(){
        this.node.active = false;
    }

    public BtnYes(){
        this._cbYes && this._cbYes();
        this.Hide();
    }

    public BtnNo(){
        this.Hide();
    }
    //==========================================
    //#region base
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