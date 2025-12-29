import { _decorator, Component, Node, randomRangeInt } from 'cc';
import { AnimPrefabsBase } from 'db://assets/scripts/AnimsPrefab/AnimPrefabBase';
import { SoundSys } from 'db://assets/scripts/Common/SoundSys';
import { GameSoundEffect } from 'db://assets/scripts/Utils/Types';
import { Utils } from 'db://assets/scripts/Utils/Utils';
const { ccclass, property } = _decorator;

enum NAME_ANIMATION {
    GREAT = "great",
    NICE = "nice",
    GOOD_JOB = "good_job",
    PERFECT = "perfect",
    AWESOME = "awesome",
    SUPER = "super"
}

@ccclass('FxTextComboSys')
export class FxTextComboSys extends AnimPrefabsBase {
    private _isPlayingAnim: boolean = false;
    private readonly listIndexAnimType1: Array<NAME_ANIMATION> = [
        NAME_ANIMATION.GREAT,
        NAME_ANIMATION.NICE,
    ];
    private readonly listIndexAnimType2: Array<NAME_ANIMATION> = [
        NAME_ANIMATION.GOOD_JOB,
        NAME_ANIMATION.PERFECT,
        NAME_ANIMATION.AWESOME,
        NAME_ANIMATION.SUPER,
    ];
    private _previousAnimType1: NAME_ANIMATION = null;
    private _previousAnimType2: NAME_ANIMATION = null;

    //===============================
    //#region public methods

    private indexComboSound: number = 0;
    public async PlayCombo(typeCombo: number = 1 | 2, cb: CallableFunction) {
        // console.log("play combo fx: ", typeCombo);

        if (this._isPlayingAnim) {
            cb(false);
            return;
        } else {
            try {
                this._isPlayingAnim = true;
                cb(true);

                switch (typeCombo) {
                    case 1: // combo 3
                        await this.PlayCombo3Car();
                        break;
                    case 2: // combo 5
                        await this.PlayCombo5Car();
                        break;
                }

                this._isPlayingAnim = false;
            } catch (e) {
            }
        }
    }

    public StopCombo() {
        this._previousAnimType1 = null;
        this._previousAnimType2 = null;
        this.StopAnim();
    }
    //#endregion public methods
    //===============================

    //===============================
    //#region anim
    private async PlayCombo3Car() {
        this.indexComboSound ++;
        if(this.indexComboSound > 5) this.indexComboSound = 1;

        SoundSys.Instance.playSoundEffectOneShot_Path(GameSoundEffect.SOUND_PRAISE+this.indexComboSound);

        const nameAnimPlay = Utils.randomValueOfList(this.listIndexAnimType1.filter(anim => anim !== this._previousAnimType1));
        this._previousAnimType1 = nameAnimPlay;
        this.PlayAnim(nameAnimPlay);
        await Utils.delay(this.GetTimeAnim(nameAnimPlay));
    }

    private async PlayCombo5Car() {
        this.indexComboSound ++;
        if(this.indexComboSound > 5) this.indexComboSound = 1;

        SoundSys.Instance.playSoundEffectOneShot_Path(GameSoundEffect.SOUND_PRAISE+this.indexComboSound);

        const nameAnimPlay = Utils.randomValueOfList(this.listIndexAnimType2.filter(anim => anim !== this._previousAnimType2));
        this._previousAnimType2 = nameAnimPlay;
        this.PlayAnim(nameAnimPlay);
        await Utils.delay(this.GetTimeAnim(nameAnimPlay));
    }
    //#endregion anim
    //===============================
}