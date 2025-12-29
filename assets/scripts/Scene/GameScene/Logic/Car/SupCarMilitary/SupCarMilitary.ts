import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { DIRECT_CAR } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('SupCarMilitary')
export class SupCarMilitary extends Component {
    @property(Node) nLight: Node;
    private _directionCar: DIRECT_CAR = null;

    public LoadImgLight(directionCar: DIRECT_CAR, force: boolean = false) {
        if (!force && this._directionCar == directionCar) { return; }
        this._directionCar = directionCar;

        const self = this;

        //============ set scale ===============
        switch (directionCar) {
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.RIGHT: case DIRECT_CAR.TOP_RIGHT:
                this.nLight.scale = new Vec3(-1, 1, 1);
                break;
            default:
                this.nLight.scale = Vec3.ONE.clone();
                break;
        }

        //============ set pos ==================
        const posArrow = LIST_POS_LIGHT[directionCar];
        this.nLight.position = posArrow;

        //=========== set listSt ===============
        const pathLight: string = MConfigResourceUtils.GetPathLightMilitary(directionCar);
        MConfigResourceUtils.GetImgLightMilitaryUntilLoad(pathLight, (path: string, sf: SpriteFrame) => {
            if (pathLight == path && self != null) {
                self.nLight.getComponent(Sprite).spriteFrame = sf;
            }
        })
    }
}

const LIST_POS_LIGHT = {
    0: new Vec3(0, 21.963, 0),          // TOP
    1: new Vec3(-0.407, 27.765, 0),     // TOP_LEFT
    2: new Vec3(-1.883, 23.439, 0),     // LEFT
    3: new Vec3(-0.96, 20.103, 0),      // BOTTOM_LEFT
    4: new Vec3(-0.25, 12.402, 0),       // BOTTOM
    5: new Vec3(1.168, 20.544, 0),      // BOTTOM_RIGHT
    6: new Vec3(1.769, 23.378, 0),      // RIGHT
    7: new Vec3(0.767, 27.569, 0)       // TOP_RIGHT
}


