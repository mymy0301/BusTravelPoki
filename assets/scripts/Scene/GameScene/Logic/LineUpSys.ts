import { _decorator, CCInteger, Component, Node, Vec3 } from 'cc';
import { STATE_VISUAL_PASSENGER } from '../../../Utils/Types';
import { PassengerSys } from './PassengerSys';
import { PlaceStandSys } from './PlaceStandSys';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;


@ccclass('FlowLinePass')
export class FlowLinePass {
    @property(PlaceStandSys) listPlaceStand: PlaceStandSys[] = [];
    @property(PlaceStandSys) placeOut: PlaceStandSys = null;
    @property(PlaceStandSys) placeHideWhenRollback: PlaceStandSys = null;
    @property(PlaceStandSys) placeStart: PlaceStandSys = null;
}

@ccclass('LineUpSys')
export class LineUpSys extends Component {
    @property(FlowLinePass) listFlowPass: FlowLinePass[] = [];
    @property(PlaceStandSys) placeTriggerPassMoveToCar: PlaceStandSys = null;
    @property(CCInteger) idMap: number;
    private listPassenger: Node[] = []; public get ListPassenger(): Node[] { return this.listPassenger; }
    public get idLineUp(): number { return this.idMap; }

    public Init() {
        // may be you can change it to suit with your gamePlay
        this.listPassenger = [];
    }

    public CanMoveCrewForward(indexFlow: number = this.indexFlowNow) {
        // loop all passenger in the lineUp if no one reach the indexPlaceStand 0 => there are place to move forward
        const idPlaceNotValid = this.listFlowPass[indexFlow].placeOut.idPlace;
        return this.listPassenger.findIndex(passenger => passenger.getComponent(PassengerSys).GetIndexPlaceStand(this.idLineUp) == idPlaceNotValid) < 0;
    }

    public AddPassengerToTheLineUp(nPassenger: Node, idFlowForce: number = -1) {
        this.listPassenger.push(nPassenger);
        const comPlaceStand = idFlowForce == -1 ? this.GetFlowingLine().placeStart : this.listFlowPass[idFlowForce].placeStart;
        const wPosPlaceStand: Vec3 = comPlaceStand.GetWPosPlaceStand();
        nPassenger.worldPosition = wPosPlaceStand;
        nPassenger.setSiblingIndex(0);
        nPassenger.getComponent(PassengerSys).SetIndexPlaceStand(comPlaceStand.idPlace, this.idLineUp);
    }


    public async MoveCrewForward(speedPassenger: number = -1, forceNotTrigger: boolean = false, maxPassTrigger: number = -1, indexFlowForce: number = -1) {
        const idFlow = indexFlowForce == -1 ? this.indexFlowNow : indexFlowForce;
        const listPassExecute = this.GetPassByIdFlow(idFlow);

        const lengthPassenger: number = listPassExecute.length;
        maxPassTrigger = maxPassTrigger == -1 ? lengthPassenger : maxPassTrigger;

        let canTriggerChangeFlowRoot: boolean = false;

        for (let i = 0; i < maxPassTrigger; i++) {
            if (i == maxPassTrigger - 1) {
                await this.MovePassForward(listPassExecute[i], idFlow, speedPassenger, (canTriggerChangeFlow: boolean) => { if (!canTriggerChangeFlowRoot) { canTriggerChangeFlowRoot = canTriggerChangeFlow } });
            } else {
                this.MovePassForward(listPassExecute[i], idFlow, speedPassenger, (canTriggerChangeFlow: boolean) => { if (!canTriggerChangeFlowRoot) { canTriggerChangeFlowRoot = canTriggerChangeFlow } });
            }
        }

        // kiểm tra can Trigger ở đây
        if (canTriggerChangeFlowRoot && !forceNotTrigger) {
            this.ChangeFlowingLine();
        }
    }

