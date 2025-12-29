import { _decorator, Component, Node, SpriteFrame, Vec3 } from 'cc';
import { JsonCar, NAME_SUP_VI_CAR } from 'db://assets/scripts/Utils/Types';
import { PoolGameSys } from '../../../LobbyScene/PoolGameSys';
const { ccclass, property } = _decorator;

/**
 * 
 * dinhquangvinhdev
 * Tue Jul 15 2025 17:50:06 GMT+0700 (Indochina Time)
 * VisualSupportCar
 * db://assets/scripts/Scene/GameScene/Logic/Car/VisualSupportCar.ts
 *
 */
// NOTE coding this class
@ccclass('VisualSupportCar')
export class VisualSupportCar extends Component {
    private mapNSubCar: Map<string, Node> = new Map();
    //==========================================
    //#region public
    /**
     * Gen node + SetUp
     */
    public async GenUISuitableWithCar(nameSubUI: NAME_SUP_VI_CAR) {
        switch (nameSubUI) {
            case NAME_SUP_VI_CAR.LOCK_CAR:
                // load then add to this node
                const nSupLockCar: Node = PoolGameSys.Instance.GetItemFromPool(NAME_SUP_VI_CAR.LOCK_CAR);
                this.mapNSubCar.set(NAME_SUP_VI_CAR.LOCK_CAR, nSupLockCar);
                nSupLockCar.setParent(this.node);
                break;
            case NAME_SUP_VI_CAR.TWO_WAY_CAR:
                // load then add to this node
                const nSupTwoWayCar: Node = PoolGameSys.Instance.GetItemFromPool(NAME_SUP_VI_CAR.TWO_WAY_CAR);
                this.mapNSubCar.set(NAME_SUP_VI_CAR.TWO_WAY_CAR, nSupTwoWayCar);
                nSupTwoWayCar.setParent(this.node);
                break;
            case NAME_SUP_VI_CAR.POLICE:
                // load then add to this node
                const nSupPolice: Node = PoolGameSys.Instance.GetItemFromPool(NAME_SUP_VI_CAR.POLICE);
                this.mapNSubCar.set(NAME_SUP_VI_CAR.POLICE, nSupPolice);
                nSupPolice.setParent(this.node);
                break;
            case NAME_SUP_VI_CAR.FIRE_TRUCK:
                const nSupFireTruck: Node = PoolGameSys.Instance.GetItemFromPool(NAME_SUP_VI_CAR.FIRE_TRUCK);
                this.mapNSubCar.set(NAME_SUP_VI_CAR.FIRE_TRUCK, nSupFireTruck);
                nSupFireTruck.setParent(this.node);
                break;
            case NAME_SUP_VI_CAR.AMBULANCE:
                const nSupAmbulance: Node = PoolGameSys.Instance.GetItemFromPool(NAME_SUP_VI_CAR.AMBULANCE);
                this.mapNSubCar.set(NAME_SUP_VI_CAR.AMBULANCE, nSupAmbulance);
                nSupAmbulance.setParent(this.node);
                break;
            case NAME_SUP_VI_CAR.MILITARY:
                const nSupMilitary: Node = PoolGameSys.Instance.GetItemFromPool(NAME_SUP_VI_CAR.MILITARY);
                this.mapNSubCar.set(NAME_SUP_VI_CAR.MILITARY, nSupMilitary);
                nSupMilitary.setParent(this.node);
                break;
        }
    }

    public GetSubUI(nameSubUI: NAME_SUP_VI_CAR): Node {
        return this.mapNSubCar.get(nameSubUI);
    }

    public ClearAllVisualSub() {
        this.mapNSubCar.forEach((value: Node, key: string) => {
            value.active = false;
            PoolGameSys.Instance.PoolItem(value, key);
        })

        this.mapNSubCar.clear();
    }
    //#endregion public
    //==========================================
}