#!/bin/bash

SSH_DIR="$HOME/.ssh"
KEY_PATH="$SSH_DIR/id_ed25519"
PUB_KEY_PATH="$SSH_DIR/id_ed25519.pub"

# Ensure .ssh directory exists
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# Generate the SSH key
if ! ssh-keygen -t ed25519 -f "$KEY_PATH" -C "$1" -N ""; then
  echo "Failed to generate SSH key."
  exit 1
fi

# Start the SSH agent
if [[ -z "$SSH_AUTH_SOCK" ]]; then
  eval "$(ssh-agent -s)"
  if [[ $? -ne 0 ]]; then
    echo "Failed to start SSH agent."
    exit 1
  fi
fi

# Add the SSH key to the agent
if ! ssh-add "$KEY_PATH"; then
  echo "Failed to add SSH key to the SSH agent."
  exit 1
fi

# Output the public key
echo "SSH key created successfully at $KEY_PATH and added to agent." 
echo "Public Key:"
cat "$PUB_KEY_PATH"
