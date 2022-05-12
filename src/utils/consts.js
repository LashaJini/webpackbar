import path from 'path'

import { bullet, tick, cross, pointerSmall, radioOff } from 'figures'
import chalk from 'chalk'

export const nodeModules = `${path.delimiter}node_modules${path.delimiter}`
export const BAR_LENGTH = 10
export const BLOCK_CHAR = process.stdin.isTTY ? '█' : '*'
export const BLOCK_CHAR2 = '█'
export const NEXT = ' ' + chalk.blue(pointerSmall) + ' '
export const BULLET = bullet
export const TICK = tick
export const CROSS = cross
export const CIRCLE_OPEN = radioOff
