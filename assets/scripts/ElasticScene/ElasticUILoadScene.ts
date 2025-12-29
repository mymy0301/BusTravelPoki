import { _decorator, Component, Node, UITransform } from 'cc';
import { GameElasticSys } from './GameElasticSys';
import { Utils } from '../Utils/Utils';
import { ElasticBase } from './ElasticBase';
const { ccclass, property } = _decorator;

@ccclass('ElasticUILoadScene')
export class ElasticUILoadScene extends ElasticBase {
    @property(Node) bgHorizontal: Node;
    @property(Node) bgVertical: Node;
    private gameElasticSys: GameElasticSys = new GameElasticSys();

    protected onLoad(): void {
        this.gameElasticSys.elasticGame();
        this.scaleUI(this.bgHorizontal);
        this.scaleUI(this.bgVertical);
    }
}


