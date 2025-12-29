/**
 * 
 * anhngoxitin01
 * Fri Nov 21 2025 17:18:06 GMT+0700 (Indochina Time)
 * PatternLightDeco
 * db://assets/scripts/Scene/OtherUI/UIShop/PatternLightDeco.ts
*
*/
import { _decorator, CCBoolean, CCString, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PatternLightDeco')
export class PatternLightDeco extends Component {
    @property(Sprite) spPattern: Sprite;
    @property(CCString) seed: string = "seed";
    @property(CCBoolean) triggerRandom: boolean = false;

    protected update(dt: number): void {
        if(this.triggerRandom){
            this.triggerRandom = false;
        }
    }
}