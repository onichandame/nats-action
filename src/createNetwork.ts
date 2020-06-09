import { exec } from "@actions/exec"
import { generate } from "randomstring"

let network: string

export const createNetwork = async () => {
  if (!network) {
    network = generate({ length: 10, charset: "alphanumeric" })
    if (
      (await exec("sudo", `docker network create ${network}`.split(" "))) !== 0
    )
      throw new Error(`creation of network ${network} failed`)
  }
  return network
}
