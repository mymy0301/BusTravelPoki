import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DayDailyInfo')
export class DayDailyInfo {
    public day: number = 0;
    public month: number = 0;
    public year: number = 0;
    public isDone: boolean = false;
}


