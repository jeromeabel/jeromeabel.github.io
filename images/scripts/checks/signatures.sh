#!/usr/bin/env bash
# Pixel-signature manifest of a render dir. `identify -format '%#'` hashes
# pixel data only — PNG date:create/date:modify chunks make md5 unstable.
set -euo pipefail
dir="${1:-images/out/review}"
cd "$dir"
for f in *.png; do
  printf '%s  %s\n' "$(identify -quiet -format '%#' "$f")" "$f"
done | sort -k2
