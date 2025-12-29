import { _decorator, Component, Node, SpriteFrame, Vec3 } from 'cc';
import { FrameByFrameSys } from 'db://assets/scripts/Utils/FrameByFrameSys';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { DIRECT_CAR, GetNameCarSize, TYPE_CAR_SIZE } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
import { SupTwoWay_Smoke } from './SupTwoWay_Smoke';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { MConst } from 'db://assets/scripts/Const/MConst';
const { ccclass, property } = _decorator;

enum STATE_SUP_CAR_TWO_WAY {
    IDLE,
    CHANGING_ARROW,
}

@ccclass('SupCarTwoWay')
export class SupCarTwoWay extends Component {
    @property(FrameByFrameSys) frameByFrame: FrameByFrameSys;

    private _stateSupCarTwoWay: STATE_SUP_CAR_TWO_WAY = STATE_SUP_CAR_TWO_WAY.IDLE;
    private _directionCarNow: DIRECT_CAR = DIRECT_CAR.TOP;

    //==========================================
    //#region base
    protected onEnable(): void {
        this.frameByFrame.ChangeStatePlaying();
    }

    protected onDisable(): void {
        this.frameByFrame.ChangeStateNone();
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region state
    private ChangeState(newState: STATE_SUP_CAR_TWO_WAY) {
        this._stateSupCarTwoWay = newState;
    }
    public SetStateIdle(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        this._stateSupCarTwoWay = STATE_SUP_CAR_TWO_WAY.IDLE;
        this._directionCarNow = directionCar;
        this.LoadImgArrow(directionCar, sizeCar);
    }
    //#endregion state
    //==========================================

    private LoadImgArrow(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        this.frameByFrame.ChangeStateNone();
        this.frameByFrame.ResetFrame();

        //=========== set angle ================
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.TOP_LEFT:
                this.frameByFrame.node.angle = 0;
                break;
            case DIRECT_CAR.LEFT:
                this.frameByFrame.node.angle = 90;
                break;
            case DIRECT_CAR.RIGHT:
                this.frameByFrame.node.angle = -90;
                break;
            case DIRECT_CAR.BOTTOM:
                this.frameByFrame.node.angle = 180;
                break;
            case DIRECT_CAR.TOP_RIGHT:
                this.frameByFrame.node.angle = -102;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT:
                this.frameByFrame.node.angle = 99;
                break;
        }

        //============ set pos ==================
        const posArrow = LIST_POS_ARROW[GetNameCarSize(sizeCar)][directionCar];
        this.frameByFrame.node.position = posArrow;

        //=========== set listSt ===============
        const listPathArrow: string[] = MConfigResourceUtils.GetListPathArrowTwoWay(directionCar);

        MConfigResourceUtils.GetListImgArrowTwoWayUntilLoad(listPathArrow, (path: string[], listSf: SpriteFrame[]) => {
            if (listPathArrow == path) {
                this.frameByFrame.listSf = listSf;
                this.frameByFrame.ChangeStatePlaying();
            }
        })
    }


    private readonly TIME_SMOKE = 0.8;
    public async ChangeImgArrow(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        this._directionCarNow = directionCar;

        switch (true) {
            case this._stateSupCarTwoWay == STATE_SUP_CAR_TWO_WAY.CHANGING_ARROW:
                // trong trường hợp đang chạy anim thay đổi arrow =>chỉ cần thay đổi dữ liệu để sau khi chạy xong anim sẽ hiển thị theo dữ liệu mới
                break;
            case this._stateSupCarTwoWay == STATE_SUP_CAR_TWO_WAY.IDLE:
                // hiển thị smoke , đổi arrow
                // clientEvent.dispatchEvent(MConst.EVENT.PLAY_PARTICLE_SMOKE_CAR_TWO_WAY, this.node.worldPosition.clone(), directionCar);
                this.ChangeState(STATE_SUP_CAR_TWO_WAY.CHANGING_ARROW);
                // await Utils.delay(this.TIME_SMOKE / 2 * 1000);
                this.LoadImgArrow(this._directionCarNow, sizeCar);
                this.ChangeState(STATE_SUP_CAR_TWO_WAY.IDLE);
                break;
        }
    }

    public Hide() {
        this.node.active = false;
    }

    public Show() {
        this.node.active = true;
    }
}

const LIST_POS_ARROW = {
    "4_CHO": {
        0: new Vec3(0, 10, 0),
        1: new Vec3(4.5, 14, 0),
        2: new Vec3(0, 14, 0),
        3: new Vec3(-2, 18, 0),
        4: new Vec3(0, 11, 0),
        5: new Vec3(-3.5, 15, 0),
        6: new Vec3(4.5, 14, 0),
        7: new Vec3(-7, 7, 0)
    },
    "6_CHO": {
        0: new Vec3(-1, 17, 0),
        1: new Vec3(6, 12.5, 0),
        2: new Vec3(0, 17, 0),
        3: new Vec3(7, 21, 0),
        4: new Vec3(-1.5, 16, 0),
        5: new Vec3(-6, 20.5, 0),
        6: new Vec3(3, 17, 0),
        7: new Vec3(-6, 13, 0)
    },
    "10_CHO": {
        0: new Vec3(0, 19, 0),
        1: new Vec3(3, 20, 0),
        2: new Vec3(0, 19, 0),
        3: new Vec3(0, 20, 0),
        4: new Vec3(0, 19, 0),
        5: new Vec3(0, 20, 0),
        6: new Vec3(0, 19, 0),
        7: new Vec3(3, 20, 0)
    }
}