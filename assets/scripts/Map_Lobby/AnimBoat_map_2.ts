import { _decorator, Color, Component, Node, tween } from 'cc';
import { AnimPrefabsBase } from '../AnimsPrefab/AnimPrefabBase';
const { ccclass, property } = _decorator;

const NameAnimBoat_map_2 = "map2_thuyen";

@ccclass('AnimBoat_map_2')
export class AnimBoat_map_2 extends AnimPrefabsBase {
    public PlayAnimBoatIdle_Show() {
        this.PlayAnimLoopWithDelay(NameAnimBoat_map_2, 0, true);
        this.MEffect.color = new Color(255, 255, 255, 0);
        const timeApearSubCons = 1;
        const self = this;
        tween(this.MEffect)
            .to(timeApearSubCons, {}, {
                onUpdate(target, ratio) {
                    self.MEffect.color = new Color(255, 255, 255, ratio * 255);
                },
            })
            .start();
    }

    public PlayDataCustom(nameDataCustom: string) {
        this.PlayAnimLoopWithDelay(nameDataCustom, 0, true);
    }

    public PlayAnimBoatIdle() {
        this.PlayAnimLoopWithDelay(NameAnimBoat_map_2, 0, true);
    }
}


