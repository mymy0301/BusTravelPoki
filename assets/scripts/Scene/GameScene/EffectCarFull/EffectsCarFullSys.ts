import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Item } from 'electron/main';
import { ItemEffectCarFull } from './ItemEffectCarFull';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { AnimFxCarFull } from '../../../AnimsPrefab/AnimFxCarFull';
const { ccclass, property } = _decorator;

@ccclass('EffectsCarFullSys')
export class EffectsCarFullSys extends Component {

    @property(Prefab)
    itemEfxCarFullPrefab: Prefab = null;

    @property(Node)
    poolParentNode: Node;

    poolEfxs: ItemEffectCarFull[] = [];

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.SHOW_EFFECT_CAR_FULL, this.showEfxCarFull_2, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.SHOW_EFFECT_CAR_FULL, this.showEfxCarFull_2, this);
    }


    getItem() {
        for (let i = 0; i < this.poolEfxs.length; i++) {
            if (!this.poolEfxs[i].node.active) {
                return this.poolEfxs[i];
            }
        }

        let obj = instantiate(this.itemEfxCarFullPrefab);
        obj.parent = this.poolParentNode;
        let itemEfx = obj.getComponent(ItemEffectCarFull)
        this.poolEfxs.push(itemEfx);
        return itemEfx;
    }

    showEfxCarFull(worldPos: Vec3) {
        let item = this.getItem();
        item.showEfx(worldPos);
        item.node.active = true;
    }


    @property(Prefab)
    itemEfxCarFullPrefab_2: Prefab = null;

    poolEfxs_2: AnimFxCarFull[] = [];

    getItem_2() {
        for (let i = 0; i < this.poolEfxs_2.length; i++) {
            if (!this.poolEfxs_2[i].node.active) {
                return this.poolEfxs_2[i];
            }
        }

        let obj = instantiate(this.itemEfxCarFullPrefab_2);
        obj.parent = this.poolParentNode;
        let itemEfx = obj.getComponent(AnimFxCarFull);
        this.poolEfxs_2.push(itemEfx);
        return itemEfx;
    }

    showEfxCarFull_2(worldPos: Vec3) {
        let item = this.getItem_2();
        item.node.worldPosition = worldPos.clone();
        item.playAnimFX();
        item.node.active = true;
    }
}


