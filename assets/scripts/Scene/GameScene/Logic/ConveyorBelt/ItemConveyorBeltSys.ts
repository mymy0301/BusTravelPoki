import { _decorator, Component, Node, PolygonCollider2D, RigidBody2D, Vec2, Vec3 } from 'cc';
import { CarSys } from '../CarSys';
const { ccclass, property } = _decorator;

enum STATE_ITEM_CONVEYOR_BELT {
    SHOW,
    UNSHOW
}
@ccclass('ItemConveyorBeltSys')
export class ItemConveyorBeltSys extends Component {
    private _nCar: Node = null;
    private _nColliderNode: Node = null;

    private _cbAddCarToQueue: CallableFunction = null;
    private _cbGetCarToUse: CallableFunction = null;
    private _cbGetHolderCar: CallableFunction = null;
    private _cbReUseHolderCar: CallableFunction = null;

    private _stateItem: STATE_ITEM_CONVEYOR_BELT = STATE_ITEM_CONVEYOR_BELT.UNSHOW;

    public get IdCar(): number {
        if (this._nCar == null) { return -1; }
        return this._nCar.getComponent(CarSys).InfoCar.idCar;
    }

    public Init(cbAddCarToQueue: CallableFunction, cbGetCarToUse: CallableFunction, cbGetHolderCar: CallableFunction, cbReUseHolderCar: CallableFunction) {
        this._cbAddCarToQueue = cbAddCarToQueue;
        this._cbGetCarToUse = cbGetCarToUse;
        this._cbGetHolderCar = cbGetHolderCar;
        this._cbReUseHolderCar = cbReUseHolderCar;

        this._stateItem = STATE_ITEM_CONVEYOR_BELT.UNSHOW;
    }

    public UpdateManual() {
        this._stateItem = STATE_ITEM_CONVEYOR_BELT.SHOW;
        const nCar = this._cbGetCarToUse();
        this.SetCarChild(nCar);
        this.SetPlaceHolderCar();
    }

    public SetCarChild(nSet: Node) {
        if (nSet == null) {
            this._nCar = null;
        } else {
            this._nCar = nSet;
            nSet.setParent(this.node);
            nSet.setSiblingIndex(0);
            nSet.position = Vec3.ZERO;
            nSet.active = true;
        }
    }

    public SetPlaceHolderCar() {
        const nPlaceHolder = this._cbGetHolderCar(this.node, this.IdCar);
        if (nPlaceHolder != null) {
            this._nColliderNode = nPlaceHolder;
            this._nColliderNode.setParent(this.node);
            this._nColliderNode.position = Vec3.ZERO;
            this._nColliderNode.active = true;
        }
    }

    public TryActiveNGoods(active: boolean) {
        if (active) {
            // console.log("show car");
            if (this._stateItem == STATE_ITEM_CONVEYOR_BELT.UNSHOW) {
                this._stateItem = STATE_ITEM_CONVEYOR_BELT.SHOW;
                const nCar = this._cbGetCarToUse();
                this.SetCarChild(nCar);
                this.SetPlaceHolderCar();
            }
        } else {
            // console.log("unshow Car");
            if (this._stateItem == STATE_ITEM_CONVEYOR_BELT.SHOW) {
                this._stateItem = STATE_ITEM_CONVEYOR_BELT.UNSHOW;
                this._cbAddCarToQueue(this.IdCar);
                this._cbReUseHolderCar(this.IdCar);
            }
        }
    }
}


