import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { SmokeCarSys } from './SmokeCarSys';
import { ObjectPool } from '../../../Utils/ObjPool';
const { ccclass, property } = _decorator;

@ccclass('ListSmokeCarSys')
export class ListSmokeCarSys extends Component {
    public static Instance: ListSmokeCarSys = null
    @property(Prefab) pfSmokeCar: Prefab;
    @property(Node) nTemp: Node;
    private mObjPool: ObjectPool = new ObjectPool();
    private _defaultScale: Vec3 = new Vec3(50, 50, 50);

    protected onLoad(): void {
        if (ListSmokeCarSys.Instance == null) {
            ListSmokeCarSys.Instance = this;
            this.mObjPool.InitObjectPool(this.nTemp, this.pfSmokeCar, this.nTemp);
        }
    }

    protected onDestroy(): void {
        ListSmokeCarSys.Instance = null;
    }

    // #region object pool
    public InitObject(): Node {
        return this.mObjPool.GetObj();
    }

    public ReUseObject(objSmokeCar: Node) {
        if (!this.nTemp.isValid) return;
        objSmokeCar.getComponent(SmokeCarSys).StopSmoke();
        objSmokeCar.scale = this._defaultScale;
        this.mObjPool.ReUseObj4(objSmokeCar);
    }
    // #endregion object pool
}


