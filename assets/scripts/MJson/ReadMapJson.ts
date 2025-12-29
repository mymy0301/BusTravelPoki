import { _decorator, Component, JsonAsset, Node, Vec3, LOD, director } from 'cc';
import { ConvertJsonSizeBusFrenzyToSizeCar, ConvertSizeCarFromJsonToNumber, DIRECT_CAR, GetMColorByNumber, JsonCar, JsonConveyorBelt, JsonGarage, JsonMapGame, M_COLOR, TYPE_CAR_SIZE } from '../Utils/Types';
import { MConfigResourceUtils } from '../Utils/MConfigResourceUtils';
import { IMapBusFrenzy, JsonCarBusFrenzy } from '../BuildGame/MConstBuildGame';
import { FBInstantManager } from '../Utils/facebooks/FbInstanceManager';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ReadMapJson')
export class ReadMapJson {
    public static Instance: ReadMapJson;

    constructor() {
        if (ReadMapJson.Instance == null) {
            ReadMapJson.Instance = this;
        }
    }

    public async ReadDataFromJson(levelRead: number, typeGame: "normal" | "christ" = 'normal'): Promise<JsonMapGame> {
        switch (typeGame) {
            case 'normal':
                if (FBInstantManager.Instance.IsBuild) {
                    const dataMap = await MConfigResourceUtils.LoadMapGame_NEW(levelRead);
                    // const levelMapRead = dataMap.json.LevelData as any as JsonMapGame;
                    const levelMapRead = await this.ReadDataFromBusFrenzy(dataMap.json) as any as JsonMapGame;

                    return levelMapRead;
                } else {
                    const dataMap = await MConfigResourceUtils.LoadMapGame(levelRead);
                    // const levelMapRead = dataMap.json.LevelData as any as JsonMapGame;
                    const levelMapRead = await this.ReadDataFromBusFrenzy(dataMap.json) as any as JsonMapGame;

                    return levelMapRead;
                }
                break;
            case 'christ':
                if (FBInstantManager.Instance.IsBuild) {
                    const dataMap = await MConfigResourceUtils.LoadMapGame_NEW_Christ(levelRead);
                    // const levelMapRead = dataMap.json.LevelData as any as JsonMapGame;
                    const levelMapRead = await this.ReadDataFromBusFrenzy(dataMap.json) as any as JsonMapGame;

                    return levelMapRead;
                } else {
                    const dataMap = await MConfigResourceUtils.LoadMapGameChrist(levelRead);
                    // const levelMapRead = dataMap.json.LevelData as any as JsonMapGame;
                    const levelMapRead = await this.ReadDataFromBusFrenzy(dataMap.json) as any as JsonMapGame;

                    return levelMapRead;
                }
                break;
        }
    }

