import { _decorator, Component, instantiate, Node, Prefab, randomRangeInt, tween, Vec3, log, error, macro, Sprite, Tween } from 'cc';
import { PassengerSys } from './PassengerSys';
import { LineUpSys } from './LineUpSys';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst } from '../../../Const/MConst';
import { GameSoundEffect, GetNumberByMColor, JsonPassenger, M_COLOR, STATE_VISUAL_PASSENGER, TYPE_CAR_SIZE } from '../../../Utils/Types';
import { MConfigs } from '../../../Configs/MConfigs';
import { ListEmotions } from './ListEmotions';
import { QueueCarCanMoveToGateSys } from './QueueCarCanMoveToGateSys';
import { SoundSys } from '../../../Common/SoundSys';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('ListPassengerSys')
export class ListPassengerSys extends Component {
    @property(Prefab) prefabPassenger: Prefab = null;
    @property(LineUpSys) listLineUpSys: LineUpSys[] = [];
    @property(Node) nSavePassenger: Node;
    @property(Node) nShowPassenger: Node;

    private _numPassengerWasPickedUp: number = 0;
    private _totalPassengerWasInitialized: number = 0;
    private _totalPassenger: number = 0;
    private _queuePassenger: number = 0;
    private _maxQueuePassenger: number = 0;
    private _data: JsonPassenger[] = [];
    private _queueCarCanMoveToGateSys: QueueCarCanMoveToGateSys = null;
    private _numLinePassThisGame: number = 1; public get NumLinePassThisGame(): number { return this._numLinePassThisGame; }
    private _idLineUpChoice: number = 0;

    protected onEnable(): void {
        clientEvent.on(MConst.EVENT.PASSENGER_BACK_WARD, this.MovePassengerBackWard, this);
        clientEvent.on(MConst.EVENT.BUS_MOVE_OUT_TO_THE_GATE, this.IncreaseNumCarMoveOutToTheGate, this);
    }

    protected onDisable(): void {
        this._queueCarCanMoveToGateSys = null;
        clientEvent.off(MConst.EVENT.PASSENGER_BACK_WARD, this.MovePassengerBackWard, this);
        clientEvent.off(MConst.EVENT.BUS_MOVE_OUT_TO_THE_GATE, this.IncreaseNumCarMoveOutToTheGate, this);
        this.UnRegisterCbClockTime();
    }

    //#region Init
    public Init(queueCarCanMoveToGateSys: QueueCarCanMoveToGateSys, data: JsonPassenger[], idLinePass: number) {
        // cache data
        this._totalPassenger = data.length;
        this._totalPassengerWasInitialized = 0;
        this._idLineUpChoice = idLinePass;
        this._queuePassenger = 0;
        this._maxQueuePassenger = this.LineUsing.GetMaxPlaceStand();
        this._data = data;
        this._queueCarCanMoveToGateSys = queueCarCanMoveToGateSys;
        this._queueCarCanMoveToGateSys.SetListPassenger(this._data); // set list passenger

        // init line up
        this.LineUsing.Init();
    }
    //#endregion Init

    //#region listen func
    private async MovePassengerBackWard(cbWhenBackWardDone: CallableFunction, cbMoveDone: CallableFunction) {
        // console.warn("start pass move");
        // console.log(this._queuePassenger, this.LineUsing.GetListPassenger());

        let listPromiseAllPassMoveBackWard: Promise<void>[] = [];
        const lineCheck = this.LineUsing;
        listPromiseAllPassMoveBackWard.push(lineCheck.MoveCrewBackward());
        await Promise.all(listPromiseAllPassMoveBackWard);


        cbWhenBackWardDone();


        let listPromiseAllPassMoveAfterBackward: Promise<void>[] = [];
        listPromiseAllPassMoveAfterBackward.push(lineCheck.MoveCrewAfterBackward());
        await Promise.all(listPromiseAllPassMoveAfterBackward);


        cbMoveDone();

        // console.warn("end pass move");
    }

