import { program } from 'commander'
import 'zx/globals'
import { install } from '../actions/install'

program.command('install').action(install)
