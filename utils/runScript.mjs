import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs/promises";
import { promisify } from "util";

async function ensureExecutable(scriptPath) {
  try {
    await fs.access(scriptPath, fs.constants.X_OK);
  } catch {
    await fs.chmod(scriptPath, 0o755);
  }
}

export default async function runScript(scriptPath, args = []) {
  await ensureExecutable(scriptPath); // Ensure the script is executable
  const execAsync = promisify(exec);

  try {
    const { stdout, stderr } = await execAsync(
      `bash -c '${scriptPath} ${args.join(" ")}'`
    );

    if (stdout) console.log(chalk.green(stdout));
    if (stderr) console.error(chalk.yellow(stderr));

    return stdout.trim(); // Return stdout as the result
  } catch (error) {
    console.error(chalk.red(`Error executing script: ${error.message}`));
    throw error; // Rethrow error to allow the caller to handle it
  }
}
