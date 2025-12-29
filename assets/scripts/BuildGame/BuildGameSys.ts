import { _decorator, Component, director, error, instantiate, log, Node, Prefab, Vec3, find, input, Input, EventTouch } from 'cc';
import { BuildCar } from './Car/BuildCar';
import { DIRECT_CAR, JsonCar, JsonGarage, JsonMapGame, JsonConveyorBelt, TYPE_CAR_SIZE, ConvertSizeCarFromJsonToNumber, ConvertSizeCarNumberToJsonBusFrenzy, JsonGroup, TYPE_USE_JSON_GROUP, UNJSON_TGroupToLogic, JSON_TGroupToLogic, TGroupToLogic } from '../Utils/Types';
import { BuildGameUISys } from './BuildGameUISys';
import { ReadWriteFileSys } from './ReadWriteFileSys';
import { ReadMapJson } from '../MJson/ReadMapJson';
import { IExportData, IMapBusFrenzy, MConstBuildGame, STATE_BUILD_GAME } from './MConstBuildGame';
import { ListCarBuildSys } from './Car/ListCarBuildSys';
import { Utils } from '../Utils/Utils';
import { ListConveyorBeltSys } from './ConveyorBelt/ListConveyorBeltSys';
import { BuildConveyorBelt } from './ConveyorBelt/BuildConveyorBelt';
import { BuildGarage } from './Garage/BuildGarage';
import { ListGarageSys } from './Garage/ListGarageSys';
import { MConfigBuildGame } from './MConfigBuildGame';
import { MConfigResourceUtils } from '../Utils/MConfigResourceUtils';
import { clientEvent } from '../framework/clientEvent';
import { GroupSys } from './GroupSys';
import { ExAndImSys } from './ExAndImSys';
import { ReadDataJson } from '../ReadDataJson';
import { ClockGameSys_2 } from '../ClockGameSys_2';
import { UIGroupBuild } from './LogicBuildGroup/UIGroupBuild';
import { ValidGroupPass } from '../Scene/GameScene/Logic/LogicGenPassenger';
const { ccclass, property } = _decorator;

@ccclass('BuildGameSys')
export class BuildGameSys extends Component {
    public static Instance: BuildGameSys = null;

    @property({ group: "line", type: Node }) nLineTop: Node;
    @property({ group: "line", type: Node }) nLineBottom: Node;
    @property({ group: "line", type: Node }) nLineLeft: Node;
    @property({ group: "line", type: Node }) nLineRight: Node;

    @property(ListCarBuildSys) listCarBuildSys: ListCarBuildSys;
    @property(ListConveyorBeltSys) listConveyorBeltSys: ListConveyorBeltSys;
    @property(ListGarageSys) listGarageSys: ListGarageSys;
    @property(GroupSys) groupSys: GroupSys;
    @property(ExAndImSys) exAndImSys: ExAndImSys;
    @property(UIGroupBuild) uiGroupBuild: UIGroupBuild;

    private _nCarChoicing: Node = null; public get NCarChoicing(): Node { return this._nCarChoicing; }
    private _nConveyorBeltChoicing: Node = null; public get NConveyorBeltChoicing(): Node { return this._nConveyorBeltChoicing; }
    private _nGarageChoicing: Node = null; public get NGarageChoicing(): Node { return this._nGarageChoicing; }
    private _state: STATE_BUILD_GAME = STATE_BUILD_GAME.NONE;
    private _scaleInJson: number = 1;

    //==============================================================
    //#region BASE
    protected async onLoad() {
        if (BuildGameSys.Instance == null) {
            BuildGameSys.Instance = this;
            new ReadMapJson();
            new ReadDataJson();
            MConfigResourceUtils.TryPreLoadBundleEffect();
            // register call back 
            this.listCarBuildSys.RegisterCb(
                this.listGarageSys.GetAllCarsInAllGarages.bind(this.listGarageSys),
                this.listConveyorBeltSys.GetAllCarsInAllBelt.bind(this.listConveyorBeltSys),
                this.listConveyorBeltSys.ChangeIdCarInBelt.bind(this.listConveyorBeltSys),
                this.listGarageSys.ChangeIdCarInGarages.bind(this.listGarageSys)
            )
            this.listGarageSys.RegisterCallback(this.listCarBuildSys.GetAutoIdEntities.bind(this.listCarBuildSys));
            this.listConveyorBeltSys.RegisterCallback(this.listCarBuildSys.GetAutoIdEntities.bind(this.listCarBuildSys));
            // init old map
            if (MConstBuildGame.dataMapToPlayTest != null) {
                this.TryLoadOldData(await ReadMapJson.Instance.ReadDataFromBusFrenzy({ LevelData: MConstBuildGame.dataMapToPlayTest }), false);
            }

            // try init clock game
            ClockGameSys_2.Instance;

            clientEvent.on(MConstBuildGame.EVENT_BUILDING.SWAP_ID_CAR, this.SwapIdCar, this);

            this.uiGroupBuild.Hide();
        }
    }

    protected onDestroy(): void {
        clientEvent.off(MConstBuildGame.EVENT_BUILDING.SWAP_ID_CAR, this.SwapIdCar, this);
        BuildGameSys.Instance = null;
    }
    //#endregion BASE
    //==============================================================

