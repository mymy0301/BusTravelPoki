import { _decorator, Component, Node } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('AnimFxBuilding')
export class AnimFxBuilding extends AnimPrefabsBase {
    public readonly NameAnim = 'building_fx';
}


