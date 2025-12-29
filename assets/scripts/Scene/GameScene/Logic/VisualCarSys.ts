import { _decorator, Component, error, Node, path, Sprite, SpriteFrame, Tween, UITransform, Vec3 } from 'cc';
import { COLOR_KEY_LOCK, DIRECT_CAR, GameSoundEffect, GetAngleSuitWithDirectionCar, GetNameCarSize, GetNameDirectionCar, ITypeCar, M_COLOR, NAME_SUP_VI_CAR, TYPE_CAR_SIZE, TYPE_PASSENGER_POSE } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { MConfigs } from '../../../Configs/MConfigs';
import { SoundSys } from '../../../Common/SoundSys';
import { SplashPassenger } from '../OtherUI/SplashPass/SplashPassenger';
import { VisualPickUpPass } from './Car/VisualPickUpPass';
import { VisualPickUpPassLeft } from './Car/VisualPickUpPassLeft';
import { VisualArrowCar } from './Car/VisualArrowCar';
import { VisualSupportCar } from './Car/VisualSupportCar';
import { SupCarLock } from './Car/SupCarLock/SupCarLock';
import { SupCarTwoWay } from './Car/SupCarTwoWay/SupCarTwoWay';
import { SupCarPolice } from './Car/SupCarPolice/SupCarPolice';
import { SupCarFireTruck } from './Car/SupCarFireTruck/SupCarFireTruck';
import { SupCarAmbulance } from './Car/SupCarAmbulance/SupCarAmbulance';
import { SupCarMilitary } from './Car/SupCarMilitary/SupCarMilitary';
import { SupCarTwoWay2 } from './Car/SupCarTwoWay/SupCarTwoWay2';
const { ccclass, property } = _decorator;

enum E_SIBLING_INDEX {
    Visual_move,                    // ảnh xe
    Visual_mystery,                 // ảnh xe mystery
    Visual_support_car,             // ảnh xe hỗ trợ
    Visual_arrow,                   // mũi tên xe
    Visual_pick_up_passenger,       // ảnh passenger ngồi trên xe hướng topLeft
    Visual_pick_up_passenger_left  // ảnh passenger ngồi trên xe hướng trái
}

@ccclass('VisualCarSys')
export class VisualCarSys {
    @property(Sprite) spVisualCarMove: Sprite;
    @property(Sprite) public spVisualCarPickUp: Sprite;
    @property(Sprite) protected spVisualCarPickUp_2: Sprite;
    @property(Node) nBtnClick: Node;
    @property(Node) nEmotion: Node;
    @property(VisualPickUpPass) visualPickUpPass: VisualPickUpPass;
    @property(VisualPickUpPassLeft) visualPickUpPassLeft: VisualPickUpPassLeft;
    @property(VisualArrowCar) visualArrowCar: VisualArrowCar;
    @property(VisualSupportCar) visualSupportCar: VisualSupportCar;

    //UI visual mystery
    @property(Node) nVisualMystery: Node;
    @property(Sprite) spVisualMysteryCar: Sprite;

    private _pathCarNow: string = null;
    private _pathCarMysteryCarNow: string = null;
    private _pathCarPickUpNow: string = null;
    private _pathCarPickUp2Now: string = null;
    private _pathSfPassSit_1: string = null;
    private _pathSfPassSit_2: string = null;

    private indexPassengerInCar: number = 0; public get IndexPassengerInCar(): number { return this.indexPassengerInCar; }

    private _nCar: Node = null;

    private _cbCustomUpdateImageCar: (colorCar: M_COLOR, sizeCar: number, directCar: DIRECT_CAR, isCarOpen: boolean) => void = null;
    private _cbCustomUpdateVisualCarPickUp: (colorCar: M_COLOR, sizeCar: number) => void = null;