    //=========================================================
    //#region STATE
    public ChangeState(state: STATE_BUILD_GAME) {
        this._state = state;
    }

    public GetState(): STATE_BUILD_GAME { return this._state; }
    //#endregion STATE
    //=========================================================

    //=========================================================
    //#region self
    //#endregion self
    //=========================================================

    //=========================================================
    //#region btn
    //.............................
    //#region export + import
    private async BtnExportFile(event: Event, customEventData: string, dataPass: number[] = null): Promise<{ data: IMapBusFrenzy, dataLog: any }> {
        this.ChangeState(STATE_BUILD_GAME.NONE);
        //TODO bổ sung thêm logic duyệt dữ liệu ở đây
        // // you need to check the data before call save and if something wrong => notification
        // // ======================= kiểm tra xem xe có đang để trong vùng chơi được hay không ?
        // if (await CheckCarsCrossOutOfLine(this.listCar, this.nLineTop, this.nLineBottom, this.nLineLeft, this.nLineRight)) {
        //     error("cars cross out of line, you need to fix it before save file");
        //     return;
        // }

        // // ======================= Xem các giao diện có đang bị đè lên nhau hay không?
        // if (await CheckCarsIsOverlap(this.listCar)) {
        //     error("cars overlap, you need to fix it before save file");
        //     return;
        // }

        // turn on block ui
        BuildGameUISys.Instance.nBlockUI.active = true;

        // lấy dữ liệu để export
        let dataExport: IExportData = this.exAndImSys.GetInfoToExport(
            this.listCarBuildSys.GetInfoToExport(),
            this.listGarageSys.GetInfoToExport(),
            this.listConveyorBeltSys.GetInfoToExport(),
        );

        // auto update group
        // ground + garage + conveyorBelt
        let listInfoCar: JsonCar[] = [];
        listInfoCar.push(...dataExport.dataWriteCarInfo);
        listInfoCar.push(...dataExport.dataWriteHamXeInfo.map(value => value.cars).flat());
        listInfoCar.push(...dataExport.dataWriteTransmissionInfo.map(value => value.cars).flat());
        this.AutoUpdateGroupForBuild(listInfoCar);

        // check data passenger
        let guestColor = dataExport.dataWriteGuestColor;
        if (dataPass != null) {
            guestColor = dataPass;
        }


        let groupWrite = []
        if (MConfigBuildGame.jsonLevelImport != null && MConfigBuildGame.jsonLevelImport.Group) {
            groupWrite = MConfigBuildGame.jsonLevelImport.Group;
        } else {
            MConfigBuildGame.listLogicGroup.forEach(tLogicGroup => {
                const newJsonGroup: JsonGroup = {
                    typeUse: TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA,
                    numberLose: -1,
                    listGroups: [],
                    dataCustom: JSON_TGroupToLogic(tLogicGroup)
                }
                groupWrite.push(newJsonGroup);
            })
        }

        // write data
        let dataWrite: IMapBusFrenzy = {
            Time: MConfigBuildGame.jsonLevelImport != null ? MConfigBuildGame.jsonLevelImport.Time : null,
            LevelScaleFactor: this._scaleInJson,
            ParkingSpaceInit: 4,
            GuestColor: guestColor,
            CarInfo: dataExport.dataWriteCarInfo,
            GarageInfo: dataExport.dataWriteHamXeInfo,
            ConveyorBeltInfo: dataExport.dataWriteTransmissionInfo,
            Group: groupWrite,
        };
        // console.log(dataWrite);


        let waitingReceiveResult = true;
        let keepLogic = true;
        // kiểm tra nếu chưa có group loại mới thì ta sẽ hiển thị thông báo chưa có group
        const listGroupSortData: JsonGroup[] = dataWrite.Group.filter(g => g.typeUse == TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA);
        const valid1 = listGroupSortData.length > 0;
        const valid2 = ValidGroupPass(listGroupSortData, dataWrite.GuestColor);
        if (!valid1 || !valid2) {
            BuildGameUISys.Instance.nUINotiBuildGroup.SetCb((result: boolean) => {
                waitingReceiveResult = false;
                keepLogic = result;
            })
            BuildGameUISys.Instance.nUINotiBuildGroup.Show();
        } else {
            waitingReceiveResult = false;
        }

        // đợi cho đến khi có phản hồi
        await Utils.WaitReceivingDone(() => !waitingReceiveResult);

        // chỉ chạy export nếu keep logic = true
        if ((customEventData == null || customEventData == "") && keepLogic) {
            ReadWriteFileSys.saveFile(JSON.stringify({ LevelData: dataWrite }), new Date().toDateString(), "json");
        }

        // turn off block ui
        BuildGameUISys.Instance.nBlockUI.active = false;

        return { data: dataWrite, dataLog: dataExport };
    }

    private BtnLogDataExport(event: Event, customEventData: string) {
        // kiểm tra LogDataExport log tự động hat customEventData
        let dataExport = null;
        if (customEventData == null || customEventData == "") {
            dataExport = this.exAndImSys.GetInfoToExport(
                this.listCarBuildSys.GetInfoToExport(),
                this.listGarageSys.GetInfoToExport(),
                this.listConveyorBeltSys.GetInfoToExport()
            );
        } else {
            dataExport = JSON.parse(customEventData);
        }

        this.exAndImSys.LogDataExport(dataExport)
    }