    public async MovePassForward(nPass: Node, idFlow: number, speedPassenger: number, cbTriggerChangeFlow: CallableFunction) {
        const passengerCheck_com: PassengerSys = nPass.getComponent(PassengerSys);

        // find next placeStand
        const idPlaceStandNow: number = passengerCheck_com.GetIndexPlaceStand(this.idLineUp);
        if (idPlaceStandNow < 0) { return; }
        const placeComNow = this.GetPlaceStandById(idPlaceStandNow);
        if (placeComNow == null) { return; }

        const placeComNew = placeComNow.GetPlaceNext(idFlow)?.getComponent(PlaceStandSys);
        if (placeComNew == null) { return; }

        passengerCheck_com.SetIndexPlaceStand(placeComNew.idPlace, this.idLineUp);
        const wPosMoveTo = placeComNew.GetWPosPlaceStand();
        const statePassengerBeforeMove: STATE_VISUAL_PASSENGER = placeComNew.StateVisualPassengerBeforeMove(idFlow);
        const statePassengerAfterMove: STATE_VISUAL_PASSENGER = placeComNew.StateVisualPassengerAfterMove(idFlow);

        // kiểm tra nếu là trigger => update siblingIndex 
        if (placeComNew.triggerChangeFlow) { passengerCheck_com.node.setSiblingIndex(placeComNew.idPlace) }

        // kiểm tra nếu là trigger => trigger change flowline
        if (placeComNew.triggerChangeFlow) {
            cbTriggerChangeFlow != null && cbTriggerChangeFlow(true);
        }

        await passengerCheck_com.MoveTo(wPosMoveTo, statePassengerBeforeMove, statePassengerAfterMove, speedPassenger);
    }


    /**!SECTION
     * Lưu ý khi sử dụng cacheListFlowPassBackward này
     * listPass phải được sắp xếp theo đúng thứ tự trình tự hiển thị của listPlaceStand phù hợp
     */
    private _cacheListFlowPassBackward: { idFlow: number, listPass: Node[], listPlaceStand: PlaceStandSys[] }[] = [];
    public async MoveCrewBackward() {
        // duyệt toàn bộ flow và di chuyển toàn bộ người theo flow duyệt
        this._cacheListFlowPassBackward = [];
        let indexFlow = 0;
        while (indexFlow < this.listFlowPass.length) {
            const flowCheck = this.listFlowPass[indexFlow];
            const idPlaceHide = flowCheck.placeHideWhenRollback.idPlace;
            // danh sách listPlaceStand sẽ được kiểm tra đối chiếu với cache cũ để loại bỏ những đối thành phần bị trùng nhau
            const listPlaceStand = flowCheck.listPlaceStand.filter(place => this._cacheListFlowPassBackward.every(cache => !cache.listPlaceStand.includes(place)));
            // lấy danh sách pass dựa trên place đã lọc
            const listPass: Node[] = this.GetPassStandOnListPlace(listPlaceStand);


            // ====================== cache
            this._cacheListFlowPassBackward.push({ idFlow: indexFlow, listPass: listPass, listPlaceStand: listPlaceStand });

            // ====================== di chuyển
            // duyệt danh sách những người trong flow đó
            for (let step = 0; step < listPlaceStand.length - 1; step++) {
                // di chuyển đoàn người lui về sau
                // chỉ di chuyển người nào đang hiện
                for (let indexPass = listPass.length - 1; indexPass >= 0; indexPass--) {
                    // chỉ di chuyển người nào vẫn còn hiển thị 
                    if (!listPass[indexPass].active) { continue; }

                    const passengerCheck_com: PassengerSys = listPass[indexPass].getComponent(PassengerSys);
                    // find before placeStand
                    const idPlaceStandNow: number = passengerCheck_com.GetIndexPlaceStand(this.idLineUp);

                    // khi duyệt đến id place hide => ẩn đi và di chuyển ngầm về sau
                    if (idPlaceStandNow == idPlaceHide) { passengerCheck_com.node.active = false; }

                    const placeComNow: PlaceStandSys = this.GetPlaceStandById(idPlaceStandNow);
                    if (placeComNow == null) { continue; }


                    const nPlaceBefore = placeComNow.GetPlaceBefore(indexFlow).getComponent(PlaceStandSys);
                    if (nPlaceBefore == null) { continue; }

                    // trong trường hợp người vẫn còn trên màn hình thì cho di chuyển tiếp
                    const comPlaceBefore = this.GetPlaceStandById(nPlaceBefore.idPlace);
                    passengerCheck_com.SetIndexPlaceStand(comPlaceBefore.idPlace, this.idLineUp);
                    const wPosMoveTo = comPlaceBefore.GetWPosPlaceStand();
                    const statePassengerBeforeMove: STATE_VISUAL_PASSENGER = comPlaceBefore.StateVisualPassengerBeforeMove(indexFlow);
                    const statePassengerAfterMove: STATE_VISUAL_PASSENGER = comPlaceBefore.StateVisualPassengerAfterMove(indexFlow);
                    if (indexPass == 0) {
                        await passengerCheck_com.MoveTo(wPosMoveTo, statePassengerBeforeMove, statePassengerAfterMove, MConfigs.speedPassMoveByBooster);
                    } else {
                        passengerCheck_com.MoveTo(wPosMoveTo, statePassengerBeforeMove, statePassengerAfterMove, MConfigs.speedPassMoveByBooster);
                    }
                }
            }

            // ====================== tăng index
            indexFlow += 1;
        }
    }

