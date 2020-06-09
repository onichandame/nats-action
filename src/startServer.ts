import { generate } from "randomstring"
import { exec } from "@actions/exec"

import { createNetwork } from "./createNetwork"

export const startServer = async (
  port: number,
  masterName?: string
): Promise<string> => {
  const name = generate({ length: 5, charset: "alphanumeric" })
  const network = await createNetwork()
  let options: string[] = []
  options.push(...["-d", "--network", network, "-p", `${port}:4222`])
  if (name) options.push(...["--name", name])
  options.push("nats:alpine")
  if (masterName)
    options.push(
      ...[
        "--cluster",
        `nats://0.0.0.0:6222`,
        "--routes",
        `nats://ruser:T0pS3cr3t@${masterName}:6222`
      ]
    )
  options = ["docker", "run"].concat(options)
  return exec("sudo", options).then(code => {
    if (code === 0) return name
    else throw new Error(`failed to start server ${options.join(" ")}`)
  })
}