    private BtnImportFile() {
        if (this._state != STATE_BUILD_GAME.NONE) {
            // need show a warning in here
            error("you can not save now");
            return;
        }

        this.exAndImSys.ImportFile(this.TryLoadOldData.bind(this));
    }

    private BtnExportDataToExcel() {
        BuildGameUISys.Instance.nBlockUI.active = true;

        let dataExport = this.exAndImSys.GetInfoToExport(
            this.listCarBuildSys.GetInfoToExport(),
            this.listGarageSys.GetInfoToExport(),
            this.listConveyorBeltSys.GetInfoToExport()
        );

        const resultPassengerBuild = dataExport.dataWriteGuestColor.map((item) => item.toString()).join(",");
        const RevertPassengerBuild = Array.from(dataExport.dataWriteGuestColor).reverse().map((item) => item.toString()).join(",");
        let resultCarBeforeBuild = "";

        let resultCarInGaraBeforeBuild = "";
        let resultCarInConveyorBeforeBuild = "";
        let resultPassengerBeforeBuild: string = "";
        let ReversePassengerBeforeBuild: string = "";
        if (MConfigBuildGame.jsonLevelImport != null) {
            MConfigBuildGame.jsonLevelImport.CarInfo.map((item) => {
                for (let i = 0; i < item.carSize; i++) {
                    resultCarBeforeBuild += item.carColor.toString();
                    resultCarBeforeBuild += ",";
                }
            })

            MConfigBuildGame.jsonLevelImport.GarageInfo.map((item) => item.cars.map((carInfo) => {
                for (let i = 0; i < carInfo.carSize; i++) {
                    resultCarInGaraBeforeBuild += carInfo.carColor.toString();
                    resultCarInGaraBeforeBuild += ",";
                }
            }));

            MConfigBuildGame.jsonLevelImport.ConveyorBeltInfo.map((item) => item.cars.map((carInfo) => {
                for (let i = 0; i < carInfo.carSize; i++) {
                    resultCarInConveyorBeforeBuild += carInfo.carColor.toString();
                    resultCarInConveyorBeforeBuild += ",";
                }
            }));

            resultPassengerBeforeBuild = Array.from(MConfigBuildGame.jsonLevelImport.GuestColor).map((item) => item.toString()).join(",");
            ReversePassengerBeforeBuild = Array.from(MConfigBuildGame.jsonLevelImport.GuestColor).reverse().map((item) => item.toString()).join(",");
        }

        const dataCarBuild = dataExport.dataWriteGuestColorGroundCar.map((item) => item.toString()).join(",");
        const dataCarGara = dataExport.dataWriteGuestColorGara.map((item) => item.toString()).join(",");
        const dataCarConveyorBelt = dataExport.dataWriteGuestColorConveyorBelt.map((item) => item.toString()).join(",");

        const resultGroupBeforeBuild: string = MConfigBuildGame.jsonLevelImport != null && MConfigBuildGame.jsonLevelImport.Group != null ? MConfigBuildGame.jsonLevelImport.Group.toString() : null;

        ReadWriteFileSys.saveAsCSV(resultPassengerBeforeBuild, ReversePassengerBeforeBuild, resultCarBeforeBuild, resultCarInGaraBeforeBuild, resultCarInConveyorBeforeBuild, resultGroupBeforeBuild,
            resultPassengerBuild, RevertPassengerBuild, dataCarBuild, dataCarGara, dataCarConveyorBelt, new Date().toDateString());

        BuildGameUISys.Instance.nBlockUI.active = false;
    }
    //#endregion export + import
    //.............................

    //.............................
    //#region gamePlay
    private BtnInitCar() {
        let nCar: Node = this.listCarBuildSys.InitCarBuild(null);
        const idCar: number = nCar.getComponent(BuildCar).IDCar;
        //update group
        this.groupSys.UpdateGroup("add", idCar);
    }

    private BtnInitConveyorBelt() {
        this.listConveyorBeltSys.InitConveyorBeltBuild(null);
    }

    private BtnInitGarage() {
        this.listGarageSys.InitGarageBuild(null);
    }
    //#endregion gamePlay
    //.............................

    //.............................
    //#region UI
    private BtnReset() {
        this.ChangeState(STATE_BUILD_GAME.NONE);

        //reset map
        this.listCarBuildSys.Reset();
        this.listGarageSys.Reset();
        this.listConveyorBeltSys.Reset();

        // set the choicing to null
        this._nCarChoicing = this._nGarageChoicing = this._nConveyorBeltChoicing = null;

        // scale in Json
        this._scaleInJson = 1;

        // reset MConfigBuildGame
        MConfigBuildGame.jsonLevelImport = null;

        // reset UI
        BuildGameUISys.Instance.Reset();
    }

    private BtnReverseGroup() {
        this.groupSys.ReverseGroup();
    }

    private BtnReversePassengerBase() {
        if (MConfigBuildGame.jsonLevelImport == null || MConfigBuildGame.jsonLevelImport.GuestColor == null) {
            return;
        }

        this.BtnExportFile(null, null, MConfigBuildGame.jsonLevelImport.GuestColor.reverse());
    }

