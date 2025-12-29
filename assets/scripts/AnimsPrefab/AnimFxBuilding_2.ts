import { _decorator, Component, Node, ParticleSystem } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimFxBuilding_2')
export class AnimFxBuilding_2 extends Component {
    @property(ParticleSystem) particle: ParticleSystem;

    protected onDisable(): void {
        this.Stop();
    }

    Play() {
        this.Stop();
        this.particle.play();
    }

    Stop() {
        this.particle.stop();
        this.particle.clear();
    }

    GetTime() {
        return this.particle.duration / this.particle.simulationSpeed + this.particle.startDelay.constantMax;
    }
}


