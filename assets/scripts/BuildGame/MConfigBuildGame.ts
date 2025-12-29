import { _decorator, Component, Node } from 'cc';
import { JsonMapGame, TGroupToLogic } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('MConfigBuildGame')
export class MConfigBuildGame {
    public static jsonLevelImport: JsonMapGame = null;
    public static nameLevelImport: string = "";
    public static listLogicGroup: TGroupToLogic[][] = [];
    public static idLineMapChoice: number = 0;
}