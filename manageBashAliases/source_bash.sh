#!/bin/bash

BASHRC_PATH="${HOME}/.bashrc"

if [[ -f "${BASHRC_PATH}" ]]; then
  source "${BASHRC_PATH}"
fi

