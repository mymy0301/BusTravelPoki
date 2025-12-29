import { _decorator, Component, Node, Skeleton, sp, Vec3 } from 'cc';
import { AnimPrefabsBase } from '../../../AnimsPrefab/AnimPrefabBase';
const { ccclass, property } = _decorator;

@ccclass('Ske_ConstructorSys')
export class Ske_ConstructorSys extends AnimPrefabsBase {
    /**
     * 
     * @param levelMap 
     * @param indexMC xin hãy lưu ý index này được đánh từ 1
     * @param type 
     * @returns 
     */
    public GetNameEffectProjectToPlay(levelMap: number, indexMC: number, type: 'open' | 'idle' | 'FX'): string {
        let nameType = '';
        switch (type) {
            case 'open': break;
            case 'idle': nameType = '_idle'; break;
            case 'FX': nameType = '_fx'; break;
        }

        return `building${indexMC}${nameType}`;
    }
}