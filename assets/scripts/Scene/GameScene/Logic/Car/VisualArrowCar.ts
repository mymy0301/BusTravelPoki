import { _decorator, Component, Node, Sprite, SpriteFrame, tween, Tween, Vec3 } from 'cc';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { COLOR_KEY_LOCK, DIRECT_CAR, GetNameCarSize, ITypeCar, M_COLOR, TYPE_CAR_SIZE } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

enum TYPE_ARROW {
    NORMAL,
    MYSTERY,
    TWO_WAY,
    LOCK,
    KEY,
}

//TODO - quy về chỉ dùng một arrow => check lại trường hợp hiển thị arrow của xe mystery
@ccclass('VisualArrowCar')
export class VisualArrowCar extends Component {
    @property(Node) nArrow: Node;
    // @property(Node) nParentVisualMove: Node;
    // @property(Node) nParentVisualMystery: Node;

    private _pathArrowNormal: string = "";
    private _pathArrowQuestion: string = "";
    private _pathArrowTwoWayCar: string = "";
    private _pathArrowLock: string = "";
    private _pathArrowKey: string = "";

    private _typeArrow: TYPE_ARROW = null;

    public Init() {
        this._typeArrow = null;
    }

    //==========================================
    //#region normal
    /**
     * Set up sf arrow + update pos
     * @param directionCar 
     * @param sizeCar 
     */
    public SetUIArrowNormal(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        // load UI
        const pathArrow = MConfigResourceUtils.GetPathImageArrow(directionCar);

        // just load an call 1 time
        // if (this._pathArrowNormal != pathArrow) {
        this._pathArrowNormal = pathArrow;
        MConfigResourceUtils.GetImageArrowUntilLoad(pathArrow, (path, sfArrow: SpriteFrame) => {
            try {
                if (this._pathArrowNormal == path) {
                    this.nArrow.getComponent(Sprite).spriteFrame = sfArrow;
                }
            } catch (e) {

            }
        })

        // update Pos
        this.UpdatePosArrowNormal(directionCar, sizeCar);
        // }
    }

    /**
     * set angle + update Pos
     * @param directionCar 
     * @param sizeCar 
     */
    private UpdatePosArrowNormal(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        const posArrow = LIST_POS_ARROW[GetNameCarSize(sizeCar)][directionCar];
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_LEFT:
                this.nArrow.angle = 0;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.LEFT:
                this.nArrow.angle = 90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.RIGHT:
                this.nArrow.angle = -90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT:
                this.nArrow.angle = 0;
                this.nArrow.scale = new Vec3(-1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM:
                this.nArrow.angle = 180;
                this.nArrow.scale = Vec3.ONE;
                break;
        }

        this.nArrow.position = posArrow;
    }

    //#endregion normal
    //==========================================

