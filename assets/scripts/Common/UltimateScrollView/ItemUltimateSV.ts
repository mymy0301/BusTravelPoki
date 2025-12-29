import { _decorator, Component, Label, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemUltimateSV')
export class ItemUltimateSV extends Component {
    private _cbShowAnchor: CallableFunction = null;
    private _cbHideAnchor: CallableFunction = null;
    private _cbIsPlayer: CallableFunction = null;
    private _isAnchor: boolean = false;
    private _data: any = null;

    public SetUpData_ItemUltimateSV(data: any, isAnchor: boolean, cbIsPlayer: CallableFunction, cbShowAnchor: CallableFunction, cbHideAnchor: CallableFunction) {
        this._cbShowAnchor = cbShowAnchor;
        this._cbHideAnchor = cbHideAnchor;
        this._cbIsPlayer = cbIsPlayer;
        this._isAnchor = isAnchor;
        this._data = data;

        if (this._cbIsPlayer != null && this._cbIsPlayer(this._data) && cbShowAnchor != null && !this._isAnchor) {
            this._cbHideAnchor();
        }
    }

    protected onDisable(): void {
        // check is player to hide anchor
        if (this._cbIsPlayer != null && this._cbIsPlayer(this._data) && this._cbHideAnchor != null && !this._isAnchor) {
            this._cbShowAnchor();
        }
        this._data = null;
    }
}


