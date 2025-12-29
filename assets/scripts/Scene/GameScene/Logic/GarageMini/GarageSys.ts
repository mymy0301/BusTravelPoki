import { _decorator, Component, geometry, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, Vec3, director, RaycastResult2D, PhysicsSystem2D, ERaycast2DType, Color, Vec2 } from 'cc';
import { DIRECT_CAR, GetMColorByNumber, GROUP_COLLIDER, JsonCar, JsonGarage } from 'db://assets/scripts/Utils/Types';
import { ConvertSizeCarFromJson, TYPE_CAR_SIZE } from '../../../../Utils/Types';

import { VisualGarageSys } from './VisualGarageSys';
import { InfoGarageSys } from './InfoGarageSys';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { MConsolLog } from 'db://assets/scripts/Common/MConsolLog';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { InfoCustomForColliderCar } from '../InfoCustomForColliderCar';
import { CustomRayCastCheck } from 'db://assets/scripts/Utils/CustomRayCastCheck';
import { MConfigs } from 'db://assets/scripts/Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('GarageSys')
export class GarageSys extends Component {
    @property(VisualGarageSys) VisualGarageSys: VisualGarageSys;
    @property(InfoGarageSys) InfoGarageSys: InfoGarageSys;
    private readonly timeAnimGenCar: number = 0.5 / 3;

    // this Json suit with Top => you need to cacul distance with each direction to get the right data
    private readonly distanceGenCarWithType = {
        [TYPE_CAR_SIZE['4_CHO']]: 30,
        [TYPE_CAR_SIZE['6_CHO']]: 30,
        [TYPE_CAR_SIZE['10_CHO']]: 45,
    }

    private readonly distanceCheckCarCanGenWithType = {
        [TYPE_CAR_SIZE['4_CHO']]: 55,
        [TYPE_CAR_SIZE['6_CHO']]: 60,
        [TYPE_CAR_SIZE['10_CHO']]: 80,
    }

    private _idCarBlocking: number = -1;
    private _cbGenCar: CallableFunction = null;
    private _cbSetIdGarageToCar: CallableFunction = null;
    private _cbGetIdCarFromPlaceHoldCar: CallableFunction = null;
    private _cbRegisterClickCar: CallableFunction = null;
    private _cbGetRatioMap: CallableFunction = null;


    protected onLoad(): void {
        clientEvent.on(MConst.EVENT_GARAGE.TRY_GEN_CAR_AFTER_A_CAR_MOVE_DONE, this.TryGenNextCarAfterCarBlockMoveOut, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.EVENT_GARAGE.TRY_GEN_CAR_AFTER_A_CAR_MOVE_DONE, this.TryGenNextCarAfterCarBlockMoveOut, this);
    }

    public Init(info: JsonGarage, idGarage: number, cbGenCar: CallableFunction, cbSetIdGarageToCar: CallableFunction,
        cbGetIdCar: CallableFunction, cbRegisterClickCar: CallableFunction, cbGetRatioMap: CallableFunction
    ) {
        this.InfoGarageSys.Init(info, idGarage);
        this.VisualGarageSys.Init(info);
        this._cbGenCar = cbGenCar;
        this._cbSetIdGarageToCar = cbSetIdGarageToCar;
        this._cbGetIdCarFromPlaceHoldCar = cbGetIdCar;
        this._cbRegisterClickCar = cbRegisterClickCar;
        this._cbGetRatioMap = cbGetRatioMap;
    }

    /**
     * remember and very carefully about block UI in here
     */
    private async GenCar() {

        let infoCarGen: JsonCar = this.InfoGarageSys.GetInfoNextCar(this.InfoGarageSys.GetIndexCarNow());
        const wPosGenCar: Vec3 = this.VisualGarageSys.nGenCar.worldPosition.clone();
        // update infoCar in here
        let infoGenCar: { nCar: Node, idCar: number } = this._cbGenCar(infoCarGen, true, this.VisualGarageSys.nGenCar);
        const nCar: Node = infoGenCar.nCar;
        nCar.scale = Vec3.ZERO;
        nCar.worldPosition = wPosGenCar;
        // unRegisterClick car
        this._cbRegisterClickCar(nCar, false);

        // save the id car is blocking
        this._idCarBlocking = infoGenCar.idCar;

        // set idGarage for car
        this._cbSetIdGarageToCar(nCar, this.InfoGarageSys.IDGarage);

        const wPosCarMoveOut = GetWPosCarMoveOut(this.node.worldPosition.clone(), this.InfoGarageSys.DirectGarage, infoCarGen.carSize, this.distanceGenCarWithType);

        // sibling again the nCar in the map
        const indexGarage = this.node.getSiblingIndex();
        const indexSuitForTheMap = GetIndexSuitToSetTheMap(this.node.parent.children.map(v => v.worldPosition.clone()), wPosCarMoveOut);
        if (indexSuitForTheMap > indexGarage) nCar.setSiblingIndex(indexGarage - 1);
        else nCar.setSiblingIndex(indexSuitForTheMap);

        // emit to gen place hold car to move there
        this.EmitPlaceHoldCar(infoCarGen, infoGenCar.idCar, wPosCarMoveOut);

        tween(nCar)
            .to(this.timeAnimGenCar, { worldPosition: wPosCarMoveOut, scale: Vec3.ONE })
            .call(() => {
                // update check can use btnShuffle or not 
                // because maybe the the new car can shuffle car
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_SHUFFLE);
                clientEvent.dispatchEvent(MConst.EVENT_ITEM_IN_GAME.CHECK_CAN_USE_BTN_VIP);
            })
            .delay(0.1)
            .call(() => {

                this._cbRegisterClickCar(nCar, true);
            })
            .start();

