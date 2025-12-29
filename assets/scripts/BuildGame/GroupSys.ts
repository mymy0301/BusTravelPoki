import { _decorator, Component, Node } from 'cc';
import { MConfigBuildGame } from './MConfigBuildGame';
import { JsonGroup, TYPE_USE_JSON_GROUP } from '../Utils/Types';
const { ccclass, property } = _decorator;

@ccclass('GroupSys')
export class GroupSys extends Component {
    public UpdateGroup(type: "swap" | "delete" | "add", idCarChange?: number, idCarSwapTo?: number) {
        // return;
        if (MConfigBuildGame.jsonLevelImport == null || MConfigBuildGame.jsonLevelImport.Group == null) return;

        switch (type) {
            case "swap":
                MConfigBuildGame.jsonLevelImport.Group.forEach((group: JsonGroup) => {
                    group.listGroups.forEach((listGroup: number[], index: number) => {
                        const indexId1: number = listGroup.indexOf(idCarChange);
                        const indexId2: number = listGroup.indexOf(idCarSwapTo);
                        if (indexId1 != -1) {
                            listGroup.splice(indexId1, 1, idCarSwapTo);
                        }
                        if (indexId2 != -1) {
                            listGroup.splice(indexId2, 1, idCarChange);
                        }
                    })
                })
                break;
            case "delete":
                MConfigBuildGame.jsonLevelImport.Group.forEach((group: JsonGroup) => {
                    // duyệt toàn bộ các group để loại bỏ id xe ko dùng nữa
                    group.listGroups.forEach((listGroup: number[], index: number) => {
                        const indexId: number = listGroup.indexOf(idCarChange);
                        // nếu nhu trong group con của group có id xe thì sẽ loại bỏ id xe đấy đi khỏi group đó
                        if (indexId != -1) {
                            listGroup.splice(indexId, 1);
                        }

                        // nếu như listGroup ko còn phần tử nào thì nỏ phần từ đó đi
                        if (listGroup.length == 0) {
                            group.listGroups.splice(index, 1);
                        }
                    })

                    // cập nhật lại id của toàn bộ các xe có id lớn hơn lùi về một đơn vị
                    group.listGroups.forEach((listGroup: number[], index: number) => {
                        listGroup.forEach((idCheck, index) => {
                            if (idCheck > idCarChange) {
                                listGroup[index] = idCheck - 1;
                            }
                        })
                    })
                })
                break;
            case "add":
                if (MConfigBuildGame.jsonLevelImport.Group == null) {
                    MConfigBuildGame.jsonLevelImport.Group = [];
                }

                // check in case no group => auto add 1 group into it
                if (MConfigBuildGame.jsonLevelImport.Group.length == 0) {
                    MConfigBuildGame.jsonLevelImport.Group.push({
                        typeUse: TYPE_USE_JSON_GROUP.USE_FIRST,
                        numberLose: 2,
                        listGroups: [[idCarChange]]
                    })

                } else {
                    MConfigBuildGame.jsonLevelImport.Group.forEach((group: JsonGroup) => {
                        group.listGroups.push([idCarChange]);
                    });
                }
                break;
        }
    }

    public ReverseGroup() {
        if (MConfigBuildGame.jsonLevelImport == null || MConfigBuildGame.jsonLevelImport.Group == null || MConfigBuildGame.jsonLevelImport.Group.length == 0) return;

        //reverse group json
        MConfigBuildGame.jsonLevelImport.Group.forEach((group: JsonGroup) => {
            group.listGroups = group.listGroups.reverse();
        })
    }
}


