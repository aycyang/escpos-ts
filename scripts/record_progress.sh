#!/bin/sh
set -o errexit
set -o nounset
set -o pipefail
a() {
  git log -n 1 --pretty=format:%at
}
b() {
  npx tsx --test-reporter=tap tests/all.ts | grep pass | cut -d' ' -f3
}
echo `a`,`b`
