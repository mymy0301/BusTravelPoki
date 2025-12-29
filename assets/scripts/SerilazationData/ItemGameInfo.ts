import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemGameInfo')
export class ItemGameInfo {
    numItem: number;
    timeEnd: number;

    constructor() {
        this.numItem = 0;
        this.timeEnd = -1;
    }

    public getJSONSave():string{
        return `${this.numItem},${this.timeEnd}`;
    }

    public convertJsonToData(json:string){
        let dataSplit = json.split(',');
        this.numItem = Number.parseInt(dataSplit[0]);
        this.timeEnd = Number.parseInt(dataSplit[1]);
    }
}


