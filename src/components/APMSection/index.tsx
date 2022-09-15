import { EventEmitter } from "events"
import React, { useEffect, useState } from "react"

import Section from "../Section"
import Separator from "../Separator"
import LabeledValue from "../LabeledValue"

import { APMChannelEvents, APMPayload, APMPropertyPayload, createAPMPropertyPayload } from "../../monitor"

interface APMSectionProps {
  title: string,
  property: keyof APMPayload,
  channel: EventEmitter
  event: APMChannelEvents,
}

export default function APMSection ({ title, property: key, channel, event, ...props }: APMSectionProps) {
  const [{ current, highest, average }, setCurrentPayload] = useState<APMPropertyPayload>(createAPMPropertyPayload(0, 0, 0))

  useEffect(() => {
    console.log(title, 'initialized')

    function handler (payload: APMPayload) {
      const property = payload[key]

      setCurrentPayload(property || createAPMPropertyPayload(0, 0, 0))
    }

    channel.on('apm:update', handler)

    return () => {
      channel.removeListener(event, handler)
    }
  }, [])

  return (
    <Section title={title}>
      <LabeledValue label="Current:">{ current.toString() }</LabeledValue>
      <Separator />
      <LabeledValue label="Highest:">{ highest.toString() }</LabeledValue>
      <Separator />
      <LabeledValue label="Average:">{ average.toString() }</LabeledValue>
    </Section>
  )
}