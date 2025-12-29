import { _decorator, Component, Node } from 'cc';
import { UIBaseSys } from '../../../Common/UIBaseSys';
import { SoundSys } from '../../../Common/SoundSys';
import { ChangeSceneSys, TYPE_SCENE_USING } from '../../../Common/ChangeSceneSys';
import { GameMusicDisplay } from '../../../Utils/Types';
import { clientEvent } from '../../../framework/clientEvent';
import { MConst, TYPE_UI } from '../../../Const/MConst';
import { UISetting_CustomToggle } from './UISetting_CustomToggle';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { UISetting_join_follow } from './UISetting_join_follow';
import { PlayerData } from '../../../Utils/PlayerData';
import { LogEventManager } from '../../../LogEvent/LogEventManager';
import { GameManager } from '../../GameManager';
import { TYPE_GAME } from '../../../Configs/MConfigs';
const { ccclass, property } = _decorator;

@ccclass('UISetting')
export class UISetting extends UIBaseSys {
    @property(UISetting_CustomToggle) toggleMusic: UISetting_CustomToggle;
    @property(UISetting_CustomToggle) toggleEffect: UISetting_CustomToggle;
    @property(UISetting_join_follow) joinButton: UISetting_join_follow;
    @property(UISetting_join_follow) followButton: UISetting_join_follow;

    protected onLoad(): void {
        const stateEffect = SoundSys.Instance.getSoundEffStatus;
        const stateMusic = SoundSys.Instance.getMusicStatus;

        this.toggleMusic.SetUp(stateMusic);
        this.toggleEffect.SetUp(stateEffect);
    }

    //#region button
    private async onBtnChangeStateEffect() {
        SoundSys.Instance.changeStateEffect();
        const statusNow = SoundSys.Instance.getSoundEffStatus;
        LogEventManager.Instance.logButtonClick(`effect_${statusNow}`, "UISetting");

        // update effect
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        await this.toggleEffect.AnimChangeSetting(statusNow);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    private async onBtnChangeStateMusic() {
        SoundSys.Instance.changeStateMusic();
        if (ChangeSceneSys.Instance.GetTypeSceneUsing() == TYPE_SCENE_USING.LOBBY) {
            SoundSys.Instance.playMusic(GameMusicDisplay.MUSIC_BACKGROUND_LOOBY);
        } else {
            SoundSys.Instance.playMusic(GameManager.Instance.TypeGamePlay == TYPE_GAME.CHRISTMAS ? GameMusicDisplay.MUSIC_BACKGROUND_CHRIST : GameMusicDisplay.MUSIC_BACKGROUND_GAMEPLAY);
        }
        const statusNow = SoundSys.Instance.getMusicStatus;
        LogEventManager.Instance.logButtonClick(`music_${statusNow}`, "UISetting");

        // update effect
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.SHOW_BLOCK_LOBBY);
        await this.toggleMusic.AnimChangeSetting(statusNow);
        clientEvent.dispatchEvent(MConst.EVENT.BLOCK_UI.HIDE_BLOCK_LOBBY);
    }

    // private onBtnChangeStateVibration() {
    //     PlayerData.Instance._vibrationStatus = !PlayerData.Instance._vibrationStatus;
    //     PlayerData.Instance.SaveSettingStatus();

    //     this.visualBtnVibration.ChangeVisual(PlayerData.Instance._vibrationStatus);
    // }

    private onBtnClose() {
        LogEventManager.Instance.logButtonClick(`close`, "UISetting");
        clientEvent.dispatchEvent(MConst.EVENT.CLOSE_UI, TYPE_UI.UI_SETTING, 1);
    }

    private async onBtnJoinGroup() {
        LogEventManager.Instance.logButtonClick(`join_group`, "UISetting");

        FBInstantManager.Instance.joinOfficialGroup();
        // await this.joinButton.AnimReceivePrize();
    }

    private async onBtnFollowPage() {
        LogEventManager.Instance.logButtonClick(`follow_page`, "UISetting");

        FBInstantManager.Instance.followOfficialPage();
        // await this.followButton.AnimReceivePrize();
    }

    private async onBtnResetData() {
        PlayerData.Instance.ResetData();
        clientEvent.dispatchEvent(MConst.FB_SHOW_NOTIFICATION_NO_BLOCK, "Reset data successfully!\nPlease restart the game.");
    }
    //#endregion button
}


