import { _decorator, Component, Node } from 'cc';
import { MoveToByCode_2 } from '../../Utils/Effects/MoveToByCode_2';
const { ccclass, property } = _decorator;



@ccclass('ShowAndHideUIPageHome')
export class ShowAndHideUIPageHome extends Component {
    @property(MoveToByCode_2) phaseAnim: MoveToByCode_2[] = [];
    @property(MoveToByCode_2) nUICoin: MoveToByCode_2;
    @property(MoveToByCode_2) nUITicket: MoveToByCode_2;
    @property(MoveToByCode_2) nUIBottomTab: MoveToByCode_2;
    private _isShow: boolean = true; public get IsShow() { return this._isShow; }

    public async ShowUI() {
        // update state
        this._isShow = true;

        let listPromise = [];
        for (let i = 0; i < this.phaseAnim.length; i++) {
            const phase = this.phaseAnim[i];
            listPromise.push(phase.MoveIn());
        }
        await Promise.all(listPromise);
    }

    public async HideUI() {
        // udpate state
        this._isShow = false;

        let listPromise = [];
        for (let i = 0; i < this.phaseAnim.length; i++) {
            const phase = this.phaseAnim[i];
            listPromise.push(phase.MoveOut());
        }
        await Promise.all(listPromise);
    }

    public async HideUIChoice(nameChoice: 'tab' | 'coin' | 'ticket') {
        switch (nameChoice) {
            case 'tab':
                await this.nUIBottomTab.MoveOut();
                break;
            case 'coin':
                await this.nUICoin.MoveOut();
                break;
            case 'ticket':
                await this.nUITicket.MoveOut();
                break;
        }
    }

    public async ShowUIChoice(nameChoice: 'tab' | 'coin' | 'ticket') {
        switch (nameChoice) {
            case 'tab':
                await this.nUIBottomTab.MoveIn();
                break;
            case 'coin':
                await this.nUICoin.MoveIn();
                break;
            case 'ticket':
                await this.nUITicket.MoveIn();
                break;
        }
    }
}
