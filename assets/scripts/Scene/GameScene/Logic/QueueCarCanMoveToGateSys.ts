import { _decorator, Component, Node } from 'cc';
import { CarSys } from './CarSys';
import { JsonPassenger } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('QueueCarCanMoveToGateSys')
export class QueueCarCanMoveToGateSys {
    public listPassenger: number[] = [];
    public _isUpdatingQueue: boolean = false;

    // id car , boolean < nếu true => xe có thể rời đi, nếu false => xe đang đợi >
    public mapIdCarCanPass: Map<number, boolean> = new Map<number, boolean>(); public get GetListIdCarCanMove() { return Array.from(this.mapIdCarCanPass.keys()) }

    public ResetData() {
        this.listPassenger = [];
        this.mapIdCarCanPass = new Map<number, boolean>();
        this._isUpdatingQueue = false;
    }

    public SetListPassenger(listPassenger: JsonPassenger[]) {
        this.listPassenger = (JSON.parse(JSON.stringify(listPassenger)) as JsonPassenger[]).map(item => item.color);
    }

    public RemovePassengerTop() {
        this.listPassenger.shift();
    }

    public SetIdCarReadyToMove(idCar: number) {
        this.mapIdCarCanPass.set(idCar, true);
    }

    public RemoveListIdCar(listIdCar: number[]) {
        for (let i = 0; i < listIdCar.length; i++) {
            if (this.mapIdCarCanPass.has(listIdCar[i])) {
                this.mapIdCarCanPass.delete(listIdCar[i]);
            }
        }
    }

    public GetListIdCarReady() {
        return Array.from(this.mapIdCarCanPass.keys()).filter(idCar => this.mapIdCarCanPass.get(idCar) == true);
    }

    public CheckCarCanPass(listNCarParking: Node[]) {

        this._isUpdatingQueue = true;
        /**
         * duyệt danh sách xe đang đỗ và khách ở hàng đợi để biết xe có thể pass được hay ko?
         * Nếu như xe có thể rời đi thì sẽ thêm vào mảnh set setIdCarCanPass
         * Nếu như đã có rùi thì ta có thể bỏ qua không duyệt xe đấy nữa
         */

        let listPassengerCheck = JSON.parse(JSON.stringify(this.listPassenger));

        let mapPassInCar: Map<number, number[]> = new Map<number, number[]>();   // id car và một mảng màu người có thể lên xe


        // duyệt mảng danh sách xe đang đỗ
        for (let i = 0; i < listNCarParking.length; i++) {
            const nCar = listNCarParking[i];
            const idCarCheck = nCar.getComponent(CarSys).InfoCar.idCar;
            const numEmptySeat = nCar.getComponent(CarSys).InfoCar.GetNumberPassengerRemainingToMoveCar();
            const colorCar = nCar.getComponent(CarSys).InfoCar.color;

            // list pass in car
            mapPassInCar.set(idCarCheck, new Array(numEmptySeat).fill(colorCar));
        }

        // danh sách xe có thể pass dc
        let listIdCarCanPassTemp: number[] = [];

        // sau khi đã có danh sách xe đang đỗ theo map , chúng ta sẽ duyệt danh sách người ở hàng đợi từ dưới lên trên
        // để có thể bt được xe nào có thể chạy được để đợi khi xe đấy đủ người sẽ cho xuất phát

        for (let i = 0; i < listPassengerCheck.length; i++) {
            let passCanJoinCar: boolean = false;
            const colorPassCheck: number = listPassengerCheck[i];

            //========== logic được xử lý ở vòng for ============
            // - Nếu như người check có thể lên xe được thì map xe sẽ -1 trong danh sách
            // - Nếu như xe vừa -1 empty thì sẽ move ra khỏi map xe

            for (let [idCar, listPassInCar] of mapPassInCar) {


                if (listPassInCar.includes(colorPassCheck)) {
                    passCanJoinCar = true;
                    if (listPassInCar.length == 1) {
                        // loại bỏ id car khỏi map passenger
                        mapPassInCar.delete(idCar);
                        // bổ sung id car vào danh sách xe có thể pass
                        listIdCarCanPassTemp.push(idCar);
                    } else {
                        mapPassInCar.set(idCar, listPassInCar.splice(0, listPassInCar.length - 1));
                    }
                    break;
                }
            }

            // ========== Exception break for ============
            // TH1: khi map xe check == 0 
            // TH2: khi người ở hàng đợi hết < điều kiện ở vòng for rùi>
            // TH3: khi người check ko lên được xe nào hết
            if (mapPassInCar.size == 0 || !passCanJoinCar) {
                break;
            }
        }

        // với danh sách id car vừa check , ta sẽ đối chiếu với danh sách id car mà đã sở hữu, xem danh sách xe có

        for (const idCar of listIdCarCanPassTemp) {
            if (!this.mapIdCarCanPass.has(idCar)) {
                this.mapIdCarCanPass.set(idCar, false);
            }
        }

        // updating queue
        this._isUpdatingQueue = false;
    }
}

function checkSameElements(A: number[], B: number[]): boolean {
    const countA: { [key: number]: number } = {};
    const countB: { [key: number]: number } = {};

    A.forEach(element => {
        countA[element] = (countA[element] || 0) + 1;
    });

    B.forEach(element => {
        countB[element] = (countB[element] || 0) + 1;
    });

    for (let element in countA) {
        if (countA[element] > (countB[element] || 0)) {
            return false;
        }
    }

    return true;
}


