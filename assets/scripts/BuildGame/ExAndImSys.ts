import { _decorator, Component, Node } from 'cc';
import { ConvertSizeCarFromJsonToNumber, ConvertSizeCarNumberToJsonBusFrenzy, JSON_TGroupToLogic, JsonCar, JsonConveyorBelt, JsonGarage, JsonGroup, JsonMapGame, TYPE_USE_JSON_GROUP } from '../Utils/Types';
import { IExportData } from './MConstBuildGame';
import { ListCarBuildSys } from './Car/ListCarBuildSys';
import { BuildCar } from './Car/BuildCar';
import { BuildConveyorBelt } from './ConveyorBelt/BuildConveyorBelt';
import { MConfigBuildGame } from './MConfigBuildGame';
import { LogicGenPassengerInBuild } from '../Scene/GameScene/Logic/LogicGenPassenger';
import { BuildGarage } from './Garage/BuildGarage';
import { ReadWriteFileSys } from './ReadWriteFileSys';
import { ReadMapJson } from '../MJson/ReadMapJson';
const { ccclass, property } = _decorator;

@ccclass('ExAndImSys')
export class ExAndImSys extends Component {
    public GetInfoToExport(listNCarBuild: Node[], listNGarageBuild: Node[], listNBeltBuild: Node[]): IExportData {
        let mapWriteGuestColor: Map<number, number[]> = new Map();  // group car , guest color
        let mapGroupCar: Map<number, number[]> = new Map();         // group car , id car
        let mapJsonCarGroup: Map<number, JsonCar[]> = new Map();    // group car, json car
        let dataForUIPreviewGroupCar: Map<number, {
            listJsonCarGroup: JsonCar[],
            listIdCar: number[],
            listColorPassenger: number[]
        }> = new Map();

        let dataAllJsonCarInMap: JsonCar[] = [];
        let dataWriteGuestColor: number[] = [];

        // info car
        let dataWriteCarInfo: JsonCar[] = [];
        let dataWriteGuestColorGroundCar: number[] = [];
        const listCarExport = Array.from(listNCarBuild);

        for (let i = 0; i < listCarExport.length; i++) {
            let nCar: Node = listCarExport[i];
            const jsonCarSave: JsonCar = nCar.getComponent(BuildCar).GetInfoToSaveData();
            const groupCar: number = nCar.getComponent(BuildCar).GroupCar == -1 ? 1 : nCar.getComponent(BuildCar).GroupCar;
            dataWriteCarInfo.push(jsonCarSave);
            dataAllJsonCarInMap.push(jsonCarSave);
            dataWriteGuestColorGroundCar.push(...new Array(ConvertSizeCarFromJsonToNumber(jsonCarSave.carSize)).fill(jsonCarSave.carColor));
            // // save group
            // if (!mapWriteGuestColor.has(groupCar)) {
            //     mapWriteGuestColor.set(groupCar, new Array(ConvertSizeCarFromJsonToNumber(jsonCarSave.carSize)).fill(jsonCarSave.carColor));
            //     mapGroupCar.set(groupCar, [nCar.getComponent(BuildCar).IDCar]);
            //     mapJsonCarGroup.set(groupCar, [jsonCarSave]);
            // } else {
            //     mapWriteGuestColor.get(groupCar).push(...new Array(ConvertSizeCarFromJsonToNumber(jsonCarSave.carSize)).fill(jsonCarSave.carColor));
            //     mapGroupCar.get(groupCar).push(nCar.getComponent(BuildCar).IDCar);
            //     mapJsonCarGroup.get(groupCar).push(jsonCarSave);
            // }
        }

        // Garage
        let dataWriteGarageInfo: JsonGarage[] = [];
        let dataWriteGuestColorGarage: number[] = [];
        const listGarageExport = Array.from(listNGarageBuild)
        listGarageExport.forEach(garage => {
            const jsonGarage: JsonGarage = garage.getComponent(BuildGarage).GetInfoToSaveData();

            // add to list json car
            dataAllJsonCarInMap.push(...jsonGarage.cars);

            jsonGarage.cars.forEach(car => {
                car.carSize = ConvertSizeCarNumberToJsonBusFrenzy(car.carSize);
            });
            // console.log("111111", ...jsonGarage.cars);
            dataWriteGarageInfo.push(jsonGarage);
            jsonGarage.cars.forEach(car => {
                const listGuest = new Array(ConvertSizeCarFromJsonToNumber(car.carSize)).fill(car.carColor);
                dataWriteGuestColorGarage.push(...listGuest);
            })
        });



        // Conveyor Belt
        let dataWriteConveyorBeltInfo: JsonConveyorBelt[] = [];
        let dataWriteGuestColorConveyorBelt: number[] = [];
        const listBeltExport = Array.from(listNBeltBuild)
        listBeltExport.forEach(conveyorBelt => {
            const jsonConveyorBelt: JsonConveyorBelt = conveyorBelt.getComponent(BuildConveyorBelt).GetInfoToSaveData();

            // add to list json car
            dataAllJsonCarInMap.push(...jsonConveyorBelt.cars);

            jsonConveyorBelt.cars.forEach(car => {
                car.carSize = ConvertSizeCarNumberToJsonBusFrenzy(car.carSize);
            })
            dataWriteConveyorBeltInfo.push(jsonConveyorBelt);
            jsonConveyorBelt.cars.forEach(car => {
                dataWriteGuestColorConveyorBelt.push(...new Array(ConvertSizeCarFromJsonToNumber(car.carSize)).fill(car.carColor));
            })
        });

        // === tạo ra một danh sách hàng người theo id tăng dần ==
        // sắp xếp xe theo id tăng dần
        dataAllJsonCarInMap.sort((a, b) => a.idCar - b.idCar);
        dataWriteGuestColor = dataAllJsonCarInMap.map((infoCar: JsonCar) => new Array(ConvertSizeCarFromJsonToNumber(infoCar.carSize)).fill(infoCar.carColor)).flat();
        dataWriteGuestColor.reverse();



        // passenger
        // check if has group in json file => you need to follow it
        // if you change the data => you need to gen data like in the map show up to you
        // you need shuffle by seed to make it not random of next time
        if (MConfigBuildGame.jsonLevelImport != null && MConfigBuildGame.jsonLevelImport.Group != null) {
            let dataCarToGenPass: JsonCar[] = JSON.parse(JSON.stringify(dataAllJsonCarInMap));
            dataCarToGenPass.forEach((element, index) => {
                element.carSize = ConvertSizeCarFromJsonToNumber(element.carSize);
            })
            const copyGroup = JSON.parse(JSON.stringify(MConfigBuildGame.jsonLevelImport.Group));
            const copyGuestColor = JSON.parse(JSON.stringify(MConfigBuildGame.jsonLevelImport.GuestColor));

            // check is same passenger with the value save
            const dataGuestInFileImport: number[] = LogicGenPassengerInBuild(copyGroup, dataCarToGenPass, copyGuestColor);

            // So sánh hai mảng number: độ dài bằng nhau và các phần tử giống nhau (không xét thứ tự)
            const isSameLength = dataGuestInFileImport.length === dataWriteGuestColor.length;
            const isSameElements = isSameLength &&
                dataGuestInFileImport.slice().sort().join(',') === dataWriteGuestColor.slice().sort().join(',');

            // console.error("Kiểm tra valid file, ", isSameLength, dataGuestInFileImport.slice().sort().join(','), dataWriteGuestColor.slice().sort().join(','));

            if (isSameElements) {
                dataWriteGuestColor = dataGuestInFileImport;
            }
        } else if (MConfigBuildGame.jsonLevelImport != null && (MConfigBuildGame.jsonLevelImport.Group == null || MConfigBuildGame.jsonLevelImport.Group.length == 0)) {
            const dataGuestColorSave = Array.from(MConfigBuildGame.jsonLevelImport.GuestColor);
            // So sánh hai mảng number: độ dài bằng nhau và các phần tử giống nhau (không xét thứ tự)
            const isSameLength = dataGuestColorSave.length === dataWriteGuestColor.length;
            const isSameElements = isSameLength &&
                dataGuestColorSave.slice().sort().join(',') === dataWriteGuestColor.slice().sort().join(',');
            if (isSameElements) {
                dataWriteGuestColor = dataGuestColorSave
            }
        }

        // group car
        if (MConfigBuildGame.jsonLevelImport != null && MConfigBuildGame.jsonLevelImport.Group != null) {
            // lọc toàn bộ group ko phải logic mới và thêm lại toàn bộ group hiện tại
            MConfigBuildGame.jsonLevelImport.Group = MConfigBuildGame.jsonLevelImport.Group.filter(value => value.typeUse != TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA);

            MConfigBuildGame.listLogicGroup.forEach(dataGroup => {
                const newJsonGroup: JsonGroup = {
                    typeUse: TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA,
                    numberLose: -1,
                    listGroups: [],
                    dataCustom: JSON_TGroupToLogic(dataGroup)
                }
                MConfigBuildGame.jsonLevelImport.Group.push(newJsonGroup);
            });
        }

        // for UI preview group car
        mapGroupCar.forEach((value, key) => {
            dataForUIPreviewGroupCar.set(key, {
                listJsonCarGroup: mapJsonCarGroup.get(key),
                listIdCar: value,
                listColorPassenger: mapWriteGuestColor.get(key)
            })
        })

        return {
            dataWriteCarInfo: dataWriteCarInfo,
            dataWriteGuestColor: dataWriteGuestColor,
            dataWriteGuestColorGroundCar: dataWriteGuestColorGroundCar,
            dataWriteHamXeInfo: dataWriteGarageInfo,
            dataWriteGuestColorGara: dataWriteGuestColorGarage,
            dataWriteTransmissionInfo: dataWriteConveyorBeltInfo,
            dataWriteGuestColorConveyorBelt: dataWriteGuestColorConveyorBelt,
            dataForUIPreviewGroupCar: dataForUIPreviewGroupCar
        }
    }