    public RegisterCb(
        cbCustomUpdateImageCar: (colorCar: M_COLOR, sizeCar: number, directCar: DIRECT_CAR, isCarOpen: boolean) => void,
        cbCustomUpdateVisualCarPickUp: (colorCar: M_COLOR, sizeCar: number) => void
    ) {
        this._cbCustomUpdateImageCar = cbCustomUpdateImageCar;
        this._cbCustomUpdateVisualCarPickUp = cbCustomUpdateVisualCarPickUp;
    }
    public Init(colorCar: M_COLOR, numPass: number, nCar: Node, iTypeCar: ITypeCar) {
        this._nCar = nCar;

        // turn on visual car support
        this.visualSupportCar.node.active = true;

        // init visual passenger sit in car
        this.visualPickUpPass.TryInitPass(numPass, colorCar);
        this.visualPickUpPassLeft.TryInitPass(numPass, colorCar);

        const pathPassengerSitting = MConfigResourceUtils.GetPathPassengers(colorCar, TYPE_PASSENGER_POSE.SITTING);
        const pathPassengerSitting_2 = MConfigResourceUtils.GetPathPassengers(colorCar, TYPE_PASSENGER_POSE.SITTING_2);
        this._pathSfPassSit_1 = pathPassengerSitting;
        this._pathSfPassSit_2 = pathPassengerSitting_2;

        // path 1
        MConfigResourceUtils.GetImagePassengersUntilLoad(pathPassengerSitting, (path: string, sf: SpriteFrame) => {
            try {
                if (this._pathSfPassSit_1 == path) {
                    this.visualPickUpPass._listPass.forEach(item => {
                        item.getComponent(Sprite).spriteFrame = sf;
                    });
                }
            } catch (e) {

            }
        })
        this.visualPickUpPass.node.active = false;
        this.visualPickUpPass._listPass.forEach(item => {
            item.active = false;
        });

        // path 2
        MConfigResourceUtils.GetImagePassengersUntilLoad(pathPassengerSitting_2, (path: string, sf: SpriteFrame) => {
            try {
                if (this._pathSfPassSit_2 == path) {
                    this.visualPickUpPassLeft._listPass.forEach(item => {
                        item.getComponent(Sprite).spriteFrame = sf;
                    });
                }
            } catch (e) {

            }
        })
        this.visualPickUpPassLeft.node.active = false;
        this.visualPickUpPassLeft._listPass.forEach(item => {
            item.active = false;
        })

        // set index
        this.indexPassengerInCar = 0;

        // update visual
        this.UpdateSiblingIndexForSuitCase(iTypeCar);
    }

    public ResetData() {
        this.indexPassengerInCar = 0;
        Tween.stopAllByTarget(this.nEmotion);
        this.nEmotion.getComponent(Sprite).spriteFrame = null;
        this._cbCustomUpdateImageCar = null;
    }

    public ShowVisualCarLeft() {
        // logic này chỉ xảy ra trong trường hợp người chơi lui xe ra ngoài
        // lúc này xe đang ở trạng thái xe đang đỗ nên ta chả cần thay như thế này là sẽ đúng
        // this.nListVisualPassengersSitting_2.active = true;
        // this.nListVisualPassengersSitting.active = false;

        // đóng nắp thùng xe lại và lui xe ra sau

    }

    public ShowPassSittingSpe() {
        // turn off sp visual car pick up
        this.visualPickUpPass.node.active = true;
        // this.visualPickUpPass.getComponent(Sprite).spriteFrame = null;
    }

