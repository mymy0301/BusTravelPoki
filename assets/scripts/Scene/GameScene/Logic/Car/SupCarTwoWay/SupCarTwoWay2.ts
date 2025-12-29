import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { M_ERROR } from 'db://assets/scripts/Configs/MConfigError';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { MConfigResourceUtils } from 'db://assets/scripts/Utils/MConfigResourceUtils';
import { DIRECT_CAR, GetNameCarSize, TYPE_CAR_SIZE } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Tue Sep 30 2025 09:35:10 GMT+0700 (Indochina Time)
 * SupCarTwoWay2
 * db://assets/scripts/Scene/GameScene/Logic/Car/SupCarTwoWay/SupCarTwoWay2.ts
 *
 */

@ccclass('SupCarTwoWay2')
export class SupCarTwoWay2 extends Component {
    @property(Sprite) spArrowFlash: Sprite;
    private _directionCarNow: DIRECT_CAR = DIRECT_CAR.TOP;
    //==========================================
    //#region base
    public Init(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        this._directionCarNow = directionCar;
        this.LoadImgArrow(this._directionCarNow, sizeCar);
    }
    //#endregion base
    //==========================================

    //==========================================
    //#region private
    private LoadImgArrow(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        //=========== set angle ================
        switch (directionCar) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.TOP_LEFT:
                this.spArrowFlash.node.angle = 0;
                break;
            case DIRECT_CAR.LEFT:
                this.spArrowFlash.node.angle = 90;
                break;
            case DIRECT_CAR.RIGHT:
                this.spArrowFlash.node.angle = -90;
                break;
            case DIRECT_CAR.BOTTOM:
                this.spArrowFlash.node.angle = 180;
                break;
            case DIRECT_CAR.TOP_RIGHT:
                this.spArrowFlash.node.angle = -102;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT:
                this.spArrowFlash.node.angle = 99;
                break;
        }

        //============ set pos ==================
        const posArrow = LIST_POS_ARROW[GetNameCarSize(sizeCar)][directionCar];
        this.spArrowFlash.node.position = posArrow;

        //=========== set listSt ===============
        const listPathArrow: string[] = MConfigResourceUtils.GetListPathArrowTwoWay(directionCar);

        MConfigResourceUtils.GetListImgArrowTwoWayUntilLoad(listPathArrow, (path: string[], listSf: SpriteFrame[]) => {
            if (listPathArrow == path) {
                this.spArrowFlash.spriteFrame = listSf[0];
            }
        })
    }
    //#endregion private
    //==========================================

    //==========================================
    //#region public
    public async ChangeImgArrow(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        try {
            this._directionCarNow = directionCar;
            if (this._directionCarNow == directionCar) {
                this.LoadImgArrow(this._directionCarNow, sizeCar);
            }
        } catch (e) {
            console.error(M_ERROR.SMOKE_CAR_TWO_WAY);
        }
    }

    public Hide() {
        this.node.active = false;
    }

    public Show() {
        this.node.active = true;
    }
    //#endregion public
    //==========================================

    //==========================================
    //#region listener
    //#endregion listener
    //==========================================

    //==========================================
    //#region btn
    //#endregion btn
    //==========================================
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