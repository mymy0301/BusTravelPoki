/**
 * 
 * anhngoxitin01
 * Sun Dec 14 2025 11:56:30 GMT+0700 (Indochina Time)
 * BottomControlSys
 * db://assets/scripts/Scene/LobbyScene/BottomControlSys.ts
*
*/
import { _decorator, Component, Node, Widget } from 'cc';
import { MConfigs } from '../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('BottomControlSys')
export class BottomControlSys extends Component {
    @property(Widget) wdBottom: Widget;
    @property(Widget) listWdCustom: Widget[] = [];
    @property(Widget) listWdUpdateForce: Widget[] = [];

    //==========================================
    //#region base
    protected onLoad(): void {
        if (!MConfigs.isMobile) {
            this.wdBottom.bottom = 0;
            this.wdBottom.updateAlignment();

            this.listWdCustom.forEach((wdCustom, index) => {
                let needTurnOff = !wdCustom.enabled;
                wdCustom.enabled = true;
                wdCustom.bottom = wdCustom.bottom - 50;
                wdCustom.updateAlignment();
                wdCustom.enabled = needTurnOff ? false : true;
            })

            this.listWdUpdateForce.forEach((wdCustom, index) => {
                // let needTurnOff = !wdCustom.enabled;
                // wdCustom.enabled = true;
                // console.log(wdCustom.enabled);
                wdCustom.updateAlignment();
                // wdCustom.enabled = needTurnOff ? false : true;
            });
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
    //#endregion btn
    //==========================================
}