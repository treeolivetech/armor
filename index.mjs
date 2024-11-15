#!/usr/bin/env node

import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const scriptPath = new URL(import.meta.url).pathname;
const aliasesFilePath = path.join(path.dirname(scriptPath), "aliases.txt");

async function main() {
  try {
    // Ensure script has execute permission
    await ensureExecutable(scriptPath);

    const bashAliasesContent = await fs.readFile(aliasesFilePath, "utf8");
    const filePath = path.join(process.env.HOME || process.env.USERPROFILE, ".bash_aliases");

    try {
      await fs.access(filePath, fs.constants.F_OK);

      // File exists, ask if it should be overwritten
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        chalk.yellow("The ~/.bash_aliases file already exists. Do you want to overwrite it? (y (yes) / n (no)): "),
        async (answer) => {
          if (answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes") {
            await writeToFile(filePath, bashAliasesContent);
            console.log(chalk.green("The ~/.bash_aliases file has been overwritten."));
          } else {
            console.log(chalk.blue("The ~/.bash_aliases file was not overwritten."));
          }
          rl.close();
        }
      );
    } catch {
      // File does not exist, create it
      await writeToFile(filePath, bashAliasesContent);
      console.log(chalk.green("The ~/.bash_aliases file has been created."));
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Ensure the script has executable permissions
async function ensureExecutable(filePath) {
  try {
    await fs.access(filePath, fs.constants.X_OK);
  } catch {
    await fs.chmod(filePath, 0o755);
  }
}

// Function to write content to a file, ensure Unix-style line endings, and source ~/.bashrc
async function writeToFile(filePath, content) {
  try {
    // Convert content to Unix-style line endings and write to file
    const unixContent = content.replace(/\r\n/g, "\n");
    await fs.writeFile(filePath, unixContent, "utf8");
    console.log(chalk.green("File written with Unix-style line endings."));
  } catch (error) {
    console.error(chalk.red(`Error writing file: ${error.message}`));
    return; // Stop further execution if writing fails
  }

  try {
    // Source the ~/.bashrc file
    const bashrcPath = path.join(process.env.HOME || process.env.USERPROFILE, ".bashrc");
    await execAsync(`bash -c 'source ${bashrcPath}'`);
    console.log(chalk.green("~/.bashrc has been sourced."));
  } catch (error) {
    console.error(chalk.red(`Error sourcing ~/.bashrc: ${error.message}`));
  }
}

// Run the main function
main();
