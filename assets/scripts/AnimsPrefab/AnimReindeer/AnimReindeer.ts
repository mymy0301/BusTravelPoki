/**
 * 
 * anhngoxitin01
 * Thu Nov 27 2025 14:53:16 GMT+0700 (Indochina Time)
 * AnimReindeer
 * db://assets/scripts/AnimsPrefab/AnimReindeer/AnimReindeer.ts
*
*/
import { _decorator, Component, Node, Vec3 } from 'cc';
import { AnimPrefabsBase } from '../AnimPrefabBase';
import { DIRECT_CAR } from '../../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('AnimReindeer')
export class AnimReindeer extends AnimPrefabsBase {
    public PlayAnimCarReindeer(direction: DIRECT_CAR, type: 'run' | 'idle') {
        this.node.scale = Vec3.ONE.clone()
        this.MEffect.node.position = posDefault;
        switch (direction) {
            case DIRECT_CAR.RIGHT: case DIRECT_CAR.LEFT:
                this.PlayAnim(`goc1_${type}`, true);
                this.node.scale = new Vec3(-1, 1, 1)
                break;
            case DIRECT_CAR.TOP:
                this.PlayAnim(`goc2_${type}`, true);
                break;
            case DIRECT_CAR.BOTTOM:
                this.PlayAnim(`goc3_${type}`, true);
                break;
            case DIRECT_CAR.BOTTOM_LEFT: case DIRECT_CAR.BOTTOM_RIGHT:
                this.PlayAnim(`goc4_${type}`, true);
                this.MEffect.node.position = posBottomLeft;
                break;
            case DIRECT_CAR.TOP_RIGHT: case DIRECT_CAR.TOP_LEFT:
                this.PlayAnim(`goc5_${type}`, true);
                this.node.scale = new Vec3(-1, 1, 1);
                this.MEffect.node.position = posTopRight;
                break;
            default:
                console.log(`goc6_${type}`);
                this.PlayAnim(`goc6_${type}`, true);
                this.node.scale = new Vec3(-1, 1, 1);
                break;
        }
        return;
    }
}

const posDefault = Vec3.ZERO.clone();
const posBottomLeft = new Vec3(0.346, 0.175, 0);
const posTopRight = new Vec3(37.305, 5.621, 0);