    private IncreaseNumCarMoveOutToTheGate(idCar: number, numPassengerPickedUp: number) {
        this._numPassengerWasPickedUp += numPassengerPickedUp;
    }
    //#endregion listen func

    public IsAddPassengerMoveToGate(): boolean {
        return this.GetNumPassengerPickedUp() == this.GetTotalPassenger();
    }

    public GetNumPassengerPickedUp(): number {
        return this._numPassengerWasPickedUp;
    }

    public GetTotalPassenger(): number {
        return this._totalPassenger;
    }

    public IsNoMorePassenger(): boolean {
        return (this._totalPassenger == this._totalPassengerWasInitialized) && this._queuePassenger == 0;
    }

    public GetAllPassengerCanPickUp(): Map<number, Node> {
        let result: Map<number, Node> = new Map<number, Node>();
        const lineCheck = this.LineUsing;
        const nPassengerCheck: Node = lineCheck.GetFirstPassengerCanPickUp();
        if (nPassengerCheck != null) {
            result.set(lineCheck.idLineUp, nPassengerCheck);
        }
        return result;
    }

    public GetFirstPassengerCanPickUp(): Node {
        return this.LineUsing.GetFirstPassengerCanPickUp();
    }

    public NextPassenger(idFlowForce: number = -1, indexDataForce: number = -1): Node {
        const lineCheck = this.LineUsing;
        // check valid full queuePassenger
        if (this._queuePassenger >= this._maxQueuePassenger) {
            return null;
        }

        // check loại người nào sẽ xuất hiện
        if (indexDataForce == -1) {
            indexDataForce = this._totalPassengerWasInitialized;
            // phụ thuộc vào flow của hàng người nào

            // logic gen người theo từng map
            switch (lineCheck.idLineUp) {
                case 1:
                    // đây là case có 2 hàng người ta sẽ lấy theo logic chẵn lẻ
                    // nếu indexFlow ở hàng 0 thì ta lấy số chẵn còn nếu indexFlow ở hàng 1 thì ta lấy số lẻ
                    switch (lineCheck.IndexFlowNow) {
                        case 0:
                            indexDataForce = this._totalPassengerWasInitialized + 5;
                            break;
                        case 1:
                            if (this._totalPassengerWasInitialized >= this._data.length - 5) {
                                const numDiff = this._data.length - this._totalPassengerWasInitialized;
                                // [17, 19, 21, 23, 25]
                                indexDataForce = this._data.length - (numDiff) * 2 + 1;
                            } else {
                                indexDataForce = this._totalPassengerWasInitialized - 5;
                            }
                            break;
                    }
                    // console.log(this._data.length);
                    // console.log("tổng người đã init: ", this._totalPassengerWasInitialized, lineCheck.IndexFlowNow, indexDataForce);
                    break;
            }
        }

        // check valid có data hay không
        if (indexDataForce == -1 || indexDataForce >= this._data.length) {
            return null;
        }

        // init người và trả về node passenger
        let nPassenger: Node = this.GetPassenger();
        nPassenger.getComponent(PassengerSys).Init(this._data[indexDataForce], this.nShowPassenger);
        nPassenger.name = "Passenger_" + this._totalPassengerWasInitialized;
        lineCheck.AddPassengerToTheLineUp(nPassenger, idFlowForce);

        this._queuePassenger += 1;
        this._totalPassengerWasInitialized += 1;

        return nPassenger;
    }

    /**
     * Move top passenger of first line up to midWPos then move to wPos wPos
     * And Move crew forward
     * @param idLineUp 
     * @param wPos 
     */

