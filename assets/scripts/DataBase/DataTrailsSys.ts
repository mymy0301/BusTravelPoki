import { _decorator, Color, Component, Node } from 'cc';
import { EVENT_CUSTOMS, IInfoTrailJson } from '../Utils/Types/TypeCustoms';
import { ReadDataJson, ReadJsonOptimized } from '../ReadDataJson';
import * as dataJsonTrails from '../MJson/JsonTrails.json';
import { clientEvent } from '../framework/clientEvent';
import { IPrize } from '../Utils/Types';
import { PlayerData } from '../Utils/PlayerData';
import { TypeTrail } from '../Scene/GameScene/Trail/TypeTrail';
const { ccclass, property } = _decorator;

@ccclass('DataTrailsSys')
export class DataTrailsSys {
    public static Instance: DataTrailsSys = null;

    private _listDataTrails: IInfoTrailJson[] = [];

    constructor() {
        if (DataTrailsSys.Instance == null) {
            DataTrailsSys.Instance = this;
            this.readDataFromJson();

            // listen event
            clientEvent.on(EVENT_CUSTOMS.TRAIL.UPDATE_PROGRESS, this.UpdateProgressTrail, this);
            clientEvent.on(EVENT_CUSTOMS.TRAIL.CHOICE_TRAIL, this.ChoiceTrail, this);
        }
    }

    private readDataFromJson() {
        let dataTrails = dataJsonTrails["default"]["TRAILS"];

        for (let i = 0; i < dataTrails.length; i++) {
            let newIInfoTrail: IInfoTrailJson = {
                Id: "",
                Name: '',
                RequireEachProgress: []
            };

            const dataRead: any = dataTrails[i];

            // read data
            newIInfoTrail.Id = dataRead.Id;
            newIInfoTrail.Name = dataRead.Name;
            for (let indexRequire = 0; indexRequire < dataRead.RequireEachProgress.length; indexRequire++) {
                const requireCheck = dataRead.RequireEachProgress[indexRequire];
                const listIPrizeReuqire: IPrize[] = ReadJsonOptimized(requireCheck);
                newIInfoTrail.RequireEachProgress.push(listIPrizeReuqire);
            }

            // console.log("newIInfoTrail", newIInfoTrail);

            // push data
            this._listDataTrails.push(newIInfoTrail);
        }

        // console.log("read trail", this._listDataTrails);
    }

    public GetListTrails(): IInfoTrailJson[] {
        return Array.from(this._listDataTrails);
    }

    public GetProgressTrails(idTrail: string): number {
        const listCustomCheck = PlayerData.Instance._customs_trail_listProgressTrail;
        /**
         * get the old progress choice  
         * if not found add new in data
        */
        if (listCustomCheck.size > 0) {
            for (const [key, value] of listCustomCheck) {
                if (key == idTrail) {
                    return value;
                }
            }
        }

        // in case not found => add new data and return 0
        // you can custom more in here if you need special type

        PlayerData.Instance._customs_trail_listProgressTrail.set(idTrail, 0);
        PlayerData.Instance.SaveCustoms();
        return 0;
    }

    public GetIdTrailChoice(): string {
        return PlayerData.Instance._customs_trail_idChoice;
    }

    //#region Custom infoTrailByData
    public GetColorTrailByData(idTrail: string): Color {
        switch (idTrail) {
            case TypeTrail.BASIC_TRAIL_GRAY: return Color.GRAY;
            case TypeTrail.BASIC_TRAIL_BLACK: return Color.BLACK;
        }
        return Color.WHITE;
    }
    //#endregion Custom infoTrailByData

    //#region func listen
    private UpdateProgressTrail(idTrail: string, numProgress: number = 1) {
        const listCustomCheck = PlayerData.Instance._customs_trail_listProgressTrail;
        /**
         * get the old progress choice  
         * if not found add new in data
        */
        if (listCustomCheck.size > 0) {
            for (const [key, value] of listCustomCheck) {
                if (key == idTrail) {
                    PlayerData.Instance._customs_trail_listProgressTrail.set(key, value + numProgress);
                    PlayerData.Instance.SaveCustoms();
                    return;
                }
            }
        }

        // in case not found => add new data and set numProgress to it
        // you can custom more in here if you need special type
        PlayerData.Instance._customs_trail_listProgressTrail.set(idTrail, numProgress);
        PlayerData.Instance.SaveCustoms();
    }

    private ChoiceTrail(idTrail: string) {
        PlayerData.Instance._customs_trail_idChoice = idTrail;
        PlayerData.Instance.SaveCustoms();
    }
    //#endregion func listen
}


