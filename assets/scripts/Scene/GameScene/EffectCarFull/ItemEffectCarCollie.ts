import { _decorator, Component, Node, ParticleSystem, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemEffectCarCollie')
export class ItemEffectCarCollie extends Component {
    @property(ParticleSystem)
    arrEfxs: ParticleSystem[] = [];

    showEfx(worldPos:Vec3){
        this.node.active = true;
        this.node.worldPosition = worldPos;
        for(let i=0;i<this.arrEfxs.length;i++){
            this.arrEfxs[i].play();
        }

        this.scheduleOnce(() => {
            this.node.active = false;
        },5);
    }
}