    private BtnRefreshAll() {
        // ---- update sibling index
        this.listCarBuildSys.ReSiblingIndexCar();
    }

    private async BtnPlay() {
        const dataExport = await this.BtnExportFile(null, "not save");
        this.BtnLogDataExport(null, JSON.stringify(dataExport.dataLog));
        BuildGameUISys.Instance.uiPreparePlayBuild.Show(dataExport.data);
    }

    private async BtnGroup() {
        // exort data để lấy dữ liệu và add vào group
        const jsonBuild: IExportData = this.exAndImSys.GetInfoToExport(
            this.listCarBuildSys.GetInfoToExport(),
            this.listGarageSys.GetInfoToExport(),
            this.listConveyorBeltSys.GetInfoToExport(),
        );

        // ground + garage + conveyorBelt
        let listInfoCar: JsonCar[] = [];
        listInfoCar.push(...jsonBuild.dataWriteCarInfo);
        listInfoCar.push(...jsonBuild.dataWriteHamXeInfo.map(value => value.cars).flat());
        listInfoCar.push(...jsonBuild.dataWriteTransmissionInfo.map(value => value.cars).flat());

        // auto update group
        this.AutoUpdateGroupForBuild(listInfoCar);

        // show group
        this.uiGroupBuild.Show(listInfoCar);
    }

    //#endregion UI
    //.............................
    //#endregion btn
    //=========================================================


    //#region func ChoiceCar
    public UnChoiceAll() {
        // check if car is choicing before =? unchoicing the old car
        if (this._nCarChoicing != null) {
            this._nCarChoicing.getComponent(BuildCar).UnChoicingObject();
        }
        this._nCarChoicing = null;
        this._nConveyorBeltChoicing = null;
        this._nGarageChoicing = null;
    }

    public SetCarChoicing(nCar: Node) {
        BuildGameUISys.Instance.TurnOffAllUI();

        // check if car is choicing before =? unchoicing the old car
        if (this._nCarChoicing != null) {
            this._nCarChoicing.getComponent(BuildCar).UnChoicingObject();
        }

        this.UnChoiceAll();
        this._nCarChoicing = nCar;
        this.ChangeState(STATE_BUILD_GAME.CHANGE_INFO_CARS);
        BuildGameUISys.Instance.ShowUIChangeInfoCar();
    }

    public SetConveyorBeltChoicing(nConveyorBelt: Node) {
        BuildGameUISys.Instance.TurnOffAllUI();

        this.UnChoiceAll();
        this._nConveyorBeltChoicing = nConveyorBelt;
        this.ChangeState(STATE_BUILD_GAME.CHANGE_INFO_CONVEYOR_BELT);
        BuildGameUISys.Instance.ShowUIChangeInfoConveyorBelt();
    }

    public SetGarageChoicing(nGarage: Node) {
        BuildGameUISys.Instance.TurnOffAllUI();

        this.UnChoiceAll();
        this._nGarageChoicing = nGarage;
        this.ChangeState(STATE_BUILD_GAME.CHANGE_INFO_GARAGE);
        BuildGameUISys.Instance.ShowUIChangeInfoGarage();
    }

    public getNCarChoicing(): Node { return this._nCarChoicing; }
    public getNConveyorBeltChoicing(): Node { return this._nConveyorBeltChoicing; }
    public getNGarageChoicing(): Node { return this._nGarageChoicing; }
    //#endregion func ChoiceCar

    //#region btn func


    private _isShowDebug: boolean = false;
    public ShowOrHideDebug() {
        if (this._isShowDebug) {
            this._isShowDebug = false;
            Utils.UnDrawPhysicsDebugging();
        } else {
            this._isShowDebug = true;
            Utils.DrawPhysicsDebugging();
        }
    }

    public DeleteCar() {
        const idCar: number = this._nCarChoicing.getComponent(BuildCar).IDCar;
        this.listCarBuildSys.UpdateListCar("delete", idCar);
        this._nCarChoicing = null;

        // update group
        this.groupSys.UpdateGroup("delete", idCar);

        // remove car out of the list first
        this.ChangeState(STATE_BUILD_GAME.NONE);

        // update max id game
        this.UpdateMaxIdCarGame();
    }

    public UnChoicingCar() {
        this._nCarChoicing.getComponent(BuildCar).UnChoicingObject();
        this._nCarChoicing = null;
        this.ChangeState(STATE_BUILD_GAME.NONE);
    }

    public DeleteConveyorBelt() {
        const idBuildConveyorBelt: number = this._nConveyorBeltChoicing.getComponent(BuildConveyorBelt).IDBuildConveyerBelt;
        const listIdCarInConveyorBelt: number[] = this._nConveyorBeltChoicing.getComponent(BuildConveyorBelt).GetListIdCars();

        // update group
        listIdCarInConveyorBelt.forEach((idCar: number) => {
            this.groupSys.UpdateGroup("delete", idCar);
        })

        //remove data
        this.listConveyorBeltSys.UpdateListBelt("delete", idBuildConveyorBelt)

        this._nConveyorBeltChoicing = null;

        this.ChangeState(STATE_BUILD_GAME.NONE);

        // update max id game
        this.UpdateMaxIdCarGame();
    }

