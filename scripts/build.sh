#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_directory="$repository_root/dist"

rm -rf -- "$output_directory"
mkdir -p "$output_directory"

cp \
  "$repository_root/index.html" \
  "$repository_root/styles.css" \
  "$repository_root/script.js" \
  "$repository_root/site-config.js" \
  "$output_directory/"
cp -R "$repository_root/assets" "$output_directory/assets"

python -m mkdocs build \
  --config-file "$repository_root/mkdocs.yml" \
  --site-dir "$output_directory/docs"
