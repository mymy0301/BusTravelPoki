import { MConfigFacebook } from "../../Configs/MConfigFacebook";
import { LogEventManager } from "../../LogEvent/LogEventManager";
import { FBInstantManager } from "../../Utils/facebooks/FbInstanceManager";

// GlobalErrorHandler.ts
export class GlobalErrorHandler {
    static init() {
        // Bắt error sync
        window.onerror = function (
            message: string | Event,
            source?: string,
            lineno?: number,
            colno?: number,
            error?: Error
        ) {
            const log = {
                type: "runtime",
                message,
                source,
                line: lineno,
                column: colno,
                stack: error?.stack || "no stack"
            };

            console.error("Global Error:", log);
            GlobalErrorHandler.saveLog(log);

            return false; // không chặn error mặc định
        };

        // Bắt Promise reject (async/await)
        window.addEventListener("unhandledrejection", (event) => {
            const log = {
                type: "promise",
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack || "no stack"
            };

            console.error("Unhandled Promise:", log);
            GlobalErrorHandler.saveLog(log);
        });
    }

    static saveLog(log: any) {
        let logs: any[] = JSON.parse(localStorage.getItem("error_logs") || "[]");
        logs.push({
            ...log,
            time: new Date().toISOString()
        });
        // only save max 50 bug
        if (logs.length > 50) {
            logs = logs.slice(-50);
        }
        localStorage.setItem("error_logs", JSON.stringify(logs));
        if (log.stack != "no stack") {
            LogEventManager.Instance.logTriggerBug(MConfigFacebook.Instance.playerID, "111", log.stack, "Catchbug");
        }
    }
}