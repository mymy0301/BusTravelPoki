import { _decorator, Component, Node, Vec3 } from 'cc';
import { Utils } from '../Utils/Utils';
import { MConfigs } from '../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('BackgroundScaleManager')
export class BackgroundScaleManager extends Component {
    start() {
        
        // console.log("BackgroundScaleManager", Utils.getScaleWindow());
        if(MConfigs.isMobile){
            this.node.setScale(new Vec3(Utils.getScaleWindow(), Utils.getScaleWindow(), 1));
        }else{
            this.node.setScale(new Vec3(960/720, 960/720, 1));
        }
        
    }
}


