import { _decorator, Component, Node, Size, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum STATE_INDICATOR {
    Unchoice,
    Choice
}

export const MConfig_TypeMIndicator2 = {
    heigh_bg_choice: 191,
    heigh_bg_unChoice: 116,
    pos_icon_unChoice: new Vec3(0, 18, 0),
    pos_icon_choice: new Vec3(0, 0, 0),
    speed_tween: 0.25,
    ratioChoiceAndUnChoice: 1.7,
    width_bg_unChoice: 0,
    diff_width_SfChoice_Bg: 16
}

export function getSizeContainerChoice() {
    return new Size(MConfig_TypeMIndicator2.width_bg_unChoice * MConfig_TypeMIndicator2.ratioChoiceAndUnChoice, MConfig_TypeMIndicator2.heigh_bg_choice);
}

export function getSizeContainerUnChoice() {
    return new Size(MConfig_TypeMIndicator2.width_bg_unChoice, MConfig_TypeMIndicator2.heigh_bg_unChoice);
}

export function getSizeOfSfChoice(sizeNChoice: Size): Size{
    // add the diff to get true size
    return new Size(sizeNChoice.x + MConfig_TypeMIndicator2.diff_width_SfChoice_Bg, sizeNChoice.y);
}