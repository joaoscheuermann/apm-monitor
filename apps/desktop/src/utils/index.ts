import EventEmitter from "events";
import { ChildProcess, spawn, SpawnOptions } from "child_process";
import { LooseObject } from "../types";


export class ChildProcessManager {
  public process: ChildProcess | null = null;

  constructor (
    public processPath: string,
    public channel: EventEmitter,
    public cwd: string = __dirname
  ) {
    this.start()
  }

  start (commands: string[] = []) {
    if (this.process) return

    const options: SpawnOptions = {
      cwd: this.cwd,
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    }

    const process = spawn(this.processPath, commands, options)

    process.on('message', ({type, payload}: LooseObject) => {
      this.channel.emit(type, payload)
    })

    this.process = process
  }

  stop () {
    if (!this.process) return

    this.process.removeAllListeners()
    this.process.kill()
    this.process = null
  }
}