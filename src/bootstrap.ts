import { program } from 'commander'
import 'zx/globals'
import './commands'

$.verbose = false

export async function bootstrap() {
  try {
    await program.parseAsync(process.argv)
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      console.log(error.stack)
    }
  }
}
