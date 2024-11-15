#!/usr/bin/env node

import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Ensure the script has executable permissions
const scriptPath = new URL(import.meta.url).pathname;

async function ensureExecutable(filePath) {
  try {
    await fs.access(filePath, fs.constants.X_OK);
  } catch {
    await fs.chmod(filePath, 0o755);
  }
}

// Define the path to the aliases file
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
            await fs.writeFile(filePath, bashAliasesContent);
            console.log(chalk.green("The ~/.bash_aliases file has been overwritten."));
            await convertLineEndings(filePath);
          } else {
            console.log(chalk.blue("The ~/.bash_aliases file was not overwritten."));
          }
          rl.close();
        }
      );
    } catch {
      // File does not exist, create it
      await fs.writeFile(filePath, bashAliasesContent);
      console.log(chalk.green("The ~/.bash_aliases file has been created."));
      await convertLineEndings(filePath);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Function to convert line endings to Unix style
async function convertLineEndings(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const unixData = data.replace(/\r\n/g, "\n");
    await fs.writeFile(filePath, unixData, "utf8");
    console.log(chalk.green("Line endings converted to Unix style."));
    await sourceBashrc();
  } catch (error) {
    console.error(chalk.red(`Error converting line endings: ${error.message}`));
  }
}

// Function to source the ~/.bashrc file
async function sourceBashrc() {
  const bashrcPath = path.join(process.env.HOME || process.env.USERPROFILE, ".bashrc");
  try {
    await execAsync(`bash -c 'source ${bashrcPath}'`);
    console.log(chalk.green("~/.bashrc has been sourced."));
  } catch (error) {
    console.error(chalk.red(`Error sourcing ~/.bashrc: ${error.message}`));
  }
}

// Run the main function
main();
