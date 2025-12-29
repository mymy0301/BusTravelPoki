import { _decorator, Component, Node, UITransform } from 'cc';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('AutoElasticNodeSelf_Width')
export class AutoElasticNodeSelf_Width extends Component {
    protected onLoad(): void {
        const SSDefault = Utils.getSizeDefault();
        const SSWindow = Utils.getSizeWindow();

        if (SSDefault.width > SSWindow.width) {
            let comUITrans = this.node.getComponent(UITransform);
            comUITrans.setContentSize(SSWindow.width, comUITrans.height);
        }
    }
}


