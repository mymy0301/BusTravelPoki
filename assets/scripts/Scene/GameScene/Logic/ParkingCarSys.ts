import { _decorator, AnimationComponent, Component, error, instantiate, Node, Size, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { DIRECT_CAR, STATE_GAME, STATE_PARKING_CAR, TYPE_CAR_SIZE, TYPE_ITEM } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { LogicItemInGame } from './ItemInGame/LogicItemInGame';
import { Bezier } from '../../../framework/Bezier';
import * as i18n from 'db://i18n/LanguageData';
import { LogicCarMovingSys } from '../SupportGameSys/LogicCarMovingSys';
import { Type_FxUnlockParking, EVENT_FX_UNLOCK_PARKING_PLAY } from '../../../AnimsPrefab/Fx_unlock_parking/Type_FxUnlockParking';
import { GameSys } from '../GameSys';
import { Utils } from '../../../Utils/Utils';
import { LogEventManager } from '../../../LogEvent/LogEventManager';

const { ccclass, property } = _decorator;

enum NAME_ANIM {
    IDLE_LOCK = "IdleLock",
    IDLE_UNLOCK = "IdleUnlock",
    UNLOCK = "Unlock"
}

@ccclass('ParkingCarSys')
export class ParkingCarSys extends Component {
    @property(Node) nPointIn2: Node;
    @property(Node) nAreaClickVip: Node;
    @property(SpriteFrame) listSfNum: SpriteFrame[] = [];
    @property(Node) nPlaceParkingCar_Signage: Node;
    @property(Node) nWPosAnimVip: Node;

    @property(Sprite) spIdParking: Sprite;
    @property(Node) nVisualEmpty: Node;
    @property(Node) nVisualLock: Node;
    @property(Node) nVisualVipSlot: Node;

    @property(AnimationComponent) animCom: AnimationComponent;

    private _state: STATE_PARKING_CAR = STATE_PARKING_CAR.LOCK_NORMAL;
    private _idParkingCar: number = -1; public get idParkingCar(): number { return this._idParkingCar; }
    private _wPosParkingIn1: Vec3 = Vec3.ZERO; public get wPosParkingIn1(): Vec3 { return this._wPosParkingIn1.clone(); }
    private _wPosParkingOut: Vec3 = Vec3.ZERO; public get wPosParkingOut(): Vec3 { return this._wPosParkingOut.clone(); }
    private _wPosGate: Vec3 = Vec3.ZERO; public get wPosGate(): Vec3 { return this._wPosGate.clone(); }

    private _cbGetWPosParkingCarCanUnlock: CallableFunction = null;

    private readonly SIZE_PARKING_VIP = new Size(120, 100);
    private readonly SIZE_PARKING = new Size(100, 100);

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.WatchAds, this);
    }

    protected onDisable(): void {
        this.nAreaClickVip.off(Node.EventType.TOUCH_END, this.UseVipSlot, this);
    }

    public Init(state: STATE_PARKING_CAR, id: number, wPosGate: Vec3, cbGetWPosParkingCarCanUnlock: CallableFunction) {
        this._cbGetWPosParkingCarCanUnlock = cbGetWPosParkingCarCanUnlock;
        this._idParkingCar = id;
        this._state = state;
        this._wPosGate = wPosGate;
        this.ChangeState(state, true);
        this.spIdParking.spriteFrame = this.listSfNum[id - 1];

        if (state == STATE_PARKING_CAR.LOCK_VIP) {
            this.node.getComponent(UITransform).setContentSize(this.SIZE_PARKING_VIP);
        } else {
            this.node.getComponent(UITransform).setContentSize(this.SIZE_PARKING);
        }
    }

    public ResetData() {
        this._state = STATE_PARKING_CAR.LOCK_NORMAL;
        this._idParkingCar = -1;
        this._wPosParkingIn1 = Vec3.ZERO;
        this._wPosParkingOut = Vec3.ZERO;
        this._wPosGate = Vec3.ZERO;
    }

    public SetUpWPosSpeWithoutResetData(wPosParkingIn: Vec3 = null, wPosParkingOut: Vec3 = null, wPosGate: Vec3 = null) {
        if (wPosParkingIn != null) this._wPosParkingIn1 = wPosParkingIn.clone().add3f(40, 0, 0);
        if (wPosParkingOut != null) this._wPosParkingOut = wPosParkingOut;
        if (wPosGate != null) this._wPosGate = wPosGate;
    }

    public ChangeState(state: STATE_PARKING_CAR, fromInit: boolean = false) {

        const oldState = this._state;

        // check pre change state
        if (this._state == STATE_PARKING_CAR.LOCK_NORMAL && state == STATE_PARKING_CAR.EMPTY) {

            // in case unlock parking
            // emit effect unlock parking
            clientEvent.dispatchEvent(EVENT_FX_UNLOCK_PARKING_PLAY, Type_FxUnlockParking.UI_PARKING, this.node.worldPosition.clone())

            // emit to unlock parking
            clientEvent.dispatchEvent(MConst.EVENT_PARKING.UNLOCK_PARK, this.idParkingCar);

            (async () => {
                try {
                    this.animCom.play(NAME_ANIM.UNLOCK);
                    await Utils.delay(this.animCom.clips.find(t => t.name == NAME_ANIM.UNLOCK).duration * 1000);
                    this.animCom.play(NAME_ANIM.IDLE_UNLOCK);
                    clientEvent.dispatchEvent(MConst.EVENT.IS_ANIM_UNLOCK_PARKING, false);
                } catch (e) {
                }
            })()
        }

        this._state = state;

        if (oldState == STATE_PARKING_CAR.LOCK_NORMAL || this._state == STATE_PARKING_CAR.EMPTY) {
            clientEvent.dispatchEvent(MConst.EVENT_CAR.TRIGGER_CAR_AUTO_MOVE_FORWARD);
        }

        this.UpdateVisual(state);

        // console.warn("Trigger Parking");

        this.node.off(Node.EventType.TOUCH_END, this.WatchAds, this);
        this.nAreaClickVip.off(Node.EventType.TOUCH_END, this.UseVipSlot, this);

        switch (state) {
            case STATE_PARKING_CAR.LOCK_VIP:
                // chạy anim close thảm
                if (!fromInit && LogicItemInGame.Instance.GetItemTypeUsing() != TYPE_ITEM.VIP_SLOT) {
                    clientEvent.dispatchEvent(MConst.EVENT_VIP_PARKING.CLOSE);
                }
                this.nAreaClickVip.on(Node.EventType.TOUCH_END, this.UseVipSlot, this);
                break;
            case STATE_PARKING_CAR.USING_VIP:
                break;
            case STATE_PARKING_CAR.EMPTY:
                break;
            case STATE_PARKING_CAR.USING:
                break;
            case STATE_PARKING_CAR.LOCK_NORMAL:
                this.animCom.play(NAME_ANIM.IDLE_LOCK);
                this.node.on(Node.EventType.TOUCH_END, this.WatchAds, this);
                break;
        }
    }

    private UpdateVisual(stateParking: STATE_PARKING_CAR) {
        switch (stateParking) {
            case STATE_PARKING_CAR.EMPTY:
                this.nVisualEmpty.active = true;
                this.nVisualLock.active = false;
                this.nVisualVipSlot.active = false;
                break;
            case STATE_PARKING_CAR.LOCK_NORMAL:
                this.nVisualEmpty.active = false;
                this.nVisualLock.active = true;
                this.nVisualVipSlot.active = false;
                break;
            case STATE_PARKING_CAR.LOCK_VIP:
                this.nVisualEmpty.active = false;
                this.nVisualLock.active = false;
                this.nVisualVipSlot.active = true;
                break;
            case STATE_PARKING_CAR.USING_VIP:
                this.nVisualEmpty.active = false;
                this.nVisualLock.active = false;
                this.nVisualVipSlot.active = true;
                break;
            case STATE_PARKING_CAR.USING:
                this.nVisualEmpty.active = true;
                this.nVisualLock.active = false;
                this.nVisualVipSlot.active = false;
                break;
        }
    }

    public GetState(): STATE_PARKING_CAR {
        return this._state;
    }

    public TryChangeToEmptyState() {
        if (this._state == STATE_PARKING_CAR.USING_VIP) {
            this.ChangeState(STATE_PARKING_CAR.LOCK_VIP);
            // emit event update visual all vip parking
            clientEvent.dispatchEvent(MConst.EVENT.UPDATE_VISUAL_ALL_VIP_PARKING);
        } else if (this._state == STATE_PARKING_CAR.USING) {
            this.ChangeState(STATE_PARKING_CAR.EMPTY);
        }
    }

    public TryUpdateVisualForVipLock() {
        if (this._state == STATE_PARKING_CAR.LOCK_VIP) {
            this.ChangeState(STATE_PARKING_CAR.LOCK_VIP);
        }
    }

    public async UseVipSlot() {
        LogEventManager.Instance.logButtonClick(`parking_vip`, "ParkingSlot");

        clientEvent.dispatchEvent(MConst.EVENT.USE_ITEM_WHEN_BUY_SUCCESS, TYPE_ITEM.VIP_SLOT);
    }

    public async WatchAds() {
        LogEventManager.Instance.logButtonClick(`parking_ads`, "ParkingSlot");

        if (LogicCarMovingSys.Instance.IsHasCarMoving) {
            clientEvent.dispatchEvent(MConst.NOTIFICATION_IN_GAME.DEFAULT_NOTIFICATION, i18n.t("Wait car moving done"));
            return;
        }

        let canRunLogic = false;
        let canShowUIUnlockParking = true;
        clientEvent.dispatchEvent(MConst.EVENT_GAME_SYS_CB.GET_STATE_GAME, (stateGame: STATE_GAME) => {
            if (stateGame != STATE_GAME.PLAYING) {
                canShowUIUnlockParking = false;
            }
            canRunLogic = true;
        })
        await Utils.WaitReceivingDone(() => canRunLogic);

        if (this._state == STATE_PARKING_CAR.LOCK_NORMAL && canShowUIUnlockParking) {
            // clientEvent.dispatchEvent(MConst.EVENT.PAUSE_GAME);
            // get the parking car can unlock
            let wPosParkingCarCanUnlock = null;
            if (this._cbGetWPosParkingCarCanUnlock) {
                wPosParkingCarCanUnlock = this._cbGetWPosParkingCarCanUnlock();
            }
            clientEvent.dispatchEvent(MConst.EVENT.SHOW_UI, TYPE_UI.UI_UNLOCK_PARKING, 1, true, wPosParkingCarCanUnlock);
        }
    }

    public GetWPosPlaceCarVip(typeCar: TYPE_CAR_SIZE): { wPos: Vec3, angle: number } {
        switch (typeCar) {
            case TYPE_CAR_SIZE['4_CHO']:
                return { wPos: this.node.worldPosition.clone(), angle: 0 };
            case TYPE_CAR_SIZE['6_CHO']:
                return { wPos: this.node.worldPosition.clone().add3f(4, 0, 0), angle: 0 };
            case TYPE_CAR_SIZE['10_CHO']:
                return { wPos: this.node.worldPosition.clone().add3f(-0.5, 5.5, 0), angle: 2 };
        }

        return { wPos: this.node.worldPosition.clone(), angle: 0 };
    }

    public GetWPosSignage(): Vec3 {
        return this.nPlaceParkingCar_Signage.worldPosition.clone();
    }

    public GetWPosAnimVip(): Vec3 {
        return this.nWPosAnimVip.worldPosition.clone();
    }


    //============================================
    //#region FUNC move car IN
    public GetListNodeAndAngleForCarMoveIn(wPosCar: Vec3, direction: DIRECT_CAR): { listVec3: Vec3[], listAngle: number[], fromDirection: DIRECT_CAR } {

        let startPos: Vec3 = Vec3.ZERO;
        let midPoint: Vec3 = Vec3.ZERO;
        let endPos: Vec3 = Vec3.ZERO;
        let listAngle: number[] = [];
        let listVec3Move: Vec3[] = Bezier.GetListPointsToTween3(10, startPos, midPoint, endPos);

        let directCarMoveOn: DIRECT_CAR = DIRECT_CAR.LEFT;
        if (direction == DIRECT_CAR.RIGHT || direction == DIRECT_CAR.TOP_RIGHT || direction == DIRECT_CAR.BOTTOM_RIGHT) {
            directCarMoveOn = DIRECT_CAR.LEFT;
        } else if (direction == DIRECT_CAR.LEFT || direction == DIRECT_CAR.TOP_LEFT || direction == DIRECT_CAR.BOTTOM_LEFT) {
            directCarMoveOn = DIRECT_CAR.RIGHT;
        }

        // check right or left
        if (directCarMoveOn == DIRECT_CAR.RIGHT) {
            // right
            // ==================== there are 2 case in here ===============
            // 1 . nó từ bên phải nhưng ko đủ khoảng cách để chạy anim cua xe cho hợp lý
            // 2 . nó từ đi từ bên phải sang và đủ khoảng cách để cua xe hợp lý
            const distanceCarAndParking = wPosCar.x - this.node.worldPosition.x;
            const distanceCarToReadyPark = 40;
            const distanceRightStartPoint: number = 50;
            const distanceRightMidPoint: number = 20;

            if (distanceCarAndParking <= distanceCarToReadyPark) {
                // if (false) {
                // case 1.
                // trong trường hợp này anim sẽ chỉ có 4 bước
                // B1: là xe đang đi lên ở vị trí hiện tại -28
                // B2: là xe đang đi lên ở góc -12.5 độ
                // B3: là xe đang đi lên ở góc 0 độ
                directCarMoveOn = DIRECT_CAR.TOP;

                // listVec3Move = [
                //     new Vec3((this.node.worldPosition.x + wPosCar.x) / 3, (this.node.worldPosition.y + this.wPosParkingIn1.y) / 3),
                //     new Vec3((this.node.worldPosition.x + wPosCar.x) / 2, (this.node.worldPosition.y + this.wPosParkingIn1.y) / 2),
                //     new Vec3((this.node.worldPosition.x + wPosCar.x) / 3 * 2, (this.node.worldPosition.y + this.wPosParkingIn1.y) / 3 * 2),
                //     this.node.worldPosition.clone()
                // ]

                const distanceMoveToEnd_X = this.node.worldPosition.x - wPosCar.x;
                const distanceMoveToEnd_Y = this.node.worldPosition.y - wPosCar.y;

                listVec3Move = [
                    new Vec3(wPosCar.x + distanceMoveToEnd_X / 3, wPosCar.y + distanceMoveToEnd_Y / 3),
                    new Vec3(wPosCar.x + distanceMoveToEnd_X / 2, wPosCar.y + distanceMoveToEnd_Y / 2),
                    new Vec3(wPosCar.x + distanceMoveToEnd_X / 3 * 2, wPosCar.y + distanceMoveToEnd_Y / 3 * 2),
                    this.node.worldPosition.clone()
                ]

                // tính toán góc quay
                // biết góc hướng lên trên là -28
                for (let i = 0; i < listVec3Move.length; i++) {
                    let angle = Math.atan2(listVec3Move[i].y - this.node.worldPosition.y, listVec3Move[i].x - this.node.worldPosition.x) * 180 - 90 - 72;
                    if (i == listVec3Move.length - 1) {
                        angle = 0;
                    }
                    listAngle.push(angle);
                }

                // console.log("listAngle", listAngle);
            } else {
                // case 2.
                startPos = this.wPosParkingIn1.add3f(distanceRightStartPoint, 0, 0);
                endPos = this.nPointIn2.worldPosition.clone();
                midPoint = new Vec3(endPos.x + distanceRightMidPoint, startPos.y + distanceRightMidPoint, 0);
                // ==== angle
                // script
                // topLeft true 1,2,3,4,5,6,7,8,9,10
                listAngle = [0, 63, 50.4, 37.8, 25.2, 12.6, 0, 0, 0, 0, 0];
                listVec3Move = Bezier.GetListPointsToTween3(10, startPos, midPoint, endPos);
            }
        } else {
            // left
            const distanceLeftStartPoint: number = -50;
            startPos = this.wPosParkingIn1.add3f(distanceLeftStartPoint, 0, 0);
            endPos = this.nPointIn2.worldPosition.clone();
            midPoint = new Vec3(endPos.x + 20, startPos.y + 20, 0);
            // ==== angle
            // script
            // right true 1,2,3
            // top false 4,5,6,
            // topLeft true 7,8,9,10
            listAngle = [0, 20, 32, 44, 56, 68, 90, -25, 0, 0, 0];
            listVec3Move = Bezier.GetListPointsToTween3(10, startPos, midPoint, endPos);
        }

        return {
            listVec3: listVec3Move,
            listAngle: listAngle,
            fromDirection: directCarMoveOn
        }
    }
    //#endregion FUNC for move car IN
    //============================================

    //============================================
    //#region FUNC move car OUT
    public GetListNodeAndAngleForCarMoveOut(wPosStart: Vec3) {
        /**
         * Logic đỗ xe ở đây là :
         * listVec3 Move 1 sẽ là ảnh xe left chéo di chuyển xuống dưới
         * listVec3 Move 2 sẽ là ảnh xe left di chuyển ngang
         */

        let listVec3Move_1: Vec3[] = [
            new Vec3(11.108, -22.106),
            new Vec3(16.512, -37.226),
            new Vec3(13.816, -53.082)
        ]

        listVec3Move_1.forEach((t) => t.add(wPosStart));

        let listAngle_1: number[] = [
            0,
            15,
            -10
        ]

        let listVec3Move_2: Vec3[] = [
            new Vec3(17.413, -57.961),
            new Vec3(3.24, -72.418),
            new Vec3(-43.578, -80.346),
            new Vec3(-19.328, -80.346)
        ]
        listVec3Move_2.forEach((t) => t.add(wPosStart));

        let listAngle_2: number[] = [
            10,
            -10,
            0,
            0
        ]

        return {
            l_m1: listVec3Move_1,
            angle_1: listAngle_1,
            l_m2: listVec3Move_2,
            angle_2: listAngle_2
        }
    }

    public HideVipParking() {
        this.node.active = false;
    }
    //#endregion FUNC move car OUT
    //============================================
}


