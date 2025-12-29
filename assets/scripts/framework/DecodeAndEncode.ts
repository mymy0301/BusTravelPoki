import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export function EncodeArray(array: any[]): string {
    let result = "";
    for (let i = 0; i < array.length; i++) {
        if (i == array.length - 1)
            result += array[i];
        else
            result += array[i] + ",";
    }
    // console.log("result EndcodeArray", result);
    return result;
}

export function DecodeArray(array: string): unknown[] {
    if (array == "" || array == null) return [];

    let result: string[] = [];
    let data = array.split(",");
    for (let i = 0; i < data.length; i++) {
        const dataSave = data[i];
        // console.log("check each data save", dataSave);
        if (dataSave != '' && dataSave.split('_').length - 1 == 2) {
            result.push(dataSave);
        }
    }
    return result;
}



