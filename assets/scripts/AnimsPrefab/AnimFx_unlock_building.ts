import { _decorator, AnimationComponent, CCInteger, Component, Node, ParticleSystem, UIOpacity } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimFx_unlock_building')
export class AnimFx_unlock_building extends Component {
    @property(ParticleSystem) particle: ParticleSystem;
    @property(CCInteger) typeAnim: 1 | 2 = 1;

    @property({ group: "Type2", type: AnimationComponent }) animCom: AnimationComponent = null;
    @property({ group: "Type2", type: Node }) nGlow: Node;

    protected onEnable(): void {
        switch (this.typeAnim) {
            case 2: this.nGlow.getComponent(UIOpacity).opacity = 0; break;
        }
    }

    protected onDisable(): void {
        this.Stop();
    }

    Play() {
        switch (this.typeAnim) {
            case 1:
                this.Stop();
                this.particle.play();
                break;
            case 2:
                this.Stop();
                this.animCom.play();
                break;
        }
    }

    Stop() {
        switch (this.typeAnim) {
            case 1:
                this.particle.stop();
                this.particle.clear();
                break;
        }
    }

    GetTime() {
        switch (this.typeAnim) {
            case 1: return this.particle.duration / this.particle.simulationSpeed + this.particle.startDelay.constantMax;
            case 2: return this.animCom.defaultClip.duration + this.particle.duration / this.particle.simulationSpeed + this.particle.startDelay.constantMax;
        }
    }

    PlayParticle() {
        try {
            this.particle.play();
        } catch (e) {

        }
    }
}


