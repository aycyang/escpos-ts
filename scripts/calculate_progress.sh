#!/bin/sh
cp scripts/record_progress.sh .
while npm install 2>&1 > /dev/null && ./record_progress.sh >> progress.csv && git checkout HEAD~ 2>&1 > /dev/null; do cat progress.csv; done
