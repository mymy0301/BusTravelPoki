
const win = window as any;

export const languages = {
    // Data
    LbPopUpVipSpace: "Choose a vehicle to enter the VIP space",
    "Watched ads failed!": "Watched ads failed!",
    Play: "Play",
    PLAY: "PLAY",
    NOTI_NO_AD: "No ads are available right \nnow. Please try again later.",
    "Please parking a car!": "Please parking a car!",
    "Passenger is moving, please wait!": "Passenger is moving, please wait!",
    "Car is moving, please wait!": "Car is moving, please wait!",
    "Wait car moving done": "Wait car moving done",
    "No valid target": "No valid target",

    //#region GENERAL
    "Not enough ticket": "Not enough ticket",                                       // UIInfo_UIEditName
    "Buy Failed!": "Buy Failed!",
    "Buy Successfully!": "Buy Successfully!",
    "FINISHED": "FINISHED",
    "NoPlaceParking": "No Place Parking",
    "END_TIME": "END TIME",
    "No video Available!": "No video Available!",
    //#endregion GENERAL

    //#region UIInfoPlayer
    "Level Stats": "Level Stats",
    "Best Win Streak": "Best Win Streak",
    "Win Rate %": "Win Rate %",
    "General Stats": "General Stats",
    "Races Won": "Races Won",
    "Cities Completed": "Cities Completed",
    "Leagues Won": "Leagues Won",
    "New Skin": "New Skin",
    "Update name success": "Update name success",
    "Please enter your new name": "Please enter your new name",
    //#endregion UIInfoPlayer

    //#region UISetting
    "ON": "ON",
    "OFF": "OFF",
    //#endregion UISetting

    //#region UIInvite
    "Friend invitation failed": "Friend invitation failed",
    "Friend invitation succeeded": "Friend invitation succeeded",
    //#endregion UIInvite

    //#region UILoginReward
    "Day": "Day",
    //#endregion UILoginReward

    //#region UISpin
    "You have used all ads today": "You have used all ads today",
    //#endregion UISpin

    "You can buy boosters by coins!": "You can buy boosters by coins!",
    "Not enough compatible buses!": "Not enough compatible buses!",
    "Not enough Skip Ads!": "Not enough Skip Ads!",
    "Not enough Tickets!": "Not enough Tickets!",

    "No Parking Space!": "No Parking Space!",
    "Parking Full!": "Parking Full!",

    "ET_NOTI_LOCK" :"Claim previous offer to unlock"
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