    //==========================================
    //#region mystery car
    /**
     * Set up sf arrow + update pos
     * @param directionCar 
     * @param sizeCar 
     */
    public SetUIArrowMystery(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        //update spriteFrame
        const pathSfQuestion = MConfigResourceUtils.GetPathQuestion(directionCar);
        if (this._pathArrowQuestion != pathSfQuestion) {
            this._pathArrowQuestion = pathSfQuestion;
            MConfigResourceUtils.GetImageQuestionUntilLoad(pathSfQuestion, (pathSf: string, sf: SpriteFrame) => {
                try {
                    if (this._pathArrowQuestion == pathSf) {
                        this.nArrow.getComponent(Sprite).spriteFrame = sf;
                    }
                } catch (e) {

                }
            });

            // update pos question
            this.UpdatePosArrowMystery(directionCar, sizeCar);
        }
    }
    /**
     * set angle + update Pos
     * @param directionCar 
     * @param sizeCar 
     */
    private UpdatePosArrowMystery(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        //NOTE - ONLY in case top right && bottom right && right need set scale -1 x
        const posQuestion = LIST_POS_QUESTIONS[GetNameCarSize(sizeCar)][directionCar];
        switch (directionCar) {
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT:
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.TOP_LEFT:
                this.nArrow.angle = 0;
                this.nArrow.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.RIGHT:
                this.nArrow.angle = -90;
                this.nArrow.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.LEFT:
                this.nArrow.angle = 90;
                this.nArrow.scale = new Vec3(1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM:
                this.nArrow.angle = 180;
                this.nArrow.scale = new Vec3(1, 1, 1);
                break;
        }
        this.nArrow.position = posQuestion;
    }
    //#endregion mystery car
    //==========================================

    //==========================================
    //#region key car
    public SetUIArrowKey(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE, colorCar: COLOR_KEY_LOCK) {
        const pathKey = MConfigResourceUtils.GetPathKeyForPlay(directionCar, colorCar);
        if (this._pathArrowKey != pathKey) {
            this._pathArrowKey = pathKey;

            MConfigResourceUtils.GetImageArrowUntilLoad(pathKey, (pathSf: string, sf: SpriteFrame) => {
                try {
                    if (this._pathArrowKey == pathSf) {
                        this.nArrow.getComponent(Sprite).spriteFrame = sf;
                    }
                } catch (e) {

                }
            });

            // update pos question
            this.UpdatePosArrowKey(directionCar, sizeCar);
        }
    }

    public UpdatePosArrowKey(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        const posArrow = LIST_POS_ARROW[GetNameCarSize(sizeCar)][directionCar];
        switch (directionCar) {
            case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.LEFT:
                this.nArrow.scale = new Vec3(-1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM: case DIRECT_CAR.TOP:
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.RIGHT: case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT:
                break;
        }

        this.nArrow.position = posArrow;
    }
    //#endregion key car
    //==========================================

    //==========================================
    //#region fireTruck
    public SetUIArrowFireTruck(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        // load UI
        const pathArrow = MConfigResourceUtils.GetPathImageArrow(directionCar);

        this._pathArrowNormal = pathArrow;
        MConfigResourceUtils.GetImageArrowUntilLoad(pathArrow, (path, sfArrow: SpriteFrame) => {
            try {
                if (this._pathArrowNormal == path) {
                    this.nArrow.getComponent(Sprite).spriteFrame = sfArrow;
                }
            } catch (e) {

            }
        })

        // update Pos
        this.UpdatePosArrowFireTruck(directionCar, sizeCar);
    }

    private UpdatePosArrowFireTruck(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        const posArrow = LIST_POS_ARROW_FIRE_TRUCK[GetNameCarSize(sizeCar)][directionCar];
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_LEFT:
                this.nArrow.angle = 0;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.LEFT:
                this.nArrow.angle = 90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.RIGHT:
                this.nArrow.angle = -90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT:
                this.nArrow.angle = 0;
                this.nArrow.scale = new Vec3(-1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM:
                this.nArrow.angle = 180;
                this.nArrow.scale = Vec3.ONE;
                break;
        }

        this.nArrow.position = posArrow;
    }
    //#endregion fireTruck
    //==========================================

    //==========================================
    //#region ambulance
    public SetUIArrowAmbulance(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        // load UI
        const pathArrow = MConfigResourceUtils.GetPathImageArrow(directionCar);

        this._pathArrowNormal = pathArrow;
        MConfigResourceUtils.GetImageArrowUntilLoad(pathArrow, (path, sfArrow: SpriteFrame) => {
            try {
                if (this._pathArrowNormal == path) {
                    this.nArrow.getComponent(Sprite).spriteFrame = sfArrow;
                }
            } catch (e) {

            }
        })

        // update Pos
        this.UpdatePosArrowAmbulance(directionCar, sizeCar);
    }

    private UpdatePosArrowAmbulance(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        const posArrow = LIST_POS_ARROW_FIRE_TRUCK[GetNameCarSize(sizeCar)][directionCar];
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_LEFT:
                this.nArrow.angle = 0;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.LEFT:
                this.nArrow.angle = 90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.RIGHT:
                this.nArrow.angle = -90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT:
                this.nArrow.angle = 0;
                this.nArrow.scale = new Vec3(-1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM:
                this.nArrow.angle = 180;
                this.nArrow.scale = Vec3.ONE;
                break;
        }

        this.nArrow.position = posArrow;
    }
    //#endregion ambulance
    //==========================================

    //==========================================
    //#region military
    public SetUIArrowMilitary(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        // load UI
        const pathArrow = MConfigResourceUtils.GetPathImageArrow(directionCar);

        this._pathArrowNormal = pathArrow;
        MConfigResourceUtils.GetImageArrowUntilLoad(pathArrow, (path, sfArrow: SpriteFrame) => {
            try {
                if (this._pathArrowNormal == path) {
                    this.nArrow.getComponent(Sprite).spriteFrame = sfArrow;
                }
            } catch (e) {

            }
        })

        // update Pos
        this.UpdatePosArrowMilitary(directionCar, sizeCar);
    }

    private UpdatePosArrowMilitary(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        const posArrow = LIST_POS_ARROW_FIRE_TRUCK[GetNameCarSize(sizeCar)][directionCar];
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_LEFT:
                this.nArrow.angle = 0;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.LEFT:
                this.nArrow.angle = 90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.RIGHT:
                this.nArrow.angle = -90;
                this.nArrow.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT:
                this.nArrow.angle = 0;
                this.nArrow.scale = new Vec3(-1, 1, 1);
                break;
            case DIRECT_CAR.BOTTOM:
                this.nArrow.angle = 180;
                this.nArrow.scale = Vec3.ONE;
                break;
        }

        this.nArrow.position = posArrow;
    }
    //#endregion military
    //==========================================

    //==========================================
    //#region lock car < now only for car build>
    public SetUIArrowLock(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE, colorCar: COLOR_KEY_LOCK) {
        const pathLock = MConfigResourceUtils.GetPathLock(directionCar, colorCar);
        if (this._pathArrowLock != pathLock) {
            this._pathArrowLock = pathLock;
            MConfigResourceUtils.GetImageArrowUntilLoad(pathLock, (pathSf: string, sf: SpriteFrame) => {
                try {
                    if (this._pathArrowLock == pathSf) {
                        this.nArrow.getComponent(Sprite).spriteFrame = sf;
                    }
                } catch (e) {

                }
            });

            // update pos question
            this.UpdatePosArrowLock(directionCar, sizeCar);
        }
    }

    public UpdatePosArrowLock(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        const posArrow = LIST_POS_ARROW[GetNameCarSize(sizeCar)][directionCar];
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_RIGHT:
                this.nArrow.angle = 0;
                break;
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                this.nArrow.angle = 90;
                break;
            case DIRECT_CAR.BOTTOM:
                this.nArrow.angle = 180;
                break;
        }

        this.nArrow.position = posArrow;
    }
    //#endregion lock car <now only for car build>
    //==========================================

