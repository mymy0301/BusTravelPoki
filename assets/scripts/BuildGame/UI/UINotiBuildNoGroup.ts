/**
 * 
 * anhngoxitin01
 * Fri Nov 21 2025 09:14:14 GMT+0700 (Indochina Time)
 * nUINotiBuildNoGroup
 * db://assets/scripts/BuildGame/UI/nUINotiBuildNoGroup.ts
*
*/
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UINotiBuildNoGroup')
export class UINotiBuildNoGroup extends Component {
    private _cbResult: (result: boolean) => void = null;

    public SetCb(cbResult: (result: boolean) => void) { this._cbResult = cbResult; }
    public Show() { this.node.active = true; }

    public BtnYes() { this._cbResult && this._cbResult(true); this.node.active = false; }
    public BtnNo() { this._cbResult && this._cbResult(false); this.node.active = false; }
}