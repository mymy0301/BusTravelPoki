import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Mon Aug 25 2025 15:51:20 GMT+0700 (Indochina Time)
 * ChoiceGroupBuild
 * db://assets/scripts/BuildGame/LogicBuildGroup/ChoiceGroupBuild.ts
 *
 */

@ccclass('ChoiceGroupBuild')
export class ChoiceGroupBuild extends Component {
    @property(Sprite) bg: Sprite;
    @property(Label) lbIndex: Label;
    private _cbChoiceSelf: CallableFunction = null;
    private _indexSet: number = 0;
    //==========================================
    //#region base
    public SetUp(index: number, cbChoice: CallableFunction) {
        this._indexSet = index;
        this.lbIndex.string = index.toString();
        this._cbChoiceSelf = cbChoice;
        this.UIUnChoice();
    }

    public UIChoice() {
        this.bg.color = Color.CYAN;
    }

    public UIUnChoice() {
        this.bg.color = Color.WHITE;
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
    private OnBtnSelf() {
        this._cbChoiceSelf && this._cbChoiceSelf(this._indexSet);
    }
    //#endregion btn
    //==========================================
}