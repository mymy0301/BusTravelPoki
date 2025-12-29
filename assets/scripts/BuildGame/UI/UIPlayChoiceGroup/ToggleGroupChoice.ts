import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 * anhngoxitin01
 * Thu Aug 07 2025 11:13:09 GMT+0700 (Indochina Time)
 * ToggleGroupChoice
 * db://assets/scripts/BuildGame/UI/UIPlayChoiceGroup/ToggleGroupChoice.ts
 *
 */

@ccclass('ToggleGroupChoice')
export class ToggleGroupChoice extends Component {
    @property(Label) lbGroup: Label;
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
    public SetNameToggle(name: string){
        this.lbGroup.string = name;
    }
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