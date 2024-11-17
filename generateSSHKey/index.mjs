import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import askQuestion from "../utils/askQuestion.mjs";
import runScript from "../utils/runScript.mjs";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const removeScriptPath = path.join(scriptDir, "remove_ssh.sh");
const setupScriptPath = path.join(scriptDir, "setup_ssh.sh");

export default async function generateSSHKey() {
  try {
    const setup = await askQuestion("Set up Git SSH Key? y(es) / n(o): ");
    if (!["y", "yes"].includes(setup.toLowerCase())) {
      console.log(chalk.yellow("No action taken."));
      return;
    }

    const sshDir = path.join(
      process.env.HOME || process.env.USERPROFILE,
      ".ssh"
    );
    await fs.mkdir(sshDir, { recursive: true });

    const pubKeyPath = path.join(sshDir, "id_ed25519.pub");

    try {
      await fs.access(pubKeyPath, fs.constants.F_OK);

      const recreate = await askQuestion(
        "SSH key exists. Do you want to recreate it? (y(es)/n(o)): "
      );

      if (["yes", "y"].includes(recreate.toLowerCase())) {
        console.log(chalk.green("Recreating SSH key..."));
        await runScript(removeScriptPath);

        const email = await askQuestion("Enter your email for the SSH key: ");
        await runScript(setupScriptPath, [email]);

        console.log(chalk.green("SSH key has been recreated."));
      } else {
        console.log(chalk.yellow("Keeping the existing SSH keys."));
      }
    } catch {
      const email = await askQuestion("Enter your email for the SSH key: ");
      await runScript(setupScriptPath, [email]);

      console.log(chalk.green("SSH key has been created."));
    }
  } catch (err) {
    console.error(chalk.red("An unexpected error occurred:"), err.message);
    process.exit(1); // Exit with error code
  }
}
