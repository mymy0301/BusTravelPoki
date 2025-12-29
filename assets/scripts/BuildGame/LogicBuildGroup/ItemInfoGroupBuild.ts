import { _decorator, CCInteger, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 * anhngoxitin01
 * Sun Sep 07 2025 15:49:46 GMT+0700 (Indochina Time)
 * ItemInfoGroupBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/ItemInfoGroupBuild.ts
 *
 */

@ccclass('ItemInfoGroupBuild')
export class ItemInfoGroupBuild extends Component {
    @property(CCInteger) idColor: number = 0;
    @property(Label) lbNumColorRemaining: Label;
    private _numNow: number = 0; public get NumNow(): number { return this._numNow; }
    //==========================================
    //#region base
    public SetUp(numColorRemaining: number) {
        this._numNow = numColorRemaining;
        this.lbNumColorRemaining.string = `: ${numColorRemaining}`;
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