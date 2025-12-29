import { _decorator, Component, EditBox, Label, Node } from 'cc';
import { DataSkyLiftSys } from '../../DataBase/DataSkyLiftSys';
import { CONFIG_HAT_RACE } from '../../Scene/OtherUI/UIChristmasEvent/HatRace/TypeHatRace';
import { DataHatRace_christ } from '../../DataBase/DataHatRace_christ';
const { ccclass, property } = _decorator;

@ccclass('ItemCheatHatRace')
export class ItemCheatHatRace extends Component {
    @property(EditBox) edbProgressEvent: EditBox;
    @property(EditBox) edbStreakEvent: EditBox;
    @property(EditBox) edbScoreAddBot: EditBox;
    //==========================================
    //#region btn
    private OnBtnChangeProgressEvent() {
        try {
            const input = this.edbProgressEvent.string;
            if (input == '') { throw ('empty input') }
            const newProgress = Number.parseInt(input);
            DataHatRace_christ.Instance.CheatForceChangeProgress(newProgress);
        } catch (e) {
            console.error(e);
        }
    }

    private OnBtnChangeStreak() {
        try {
            const input = this.edbStreakEvent.string;
            if (input == '') { throw ('empty input') }
            const newStreak = Number.parseInt(input);
            if (newStreak < -1 || newStreak > CONFIG_HAT_RACE.MULTIPLIER.length) { throw (`input wrong`) }
            DataHatRace_christ.Instance.CheatForceChangeStreak(newStreak);
        } catch (e) {
            console.error(e);
        }
    }

    private OnBtnCheatIncreaseAllBot() {
        try {
            const input = this.edbScoreAddBot.string;
            if (input == '') { throw ('empty input') }
            const newScore = Number.parseInt(input);
            if (newScore < 0) { throw (`input wrong`) }
            DataHatRace_christ.Instance.CheatAddScoreForBot(newScore);
        } catch (e) {
            console.error(e);
        }
    }
    //#endregion btn
    //==========================================
}