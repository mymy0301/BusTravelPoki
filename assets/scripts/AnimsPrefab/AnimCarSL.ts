/**
 * 
 * dinhquangvinhdev
 * Mon Sep 08 2025 14:27:32 GMT+0700 (Indochina Time)
 * AnimCarSL
 * db://assets/scripts/AnimsPrefab/AnimCarSL.ts
*
*/
import { _decorator, Component, Node } from 'cc';
import { AnimPrefabsBase } from './AnimPrefabBase';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

enum NAME_ANIM_CAR_SL {
    idle = "idle",
    bongbay = "bongbay",
    idle_right = "idle_right",
    oto = "oto",
    upLv = "up_lvl"
}

@ccclass('AnimCarSL')
export class AnimCarSL extends AnimPrefabsBase {
    public PlayAnimIdle() {
        this.StopLoopDefault();
        this.PlayAnimLoop(NAME_ANIM_CAR_SL.idle);
    }
    public async PlayAnimExploreBallong() {
        this.StopLoopDefault();
        this.PlayAnim(NAME_ANIM_CAR_SL.bongbay);
        const timeWait = this.GetTimeAnim(NAME_ANIM_CAR_SL.bongbay) * 1000;
        // console.log(timeWait);
        await Utils.delay(timeWait);
    }
    public PlayAnimIdleRight() {
        this.StopLoopDefault();
        this.PlayAnimLoop(NAME_ANIM_CAR_SL.idle_right);
    }
    public PlayAnimOto() {
        this.StopLoopDefault();
        this.PlayAnim(NAME_ANIM_CAR_SL.oto);
    }

    public PlayAnimUpLv() {
        this.StopLoopDefault();
        this.PlayAnim(NAME_ANIM_CAR_SL.upLv);
    }

    public GetTimeAnimUpLv() {
        return this.GetTimeAnim(NAME_ANIM_CAR_SL.upLv);
    }
}