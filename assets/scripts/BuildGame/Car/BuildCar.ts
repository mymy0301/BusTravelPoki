import { _decorator, Button, CCBoolean, CCInteger, CCString, Color, Component, Enum, error, Label, Node, Sprite, Tween, tween, Vec2, Vec3 } from 'cc';
import { DIRECT_CAR, JsonCar, M_COLOR, TYPE_CAR_SIZE, GetColorForSpriteFromMColor, GetNumberByMColor, GetMColorByNumber, GetNameDirectionCar, GetAngleSuitWithDirectionCar, ConvertSizeCarNumberToJsonBusFrenzy, GetNameCarSize, ITypeCar, convertNumberToColorKeyLock, COLOR_KEY_LOCK, convertColorKeyLockToNumber } from '../../Utils/Types';
import { MConfigResourceUtils } from '../../Utils/MConfigResourceUtils';
import { BuildGameSys } from '../BuildGameSys';
import { InfoCustomForColliderCar } from '../../Scene/GameScene/Logic/InfoCustomForColliderCar';
import { MoveCar2Sys } from '../../Scene/GameScene/Logic/MoveCar2Sys';
import { MConstBuildGame, STATE_BUILD_GAME } from '../MConstBuildGame';
import { clientEvent } from '../../framework/clientEvent';
import { DebugColliderCarWhenBuild } from './DebugColliderCarWhenBuild';
import { Utils } from '../../Utils/Utils';
import { MConst } from '../../Const/MConst';
import { BuildItemBase, IBuildItemBase, ITouchItem } from '../BuildItemBase';
import { NotificationOfCarBuild } from './NotificationOfCarBuild';
import { MConfigs } from '../../Configs/MConfigs';
import { VisualArrowCar } from '../../Scene/GameScene/Logic/Car/VisualArrowCar';
import { VisualSupportCar } from '../../Scene/GameScene/Logic/Car/VisualSupportCar';
const { ccclass, property } = _decorator;

enum M_COLOR_CAR_BUILD {
    BLACK,
    BLUE,
    GREEN,
    GRAY,
    CYAN,
    ORANGE,
    PINK,
    PURPLE,
    RED,
    YELLOW,
    POLICE,
    MILITARY,
    AMBULANCE,
    FIRE_TRUCK,
    REINDEER_CART
}
Enum(M_COLOR_CAR_BUILD);
@ccclass('BuildCar')
export class BuildCar extends BuildItemBase implements IBuildItemBase, ITouchItem {
    @property({ type: DIRECT_CAR }) directionCar: DIRECT_CAR = DIRECT_CAR.BOTTOM;
    @property({ type: M_COLOR_CAR_BUILD }) colorCar = M_COLOR_CAR_BUILD.BLACK;
    @property({ type: M_COLOR_CAR_BUILD }) colorKey_Lock: COLOR_KEY_LOCK = COLOR_KEY_LOCK.BLUE;
    @property({ type: TYPE_CAR_SIZE }) carSize: TYPE_CAR_SIZE = TYPE_CAR_SIZE['4_CHO'];
    @property({ type: Sprite }) spCar: Sprite;
    @property(CCBoolean) isMysteryCar = false;
    @property(CCBoolean) isTwoWayCar = false;
    @property(CCInteger) timeCarCallCoolDown = -1;
    @property(CCInteger) timeCarCoolDown = -1;
    @property(CCInteger) numCarCallCoolDown: number = -1;
    @property(CCInteger) idCarKeyOfCarLock: number = -1;
    @property(CCInteger) idCarLockOfCarKey: number = -1;
    @property(VisualArrowCar) visualArrowCar: VisualArrowCar;
    @property(Sprite) spCarMystery: Sprite;
    @property(Label) lbIdCar: Label;
    @property(MoveCar2Sys) moveCar2Sys: MoveCar2Sys;
    @property(DebugColliderCarWhenBuild) debugColliderCarWhenBuild: DebugColliderCarWhenBuild;
    @property(NotificationOfCarBuild) notificationOfCarBuild: NotificationOfCarBuild;
    @property(Node) nClick: Node;
    @property(VisualSupportCar) visualSupportCar: VisualSupportCar;
    public listIdCarBlock: number[] = [];
    private _idCar: number = 0; public get IDCar(): number { return this._idCar; }
    private _groupCar: number = -1; public get GroupCar(): number { return this._groupCar; } public set GroupCar(value: number) { this._groupCar = value; }

