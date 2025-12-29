import { _decorator, Component, EventTouch, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TriggerDragNode')
export class TriggerDragNode extends Component {
    private originalWPoThisNode: Vec3 = Vec3.ZERO;
    private originalWPosVisual: Vec3 = Vec3.ZERO;
    private _nVisual: Node = null;
    private _distanceToMove: Vec2 = new Vec2(50, -50);
    private _cbDragDone: CallableFunction = null;

    public InitToMove(nVisual: Node, cbWhenDragDone: CallableFunction) {
        this._nVisual = nVisual;
        this._cbDragDone = cbWhenDragDone;
        this.node.worldPosition = nVisual.worldPosition.clone().add3f(this._distanceToMove.x, this._distanceToMove.y, 0);
    }

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchCancel, this);
        this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.OnTouchCancel, this);
        this.node.off(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    }

    private OnTouchStart() {
        this.originalWPoThisNode = this.node.worldPosition.clone();
        this.originalWPosVisual = this._nVisual.worldPosition.clone();
    }
    private OnTouchMove(event: EventTouch) {
        this.ChangeWPos(this._nVisual, event.getUILocation(), this._distanceToMove);
        this.ChangeWPos(this.node, event.getUILocation());
    }
    private OnTouchCancel() {
        // reset to the original world position
        this._nVisual.worldPosition = this.originalWPosVisual;
        this.node.worldPosition = this.originalWPoThisNode;
    }
    private OnTouchEnd() {
        if (this._cbDragDone != null) {
            this._cbDragDone();
        }
    }

    //#reginon func ChangeWPos
    private ChangeWPos(nTarget: Node, wPos: Vec2, distanceToMove: Vec2 = Vec2.ZERO) {
        nTarget.setWorldPosition(new Vec3(wPos.x, wPos.y, 0).subtract3f(distanceToMove.x, distanceToMove.y, 0));
    }
    //#endregion func ChangeWPos
}


