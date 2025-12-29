import { _decorator, Component, error, Node, randomRange, randomRangeInt } from 'cc';
import { ConvertSizeCarFromJsonToNumber, GetMColorByNumber, GetPriorityDefaultByColor, JsonCar, JsonGroup, M_COLOR, TGroupBuild, TGroupToLogic, TYPE_USE_JSON_GROUP, UNJSON_TGroupToLogic } from '../../../Utils/Types';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

export function LogicGenPassenger(difficultMoveBack: number, difficultAddFromTemp: number, listInfoCars: JsonCar[]): number[] {
    let totalColorHave: number;
    let listColorPassenger: number[] = [];
    let tempPassengerWaitToStanding: number[] = [];

    function getThePassengerForwardToTemp(data: number[]): { newData: number[], passengerMoveBack: number[] } {
        let result = data;
        let passengerMoveBack: number[] = [];

        if (Utils.randomWithRate(difficultMoveBack)) {
            let randomNumPassengerMoveBack: number = randomRange(0, data.length - 1);
            if (randomNumPassengerMoveBack > 0) {
                passengerMoveBack = result.splice(data.length - randomNumPassengerMoveBack, randomNumPassengerMoveBack);
            }
        } else {
            if (Utils.randomWithRate(difficultAddFromTemp)) {
                result.push(...tempPassengerWaitToStanding);
                tempPassengerWaitToStanding = [];
            }
        }

        return {
            newData: result,
            passengerMoveBack: passengerMoveBack
        }
    }

    listInfoCars.forEach(element => {
        totalColorHave += element.carSize;
        let dataBeforeSort: number[] = new Array(element.carSize).fill(element.carColor);
        let dataAfterSort = getThePassengerForwardToTemp(dataBeforeSort);
        tempPassengerWaitToStanding.push(...dataAfterSort.passengerMoveBack);
        listColorPassenger.push(...dataAfterSort.newData);
    })

    // check if temp has passenger => add to all to the list
    if (listColorPassenger.length > 0) {
        listColorPassenger.push(...tempPassengerWaitToStanding);
        tempPassengerWaitToStanding = [];
    }

    return listColorPassenger;
}

function getThePassengerFromGroup(listGroup: number[][], listInfoCars: JsonCar[]): number[] {
    // reverse listGroup to export right
    const listGroupTrue = Array.from(listGroup).reverse();
    let result: number[] = [];

    listGroupTrue.forEach(element => {
        let listPassOfGroup: number[][] = [];

        element.forEach(idCarFind => {
            const infoCarChoice: JsonCar = listInfoCars.find(infoCar => infoCar.idCar == idCarFind);
            if (infoCarChoice == null) { return true; }
            let listPassenger: number[] = new Array(infoCarChoice.carSize).fill(infoCarChoice.carColor);
            // tách mảng dữ liệu ra thành nhiều mảng với mỗi mảng có ít nhất 2 phần tử
            while (true) {
                // trong trường hợp list pass chỉ còn ít hơn 4 người thì sẽ auto add hết vào mảng
                if (listPassenger.length < 4) {
                    listPassOfGroup.push(listPassenger);
                    return;
                }
                // Generate a random even number between 2 and half of the remaining list length
                let randomNumPassenger: number = randomRangeInt(1, listPassenger.length / 2) * 2;
                // check in case randomNumPassenger more than passenger can add -> add all to the list
                if (randomNumPassenger >= listPassenger.length) {
                    listPassOfGroup.push(listPassenger);
                    return;
                } else {
                    // lấy randomNumPassenger phần tử đầu tiên của mảng và thêm vào danh sách trộn
                    listPassOfGroup.push(listPassenger.splice(0, randomNumPassenger));
                }
            }
        })

        // export Data
        // console.log("=============");
        // console.log(...listPassOfGroup);

        let dataExport = Utils.shuffleList(listPassOfGroup);
        result.unshift(...dataExport.flat());
        // console.log("dataExportPass", ...result);
    })

    return result.reverse();
}

