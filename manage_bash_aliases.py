#!/usr/bin/env python3

from pathlib import Path

# Read the aliases from the text file
aliases_file_path = Path("aliases.txt")
if aliases_file_path.exists():
    bash_aliases_content = aliases_file_path.read_text()
else:
    raise FileNotFoundError(f"{aliases_file_path} not found.")

# Define the path to the .bash_aliases file
file_path = Path.home() / ".bash_aliases"

# Check if the .bash_aliases file exists and handle accordingly
if file_path.exists():
    overwrite = (
        input(
            "The ~/.bash_aliases file already exists. Do you want to overwrite it? (y (yes) / n (no)): "
        )
        .strip()
        .lower()
    )
    if overwrite == "y" or overwrite == "yes":
        file_path.write_text(bash_aliases_content)
        print("The ~/.bash_aliases file has been overwritten.")
    else:
        print("The ~/.bash_aliases file was not overwritten.")
else:
    file_path.write_text(bash_aliases_content)
    print("The ~/.bash_aliases file has been created.")