    override onLoad(): void {
        super.onLoad();
        this.Init(this, this);
        this.debugColliderCarWhenBuild.registerColliderCheck(this.node, () => { return this.carSize }, () => { return this.directionCar }, () => { return GetMColorByNumber(this.colorCar + 1) });
        this.visualArrowCar.Init();
        // this.notificationOfCarBuild.onLoad(() => { return this.IDCar });
    }

    override onDestroy(): void {
        super.onDestroy();
        this.debugColliderCarWhenBuild.unRegisterColliderCheck();
        // this.notificationOfCarBuild.onDestroy();
    }

    public SwapIdCar(idCarWantToChange: number, idCarChangeTo: number): void {
        if (this.IDCar == idCarWantToChange) {
            this.SetIdCar(idCarChangeTo);
        }
    }

    public GetInfoToSaveData(): JsonCar {
        let result: JsonCar = {
            idCar: this.IDCar,
            carColor: this.colorCar + 1,
            carSize: ConvertSizeCarNumberToJsonBusFrenzy(this.carSize),
            carPosition: this.node.position.clone().multiplyScalar(1 / MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS),
            carDirection: this.directionCar,
            ...(this.isMysteryCar && { isMysteryCar: this.isMysteryCar }),
            ...(this.timeCarCallCoolDown > 0 && { timeCarCallCoolDown: this.timeCarCallCoolDown }),
            ...(this.timeCarCoolDown > 0 && { timeCarCoolDown: this.timeCarCoolDown }),
            ...(this.timeCarCoolDown > 0 && this.numCarCallCoolDown >= 0 && { numCarRemainingCallCoolDown: this.numCarCallCoolDown }),
            ...(this.isTwoWayCar && { isTwoWayCar: this.isTwoWayCar }),
            ...(this.idCarKeyOfCarLock != -1 && { idCarKeyOfCarLock: this.idCarKeyOfCarLock }),
            ...(this.idCarLockOfCarKey != -1 && { idCarLockOfCarKey: this.idCarLockOfCarKey }),
            ...(this.colorKey_Lock != null && (this.idCarKeyOfCarLock != -1 || this.idCarLockOfCarKey != -1) && { colorKey_Lock: convertColorKeyLockToNumber(this.colorKey_Lock) }),
            ...(this.listIdCarBlock.length > 0 && this.colorCar == M_COLOR_CAR_BUILD.REINDEER_CART && { listIdCarTrigger: this.listIdCarBlock })
        }

        return result;
    }

    public SetData(jsonCar: JsonCar, wPosMap: Vec3) {
        if (jsonCar != null) {
            this.colorCar = jsonCar.carColor - 1;
            this.carSize = jsonCar.carSize;
            this.node.worldPosition = Utils.ConvertPosToWorldOfANode(wPosMap, jsonCar.carPosition, MConst.DEFAULT_RATIO_CONVERT_POS_TO_WPOS);
            this.directionCar = jsonCar.carDirection;
            this.isMysteryCar = (jsonCar.isMysteryCar != null && jsonCar.isMysteryCar) ? true : false;
            this.timeCarCallCoolDown = (jsonCar.timeCarCallCoolDown != null) ? jsonCar.timeCarCallCoolDown : -1;
            this.timeCarCoolDown = (jsonCar.timeCarCoolDown != null) ? jsonCar.timeCarCoolDown : -1;
            this.numCarCallCoolDown = (jsonCar.numCarRemainingCallCoolDown != null) ? jsonCar.numCarRemainingCallCoolDown : -1;
            this.isTwoWayCar = (jsonCar.isTwoWayCar != null) ? jsonCar.isTwoWayCar : false;
            this.idCarKeyOfCarLock = (jsonCar.idCarKeyOfCarLock != null) ? jsonCar.idCarKeyOfCarLock : -1;
            this.idCarLockOfCarKey = (jsonCar.idCarLockOfCarKey != null) ? jsonCar.idCarLockOfCarKey : -1;
            this.colorKey_Lock = (jsonCar.colorKey_Lock != null) ? convertNumberToColorKeyLock(jsonCar.colorKey_Lock) : null;
            this.listIdCarBlock = jsonCar.listIdCarTrigger == null ? null : jsonCar.listIdCarTrigger;
        } else {
            this.colorCar = M_COLOR_CAR_BUILD.BLACK;
            this.carSize = TYPE_CAR_SIZE['4_CHO'];
            this.directionCar = DIRECT_CAR.TOP;
            this.isMysteryCar = false;
            this.isTwoWayCar = false;
            this.timeCarCallCoolDown = -1;
            this.timeCarCoolDown = -1;
            this.numCarCallCoolDown = -1;
            this.idCarKeyOfCarLock = -1;
            this.idCarLockOfCarKey = -1;
            this.colorKey_Lock = null;
            this.listIdCarBlock = [];
        }
        this.UpdateNameCar();

        this.ChangeDirection(this.directionCar);
    }

