/**
 * 
 * anhngoxitin01
 * Tue Oct 28 2025 18:06:27 GMT+0700 (Indochina Time)
 * SupTutNormalBus
 * db://assets/scripts/Scene/OtherUI/UITutorialInGame/SupTutNormalBus.ts
*
*/
import { _decorator, Component, Node, RichText } from 'cc';
import { InfoUIBase } from '../../../DataBase/InfoUIBase';
const { ccclass, property } = _decorator;

@ccclass('SupTutNormalBus')
export class SupTutNormalBus extends Component {
    @property(Node) listNPolice: Node[] = [];
    @property(Node) listNMilitary: Node[] = [];
    @property(RichText) rt: RichText;
    @property(InfoUIBase) infoUIBase: InfoUIBase;

    //==========================================
    //#region base
    public PreShow(type: 'Police' | 'Military') {
        switch (type) {
            case 'Police':
                this.listNPolice.forEach(nPolice => nPolice.active = true);
                this.listNMilitary.forEach(nMilitary => nMilitary.active = false);
                this.rt.string = "<color=#1e2d8a>The POLICE car can carry\n<color=#2ea101>4 policemen</color></color>";
                break;
            case 'Military':
                this.listNPolice.forEach(nPolice => nPolice.active = false);
                this.listNMilitary.forEach(nMilitary => nMilitary.active = true);
                this.rt.string = "<color=#1e2d8a>The MILITARY vehicle can carry\n<color=#2ea101>4 soldiers</color></color>";
                break;
        }
    }

    public Show() {
        this.node.active = true;
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