    public UnChoicingConveyorBelt() {
        this._nConveyorBeltChoicing.getComponent(BuildConveyorBelt).UnChoicingObject();
        this._nConveyorBeltChoicing = null;
        this.ChangeState(STATE_BUILD_GAME.NONE);
    }

    public DeleteGarage() {
        const idBuildGarage: number = this._nGarageChoicing.getComponent(BuildGarage).IDBuildGarage;
        const listIdCarInGarage: number[] = this._nGarageChoicing.getComponent(BuildGarage).GetListIdCars();

        // update group
        listIdCarInGarage.forEach((idCar: number) => {
            this.groupSys.UpdateGroup("delete", idCar);
        })

        // remove data
        this.listGarageSys.UpdateListGarage("delete", idBuildGarage);

        this._nGarageChoicing = null;

        this.ChangeState(STATE_BUILD_GAME.NONE);

        // update max id game
        this.UpdateMaxIdCarGame();
    }

    public UnChoicingGarage() {
        this._nGarageChoicing.getComponent(BuildGarage).UnChoicingObject();
        this._nGarageChoicing = null;
        this.ChangeState(STATE_BUILD_GAME.NONE);
    }
    //#endregion btn func


    private async TryLoadOldData(dataMap: JsonMapGame, saveDataLevelImport: boolean = true) {

        // update title level
        BuildGameUISys.Instance.SetLevelTitle(MConfigBuildGame.nameLevelImport);

        if (saveDataLevelImport) {
            MConfigBuildGame.jsonLevelImport = JSON.parse(JSON.stringify(dataMap)) as JsonMapGame; // save the old dataMap;
            const groupLevel = MConfigBuildGame.jsonLevelImport.Group;
            if (groupLevel != null && groupLevel.length > 0) {
                const listGroupNewLogic = groupLevel.filter(groupCheck => groupCheck.typeUse == TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA);
                if (listGroupNewLogic.length > 0) {
                    listGroupNewLogic.forEach(groupNewWay => {
                        const dataConvert = UNJSON_TGroupToLogic(groupNewWay.dataCustom);
                        // console.log(dataConvert);
                        MConfigBuildGame.listLogicGroup.push(dataConvert);
                    })
                }
            }
        }

        // scale in Json
        this._scaleInJson = dataMap.LevelScaleFactor;

        // ======= find the highest id car has and set to max id car =======
        let maxIdCar = 0;
        if (dataMap.CarInfo && dataMap.CarInfo.length > 0) {
            maxIdCar = Math.max(...dataMap.CarInfo.map(car => car.idCar));
        }
        if (dataMap.GarageInfo && dataMap.GarageInfo.length > 0) {
            dataMap.GarageInfo.forEach(garage => {
                if (garage.cars && garage.cars.length > 0) {
                    const maxIdInGarage = Math.max(...garage.cars.map(car => car.idCar));
                    if (maxIdInGarage > maxIdCar) {
                        maxIdCar = maxIdInGarage;
                    }
                }
            });
        }
        if (dataMap.ConveyorBeltInfo && dataMap.ConveyorBeltInfo.length > 0) {
            dataMap.ConveyorBeltInfo.forEach(belt => {
                if (belt.cars && belt.cars.length > 0) {
                    const maxIdInBelt = Math.max(...belt.cars.map(car => car.idCar));
                    if (maxIdInBelt > maxIdCar) {
                        maxIdCar = maxIdInBelt;
                    }
                }
            });
        }
        this.listCarBuildSys.SetMaxIdCar(maxIdCar);

        // loop the car info and create it
        for (let i = 0; i < dataMap.CarInfo.length; i++) {
            const jsonCar: JsonCar = dataMap.CarInfo[i];
            let nInitCar: Node = this.listCarBuildSys.InitCarBuild(jsonCar);
        }
        // loop the garage mini and create it
        if (dataMap.GarageInfo != null && dataMap.GarageInfo.length > 0) {
            for (let i = 0; i < dataMap.GarageInfo.length; i++) {
                const jsonGarage: JsonGarage = dataMap.GarageInfo[i];
                let nInitGarage: Node = this.listGarageSys.InitGarageBuild(jsonGarage);
            }
        }
        await Utils.delay1Frame();

        // loop the Conveyor Belt and create it
        if (dataMap.ConveyorBeltInfo != null && dataMap.ConveyorBeltInfo.length > 0) {
            for (let i = 0; i < dataMap.ConveyorBeltInfo.length; i++) {
                const jsonConveyorBelt: JsonConveyorBelt = dataMap.ConveyorBeltInfo[i];
                let nInitConveyorBelt: Node = this.listConveyorBeltSys.InitConveyorBeltBuild(jsonConveyorBelt);
            }
        }

        await Utils.delay1Frame();
        this.BtnRefreshAll();
    }

    //#region other func
    public GetCarById(idCar: number): Node {
        const nCarHasId: Node = this.listCarBuildSys.mapCarBuild.find(carInfo => carInfo.getComponent(BuildCar).IDCar == idCar);
        return nCarHasId;
    }