    public UpdateVisualCarMoveWithDirection(iTypeCar: ITypeCar, colorCar: M_COLOR, direction: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE, isCarOpen: boolean = false) {
        // turn off sp visual car pick up
        this.spVisualCarPickUp.node.active = false;
        this.spVisualCarPickUp_2.node.active = false;

        // rotate button
        const angleRight: number = GetAngleSuitWithDirectionCar(direction);
        this.nBtnClick.angle = angleRight;

        // turn on sp visual car move + update sf
        if (!this.nVisualMystery.active) {
            this.spVisualCarMove.node.active = true;
        }
        this.UpdateImageCar(colorCar, sizeCar, direction, isCarOpen);

        // =================== ARROW =================== //
        switch (colorCar) {
            case M_COLOR.POLICE:
                const supPolice = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.POLICE);
                if (supPolice == null) { break; }
                supPolice.getComponent(SupCarPolice).LoadImgLight(direction);
                break;
            case M_COLOR.FIRE_TRUCK:
                const supFireTruck = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.FIRE_TRUCK);
                if (supFireTruck == null) { break; }
                supFireTruck.getComponent(SupCarFireTruck).ChangeLight(direction);
                break;
            case M_COLOR.AMBULANCE:
                const supAmbulance = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.AMBULANCE);
                if (supAmbulance == null) { break; }
                supAmbulance.getComponent(SupCarAmbulance).LoadImgLight(direction);
                break;
            case M_COLOR.MILITARY:
                const supMilitary = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.MILITARY);
                if (supMilitary == null) { break; }
                supMilitary.getComponent(SupCarMilitary).LoadImgLight(direction);
                break;
        }
        this.visualArrowCar.AutoUpdateArrow(direction, sizeCar, iTypeCar, colorCar);

        // =================== Visual Car =================== //
        if (direction == DIRECT_CAR.RIGHT || direction == DIRECT_CAR.TOP_RIGHT || direction == DIRECT_CAR.BOTTOM_RIGHT) {
            this.spVisualCarMove.node.scale = MConfigs.SCALE_SPECIAL_CAR.clone().multiply3f(-1, 1, 1)
        } else {
            this.spVisualCarMove.node.scale = MConfigs.SCALE_SPECIAL_CAR.clone();
        }
    }

    public UpdateSfPassPickUp(mColor: M_COLOR) {
        // init visual passenger sit in car
        const pathPassengerSitting = MConfigResourceUtils.GetPathPassengers(mColor, TYPE_PASSENGER_POSE.SITTING);
        const pathPassengerSitting_2 = MConfigResourceUtils.GetPathPassengers(mColor, TYPE_PASSENGER_POSE.SITTING_2);
        this._pathSfPassSit_1 = pathPassengerSitting;
        this._pathSfPassSit_2 = pathPassengerSitting_2;

        //path 1
        MConfigResourceUtils.GetImageCarUntilLoad(pathPassengerSitting, (path, sfPass: SpriteFrame) => {
            try {
                if (this._pathSfPassSit_1 == path) {
                    this.visualPickUpPass._listPass.forEach(item => {
                        item.getComponent(Sprite).spriteFrame = sfPass;
                    });
                }
            } catch (e) {

            }
        })

        //path 2
        MConfigResourceUtils.GetImageCarUntilLoad(pathPassengerSitting_2, (path, sfPass: SpriteFrame) => {
            try {
                if (this._pathSfPassSit_2 == path) {
                    this.visualPickUpPassLeft._listPass.forEach(item => {
                        item.getComponent(Sprite).spriteFrame = sfPass;
                    });
                }
            } catch (e) {

            }
        })
    }

    /**
     * // you must change the angle of node parent to 0 and the angle of sp pickUp Passenger to the angle default
     * 
     * @param colorCar 
     * @param sizeCar 
     */
    public UpdateVisualCarPickUp(colorCar: M_COLOR, sizeCar: number) {
        if (this._cbCustomUpdateVisualCarPickUp) {
            this._cbCustomUpdateVisualCarPickUp(colorCar, sizeCar);
            return;
        }

        // turn off sp visual car move
        this.spVisualCarMove.node.active = false;

        // turn off visual car support
        this.visualSupportCar.node.active = false;

        // NOTE: you must change the angle of node car pick UP to 0 because you change angle car in the moveCarSys2
        if (this._nCar != null) this._nCar.angle = 0;

        // turn on sp visual car pick up + update sf
        this.spVisualCarPickUp.node.active = true;
        this.visualPickUpPass.node.active = true;
        const pathSfCarPickUp = MConfigResourceUtils.GetPathCar(colorCar, sizeCar, DIRECT_CAR.TOP_LEFT, true);
        const pathSfCarPickUp_2 = MConfigResourceUtils.GetPathCar(colorCar, sizeCar, DIRECT_CAR.LEFT, true);
        this._pathCarPickUpNow = pathSfCarPickUp;
        this._pathCarPickUp2Now = pathSfCarPickUp_2;
        MConfigResourceUtils.GetImageCarUntilLoad(pathSfCarPickUp, (path, sfCar: SpriteFrame) => {
            try {
                if (this._pathCarPickUpNow == path) {
                    this.spVisualCarPickUp.spriteFrame = sfCar;
                }
            } catch (e) {

            }
        })
        MConfigResourceUtils.GetImageCarUntilLoad(pathSfCarPickUp_2, (path, sfCar: SpriteFrame) => {
            try {
                if (this._pathCarPickUp2Now == path) {
                    this.spVisualCarPickUp_2.spriteFrame = sfCar;
                }
            } catch (e) {

            }

        })
    }

    public AddMorePassengerInCar() {
        // show more passenger
        let nPassenger = this.visualPickUpPass._listPass[this.indexPassengerInCar];
        let nPassenger_2 = this.visualPickUpPassLeft._listPass[this.indexPassengerInCar];
        if (nPassenger != null) {
            nPassenger.active = true;
            nPassenger.getComponent(SplashPassenger).Show();
            nPassenger_2.active = true;
            // play sound
            SoundSys.Instance.playSoundEffectComboPass_move_on_car();
            // add coin when passenger move on the car
            // clientEvent.dispatchEvent(MConst.EVENT.RECEIVE_COIN_WHEN_PASS_MOVE_TO_CAR, nPassenger.worldPosition.clone());
            this.indexPassengerInCar += 1;
        }
    }

    public IsMaxPassengerTurnOn() {
        return !this.visualPickUpPass._listPass.some(item => !item.active)
    }

    public getWidthVisualCarMoveToCheckCollider(direction: DIRECT_CAR): number {
        const uiSpCarMove = this.spVisualCarMove.node.getComponent(UITransform);
        switch (direction) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM: return uiSpCarMove.width;
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT: return uiSpCarMove.height;
            case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.TOP_RIGHT: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.BOTTOM_RIGHT:
                return uiSpCarMove.width / 2;
        }

        return uiSpCarMove.width / 2;
    }

    public getListWPosPassSitInCar(): Vec3[] {
        return this.visualPickUpPass._listPass.map(item => item.worldPosition.clone());
    }

    public HideVisualPassInCarAndShowVisualNormal(colorCar: M_COLOR, sizeCar: number) {
        this.spVisualCarPickUp.node.active = false;
        this.spVisualCarPickUp_2.node.active = false;
        this.visualArrowCar.HideArrow();
        this.spVisualCarMove.node.active = true;
        this.spVisualCarMove.node.scale = MConfigs.SCALE_SPECIAL_CAR.clone().multiply3f(-1, 1, 1);

        //show visual support
        this.visualSupportCar.node.active = true;

        // change visual to right 
        this.UpdateImageCar(colorCar, sizeCar, DIRECT_CAR.RIGHT, false)
    }

    public UpdateImageCar(colorCar: M_COLOR, sizeCar: number, directCar: DIRECT_CAR, isCarOpen: boolean) {
        if (this._cbCustomUpdateImageCar) {
            this._cbCustomUpdateImageCar(colorCar, sizeCar, directCar, isCarOpen);
            return;
        }

        const pathSfCar = MConfigResourceUtils.GetPathCar(colorCar, sizeCar, directCar, isCarOpen);
        this._pathCarNow = pathSfCar;
        MConfigResourceUtils.GetImageCarUntilLoad(pathSfCar, (path, sfCar: SpriteFrame) => {
            try {
                if (this._pathCarNow == path) {
                    this.spVisualCarMove.spriteFrame = sfCar;
                }
            } catch (e) {

            }
        })
    }

    //============================================
    //#region siblingIndex control
    public UpdateSiblingIndexForSuitCase(iTypeCar: ITypeCar) {
        switch (true) {
            case iTypeCar.isCarLock:
                this.visualArrowCar.node.setSiblingIndex(E_SIBLING_INDEX.Visual_support_car);
                this.visualSupportCar.node.setSiblingIndex(E_SIBLING_INDEX.Visual_arrow);
                break;
            default:
                this.visualArrowCar.node.setSiblingIndex(E_SIBLING_INDEX.Visual_arrow);
                this.visualSupportCar.node.setSiblingIndex(E_SIBLING_INDEX.Visual_support_car);
                break;
        }
    }
    //#endregion siblingIndex control
    //============================================

    //============================================
    //#region arrow
    public HideArrow(iTypeCar: ITypeCar) {
        switch (true) {
            case iTypeCar.isCarTwoWay:
                // hide the sub ui
                const uiSup = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.TWO_WAY_CAR)
                if (uiSup != null) {
                    // uiSup.getComponent(SupCarTwoWay).Hide();
                    uiSup.getComponent(SupCarTwoWay2).Hide();
                }
                break;
            default:
                this.visualArrowCar.HideArrow();
                break;
        }
    }

    public ShowArrow(iTypeCar: ITypeCar) {
        switch (true) {
            case iTypeCar.isCarTwoWay:
                // hide the sub ui
                const uiSup = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.TWO_WAY_CAR)
                if (uiSup != null) {
                    // uiSup.getComponent(SupCarTwoWay).Show();
                    uiSup.getComponent(SupCarTwoWay2).Show();
                }
                break;
            default:
                this.visualArrowCar.ShowArrow();
                break;
        }
    }
    //#endregion arrow
    //============================================

    //============================================
    //#region mystery car
    public UpdateUIMysteryCar(direction: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        // update visual mystery car
        const pathSfMysteryCar = MConfigResourceUtils.GetPathMysteryCar(direction, sizeCar);
        this._pathCarMysteryCarNow = pathSfMysteryCar;
        MConfigResourceUtils.GetImageMysteryCarUntilLoad(pathSfMysteryCar, (path: string, sf: SpriteFrame) => {
            try {
                if (this._pathCarMysteryCarNow == path) {
                    this.spVisualMysteryCar.spriteFrame = sf;
                }
            } catch (e) {

            }
        })
        switch (direction) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.LEFT: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.BOTTOM:
                this.spVisualMysteryCar.node.scale = MConfigs.SCALE_SPECIAL_CAR;
                break;
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.RIGHT: case DIRECT_CAR.TOP_RIGHT:
                this.spVisualMysteryCar.node.scale = MConfigs.SCALE_SPECIAL_CAR.clone().multiply3f(-1, 1, 1)
                break;
        }

        // // === update visual question ===
        // this.visualArrowCar.SetUIArrowMystery(direction, sizeCar);
    }

    public async UnlockCarMystery(direction: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE, iTypeCar: ITypeCar, colorCar: M_COLOR) {
        // you need to add anim unlock car mystery in here
        this.visualArrowCar.AutoUpdateArrow(direction, sizeCar, iTypeCar, colorCar);
        this.HideMysteryCar();
    }

    public ShowMysteryCar() {
        this.nVisualMystery.active = true;
        this.spVisualCarMove.node.active = false;
    }

    public HideMysteryCar() {
        this.nVisualMystery.active = false;
        this.spVisualCarMove.node.active = true;
    }
    // #endregion mystery car
    //============================================

    //===========================================
    //#region lock key car
    public async UnlockCarByKeyVisual(wPosKey: Vec3, colorKeyLock: COLOR_KEY_LOCK) {
        const nSubCarLock = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.LOCK_CAR);
        await nSubCarLock.getComponent(SupCarLock).PlayAnimUnlock(wPosKey.clone(), colorKeyLock);
        nSubCarLock.getComponent(SupCarLock).Hide();
    }
    //#endregion lock key car
    //===========================================

    //===========================================
    //#region two way car
    public UpdateSfArrowTwoWayCar(directionCar: DIRECT_CAR, sizeCar: TYPE_CAR_SIZE) {
        try {
            const nSupCarTwoWay = this.visualSupportCar.GetSubUI(NAME_SUP_VI_CAR.TWO_WAY_CAR);
            // nSupCarTwoWay.getComponent(SupCarTwoWay).ChangeImgArrow(directionCar, sizeCar);
            nSupCarTwoWay.getComponent(SupCarTwoWay2).ChangeImgArrow(directionCar, sizeCar);
        } catch (e) {
            console.warn(this.visualSupportCar.node.parent.name)
            console.error("error", e);
        }
    }
    //#endregion two way car
    //===========================================
}