    //==========================================
    //#region Type Arrow
    private ChangeTypeArrow(newTypeArrow: TYPE_ARROW) {
        if (this._typeArrow == newTypeArrow) { return; }
        this._typeArrow = newTypeArrow;
        // reset path
        this._pathArrowKey = "";
        this._pathArrowNormal = "";
        this._pathArrowQuestion = "";
        this._pathArrowTwoWayCar = "";
        this._pathArrowLock = "";
    }

    public ChangeTypeArrowToLock() {
        this.ChangeTypeArrow(TYPE_ARROW.LOCK);
    }
    //#endregion Type Arrow
    //==========================================

    //==========================================
    //#region oftenUse
    public AutoUpdateArrow(direction: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE, iTypeCar: ITypeCar, colorCar: M_COLOR) {
        switch (true) {
            case iTypeCar.isCarMystery != null && iTypeCar.isCarMystery:
                if (this._typeArrow == TYPE_ARROW.MYSTERY) { return; }
                this.ChangeTypeArrow(TYPE_ARROW.MYSTERY);
                // this.node.setParent(this.nParentVisualMystery);
                this.SetUIArrowMystery(direction, sizeCar);
                break;
            // case iTypeCar.isCarTwoWay != null && iTypeCar.isCarTwoWay:
            //     if (this._typeArrow == TYPE_ARROW.TWO_WAY) { return; }
            //     this.nArrow.scale = Vec3.ONE;
            //     this.node.setParent(this.nParentVisualMove);
            //     this.SetUIArrowTwoWay(direction, sizeCar);
            //     this.ChangeTypeArrow(TYPE_ARROW.TWO_WAY);
            // break;
            case iTypeCar.isCarKey:
                if (this._typeArrow == TYPE_ARROW.KEY) { return; }
                this.ChangeTypeArrow(TYPE_ARROW.KEY);
                this.nArrow.scale = Vec3.ONE;
                // this.node.setParent(this.nParentVisualMove);
                this.SetUIArrowKey(direction, sizeCar, iTypeCar.colorKeyLock);
                break;
            case iTypeCar.isCarTwoWay:
                break;
            case iTypeCar.isCarFiretruck:
                this.ChangeTypeArrow(TYPE_ARROW.NORMAL);
                this.SetUIArrowFireTruck(direction, sizeCar);
                break;
            case iTypeCar.isCarAmbulance:
                this.ChangeTypeArrow(TYPE_ARROW.NORMAL);
                this.SetUIArrowAmbulance(direction, sizeCar);
                break;
            case colorCar == M_COLOR.REINDEER_CART:
                break;
            default:
                this.ChangeTypeArrow(TYPE_ARROW.NORMAL);
                this.SetUIArrowNormal(direction, sizeCar);
                break;
        }
    }
    public HideArrow() { this.nArrow.active = false; }
    public ShowArrow() { this.nArrow.active = true; }

