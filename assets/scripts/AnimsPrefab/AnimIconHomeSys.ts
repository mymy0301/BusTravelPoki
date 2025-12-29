import { _decorator, Component, Material, Node } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimIconHomeSys')
export class AnimIconHomeSys extends AnimPrefabsBase {
    @property(Material) matGrayIcon: Material;

    private _listCbTriggerOnEnable: CallableFunction[] = [];

    protected onEnable(): void {
        this._listCbTriggerOnEnable.forEach(cb => cb != null && cb());
    }

    public SetGrayIcon() {
        this.MEffect.customMaterial = this.matGrayIcon;
    }

    public SetUnGrayIcon() {
        this.MEffect.customMaterial = null;
    }

    public RegisterTriggerOnEnable(cb: CallableFunction) {
        this._listCbTriggerOnEnable.push(cb);
    }
}

