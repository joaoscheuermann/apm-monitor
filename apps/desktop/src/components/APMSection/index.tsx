import { EventEmitter } from "events"
import React, { useEffect, useMemo, useState } from "react"

import Section from "../Section"
import Separator from "../Separator"
import LabeledValue from "../LabeledValue"
import { APMPropertyPayload, APMPayload, APMSectionProps } from "../../types"

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

export default function APMSection ({ title, property: key, channel, event, ...props }: APMSectionProps) {
  const [currentPayload, setCurrentPayload] = useState<APMPropertyPayload>(createAPMMonitorPropertyPayload(0, 0, 0))

  const current = useMemo(() => currentPayload.current.toString(), [currentPayload])
  const highest = useMemo(() => currentPayload.highest.toString(), [currentPayload])
  const average = useMemo(() => currentPayload.average.toString(), [currentPayload])

  useEffect(() => {
    function handler (payload: APMPayload) {
      const property = payload[key]

      if (property && (property.current !== currentPayload.current || property.highest !== currentPayload.highest || property.average !== currentPayload.average))
        setCurrentPayload(property)
    }

    channel.on(event, handler)

    return () => {
      channel.removeListener(event, handler)
    }
  }, [])

  return (
    <Section title={title}>
      <LabeledValue label="Current:">{ current }</LabeledValue>
      <Separator />
      <LabeledValue label="Highest:">{ highest }</LabeledValue>
      <Separator />
      <LabeledValue label="Average:">{ average }</LabeledValue>
    </Section>
  )
}