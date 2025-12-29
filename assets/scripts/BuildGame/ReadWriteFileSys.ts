import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ReadWriteFileSys')
export class ReadWriteFileSys {

    //#region JSON
    static saveFile(text: string, name: string, extention: string) {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(
            new Blob([text], { type: "text/plain" })
        );
        a.download = `${name}.${extention}`;
        a.click();
    }

    static readFile(callback, accept: ".json,text/plain" | ".csv,text/csv" = ".json,text/plain") {
        function readSingleFile(e) {
            var file = e.target.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var contents = e.target.result;
                displayContents(contents, file.name);
            };
            reader.readAsText(file);
        }

        function displayContents(contents, nameFile: string) {
            callback && callback(JSON.parse(contents), nameFile);
        }

        var inputElement = document.createElement("input");
        inputElement.type = "file";
        inputElement.accept = accept;
        if (typeof readSingleFile === "function") {
            inputElement.addEventListener("change", readSingleFile);
        }
        inputElement.dispatchEvent(new MouseEvent("click"));
    }
    //#region JSON

    //#region Excel
    static saveAsCSV(resultPassengerBeforeBuild: string, ReversePassengerBeforeBuild: string, resultCarBeforeBuild: string, resultGroupBeforeBuild: string,
        resultCarInGaraBeforeBuild: string, resultCarInConveyorBeforeBuild: string, resultPassengerBuild: string,
        RevertPassengerBuild: string, resultCarBuild: string, resultCarInGaraBuild: string, resultCarInConveyorBuild: string, fileName: string): void {

        const csvRows: string[] = [];

        //#region data JsonCar
        csvRows.push("BEFORE BUILD\n");

        csvRows.push("resultPassengerBeforeBuild");
        csvRows.push(resultPassengerBeforeBuild); csvRows.push("\n");
        csvRows.push("ReversePassengerBeforeBuild");
        csvRows.push(ReversePassengerBeforeBuild); csvRows.push("\n");
        csvRows.push("resultCarBeforeBuild");
        csvRows.push(resultCarBeforeBuild); csvRows.push("\n");
        csvRows.push("resultCarInGaraBeforeBuild");
        csvRows.push(resultCarInGaraBeforeBuild); csvRows.push("\n");
        csvRows.push("resultCarInConveyorBeforeBuild");
        csvRows.push(resultCarInConveyorBeforeBuild); csvRows.push("\n");
        csvRows.push("Group");
        csvRows.push(resultGroupBeforeBuild);
        csvRows.push("\n\n");

        csvRows.push("AFTER BUILD\n");
        csvRows.push("resultPassengerAfterBuild");
        csvRows.push(resultPassengerBuild); csvRows.push("\n");
        csvRows.push("ReversePassengerAfterBuild");
        csvRows.push(RevertPassengerBuild); csvRows.push("\n");
        csvRows.push("resultCarAfterBuild");
        csvRows.push(resultCarBuild); csvRows.push("\n");
        csvRows.push("resultCarInGaraAfterBuild");
        csvRows.push(resultCarInGaraBuild); csvRows.push("\n");
        csvRows.push("resultCarInConveyorAfterBuild");
        csvRows.push(resultCarInConveyorBuild); csvRows.push("\n");
        csvRows.push("\n\n");
        //#endregion



        const csvText = csvRows.join('\n');

        // Lưu file CSV
        this.saveFile(csvText, fileName, 'csv');
    }
    //#endregion Excel

}


