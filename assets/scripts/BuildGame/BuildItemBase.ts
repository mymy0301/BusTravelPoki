import { _decorator, CCBoolean, Component, error, EventTouch, Input, input, Node, tween, Vec2, Vec3, KeyCode, EventKeyboard } from 'cc';
import { Utils } from '../Utils/Utils';
import { MouseZoom } from './Utils/MouseZoom';
const { ccclass, property } = _decorator;

export interface IBuildItemBase {
    DragDone(): void;
    WarningObject(): void;
    ChoicingObject(): void;
    UnChoicingObject(): void;
    SetObjectInBuildGameChoicing(node: Node): void;
}

export interface ITouchItem {
    IsChoiceThisObject(): boolean;
    MoveObj(touchMove: Vec2): void;
    RotateObj(): void;
}

@ccclass('BuildItemBase')
export class BuildItemBase extends Component {
    @property(Node) nTouch: Node;
    @property(CCBoolean) autoRotateWhenClick: boolean = false;
    private _iBuildItemBase: IBuildItemBase = null;
    private _iTouchItem: ITouchItem = null;

    protected onLoad(): void {
        this.nTouch.on(Node.EventType.TOUCH_START, this.OnTouchStarObj, this);
        this.nTouch.on(Node.EventType.TOUCH_MOVE, this.OnTouchMoveObj, this);
        this.nTouch.on(Node.EventType.TOUCH_END, this.OnTouchEndObj, this);
        this.nTouch.on(Node.EventType.TOUCH_CANCEL, this.OnTouchCancelObj, this);
    }

    protected onDestroy(): void {
        if (this.nTouch != null && this.nTouch.isValid) {
            this.nTouch.off(Node.EventType.TOUCH_START, this.OnTouchStarObj, this);
            this.nTouch.off(Node.EventType.TOUCH_MOVE, this.OnTouchMoveObj, this);
            this.nTouch.off(Node.EventType.TOUCH_END, this.OnTouchEndObj, this);
            this.nTouch.off(Node.EventType.TOUCH_CANCEL, this.OnTouchCancelObj, this);
        }
        this.UnRegisterKey();
    }

    //#region func Init
    public RegisterKey() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    public UnRegisterKey() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    public Init(iBuildItemBase: IBuildItemBase, iTouchItem: ITouchItem) {
        this._iBuildItemBase = iBuildItemBase;
        this._iTouchItem = iTouchItem;
    }
    //#endregion func Init

    //#region touch object

    private readonly distanceToChangeFunc: number = 20;
    protected canRotate: boolean = false;
    protected firstTouch: Vec2 = Vec2.ZERO;
    protected isChoiceThisCar: boolean = false;

    private isMoveWithNetVisual: boolean = false;
    private isSpeedMoveWithKey: boolean = false;