    public CheckHasCarId(idCar: number): boolean {
        let foundIdCar: boolean = false;

        // check in list car first
        foundIdCar = this.listCarBuildSys.mapCarBuild.find(carInfo => carInfo.getComponent(BuildCar).IDCar == idCar) != null;
        if (foundIdCar) { return true; }

        // check list car in garage
        this.listGarageSys.mapDataCarInGarage.forEach((value: JsonCar[], idGarage: number) => {
            if (value.findIndex(car => car.idCar == idCar) >= 0) {
                foundIdCar = true;
            }
        });
        if (foundIdCar) { return true; }

        // check list car in conveyor belt
        this.listConveyorBeltSys.mapDataCarInConveyorBelt.forEach((value: JsonCar[], idConveyorBelt: number) => {
            if (value.findIndex(car => car.idCar == idCar) >= 0) {
                foundIdCar = true;
            }
        });

        return foundIdCar;
    }

    private SwapIdCar(idCarChangeTo: number, idCarWantToChange: number) {
        try {

            //========================================================================================
            //================================= Group ================================================
            //========================================================================================
            this.groupSys.UpdateGroup("swap", idCarChangeTo, idCarWantToChange);

            //========================================================================================
            //========================================================================================
            //================================= Ground Car =========================================
            //========================================================================================
            //========================================================================================
            let ChangeIdCar1Done: boolean = false;
            let ChangeIdCar2Done: boolean = false;

            const isSwapIdCarSuccess = this.listCarBuildSys.UpdateListCar("swap", idCarChangeTo, idCarWantToChange);
            if (isSwapIdCarSuccess) return;

            //========================================================================================
            //========================================================================================
            //================================= Garage =========================================
            //========================================================================================
            //========================================================================================
            // loop the list garage and change the id
            let cloneMap1: JsonCar[], cloneMap2: JsonCar[];
            let idCloneMap1, idCloneMap2;
            // console.warn(idCarChangeTo, idCarWantToChange);


            this.listGarageSys.mapDataCarInGarage.forEach((value: JsonCar[], idGarage: number) => {
                let numIdCarFoundInGarage: number = 0;
                let idCarChangeToFoundInMap: number = -1;
                let idCarWantToChangeFoundInMap: number = -1;

                value.forEach((jsonCar: JsonCar) => {
                    if (jsonCar.idCar == idCarChangeTo) {
                        idCarChangeToFoundInMap = jsonCar.idCar;
                        numIdCarFoundInGarage += 1;
                    } else if (jsonCar.idCar == idCarWantToChange) {
                        idCarWantToChangeFoundInMap = jsonCar.idCar;
                        numIdCarFoundInGarage += 1;
                    }
                })

                // check in case found both id in the same garage
                if (numIdCarFoundInGarage == 2) {
                    idCloneMap1 = idGarage;
                    cloneMap1 = Utils.CloneListDeep(value);

                    let save1: JsonCar = cloneMap1.find(infoCar => infoCar.idCar == idCarChangeTo);
                    let save2: JsonCar = cloneMap1.find(infoCar => infoCar.idCar == idCarWantToChange);

                    save1.idCar = idCarWantToChange;
                    save2.idCar = idCarChangeTo;

                    ChangeIdCar1Done = true;
                    ChangeIdCar2Done = true;
                }
                // case just found 1
                else if (numIdCarFoundInGarage == 1) {
                    if (idCarChangeToFoundInMap != -1) {
                        idCloneMap1 = idGarage;
                        cloneMap1 = Utils.CloneListDeep(value);

                        let infoCarInGara: JsonCar = cloneMap1.find(infoCar => infoCar.idCar == idCarChangeToFoundInMap);
                        infoCarInGara.idCar = idCarWantToChange;
                        ChangeIdCar1Done = true;
                    }

                    if (idCarWantToChangeFoundInMap != -1) {
                        idCloneMap2 = idGarage;
                        cloneMap2 = Utils.CloneListDeep(value);

                        let infoCarInGara: JsonCar = cloneMap2.find(infoCar => infoCar.idCar == idCarWantToChangeFoundInMap);
                        infoCarInGara.idCar = idCarChangeTo;
                        ChangeIdCar2Done = true;
                    }
                }
            });

            if (cloneMap1 != null && idCloneMap1 != null) {
                this.listGarageSys.mapDataCarInGarage.set(idCloneMap1, cloneMap1);
            }
            if (cloneMap2 != null && idCloneMap2 != null) {
                this.listGarageSys.mapDataCarInGarage.set(idCloneMap2, cloneMap2);
            }

            // console.log(this.listCarOnGround.map(car => car.getComponent(BuildCar).IDCar));
            // console.log(this.listGarageSys.mapDataCarInGarage);

            if (ChangeIdCar1Done && ChangeIdCar2Done) { return; }

            //========================================================================================
            //========================================================================================
            //================================= conveyorBelt =========================================
            //========================================================================================
            //========================================================================================

            // loop the list garage and change the id
            let cloneMapConveyorBelt1: JsonCar[], cloneMapConveyorBelt2: JsonCar[];
            let idCloneMapConveyorBelt1, idCloneMapConveyorBelt2;

            this.listConveyorBeltSys.mapDataCarInConveyorBelt.forEach((value: JsonCar[], idGarage: number) => {
                let numIdCarFoundInConveyorBelt: number = 0;
                let idCarChangeToFoundInMap: number = -1;
                let idCarWantToChangeFoundInMap: number = -1;

                value.forEach((jsonCar: JsonCar) => {
                    if (jsonCar.idCar == idCarChangeTo) {
                        idCarChangeToFoundInMap = jsonCar.idCar;
                        numIdCarFoundInConveyorBelt += 1;
                    } else if (jsonCar.idCar == idCarWantToChange) {
                        idCarWantToChangeFoundInMap = jsonCar.idCar;
                        numIdCarFoundInConveyorBelt += 1;
                    }
                })

                // check in case found both id in the same garage
                if (numIdCarFoundInConveyorBelt == 2) {
                    idCloneMapConveyorBelt1 = idGarage;
                    cloneMapConveyorBelt1 = Utils.CloneListDeep(value);

                    let save1: JsonCar = cloneMapConveyorBelt1.find(infoCar => infoCar.idCar == idCarChangeTo);
                    let save2: JsonCar = cloneMapConveyorBelt1.find(infoCar => infoCar.idCar == idCarWantToChange);

                    save1.idCar = idCarWantToChange;
                    save2.idCar = idCarChangeTo;

                    ChangeIdCar1Done = true;
                    ChangeIdCar2Done = true;
                }
                // case just found 1
                else if (numIdCarFoundInConveyorBelt == 1) {
                    if (idCarChangeToFoundInMap != -1) {
                        idCloneMapConveyorBelt1 = idGarage;
                        cloneMapConveyorBelt1 = Utils.CloneListDeep(value);

                        let infoCarInBelt: JsonCar = cloneMapConveyorBelt1.find(infoCar => infoCar.idCar == idCarChangeToFoundInMap);
                        infoCarInBelt.idCar = idCarWantToChange;

                        ChangeIdCar1Done = true;
                    }

                    if (idCarWantToChangeFoundInMap != -1) {
                        idCloneMapConveyorBelt2 = idGarage;
                        cloneMapConveyorBelt2 = Utils.CloneListDeep(value);

                        let infoCarInBelt: JsonCar = cloneMapConveyorBelt2.find(infoCar => infoCar.idCar == idCarWantToChangeFoundInMap);
                        infoCarInBelt.idCar = idCarChangeTo;
                        ChangeIdCar2Done = true;
                    }
                }
            });

            if (cloneMapConveyorBelt1 != null && idCloneMapConveyorBelt1 != null) {
                this.listGarageSys.mapDataCarInGarage.set(idCloneMapConveyorBelt1, cloneMapConveyorBelt1);
            }
            if (cloneMapConveyorBelt2 != null && idCloneMapConveyorBelt2 != null) {
                this.listGarageSys.mapDataCarInGarage.set(idCloneMapConveyorBelt2, cloneMapConveyorBelt2);
            }

            if (ChangeIdCar1Done && ChangeIdCar2Done) { return; }

        } catch (e) {
            console.error(e);
        }
    }
    //#endregion other func
    //=================================================

