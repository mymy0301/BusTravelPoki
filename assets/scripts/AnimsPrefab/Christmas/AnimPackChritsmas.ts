/**
 * 
 * anhngoxitin01
 * Thu Oct 30 2025 08:59:28 GMT+0700 (Indochina Time)
 * AnimPackChritsmas
 * db://assets/scripts/AnimsPrefab/AnimPackChritsmas.ts
*
*/
import { _decorator, Component, Node, sp } from 'cc';
import { AnimPrefabsBase } from '../AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimPackChritsmas')
export class AnimPackChritsmas extends AnimPrefabsBase {
    public PlayPack1() {
        this.PlayAnim('idle', true);
        return;
    }
}