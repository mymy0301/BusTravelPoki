import { _decorator, Component, Label, Node } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { LifeSys2 } from './LifeSys2';
import { MConst } from '../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('NewLifeUISys')
export class NewLifeUISys extends Component {
    @property(Label) lbLife: Label;
    @property(Label) countDownTime: Label;

    protected onLoad(): void {
        clientEvent.on(MConst.LIFE.EVENT_UPDATE_UI_LIFE, this.UpdateUI, this);
    }

    protected onDestroy(): void {
        clientEvent.off(MConst.LIFE.EVENT_UPDATE_UI_LIFE, this.UpdateUI, this);
    }

    protected start(): void {
        this.UpdateUI();
    }

    private UpdateUI(){
        // get the numlife
        this.lbLife.string = LifeSys2.Instance.GetStringNumLife();
        // get the string time 
        this.countDownTime.string = LifeSys2.Instance.GetTimeRecover();
    }

    public TestUseLife (){
        LifeSys2.Instance.SpendLife();
    }
}