    //=================================================
    //#region update id auto
    public UpdateMaxIdCarGame() {
        let listNCarBuild: Node[] = this.listCarBuildSys.mapCarBuild;
        let listAllJsonCarInGarage: JsonCar[] = this.listGarageSys.GetAllCarsInAllGarages();
        let listAllJsonCarInBelt: JsonCar[] = this.listConveyorBeltSys.GetAllCarsInAllBelt();

        let maxIdCar: number = -1;
        listNCarBuild.forEach(nCar => {
            const idCar = nCar.getComponent(BuildCar).IDCar;
            if (idCar > maxIdCar) {
                maxIdCar = idCar;
            }
        });
        listAllJsonCarInGarage.forEach(jsonCar => {
            if (jsonCar.idCar > maxIdCar) {
                maxIdCar = jsonCar.idCar;
            }
        });
        listAllJsonCarInBelt.forEach(jsonCar => {
            if (jsonCar.idCar > maxIdCar) {
                maxIdCar = jsonCar.idCar;
            }
        });

        this.listCarBuildSys.SetMaxIdCar(maxIdCar);
    }


    //REVIEW - This code not use yet because it affect to the group. You must control it to right first
    /**
     * func này sẽ chỉ được gọi sau khi dữ liệu đã được xóa
     * đã hủy đang lựa chọn gara vs belt vs car đang được chọn nếu nhưu xóa toàn bộ đối tượng
     * Trong các tình huống chỉ xóa 1 xe thì ta sẽ truyền dữ liệu min == max
     * Trong tình huống xóa gara hoặc belt => ta sẽ xóa một dãy các id xe
     * @param idMinRemove 
     * @param idMaxRemove 
     */
    public UpdateIdAuto(idMinRemove: number, idMaxRemove: number) {
        // NOTE trong trường hợp user đang chọn Gara hoặc Belt thì cần phải update cả item của xe để update giao diện
        // Trong các trường hợp của node xe trên ground cần update visual => đã được tích hợp sẵn trong lệnh update id xe

        // ==============================
        // B1 : lấy tất cả các node xe trên ground , các jsonCar của gara <nếu có>, các jconCar của belt <nếu có>
        let listNCarOnGround: Node[] = this.listCarBuildSys.mapCarBuild;
        let mapJsonCarGara: Map<number, JsonCar[]> = this.listGarageSys.mapDataCarInGarage;
        let mapJsonCarBelt: Map<number, JsonCar[]> = this.listConveyorBeltSys.mapDataCarInConveyorBelt;


        switch (true) {
            case idMinRemove == idMaxRemove:
                // filter tất cả những xe nào có id > idmin và giảm toàn bộ id của chúng xuống 1
                listNCarOnGround.forEach(nCar => {
                    const comCar = nCar.getComponent(BuildCar);
                    comCar.SetIdCar(comCar.IDCar - 1);
                });

                mapJsonCarGara.forEach((value: JsonCar[], idGara: number) => {
                    value.forEach((jsonCarCheck: JsonCar) => {
                        if (jsonCarCheck.idCar > idMinRemove) {
                            // check nếu đang lựa chọn gara => chỉ remove một xe trong gara => do đó chúng ta sẽ cần phải update cả item của đối tượng trong gara
                            jsonCarCheck.idCar = jsonCarCheck.idCar - 1;
                        }
                    })
                })

                mapJsonCarBelt.forEach((value: JsonCar[], idBelt: number) => {
                    value.forEach((jsonCarCheck: JsonCar) => {
                        if (jsonCarCheck.idCar > idMinRemove) {
                            // check nếu đang lựa chọn belt => chỉ remove một xe trong belt => do đó chúng ta sẽ cần phải update cả item của đối tượng trong belt
                            jsonCarCheck.idCar = jsonCarCheck.idCar - 1;
                        }
                    })
                })
                break;
            case idMinRemove < idMaxRemove:
                // filter tất cả những xe nào có id > idmin và giảm toàn bộ id của chúng xuống 1
                listNCarOnGround.forEach(nCar => {
                    const comCar = nCar.getComponent(BuildCar);
                    comCar.SetIdCar(comCar.IDCar - 1);
                });

                mapJsonCarGara.forEach((value: JsonCar[], idGara: number) => {
                    value.forEach((jsonCarCheck: JsonCar) => {
                        if (jsonCarCheck.idCar > idMinRemove) {
                            // check nếu đang lựa chọn gara => chỉ remove một xe trong gara => do đó chúng ta sẽ cần phải update cả item của đối tượng trong gara
                            jsonCarCheck.idCar = jsonCarCheck.idCar - 1;
                        }
                    })
                })

                mapJsonCarBelt.forEach((value: JsonCar[], idBelt: number) => {
                    value.forEach((jsonCarCheck: JsonCar) => {
                        if (jsonCarCheck.idCar > idMinRemove) {
                            // check nếu đang lựa chọn belt => chỉ remove một xe trong belt => do đó chúng ta sẽ cần phải update cả item của đối tượng trong belt
                            jsonCarCheck.idCar = jsonCarCheck.idCar - 1;
                        }
                    })
                })
                break;
        }
    }
    //#endregion update id auto
    //=================================================