    public MoveTopPassengerToCar(wPos: Vec3): Promise<void> {
        this._queuePassenger -= 1;
        const lineCheck = this.LineUsing;
        let nPassengerMove: Node = lineCheck.RemoveTopPassenger();

        //==============================================================================
        //============================= WAY 1 ==========================================
        //==============================================================================
        const colorPass: M_COLOR = nPassengerMove.getComponent(PassengerSys).infoPassenger.colorByMColor;
        const state_visualMove = wPos.x < nPassengerMove.worldPosition.x ? STATE_VISUAL_PASSENGER.IDLE_TURN_LEFT : STATE_VISUAL_PASSENGER.IDLE_TURN_RIGHT;
        const state_visualMove_2 = wPos.x < nPassengerMove.worldPosition.x ? STATE_VISUAL_PASSENGER.MOVE_LEFT : STATE_VISUAL_PASSENGER.MOVE_RIGHT;

        const wPos2: Vec3 = new Vec3(wPos.x, wPos.y + MConfigs.DISTANCE_UP_MOVE_TO_CAR, 0);
        const wPos1: Vec3 = new Vec3(nPassengerMove.worldPosition.x, wPos2.y, 0);
        const wPos3: Vec3 = new Vec3(wPos.x, (wPos.y + wPos2.y) / 2);
        const wPos4: Vec3 = wPos.clone();

        const speedMove1: number = Vec3.distance(wPos1, nPassengerMove.worldPosition) / MConfigs.GET_VEC_PASSENGER;
        const speedMove2: number = Vec3.distance(wPos2, wPos1) / MConfigs.GET_VEC_PASSENGER;
        const speedMove3: number = Vec3.distance(wPos3, wPos2) / MConfigs.GET_VEC_PASSENGER;
        const speedMove4: number = Vec3.distance(wPos4, wPos3) / MConfigs.GET_VEC_PASSENGER;

        const baseScale: Vec3 = nPassengerMove.scale.clone();
        const scaleImpress: Vec3 = baseScale.clone().add3f(0.15, 0.15, 0.15);

        // play anim
        const comPass = nPassengerMove.getComponent(PassengerSys);
        nPassengerMove.getComponent(PassengerSys).SetIsMoving();

        return new Promise<void>(async (resolve) => {
            await comPass.MoveTo2(wPos1, STATE_VISUAL_PASSENGER.MOVE_DOWN, state_visualMove, speedMove1);
            // console.error("done Move 2");
            await comPass.MoveTo(wPos2, state_visualMove_2, state_visualMove, speedMove2);
            // console.error("done Move 1");

            tween(nPassengerMove)
                .to(speedMove3, { worldPosition: wPos3, scale: scaleImpress })
                .to(speedMove4, { worldPosition: wPos4, scale: baseScale })
                .call(() => {
                    this._queueCarCanMoveToGateSys.RemovePassengerTop();
                    this.ReUsePassenger(nPassengerMove);
                    clientEvent.dispatchEvent(MConst.EVENT_PASSENGERS.DECREASE_NUM_PASSENGER);
                    resolve();
                })
                .start();
        })

        //==============================================================================
        //============================= WAY 2 ==========================================
        //==============================================================================
        // const state_visualMove = wPos.x < nPassengerMove.worldPosition.x ? STATE_VISUAL_PASSENGER.IDLE_TURN_LEFT : STATE_VISUAL_PASSENGER.IDLE_TURN_RIGHT;
        // const state_visualMove_2 = wPos.x < nPassengerMove.worldPosition.x ? STATE_VISUAL_PASSENGER.MOVE_LEFT : STATE_VISUAL_PASSENGER.MOVE_RIGHT;

        // const wPosEnd: Vec3 = wPos.clone();
        // let wPos1: Vec3 = wPos.lerp(nPassengerMove.worldPosition.clone(), 0.7);
        // const speedMove1: number = Vec3.distance(wPos1, nPassengerMove.worldPosition) / MConfigs.GET_VEC_PASSENGER / 1.2;
        // const speedMove2: number = Vec3.distance(wPosEnd, wPos1) / MConfigs.GET_VEC_PASSENGER / 1.2;

        // const baseScale: Vec3 = nPassengerMove.scale.clone();
        // const scaleImpress: Vec3 = baseScale.clone().add3f(0.15, 0.15, 0.15);

        // // play anim
        // const comPass = nPassengerMove.getComponent(PassengerSys);
        // nPassengerMove.getComponent(PassengerSys).SetIsMoving();
        // // this will run repeat forever => you need to stop it when it done
        // comPass.JustOnlyChangeStateVisualPassenger(state_visualMove_2);

        // return new Promise<void>(async (resolve) => {
        //     tween(nPassengerMove)
        //         .to(speedMove1, { worldPosition: wPos1 })
        //         .to(speedMove2, { worldPosition: wPosEnd })
        //         .call(() => {
        //             comPass.JustOnlyChangeStateVisualPassenger(state_visualMove);
        //             this._queueCarCanMoveToGateSys.RemovePassengerTop();
        //             this.ReUsePassenger(nPassengerMove);
        //             resolve();
        //         })
        //         .start();
        // })
    }

