import { program } from 'commander'
import 'zx/globals'
import { generate } from '../actions/generate'

program.command('generate').action(generate)