    //=================================================
    //#region Group
    public AutoUpdateGroupForBuild(listInfoCar: JsonCar[]) {
        if (MConfigBuildGame.listLogicGroup.length == 0) { return; }

        // check all group save is valid with data now 
        // if not => convert it to right

        const groupNow: TGroupToLogic[] = this.uiGroupBuild.ConvertJsonCarToTGroupToLogic(listInfoCar);
        MConfigBuildGame.listLogicGroup.forEach((logicCheck, index) => {
            // lọc toàn bộ giá trị bị sai
            logicCheck = logicCheck.filter(group => {
                if (group.numCar != null && group.total != null)
                    return true;
                return false;
            });

            const listColorNotHaveNow: TGroupToLogic[] = logicCheck.filter(group => groupNow.findIndex(groupNCheck => groupNCheck.color == group.color) == -1);
            const listColorNotHaveInJson: TGroupToLogic[] = groupNow.filter(group => logicCheck.findIndex(groupCheck => groupCheck.color == group.color) == -1);

            // console.log(...listColorNotHaveInJson);
            // console.log(...listColorNotHaveNow);
            // console.log(...logicCheck);
            // console.log(...groupNow);

            // cập nhật lại toàn bộ num car đối với những group thay đổi
            logicCheck.forEach((group, index) => {
                const groupFind = groupNow.find(groupCheck => groupCheck.color == group.color);
                if (groupFind != null && group.total != groupFind.total) {
                    group.total = groupFind.total;
                    group.numCar = groupFind.numCar;
                    logicCheck[index] = group;
                }
            })

            // loại bỏ tất cả dữ liệu về color not have Now
            if (listColorNotHaveNow.length > 0) {
                logicCheck = logicCheck.filter(tGroup => !listColorNotHaveNow.includes(tGroup));
            }

            // thêm dữ liệu cho những màu mới
            if (listColorNotHaveInJson.length > 0) {
                logicCheck.push(...listColorNotHaveInJson);
            }

            // cập nhật lại dữ liệu
            MConfigBuildGame.listLogicGroup[index] = logicCheck;
        })

        // console.log("Check 11111", ...MConfigBuildGame.listLogicGroup);
    }
    //#endregion Group
    //=================================================
}


