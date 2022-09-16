import path from "path";
import { EventEmitter } from "events";
import React, { useEffect, useMemo } from "react";
import { Window, hot, View, Tabs, TabItem } from "@nodegui/react-nodegui";

import { ChildProcessManager } from "./utils";
import { defaultContainerStyle } from "./style/style";

import Separator from "./components/Separator";
import APMSection from "./components/APMSection";
import { APMChannelEvents } from "./types";

const APP_TITLE = "APM Monitor";
const APP_SIZE = { width: 300, height: 420 };

const BIN_PATH = process.env.NODE_ENV === "production"
    ? path.join(__dirname, './bin')
    : path.join(__dirname, "../bin");

const SERVER_BIN_PATH = path.join(BIN_PATH, "server.exe");
const MONITOR_BIN_PATH = path.join(BIN_PATH, "monitor.exe");

const STATIC_FILES_PATH = process.env.NODE_ENV === "production"
  ? path.join(__dirname, "./public")
  : path.join(__dirname, "../public")

function App() {
  const channel = useMemo(() => new EventEmitter(), []);

  const server = useMemo(() => new ChildProcessManager(SERVER_BIN_PATH, channel, __dirname), []);
  const monitor = useMemo(() => new ChildProcessManager(MONITOR_BIN_PATH, channel, __dirname), []);

  useEffect(() => {
    server.start(['8080', STATIC_FILES_PATH])
    monitor.start()

    // Pipe the messages from the monitor to the server
    monitor.process?.on('message', message => server.process?.send(message))
  }, [server, monitor])

  return (
    <Window minSize={APP_SIZE} maxSize={APP_SIZE} windowTitle={APP_TITLE}>
      <Tabs style="flex: 1;">
        <TabItem title="APM">
          <View style={defaultContainerStyle}>
            <APMSection
              title="Combined (keyboard + mouse)"
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
          <View style={defaultContainerStyle}></View>
        </TabItem>
      </Tabs>
    </Window>
  );
}

export default hot(App);
