import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomButton')
export class CustomButton extends Button {
    override get zoomScale(): number {
        return 10;
    }
    override set zoomScale(value: number) {
        super.zoomScale = value;
    }
}


