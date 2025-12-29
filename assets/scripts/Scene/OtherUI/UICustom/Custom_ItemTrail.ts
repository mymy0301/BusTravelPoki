import { _decorator, Component, Label, Node, ProgressBar, Sprite } from 'cc';
import { EVENT_CUSTOMS, IInfoTrailJson, STATE_ITEM_TRAIL } from '../../../Utils/Types/TypeCustoms';
import { clientEvent } from '../../../framework/clientEvent';
const { ccclass, property } = _decorator;

/**
 * trong game này không có sử dụng đến trạng thái LOCK 
 * tuy nhiên nếu game khác có sử dụng tính năng này thì xin hãy chỉnh sửa lại code cho phù hợp
 */

@ccclass('Custom_ItemTrail')
export class Custom_ItemTrail extends Component {
    @property(Sprite) spTrail: Sprite;
    @property(Label) lbNameTrail: Label;
    @property(Node) nVisual_IN_PROGRESS_OPEN: Node;
    @property(Node) nVisual_COMPLETED: Node;
    @property(Node) nBtnChoice: Node;
    @property(Node) nVisualUnChoice: Node;
    @property(ProgressBar) pb: ProgressBar;

    private _state: STATE_ITEM_TRAIL = STATE_ITEM_TRAIL.LOCK;
    private _infoTrail: IInfoTrailJson = null; public get InfoTrail(): IInfoTrailJson { return this._infoTrail; }
    private _numProgressNow: number = 0;

    public SetUp(data: IInfoTrailJson, idTrailChoice: string, numProgressNow: number) {
        this._infoTrail = data;
        this._numProgressNow = numProgressNow;

        this.lbNameTrail.string = data.Name;
        const maxProgress: number = data.RequireEachProgress.length;
        if (maxProgress == 0) {
            this.pb.progress = 1;
            this.ChangeState(idTrailChoice == data.Id ? STATE_ITEM_TRAIL.CHOICING : STATE_ITEM_TRAIL.UNCHOICING);
            return;
        }

        const progress: number = numProgressNow / maxProgress;
        this.pb.progress = progress;

        switch (true) {
            case progress == 1 && idTrailChoice == data.Id:
                this.ChangeState(STATE_ITEM_TRAIL.CHOICING);
                break;
            case progress == 1 && idTrailChoice != data.Id:
                this.ChangeState(STATE_ITEM_TRAIL.UNCHOICING);
                break;
            case progress < 1:
                this.ChangeState(STATE_ITEM_TRAIL.IN_PROGRESS_OPEN);
                break;
        }
    }

    private async IncreaseProgress() {
        const maxProgress: number = this._infoTrail.RequireEachProgress.length;
        this._numProgressNow += 1;
        const progressNew: number = this._numProgressNow / maxProgress;
        this.pb.progress = progressNew;

        // check unlock now
        if (progressNew == 1) {
            this.ChangeState(STATE_ITEM_TRAIL.UNCHOICING);
        }
    }

    public ChangeState(newState: STATE_ITEM_TRAIL) {
        this._state = newState;

        switch (this._state) {
            case STATE_ITEM_TRAIL.LOCK:
                break;
            case STATE_ITEM_TRAIL.IN_PROGRESS_OPEN:
                this.nVisual_IN_PROGRESS_OPEN.active = true;
                this.nVisual_COMPLETED.active = false;
                break;
            case STATE_ITEM_TRAIL.CHOICING:
                this.nVisual_IN_PROGRESS_OPEN.active = false;
                this.nVisual_COMPLETED.active = true;

                this.nBtnChoice.active = false;
                this.nVisualUnChoice.active = true;
                break;
            case STATE_ITEM_TRAIL.UNCHOICING:
                this.nVisual_IN_PROGRESS_OPEN.active = false;
                this.nVisual_COMPLETED.active = true;

                this.nBtnChoice.active = true;
                this.nVisualUnChoice.active = false;
                break;
        }
    }

    public GetState(): STATE_ITEM_TRAIL {
        return this._state;
    }

    private OnBtnBuy() {
        // increase progress
        clientEvent.dispatchEvent(EVENT_CUSTOMS.TRAIL.UPDATE_PROGRESS, this._infoTrail.Id);

        this.IncreaseProgress();
    }

    private OnBtnChoice() {
        // choice trail
        clientEvent.dispatchEvent(EVENT_CUSTOMS.TRAIL.CHOICE_TRAIL, this._infoTrail.Id);

        this.ChangeState(STATE_ITEM_TRAIL.CHOICING);
    }
}


