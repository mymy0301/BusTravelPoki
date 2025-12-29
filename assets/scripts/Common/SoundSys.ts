import { _decorator, AudioClip, AudioSource, Component, director, Node, EventTarget, resources, log } from 'cc';
import { PlayerData } from '../Utils/PlayerData';
import { GameMusicDisplay, GameSoundEffect } from '../Utils/Types';
import { ResourceUtils } from '../Utils/ResourceUtils';
import { MConst } from '../Const/MConst';
import { SoundsComboMerge } from './Sounds/SoundsComboMerge';
import { MConfigResourceUtils } from '../Utils/MConfigResourceUtils';
import { SoundComboPass_move_on_car } from './Sounds/SoundComboPass_move_on_car';
const { ccclass, property } = _decorator;

@ccclass('SoundSys')
export class SoundSys extends Component {
    public static Instance: SoundSys;

    private _musicBackground: AudioSource = null;
    private _soundEffBackground: AudioSource = null;

    private _soundEffStatus: boolean = true; public get getSoundEffStatus(): boolean { return this._soundEffStatus; }
    private _musicStatus: boolean = true; public get getMusicStatus(): boolean { return this._musicStatus; }

    private _soundEffComboMerge: SoundsComboMerge = new SoundsComboMerge();
    private _soundEffComboPass_move_on_car: SoundComboPass_move_on_car = new SoundComboPass_move_on_car();

    protected onLoad(): void {
        if (SoundSys.Instance == null) {
            SoundSys.Instance = this;
            director.addPersistRootNode(this.node);

            let listAudioSource = this.node.getComponents(AudioSource);
            this._soundEffBackground = listAudioSource[0];
            this._musicBackground = listAudioSource[1];
        } else {
            this.node.destroy();
        }
    }

    public updateStateSound(_soundEffStatus: boolean, _musicStatus: boolean) {
        this._soundEffStatus = _soundEffStatus;
        this._musicStatus = _musicStatus;
    }

    public playMusic(whichMusic: GameMusicDisplay, volume = 1) {
        if (!this._musicStatus || !MConfigResourceUtils.isLoadDoneBundle_BACKGROUND) return;
        // MConsolLog.Log('play music...',whichMusic);
        ResourceUtils.loadAudioClip_Bundle(whichMusic, MConst.BUNDLE_SOUND, (error, path, clip) => {
            if (error) return;
            this._musicBackground.stop();
            //play sound
            this._musicBackground.clip = clip;
            this._musicBackground.loop = true;
            this._musicBackground.volume = volume;
            this._musicBackground.play();
        })
    }

    public playSoundEffectOneShot(whichSound: GameSoundEffect, volume: number = 1) {
        // console.log('play sound...', whichSound);
        if (!this._soundEffStatus || !MConfigResourceUtils.isLoadDoneBundle_AUDIO) return;
        // MConsolLog.Log('play sound...',whichSound);
        ResourceUtils.loadAudioClip_Bundle(whichSound, MConst.BUNDLE_EFFECT, (error, path, clip) => {
            if (error) return;

            //play sound
            // this._soundEffBackground.clip = null;
            // this._soundEffBackground.loop = false;
            this._soundEffBackground.playOneShot(clip, volume);
        })
    }

    public playSoundEffectOneShot_Path(whichSound: string, volume: number = 1) {
        if (!this._soundEffStatus || !MConfigResourceUtils.isLoadDoneBundle_AUDIO) return;
        // MConsolLog.Log('play sound...',whichSound);
        
        ResourceUtils.loadAudioClip_Bundle(whichSound, MConst.BUNDLE_EFFECT, (error, path, clip) => {
            console.log(whichSound,error);
            if (error) return;

            //play sound
            // this._soundEffBackground.clip = null;
            // this._soundEffBackground.loop = false;
            this._soundEffBackground.playOneShot(clip, volume);
        })
    }

    public playSoundEffectOneShotDelayTime(whichSound: GameSoundEffect, volume: number = 1, delayTime: number = 0) {
        if (!this._soundEffStatus || !MConfigResourceUtils.isLoadDoneBundle_AUDIO) return;
        this.scheduleOnce(() => {
            // MConsolLog.Log('play sound...',whichSound);
            ResourceUtils.loadAudioClip_Bundle(whichSound, MConst.BUNDLE_EFFECT, (error, path, clip) => {
                if (error) return;

                //play sound
                // this._soundEffBackground.clip = null;
                // this._soundEffBackground.loop = false;
                this._soundEffBackground.playOneShot(clip, volume);
            })
        }, delayTime);

    }

