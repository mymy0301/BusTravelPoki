import { _decorator, Component, Node, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InfoControlUIAdsAndNoAds')
export class InfoControlUIAdsAndNoAds {
    @property([Node]) listNUIHideNoAds: Node[] = [];
    @property(Widget) widgetTabLobby: Widget;
    @property(Widget) widgetPageViewHome: Widget;
    @property([Widget]) listWidgetNeedUpdateAlignment: Widget[] = [];


    public UseUIHaveAds() {
        this.listNUIHideNoAds.forEach(item => item.active = true);
    }

    public UseUINoAds() {
        this.listNUIHideNoAds.forEach(item => item.active = false);
        this.widgetTabLobby.bottom = 0;
        this.widgetPageViewHome.bottom = 100;
        this.widgetPageViewHome.top = 0;
        this.listWidgetNeedUpdateAlignment.forEach(item => item.updateAlignment());
    }
}


