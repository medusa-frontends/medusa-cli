import findFreePorts, { isFreePort } from 'find-free-ports'

const startPort = 3000
const endPort = 3999

const plannedPorts = new Set<number>()

export function bookPort(port: number) {
  plannedPorts.add(port)
}

type FindFreePortOptions = {
  book?: boolean
}

export async function findFreePort({ book = true }: FindFreePortOptions = {}) {
  const [port] = await findFreePorts(1, {
    startPort,
    endPort,
    jobCount: 1,
    isFree: async (port) => {
      if (plannedPorts.has(port)) return false
      return isFreePort(port)
    },
  })

  if (book) {
    bookPort(port)
  }

  return port
}
