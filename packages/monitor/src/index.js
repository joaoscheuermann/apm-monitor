"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APMMonitor = exports.createAPMMonitorPropertyPayload = exports.APMChannelEvents = void 0;
const events_1 = require("events");
const uiohook_napi_1 = require("uiohook-napi");
var APMChannelEvents;
(function (APMChannelEvents) {
    APMChannelEvents["UPDATE"] = "apm:update";
})(APMChannelEvents = exports.APMChannelEvents || (exports.APMChannelEvents = {}));
function createAPMMonitorPropertyPayload(current, highest, average) {
    return {
        current,
        highest,
        average,
    };
}
exports.createAPMMonitorPropertyPayload = createAPMMonitorPropertyPayload;
class APMMonitor {
    constructor(channel) {
        this.elapsedMinutes = 0;
        this.clicks = 0;
        this.topClicks = 0;
        this.totalClicks = 0;
        this.keydowns = 0;
        this.topKeydowns = 0;
        this.totalKeydowns = 0;
        this.channel = channel;
    }
    generatePayload() {
        function avg(a, b) {
            return Math.round(a / b || 0);
        }
        const payload = {
            keyboard: createAPMMonitorPropertyPayload(this.keydowns, this.topKeydowns, avg(this.totalKeydowns, this.elapsedMinutes)),
            mouse: createAPMMonitorPropertyPayload(this.clicks, this.topClicks, avg(this.totalClicks, this.elapsedMinutes)),
            combined: createAPMMonitorPropertyPayload(this.clicks + this.keydowns, this.topClicks + this.topKeydowns, avg(this.totalClicks, this.elapsedMinutes) + avg(this.totalKeydowns, this.elapsedMinutes)),
        };
        return payload;
    }
    start() {
        uiohook_napi_1.uIOhook.on("mousedown", (e) => {
            this.clicks++;
        });
        uiohook_napi_1.uIOhook.on("keydown", (e) => {
            this.keydowns++;
        });
        uiohook_napi_1.uIOhook.start();
        // Updates the top values each minute. This code measures the
        // highest APM
        setInterval(() => {
            this.elapsedMinutes++;
            if (this.clicks > this.topClicks)
                this.topClicks = this.clicks;
            if (this.keydowns > this.topKeydowns)
                this.topKeydowns = this.keydowns;
            this.totalClicks += this.clicks;
            this.totalKeydowns += this.keydowns;
            this.clicks = 0;
            this.keydowns = 0;
        }, 1000 * 60);
        // Sends the payload thought the channel to update other code.
        setInterval(() => {
            this.channel.emit(APMChannelEvents.UPDATE, this.generatePayload());
        }, 1000 / 30);
    }
    stop() {
        uiohook_napi_1.uIOhook.stop();
    }
}
exports.APMMonitor = APMMonitor;
const channel = new events_1.EventEmitter();
const monitor = new APMMonitor(channel);
channel.on(APMChannelEvents.UPDATE, (payload) => {
    /**
     * If the process is spawned by another process, it should pipe all the data thought the IPC channel
     */
    if (process.send) {
        process.send({
            type: APMChannelEvents.UPDATE,
            payload: payload
        });
    }
    else {
        console.clear();
        console.warn('Running on standalone mode!\n');
        console.log(`[COMBINED APM] CURRENT: ${payload.combined.current} | AVERAGE: ${payload.combined.average} | HIGHEST: ${payload.combined.highest}`);
        console.log(`[KEYBOARD APM] CURRENT: ${payload.keyboard.current} | AVERAGE: ${payload.keyboard.average} | HIGHEST: ${payload.keyboard.highest}`);
        console.log(`[MOUSE APM] CURRENT: ${payload.mouse.current} | AVERAGE: ${payload.mouse.average} | HIGHEST: ${payload.mouse.highest}`);
    }
});
monitor.start();
