import { _decorator, Component, Node } from 'cc';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ElasticPosBase')
export class ElasticPosBase extends Component {
    protected onLoad(): void {
        const _basePos = this.node.position.clone();
        const _scaleSize = Utils.getRightScaleSizeWindow();
        const _rightPos = _basePos.multiplyScalar(_scaleSize);
        this.node.position = _rightPos;
    }
}