    /**
     * 
     * @param indexLineUp the line up was lost a passenger
     */
    public async MoveTheCrewForward(speedPassenger: number = -1) {

        const lineCheck = this.LineUsing;
        ListEmotions.Instance.unRegisterShowEmotions(this._idCbShowEmotions);
        let isHasSpaceToStandingForward: boolean = this._queuePassenger < this._maxQueuePassenger;
        let isHasAnyPassengerWaitForStanding: boolean = this._totalPassengerWasInitialized < this._totalPassenger;

        const MAX_STEP_WHILE = 200;
        let step = 0;

        while (lineCheck.CanMoveCrewForward() && isHasSpaceToStandingForward) {

            if (isHasAnyPassengerWaitForStanding) {
                this.NextPassenger();
            }
            await lineCheck.MoveCrewForward(speedPassenger);

            // update logic check 
            isHasSpaceToStandingForward = this._queuePassenger < this._maxQueuePassenger;
            isHasAnyPassengerWaitForStanding = this._totalPassengerWasInitialized < this._totalPassenger;

            // console.log(idLineUp, isHasSpaceToStandingForward, isHasAnyPassengerWaitForStanding, this._queuePassenger);
            if (!isHasAnyPassengerWaitForStanding && this._queuePassenger == 0) { break; }

            // để tránh vòng lặp vô hạn ta sẽ đặt một trigger để break ở đây
            step += 1;
            if (step == MAX_STEP_WHILE) {
                console.warn("Trigger");
                break;
            }
        }

        this._idCbShowEmotions = ListEmotions.Instance.registerShowEmotions(this.callShowEmotions.bind(this), MConfigs.TIME_SHOW_EMOTIONS, this._idLineUpChoice);
    }

    public async MoveTheCrewForward_open_christ(speedPassenger: number = -1) {
        const lineCheck = this.LineUsing;
        ListEmotions.Instance.unRegisterShowEmotions(this._idCbShowEmotions);

        // logic move crew ở đây đó là khởi tạo sẵn người chơi cho danh sách phù hợp
        // sau đó di chuyển cả đoàn người theo trình tự mà ta mong muốn => như thế sẽ tránh vc bị sai ở thời điểm ban đầu
        // điều đó cần phải tắt trigger đi ko được trigger mà ta sẽ xử lý bằng tay

        // ở đây ta sẽ có một vài case xảy ra trong những tình huống này
        // case 1 : chưa đủ người đứng ở chỗ trigger
        // case 2: đủ người đứng ở chỗ trigger nhưng chưa đủ người để thừa trong việc đan xen
        // case 3: thừa người nhưng vẫn chưa thừa đủ người để init cho việc gen các đối tượng chẵn cho hàng 0
        // case 4: quá thừa người


        // init 15 đối tượng cho flow0 [0,1,2,3,4,5,6,8,10,12,14,16,18,20,22,24]
        const listIdDataPass_0 = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22]
        for (let i = 0; i < listIdDataPass_0.length; i++) {
            this.NextPassenger(0, listIdDataPass_0[i]);
        }

