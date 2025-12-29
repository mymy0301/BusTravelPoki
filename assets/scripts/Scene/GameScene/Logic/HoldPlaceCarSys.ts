import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HoldPlaceCarSys')
export class HoldPlaceCarSys extends Component {
    public IdCar: number = -1;
    public SetIdCar(idCar: number) {
        this.node.name = `car_${idCar}`;
        this.IdCar = idCar;
    }
    public GetIdCar(): number {
        return this.IdCar;
    }
}


