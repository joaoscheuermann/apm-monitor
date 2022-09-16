import path from "path";
import open from "open";

import { EventEmitter } from "events";
import React, { useEffect, useMemo, useState } from "react";
import {
  Window,
  hot,
  View,
  Tabs,
  TabItem,
  Text,
  Button,
  LineEdit,
} from "@nodegui/react-nodegui";

import { ChildProcessManager, copyToClipBoard } from "./utils";
import { defaultContainerStyle } from "./style/style";

import Separator from "./components/Separator";
import APMSection from "./components/APMSection";
import { APMChannelEvents } from "./types";

const APP_TITLE = "Monitor";
const APP_SIZE = { width: 300, height: 420 };

const BIN_PATH =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "./bin")
    : path.join(__dirname, "../bin");

const SERVER_BIN_PATH = path.join(BIN_PATH, "server.exe");
const MONITOR_BIN_PATH = path.join(BIN_PATH, "monitor.exe");

const STATIC_FILES_PATH =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "./public")
    : path.join(__dirname, "../public");

const DEFAULT_SERVER_PORT = "8080";

const GIT_HUB_REPO = "https://github.com/joaoscheuermann/apm-monitor";

function App() {
  const channel = useMemo(() => new EventEmitter(), []);

  const server = useMemo(
    () => new ChildProcessManager(SERVER_BIN_PATH, channel, __dirname),
    []
  );
  const monitor = useMemo(
    () => new ChildProcessManager(MONITOR_BIN_PATH, channel, __dirname),
    []
  );

  const [serverActive, setServerActive] = useState(false);

  const [port] = useState(DEFAULT_SERVER_PORT);
  const url = useMemo(() => `http://localhost:${port}`, [port]);

  useEffect(() => {
    channel.on("server:started", () => setServerActive(true));
  }, []);

  useEffect(() => {
    server.start([port, STATIC_FILES_PATH]);
    monitor.start();

    // Pipe the messages from the monitor to the server
    monitor.process?.on("message", (message) => server.process?.send(message));
  }, [server, monitor]);

  return (
    <Window minSize={APP_SIZE} maxSize={APP_SIZE} windowTitle={APP_TITLE}>
      <View>
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
            <View style={defaultContainerStyle}>
              <View>
                <Text style="font-weight: bold;">Browser Source URL:</Text>
                <Separator />
                <View style="display: flex; flex-direction: row;">
                  <LineEdit
                    style="height: 24px; flex-grow: 1; padding: 0 4px;"
                    enabled={true}
                    readOnly={true}
                    text={url}
                  />
                  <View style="width: 4px;" />
                  <Button
                    style="height: 24px;"
                    on={{
                      clicked: () => copyToClipBoard(Buffer.from(url)),
                    }}
                  >
                    Copy
                  </Button>
                </View>
              </View>

              <Separator />
              <View style="padding: 4px; border: 1px solid rgba(0,0,0,.20);">
                <Text style="color: rgba(0,0,0,.70);">
                  Copy the URL above and paste on OBS Studio Browser
                </Text>
                <Text style="color: rgba(0,0,0,.70);">
                  Source to add an overlay that displays your APM in real
                </Text>
                <Text style="color: rgba(0,0,0,.70);">time.</Text>
              </View>

              <Separator height={12} />

              <Text style="font-weight: bold;">Server control:</Text>
              <Separator />
              <Button
                enabled={!serverActive}
                on={{
                  clicked: () => {
                    server.start([port, STATIC_FILES_PATH]);
                  },
                }}
              >
                Start server
              </Button>
              <Separator />

              <Button
                enabled={serverActive}
                on={{
                  clicked: () => {
                    server.stop();
                    setServerActive(false);
                  },
                }}
              >
                Stop server
              </Button>
            </View>
          </TabItem>
          <TabItem title="About">
            <View style={defaultContainerStyle}>
              <Text style="font-weight: bold;">Info:</Text>
              <Separator />
              <Text>Version: 1.0.0</Text>
              <Separator height={12} />
              <Text style="font-weight: bold;">Links:</Text>
              <Separator />
              <Button
                on={{
                  clicked: () => {
                    open(GIT_HUB_REPO);
                  },
                }}
              >
                GitHub
              </Button>
            </View>
          </TabItem>
        </Tabs>
        <View style="padding: 4px; padding-bottom: 6px; padding-left: 6px; display: flex; flex-direction: row;">
          <Text>Made with 🖤 by João Vitor Scheuermann</Text>
        </View>
      </View>
    </Window>
  );
}

export default hot(App);
