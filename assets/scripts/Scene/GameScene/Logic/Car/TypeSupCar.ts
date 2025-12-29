import { _decorator, Component } from "cc";
const { ccclass, property } = _decorator;

export interface ISupCar {
    SetUp(...args: any[]): void;
    PlayAnimUnlock(...args: any[]): Promise<void>
    Show(): void;
    Hide(): void;
}


