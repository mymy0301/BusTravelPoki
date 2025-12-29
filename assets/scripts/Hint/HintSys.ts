import { _decorator, Component, Node } from 'cc';
import { CarSys } from '../Scene/GameScene/Logic/CarSys';
import { Utils } from '../Utils/Utils';
import { PassengerSys } from '../Scene/GameScene/Logic/PassengerSys';
import { M_COLOR } from '../Utils/Types';
const { ccclass, property } = _decorator;


export function CheckIfThisCarMoveToParkingWhatWillHappen(listCarParking: Node[],
    listCarMoveToParking: Node[], listPassengerRemaining: number[], numParkingCanPark: number): 'WIN' | 'LOSE' | 'NONE' {
    /* 
    hãy giả sử như toàn bộ logic truyền vào không bị lỗi như là:
    - số người còn lại không khớp với số chỗ trống chưa mở khóa
    */

    /*
    Thứ tự logic dùng để kiểm tra xem có thắng hay thua như sau:
    - Đầu tiên sẽ tính toán số chỗ ngồi của cả xe ở hàng đợi và số chỗ ngồi của xe đang di chuyển 
        + danh sách xe đang di chuyển này bắt buộc phải bao gồm xe cần check trong đó từ lúc truyền tham số vào đây
        + hãy cẩn thận với giá trị số chỗ ngồi còn lại của những xe đang đỗ ở hàng đợi rồi vì có thể mình đang check 
            ngay lúc người chơi đang chạy lên xe nên cần phải cẩn thận.
    - Tiếp theo cắt đoạn dữ liệu của người chưa lên xe phù hợp với số chỗ ngồi cần check
    - Tiếp theo kiểm tra xem toàn bộ danh sách màu vừa cắt có màu nào hiện không phù hợp với danh sách chỗ ngồi hay không
        + trong trường hợp có màu không phù hợp và liệu còn chỗ để xe hay không? => return 'NONE'
        + trong trường hợp có màu không phù hợp và không còn chỗ để xe nữa < cả kể khi còn vip> => return 'LOSE'
        + trong trường hợp đều có màu phù hợp và số người còn lại < ngoài danh sách vừa check ra> == 0 => return 'WIN'
    */


    let soChoNgoiCuaXeDangDo: number = 0;       // <tính theo mặt logic>
    let soChoNgoiCuaXeDangDiChuyen: number = 0  // <tính theo mặt logic>

    let danhSachMauCanNgoi: number[] = [];
    listCarParking.forEach(car => {
        const soChoNgoiConLaiCuaXe: number = car.getComponent(CarSys).InfoCar.GetNumberPassengerRemainingToMoveCar();
        const mauXe: number = car.getComponent(CarSys).InfoCar.color;
        soChoNgoiCuaXeDangDo += soChoNgoiConLaiCuaXe;
        danhSachMauCanNgoi.push(...new Array(soChoNgoiConLaiCuaXe).fill(mauXe));
    });
    listCarMoveToParking.forEach(car => {
        const soChoNgoiConLaiCuaXe: number = car.getComponent(CarSys).InfoCar.GetNumberPassengerRemainingToMoveCar();
        const mauXe: number = car.getComponent(CarSys).InfoCar.color;
        soChoNgoiCuaXeDangDiChuyen += soChoNgoiConLaiCuaXe;
        danhSachMauCanNgoi.push(...new Array(soChoNgoiConLaiCuaXe).fill(mauXe));
    })

    let danhSachNguoiDangDoiDeLenXe: number[] = Array.from(listPassengerRemaining).splice(0, soChoNgoiCuaXeDangDo + soChoNgoiCuaXeDangDiChuyen);
    let soNguoiConLaiChuaCheck: number = listPassengerRemaining.length - danhSachNguoiDangDoiDeLenXe.length;

    let colorNguoiDangDoi: Set<number> = new Set(danhSachNguoiDangDoiDeLenXe);
    let colorNguoiXe: Set<number> = new Set(danhSachMauCanNgoi);

    if (Utils.CompareTwoSet(colorNguoiDangDoi, colorNguoiXe)) {
        // người sẽ chạy hết lên xe
        /*
        Case 1: hết người => win
        Case 2: còn người => None
        */
        if (soNguoiConLaiChuaCheck == 0) {
            return 'WIN';
        }
        return 'NONE';
    } else {
        // người sẽ không lên hết
        /*
        Case 1: Nếu số chỗ để đỗ không còn nữa < cả kể khi còn chỗ ngồi của vip > => thua
        Case 2: Nếu số chỗ để đỗ vẫn còn => None
        */
        if (numParkingCanPark == 0) {
            return 'LOSE';
        }
        return 'NONE';
    }
}

export function NextCarHasSameColorWithFirstPassenger(listCarParking: Node[], listPassenger: Node[]): Node {
    try {
        for (let i = 0; i < listPassenger.length; i++) {
            for (let j = 0; j < listCarParking.length; j++) {
                const colorCar = listCarParking[j].getComponent(CarSys).InfoCar.color;
                const colorPassenger = listPassenger[i].getComponent(PassengerSys).infoPassenger.color;
                if (colorCar == colorPassenger) {
                    return listCarParking[j];
                }
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

export function PasssengerCanJoinAnyCar(nPassenger: Node, listCarCheck: Node[]): boolean {
    try {
        const colorPassenger = nPassenger.getComponent(PassengerSys).infoPassenger.color;
        let isHasCarCanGetPassenger = listCarCheck.every(car => {
            const carCom = car.getComponent(CarSys);
            const isSameColor = carCom.InfoCar.color == colorPassenger;
            const isHasEmptySeat = carCom.InfoCar.GetNumberPassengerRemainingToMoveCar() > 0;
            return isSameColor && isHasEmptySeat;
        });

        return isHasCarCanGetPassenger;
    } catch (e) {
        // console.log(e);
        return false;
    }
}

export function GetCarHasSameColor(color: M_COLOR, listCarCheck: Node[]): Node {
    try {
        for (let i = 0; i < listCarCheck.length; i++) {
            const carCheck = listCarCheck[i];
            if (carCheck.getComponent(CarSys).InfoCar.colorByMColor == color) {
                return carCheck;
            }
        }
    } catch (e) {
        return null;
    }
}