    private readonly TIME_ANIM_LOCK: number = 0.6;
    public AnimNotiArrow() {
        // trong trường hợp đang chạy anim unlock thì sẽ ko chạy anim lock để có thể chạy anim
        Tween.stopAllByTarget(this.nArrow);
        this.nArrow.angle = 0;
        tween(this.nArrow)
            .to(0.2, { scale: Vec3.ONE.clone().multiplyScalar(1.2) })
            .to(this.TIME_ANIM_LOCK / 24, { angle: 20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: -20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: 20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: -20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 12, { angle: 20 }, { easing: 'smooth' })
            .to(this.TIME_ANIM_LOCK / 24, { angle: 0 }, { easing: 'smooth' })
            .to(0.2, { scale: Vec3.ONE })
            .start();
    }
    //#endregion oftenUse
    //==========================================
}

const LIST_POS_ARROW = {
    "4_CHO": {
        0: new Vec3(0, 10, 0),
        1: new Vec3(4.5, 14, 0),
        2: new Vec3(0, 14, 0),
        3: new Vec3(-2, 18, 0),
        4: new Vec3(0, 11, 0),
        5: new Vec3(2.5, 20, 0),
        6: new Vec3(4.5, 14, 0),
        7: new Vec3(-3, 13, 0)
    },
    "6_CHO": {
        0: new Vec3(-1, 17, 0),
        1: new Vec3(3, 18.5, 0),
        2: new Vec3(0, 17, 0),
        3: new Vec3(-1, 19, 0),
        4: new Vec3(-1.5, 16, 0),
        5: new Vec3(0, 18.5, 0),
        6: new Vec3(3, 17, 0),
        7: new Vec3(-3, 19, 0)
    },
    "10_CHO": {
        0: new Vec3(0, 19, 0),
        1: new Vec3(3, 20, 0),
        2: new Vec3(0, 19, 0),
        3: new Vec3(0, 20, 0),
        4: new Vec3(0, 19, 0),
        5: new Vec3(0, 20, 0),
        6: new Vec3(0, 19, 0),
        7: new Vec3(-3, 20, 0)
    }
}

const LIST_POS_ARROW_FIRE_TRUCK = {
    "6_CHO": {
        0: new Vec3(-2, 17, 0),
        1: new Vec3(8, 24.5, 0),
        2: new Vec3(0, 25, 0),
        3: new Vec3(7, 32, 0),
        4: new Vec3(-1.5, 19, 0),
        5: new Vec3(0, 25.5, 0),
        6: new Vec3(3, 25, 0),
        7: new Vec3(-8, 24, 0)
    }
}

const LIST_POS_ARROW_MILITARY = {
    "4_CHO": {
        0: new Vec3(-2, 17, 0),
        1: new Vec3(8, 24.5, 0),
        2: new Vec3(0, 25, 0),
        3: new Vec3(7, 32, 0),
        4: new Vec3(-1.5, 19, 0),
        5: new Vec3(0, 25.5, 0),
        6: new Vec3(3, 25, 0),
        7: new Vec3(-8, 24, 0)
    }
}

const LIST_POS_QUESTIONS = {
    "4_CHO": {
        0: new Vec3(0, 9, 0),
        1: new Vec3(4.5, 14, 0),
        2: new Vec3(4.5, 14, 0),
        3: new Vec3(-5, 12, 0),
        4: new Vec3(0, 9, 0),
        5: new Vec3(2.314, 19.659, 0),
        6: new Vec3(4.5, 14, 0),
        7: new Vec3(-4.641, 16, 0)
    },
    "6_CHO": {
        0: new Vec3(0, 12, 0),
        1: new Vec3(3, 18.5, 0),
        2: new Vec3(6.5, 18.5, 0),
        3: new Vec3(-1, 19, 0),
        4: new Vec3(0, 16, 0),
        5: new Vec3(-1.4, 19.801, 0),
        6: new Vec3(6.5, 18.5, 0),
        7: new Vec3(-3.403, 19, 0)
    },
    "10_CHO": {
        0: new Vec3(0, 19, 0),
        1: new Vec3(0, 19, 0),
        2: new Vec3(0, 19, 0),
        3: new Vec3(0, 19, 0),
        4: new Vec3(0, 19, 0),
        5: new Vec3(-2.212, 22.317, 0),
        6: new Vec3(0, 19, 0),
        7: new Vec3(-3.686, 20.106, 0)
    }
}