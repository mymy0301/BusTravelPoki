/**
 * 
 * anhngoxitin01
 * Thu Oct 30 2025 08:59:28 GMT+0700 (Indochina Time)
 * AnimPackHalloween
 * db://assets/scripts/AnimsPrefab/AnimPackHalloween.ts
*
*/
import { _decorator, Component, Node, sp } from 'cc';
import { AnimPrefabsBase } from '../AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimPackHalloween')
export class AnimPackHalloween extends AnimPrefabsBase {
    public PlayPack1() {
        this.PlayAnim('pack1', true);
    }

    public PlayPack2() {
        this.PlayAnim('pack2', true);
    }

    public PlayPack3() {
        this.PlayAnim('pack3', true);
    }

    public PlayPack4() {
        this.PlayAnim('pack4', true);
    }
}