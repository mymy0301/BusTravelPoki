import { _decorator, Component, Node } from 'cc';
import { GetMColorByNumber, GetNumberByMColor, JsonPassenger, M_COLOR } from '../../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('InfoPassengerSys')
export class InfoPassengerSys {
    private _data: JsonPassenger = null;

    public Init(data: JsonPassenger) {
        this._data = data;
    }

    //#region get
    public get color(): number {
        if (this._data == null) return null;
        return this._data.color;
    }

    public get colorByMColor(): M_COLOR {
        if (this._data == null) return null;
        return GetMColorByNumber(this._data.color);
    }

    public get IdPass(): number {
        if (this._data != null && this._data.id != null) {
            return this._data.id;
        }

        return -1;
    }
    //#ednregion get

    public SetColorByMColor(colorSet: M_COLOR) {
        this._data.color = GetNumberByMColor(colorSet);
    }
}


