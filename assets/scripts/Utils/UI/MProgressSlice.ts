/**
 * 
 * anhngoxitin01
 * Fri Nov 07 2025 10:09:38 GMT+0700 (Indochina Time)
 * MProgressSlice
 * db://assets/scripts/Utils/UI/MProgressSlice.ts
*
*/
import { _decorator, CCFloat, Component, Node, Size, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MProgressSlice')
export class MProgressSlice extends Component {
    @property(CCFloat) maxW: number = 0;
    @property(Sprite) sp: Sprite;
    private _progress: number = 0;

    public get progress() { return this._progress; }
    public set progress(progressNew: number) { this._progress = progressNew; this.UpdateUI() }

    private UpdateUI() {
        const uiTrans = this.sp.getComponent(UITransform);
        if (uiTrans != null) {
            const oldContentSize = uiTrans.contentSize.clone();
            uiTrans.contentSize = new Size(this._progress * this.maxW, oldContentSize.y);
        }
    }
}