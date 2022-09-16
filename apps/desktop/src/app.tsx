import { Text, Window, hot, View, Tabs, TabItem, Button } from "@nodegui/react-nodegui";

import React, { useEffect, useMemo, useState } from "react";

import { EventEmitter } from "events";
import { defaultContainerStyle, defaultSectionStyle } from "./style/style";
import Separator from "./components/Separator";
import APMSection from "./components/APMSection";
import { APMChannelEvents, APMMonitor } from "./monitor";

const APP_TITLE = "APM Monitor"
const APP_SIZE = { width: 300, height: 420 };

function App () {
  const channel = useMemo(() => new EventEmitter(), [])

  return (
    <Window
      minSize={APP_SIZE}
      maxSize={APP_SIZE}
      windowTitle={APP_TITLE}
    >
      <Tabs style="flex: 1;">
        <TabItem title="APM">
          <View
            style={defaultContainerStyle}
          >
            <APMSection
              title="Combined"
              property="combined"
              channel={channel}
              event={APMChannelEvents.UPDATE}
            />
            <Separator />

            <APMSection
              title="Keyboard"
              property="keyboard"
              channel={channel}
              event={APMChannelEvents.UPDATE}
            />
            <Separator />

            <APMSection
              title="Mouse"
              property="mouse"
              channel={channel}
              event={APMChannelEvents.UPDATE}
            />
            <Separator />
          </View>
        </TabItem>

        <TabItem title="Streaming">
          <View
            style={defaultContainerStyle}
          >
          </View>
        </TabItem>
      </Tabs>
    </Window>
  )
}

export default hot(App);
