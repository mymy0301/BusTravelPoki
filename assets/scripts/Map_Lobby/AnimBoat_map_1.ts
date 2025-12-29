import { _decorator, Color, Component, Node, tween } from 'cc';
import { AnimPrefabsBase } from '../AnimsPrefab/AnimPrefabBase';
const { ccclass, property } = _decorator;

enum NameAnimBoat_map_1 {
    Boat_idle = 'thuyen_1',
    Boat_pre_idle = 'thuyen_2',
    Boat_subs_idle_down_left = `thuyen_3`,
    Boat_subs_idle_top_left = 'thuyen_4',
}

@ccclass('AnimBoat_map_1')
export class AnimBoat_map_1 extends AnimPrefabsBase {
    private timeApearSubCons: number = 1;

    public PlayAnimBoatIdle_Show() {
        this.PlayAnimLoopWithDelay(NameAnimBoat_map_1.Boat_idle, 0, true);
        this.MEffect.color = new Color(255, 255, 255, 0);
        const self = this;
        tween(this.MEffect)
            .to(self.timeApearSubCons, {}, {
                onUpdate(target, ratio) {
                    self.MEffect.color = new Color(255, 255, 255, ratio * 255);
                },
            })
            .start();
    }

    public GetTimeShow() {
        return this.timeApearSubCons;
    }

    public PlayDataCustom(nameDataCustom: string) {
        this.PlayAnimLoopWithDelay(nameDataCustom, 0, true);
    }

    public PlayAnimIdle() {
        this.PlayAnimLoopWithDelay(NameAnimBoat_map_1.Boat_pre_idle, 0, true);
    }
}


