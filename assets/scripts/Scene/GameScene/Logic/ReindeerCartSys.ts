/**
 * 
 * anhngoxitin01
 * Mon Nov 10 2025 15:52:20 GMT+0700 (Indochina Time)
 * ReindeerCartSys
 * db://assets/scripts/Scene/GameScene/Logic/ReindeerCartSys.ts
*
*/
import { _decorator, Component, instantiate, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { CarSys } from './CarSys';
import { VisualPickUpPassLeft } from './Car/VisualPickUpPassLeft';
import { DIRECT_CAR, ITypeCar, JsonCar, M_COLOR, STATE_CAR_MOVING, TYPE_PASSENGER_POSE } from '../../../Utils/Types';
import { MConfigResourceUtils } from '../../../Utils/MConfigResourceUtils';
import { AnimReindeer } from '../../../AnimsPrefab/AnimReindeer/AnimReindeer';
const { ccclass, property } = _decorator;

@ccclass('ReindeerCartSys')
export class ReindeerCartSys extends CarSys {
    @property(VisualPickUpPassLeft) viusalPassMoveOut_Gate: VisualPickUpPassLeft;
    @property(VisualPickUpPassLeft) viusalPassMoveOut_Parking: VisualPickUpPassLeft;
    @property(Node) nParentSkeletonReindeer: Node;
    private _animReindeer: AnimReindeer = null;

    //======================================
    //#region carSys
    override TriggerInitCar() {
        this.moveCar2Sys.RegisterCbTrigger(
            () => {
                this.viusalPassMoveOut_Parking.node.active = true;
                this.viusalPassMoveOut_Parking.node.angle = 0;
            },
            () => {
                this.viusalPassMoveOut_Parking.node.active = true;
                this.viusalPassMoveOut_Parking.node.angle = -50;
            },
            () => {
                this.viusalPassMoveOut_Parking.node.active = false;
                this.viusalPassMoveOut_Gate.node.active = true;
            },
        );
    }

    override ResetData(): void {
        super.ResetData();
        this.viusalPassMoveOut_Gate.node.active = false;
        this.viusalPassMoveOut_Parking.node.active = false;
    }

    override TriggerCarReadyToMoveTheGround() {
        //TODO xử lý ở đây
    }

    override UpdateVisualPrepareMoveOutCarToTheGate() {
        super.UpdateVisualPrepareMoveOutCarToTheGate();

        // bật node chứa hàng người của ReIndeerCart
        this.viusalPassMoveOut_Parking.node.active = false;
        this.viusalPassMoveOut_Gate.node.active = true;
    }

    public override async Init(jsonCarInit: JsonCar, idCar: number, nMapCar: Node): Promise<void> {
        this.visualCarSys.RegisterCb(
            (colorCar: M_COLOR, sizeCar: number, directCar: DIRECT_CAR, isCarOpen: boolean) => {
                this.LoadAnimReindeer(colorCar, sizeCar, directCar, isCarOpen);
            },
            (colorCar: M_COLOR, sizeCar: number) => {
                // turn off sp visual car move
                this.visualCarSys.spVisualCarMove.node.active = true;

                // turn off visual car support
                this.visualCarSys.visualSupportCar.node.active = false;

                // NOTE: you must change the angle of node car pick UP to 0 because you change angle car in the moveCarSys2
                this.node.angle = 0;
                // if (this._nCar != null) this._nCar.angle = 0;

                // turn on sp visual car pick up + update sf
                this.visualCarSys.spVisualCarPickUp.node.active = true;
                this.visualCarSys.visualPickUpPass.node.active = true;
            }
        )
        await super.Init(jsonCarInit, idCar, nMapCar);
    }
    //#endregion carSys

    //======================================
    //#region VisualCarSys
    override TriggerInInitVisual(colorCar: M_COLOR, numPass: number, nCar: Node, iTypeCar: ITypeCar) {

        // ============================================= pass move gate
        this.viusalPassMoveOut_Gate.TryInitPass(numPass, colorCar);

        // load spriteFrame
        const pathPassengerSitting_2 = MConfigResourceUtils.GetPathPassengers(colorCar, TYPE_PASSENGER_POSE.SITTING_2);
        MConfigResourceUtils.GetImagePassengersUntilLoad(pathPassengerSitting_2, (path: string, sf: SpriteFrame) => {
            try {
                if (pathPassengerSitting_2 == path) {
                    this.viusalPassMoveOut_Gate._listPass.forEach(item => {
                        item.getComponent(Sprite).spriteFrame = sf;
                    });
                }
            } catch (e) {

            }
        })

        // ============================================= pass move out parking
        const positions: Vec3[] = [
            new Vec3(11.501, -7.059, 0),
            new Vec3(-8.046, -6.417, 0),
            new Vec3(-7.936, -25.829, 0),
            new Vec3(12.092, -25.829, 0)
        ];
        this.viusalPassMoveOut_Parking.TryInitPass(numPass, colorCar, positions);

        // load spriteFrame
        const pathPassengerSitting = MConfigResourceUtils.GetPathPassengers(colorCar, TYPE_PASSENGER_POSE.SITTING);
        MConfigResourceUtils.GetImagePassengersUntilLoad(pathPassengerSitting, (path: string, sf: SpriteFrame) => {
            try {
                if (pathPassengerSitting == path) {
                    this.viusalPassMoveOut_Parking._listPass.forEach(item => {
                        item.getComponent(Sprite).spriteFrame = sf;
                    });
                }
            } catch (e) {

            }
        })

    }

    protected TriggerChangeStateCarMove(): void {
        switch (this.StateCarMoving) {
            case STATE_CAR_MOVING.NONE:
                this.ChangeAnimCarMovingOrIdle('idle');
                break;
            default:
                this.ChangeAnimCarMovingOrIdle('run');
                break;
        }
    }
    //#endregion VisualCarSys


    //======================================
    //#region AnimReindeer
    private wasLoadAnim: boolean = false;
    private _infoLastTrigger: { directCar: DIRECT_CAR, isCarOpen: boolean } = null;
    public LoadAnimReindeer(colorCar: M_COLOR = null, sizeCar: number = null, directCar: DIRECT_CAR, isCarOpen: boolean) {
        if (this._animReindeer == null && !this.wasLoadAnim) {
            this.wasLoadAnim = true;
            // load animReindeer
            const nAnimReideer: Node = instantiate(MConfigResourceUtils.GetPfAnimReindeer());
            nAnimReideer.setParent(this.nParentSkeletonReindeer);
            this._animReindeer = nAnimReideer.getComponent(AnimReindeer);
        }

        if (this._animReindeer == null) { return; }

        // info last trigger
        this._infoLastTrigger = {
            directCar: directCar,
            isCarOpen: isCarOpen
        }
        const directCarChoice = !isCarOpen ? directCar : null;
        this._animReindeer.PlayAnimCarReindeer(directCarChoice, this.StateCarMoving == STATE_CAR_MOVING.NONE ? 'idle' : 'run');
    }

    private ChangeAnimCarMovingOrIdle(type: 'idle' | 'run') {
        if (this._infoLastTrigger == null) { return; }

        const directCarChoice = !this._infoLastTrigger.isCarOpen ? this._infoLastTrigger.directCar : null;
        this._animReindeer.PlayAnimCarReindeer(directCarChoice, type);
    }
    //#endregion AnimReindeer
}