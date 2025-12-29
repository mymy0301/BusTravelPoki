/**
 * 
 * anhngoxitin01
 * Sat Nov 08 2025 15:54:52 GMT+0700 (Indochina Time)
 * PageItem
 * db://assets/scripts/Common/UltimatePageView/PageItem.ts
*
*/
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PageItem')
export class PageItem extends Component {
    //#region override
    public TryCallDataUntilHaveData() { }
    public RegisterCb(...args) { }
    public async CBPrepareClose(): Promise<void> { }
    public async CBCloseDone(): Promise<void> { }
    public async CBPrepareShow(): Promise<void> { }
    public async CBShowDone(): Promise<void> { }
    //#endregion ovveride
}