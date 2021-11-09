import { program } from 'commander'
import 'zx/globals'
import { pull } from '../actions/pull'

program.command('pull').action(pull)
