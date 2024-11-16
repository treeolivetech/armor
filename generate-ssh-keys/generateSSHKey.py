import subprocess
import os
from pathlib import Path
from termcolor import colored
import sys


def ensure_executable(script_path):
    script_file = Path(script_path)
    if not os.access(script_file, os.X_OK):
        script_file.chmod(0o755)


def run_script(script_path, args=[]):
    ensure_executable(script_path)
    result = subprocess.run(
        ["bash", "-c", f"{script_path} {' '.join(args)}"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(colored(f"Error: {result.stderr}", "red"))
        return False
    print(colored(result.stdout, "green"))
    return True


def main():
    ans = input(colored("Set up Git SSH Key? y(es) / n(o): ", "cyan")).strip().lower()
    if ans not in ["y", "yes"]:
        print(colored("No action taken.", "yellow"))
        sys.exit()

    email = input(colored("Enter your email for the SSH key: ", "cyan")).strip()

    script_dir = Path(__file__).parent
    ssh_dir = Path.home() / ".ssh"
    pub_key_path = ssh_dir / "id_ed25519.pub"

    try:
        remove_script_path = script_dir / "remove_ssh.sh"
        setup_script_path = script_dir / "setup_ssh.sh"

        if pub_key_path.exists():
            decision = (
                input(
                    colored(
                        "SSH key exists. Do you want to recreate it? (y(es)/n(o)): ",
                        "cyan",
                    )
                )
                .strip()
                .lower()
            )
            if decision in ["yes", "y"]:
                if run_script(remove_script_path):
                    run_script(setup_script_path, [email])
            else:
                print(colored("Keeping the existing SSH keys.", "yellow"))
        else:
            run_script(setup_script_path, [email])
    except Exception as e:
        print(colored(f"An error occurred: {e}", "red"))


if __name__ == "__main__":
    main()