export function LogicGenPassengerInBuild(groups: JsonGroup[], listInfoCars: JsonCar[], listColorPassenger: number[]): number[] {
    // ============== logic gen passenger ============
    let result: number[] = [];

    // // find the group suit to gen map
    // if (groups != null) {

    //     groups.some(element => {
    //         switch (element.typeUse) {
    //             case TYPE_USE_JSON_GROUP.USE_FIRST: case TYPE_USE_JSON_GROUP.USE_AFTER_LOSE_SOME_ROUND_FOR_IAP: case TYPE_USE_JSON_GROUP.USE_AFTER_LOSE_SOME_ROUND_FOR_NON_IAP:
    //                 result = getThePassengerFromGroup(element.listGroups, listInfoCars);
    //                 return true;
    //         }
    //     })
    // }

    if (result.length == 0) {
        result = listColorPassenger;
    }

    return result.reverse();
}

export function LogicGenPassenger2(groups: JsonGroup[], listInfoCars: JsonCar[], listColorPassenger: number[], numLose: number, wasBoughtIAP: boolean): number[] {
    let result: number[] = [];

    if (groups != null) {
        // chia group thành từng nhóm theo thể loại và check theo priority như đã note trong chỗ tạo từng nhóm 
        const groupUseFirst: JsonGroup[] = groups.filter(group => group.typeUse == TYPE_USE_JSON_GROUP.USE_FIRST);
        const groupIAP: JsonGroup[] = groups.filter(group => group.typeUse == TYPE_USE_JSON_GROUP.USE_AFTER_LOSE_SOME_ROUND_FOR_IAP);
        const groupNonIAP: JsonGroup[] = groups.filter(group => group.typeUse == TYPE_USE_JSON_GROUP.USE_AFTER_LOSE_SOME_ROUND_FOR_NON_IAP);
        const groupNewWay: JsonGroup[] = groups.filter(group => group.typeUse == TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA);


        //========================= check group new way ====================
        if (groupNewWay.length > 0) {
            groupNewWay.some(element => {
                result = LogicGenPassNowLogic2(element.dataCustom);
                return true;
            })
            // check can return result
            if (result.length > 0) return result;
        }

        //========================== check group IAP =======================
        if (wasBoughtIAP && groupIAP.length > 0) {
            groupIAP.some(element => {
                if (element.numberLose < numLose) {
                    let tempListInfoCars: JsonCar[] = Array.from(listInfoCars);
                    result = getThePassengerFromGroup(element.listGroups, tempListInfoCars);
                    return true;
                }
            })
            // check can return result
            if (result.length > 0) return result;
        }

        //========================== check group non IAP =======================
        if (wasBoughtIAP && groupNonIAP.length > 0) {
            groupNonIAP.some(element => {
                if (element.numberLose < numLose) {
                    let tempListInfoCars: JsonCar[] = Array.from(listInfoCars);
                    result = getThePassengerFromGroup(element.listGroups, tempListInfoCars);
                    return true;
                }
            })
            // check can return result
            if (result.length > 0) return result;
        }

        //========================== check group UseFirst =======================
        if (groupUseFirst.length > 0) {
            // console.log("Use logic gen passenger group");
            groupUseFirst.some(element => {
                if (element.numberLose > numLose) {
                    let tempListInfoCars: JsonCar[] = Array.from(listInfoCars);
                    result = getThePassengerFromGroup(element.listGroups, tempListInfoCars);
                    return true;
                }
            })
            // check can return result
            if (result.length > 0) return result;
        }
    }

    // ============== logic gen passenger default ============
    result = listColorPassenger;

    return result;
}


export function LogicGenPassengerForBuild(groups: JsonGroup[], listInfoCars: JsonCar[], groupIndexChoiceForce: number = 0): number[] {
    let result: number[] = [];

    const groupChoice = groups[groupIndexChoiceForce - 1];  // trư 1 vì index 0 là lựa chọn dành cho normal nên 1 là index group 0
    if (groupChoice == null) { return [] }

    let tempListInfoCars: JsonCar[] = Array.from(listInfoCars);
    switch (groupChoice.typeUse) {
        case TYPE_USE_JSON_GROUP.NEW_LOGIC_SORT_DATA:
            // result = LogicGenPassNewLogic(groupChoice.dataCustom);
            result = LogicGenPassNowLogic2(groupChoice.dataCustom);
            break;
        default:
            result = getThePassengerFromGroup(groupChoice.listGroups, tempListInfoCars);
            break;
    }
    return result;
}

