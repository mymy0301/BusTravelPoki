import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface IUIShareBase {
    SetUp(data: any): Promise<void>;
}

@ccclass('UIShareBase')
export class UIShareBase extends Component {
    private _iUIShare: IUIShareBase = null; public get iUIShare(): IUIShareBase { return this._iUIShare; }

    public Init(iUIShare: IUIShareBase) {
        this._iUIShare = iUIShare;
    }
}


