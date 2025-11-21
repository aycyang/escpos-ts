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

function getIndentation(lines: string[] | TemplateStringsArray): string {
  let firstIndent: string

  if (lines[0] === '') {
    firstIndent = lines[1]
  } else {
    firstIndent = lines[0]
  }

  const matched = firstIndent.match(/^(\s+).*$/)
  return matched ? matched[1] : ''
}

function indented(strings: TemplateStringsArray, ...values: string[]) {
  const indentLevel = getIndentation(strings[0].split('\n'))

  const joined = strings
    .map((str, i) => {
      const value = values[i]
      const lines = str.split('\n')
      const valueIndent = lines[lines.length - 1]
      return `${str}${
        value
          ? value
              .split('\n')
              .map((v, j) => (j > 0 ? valueIndent + v : v))
              .join('\n')
          : ''
      }`
    })
    .join('')
    .trimStart()
    .trimEnd() // remove extra empty strings at start and end

  return joined
    .split('\n')
    .map((line) => line.replace(new RegExp(`^${indentLevel}`), ''))
    .join('\n')
}

function htmlBlocks(testsData: Record<string, { status: Status }>) {
  const blocks = Object.entries(testsData).map(
    (pair) =>
      `<span class="case" data-status="${pair[1].status}">${nameToDescriptionOnly(pair[0])}</span>`,
  )
  const head = indented`
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

  return indented`
    <html>
      ${head}
    <body>
      <h1>Command support</h1>
      <div class="content">
        ${blocks.join('\n')}
      </div>
    </body>
    </html>
  `
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
