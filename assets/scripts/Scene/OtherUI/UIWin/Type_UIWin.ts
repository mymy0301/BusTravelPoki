import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export type typeUIWin = 'Normal' | 'Hard' | 'SupperHard';

export interface ParamCustomUIWin {
    level: number;
    time: number;
    car: number;
    passenger: number;
    building: number;
    coin: number;
    typeUI: typeUIWin;
}