export function LogicGenPassNewLogic(input: string): number[] {
    let totalPass: number = 0;
    let tGroupToLogic = UNJSON_TGroupToLogic(input);
    tGroupToLogic.forEach(groupCheck => totalPass += groupCheck.total);

    let listColorMaxQuality: number[] = [];

    // tạo ra một mảng màu 0 tương ứng vs số người có
    let listColor: number[] = new Array(totalPass).fill(0);
    let listIndexCanUsed: number[] = new Array(totalPass).fill(0).map((_, i) => i);

    function randomColorWithTGroup(color: number, totalColor: number, tGroup: TGroupBuild): number {
        // lọc những index có thể sử dụng
        let indexMin = totalPass * tGroup.startR / 100;
        let indexMax = totalPass * tGroup.endR / 100;

        let listIndexCanRandomInRange: number[] = listIndexCanUsed.filter(value => value >= indexMin && value <= indexMax);
        const numColorRandom: number = Math.floor(totalColor * tGroup.quality / 100);
        const limitOutRange: number = numColorRandom * 5 / 100;
        for (; ;) {
            // trong trường hợp những passenger đã có đủ chỗ ngời thì thôi
            if (listIndexCanRandomInRange.length >= numColorRandom) {
                break;
            }

            // ở đây chúng ta sẽ bổ sung những chỗ ngồi xung quanh indexCanUsed
            indexMin -= limitOutRange;
            indexMax += limitOutRange;
            if (indexMin < 0 && indexMax > totalPass) { break; }
            if (indexMax > totalPass) { indexMax = totalPass; }
            if (indexMin < 0) { indexMin = 0; }
            listIndexCanRandomInRange = listIndexCanUsed.filter(value => value >= indexMin && value <= indexMax);
        }
        // check data
        switch (true) {
            // trường hợp số chỗ ít hơn số người cần ngồi
            case listIndexCanRandomInRange.length < numColorRandom:
                console.error("Số màu có thể trộn ít hơn so với số lượng trộn được");
                // xếp toàn bộ chỗ đã random thành màu đó còn đối với phần thừa thì sẽ nhét vào danh sách trộn maxQuality
                listIndexCanRandomInRange.forEach(indexSet => {
                    listColor[indexSet] = color;
                })
                // remove những gía trị đã bị tháo giỡ
                listIndexCanUsed = listIndexCanUsed.filter(index => !listIndexCanRandomInRange.includes(index));
                console.warn("list index can used", listIndexCanUsed);
                return listIndexCanRandomInRange.length;

            // trường hợp số chỗ nhiều hơn hoặc bằng số người cần ngồi
            default:
                let listIndexSet: number[] = Utils.randomListValueOfList(numColorRandom, listIndexCanRandomInRange);
                // set color
                listIndexSet.forEach(indexSet => {
                    listColor[indexSet] = color;
                })
                // remove những gía trị đã bị tháo giỡ
                listIndexCanUsed = listIndexCanUsed.filter(index => !listIndexSet.includes(index));
                console.warn("list index can used", listIndexSet);
                return listIndexSet.length;
        }
    }

    // sort dữ liệu để những group có giá trị priority cao lên trước
    tGroupToLogic.sort((a, b) => b.priority - a.priority);

    // đọc từng đối tượng trong data để trộn và lưu lại những giá trị đã có giá trị
    // đối với những groupCheck nào có 0 số lượng màu trộn thì sẽ skip và điền vào giá trị sau cùng
    // sẽ chỉ đọc những group có giá trị trộn cụ thể trước
    tGroupToLogic.forEach(groupCheck => {
        if (groupCheck.listTGroup.findIndex(group => group.quality == 100 && group.startR == 0 && group.endR == 100) == -1) {
            let totalColorWasUsed: number = groupCheck.total;
            groupCheck.listTGroup.forEach(tGroup => {
                // random màu trong khoảng dữ liệu và cài đặt vào 
                totalColorWasUsed -= randomColorWithTGroup(groupCheck.color, groupCheck.total, tGroup);
            });

            if (totalColorWasUsed > 0) {
                console.error(`Sau khi trộn màu ${groupCheck.color} bị thừa ${totalColorWasUsed}`);
                listColorMaxQuality.push(... new Array(totalColorWasUsed).fill(groupCheck.color));
            }
        } else {
            listColorMaxQuality.push(... new Array(groupCheck.total).fill(groupCheck.color));
        }
    })

    // sau khi đọc hết những giá trị cần điền rùi => ta sẽ trộn những giá trị còn lại để quality = 100
    // shuffle danh sách colorMaxQuality
    listColorMaxQuality = Utils.shuffleListWithCoupleValue(listColorMaxQuality);
    listIndexCanUsed.forEach((value, _i) => {
        listColor[value] = listColorMaxQuality[_i];
    })

    // listColor.reverse();
    console.warn("warn 2: ", listColor.toString());
    return listColor;
}

