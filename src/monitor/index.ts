export interface APMPayload {
  keyboard: APMPropertyPayload,
  mouse: APMPropertyPayload,
  combined: APMPropertyPayload,
}

export interface APMPropertyPayload {
  current: number,
  highest: number,
  average: number
}

export enum APMChannelEvents {
  UPDATE = 'apm:update'
}

export function createAPMPropertyPayload (current: number, highest: number, average: number): APMPropertyPayload {
  return { current, highest, average }
}