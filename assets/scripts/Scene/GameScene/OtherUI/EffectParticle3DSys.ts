import { _decorator, Component, instantiate, Node, ParticleSystem, Prefab, Quat, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { Utils } from '../../../Utils/Utils';
import { SoundSys } from '../../../Common/SoundSys';
import { GameSoundEffect } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('EffectParticle3DSys')
export class EffectParticle3DSys extends Component {
    @property(Prefab) Particle3D: Prefab = null;
    private _listNSparks: Node[] = [];

    protected onLoad(): void {
        clientEvent.on(MConst.EVENT.GEN_SPARKS, this.GenSpark, this);
        clientEvent.on(MConst.EVENT.PLAY_SPARKS, this.PlaySparks, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT.GEN_SPARKS, this.GenSpark, this);
        clientEvent.off(MConst.EVENT.PLAY_SPARKS, this.PlaySparks, this);
    }

    private GenSpark(): void {
        if (this.Particle3D == null) { return; }
        if (this._listNSparks.length == 0) {
            const sizeWindow = Utils.getSizeWindow();
            for (let i = 0; i < 2; i++) {
                let node = instantiate(this.Particle3D);
                node.active = false;
                this.node.addChild(node);
                this._listNSparks.push(node);

                if (i == 0) {
                    node.setPosition(sizeWindow.width / 2, - sizeWindow.height / 2, 1);
                    node.eulerAngles = new Vec3(90, 0, 0);
                    node.setScale(100, 100, 100);
                } else {
                    node.setPosition(-sizeWindow.width / 2, - sizeWindow.height / 2, 1);
                    node.eulerAngles = new Vec3(90, -180, 0);
                    node.setScale(100, 100, 100);
                }
            }
        }
    }

    private async PlaySparks() {
        if (this._listNSparks.length != 2) { return; }
        SoundSys.Instance.playSoundEffectOneShot(GameSoundEffect.CONFETII);
        for (let i = 0; i < 2; i++) {
            let node = this._listNSparks[i];
            node.getComponent(ParticleSystem).stop();
            node.active = false;
            node.active = true;
            node.getComponent(ParticleSystem).play();
        }
    }
}


