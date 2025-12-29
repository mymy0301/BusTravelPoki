import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
const { ccclass, property } = _decorator;

@ccclass('UICustom')
export class UICustom extends UIBaseSys {
    @property(Node) nContent: Node;
    @property(Prefab) pfCustomTrail: Prefab;

    protected onLoad(): void {
        // gen customTrail to it
        let nCustomTrail = instantiate(this.pfCustomTrail);
        this.nContent.addChild(nCustomTrail);
    }
}