    public SetIdCar(idCar: number) {
        this._idCar = idCar;
        this.lbIdCar.string = idCar.toString();
    }

    public ChangeColor(numColor: number, numSize: number = -1) {
        this.colorCar = numColor;

        // check can update numSize
        if (numSize > -1) this.carSize = numSize;
        this.UpdateUICar();
        this.UpdateNameCar();
    }

    public ChangeSize(numSize: number) {
        this.carSize = numSize;
        this.UpdateUICar();
        this.UpdateColliderCar();
        this.UpdateNameCar();
    }

    public ChangeDirection(direction: DIRECT_CAR) {
        this.directionCar = direction;
        this.UpdateUICar();
        this.UpdateColliderCar();
        this.UpdateNameCar();

        // flip image if need
        if (direction == DIRECT_CAR.RIGHT || direction == DIRECT_CAR.TOP_RIGHT || direction == DIRECT_CAR.BOTTOM_RIGHT) {
            this.spCar.node.scale = new Vec3(-1, 1, 1);
        } else {
            this.spCar.node.scale = Vec3.ONE;
        }

        // update button click
        this.nClick.getComponent(Sprite).spriteFrame = MConfigResourceUtils.GetImageCar(MConfigResourceUtils.GetPathCar(GetMColorByNumber(this.colorCar + 1), this.carSize, DIRECT_CAR.TOP));
        this.nClick.angle = GetAngleSuitWithDirectionCar(direction);
    }

    public ChangeIsMysteryCar(isMysteryCar: boolean) {
        this.isMysteryCar = isMysteryCar;

        // changeUI
        this.UpdateUICar();
    }

    public ChangeIsTwoWayCar(isTwoWayCar: boolean) {
        this.isTwoWayCar = isTwoWayCar;
        //changeUI
        this.UpdateUICar();
    }

    public SetTimeCarCallCoolDown(timeCar: number) {
        this.timeCarCallCoolDown = timeCar;
    }

    public SetTimeCoolDown(timeCar: number) {
        this.timeCarCoolDown = timeCar;
    }

    public SetNumCarCallCoolDown(numCar: number) {
        this.numCarCallCoolDown = numCar;
    }

    public SetIdCarKey(idCarKey: number) {
        this.idCarKeyOfCarLock = idCarKey;
        if (this.idCarKeyOfCarLock > -1) {
            this.UpdateUICar();
        }
    }

    public SetIdCarLock(idCarLock: number) {
        this.idCarLockOfCarKey = idCarLock;
        if (this.idCarLockOfCarKey > -1) {
            this.UpdateUICar();
        }
    }

    public SetColorKeyLock(newColor: COLOR_KEY_LOCK, needUpdateUI: boolean = true) {
        this.colorKey_Lock = newColor;
        needUpdateUI && this.UpdateUICar();
    }

    private UpdateNameCar() {
        this.node.name = `car_${this._idCar}_${GetNameDirectionCar(this.directionCar)}_${this.carSize}_${this.colorCar + 1}`;
    }

