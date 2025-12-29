import { _decorator, Component, Label, macro, Node, Tween, tween, UIOpacity } from 'cc';
const { ccclass, property, disallowMultiple, requireComponent } = _decorator;

@ccclass('QuoteUI')
@requireComponent(UIOpacity)
@disallowMultiple
export class QuoteUI extends Component {

    private listQuote: string[] = [
        "Life is more fun if you play games",
        "Daily challenges is not easy but of course the prize is so much",
        "You can spin free each day",
        "Game too hard? Why not buy something in shop to make easier",
        "Finish missions in daily quest to get reward",
        "Try play more event in game to get more rewards",
        "How about share your record win to your friend"
    ];

    protected onLoad(): void {
        this.node.getComponent(Label).string = `Hint: ${this.listQuote[this.indexQuote]}`;
    }

    protected start(): void {
        this.ttId = setInterval(this.ChangeQuote.bind(this), this.timeToChangeNewQuote * 1000, macro.REPEAT_FOREVER, 0)
    }

    protected onDestroy(): void {
        if (this.ttId != -1) {
            clearInterval(this.ttId);
        }
    }

    private ttId: number = -1;
    private indexQuote: number = 0;
    private readonly timeToChangeNewQuote = 4;
    public ChangeQuote() {
        this.node.getComponent(Label).string = `Hint: ${this.listQuote[this.indexQuote]}`;
        this.indexQuote += 1;
        if (this.indexQuote == this.listQuote.length) {
            this.indexQuote = 0;
        }
    }

    public Show() {
        const opaCom = this.node.getComponent(UIOpacity);
        opaCom.opacity = 0;
        this.node.active = true;
        const timeShow = 0.5;
        tween(opaCom)
            .to(timeShow, { opacity: 255 })
            .start();
    }

    public Hide() {
        Tween.stopAllByTarget(this.node);
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.active = false;
    }
}


