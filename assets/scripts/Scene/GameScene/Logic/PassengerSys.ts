import { _decorator, Component, instantiate, Label, Node, Prefab, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { GameSoundEffect, JsonPassenger, M_COLOR, STATE_VISUAL_PASSENGER } from '../../../Utils/Types';
import { InfoPassengerSys } from './InfoPassengerSys';
import { VisualPassengerSys } from './VisualPassengerSys';
import { MConfigs } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('PassengerSys')
export class PassengerSys extends Component {
    @property(VisualPassengerSys) visualPassengerSys: VisualPassengerSys;
    @property(InfoPassengerSys) infoPassenger: InfoPassengerSys;
    @property(Label) lbDebug: Label;

    private _idLineUp: number = -1;
    private _idPlaceStand: number = -1;

    private _tweenMove: Tween<any> = null;


    public Init(data: JsonPassenger, nParent: Node) {
        this.infoPassenger.Init(data);
        this.visualPassengerSys.Init(this.infoPassenger.colorByMColor);
        // change UI or anim or something in here
        this.node.setParent(nParent);
        this.node.active = true;

        // reset data each time you init it
        this.visualPassengerSys.StopVisualEmotion();

        // ẩn người chơi ở lượt đầu tiên vì logic phần này được thiết kế đó là
        // người chơi sẽ xuất hiện từ dưới một UI khác.
        // Tuy nhiên sau này logic đã thay đổi thành người chơi sẽ ở layer phái trên UI chứ không còn ở phía sau
        // Do đó để fix một cách nhanh chóng thì ta sẽ ẩn người chơi đứng ở vị trí đầu tiên< tức ngược với hàng đợi để ko bị hiển thị>
        // Và hiển thị họ sau khi họ đã di chuyển đến vị trí tiếp theo thành công
        this.Hide();

        if (this.lbDebug != null) this.lbDebug.string = data.id.toString();
    }

    //#region LineUp
    public SetIndexPlaceStand(idPlaceStand: number, idLineUp: number) {
        this._idLineUp = idLineUp;
        this._idPlaceStand = idPlaceStand;
    }

    public GetIndexPlaceStand(idLineUp: number) {
        if (this._idLineUp == idLineUp) {
            return this._idPlaceStand;
        }
    }
    //#endregion LineUp

    //#region Move
    public async MoveTo(wPosMoveTo: Vec3, stateVisualPassengerBeforeMove: STATE_VISUAL_PASSENGER, stateVisualPassengerAfterMove: STATE_VISUAL_PASSENGER, timeCustom: number = -1) {
        this.SetIsMoving();
        Tween.stopAllByTarget(this.node);
        // if (this._tweenMove != null) this._tweenMove.stop();

        const colorPassenger: M_COLOR = this.infoPassenger.colorByMColor;

        const timeMoveTo: number = timeCustom < 0 ? MConfigs.DISTANCE_PASS_WAIT_TO_MOVE_ON_CAR / MConfigs.GET_VEC_PASSENGER : timeCustom;

        return new Promise<void>(resolve => {
            this._tweenMove = tween(this.node)
                .call(() => {
                    this.visualPassengerSys.ChangeStateVisualPassenger(stateVisualPassengerBeforeMove, colorPassenger, timeMoveTo);
                })
                .to(timeMoveTo, { worldPosition: wPosMoveTo })
                .call(() => {
                    this.visualPassengerSys.ChangeStateVisualPassenger(stateVisualPassengerAfterMove, colorPassenger);
                    // ẩn người chơi ở lượt đầu tiên vì logic phần này được thiết kế đó là
                    // người chơi sẽ xuất hiện từ dưới một UI khác.
                    // Tuy nhiên sau này logic đã thay đổi thành người chơi sẽ ở layer phải trên UI chứ không còn ở phía sau
                    // Do đó để fix một cách nhanh chóng thì ta sẽ ẩn người chơi đứng ở vị trí đầu tiên< tức ngược với hàng đợi để ko bị hiển thị>
                    // Và hiển thị họ sau khi họ đã di chuyển đến vị trí tiếp theo thành côngs
                    this.Show();
                    resolve();
                    this.SetNotMoving();
                })
                .start();
        })
    }

    public async MoveTo2(wPosMoveTo: Vec3, stateVisualPassengerMove: STATE_VISUAL_PASSENGER, stateVisualPassengerMoveDone: STATE_VISUAL_PASSENGER, timeMove: number) {
        const colorPassenger: M_COLOR = this.infoPassenger.colorByMColor;

        const timeMoveChangeUI: number = MConfigs.DISTANCE_PASS_WAIT_TO_MOVE_ON_CAR / MConfigs.GET_VEC_PASSENGER;

        Tween.stopAllByTarget(this.node);
        // if (this._tweenMove != null) this._tweenMove.stop();

        this.visualPassengerSys.ChangeStateVisualPassenger(stateVisualPassengerMove, colorPassenger, timeMoveChangeUI);

        return new Promise<void>(resolve => {
            this._tweenMove = tween(this.node)
                .to(timeMove, { worldPosition: wPosMoveTo })
                .call(() => {
                    this.visualPassengerSys.ChangeStateVisualPassenger(stateVisualPassengerMoveDone, colorPassenger);
                    resolve();
                })
                .start();
        })

    }

    public async JustOnlyChangeStateVisualPassenger(stateVisualPassengerMove: STATE_VISUAL_PASSENGER) {
        const colorPassenger: M_COLOR = this.infoPassenger.colorByMColor;
        const timeMoveChangeUI: number = MConfigs.DISTANCE_PASS_WAIT_TO_MOVE_ON_CAR / MConfigs.GET_VEC_PASSENGER;
        this.visualPassengerSys.ChangeStateVisualPassenger(stateVisualPassengerMove, colorPassenger, timeMoveChangeUI);
    }

    private _isMoving: boolean = false; public get IsMoving() { return this._isMoving; }

    /**
     * func này được gọi ở hai thời điểm
     * 1. là khi dòng người di chuyển
     * 2. là khi người lên xe
     */
    public SetIsMoving() { this._isMoving = true; }

    /**
     * func này được gọi khi dòng người dừng di chuyển và khi người được chuyển vào OP
     */
    public SetNotMoving() { this._isMoving = false; }

    //#endregion Move

    public UpdateVisualColor() {
        const stateVisualPassenger: STATE_VISUAL_PASSENGER = this.visualPassengerSys.GetStateVisualPassenger();
        this.visualPassengerSys.ChangeStateVisualPassenger(stateVisualPassenger, this.infoPassenger.colorByMColor);
    }

    public Hide() {
        this.node.getComponent(UIOpacity).opacity = 0;
    }

    public Show() {
        // this.node.active = true;
        this.node.getComponent(UIOpacity).opacity = 255;
    }
}


