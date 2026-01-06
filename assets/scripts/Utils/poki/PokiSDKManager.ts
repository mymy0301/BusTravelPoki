import { _decorator, Component, director, Node } from 'cc';
import { FBIntanstAd_Callback } from '../facebooks/FbInstanceManager';
import { MConfigFacebook } from '../../Configs/MConfigFacebook';
import { SoundSys } from '../../Common/SoundSys';
import { clientEvent } from '../../framework/clientEvent';
import { MConst } from '../../Const/MConst';
const { ccclass, property } = _decorator;

@ccclass('PokiSDKManager')
export class PokiSDKManager extends Component {
    public static Instance: PokiSDKManager;
    protected onLoad(): void {
        if (PokiSDKManager.Instance == null) {
            PokiSDKManager.Instance = this;
        }
        director.addPersistRootNode(this.node);
    }
    
    setGameStart(){
        console.error("-----------------------------setGameStart");
        if(typeof PokiSDK === 'undefined') return;
        PokiSDK.gameplayStart();
    }

    setGameStop(){
        console.error("-----------------------------setGameStop");
        if(typeof PokiSDK === 'undefined') return;
        PokiSDK.gameplayStop();
    }

    fb_InterstitialAd_CallBack: FBIntanstAd_Callback = null;
    public Show_InterstitialAdAsync(location: string, cb?: FBIntanstAd_Callback) {
        if(typeof PokiSDK === 'undefined') {
            cb(null, MConst.FB_INTERSTITIAL_CALLBACK_SUCCESS);
            return;
        };
        let self = this;
        self.fb_InterstitialAd_CallBack = cb;
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        if (this.isShowInterstitialAd) {
            // pause your game here if it isn't already
            PokiSDK.commercialBreak(() => {
                // you can pause any background music or other audio here
                SoundSys.Instance.pauseSoundShowAd();
            }).then(() => {
                console.log("Commercial break finished, proceeding to game");
                // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
                // continue your game here
                SoundSys.Instance.resumeSoundShowAd();
                self.SetNextTime_ShowInterstitialAd();
                cb(null, MConst.FB_INTERSTITIAL_CALLBACK_SUCCESS);
            });
        }else{
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
            self.fb_InterstitialAd_CallBack(new Error("next TIME!"), MConst.FB_INTERSTITIAL_CALLBACK_FAIL);
        }
    }

    private isShowInterstitialAd = true;
    private SetNextTime_ShowInterstitialAd() {
            // console.log(this.TIME_NEXT_INTERSTITIAL);
        this.isShowInterstitialAd = false;
        this.scheduleOnce(function () {
            // Here `this` is referring to the component
            this.isShowInterstitialAd = true;
        }, MConfigFacebook.Instance.TIME_NEXT_INTERSTITIAL);
    }


    fb_RewardVideo_CallBack: FBIntanstAd_Callback = null;
    Show_RewardedVideoAsync(location: string, button_name: string, cb?: FBIntanstAd_Callback) {
        if(typeof PokiSDK === 'undefined'){
            console.log("PokiSDK not init");
            cb(null, MConst.FB_REWARD_CALLBACK_SUCCESS);
            return;
        };
        let self = this;
        self.fb_RewardVideo_CallBack = cb;
        clientEvent.dispatchEvent(MConst.SHOW_LOADING_AD_POPUP);
        clientEvent.dispatchEvent(MConst.EVENT.PAUSE_TIME);
        // pause your game here if it isn't already
        PokiSDK.rewardedBreak(() => {
            // you can pause any background music or other audio here
            SoundSys.Instance.pauseSoundShowAd();
        }).then((success) => {
            SoundSys.Instance.resumeSoundShowAd();
            clientEvent.dispatchEvent(MConst.EVENT.RESUME_TIME);
            clientEvent.dispatchEvent(MConst.HIDE_LOADING_AD_POPUP);
            if (success) {
                // video was displayed, give reward
                self.SetNextTime_ShowInterstitialAd_AfterReward();
                self.fb_RewardVideo_CallBack(null, MConst.FB_REWARD_CALLBACK_SUCCESS);
            } else {
                // video not displayed, should not give reward
                self.fb_RewardVideo_CallBack(new Error("load FAIL"), MConst.FB_REWARD_CALLBACK_FAIL);
            }
            // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
            console.log("Rewarded break finished, proceeding to game");
            // continue your game here
        });
    }

    private SetNextTime_ShowInterstitialAd_AfterReward() {
        // console.log(this.TIME_NEXT_INTERSTITIAL);
        this.isShowInterstitialAd = false;
        this.scheduleOnce(function () {
            // Here `this` is referring to the component
            this.isShowInterstitialAd = true;
        }, MConfigFacebook.Instance.TIME_NEXT_INTERSTITIAL_AFTERREWARD);
    }
}


