import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RandomSys')
export class RandomSys {
    public static randomRatio(arrRatios:number[]) {
        let sum = 0;
        for(let i=0; i< arrRatios.length;i++){
            sum += arrRatios[i];
        }

        let r = this.randomFloat(0,sum);
        // console.log(r);
        let count = 0;
        for(let i=0; i< arrRatios.length ;i++){
            count += arrRatios[i];
            if(r < count) return i;
        }
    }

    public static randomFloat(min: number, max: number) {
        var r = Math.random();
        var rr = r * (max - min) + min;
        return rr;
    }
}


