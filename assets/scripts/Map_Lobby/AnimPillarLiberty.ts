import { _decorator, Color, Component, Node, tween } from 'cc';
import { AnimPrefabsBase } from '../AnimsPrefab/AnimPrefabBase';
const { ccclass, property } = _decorator;

enum NameAnimFireNuThan {
    Pillar_idle = 'building4',
    Pillar_end = 'building4_idle',
    Fire = 'building4_fire',
    Wave = 'buidling4_song'
}

@ccclass('AnimPillarLiberty')
export class AnimPillarLiberty extends AnimPrefabsBase {
    private timeApearSubCons = 0.5;

    public PlayAnimIdle_Show() {
        this.PlayAnimLoopWithDelay(NameAnimFireNuThan.Fire, 0, true);
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
}


