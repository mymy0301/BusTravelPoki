import { _decorator, Animation, Component, instantiate, Layout, Node, Size, UITransform, Vec2, Vec3, Widget } from 'cc';
import { ConvertSizeCarFromJson, GetMColorByNumber, JsonCar, JsonConveyorBelt } from 'db://assets/scripts/Utils/Types';
import { VisualConveyorBelt } from './VisualConveyorBelt';
import { InfoConveyorBelt } from './InfoConveyorBelt';
import { ItemConveyorBeltSys } from './ItemConveyorBeltSys';
import { Utils } from '../../../../Utils/Utils';
import { CarSys } from '../CarSys';
import { clientEvent } from 'db://assets/scripts/framework/clientEvent';
import { MConst } from 'db://assets/scripts/Const/MConst';
import { InfoCustomForColliderCar } from '../InfoCustomForColliderCar';
const { ccclass, property } = _decorator;

@ccclass('ConveyorBeltSys')
export class ConveyorBeltSys extends Component {
    @property(VisualConveyorBelt) visualConveyorBelt: VisualConveyorBelt;
    @property(InfoConveyorBelt) infoConveyorBelt: InfoConveyorBelt;
    @property(Animation) anim: Animation;
    @property(Node) nHamXeLeft: Node;
    @property(Node) nHamXeRight: Node;

    private _listNContainer: Node[] = [];
    private _listIdCarMoveOut: number[] = [];
    private _listIdCarIsMovingOut: number[] = [];

    private _mapCar: Map<number, Node> = new Map();
    private _mapHolderCar: Map<number, Node> = new Map();
    private _queueIdCar: number[] = [];

    private readonly MAX_CAR_VISUAL: number = 13;

    //===========================================
    //#region base
    protected onDisable(): void {
        this.visualConveyorBelt.RemoveListen();
    }
    protected onDestroy(): void {
        this.visualConveyorBelt && this.visualConveyorBelt.RemoveListen();
    }
    //#endregion base
    //===========================================

    public async Init(infoConveyorBelt: JsonConveyorBelt, idConveyorBelt: number, cbGenCar: CallableFunction, cbSetIdConveyorBeltToCar: CallableFunction) {
        //clear old data
        this.ClearAll();

        this.infoConveyorBelt.Init(infoConveyorBelt, idConveyorBelt);

        //============ init all cars in conveyorBelt ============
        for (let i = 0; i < infoConveyorBelt.cars.length; i++) {
            const infoCar: JsonCar = infoConveyorBelt.cars[i];
            let infoCarAfterInit: { nCar: Node, idCar: number } = cbGenCar(infoCar, false, this.visualConveyorBelt.nTempCar);
            let nCar = infoCarAfterInit.nCar;
            cbSetIdConveyorBeltToCar(nCar, idConveyorBelt);
            nCar.active = false;
            this._mapCar.set(infoCarAfterInit.idCar, nCar);
            this._queueIdCar.push(infoCarAfterInit.idCar)
        }
        // console.log("🚀", this._mapCar);
        // console.log("🚀", ...this._queueIdCar);

        //============ init all cars in conveyorBelt ============


        // =========== init item conveyorBelt =======================
        this.visualConveyorBelt.nBlockConveyorBelt.active = true;
        for (let i = 0; i < this.MAX_CAR_VISUAL; i++) {
            let nItemConveyorBelt: Node = instantiate(this.visualConveyorBelt.pfItemConveyorPlace);
            nItemConveyorBelt.setParent(this.visualConveyorBelt.nParentInitCars);
            nItemConveyorBelt.getComponent(ItemConveyorBeltSys).Init(
                this.AddCarToQueue.bind(this),
                this.GetCarFromQueue.bind(this),
                this.GetHolderCar.bind(this),
                this.ReUseHolderCar.bind(this)
            );

            nItemConveyorBelt.name = `Belt_${i}`;

            this._listNContainer.push(nItemConveyorBelt);

            // set car to item
            // const nCarFromQueue = this.GetCarFromQueue();
            // console.log(i, nCarFromQueue);
            // nItemConveyorBelt.getComponent(ItemConveyorBeltSys).SetCarChild(nCarFromQueue);
        }

        // Duyệt mảng từ cuối về đầu
        for (let i = this._listNContainer.length - 1; i >= 0; i--) {
            // Thực hiện xử lý với this._listNContainer[i] nếu cần
            this._listNContainer[i].getComponent(ItemConveyorBeltSys).UpdateManual();
        }
        // =========== init item conveyorBelt =======================
        this.visualConveyorBelt.nBlockConveyorBelt.active = false;

        // update visual conveyorBelt
        this.visualConveyorBelt.Init(
            () => { return this._listNContainer },
            this.MAX_CAR_VISUAL
        );

        (async () => {
            await Utils.delay(0.1 * 1000);
            this.ResumeConveyorBelt();
        })();

        this.AutoUpdateUIHamdeXe();
    }

