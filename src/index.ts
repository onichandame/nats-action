import { info, setFailed, getInput } from "@actions/core"
import { exec } from "@actions/exec"

const parsePorts = () => {
  return getInput("port")
    .split(" ")
    .map(v => parseInt(v))
    .filter(v => !isNaN(v) && v >= 0)
}

const startServer = async (
  port: number,
  clusterPort?: number,
  routePort?: number,
  masterName?: string
) => {
  let options: string[] = []
  options.push(...["-d", "-p", `${port}:${port}`])
  if (clusterPort)
    options.push(...["--cluster", `nats://0.0.0.0:${clusterPort}`])
  if (routePort && masterName)
    options.push(...["--routes", `nats://${masterName}:${routePort}`])
  options.push("nats")
  options = ["docker", "run"].concat(options)
  if ((await exec("sudo", options)) !== 0) setFailed(`failed to start server`)
}
;(async () => {
  const ports = parsePorts()

  if (!ports.length) setFailed(`require at least 1 port`)

  info(`ports ${ports.join(", ")} will be used`)

  if (ports.length === 1) {
    await startServer(ports[0])
  } else {
  }
})()
