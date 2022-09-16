import { EventEmitter } from "events";
import { uIOhook } from "uiohook-napi";

export interface APMPayload {
  keyboard: APMPropertyPayload;
  mouse: APMPropertyPayload;
  combined: APMPropertyPayload;
}

export interface APMPropertyPayload {
  current: number;
  highest: number;
  average: number;
}

export enum APMChannelEvents {
  UPDATE = "apm:update",
}

export function createAPMMonitorPropertyPayload(
  current: number,
  highest: number,
  average: number
): APMPropertyPayload {
  return {
    current,
    highest,
    average,
  };
}

export class APMMonitor {
  public channel: EventEmitter
  public elapsedMinutes: number;

  public clicks: number;
  public topClicks: number;
  public totalClicks: number;

  public keydowns: number;
  public topKeydowns: number;
  public totalKeydowns: number;

  constructor(channel: EventEmitter) {
    this.elapsedMinutes = 0;

    this.clicks = 0;
    this.topClicks = 0;
    this.totalClicks = 0;

    this.keydowns = 0;
    this.topKeydowns = 0;
    this.totalKeydowns = 0;

    this.channel = channel
  }

  generatePayload (): APMPayload {
    function avg(a: number, b: number) {
      return Math.round((a / b) || 0);
    }

    const payload: APMPayload = {
      keyboard: createAPMMonitorPropertyPayload(
        this.keydowns,
        this.topKeydowns,
        avg(this.totalKeydowns, this.elapsedMinutes)
      ),
      mouse: createAPMMonitorPropertyPayload(
        this.clicks,
        this.topClicks,
        avg(this.totalClicks, this.elapsedMinutes)
      ),
      combined: createAPMMonitorPropertyPayload(
        this.clicks + this.keydowns,
        this.topClicks + this.topKeydowns,
        avg(this.totalClicks, this.elapsedMinutes) + avg(this.totalKeydowns, this.elapsedMinutes)
      ),
    };

    return payload
  }

  start() {
    uIOhook.on("mousedown", (e) => {
      this.clicks++;
    });

    uIOhook.on("keydown", (e) => {
      this.keydowns++;
    });

    uIOhook.start();

    // Updates the top values each minute. This code measures the
    // highest APM
    setInterval(() => {
      this.elapsedMinutes++;
      this.totalClicks += this.clicks;
      this.totalKeydowns += this.keydowns;

      if (this.clicks > this.topClicks) this.topClicks = this.clicks;
      if (this.keydowns > this.topKeydowns) this.topKeydowns = this.keydowns;

      this.clicks = 0;
      this.keydowns = 0;
    }, 1000 * 60);

    // Sends the payload thought the channel to update other code.
    setInterval(() => {
      this.channel.emit(APMChannelEvents.UPDATE, this.generatePayload());
    }, 1000 / 30);
  }

  stop () {
    uIOhook.stop();
  }
}

const channel = new EventEmitter()
const monitor = new APMMonitor(channel)

channel.on(APMChannelEvents.UPDATE, (payload: APMPayload) => {
  /**
   * If the process is spawned by another process, it should pipe all the data thought the IPC channel
   */
  if (process.send) {
    process.send({
      type: APMChannelEvents.UPDATE,
      payload: payload
    })
  } else {
    console.clear()
    console.warn('Running on standalone mode!\n')
    console.log(`[COMBINED APM] CURRENT: ${payload.combined.current} | AVERAGE: ${payload.combined.average} | HIGHEST: ${payload.combined.highest}`)
    console.log(`[KEYBOARD APM] CURRENT: ${payload.keyboard.current} | AVERAGE: ${payload.keyboard.average} | HIGHEST: ${payload.keyboard.highest}`)
    console.log(`[MOUSE APM] CURRENT: ${payload.mouse.current} | AVERAGE: ${payload.mouse.average} | HIGHEST: ${payload.mouse.highest}`)
  }
})

monitor.start()
