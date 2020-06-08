import { info, setFailed, getInput } from "@actions/core"
import { exec } from "@actions/exec"

let usedPorts: number[] = []

const parsePorts = () => {
  return getInput("port")
    .split(" ")
    .map(v => parseInt(v))
    .filter(v => !isNaN(v) && v >= 0)
}

const ports = parsePorts()
usedPorts.concat(ports)

const genPort = () => {
  const end = 10000
  let cur = usedPorts[usedPorts.length - 1]
  while (usedPorts.indexOf(cur) >= 0) {
    if (++cur > end) setFailed(`ports exhausted`)
  }
  usedPorts.push(cur)
  return cur
}

const startServer = async ({
  port,
  name,
  clusterPort,
  routePort,
  masterName
}:
  | {
      port: number
      name?: never
      clusterPort?: never
      routePort?: never
      master?: never
      masterName?: never
    }
  | {
      port: number
      name: string
      clusterPort: number
      routePort?: never
      masterName?: never
    }
  | {
      port: number
      name?: never
      clusterPort: number
      routePort: number
      masterName: string
    }) => {
  let options: string[] = []
  options.push(...["-d", "-p", `${port}:${port}`])
  if (name) options.push(...["--name", name])
  if (clusterPort)
    options.push(...["--cluster", `nats://0.0.0.0:${clusterPort}`])
  if (routePort && masterName)
    options.push(...["--routes", `nats://${masterName}:${routePort}`])
  options.push("nats")
  options = ["docker", "run"].concat(options)
  if ((await exec("sudo", options)) !== 0) setFailed(`failed to start server`)
}
;(async () => {
  if (!ports.length) setFailed(`require at least 1 port`)

  info(`ports ${ports.join(", ")} will be used`)

  if (ports.length === 1) {
    await startServer({ port: ports[0] })
  } else {
    const master = "masternatsinstance"
    const servers: Promise<any>[] = []
    const seedPort = genPort()
    servers.push(
      startServer({ port: ports[0], name: master, clusterPort: seedPort })
    )
    for (let slave of ports.slice(1, ports.length))
      servers.push(
        startServer({
          port: slave,
          clusterPort: genPort(),
          routePort: seedPort,
          masterName: master
        })
      )
    await Promise.all(servers)
  }
})()