    public GetListNCar_NotMoveOut() {
        // lấy danh sách các xe vẫn còn trên băng truyền
        const listNCar: Node[] = [];
        for (const [idCar, nCar] of this._mapCar.entries()) {
            if (!this._listIdCarMoveOut.includes(idCar)) {
                listNCar.push(nCar);
            }
        }
        return listNCar;
    }

    public GetListNCar_MoveOut() {
        // lấy danh sách các xe vẫn còn trên băng truyền
        const listNCar: Node[] = [];
        for (const [idCar, nCar] of this._mapCar.entries()) {
            if (this._listIdCarMoveOut.includes(idCar)) {
                listNCar.push(nCar);
            }
        }
        return listNCar;
    }

    public ClearAll() {
        this.StopConveyorBelt();

        this.visualConveyorBelt.Clear();
        this.infoConveyorBelt.Clear();
        this._listIdCarMoveOut = [];
        this._queueIdCar = [];
        this._mapHolderCar.clear();
        this._listIdCarIsMovingOut = [];

        this._mapCar.forEach((value: Node, key: number) => {
            this.ReUseCar(key);
        })
        this._mapCar.clear();
        //loop listNCar => Destroy
        this._listNContainer.forEach(nCar => {
            nCar != null && nCar.isValid && nCar.destroy();
        });
        this._listNContainer = [];
    }



    private AutoUpdateUIHamdeXe() {
        // lấy worldPoision , sau đó đối với left thì set transform  = wPosx luôn
        // còn right thì transform = width - wPosx
        // const comUILeft = this.nHamXeLeft.getComponent(UITransform);
        // const comUIRight = this.nHamXeRight.getComponent(UITransform);
        // const baseSizeLeft = comUILeft.contentSize.clone();
        // const wPosHamXeLeft = this.nHamXeLeft.worldPosition.clone();
        // const baseSizeRight = comUIRight.contentSize.clone();
        // const wPosHamXeRight = this.nHamXeRight.worldPosition.clone();
        // comUILeft.contentSize = new Size(wPosHamXeLeft.x, baseSizeLeft.height);
        // comUIRight.contentSize = new Size(Utils.getScreenWindowSize().width - wPosHamXeRight.x, baseSizeRight.height);
    }

    private GetCarFromQueue(): Node {

        // console.log("🚀", ...this._queueIdCar)

        let idCar = -1;
        while (idCar == -1 && this._queueIdCar.length > 0) {
            idCar = this._queueIdCar.pop();
            if (this._listIdCarMoveOut.includes(idCar)) {
                idCar = -1;
            }
        }

        if (idCar >= 0 && !this._listIdCarMoveOut.includes(idCar)) {
            return this._mapCar.get(idCar);
        } else {
            return null;
        }
    }

    private AddCarToQueue(idCar: number) {
        if (this._listIdCarMoveOut.includes(idCar) || idCar == -1) { return; }

        this._queueIdCar.unshift(idCar);
        // add node xe vào trong node temp và unactive nó
        const nCar = this._mapCar.get(idCar);
        nCar.active = false;
        nCar.setParent(this.visualConveyorBelt.nTempCar);
    }

