import { _decorator, Component, Node, SpriteFrame } from 'cc';
import {  FriendDataInfo } from '../Utils/Types';
const { ccclass, property } = _decorator;

export enum ENV_TYPE {
    LOCAL,
    GLANCE,
    FB
}

@ccclass('MConfigFacebook')
export class MConfigFacebook {
    public static Instance: MConfigFacebook;

    public envType: ENV_TYPE = ENV_TYPE.FB;

    public playerID: string = "1";
    public playerPhotoURL: string = "https://i.imgur.com/DaoUDiV.png";
    public playerName: string = "Bus";
    public playerCountryCode: string = null;
    public entryPointData = null;

    public signature: string = null;
    public asId: string = null;

    public isSetPlayerDataSuccess: boolean = false;
    public FAN_enable: boolean = true;

    // public arrConnectedPlayerInfos: FBConnectedPlayer[] = [];
    // public arrTempConnectedPlayerInfos: FBConnectedPlayer[] = [];

    public arrConnectedPlayerInfos: FriendDataInfo[] = [];
    public arrTempConnectedPlayerInfos: FriendDataInfo[] = [];

    public TIME_NEXT_INTERSTITIAL: number = 60;
    public TIME_NEXT_INTERSTITIAL_AFTERREWARD: number = 60;
    public TIME_NEXT_RELOAD_BANNER: number = 60;
    public TIMEWAIT_REWARDVIDEO_AD: number = 60;

    constructor() {
        if (MConfigFacebook.Instance == null)
            MConfigFacebook.Instance = this;
    }

    //#region  function for facebook
    public updateDataPlayer(data: string) {
        this.isSetPlayerDataSuccess = true;
    }

    public checkIsMyFriend(idFB: string): boolean {
        return (this.arrConnectedPlayerInfos.findIndex(player => player.id == idFB) >= 0);
    }

    public getFriendbyID
    //#endregion

    //#region for camera shake
    public isVibration: boolean = false;
    //#endregion

    public randomValueOfList(list: any) {
        const randomValue = list[Math.floor(Math.random() * list.length)];
        return randomValue;
    }
}

export type GetBase64Image_Callback = (base64Image: string) => void;


