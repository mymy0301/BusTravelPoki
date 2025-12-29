import { _decorator, CCBoolean, Component, director, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MConsolLog')
export class MConsolLog extends Component {
    private static Instance: MConsolLog = null;

    @property(CCBoolean) private isLocal: boolean = true;
    protected onLoad(): void {
        if (MConsolLog.Instance == null) {
            MConsolLog.Instance = this;
            director.addPersistRootNode(this.node);
        } else {
            this.node.destroy();
        }
    }

    protected onDestroy(): void {
        MConsolLog.Instance = null;
    }

    public static CustomLog(color: string = 'pink', ...args: any[]): void {
        if (MConsolLog.Instance.isLocal) {
            const log = (...args) => {
                let messageConfig = '%c%s   ';

                args.forEach((argument) => {
                    const type = typeof argument;
                    switch (type) {
                        case 'bigint':
                        case 'number':
                        case 'boolean':
                            messageConfig += '%d   ';
                            break;

                        case 'string':
                            messageConfig += '%s   ';
                            break;

                        case 'object':
                        case 'undefined':
                        default:
                            messageConfig += '%o   ';
                    }
                });

                console.log(messageConfig, `color: ${color}`, '[LOGGER]', ...args);
            };
            log(...args);
        } else {
            // console.log("CustomLog is hide");
        }
    }

    public static Log(...args: any[]): void {
        if (MConsolLog.Instance.isLocal) {
            this.CustomLog('pink', ...args);
        } else {
            // console.log("Log is hide");
        }
    }

    public static Log2(...args: any[]): void {
        if (MConsolLog.Instance.isLocal) {
            this.CustomLog('#3dd972', ...args);
        } else {
            // console.log("Log is hide");
        }
    }

    public static Log3(...args: any[]): void {
        this.CustomLog('#0e488aff', ...args);
    }

    public static Error(...args: any[]): void {
        if (MConsolLog.Instance.isLocal) {
            console.error(...args);
        } else {
            // console.error("Error is hide");
        }
    }

    public static Warn(...args: any[]): void {
        if (MConsolLog.Instance.isLocal) {
            console.warn(...args);
        } else {
            // console.warn("Warn is hide");
        }
    }

    public static Table(tabularData?: any, properties?: string[]) {
        if (MConsolLog.Instance.isLocal) {
            console.table(tabularData, properties);
        } else {
            // console.log("Table is hide");
        }
    }
}