    private UpdateColliderCar() {

        this.debugColliderCarWhenBuild.unRegisterColliderCheck();

        // update collider car
        const listConnerUpdate: Vec3[] = InfoCustomForColliderCar.GetListConner(this.carSize, this.directionCar, GetMColorByNumber(this.colorCar + 1));
        let listNewPoint: Vec2[] = listConnerUpdate.map(vec3 => new Vec2(vec3.x, vec3.y));
        this.moveCar2Sys.polygonCheckCar.points = listNewPoint;

        this.debugColliderCarWhenBuild.registerColliderCheck(this.node, () => { return this.carSize }, () => { return this.directionCar }, () => { return GetMColorByNumber(this.colorCar + 1) });
    }

    private GetITypeCar(): ITypeCar {
        return {
            isCarMystery: this.isMysteryCar,
            isCarTwoWay: this.isTwoWayCar,
            isCarKey: this.idCarLockOfCarKey >= 0,
            isCarLock: this.idCarKeyOfCarLock >= 0,
            colorKeyLock: this.colorKey_Lock,
            isCarFiretruck: GetMColorByNumber(this.colorCar + 1) == M_COLOR.FIRE_TRUCK,
            isCarAmbulance: GetMColorByNumber(this.colorCar + 1) == M_COLOR.AMBULANCE,
            isCarMilitary: GetMColorByNumber(this.colorCar + 1) == M_COLOR.MILITARY
        }
    }

    public UpdateUICar() {
        // console.warn("call update UICar");

        let pathImageCar = null;
        const mColorCar = this.colorKey_Lock;

        switch (true) {
            case this.idCarLockOfCarKey >= 0:
                // turn off mysteryCar and the question
                this.spCarMystery.node.active = false;
                this.spCar.node.active = true;

                pathImageCar = MConfigResourceUtils.GetPathCar(GetMColorByNumber(this.colorCar + 1), this.carSize, this.directionCar);
                this.spCar.spriteFrame = MConfigResourceUtils.GetImageCar(pathImageCar);

                //arrow
                this.visualArrowCar.AutoUpdateArrow(this.directionCar, this.carSize, this.GetITypeCar(), GetMColorByNumber(this.colorCar))
                this.visualArrowCar.SetUIArrowKey(this.directionCar, this.carSize, mColorCar);
                break;
            case this.idCarKeyOfCarLock >= 0:
                // turn off mysteryCar and the question
                this.spCarMystery.node.active = false;
                this.spCar.node.active = true;

                pathImageCar = MConfigResourceUtils.GetPathCar(GetMColorByNumber(this.colorCar + 1), this.carSize, this.directionCar);
                this.spCar.spriteFrame = MConfigResourceUtils.GetImageCar(pathImageCar);

                //arrow
                this.visualArrowCar.ChangeTypeArrowToLock();
                this.visualArrowCar.SetUIArrowLock(this.directionCar, this.carSize, mColorCar);
                break;
            case this.isMysteryCar:
                //hide UI normal
                this.spCar.node.active = false;
                this.spCarMystery.node.active = true;

                // update visual mystery car
                const pathSfMysteryCar = MConfigResourceUtils.GetPathMysteryCar(this.directionCar, this.carSize);
                const sfMysteryCar = MConfigResourceUtils.GetImageMysteryCar(pathSfMysteryCar);
                if (sfMysteryCar != null) {
                    this.spCarMystery.spriteFrame = sfMysteryCar;
                }
                switch (this.directionCar) {
                    case DIRECT_CAR.TOP: case DIRECT_CAR.TOP_LEFT: case DIRECT_CAR.LEFT: case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.BOTTOM:
                        this.spCarMystery.node.scale = MConfigs.SCALE_SPECIAL_CAR;
                        break;
                    case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.RIGHT: case DIRECT_CAR.TOP_RIGHT:
                        this.spCarMystery.node.scale = MConfigs.SCALE_SPECIAL_CAR.clone().multiply3f(-1, 1, 1)
                        break;
                }

                // arrow
                this.visualArrowCar.AutoUpdateArrow(this.directionCar, this.carSize, this.GetITypeCar(), GetMColorByNumber(this.colorCar))
                // this.visualArrowCar.SetUIArrowMystery(this.directionCar, this.carSize);
                break;
            default:
                // turn off mysteryCar and the question
                this.spCarMystery.node.active = false;

                this.spCar.node.active = true;

                pathImageCar = MConfigResourceUtils.GetPathCar(GetMColorByNumber(this.colorCar + 1), this.carSize, this.directionCar);
                // console.log(`${this.node.name}----${pathImageCar}`);
                this.spCar.spriteFrame = MConfigResourceUtils.GetImageCar(pathImageCar);

                // arrow
                this.visualArrowCar.AutoUpdateArrow(this.directionCar, this.carSize, this.GetITypeCar(), GetMColorByNumber(this.colorCar))
                // this.visualArrowCar.SetUIArrowNormal(this.directionCar, this.carSize);
                break;
        }
    }

