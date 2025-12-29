import { _decorator, Component, Node, SpriteFrame, Vec3 } from 'cc';
import { FrameByFrameSys } from 'db://assets/scripts/Utils/FrameByFrameSys';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { DIRECT_CAR, TYPE_CAR_SIZE } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('SupCarPolice')
export class SupCarPolice extends Component {
    @property(FrameByFrameSys) frameByFrame: FrameByFrameSys;

    private _directionCar: DIRECT_CAR = null;

    //==========================================
    //#region base
    protected onEnable(): void {
        // this.frameByFrame.ChangeStatePlaying();
    }

    protected onDisable(): void {
        this.frameByFrame.ChangeStateNone();
    }
    //#endregion base
    //==========================================

    public LoadImgLight(directionCar: DIRECT_CAR, force: boolean = false) {
        if (!force && this._directionCar == directionCar) { return; }
        this._directionCar = directionCar;

        this.frameByFrame.ChangeStateNone();
        this.frameByFrame.ResetFrame();

        //=========== set angle ================
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT:
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT: case DIRECT_CAR.BOTTOM_RIGHT:
                this.frameByFrame.node.angle = 0;
                break;
            case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.TOP_RIGHT:
                this.frameByFrame.node.angle = 90;
                break;
            case DIRECT_CAR.BOTTOM:
                this.frameByFrame.node.angle = 180;
                break;
        }

        //============ set pos ==================
        const posArrow = LIST_POS_LIGHT[directionCar];
        this.frameByFrame.node.position = posArrow;

        //=========== set listSt ===============
        const listPathLight: string[] = MConfigResourceUtils.GetListPathLightPolice(directionCar);

        MConfigResourceUtils.GetListImgLightPoliceUntilLoad(listPathLight, (path: string[], listSf: SpriteFrame[]) => {
            if (listPathLight == path) {
                this.frameByFrame.listSf = listSf;
                this.frameByFrame.ChangeStatePlaying();
            }
        })
    }
}

const LIST_POS_LIGHT = {
    0: new Vec3(0.326, 15.713, 0),      // TOP
    1: new Vec3(-0.492, 22.378, 0),     // TOP_LEFT
    2: new Vec3(1.261, 17.233, 0),      // LEFT
    3: new Vec3(-2.012, 20.156, 0),     // BOTTOM_LEFT
    4: new Vec3(0.343, 8.712, 0),       // BOTTOM
    5: new Vec3(-2.315, 20.232, 0),     // BOTTOM_RIGHT
    6: new Vec3(-1.427, 16.765, 0),     // RIGHT
    7: new Vec3(0.093, 22.845, 0)       // TOP_RIGHT
}