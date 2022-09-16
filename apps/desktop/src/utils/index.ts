import util from "util";
import EventEmitter from "events";
import { ChildProcess, spawn, SpawnOptions, spawnSync } from "child_process";
import { LooseObject } from "../types";


export class ChildProcessManager {
  public process: ChildProcess | null = null;

  constructor (
    public processPath: string,
    public channel: EventEmitter,
    public cwd: string = __dirname
  ) {}

  start (commands: string[] = []) {
    if (this.process) return

    const options: SpawnOptions = {
      cwd: this.cwd,
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    }

    const child = spawn(this.processPath, commands, options)

    child?.stdout?.setEncoding('utf8');
    child?.stdout?.on('data', function(data) {
      console.log('stdout: ' + data.toString());
    });

    child?.stderr?.setEncoding('utf8');
    child?.stderr?.on('data', function(data) {
      console.log('stderr: ' + data.toString());
    });

    child.on('message', ({type, payload}: LooseObject) => {
      this.channel.emit(type, payload)
    })

    this.process = child
  }

  stop () {
    if (!this.process) return

    this.process.removeAllListeners()
    this.process.kill()
    this.process = null
  }
}

export function copyToClipBoard (buffer: Buffer) {
  spawn('clip').stdin.end(buffer);
}