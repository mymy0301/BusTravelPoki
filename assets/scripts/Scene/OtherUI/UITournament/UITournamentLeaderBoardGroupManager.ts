import { _decorator, CCInteger, Component, instantiate, Node, Prefab, ScrollView, Size, UITransform, Vec3 } from 'cc';
import { IDataPlayer_LEADERBOARD, IInfoLeaderboardByContextId } from '../../../Utils/server/ServerPegasus';
import { ItemRankTournament } from './ItemRankTournament';
import { DataLeaderboardSys } from '../../DataLeaderboardSys';
import { FBInstantManager } from '../../../Utils/facebooks/FbInstanceManager';
import { IPrize } from '../../../Utils/Types';
import { ReadJsonOptimized } from '../../../ReadDataJson';
import { MConfigFacebook } from '../../../Configs/MConfigFacebook';
const { ccclass, property } = _decorator;

@ccclass('UITournamentLeaderBoardGroupManager')
export class UITournamentLeaderBoardGroupManager extends Component {
    arrIDataPlayer_LEADERBOARDs:IDataPlayer_LEADERBOARD[] = [];
    @property(Node)
    contentGroup:Node;
    
    @property(Prefab)
    itemLeaderBoardPrefab:Prefab;

    @property(CCInteger)
    countShowItem:number = 10;

    @property(CCInteger)
    KC_Y:number = 0;

    @property(CCInteger)
    SIZE_ITEM:number = 110;

    @property(CCInteger)
    CONTENT_HIGHT:number = 816;

    @property(CCInteger)
    posYStart:number = 408;


    arrPoolItems:ItemRankTournament[] = [];
    mapItemBoards:Map<number,ItemRankTournament> = new Map();

    @property(ScrollView)
    scrollView:ScrollView;

    @property(ItemRankTournament)
    myItemLeaderBoard:ItemRankTournament;

    indexMyRank:number = -1;
    isShowMyRank:boolean = false;

    protected onEnable(): void {
        this.scrollView.node.on(ScrollView.EventType.SCROLLING,this.setScrollEvent,this);
    }

    protected onDisable(): void {
        this.scrollView.node.off(ScrollView.EventType.SCROLLING,this.setScrollEvent,this);
    }
    _listIPrizes:IPrize[][] = [];
    initRankGroup(infoLeaderboardByContextId:IInfoLeaderboardByContextId){
        let listIPrizes:IPrize[][] = [];
        // gán dữ liệu cho phần thưởng
        if (infoLeaderboardByContextId.rewards != null) {
            // set up prize
            listIPrizes = infoLeaderboardByContextId.rewards;
        } else if (infoLeaderboardByContextId.data != null) {
            let jsonData = JSON.parse(infoLeaderboardByContextId.data);
            infoLeaderboardByContextId.levels = jsonData.levels;
            for (let i = 0; i < jsonData.rewards.length; i++) {
                let infoPrize = ReadJsonOptimized(jsonData.rewards[i]);
                infoLeaderboardByContextId.rewards.push(infoPrize);
            }
            listIPrizes = infoLeaderboardByContextId.rewards;
        }
        this._listIPrizes = listIPrizes;
        if(this.myItemLeaderBoard){
            this.myItemLeaderBoard.node.active = false;
        }
        this.arrIDataPlayer_LEADERBOARDs = Array.from(DataLeaderboardSys.Instance.GetLeaderboard(infoLeaderboardByContextId.contextId));
        // let indexMyPlayer:number = -1;
        this.indexMyRank = -1;
        for(let i = 0; i < this.arrIDataPlayer_LEADERBOARDs.length;i++){
            if(this.arrIDataPlayer_LEADERBOARDs[i] && this.arrIDataPlayer_LEADERBOARDs[i].playerId == FBInstantManager.Instance.getID()){
                this.indexMyRank = i;
            }
        }

        if(this.indexMyRank == -1){
            let myPlayer:IDataPlayer_LEADERBOARD = {
                rank: this.arrIDataPlayer_LEADERBOARDs.length + 1,
                score: -99999,
                playerId: FBInstantManager.Instance.getID(),
                name: FBInstantManager.Instance.getName(),
                avatar: MConfigFacebook.Instance.playerPhotoURL
            }
            this.arrIDataPlayer_LEADERBOARDs.push(myPlayer);
            this.indexMyRank = this.arrIDataPlayer_LEADERBOARDs.length - 1;
        }

        for(let i = 0; i < this.arrIDataPlayer_LEADERBOARDs.length; i++){
            this.arrIDataPlayer_LEADERBOARDs[i].rank = i+1;
        }
        // let countFriends:number = this.arrIDataPlayer_LEADERBOARDs.length;
        // if(countFriends < 6){
        //     for(let i = 0; i < 6 - countFriends; i++){
        //         this.arrIDataPlayer_LEADERBOARDs.push(null);
        //     }
        // }
        let maxY:number = (this.SIZE_ITEM + this.KC_Y) * this.arrIDataPlayer_LEADERBOARDs.length + 200; 
        this.contentGroup.getComponent(UITransform).setContentSize(new Size(this.CONTENT_HIGHT,maxY));
        this.contentGroup.destroyAllChildren();
        this.contentGroup.setPosition(new Vec3(0,this.posYStart,0));
        this.arrPoolItems = [];
        this.mapItemBoards.clear();
        this.showInitRank();
    }

    resetRankGroup(){
        if(this.myItemLeaderBoard){
            this.myItemLeaderBoard.node.active = false;
        }
        
        this.contentGroup.destroyAllChildren();
        this.arrPoolItems = [];
        this.mapItemBoards.clear();
    }


