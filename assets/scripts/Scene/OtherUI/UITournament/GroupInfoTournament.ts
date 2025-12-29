import { _decorator, Component, Label, Node, Prefab } from 'cc';
import { TimeInGameTournamentSys } from '../../TimeInGameTournamentSys';
import { GameManager } from '../../GameManager';
const { ccclass, property } = _decorator;

@ccclass('GroupInfoTournament')
export class GroupInfoTournament extends Component {
    @property(Label) lbLevel: Label = null;
    @property(TimeInGameTournamentSys) timeInGameTournamentSys:TimeInGameTournamentSys = null;
    start() {

    }

    update(deltaTime: number) {
        
    }

    initTournament() {
        let indexRound:number = GameManager.Instance.JsonPlayTournament.LEVEL;
        let countRound:number = GameManager.Instance.ModeGame.TOURNAMENT.levels.length;
        this.lbLevel.string = `ROUND ${indexRound}/${countRound}`;
    }

    getTimeTournament() {
        return this.timeInGameTournamentSys.GetTimeTournament();
    }
}