        // increase index Car
        this.InfoGarageSys.IncreaseIndexCar();

        // update Visual Sign
        this.VisualGarageSys.UpdateSign(
            this.InfoGarageSys.GetInfoNextCar(this.InfoGarageSys.GetIndexCarNow()),
            this.InfoGarageSys.GetNumRemainingCar(),
            this.InfoGarageSys.DirectGarage
        );
    }

    //#region Gen next car
    private EmitPlaceHoldCar(infoCar: JsonCar, idCar: number, wPosCarMoveTo: Vec3) {
        // update collider car
        const listConnerUpdate: Vec3[] = InfoCustomForColliderCar.GetListConner(ConvertSizeCarFromJson(infoCar.carSize), infoCar.carDirection, GetMColorByNumber(infoCar.carColor));
        const listNewPoint: Vec2[] = listConnerUpdate.map(vec3 => new Vec2(vec3.x, vec3.y));
        clientEvent.dispatchEvent(MConst.EVENT.INIT_HOLD_PLACE_CAR, idCar, wPosCarMoveTo.clone(), listNewPoint);
    }

    private CanGenCar(): boolean {
        // find the id car blocking => if find save the id car
        const self = this;
        const indexCar: number = this.InfoGarageSys.GetIndexCarNow();
        const infoCar: JsonCar = this.InfoGarageSys.GetInfoNextCar(indexCar);
        const sizeCar: TYPE_CAR_SIZE = ConvertSizeCarFromJson(infoCar.carSize);
        const ratioMap: number = this._cbGetRatioMap();
        let wPosCarOut1: Vec3 = Vec3.ZERO;
        let wPosCarOut2: Vec3 = Vec3.ZERO;
        let wPosCarOut3: Vec3 = Vec3.ZERO;

        switch (this.InfoGarageSys.DirectGarage) {
            case DIRECT_CAR.TOP: case DIRECT_CAR.BOTTOM:
                wPosCarOut1 = this.node.worldPosition.clone().add3f(-20 * ratioMap, 0, 0);
                wPosCarOut2 = this.node.worldPosition.clone().add3f(0, 0, 0);
                wPosCarOut3 = this.node.worldPosition.clone().add3f(20 * ratioMap, 0, 0);
                break;
            case DIRECT_CAR.LEFT: case DIRECT_CAR.RIGHT:
                wPosCarOut1 = this.node.worldPosition.clone().add3f(0, -20 * ratioMap, 0);
                wPosCarOut2 = this.node.worldPosition.clone().add3f(0, 0, 0);
                wPosCarOut3 = this.node.worldPosition.clone().add3f(0, 20 * ratioMap, 0);
                break;
            case DIRECT_CAR.BOTTOM_RIGHT: case DIRECT_CAR.TOP_LEFT:
                wPosCarOut1 = this.node.worldPosition.clone().add3f(-20 * ratioMap, -20 * ratioMap, 0);
                wPosCarOut2 = this.node.worldPosition.clone().add3f(0, 0, 0);
                wPosCarOut3 = this.node.worldPosition.clone().add3f(20 * ratioMap, 20 * ratioMap, 0);
                break;
            case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.TOP_RIGHT:
                wPosCarOut1 = this.node.worldPosition.clone().add3f(-20 * ratioMap, 20 * ratioMap, 0);
                wPosCarOut2 = this.node.worldPosition.clone().add3f(0, 0, 0);
                wPosCarOut3 = this.node.worldPosition.clone().add3f(20 * ratioMap, -20 * ratioMap, 0);
                break;
        }

        const wPosEndCar1: Vec3 = GetWPosCarMoveOut(wPosCarOut1.clone(), this.InfoGarageSys.DirectGarage, sizeCar, this.distanceCheckCarCanGenWithType);
        const wPosEndCar2: Vec3 = GetWPosCarMoveOut(wPosCarOut2.clone(), this.InfoGarageSys.DirectGarage, sizeCar, this.distanceCheckCarCanGenWithType);
        const wPosEndCar3: Vec3 = GetWPosCarMoveOut(wPosCarOut3.clone(), this.InfoGarageSys.DirectGarage, sizeCar, this.distanceCheckCarCanGenWithType);

        function checkCarBlock(wPosStart: Vec3, wPosEnd: Vec3): boolean {
            let listNCarBlock: Node[] = CustomRayCastCheck.CheckAllCarBlock2(wPosStart, wPosEnd);
            const idCarBlock = self._cbGetIdCarFromPlaceHoldCar(listNCarBlock);
            if (idCarBlock != -1) {
                self._idCarBlocking = idCarBlock;
                // console.log("idCarblock", idCarBlock);
                return false;
            }
            // console.log("no car block");
            return true;
        }

        if (checkCarBlock(wPosCarOut1, wPosEndCar1) && checkCarBlock(wPosCarOut2, wPosEndCar2) && checkCarBlock(wPosCarOut3, wPosEndCar3)) {
            return true;
        }
        return false;
    }

    public async TryGenCarForce() {
        const indexCar: number = this.InfoGarageSys.GetIndexCarNow();
        if (indexCar < this.InfoGarageSys.TotalCarHas && this.CanGenCar()) {
            await this.GenCar();
            return;
        }
        // update visual sign if it gen force
        this.VisualGarageSys.UpdateSign(
            this.InfoGarageSys.GetInfoNextCar(this.InfoGarageSys.GetIndexCarNow()),
            this.InfoGarageSys.GetNumRemainingCar(),
            this.InfoGarageSys.DirectGarage
        );
    }

    private async TryGenNextCarAfterCarBlockMoveOut(idCarBlocking: number) {
        if (this._idCarBlocking == idCarBlocking) {
            // ======= this action Try Gen car force is weird => like the comment below said
            // you do not need to raycast next because we set to it always empty when a car move out 
            // and no car can move to that place any more
            // IF you want to check again => please careful about case of a car pass the garage when same time check raycast
            // THEREFOR , we just init a car and set the idCarBlocking to a new car just init
            // and that function it always add in GenCar.
            if (this.InfoGarageSys.GetIndexCarNow() < this.InfoGarageSys.TotalCarHas && this.CanGenCar()) {
                await this.GenCar();
            }
        }
    }
    //#endregion Gen next car
}