    getPos_byIndex(_index:number){
        let posY:number = -this.SIZE_ITEM/2 - _index * (this.SIZE_ITEM + this.KC_Y);
        return new Vec3(0,posY,0);
    }

    showInitRank(){
        // console.log("showInitRank",this.arrIDataPlayer_LEADERBOARDs,this.arrIDataPlayer_LEADERBOARDs.length);
        for(let i=0; i< this.countShowItem;i++){
            if(i < this.arrIDataPlayer_LEADERBOARDs.length){
                if(this.arrIDataPlayer_LEADERBOARDs[i] == null) return;
                let item = instantiate(this.itemLeaderBoardPrefab);
                item.setParent(this.contentGroup);
                item.setPosition(this.getPos_byIndex(i));
                let itemEventLeaderBoard:ItemRankTournament = item.getComponent(ItemRankTournament);
                itemEventLeaderBoard.initItem(this.arrIDataPlayer_LEADERBOARDs[i],this._listIPrizes,0.1 * i);
                itemEventLeaderBoard.setIndexPos(i);
                this.arrPoolItems.push(itemEventLeaderBoard);
                this.mapItemBoards.set(i,itemEventLeaderBoard);
            }
        }

        for(let i=0; i< this.arrIDataPlayer_LEADERBOARDs.length;i++){
            if(this.arrIDataPlayer_LEADERBOARDs[i] && this.arrIDataPlayer_LEADERBOARDs[i].playerId == FBInstantManager.Instance.getID()){
                if(this.myItemLeaderBoard){
                    this.myItemLeaderBoard.initItem(this.arrIDataPlayer_LEADERBOARDs[i],this._listIPrizes);
                    this.myItemLeaderBoard.node.active = true;
                }
            }
        }

        if(this.indexMyRank > -1){
            if(this.mapItemBoards.has(this.indexMyRank)){
                this.isShowMyRank = false;
                this.myItemLeaderBoard.node.active = false;
            }else{
                this.isShowMyRank = true;
                this.myItemLeaderBoard.node.active = true;
            }
        }
    }

    updateItemRank(itemLeaderBoard:ItemRankTournament,indexPos:number){
        if(indexPos < this.arrIDataPlayer_LEADERBOARDs.length){
            itemLeaderBoard.node.setPosition(this.getPos_byIndex(indexPos));
            itemLeaderBoard.initItem(this.arrIDataPlayer_LEADERBOARDs[indexPos],this._listIPrizes);
            itemLeaderBoard.setIndexPos(indexPos);
            this.mapItemBoards.set(indexPos,itemLeaderBoard);
            itemLeaderBoard.node.active = true;
        }
    }

    lastIndexPosCenter:number = -1;
    setScrollEvent(){
        // console.log(this.contentGroup.position.y);
        let indexPosCenter:number = Math.floor((this.contentGroup.position.y - this.posYStart + this.CONTENT_HIGHT / 2) /(this.SIZE_ITEM + this.KC_Y));
        if(this.lastIndexPosCenter == indexPosCenter) return;
        this.lastIndexPosCenter = indexPosCenter;
        // console.log("indexPosCenter:----------------------"+indexPosCenter+"----------------------------");
        for(let i= 0; i< this.arrPoolItems.length;i++){
            let itemLeaderBoard:ItemRankTournament = this.arrPoolItems[i];
            if(itemLeaderBoard.node.active){
                if(itemLeaderBoard.indexPos < indexPosCenter - this.countShowItem/2 || itemLeaderBoard.indexPos > indexPosCenter + this.countShowItem/2){
                    // console.log("HIDE ITEM:"+itemLeaderBoard.indexPos);
                    itemLeaderBoard.node.active = false;
                }
            }
        }
        let minY:number = Math.floor(this.countShowItem / 2);
        for(let i = -minY; i < minY + 1; i++){
            let indexPos:number = i + indexPosCenter;
            // console.log("Check : i="+i+"    indexPos="+indexPos);
            if(indexPos >=0 && indexPos < this.arrIDataPlayer_LEADERBOARDs.length){
                if(this.mapItemBoards.has(indexPos)){
                    let itemBoard:ItemRankTournament = this.mapItemBoards.get(indexPos);
                    if(!itemBoard.node.active){
                        itemBoard.node.active = true;
                    }
                }else{
                    let itemRecycle:ItemRankTournament = this.getItemLeaderBoard_Recycle_FromPools();
                    this.mapItemBoards.delete(itemRecycle.indexPos);
                    this.updateItemRank(itemRecycle,indexPos);
                }
            }
        }

        if(this.indexMyRank > -1){
            if(this.mapItemBoards.has(this.indexMyRank) && this.isShowMyRank){
                // console.log("HIDE");
                this.isShowMyRank = false;
                this.myItemLeaderBoard.node.active = false;
            }else if(!this.mapItemBoards.has(this.indexMyRank) && !this.isShowMyRank){
                // console.log("SHOW");
                this.isShowMyRank = true;
                this.myItemLeaderBoard.node.active = true;
            }
        }
    }


    getItemLeaderBoard_Recycle_FromPools(){
        for(let i=0; i< this.arrPoolItems.length;i++){
            if(!this.arrPoolItems[i].node.active){
                return this.arrPoolItems[i];
            }
        }
        // console.error("-------------------------------------------------------------");
        let item = instantiate(this.itemLeaderBoardPrefab);
        let itemLeaderBoard:ItemRankTournament = item.getComponent(ItemRankTournament);
        return itemLeaderBoard;
    }
}


