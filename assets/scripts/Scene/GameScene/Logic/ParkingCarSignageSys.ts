import { _decorator, Component, Node, Prefab, Vec3, Pool, instantiate } from 'cc';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { SignageSys } from './SignageSys';
const { ccclass, property } = _decorator;

@ccclass('ParkingCarSignageSys')
export class ParkingCarSignageSys extends Component {
    @property(Prefab) pfSignage: Prefab;
    private _poolItem: Pool<Node> = null;
    private _mapIdParkingAndSignage: Map<number, Node> = new Map();

    protected onLoad(): void {
        this._poolItem = new Pool(() => instantiate(this.pfSignage), 0);
    }

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.RESET_GAME, this.ResetGame, this);
        clientEvent.on(MConst.EVENT_PARKING.UNLOCK_PARK, this.RemoveSignage, this);
    }

    protected onDisable(): void {
        clientEvent.off(MConst.EVENT.RESET_GAME, this.ResetGame, this);
        clientEvent.off(MConst.EVENT_PARKING.UNLOCK_PARK, this.RemoveSignage, this);
        this._poolItem.destroy();
    }

    //========================
    //#region listen
    private ResetGame() {
        this._mapIdParkingAndSignage.forEach(item => { item.active = false; this._poolItem.free(item) });
        this._mapIdParkingAndSignage.clear();
    }

    private async RemoveSignage(idParking: number) {
        try {
            if (this._mapIdParkingAndSignage.has(idParking)) {
                const signageChoice = this._mapIdParkingAndSignage.get(idParking);
                await signageChoice.getComponent(SignageSys).PlayAnimUnlock();
                if (!this.isValid) return;
                signageChoice.active = false;
                this._mapIdParkingAndSignage.delete(idParking);
                this._poolItem.free(signageChoice);
            }
        } catch (e) {

        }

    }
    //#endregion listen
    //========================


    //========================
    //#region public
    public InitParkingAndSignage(idParking: number, wPosSignage: Vec3) {
        if (this._mapIdParkingAndSignage.get(idParking) != null) { return; }
        const newSignage: Node = this._poolItem.alloc();
        newSignage.setParent(this.node, false);
        newSignage.setWorldPosition(wPosSignage);
        newSignage.getComponent(SignageSys)?.PlayIdleOn();
        newSignage.active = true;
        this._mapIdParkingAndSignage.set(idParking, newSignage);
    }
    //#endregion public
    //========================
}


