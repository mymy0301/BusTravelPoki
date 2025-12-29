import { _decorator, Component, Node, ResolutionPolicy, Size, View } from 'cc';
import { Utils } from '../Utils/Utils';
import { MConfigs } from '../Configs/MConfigs';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('GameElasticSys')
export class GameElasticSys {
    public elasticGame() {
        // cacul the width and height of scene and choice what type to elastic 
        let sizeScene: Size = Utils.getSizeWindow();
        if(MConfigs.isMobile){
            View.instance.setDesignResolutionSize(sizeScene.width , sizeScene.height , 3);
        }else{
            View.instance.setDesignResolutionSize(MConst.DEFAULT_DESKTOP_WIDTH , MConst.DEFAULT_DESKTOP_HEIGHT , ResolutionPolicy.SHOW_ALL);
        }
    }
}


