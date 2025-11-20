import { type TestEvent } from 'node:test/reporters'

function padStartEmoji(str: string, intendedLength) {
  // hack to fix double-width emojis
  const length = Array.from(
    str.replace('⚠️ ', '! ').replace(/✅|❌/, '##'),
  ).length
  return `${''.padStart(Math.max(intendedLength - length, 0))}${str}`
}

function table(testsData: Record<string, { status: string }>) {
  const width = Math.max(...Object.keys(testsData).map((k) => k.length))
  const columns = ['Command'.padStart(width), 'Status']

  const firstRow = `| ${columns.join(' | ')} |`
  const secondRow = `|-${''.padStart(columns[0].length, '-')}-|-${''.padStart(columns[1].length, '-')}-|`
  const rows = [firstRow, secondRow]
  for (const [key, value] of Object.entries(testsData)) {
    rows.push(
      `| ${key.padStart(columns[0].length)} | ${padStartEmoji(value.status, columns[1].length)} |`,
    )
  }
  rows.push('\n')

  return rows.join('\n')
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
  const testsData: Record<string, { status: string }> = {}
  let notYetPrinted = true

  for await (const event of source) {
    if (event.type == 'test:enqueue') {
      if (!isFile(event)) {
        testsData[event.data.name] = {
          // add extra space cause terminal prints it double width
          status: '⚠️ ',
          ...event.data,
        }
      }
      yield ''
    } else if (event.type == 'test:fail') {
      if (event.data.name in testsData) testsData[event.data.name].status = '❌'
      yield ''
    } else if (event.type == 'test:pass') {
      if (event.data.details.type == 'test' && testsData[event.data.name]) {
        testsData[event.data.name].status = event.data.skip ? '⚠️ ' : '✅'
      }
      yield ''
    } else if (event.type == 'test:diagnostic') {
      // For reference: https://github.com/integreat-io/node-test-reporter/blob/10a301ed0e8152423b08ed5b3baee423ad004754/lib/index.js#L131
      if (event.data.message.split(' ').includes('tests') && notYetPrinted) {
        yield table(testsData)
        notYetPrinted = false
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
