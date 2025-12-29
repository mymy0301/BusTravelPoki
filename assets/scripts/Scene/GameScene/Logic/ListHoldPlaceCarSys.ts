import { _decorator, Component, ERigidBody2DType, instantiate, Node, PolygonCollider2D, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { GROUP_COLLIDER, TAG_COLLIDER } from '../../../Utils/Types';
import { HoldPlaceCarSys } from './HoldPlaceCarSys';
const { ccclass, property } = _decorator;

@ccclass('ListHoldPlaceCarSys')
export class ListHoldPlaceCarSys extends Component {
    @property(Node) nSetHoldMap: Node;
    @property(Node) nReuseHoldMap: Node;
    private mapHoldPlaceCar: Map<number, Node> = new Map();

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.INIT_HOLD_PLACE_CAR, this.InitHoldPlaceCar, this);
        clientEvent.on(MConst.EVENT.REMOVE_HOLD_PLACE_CAR, this.ReuseHoldMap, this);
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetGame, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.INIT_HOLD_PLACE_CAR, this.InitHoldPlaceCar, this);
        clientEvent.off(MConst.EVENT.REMOVE_HOLD_PLACE_CAR, this.ReuseHoldMap, this);
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetGame, this);
    }

    public NewGame() {
        this.mapHoldPlaceCar.forEach((value, key) => {
            this.ReuseHoldMap(key);
        })

        this.mapHoldPlaceCar = new Map();
    }

    private InitHoldPlaceCar(idCar: number, wPos: Vec3, listPoint: Vec2[], parentSet: Node = this.nSetHoldMap, cb: CallableFunction = null) {
        let nHoldMap = this.GetNHoldMap();
        nHoldMap.getComponent(HoldPlaceCarSys).SetIdCar(idCar);
        nHoldMap.getComponent(PolygonCollider2D).points = listPoint;
        nHoldMap.setParent(parentSet);
        nHoldMap.active = true;
        nHoldMap.worldPosition = wPos.clone();

        this.mapHoldPlaceCar.set(idCar, nHoldMap);

        if (cb != null) {
            cb(nHoldMap);
        }
    }

    //#region Optimize
    private ReuseHoldMap(idCar: number) {
        let nHoldMap = this.mapHoldPlaceCar.get(idCar);
        if (nHoldMap == null) {
            this.mapHoldPlaceCar.delete(idCar);
            return;
        };
        nHoldMap.active = false;
        nHoldMap.setParent(this.nReuseHoldMap);
        this.mapHoldPlaceCar.delete(idCar);
    }

    private GetNHoldMap(): Node {
        if (this.nReuseHoldMap.children.length > 0) {
            return this.nReuseHoldMap.children[0];
        } else {
            let nHoldMap = new Node();
            nHoldMap.addComponent(UITransform);
            nHoldMap.addComponent(PolygonCollider2D);
            nHoldMap.addComponent(RigidBody2D);
            nHoldMap.addComponent(HoldPlaceCarSys);
            const polygon = nHoldMap.getComponent(PolygonCollider2D);
            const rigidBody = nHoldMap.getComponent(RigidBody2D);

            polygon.group = GROUP_COLLIDER.DEFAULT;
            polygon.tag = TAG_COLLIDER.DEFAULT;
            rigidBody.group = GROUP_COLLIDER.DEFAULT;
            rigidBody.enabledContactListener = true;
            rigidBody.type = ERigidBody2DType.Static;
            rigidBody.gravityScale = 0;


            nHoldMap.active = false;

            return nHoldMap;
        }
    }

    private ResetGame() {
        this.mapHoldPlaceCar.forEach((value, key) => {
            value.active = false;
            value.setParent(this.nReuseHoldMap);
        })
        this.mapHoldPlaceCar.clear();
    }
    //#endregion 
}