    public async ReadDataFromBusFrenzy(data: any): Promise<JsonMapGame> {
        const dataBusFrenzy = data.LevelData as IMapBusFrenzy;

        // convert data Car to our self 
        const dataCarsInfo: JsonCar[] = [];

        let isAllIdMoreThan0: boolean = dataBusFrenzy.CarInfo.every(element => element != null && (element as JsonCar).idCar != null && (element as JsonCar).idCar > 0);

        let idCarAuto: number = 1;

        const dataColorCar: number[] = [];
        dataBusFrenzy.CarInfo.forEach((element: JsonCar, index: number) => {
            const numCarSize: number = ConvertJsonSizeBusFrenzyToSizeCar(element.carSize);
            dataCarsInfo.push({
                idCar: element.idCar == null ? idCarAuto : element.idCar + (isAllIdMoreThan0 ? 0 : 1),
                carColor: element.carColor,
                carSize: numCarSize,
                carPosition: element.carPosition,
                carDirection: element.carDirection,
                isMysteryCar: element.isMysteryCar == null ? false : element.isMysteryCar,
                timeCarCallCoolDown: element.timeCarCallCoolDown == null ? -1 : element.timeCarCallCoolDown,
                timeCarCoolDown: element.timeCarCoolDown == null ? -1 : element.timeCarCoolDown,
                numCarRemainingCallCoolDown: element.numCarRemainingCallCoolDown == null ? -1 : element.numCarRemainingCallCoolDown,
                isTwoWayCar: element.isTwoWayCar == null ? false : element.isTwoWayCar,
                idCarKeyOfCarLock: element.idCarKeyOfCarLock == null ? -1 : element.idCarKeyOfCarLock,
                idCarLockOfCarKey: element.idCarLockOfCarKey == null ? -1 : element.idCarLockOfCarKey,
                colorKey_Lock: element.colorKey_Lock == null ? null : element.colorKey_Lock,
                listIdCarTrigger: element.listIdCarTrigger == null ? [] : element.listIdCarTrigger
            })
            idCarAuto += 1;
            dataColorCar.push(...new Array(numCarSize).fill(element.carColor));
        })

        // convert data Garage
        const dataGarageInfo: JsonGarage[] = [];
        if (dataBusFrenzy.GarageInfo != null) {
            dataBusFrenzy.GarageInfo.forEach(garage => {
                let dataCarsInGarage: JsonCar[] = [];
                garage.cars.forEach((car: JsonCar, index: number) => {
                    const numCarSize: number = ConvertJsonSizeBusFrenzyToSizeCar(car.carSize);
                    dataCarsInGarage.push({
                        idCar: car.idCar == null ? idCarAuto : car.idCar,
                        carColor: car.carColor,
                        carSize: numCarSize,
                        carPosition: car.carPosition,
                        carDirection: garage.direction,
                        isMysteryCar: car.isMysteryCar == null ? false : car.isMysteryCar,
                        listIdCarTrigger: car.listIdCarTrigger == null ? null : car.listIdCarTrigger
                    })
                    idCarAuto += 1;
                })

                dataGarageInfo.push({
                    direction: garage.direction,
                    garagePosition: garage.garagePosition,
                    cars: dataCarsInGarage
                })
            })
        }

        // convert data ConveyerBeltInfo
        const dataConveyerBeltInfo: JsonConveyorBelt[] = [];
        if (dataBusFrenzy.ConveyorBeltInfo != null) {
            dataBusFrenzy.ConveyorBeltInfo.forEach(conveyorBelt => {
                let dataCarsInConveyorBelt: JsonCar[] = [];
                conveyorBelt.cars.forEach((car: JsonCar, index: number) => {
                    const numCarSize: number = ConvertJsonSizeBusFrenzyToSizeCar(car.carSize);
                    dataCarsInConveyorBelt.push({
                        idCar: car.idCar == null ? idCarAuto : car.idCar,
                        carColor: car.carColor,
                        carSize: numCarSize,
                        carPosition: car.carPosition,
                        carDirection: car.carDirection,
                        isMysteryCar: car.isMysteryCar == null ? false : car.isMysteryCar,
                        listIdCarTrigger: car.listIdCarTrigger == null ? null : car.listIdCarTrigger
                    })
                    idCarAuto += 1;
                })


                dataConveyerBeltInfo.push({
                    direction: DIRECT_CAR.TOP,
                    conveyorBeltPosition: conveyorBelt.conveyorBeltPosition,
                    cars: dataCarsInConveyorBelt
                })
            })
        }


        // console.log("list passenger", ...dataBusFrenzy.GuestColor);

        // Set data
        let result: JsonMapGame = {
            Time: dataBusFrenzy.Time,
            LevelScaleFactor: dataBusFrenzy.LevelScaleFactor,
            ParkingSpaceInit: dataBusFrenzy.ParkingSpaceInit,
            GuestColor: dataBusFrenzy.GuestColor,
            CarInfo: dataCarsInfo,
            GarageInfo: dataGarageInfo,
            ConveyorBeltInfo: dataConveyerBeltInfo,
            Group: dataBusFrenzy.Group == null ? [] : dataBusFrenzy.Group
        }

        return result;
    }

    public ArrangeSiblingIndexBus(data: JsonCar[]): JsonCar[] {
        // sort the list to first is has worldPosition is top left and the last has position bottom right
        data.sort((a, b) => {
            if (a.carPosition.x < b.carPosition.x) {
                return -1;
            }
            if (a.carPosition.x > b.carPosition.x) {
                return 1;
            }

            if (a.carPosition.y > b.carPosition.y) {
                return -1;
            }
            if (a.carPosition.y < b.carPosition.y) {
                return 1;
            }

            return 0;
        });

        return data;
    }

    public ConvertDataMapToMapTypeCar(dataMap: JsonMapGame): Map<TYPE_CAR_SIZE, M_COLOR[]> {
        let mapTypeCar: Map<TYPE_CAR_SIZE, M_COLOR[]> = new Map();

        //loop car on ground
        dataMap.CarInfo.forEach(car => {
            if (mapTypeCar.get(car.carSize) != null) {
                let listHas = mapTypeCar.get(car.carSize);
                if (!listHas.includes(GetMColorByNumber(car.carColor))) {
                    mapTypeCar.get(car.carSize).push(GetMColorByNumber(car.carColor));
                }
            } else {
                mapTypeCar.set(car.carSize, [GetMColorByNumber(car.carColor)]);
            }
        })

        // loop car on garage
        dataMap.GarageInfo.forEach(garage => {
            garage.cars.forEach(car => {
                if (mapTypeCar.get(car.carSize) != null) {
                    let listHas = mapTypeCar.get(car.carSize);
                    if (!listHas.includes(GetMColorByNumber(car.carColor))) {
                        mapTypeCar.get(car.carSize).push(GetMColorByNumber(car.carColor));
                    }
                } else {
                    mapTypeCar.set(car.carSize, [GetMColorByNumber(car.carColor)]);
                }
            })
        })

        // loop car on conveyor belt
        dataMap.ConveyorBeltInfo.forEach(belt => {
            belt.cars.forEach(car => {
                if (mapTypeCar.get(car.carSize) != null) {
                    let listHas = mapTypeCar.get(car.carSize);
                    if (!listHas.includes(GetMColorByNumber(car.carColor))) {
                        mapTypeCar.get(car.carSize).push(GetMColorByNumber(car.carColor));
                    }
                } else {
                    mapTypeCar.set(car.carSize, [GetMColorByNumber(car.carColor)]);
                }
            })
        })

        return mapTypeCar;
    }
}