    public LogDataExport(dataExport: IExportData) {
        // log data
        const resultPassengerBuild = dataExport.dataWriteGuestColor.map((item) => item.toString()).join(",");
        const RevertPassengerBuild = Array.from(dataExport.dataWriteGuestColor).reverse().map((item) => item.toString()).join(",");
        let resultCarBeforeBuild = "";

        let resultCarInGaraBeforeBuild = "";
        let resultCarInConveyorBeforeBuild = "";
        let resultPassengerBeforeBuild: string = "";
        let ReversePassengerBeforeBuild: string = "";

        // just can export data if have json level import
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

        // log data
        console.log("==========================================================================");
        console.log("============================= DATA LOG ===================================");
        console.log("==========================================================================");
        console.log("json passenger before build", resultPassengerBeforeBuild);
        console.log("json passenger before build <Reverse>", ReversePassengerBeforeBuild);
        console.log("json pass car on ground before build", resultCarBeforeBuild);
        console.log("json pass car in garage before build", resultCarInGaraBeforeBuild);
        console.log("json pass car in conveyor belt before build", resultCarInConveyorBeforeBuild);
        console.log("json group", MConfigBuildGame.jsonLevelImport != null && MConfigBuildGame.jsonLevelImport.Group != null ? MConfigBuildGame.jsonLevelImport.Group : null);
        console.log("jsonLevelImport", MConfigBuildGame.jsonLevelImport);
        console.log("\n========================= After build =====================\n");
        console.log("json passenger after build", resultPassengerBuild);
        console.log("json passenger after build <Reverse>", RevertPassengerBuild);
        console.log("json pass car on ground after build", dataExport.dataWriteGuestColorGroundCar.map((item) => item.toString()).join(","));
        console.log("json pass car in garage after build", dataExport.dataWriteGuestColorGara.map((item) => item.toString()).join(","));
        console.log("json pass car in conveyor belt after build", dataExport.dataWriteGuestColorConveyorBelt.map((item) => item.toString()).join(","));
        console.log("==============================================================================");
        console.log("============================= END DATA LOG ===================================");
        console.log("==============================================================================");
    }

    public async ImportFile(cbLoadData: CallableFunction) {
        ReadWriteFileSys.readFile(async (data: any, nameFile) => {
            if (data != null) {
                let dataMap: JsonMapGame = await ReadMapJson.Instance.ReadDataFromBusFrenzy(data);
                console.log("dataMap" , dataMap);
                
                MConfigBuildGame.nameLevelImport = nameFile;
                await cbLoadData(dataMap);
            }
        });
    }
}


