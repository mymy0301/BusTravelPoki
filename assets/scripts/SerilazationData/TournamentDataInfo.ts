import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TournamentDataInfo')
export class TournamentDataInfo extends Component {
    ID: number;
    tournamentID:string;
    contextID:string;
    nameLeaderboard:string;
    rewardType:number = -1;
    startTime:number;
    endTime:number;
    title:string;
    des:string;
    time:number = -1;
    type:number = 0;   // 0: normal + time || 1:no rules + time || 2: puzzle + time || 3: race top + no time
}


