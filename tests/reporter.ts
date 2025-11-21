import { type TestEvent } from 'node:test/reporters'

type status = 'unknown' | 'failed' | 'passed' | 'skipped'
const mode = 'html'

function padStartEmoji(str: string, intendedLength) {
  // hack to fix double-width emojis
  const length = Array.from(
    str.replace('⚠️ ', '! ').replace(/✅|❌/, '##'),
  ).length
  return `${''.padStart(Math.max(intendedLength - length, 0))}${str}`
}

function statusToEmoji(status) {
  if (status === 'unknown' || status === 'failed') {
    return '❌'
  } else if (status === 'passed') {
    return '✅'
  } else {
    return '⚠️ '
  }
}

function removeNonCommands(
  testsData: Record<string, { status: status }>,
): Record<string, { status: status }> {
  const commandData = {}

  for (const k of Object.keys(testsData)) {
    const value = testsData[k]
    const commandName = k.split(' :: ')[0]

    if (commandName) {
      commandData[k] = value
    }
  }

  return commandData
}

function markdownTable(testsData: Record<string, { status: status }>) {
  const width = Math.max(...Object.keys(testsData).map((k) => k.length))
  const columns = ['Command'.padStart(width), 'Status']

  testsData = removeNonCommands(testsData)

  const firstRow = `| ${columns.join(' | ')} |`
  const secondRow = `|-${''.padStart(columns[0].length, '-')}-|-${''.padStart(columns[1].length, '-')}-|`
  const rows = [firstRow, secondRow]
  for (const [key, value] of Object.entries(testsData)) {
    rows.push(
      `| ${key.padStart(columns[0].length)} | ${padStartEmoji(statusToEmoji(value.status), columns[1].length)} |`,
    )
  }
  rows.push('\n')

  return rows.join('\n')
}

function nameToDescriptionOnly(name: string): string {
  const matches = Array.from(name.matchAll(/(.+)(\s\(\s.*\s\))/g))
  if (matches[0]) {
    return matches[0][1]
  } else {
    return name
  }
}

function htmlBlocks(testsData: Record<string, { status: status }>) {
  const blocks = Object.entries(removeNonCommands(testsData)).map(
    (pair) =>
      `<span class="case" data-status="${pair[1].status}">${nameToDescriptionOnly(pair[0])}</span>`,
  )
  const head = `
    <head>
      <style>
        .case { margin: 1px; }
        .case[data-status="passing"] { color: green; } 
        .case[data-status="failed"] { color: red; }
      </style>
    </head>
  `
    .split('\n')
    .map((s) => s.trimStart())
    .join('')

  return `
    <html>
      ${head}
    <body>
      ${blocks.join()}
    </body>
    </html>
  `
    .split('\n')
    .map((s) => s.trimStart())
    .join('')
}

type EnqueueEvent = TestEvent & { type: 'test:enqueue' }
function isFile(event: EnqueueEvent) {
  const hasFileExt =
    event.data.name.endsWith('.ts') || event.data.name.endsWith('.js')
  return hasFileExt && event.data.column == 1 && event.data.line == 1
}

// Reports to Markdown table
export default async function* customReporter(
  source: AsyncGenerator<TestEvent, void>,
) {
  const testsData: Record<string, { status: status }> = {}
  let shouldPrint = true

  for await (const event of source) {
    if (event.type == 'test:enqueue') {
      if (!isFile(event)) {
        testsData[event.data.name] = {
          // add extra space cause terminal prints it double width
          // status: '⚠️ ',
          status: 'unknown',
          ...event.data,
        }
      }
      yield ''
    } else if (event.type == 'test:fail') {
      // if (event.data.name in testsData) testsData[event.data.name].status = '❌'
      if (event.data.name in testsData)
        testsData[event.data.name].status = 'failed'
      yield ''
    } else if (event.type == 'test:pass') {
      if (event.data.details.type == 'test' && testsData[event.data.name]) {
        // testsData[event.data.name].status = event.data.skip ? '❌' : '✅'
        testsData[event.data.name].status = event.data.skip
          ? 'skipped'
          : 'passed'
      }
      yield ''
    } else if (event.type == 'test:diagnostic') {
      if (event.data.message.split(' ').includes('tests') && shouldPrint) {
        if (mode == 'html') {
          yield htmlBlocks(testsData)
        } else {
          yield markdownTable(testsData)
        }

        // Print once; multiple diagnostic events are emitted at the end
        // For reference: https://github.com/integreat-io/node-test-reporter/blob/10a301ed0e8152423b08ed5b3baee423ad004754/lib/index.js#L131
        shouldPrint = false
      } else {
        yield ''
      }
    } else if (event.type == 'test:complete') {
      yield ''
    } else if (event.type == 'test:stderr' || event.type == 'test:stdout') {
      yield `${event.data.message}\n`
    }
  }
}
