#!/bin/bash

echo
echo 'UNDEFINED COMPARISONS'
grep -n -r "=== undefined" client/src
grep -n -r "!== undefined" client/src

grep -n -r "=== undefined" server/app
grep -n -r "!== undefined" server/app

echo
echo 'TRUE/FALSE COMPARISONS'
grep -n -r "=== true" client/src
grep -n -r "!== true" client/src
grep -n -r "=== false" client/src
grep -n -r "!== false" client/src

grep -n -r "=== true" server/app
grep -n -r "!== true" server/app
grep -n -r "=== false" server/app
grep -n -r "!== false" server/app

echo
echo 'COMMENTS'
grep -n --exclude="*.spec.ts" --exclude-dir="assets" -r "//" client/src
grep -n --exclude="*.spec.ts" -r "//" server/app

echo
echo 'MAGIC NUMBERS'
grep -n --exclude="*.spec.ts" --exclude="*.constants.ts" --exclude="*.html" --exclude="*.scss" --exclude="*.css" --exclude-dir="assets" -r -E "\b[0-9]+(\.[0-9]+)?\b" client/src | grep -vE "\b(0|1)\b"
grep -n --exclude="*.spec.ts" --exclude="*.constants.ts" -r -E "\b[0-9]+(\.[0-9]+)?\b" server/app | grep -vE "\b(0|1)\b"

echo
echo 'ESLINT DISABLES IN TS'
grep -n --exclude="*.spec.ts" -r "eslint-disable" client/src
grep -n --exclude="*.spec.ts" -r "eslint-disable" server/app

echo
echo 'TODOS'
grep -n -r "TODO" client/src
grep -n -r "TODO" server/app

