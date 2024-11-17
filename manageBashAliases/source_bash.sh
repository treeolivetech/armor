#!/bin/bash

BASHRC_PATH="${HOME}/.bashrc"

if [[ -f "${BASHRC_PATH}" ]]; then
  source "${BASHRC_PATH}"
  echo "~/.bashrc has been sourced."
else
  echo "~/.bashrc does not exist. Skipping sourcing."
fi
