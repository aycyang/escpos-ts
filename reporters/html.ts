import assert from 'node:assert'
import { type TestEvent } from 'node:test/reporters'

type Status = 'unknown' | 'failed' | 'passed' | 'skipped'

function nameToDescriptionOnly(name: string): string {
  const matches = Array.from(name.matchAll(/(.+)(\s\(\s.*\s\))/g))
  if (matches[0]) {
    return matches[0][1]
  } else {
    return name
  }
}

function htmlBlocks(testsData: Record<string, { status: Status }>) {
  const blocks = Object.entries(testsData).map(
    (pair) =>
      `<span class="case" data-status="${pair[1].status}">${nameToDescriptionOnly(pair[0])}</span>\n`,
  )
  const head = `
    <head>
      <style>
        body {
          font-family: system-ui;
          background: black;
          color: white;
          text-align: center;
        }
        .content {
          display: flex;
          align-content: flex-start;
          flex-wrap: wrap;
        }
        .case { 
          padding: 8px;
          margin: 2px;
          /* grow to fit row! */
          flex: auto;
          text-align: center;
        }
        .case[data-status="passed"] {
          background-color: #9dff98;
          color: #0d8304;
        } 
        .case[data-status="failed"], .case[data-status="skipped"] {
          background-color: #ff8585;
          color: #860e0b;
        }
      </style>
    </head>
  `
    .split('\n')
    .map((s) => s.trimStart())
    .join('\n')

  return `
    <html>
      ${head}
    <body>
      <h1>Command support</h1>
      <div class="content">\n${blocks.join('')}</div>
    </body>
    </html>
  `
    .split('\n')
    .map((s) => s.trimStart())
    .join('\n')
}

type TestCompleteEvent = TestEvent & { type: 'test:complete' }
type TestDequeueEvent = TestEvent & { type: 'test:dequeue' }
function isFile(event: TestCompleteEvent | TestDequeueEvent) {
  const hasFileExt =
    event.data.name.endsWith('.ts') || event.data.name.endsWith('.js')
  return hasFileExt && event.data.column == 1 && event.data.line == 1
}

export default async function* customReporter(
  source: AsyncGenerator<TestEvent, void>,
) {
  const testsData: Record<string, { status: Status }> = {}

  for await (const event of source) {
    switch (event.type) {
      case 'test:dequeue':
        if (!isFile(event)) {
          testsData[event.data.name] = {
            status: 'unknown',
            ...event.data,
          }
        }
        yield ''
        break
      case 'test:fail':
        assert(event.data.name in testsData)
        testsData[event.data.name].status = 'failed'
        yield ''
        break
      case 'test:pass':
        assert(event.data.name in testsData)
        if (event.data.details.type == 'test' && testsData[event.data.name]) {
          testsData[event.data.name].status = event.data.skip
            ? 'skipped'
            : 'passed'
        }
        yield ''
        break
      case 'test:complete':
        if (isFile(event)) {
          yield htmlBlocks(testsData)
        } else {
          yield ''
        }
        break
      case 'test:stderr':
      case 'test:stdout':
        yield `${event.data.message}\n`
        break
      default:
        yield ''
        break
    }
  }
}
