import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { ItemEffectCarCollie } from './ItemEffectCarCollie';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('EffectsCarCollieSys')
export class EffectsCarCollieSys extends Component {
    @property(Prefab)
    itemEfxCarColliePrefab:Prefab = null;

    @property(Node)
    poolParentNode:Node;

    poolEfxs:ItemEffectCarCollie[] = [];
    
    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.SHOW_EFFECT_CAR_COLLIE, this.showEfxCarCollie, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.SHOW_EFFECT_CAR_COLLIE, this.showEfxCarCollie, this);
    }


    getItem(){
        for(let i=0; i< this.poolEfxs.length;i++){
            if(!this.poolEfxs[i].node.active){
                return this.poolEfxs[i];
            }
        }

        let obj = instantiate(this.itemEfxCarColliePrefab);
        obj.parent = this.poolParentNode;
        let itemEfx =  obj.getComponent(ItemEffectCarCollie)
        this.poolEfxs.push(itemEfx);
        return itemEfx;
    }

    showEfxCarCollie(worldPos:Vec3){
        let item = this.getItem();
        item.showEfx(worldPos);
        item.node.active = true;
    }
}


