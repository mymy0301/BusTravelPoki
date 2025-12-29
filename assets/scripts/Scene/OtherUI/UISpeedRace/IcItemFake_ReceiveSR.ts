import { _decorator, AnimationComponent, Component, Node, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

enum NAME_ANIM_ITEM_FAKE_SR {
    IDLE = "Idle_item_fake",
    BUBLE = "Buble_item_fake"
}

@ccclass('IcItemFake_ReceiveSR')
export class IcItemFake_ReceiveSR extends Component {
    @property(ParticleSystem) particleSys: ParticleSystem;
    @property(AnimationComponent) animComItemFake: AnimationComponent;

    protected onEnable(): void {
        this.particleSys.play();
    }

    public PlayAnimIdle() {
        this.animComItemFake.play(NAME_ANIM_ITEM_FAKE_SR.IDLE);
    }

    public PlayAnimBuble() {
        this.animComItemFake.play(NAME_ANIM_ITEM_FAKE_SR.BUBLE);
    }

    private EventAnimPlayParticleItemFake() {
        this.particleSys.node.worldPosition = this.node.worldPosition.clone().add3f(0, 0, 1);
        this.particleSys.stop();
        this.particleSys.play();
    }
}


