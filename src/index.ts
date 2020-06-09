import { info, setFailed, getInput } from "@actions/core"

import { startServer } from "./startServer"

let usedPorts: number[] = []

const parsePorts = () => {
  return [
    ...new Set(
      getInput("port")
        .split(" ")
        .map(v => parseInt(v))
        .filter(v => !isNaN(v) && v >= 0)
    )
  ]
}

const ports = parsePorts()
usedPorts.concat(ports)
;(async () => {
  try {
    if (!ports.length) setFailed(`require at least 1 port!`)

    info(`ports ${ports.join(", ")} will be used`)

    const master = await startServer(ports.shift() as number)
    await Promise.all(ports.map(p => startServer(p, master)))
  } catch (e) {
    setFailed(JSON.stringify(e.message || e))
  }
})()
