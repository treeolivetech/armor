import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { createInterface } from "readline";

async function ensureExecutable(scriptPath) {
  try {
    await fs.access(scriptPath, fs.constants.X_OK);
  } catch {
    await fs.chmod(scriptPath, 0o755);
  }
}

async function runScript(scriptPath, args = []) {
  await ensureExecutable(scriptPath); // Ensure the script is executable

  return new Promise((resolve, reject) => {
    exec(
      `bash -c "${scriptPath} ${args.join(" ")}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red("Error:"), chalk.yellow(stderr));
          reject(error);
          return;
        }
        console.log(chalk.green(stdout));
        resolve(stdout);
      }
    );
  });
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  rl.question(chalk.cyan("Set up Git SSH Key? y(es) / n(o): "), async (ans) => {
    if (!["y", "yes"].includes(ans.trim().toLowerCase())) {
      console.log(chalk.yellow("No action taken."));
      rl.close();
      return;
    }

    rl.question(
      chalk.cyan("Enter your email for the SSH key: "),
      async (email) => {
        const scriptDir = path.dirname(new URL(import.meta.url).pathname);
        const sshDir = path.join(
          process.env.HOME || process.env.USERPROFILE,
          ".ssh"
        );
        const pubKeyPath = path.join(sshDir, "id_ed25519.pub");

        try {
          const removeScriptPath = path.join(scriptDir, "remove_ssh.sh");
          const setupScriptPath = path.join(scriptDir, "setup_ssh.sh");

          if (
            await fs
              .access(pubKeyPath)
              .then(() => true)
              .catch(() => false)
          ) {
            rl.question(
              chalk.cyan(
                "SSH key exists. Do you want to recreate it? (y(es)/n(o)): "
              ),
              async (decision) => {
                if (["yes", "y"].includes(decision.trim().toLowerCase())) {
                  await runScript(removeScriptPath);
                  await runScript(setupScriptPath, [email]); // Pass email to the script
                } else {
                  console.log(chalk.yellow("Keeping the existing SSH keys."));
                }
                rl.close();
              }
            );
          } else {
            await runScript(setupScriptPath, [email]); // Create SSH key if it doesn't exist
            rl.close();
          }
        } catch (err) {
          console.error(chalk.red("An error occurred:"), err.message);
          rl.close();
        }
      }
    );
  });
}

main();
