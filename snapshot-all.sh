#!/usr/bin/env bash
set -euo pipefail

max_parallel_jobs=3
declare -a active_pids=()

for suite_dir in test/cryptoswap test/stableswap; do
  for test_file in "$suite_dir"/*.sol; do
    [ -e "$test_file" ] || continue
    test_name=${test_file##*/}
    test_name=${test_name%.sol}
    forge test --mc "$test_name" &
    active_pids+=("$!")
    if ((${#active_pids[@]} == max_parallel_jobs)); then
      wait "${active_pids[0]}"
      active_pids=("${active_pids[@]:1}")
    fi
  done
done

for pid in "${active_pids[@]}"; do
  wait "$pid"
done

pnpm run generate-assets
