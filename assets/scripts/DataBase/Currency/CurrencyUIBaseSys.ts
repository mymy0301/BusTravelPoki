import { _decorator, Button, CCBoolean, Component, Label, Node, tween, Tween } from 'cc';
import { TYPE_CURRENCY } from '../../Utils/Types';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
import { CurrencySys } from '../../Scene/CurrencySys';
const { ccclass, property } = _decorator;

@ccclass('CurrencyUIBaseSys')
export class CurrencyUIBaseSys extends Component {
    @property({ type: TYPE_CURRENCY }) typeCurrency: TYPE_CURRENCY = TYPE_CURRENCY.MONEY;
    @property(Label) lbCurrency: Label;
    @property(CCBoolean) autoUpdateLbWhenEnable = true;
    @property(Node) nIc: Node;
    @property(Node) nPlus: Node;
    @property(Node) nOnClick: Node;

    public onEnable(): void {
        //register event
        switch (this.typeCurrency) {
            case TYPE_CURRENCY.MONEY:
                clientEvent.on(MConst.EVENT_CURRENCY.UPDATE_UI_MONEY, this.IncreaseCurrencyUI, this);
                break;
            case TYPE_CURRENCY.TICKET:
                clientEvent.on(MConst.EVENT_CURRENCY.UPDATE_UI_TICKET, this.IncreaseCurrencyUI, this);
                break;
        }

        // update UI
        if (CurrencySys.Instance != null && this.autoUpdateLbWhenEnable) {
            let valueCurrency = CurrencySys.Instance.GetCurrency(this.typeCurrency);
            this.SetUp(valueCurrency);
        }
    }

    protected onDisable(): void {
        //register event
        switch (this.typeCurrency) {
            case TYPE_CURRENCY.MONEY:
                clientEvent.off(MConst.EVENT_CURRENCY.UPDATE_UI_MONEY, this.IncreaseCurrencyUI, this);
                break;
            case TYPE_CURRENCY.TICKET:
                clientEvent.off(MConst.EVENT_CURRENCY.UPDATE_UI_TICKET, this.IncreaseCurrencyUI, this);
                break;
        }
    }

    public SetUp(currency: number) {
        this.lbCurrency.string = currency.toString();
        this._valueMax = currency;
    }

    private _valueMax: number = 0;
    private IncreaseCurrencyUI(numCurrency: number = 0) {
        this._valueMax += numCurrency;

        Tween.stopAllByTarget(this.lbCurrency.node);
        const rootNumberCurrency = this.ConvertStringCurrencyToNumber(this.lbCurrency.string);
        const distance = this._valueMax - rootNumberCurrency;
        let self = this;

        // console.log("increase currency", rootNumberCurrency, distance, this._valueMax);

        tween(this.lbCurrency.node)
            .to(Math.abs(distance) <= 10 ? Math.abs(distance) / 20 : 0.3, {}, {
                easing: 'smooth', onUpdate(target, ratio) {
                    self.lbCurrency.string = self.ConvertNumberToString(Math.floor(rootNumberCurrency + distance * ratio));
                },
            })
            .start();
    }

    private ConvertStringCurrencyToNumber(stringNumber: string): number {
        let number = 0;
        try {
            number = parseInt(stringNumber);
        } catch (e) {
            console.log(e);
        }
        return number;
    }

    private ConvertNumberToString(number: number): string {
        // return number.toLocaleString('en-US');
        return number.toString();
    }

    public GetNIc(): Node { return this.nIc; }

    public UnRegisterClick() {
        this.nPlus.active = false;
        this.nOnClick.active = false;
    }
}


