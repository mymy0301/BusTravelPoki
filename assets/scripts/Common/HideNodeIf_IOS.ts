import { _decorator, Component, Node } from 'cc';
import { ENV_TYPE, MConfigFacebook } from '../Configs/MConfigFacebook';
const { ccclass, property } = _decorator;

@ccclass('HideNodeIf_IOS')
export class HideNodeIf_IOS extends Component {
    start() {
        if(MConfigFacebook.Instance.envType == ENV_TYPE.FB){
            let platform = FBInstant.getPlatform();
            if (platform === "IOS") {
                this.node.active = false;
            }
        }
    }
}


