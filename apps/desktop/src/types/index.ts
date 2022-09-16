import EventEmitter from "events";

export interface LooseObject {
  [key: string]: any
}

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

export interface APMSectionProps {
  title: string,
  property: keyof APMPayload,
  channel: EventEmitter
  event: APMChannelEvents,
}
