import { _decorator, CCBoolean, CCString, Component, instantiate, Node, ParticleSystem, Vec3, CurveRange, CCFloat } from 'cc';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('UIBlinh')
export class UIBlinh extends Component {
    @property(Vec3) posBlinh: Vec3 = new Vec3(0, 0, 0);
    @property(Node) nParent: Node;
    @property(CCBoolean) isAutoLoad: boolean = false;
    @property(CCFloat) constant_rate_over_time = 2;
    private _nBlinh: Node = null;

    protected start(): void {
        if (this.isAutoLoad) {
            this.InitParticle();
        }
    }

    public IsInit() { return this._nBlinh != null; }

    public async InitParticle() {
        let prefabBlinh = await MConfigResourceUtils.LoadVFX(MConst.PATH_VFX.BLINH, MConst.BUNDLE_GAME);
        this._nBlinh = instantiate(prefabBlinh);
        if (this.nParent == null) {
            this._nBlinh.setParent(this.node);
        } else {
            this._nBlinh.setParent(this.nParent);
        }

        this._nBlinh.setPosition(this.posBlinh);

        let curveRange_rate_over_time = new CurveRange();
        curveRange_rate_over_time.mode = CurveRange.Mode.Constant;
        curveRange_rate_over_time.constant = this.constant_rate_over_time;
        this._nBlinh.getComponent(ParticleSystem).rateOverTime = curveRange_rate_over_time;
    }

    public HideBlinh() {
        this._nBlinh.active = false;
    }

    public ShowBlinh() {
        this._nBlinh.active = true;
    }
}


