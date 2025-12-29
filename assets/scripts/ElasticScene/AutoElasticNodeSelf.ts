import { _decorator, Component, Node, UITransform } from 'cc';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('AutoElasticNodeSelf')
export class AutoElasticNodeSelf extends Component {
    protected onLoad(): void {
        const scaleSize: number = Utils.getRightScaleSizeWindow();
        this.scaleUI(scaleSize);
    }

    private scaleUI(scaleSize: number) {
        let comUITrans = this.node.getComponent(UITransform);
        let wBg = comUITrans.width * scaleSize;
        let hBg = comUITrans.height * scaleSize;
        comUITrans.setContentSize(wBg, hBg);
    }
}