        // init 4 đối tượng cho flow1 [7,9,11,13]
        let listPassFlow1: Node[] = [];
        const listIdDataPass_1 = [7, 9, 11, 13];
        for (let i = 0; i < listIdDataPass_1.length; i++) {
            listPassFlow1.push(this.NextPassenger(1, listIdDataPass_1[i]));
        }

        //=================================
        // di chuyển hàng người flow 0 rồi đến hàng người flow1 ko bật trigger
        for (let i = 0; i < listIdDataPass_0.length; i++) {
            await lineCheck.MoveCrewForward(speedPassenger, true, i + 1, 0);
        }
        for (let i = 0; i < listIdDataPass_1.length; i++) {
            for (let indexPass = 0; indexPass <= i; indexPass++) {
                const nPass = listPassFlow1[indexPass];
                if (indexPass == i) {
                    await lineCheck.MovePassForward(nPass, 1, speedPassenger, null);
                } else {
                    lineCheck.MovePassForward(nPass, 1, speedPassenger, null);
                }
            }
        }

        this._idCbShowEmotions = ListEmotions.Instance.registerShowEmotions(this.callShowEmotions.bind(this), MConfigs.TIME_SHOW_EMOTIONS, this._idLineUpChoice);
    }

    public IsMovingPassenger(): boolean {
        let hasPassMoving = false;
        // loop toàn bộ người xem họ có đang moving hay không
        hasPassMoving = this.LineUsing.ListPassenger.every(item => item.getComponent(PassengerSys).IsMoving);
        return hasPassMoving;
    }

    public ResetData() {
        this._totalPassengerWasInitialized = 0;
        this._totalPassenger = 0;
        this._queuePassenger = 0;
        this._maxQueuePassenger = 0;
        this._numPassengerWasPickedUp = 0;
        this._data = [];

        // reset time double pass
        this.ResetTimeDoublePass();

        // loop func
        ListEmotions.Instance.unRegisterShowEmotions(this._idCbShowEmotions);

        // get all passenger in game have
        let allPassengers: Node[] = [];
        allPassengers.push(...Array.from(this.LineUsing.ListPassenger));
        allPassengers.forEach(passenger => this.ReUsePassenger(passenger));

        this.listLineUpSys.forEach(sys => sys.ResetData());
    }

    //#region ReUsePassenger
    public GetPassenger(): Node {
        if (this.nSavePassenger.children.length > 0) {
            return this.nSavePassenger.children[this.nSavePassenger.children.length - 1];
        } else {
            let newPassenger: Node = instantiate(this.prefabPassenger);
            return newPassenger;
        }
    }

    public ReUsePassenger(nPassenger: Node) {
        nPassenger.active = false;
        nPassenger.getComponent(PassengerSys).SetNotMoving();
        nPassenger.setParent(this.nSavePassenger);
    }
    //#endregion ReUsePassenger

    //#region SORT PASSENGER
    public async SortPassenger(listMColorForChangeListPassengerWaiting: M_COLOR[]) {
        // update data
        // you need to swap all the color passenger from the index passenger is standing before move up to the bus to the last 
        // 
        const totalPassengerWasMoved: number = this._totalPassengerWasInitialized - this._queuePassenger;
        const self = this;
        function SetAllColorPassengerForwardToThisIndex(indexColorChange: number, indexDataPassCheck: number) {
            for (let i = indexDataPassCheck; i > indexColorChange + totalPassengerWasMoved; i--) {
                self._data[i].color = self._data[i - 1].color;
            }
        }

        // logic in here that remove all the color you see in the list passenger than add all to the top
        for (let indexColorChange = 0; indexColorChange < listMColorForChangeListPassengerWaiting.length; indexColorChange++) {
            const colorChange = GetNumberByMColor(listMColorForChangeListPassengerWaiting[indexColorChange]);
            for (let indexDataPassCheck = totalPassengerWasMoved; indexDataPassCheck < this._data.length; indexDataPassCheck++) {
                if (this._data[indexDataPassCheck].color == colorChange) {
                    SetAllColorPassengerForwardToThisIndex(indexColorChange, indexDataPassCheck);
                    this._data[totalPassengerWasMoved + indexColorChange].color = -1;
                    break;
                }
            }
        }

        // set all list color to first passenger choice
        let indexColorChange1 = 0;
        for (let indexDataPassCheck = totalPassengerWasMoved; indexDataPassCheck < listMColorForChangeListPassengerWaiting.length + totalPassengerWasMoved; indexDataPassCheck++) {
            const colorChange = GetNumberByMColor(listMColorForChangeListPassengerWaiting[indexColorChange1]);
            this._data[indexDataPassCheck].color = colorChange;
            indexColorChange1 += 1;
        }

        // set new color pass to queue passenger
        this._queueCarCanMoveToGateSys.SetListPassenger(this._data);


        // get list passenger
        let listPassenger: Node[] = [];
        this.listLineUpSys.slice(0, this._numLinePassThisGame).forEach(line => listPassenger.push(...line.ListPassenger));

        for (let i = 0; i < listMColorForChangeListPassengerWaiting.length; i++) {
            const nPassengerChange: Node = listPassenger[i];
            if (nPassengerChange == null) break;
            nPassengerChange.getComponent(PassengerSys).UpdateVisualColor();
        }

    }
    //#endregion SORT PASSENGER


    //#region check to double speed passenger
    private timeToDoubleSpeedPass: number = 0;
    public IsRegisterClockTime: boolean = false;

    public RegisterCbClockTime() {
        if (this.IsRegisterClockTime) return;
        this.IsRegisterClockTime = true;
        this.schedule(this.IncreaseTimeDoublePass, 0.1, macro.REPEAT_FOREVER, 0);
    }

    private UnRegisterCbClockTime() {
        this.unschedule(this.IncreaseTimeDoublePass);
    }

    private IncreaseTimeDoublePass() {
        // check in case node was destroy but you call it
        if (!this.node.isValid) {
            this.UnRegisterCbClockTime();
            return;
        }

        // increase time to Double speed
        this.timeToDoubleSpeedPass += MConfigs.stepIncreaseSpeed;

        if (this.timeToDoubleSpeedPass >= MConfigs.MaxTimeDoubleSpeedPass) {
            this.UnRegisterCbClockTime();
        }
    }

    public TryCanDoubleSpeedPass() {
        if (this.timeToDoubleSpeedPass >= MConfigs.MaxTimeDoubleSpeedPass && MConfigs.GET_VEC_PASSENGER != MConfigs.SPEED_UP_VEC_PASSENGER) {
            MConfigs.SET_VEC_PASSENGER = MConfigs.SPEED_UP_VEC_PASSENGER;
        }
    }

    public ResetTimeDoublePass() {
        this.UnRegisterCbClockTime();
        this.timeToDoubleSpeedPass = 0;
        MConfigs.SET_VEC_PASSENGER = MConfigs.DEFAULT_VEC_PASSENGER;
        SoundSys.Instance.resetSoundEffectComboPass_move_on_car();
        this.IsRegisterClockTime = false;
    }
    //#endregion check to double speed passenger

    //#region emotions
    private _idCbShowEmotions: number = -1;
    private callShowEmotions(idLineUp: number) {
        if (this == null) return;

        const listPassenger: Node[] = Array.from(this.listLineUpSys[idLineUp].ListPassenger);
        const listNEmotionsNotShow: Node[] = listPassenger
            .map(passenger => passenger.getComponent(PassengerSys).visualPassengerSys.spEmotions.node)
            .filter(nEmotion => nEmotion.getComponent(Sprite).spriteFrame == null);

        if (ListEmotions.Instance == null) return;
        ListEmotions.Instance.ShowEmotionsOnPassenger(listNEmotionsNotShow);
    }
    //#endregion emotions

    public get LineUsing() {
        return this.listLineUpSys[this._idLineUpChoice];
    }
}