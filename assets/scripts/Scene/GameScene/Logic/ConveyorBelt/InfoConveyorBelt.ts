import { _decorator, Component, Node } from 'cc';
import { JsonConveyorBelt } from 'db://assets/scripts/Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('InfoConveyorBelt')
export class InfoConveyorBelt {
    private _info: JsonConveyorBelt = null;
    private _idConveyorBelt: number = -1;

    public Init(info: JsonConveyorBelt, idConveyorBelt: number) {
        this._info = info;
        this._idConveyorBelt = idConveyorBelt;
    }

    public Clear() {
        this._info = null;
        this._idConveyorBelt = -1;
    }

    public get IDConveyorBelt(): number { return this._idConveyorBelt; }

    public get Info(): JsonConveyorBelt { return this._info; }
}