    public async MoveCrewAfterBackward() {
        // dựa vào cache và hiển thị lại tương ứng
        let indexFlow = 0;
        while (indexFlow < this._cacheListFlowPassBackward.length) {
            const cacheFlowBack = this._cacheListFlowPassBackward[indexFlow];
            const indexFlowBack = cacheFlowBack.idFlow;
            const flowBack = this.listFlowPass[indexFlowBack];
            const listPassBack = cacheFlowBack.listPass;
            const idPlaceHideFlow = flowBack.placeHideWhenRollback.idPlace;
            const listPlaceBackward = cacheFlowBack.listPlaceStand;
            for (let indexPlace = 0; indexPlace < listPlaceBackward.length - 1; indexPlace++) {
                //============= move pass
                for (let indexPass = 0; indexPass < listPassBack.length; indexPass++) {
                    // chỉ di chuyển từng người một
                    if (indexPass > indexPlace) { continue; }

                    const passengerCheck_com: PassengerSys = listPassBack[indexPass].getComponent(PassengerSys);
                    // find next placeStand
                    const idPlaceStandNow: number = passengerCheck_com.GetIndexPlaceStand(this.idLineUp);
                    if (idPlaceStandNow < 0) { continue; }
                    const placeComNow = this.GetPlaceStandById(idPlaceStandNow);
                    if (placeComNow == null) { continue; }

                    const placeComNew = placeComNow.GetPlaceNext(indexFlow)?.getComponent(PlaceStandSys);
                    if (placeComNew == null) { continue; }

                    // di chuyển người
                    passengerCheck_com.SetIndexPlaceStand(placeComNew.idPlace, this.idLineUp);
                    const wPosMoveTo = placeComNew.GetWPosPlaceStand();
                    const statePassengerBeforeMove: STATE_VISUAL_PASSENGER = placeComNew.StateVisualPassengerBeforeMove(indexFlow);
                    const statePassengerAfterMove: STATE_VISUAL_PASSENGER = placeComNew.StateVisualPassengerAfterMove(indexFlow);

                    if (indexPass == indexPlace) {
                        await passengerCheck_com.MoveTo(wPosMoveTo, statePassengerBeforeMove, statePassengerAfterMove, MConfigs.speedPassMoveByBooster);
                        if (placeComNew.idPlace == idPlaceHideFlow) { passengerCheck_com.node.active = true; }
                    } else {
                        passengerCheck_com.MoveTo(wPosMoveTo, statePassengerBeforeMove, statePassengerAfterMove, MConfigs.speedPassMoveByBooster);
                    }
                }

            }
            //============= increaseFlow
            indexFlow += 1;
        }
    }

    public RemoveTopPassenger(): Node {
        const idPlaceTop = this.placeTriggerPassMoveToCar.idPlace;
        const indexPass = this.ListPassenger.findIndex(pass => pass.getComponent(PassengerSys).GetIndexPlaceStand(this.idLineUp) == idPlaceTop);
        const nPassRemove = this.ListPassenger.splice(indexPass, 1)[0];
        return nPassRemove;
    }

    public GetMaxPlaceStand(): number {
        let listPlace: PlaceStandSys[] = [];
        this.listFlowPass.forEach(flow => {
            listPlace = [
                ...listPlace,
                ...flow.listPlaceStand.filter(place => !listPlace.includes(place) && place != flow.placeStart)
            ];
        });
        return listPlace.length;
    }

    public GetMinPassCanTriggerChangeFlow(): number {
        const indexRoot = 0;
        let listPlaceRoot: PlaceStandSys[] = this.listFlowPass[indexRoot].listPlaceStand.filter(place => place != this.listFlowPass[indexRoot].placeStart);
        let listTotalPlace: PlaceStandSys[] = []
        this.listFlowPass.forEach((flow, index) => {
            if (index != indexRoot) {
                listTotalPlace = [
                    ...listTotalPlace,
                    ...flow.listPlaceStand.filter(place => !listTotalPlace.includes(place) && place != flow.placeStart)
                ];
            }
        });

        let listPlaceOther = listTotalPlace.filter(place => !listPlaceRoot.includes(place));
        let listPlaceSame = listTotalPlace.filter(place => listPlaceRoot.includes(place));

        return listPlaceSame.length + listPlaceOther.length * 2;
    }

