import { _decorator, Component, Node, Tween, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UICoinMultiplier')
export class UICoinMultiplier extends Component {
    @property(Node) nArrow: Node;
    private readonly timeTween: number = 0.5; // second move an angle arrow
    private _multiplierCoin: number = 0;
    private _cbUpdateLbMultiplier: CallableFunction;

    private readonly point_1: number = 25;
    private readonly point_2: number = 19;
    private readonly point_3: number = 11.5;
    private readonly point_4: number = 4;
    private readonly point_5: number = -3.6;
    private readonly point_6: number = -11;
    private readonly point_7: number = -18.5;
    private readonly point_8: number = -25;

    protected onLoad(): void {
        this.PlayAnimArrow();
    }

    public RegisterFuncUpdateLbMultiplier(cb: CallableFunction) {
        this._cbUpdateLbMultiplier = cb;
    }

    private PlayAnimArrow() {
        this.nArrow.angle = this.point_1;
        tween(this.nArrow)
            .to(this.timeTween / 7, { angle: this.point_2 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_3 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_4 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_5 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_6 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_7 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_8 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_7 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_6 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_5 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_4 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_3 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_2 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .to(this.timeTween / 7, { angle: this.point_1 }).call(() => { this._cbUpdateLbMultiplier(this.GetMultiplierCoin()); })
            .union()
            .repeatForever()
            .start();
    }

    private GetMultiplierCoin(): number {
        if (this.nArrow.angle <= this.point_1 && this.nArrow.angle > this.point_2) {
            this._multiplierCoin = 1.5;
        } else if (this.nArrow.angle <= this.point_2 && this.nArrow.angle > this.point_3) {
            this._multiplierCoin = 2;
        } else if (this.nArrow.angle <= this.point_3 && this.nArrow.angle > this.point_4) {
            this._multiplierCoin = 3;
        } else if (this.nArrow.angle <= this.point_4 && this.nArrow.angle > this.point_5) {
            this._multiplierCoin = 5;
        } else if (this.nArrow.angle <= this.point_5 && this.nArrow.angle > this.point_6) {
            this._multiplierCoin = 3;
        } else if (this.nArrow.angle <= this.point_6 && this.nArrow.angle > this.point_7) {
            this._multiplierCoin = 2;
        } else {
            this._multiplierCoin = 1.5;
        }

        return this._multiplierCoin;
    }

    public StopAnimArrow(): number {
        Tween.stopAllByTarget(this.nArrow);
        // check angle and choice the coinMultiplier
        this.GetMultiplierCoin();
        return this._multiplierCoin;
    }
}