export function LogicGenPassNowLogic2(input: string): number[] {
    // check valid
    if (input == null || input == '') { return null; }

    let totalPass: number = 0;
    let tGroupToLogic: TGroupToLogic[] = UNJSON_TGroupToLogic(input);
    tGroupToLogic.forEach(groupCheck => totalPass += groupCheck.total);

    // chúng ta sẽ gom nhớm những đối tượng có khoảng sắp xếp là giống nhau lại thành map và thêm sẵn màu người vào đó.
    // sau đó chúng ta sẽ trộn người của từng nhớm
    let mapColorPass: Map<string, number[]> = new Map();

    tGroupToLogic.forEach(tGroup => {
        tGroup.listTGroup.forEach(groupCheck => {
            const key = JSON.stringify({ start: groupCheck.startR, end: groupCheck.endR });
            if (mapColorPass.get(key) == null) {
                mapColorPass.set(key, []);
            }

            const existingArray = mapColorPass.get(key);
            existingArray.push(...new Array(groupCheck.quality).fill(tGroup.color));
            mapColorPass.set(key, existingArray);
        })
    })

    // shuffle map colorPass
    mapColorPass.forEach((value, key) => {
        const result = Utils.shuffleListWithCoupleValue(value);
        mapColorPass.set(key, result);
    })



    // Sort map by start value in ascending order and flatten to 1D array
    let result: number[] = [];
    // console.log(...mapColorPass.entries());
    const sortedEntries = Array.from(mapColorPass.entries()).sort((a, b) => {
        const value1 = JSON.parse(a[0]).start;
        const value2 = JSON.parse(b[0]).start;
        const start1 = Number.parseInt(value1)
        const start2 = Number.parseInt(value2)
        // console.log("check", value1, value2, start1, start2);
        return start1 - start2;
    });
    // console.log(sortedEntries);

    sortedEntries.forEach(([key, value]) => {
        result.push(...value);
    });

    // console.warn("warn 3: ", result.toString());
    return result;
}

//========================= check group new way ====================
export function ValidGroupPass(groupNewWay: JsonGroup[], listPass: number[]) {
    let isValid: boolean = true;
    for (const el of groupNewWay) {
        const dataCheck: number[] = LogicGenPassNowLogic2(el.dataCustom);
        if (dataCheck == null) { isValid = false; break; }
        if (
            dataCheck.length !== listPass.length ||
            !arraysHaveSameElementCounts(dataCheck, listPass)
        ) {
            isValid = false;
            break;
        }

        function arraysHaveSameElementCounts(arr1: number[], arr2: number[]): boolean {
            const countMap = (arr: number[]) => {
                const map = new Map<number, number>();
                arr.forEach(num => map.set(num, (map.get(num) ?? 0) + 1));
                return map;
            };
            const map1 = countMap(arr1);
            const map2 = countMap(arr2);
            if (map1.size !== map2.size) return false;
            for (const [key, val] of map1.entries()) {
                if (map2.get(key) !== val) return false;
            }
            return true;
        }
    }

    return isValid;
}