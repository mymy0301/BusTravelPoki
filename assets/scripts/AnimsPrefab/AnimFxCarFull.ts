import { _decorator, Component, Node } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('AnimFxCarFull')
export class AnimFxCarFull extends AnimPrefabsBase {
    public async playAnimFX() {
        try {
            this.PlayAnim('fx_eat');
            await Utils.delay(this.GetTimeAnim('fx_eat') * 1000);
            this.node.active = false;
        } catch (e) { }
    }
}


