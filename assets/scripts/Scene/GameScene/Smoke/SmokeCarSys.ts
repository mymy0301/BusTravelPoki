import { _decorator, Component, Node, ParticleSystem, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SmokeCarSys')
export class SmokeCarSys extends Component {
    @property(ParticleSystem) psSmoke: ParticleSystem;
    private _nNodeFollow: Node = null;

    protected update(dt: number): void {
        if (this._nNodeFollow != null && this._nNodeFollow.isValid) {
            this.node.worldPosition = this._nNodeFollow.worldPosition;
        }
    }

    public isSmokeStop(): boolean {
        return this.psSmoke.isEmitting;
    }

    public StopSmoke() {
        this.psSmoke.stopEmitting();
        this._nNodeFollow = null;
    }

    public PauseSmoke() {
        this.psSmoke.stopEmitting();
    }

    public StartSmoke(nNodeFollow: Node) {
        this.psSmoke.node.active = true;
        this.psSmoke.clear();
        this.psSmoke.play();

        this._nNodeFollow = nNodeFollow;
    }
}