    DragDone(): void {
        //NOTE update something in here
    }
    WarningObject(): void {
        this.visualArrowCar.nArrow.getComponent(Sprite).color = Color.RED;
    }
    ChoicingObject(): void {
        this.RegisterKey();
        this.visualArrowCar.nArrow.getComponent(Sprite).color = Color.GREEN;
    }
    UnChoicingObject(): void {
        this.UnRegisterKey();
        this.visualArrowCar.nArrow.getComponent(Sprite).color = Color.WHITE;
    }
    SetObjectInBuildGameChoicing(node: Node): void {
        BuildGameSys.Instance.SetCarChoicing(node);
    }

    //===========================================
    // #region ITouchItem
    MoveObj(touchMove: Vec2): void {
        let wPosMove: Vec3 = new Vec3(touchMove.x, touchMove.y, 0);
        this.node.worldPosition = wPosMove;
    }
    RotateObj(): void {
        if (this.directionCar == DIRECT_CAR.TOP_RIGHT) {
            this.directionCar = DIRECT_CAR.TOP;
        } else {
            this.directionCar += 1;
        }
        this.ChangeDirection(this.directionCar);
        clientEvent.dispatchEvent(MConstBuildGame.EVENT_BUILDING.UPDATE_DIRECT_CAR_UI_INFO, this.directionCar);
    }
    IsChoiceThisObject(): boolean {
        return BuildGameSys.Instance.NCarChoicing == this.node;
    }
    // #endregion ITouchItem
    //===========================================

    //===========================================
    // #region listIdBlock
    public IsExitsIdBlock(idCarBlock: number) {
        return this.listIdCarBlock.includes(idCarBlock)
    }

    public RemoveIdBlock(idCarBlock: number) {
        const index = this.listIdCarBlock.indexOf(idCarBlock);
        if (index !== -1) {
            this.listIdCarBlock.splice(index, 1);
        }
    }

    public AddIdBlock(idCarBlock: number) {
        this.listIdCarBlock.push(idCarBlock);
    }

    public ClearListIdBlock() {
        this.listIdCarBlock = [];
    }
    // #endregion listIdBlock
    //===========================================
}

function convertMColorBuildToMColor(input: M_COLOR_CAR_BUILD): M_COLOR {
    switch (input) {
        case M_COLOR_CAR_BUILD.BLACK: return M_COLOR.BLACK;
        case M_COLOR_CAR_BUILD.BLUE: return M_COLOR.BLUE;
        case M_COLOR_CAR_BUILD.GREEN: return M_COLOR.GREEN;
        case M_COLOR_CAR_BUILD.GRAY: return M_COLOR.GRAY;
        case M_COLOR_CAR_BUILD.CYAN: return M_COLOR.CYAN;
        case M_COLOR_CAR_BUILD.ORANGE: return M_COLOR.ORANGE;
        case M_COLOR_CAR_BUILD.PINK: return M_COLOR.PINK;
        case M_COLOR_CAR_BUILD.PURPLE: return M_COLOR.PURPLE;
        case M_COLOR_CAR_BUILD.RED: return M_COLOR.RED;
        case M_COLOR_CAR_BUILD.YELLOW: return M_COLOR.YELLOW;
        case M_COLOR_CAR_BUILD.POLICE: return M_COLOR.POLICE;
        case M_COLOR_CAR_BUILD.MILITARY: return M_COLOR.MILITARY;
        case M_COLOR_CAR_BUILD.AMBULANCE: return M_COLOR.AMBULANCE;
        case M_COLOR_CAR_BUILD.FIRE_TRUCK: return M_COLOR.FIRE_TRUCK;
        case M_COLOR_CAR_BUILD.REINDEER_CART: return M_COLOR.REINDEER_CART;
        default: return M_COLOR.BLACK;
    }
}