    public GetFirstPassengerCanPickUp(): Node {
        if (this.listPassenger.length == 0) return null;
        const idPlace = this.placeTriggerPassMoveToCar.idPlace;
        const nPass = this.ListPassenger.find(pass => pass.getComponent(PassengerSys).GetIndexPlaceStand(this.idLineUp) == idPlace);
        return nPass;
    }

    public GetListPassenger(): Node[] {
        return this.listPassenger;
    }

    public GetNumPlaceStand(): number { return this.GetFlowingLine().listPlaceStand.length - 1; }

    /*
    func này được dùng để kiểm tra người có thể thêm vào hàng đợi hay không
    */
    public CanAddPassengerInHere() {
        return this.listPassenger.length < this.GetFlowingLine().listPlaceStand.length - 1;
    }

    public ResetData() {
        this.listPassenger = [];
        this.indexFlowNow = 0;
    }

    //===============================
    //#region other
    public GetPlaceStandById(idPlaceStand: number): PlaceStandSys {
        let result = null;

        // duyệt qua tất cả flow để trả về kết quả
        for (let i = 0; i < this.listFlowPass.length; i++) {
            const flowCheck = this.listFlowPass[i];
            result = flowCheck.listPlaceStand.find(place => place.idPlace == idPlaceStand);
            if (result != null) { break; }
        }

        return result;
    }
    //#endregion other
    //===============================


    //===============================
    //#region flow Line
    private indexFlowNow: number = 0; public get IndexFlowNow() { return this.indexFlowNow; }
    private GetFlowingLine(): FlowLinePass { return this.listFlowPass[this.indexFlowNow]; }

    private ChangeFlowingLine() {
        this.indexFlowNow += 1;
        // check last valid index
        if (this.indexFlowNow >= this.listFlowPass.length) {
            this.indexFlowNow = 0;
        }

        // nếu như có người đang đứng ở hàng ko phải của chung của flow thì ta mới cho phép indexFlowNow tăng đến mức đó
        const isValid = this.IsAnyPassStandOnSpeIndexFlow(this.indexFlowNow);

        if (!isValid) {
            console.log("OPSSSSSSSS");
            this.indexFlowNow += 1;
        }

        // check last valid index
        if (this.indexFlowNow >= this.listFlowPass.length) {
            this.indexFlowNow = 0;
        }
    }

    private GetPassByIdFlow(idFlow: number): Node[] {
        const flowCheck = this.listFlowPass[idFlow];
        const placeStand = flowCheck.listPlaceStand;
        return this.GetPassStandOnListPlace(placeStand);
    }

    private GetPassStandOnListPlace(listPlace: PlaceStandSys[]): Node[] {
        // duyệt ra danh sách những người có trùng id với flow
        const listIdPlaceFlowLineNow: number[] = listPlace.map(place => place.idPlace);
        const result = this.ListPassenger.filter(pass => listIdPlaceFlowLineNow.includes(pass.getComponent(PassengerSys).GetIndexPlaceStand(this.idLineUp)));

        // console.log("==================================");
        // console.log("index flow now: ", this.indexFlowNow);
        // console.log("listPass: ", this.ListPassenger);
        // console.log("list id place: ", listIdPlaceFlowLineNow);
        // console.log("result: ", result);

        return result;
    }

    private IsAnyPassStandOnSpeIndexFlow(indexFlow: number): boolean {
        if (indexFlow == 0) { return true; }
        const listPlaceRoot = this.listFlowPass[0].listPlaceStand;
        const listPlaceFlowCheck = this.listFlowPass[indexFlow].listPlaceStand;

        const listPlaceNotCollapse = listPlaceFlowCheck.filter(place => !listPlaceRoot.includes(place));
        const listIdPlaceNotCollapse = listPlaceNotCollapse.map(place => place.idPlace);

        const result = this.ListPassenger.find(pass => listIdPlaceNotCollapse.includes(pass.getComponent(PassengerSys).GetIndexPlaceStand(this.idLineUp))) != null;
        return result;
    }
    //#endregion flow Line
    //===============================

}