    /**
     * 
     * @param whichSound GameSoundEffect
     * @param volume : 0 -> 1
     * @returns 
     */
    public playSoundEffect(whichSound: GameSoundEffect, volume: number = 1) {
        if (!this._soundEffStatus || !MConfigResourceUtils.isLoadDoneBundle_AUDIO) return;

        ResourceUtils.loadAudioClip_Bundle(whichSound, MConst.BUNDLE_EFFECT, (error, path, clip) => {
            if (error) return;
            //play sound
            this._soundEffBackground.clip = clip;
            this._soundEffBackground.volume = volume;
            this._soundEffBackground.loop = false;
            this._soundEffBackground.play();
        })
    }

    public playSoundEffectWithLoop(whichSound: GameSoundEffect, volumn: number = 1) {
        if (!this._soundEffStatus || !MConfigResourceUtils.isLoadDoneBundle_AUDIO) return;

        ResourceUtils.loadAudioClip_Bundle(whichSound, MConst.BUNDLE_EFFECT, (error, path, clip) => {
            if (error) return;
            console.log("playSoundEffectWithLoop", whichSound);
            //play sound
            this._soundEffBackground.stop();
            this._soundEffBackground.clip = clip;
            this._soundEffBackground.volume = volumn;
            this._soundEffBackground.loop = true;
            this._soundEffBackground.play();
        })
    }

    public changeStateEffect() {
        this.stopSoundEffect();
        this._soundEffStatus = !this._soundEffStatus
        PlayerData.Instance._soundEffStatus = this._soundEffStatus;
        PlayerData.Instance.SaveSettingStatus();
    }

    public changeStateMusic() {
        this.stopMusic();
        this._musicStatus = !this._musicStatus
        PlayerData.Instance._musicStatus = this._musicStatus;
        PlayerData.Instance.SaveSettingStatus();
    }

    public stopSoundEffectWithNameSound(whichSound: GameSoundEffect) {
        // console.log("stop sound ", whichSound);

        ResourceUtils.loadAudioClip_Bundle(whichSound, MConst.BUNDLE_EFFECT, (error, path, clip) => {
            if (error || this._soundEffBackground.clip == null) return;
            //play sound
            if (this._soundEffBackground.clip == clip) {
                this._soundEffBackground.stop();
            }
        })
    }

    public pauseSoundShowAd() {
        this.pauseSoundEffect();
        this.pauseMusic();
    }

    public resumeSoundShowAd() {
        this.resumeSoundEffect();
        this.resumeMusic();
    }

    public stopSoundLoop() {
        // console.log("stopSoundLoop");
        this._soundEffBackground.loop = false;
        this.stopSoundEffect();
    }

    public async GetTimeSound(whichSound: GameSoundEffect): Promise<number> {
        if (!MConfigResourceUtils.isLoadDoneBundle_AUDIO) return -1;

        return new Promise((resolve, reject) => {
            ResourceUtils.loadAudioClip_Bundle(whichSound, MConst.BUNDLE_EFFECT, (error, path, clip) => {
                if (error || !clip) {
                    reject(-1);  // Reject if there's an error or no clip
                    return;
                }
                const result = clip.getDuration();
                // console.log("GetTimeSound", result);
                resolve(result);  // Resolve with the duration
            });
        });
    }

    //#region play sound combo
    public playSoundEffectComboMerge(volumn: number = 1) {
        this._soundEffComboMerge.playSoundEffectCombo(this._soundEffStatus, this._soundEffBackground, volumn);
    }

    public resetSoundEffectComboMerge() {
        this._soundEffComboMerge.resetSoundEffectCombo();
    }

    public playSoundEffectComboPass_move_on_car(volumn: number = 1) {
        this._soundEffComboPass_move_on_car.playSoundEffectCombo(this._soundEffStatus, this._soundEffBackground, volumn);
    }

    public resetSoundEffectComboPass_move_on_car() {
        this._soundEffComboPass_move_on_car.resetSoundEffectCombo();
    }
    //#endregion play sound combo  

    //#region self func
    public pauseMusic() { this._musicBackground.pause(); }
    public resumeMusic() { !this._musicBackground.playing && this._musicBackground.play(); }
    private pauseSoundEffect() { this._soundEffBackground.pause(); }
    private resumeSoundEffect() { this._soundEffBackground.play(); }

    private stopMusic() {
        this._musicBackground.stop();
        this._musicBackground.clip = null;
    }

    private stopSoundEffect() {
        this._soundEffBackground.stop();
        this._soundEffBackground.pause();
        this._soundEffBackground.clip = null;
    }
    //#endregion self func
}