function GetWPosCarMoveOut(wPosStart: Vec3, direction: DIRECT_CAR, carSize: TYPE_CAR_SIZE, listDistanceCarWithType: { 4: number; 6: number; 10: number; }): Vec3 {
    // get the right distance
    const distance = listDistanceCarWithType[carSize];
    const cscAngleMove: number = 1 / Math.cos(MConfigs.angleCarMove * Math.PI / 180);
    const secAngleMove: number = 1 / Math.sin(MConfigs.angleCarMove * Math.PI / 180);
    let wPosEnd: Vec3 = Vec3.ZERO;

    switch (direction) {
        case DIRECT_CAR.TOP:
            wPosEnd = wPosStart.clone().add3f(0, distance + 50, 0);
            break;
        case DIRECT_CAR.LEFT:
            wPosEnd = wPosStart.clone().add3f(-distance - 50, 0, 0);
            break;
        case DIRECT_CAR.BOTTOM:
            wPosEnd = wPosStart.clone().add3f(0, -distance - 50, 0);
            break;
        case DIRECT_CAR.RIGHT:
            wPosEnd = wPosStart.clone().add3f(distance + 50, 0, 0);
            break;
        case DIRECT_CAR.TOP_LEFT:
            wPosEnd = wPosStart.clone().add3f(-distance * secAngleMove, distance * cscAngleMove, 0);
            break;
        case DIRECT_CAR.BOTTOM_LEFT:
            wPosEnd = wPosStart.clone().add3f(-distance * secAngleMove, -distance * cscAngleMove, 0);
            break;
        case DIRECT_CAR.TOP_RIGHT:
            wPosEnd = wPosStart.clone().add3f(distance * secAngleMove, distance * cscAngleMove, 0);
            break;
        case DIRECT_CAR.BOTTOM_RIGHT:
            wPosEnd = wPosStart.clone().add3f(distance * secAngleMove, -distance * cscAngleMove, 0);
            break;
    }

    return wPosEnd;
}

function GetIndexSuitToSetTheMap(listVec3: Vec3[], wPosWantToSet: Vec3): number {
    let indexSuit: number = 0;
    listVec3.forEach((vec3, index) => {
        if (vec3.y > wPosWantToSet.y) {
            indexSuit = index;
        } else if (vec3.y == wPosWantToSet.y) {
            if (vec3.x < wPosWantToSet.x) {
                indexSuit = index;
            }
        }
    });

    return indexSuit;
}

