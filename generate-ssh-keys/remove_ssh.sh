#!/bin/bash

SSH_DIR="$HOME/.ssh"
KEY_PATH="$SSH_DIR/id_ed25519"
PUB_KEY_PATH="$SSH_DIR/id_ed25519.pub"

# Check if the key exists in the SSH agent before removing it
if ssh-add -l | grep -q "$KEY_PATH"; then
  ssh-add -d "$KEY_PATH"
  echo "SSH key removed from the agent."
else
  echo "No key found in agent to remove."
fi

# Remove the key files if they exist
if [[ -f "$KEY_PATH" ]]; then
  rm "$KEY_PATH"
fi
if [[ -f "$PUB_KEY_PATH" ]]; then
  rm "$PUB_KEY_PATH"
fi

echo "Existing SSH key removed successfully."
