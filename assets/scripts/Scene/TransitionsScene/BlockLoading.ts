import { _decorator, Component, Node, Sprite, Tween, tween, UIOpacity } from 'cc';
import { MConst } from '../../Const/MConst';
import { MConfigs } from '../../Configs/MConfigs';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { PlayerData } from '../../Utils/PlayerData';
const { ccclass, property, disallowMultiple, requireComponent } = _decorator;

@ccclass('BlockLoading')
@requireComponent(UIOpacity)
@disallowMultiple
export class BlockLoading extends Component {

    @property(Sprite) icon: Sprite;
    @property(Sprite) bgBlock: Sprite;
    
    public Show() {
        const opaCom = this.node.getComponent(UIOpacity);
        opaCom.opacity = 0;
        this.node.active = true;
        const timeShow = 0.5;
        tween(opaCom)
            .to(timeShow, { opacity: 255 })
            .start();
    }

    public Hide() {
        Tween.stopAllByTarget(this.node);
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.active = false;
    }
}