    private GetHolderCar(nItemConveyorBelt: Node, idCar: number) {
        if (this._listIdCarMoveOut.includes(idCar) || idCar == -1) { return; }

        if (this._mapHolderCar.get(idCar) == null) {
            const nCar: Node = this._mapCar.get(idCar);
            const infoCar = nCar.getComponent(CarSys).InfoCar.getDataCarInfo;
            const wPosCar: Vec3 = nCar.worldPosition.clone();

            // update collider car
            const listConnerUpdate: Vec3[] = InfoCustomForColliderCar.GetListConner(ConvertSizeCarFromJson(infoCar.carSize), infoCar.carDirection, GetMColorByNumber(infoCar.carColor));
            const listNewPoint: Vec2[] = listConnerUpdate.map(vec3 => new Vec2(vec3.x, vec3.y));
            clientEvent.dispatchEvent(MConst.EVENT.INIT_HOLD_PLACE_CAR, idCar, wPosCar.clone(), listNewPoint, nItemConveyorBelt, (nCollider: Node) => {
                this._mapHolderCar.set(idCar, nCollider);
            });
        }
        return this._mapHolderCar.get(idCar);
    }

    private ReUseHolderCar(idCar: number) {
        if (this._listIdCarMoveOut.includes(idCar) || idCar == -1) { return; }

        const nHolderCar = this._mapHolderCar.get(idCar);
        if (nHolderCar == null) { return; }
        nHolderCar.setParent(this.visualConveyorBelt.nTempCar);
        nHolderCar.active = false;
    }

    private RemoveHolderCar(idCar: number) {
        this._mapHolderCar.delete(idCar);
        clientEvent.dispatchEvent(MConst.EVENT.REMOVE_HOLD_PLACE_CAR, idCar);
    }

    //=========================================
    //#region func listen
    public RemoveCarOutQueue(idCar: number) {
        if (idCar != null && idCar >= 0 && this._listIdCarMoveOut.indexOf(idCar) < 0) {
            // console.log("add list id car move out", idCar);
            this.RemoveHolderCar(idCar);
            this._listIdCarMoveOut.push(idCar);

            // remove id from queue
            const indexIdCarInQueue = this._queueIdCar.indexOf(idCar);
            if (indexIdCarInQueue >= 0) {
                this._queueIdCar.splice(indexIdCarInQueue, 1);
            }
        }
    }
    public CarMoveOut(idCar: number) {
        // console.log(this._listIdCarMoveOut, idCar);
        const indexCar: number = this._listIdCarIsMovingOut.indexOf(idCar);
        if (indexCar < 0) {
            this._listIdCarIsMovingOut.push(idCar);
            return true;
        }
    }

    public StopConveyorBelt() {
        this.visualConveyorBelt.StopConveyorBelt();
        this.anim.pause();
    }

    public CheckCanResumeBelt(idCar: number, moveSuccess: boolean = false) {
        if (idCar >= 0) {
            const indexCar: number = this._listIdCarIsMovingOut.indexOf(idCar);
            if (indexCar >= 0) {
                this._listIdCarIsMovingOut.splice(indexCar, 1);
            }
        }

        // update data
        if (moveSuccess) {

        }

        // check if no car move out anymore => resume conveyorBelt
        return this._listIdCarIsMovingOut.length == 0;

    }

    public ResumeConveyorBelt() {
        this.visualConveyorBelt.ResumeConveyorBelt();
        this.anim.resume();
    }
    //#endregion func listen
    //=========================================

    //=========================================
    //#region pool
    public ReUseCar(idCar: number) {
        const nCar = this._mapCar.get(idCar);
        if (nCar != null) {
            nCar.setParent(this.visualConveyorBelt.nTempCar);
            nCar.active = false;
        }
    }
    //#endregion pool
    //=========================================
}


