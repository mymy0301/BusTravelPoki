import { _decorator, Component, Node, UITransform } from 'cc';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ElasticBase')
export class ElasticBase extends Component {
    public scaleUI(nScale: Node) {
        let scaleSize = Utils.getRightScaleSizeWindow();
        let comUITrans = nScale.getComponent(UITransform);
        let wBg = comUITrans.width * scaleSize;
        let hBg = comUITrans.height * scaleSize;
        comUITrans.setContentSize(wBg, hBg);
    }
}


