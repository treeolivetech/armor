import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs/promises";
import { promisify } from "util";

const execAsync = promisify(exec);
const isWindows = process.platform === "win32";

export async function ensureExecutable(scriptPath) {
  try {
    await fs.access(scriptPath, fs.constants.X_OK);
  } catch {
    await fs.chmod(scriptPath, 0o755);
  }
}

export async function getBashCommand(scriptPath) {
  if (isWindows) {
    const gitPath = process.env.GIT_PATH || "C:\\Program Files\\Git";
    const cygpath = `"${gitPath}\\usr\\bin\\cygpath.exe"`;
    const unixScriptPath = (
      await execAsync(`${cygpath} "${scriptPath}"`)
    ).stdout.trim();
    const bashCommand = `"${gitPath}\\bin\\bash.exe"`;
    return `${bashCommand} -c "${unixScriptPath}"`;
  } else {
    return `bash -c "${scriptPath}"`;
  }
}

export default async function run(scriptPath, args = []) {
  await ensureExecutable(scriptPath); // Ensure the script is executable

  try {
    const command = await getBashCommand(`${scriptPath} ${args.join(" ")}`);
    const { stdout, stderr } = await execAsync(command);

    if (stdout) console.log(chalk.green(stdout.trim()));
    if (stderr) console.error(chalk.yellow(stderr.trim()));

    return stdout.trim(); // Return stdout as the result
  } catch (error) {
    console.error(chalk.red(`Error executing script: ${error.message}`));
    throw error; // Rethrow error to allow the caller to handle it
  }
}