    protected OnTouchStarObj(eventTouch: EventTouch) {
        if (!this._iTouchItem.IsChoiceThisObject()) {
            this._iBuildItemBase.SetObjectInBuildGameChoicing(this.node);
            this._iBuildItemBase.ChoicingObject();
        } else {
            this.isChoiceThisCar = true;
            this.canRotate = true;

            const currentTouch = MouseZoom.Instance.getPointInCamera(eventTouch.getLocation());
            this.firstTouch = currentTouch;
        }
    }
    protected OnTouchMoveObj(eventTouch: EventTouch) {
        if (!this._iTouchItem.IsChoiceThisObject() || !this.isChoiceThisCar) { return }

        const currentTouch = MouseZoom.Instance.getPointInCamera(eventTouch.getLocation()).clone();

        if (this.canRotate && Vec2.distance(currentTouch, this.firstTouch) > this.distanceToChangeFunc) {
            this.canRotate = false;
            this._iTouchItem.MoveObj(currentTouch);
        } else if (!this.canRotate) {
            // kiểm tra trong trường hợp nếu như không di chuyển vật thể bằng lưới => sẽ di chuyển vật thể chính xác đến vị trí đấy
            if (!this.isMoveWithNetVisual) {
                this._iTouchItem.MoveObj(currentTouch);
            }
            /* kiểm tra trong trường hợp nếu như di chuyển bằng lưới 
            * 1. Tính toán chính xác vùng di chuyển đang ở ô nào => ta sẽ di chuyển vật thể đó đến tâm ô đó
            */
            else {
                const centerSquare = convertPointToCenterSquare(currentTouch);
                this._iTouchItem.MoveObj(centerSquare);
            }
        }
    }
    protected OnTouchEndObj(eventTouch: EventTouch) {
        if (!this._iTouchItem.IsChoiceThisObject()) { return }
        if (this.isChoiceThisCar) {
            if (this.autoRotateWhenClick && this.canRotate) {
                this._iTouchItem.RotateObj();
            }
        }

        // reset data info touch
        this.isChoiceThisCar = false;
        this.canRotate = false;
        this.firstTouch = Vec2.ZERO;
    }
    protected OnTouchCancelObj(eventTouch: EventTouch) {
        if (!this._iTouchItem.IsChoiceThisObject()) { return }
        // not do any thing in here
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.CTRL_LEFT: case KeyCode.CTRL_RIGHT:
                // check if item is choicing
                this.isMoveWithNetVisual = true;
                break;
            case KeyCode.SHIFT_LEFT: case KeyCode.SHIFT_RIGHT:
                this.isSpeedMoveWithKey = true;
                break;
            case KeyCode.ARROW_DOWN:
                this.SetKeyOn(KeyCode.ARROW_DOWN);
                this.MoveObjByKey();
                break;
            case KeyCode.ARROW_RIGHT:
                this.SetKeyOn(KeyCode.ARROW_RIGHT);
                this.MoveObjByKey();
                break;
            case KeyCode.ARROW_LEFT:
                this.SetKeyOn(KeyCode.ARROW_LEFT);
                this.MoveObjByKey();
                break;
            case KeyCode.ARROW_UP:
                this.SetKeyOn(KeyCode.ARROW_UP);
                this.MoveObjByKey();
                break;
        }
    }

    private onKeyPressing(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.SHIFT_LEFT: case KeyCode.SHIFT_RIGHT:
                this.MoveObjByKey();
                break;
            case KeyCode.ARROW_DOWN:
                this.MoveObjByKey();
                break;
            case KeyCode.ARROW_RIGHT:
                this.MoveObjByKey();
                break;
            case KeyCode.ARROW_LEFT:
                this.MoveObjByKey();
                break;
            case KeyCode.ARROW_UP:
                this.MoveObjByKey();
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.CTRL_LEFT: case KeyCode.CTRL_RIGHT:
                this.isMoveWithNetVisual = false;
                break;
            case KeyCode.SHIFT_LEFT: case KeyCode.SHIFT_RIGHT:
                this.isSpeedMoveWithKey = false;
                break;
            case KeyCode.ARROW_DOWN:
                this.SetKeyOff(KeyCode.ARROW_DOWN);
                break;
            case KeyCode.ARROW_RIGHT:
                this.SetKeyOff(KeyCode.ARROW_RIGHT);
                break;
            case KeyCode.ARROW_LEFT:
                this.SetKeyOff(KeyCode.ARROW_LEFT);
                break;
            case KeyCode.ARROW_UP:
                this.SetKeyOff(KeyCode.ARROW_UP);
                break;
        }
    }
    //#endregion touch object
    //===============================

    //===============================
    //#region MoveObj

    private mapKeyOn: Map<number, boolean> = new Map();
    private SetKeyOn(key: number) {
        if (this.mapKeyOn.get(key) == null) {
            this.mapKeyOn.set(key, true);
        }
        this.mapKeyOn.set(key, true);
    }
    private SetKeyOff(key: number) {
        if (this.mapKeyOn.get(key) == null) {
            this.mapKeyOn.set(key, false);
        }
        this.mapKeyOn.set(key, false);
    }
    public MoveObjByKey() {
        const posObj = this.node.position.clone();
        const diffPos = this.isSpeedMoveWithKey ? 20 : 10;
        let newPosObj: Vec3 = posObj.clone();
        if (this.mapKeyOn.get(KeyCode.ARROW_UP)) {
            newPosObj.add3f(0, diffPos, 0);
        }
        if (this.mapKeyOn.get(KeyCode.ARROW_DOWN)) {
            newPosObj.add3f(0, -diffPos, 0);
        }
        if (this.mapKeyOn.get(KeyCode.ARROW_LEFT)) {
            newPosObj.add3f(-diffPos, 0, 0);
        }
        if (this.mapKeyOn.get(KeyCode.ARROW_RIGHT)) {
            newPosObj.add3f(diffPos, 0, 0);
        }

        this.node.position = newPosObj;
    }
    //#endregion MoveObj
    //===============================
}

function convertPointToCenterSquare(point: Vec2): Vec2 {

    const squareSize = 5;
    const distanceEachSquare = 0;

    // ===============  tính lấy phần dư của point ================
    let indexSquareX = Math.round(point.x / (distanceEachSquare + squareSize));
    let indexSquareY = Math.round(point.y / (distanceEachSquare + squareSize));

    //================= tính centerPoint của indexSquare ==================
    const centerPointX = indexSquareX * (distanceEachSquare + squareSize);
    const centerPointY = indexSquareY * (distanceEachSquare + squareSize);

    return new Vec2(centerPointX, centerPointY);
}


