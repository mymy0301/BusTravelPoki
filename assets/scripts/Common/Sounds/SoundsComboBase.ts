import { _decorator, AudioSource, Component, Node } from 'cc';
import { ResourceUtils } from '../../Utils/ResourceUtils';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('SoundsComboBase')
export class SoundsComboBase {
    private indexCombo = 0;
    private _listSoundEffectCombo = [];
    private NAME_DIR_SOUND_COMBO = null;
    private MAX_INDEX_COMBO = -1;

    constructor(nameDirSoundCombo: string, maxIndexCombo: number) {
        this.NAME_DIR_SOUND_COMBO = nameDirSoundCombo;
        this.MAX_INDEX_COMBO = maxIndexCombo;
    }

    public playSoundEffectCombo(soundStatus: boolean, soundEffBackground: AudioSource, volume: number = 1) {
        if (!soundStatus || this.NAME_DIR_SOUND_COMBO == null || this.MAX_INDEX_COMBO == -1) return;
        if (this._listSoundEffectCombo[this.indexCombo] == null) {
            const pathAudioCombo = `${this.NAME_DIR_SOUND_COMBO}${this.indexCombo}`;
            ResourceUtils.loadAudioClip_Bundle(pathAudioCombo, MConst.BUNDLE_EFFECT, (error, path, clip) => {
                if (error) return;
                if (clip == null || clip == undefined) {
                    console.warn("clip is null on load audio", pathAudioCombo);
                }
                soundEffBackground.clip = clip;
                this._listSoundEffectCombo[this.indexCombo] = clip;

                //play sound
                soundEffBackground.volume = volume;
                if (clip == null) { console.error("clip is null"); return; }
                soundEffBackground.playOneShot(clip);
            })
        } else {
            soundEffBackground.clip = this._listSoundEffectCombo[this.indexCombo];
            //play sound
            soundEffBackground.volume = volume;
            if (this._listSoundEffectCombo[this.indexCombo] == null) { console.warn("clip is null", this.indexCombo, this.NAME_DIR_SOUND_COMBO); return; }
            soundEffBackground.playOneShot(this._listSoundEffectCombo[this.indexCombo]);
        }

        // increase the indexCombo
        this.indexCombo += 1; if (this.indexCombo == this.MAX_INDEX_COMBO) this.indexCombo = 0;
        // console.log("111111111", this.indexCombo);
    }

    public resetSoundEffectCombo() {
        this.indexCombo = 0;
    }
}




