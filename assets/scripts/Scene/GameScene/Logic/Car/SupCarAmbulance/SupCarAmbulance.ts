import { _decorator, Component, Node, SpriteFrame, Vec3 } from 'cc';
import { FrameByFrameSys } from 'db://assets/scripts/Utils/FrameByFrameSys';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { DIRECT_CAR } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('SupCarAmbulance')
export class SupCarAmbulance extends Component {
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

    public LoadImgLight(directionCar: DIRECT_CAR) {
        if (this._directionCar == directionCar) { return; }
        this._directionCar = directionCar;

        this.frameByFrame.ChangeStateNone();
        this.frameByFrame.ResetFrame();

        //=========== set angle ================
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.LEFT:
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.RIGHT:
                this.frameByFrame.node.angle = 0;
                this.frameByFrame.node.scale = Vec3.ONE;
                break;
            case DIRECT_CAR.TOP_RIGHT: case DIRECT_CAR.BOTTOM_LEFT:
                this.frameByFrame.node.scale = new Vec3(-1, 1, 1);
                this.frameByFrame.node.angle = 0;
                break;
            case DIRECT_CAR.BOTTOM:
                this.frameByFrame.node.angle = 180;
                this.frameByFrame.node.scale = Vec3.ONE;
                break;
        }

        //============ set pos ==================
        const posArrow = LIST_POS_LIGHT[directionCar];
        this.frameByFrame.node.position = posArrow;

        //=========== set listSt ===============
        const listPathLight: string[] = MConfigResourceUtils.GetListPathLightPolice(directionCar);

        MConfigResourceUtils.GetListImgLightPoliceUntilLoad(listPathLight, (path: string[], listSf: SpriteFrame[]) => {
            if (listPathLight == path && this.frameByFrame) {
                this.frameByFrame.listSf = listSf;
                this.frameByFrame.ChangeStatePlaying();
            }
        })
    }
}

const LIST_POS_LIGHT = {
    0: new Vec3(-1.886, 41.539, 0),      // TOP
    1: new Vec3(-13.334, 40.194, 0),     // TOP_LEFT
    2: new Vec3(-20.913, 22.195, 0),     // LEFT
    3: new Vec3(-16.934, 11.017, 0),     // BOTTOM_LEFT
    4: new Vec3(-1.398, -0.73, 0),       // BOTTOM
    5: new Vec3(17.082, 10.699, 0),      // BOTTOM_RIGHT
    6: new Vec3(20.486, 21.641, 0),      // RIGHT
    7: new Vec3(13.191, 40.121, 0)       // TOP_RIGHT
}