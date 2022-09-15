import { Text, Window, hot, View, Tabs, TabItem, Button } from "@nodegui/react-nodegui";

import React, { useState } from "react";

import { EventEmitter } from "events";
import { defaultContainerStyle, defaultSectionStyle } from "./style/style";
import Section from "./components/Section";
import Separator from "./components/Separator";
import LabeledValue from "./components/LabeledValue";
import APMSection from "./components/APMSection";
import { APMChannelEvents } from "./monitor";

const APP_TITLE = "APM Monitor"
const APP_SIZE = { width: 300, height: 420 };

const channel = new EventEmitter()

function App () {

  const [topValue, setTopValue] = useState(0)

  const buttonHandler = {
    clicked: () => {
      setTopValue(state => state + 1)
    }
  };

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
