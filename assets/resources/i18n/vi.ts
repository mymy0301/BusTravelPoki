
const win = window as any;

export const languages = {
    // Data
    LbPopUpVipSpace: "Chọn một phương tiện để vào khu vực VIP",
    "Watched ads failed!": "Xem quảng cáo không thành công!",
    Play: "Chơi",
    PLAY: "CHƠI",
    NOTI_NO_AD: "Hiện không có quảng cáo.\nXin vui lòng thử lại",
    "Please parking a car!": "Xin hãy đỗ ít nhất 1 xe!",
    "Passenger is moving, please wait!": "Người đang di chuyển , xin hãy đợi",
    "Wait car moving done": "Xe đang di chuyển , xin hãy đợi",
};

if (!win.languages) {
    win.languages = {};
}

win.languages.vi = languages;
