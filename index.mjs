#!/usr/bin/env node

import chalk from "chalk";
import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import { exec } from "child_process";

// Ensure the script has executable permissions
const scriptPath = path.resolve(import.meta.url.replace("file://", ""));
try {
  fs.accessSync(scriptPath, fs.constants.X_OK);
} catch {
  // Make the script executable if it lacks permissions
  fs.chmodSync(scriptPath, 0o755);
}

// Define the path to the aliases file (bundled with package)
const aliasesFilePath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "aliases.txt"
);

fs.readFile(aliasesFilePath, "utf8", (err, bashAliasesContent) => {
  if (err) {
    console.error(chalk.red(`Error reading aliases file: ${err.message}`));
    process.exit(1);
  }

  const filePath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    ".bash_aliases"
  );

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, create it
      fs.writeFile(filePath, bashAliasesContent, (err) => {
        if (err) throw err;
        console.log(chalk.green("The ~/.bash_aliases file has been created."));
        convertLineEndings(filePath);
      });
    } else {
      // File exists, ask if it should be overwritten
      rl.question(
        chalk.yellow(
          "The ~/.bash_aliases file already exists. Do you want to overwrite it? (y (yes) / n (no)): "
        ),
        (answer) => {
          if (
            answer.trim().toLowerCase() === "y" ||
            answer.trim().toLowerCase() === "yes"
          ) {
            fs.writeFile(filePath, bashAliasesContent, (err) => {
              if (err) throw err;
              console.log(
                chalk.green("The ~/.bash_aliases file has been overwritten.")
              );
              convertLineEndings(filePath);
            });
          } else {
            console.log(
              chalk.blue("The ~/.bash_aliases file was not overwritten.")
            );
          }
          rl.close();
        }
      );
    }
  });
});

// Function to convert line endings to Unix style
function convertLineEndings(filePath) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(
        chalk.red(
          `Error reading file for line ending conversion: ${err.message}`
        )
      );
      return;
    }
    const unixData = data.replace(/\r\n/g, "\n");
    fs.writeFile(filePath, unixData, "utf8", (err) => {
      if (err) {
        console.error(
          chalk.red(`Error writing converted file: ${err.message}`)
        );
        return;
      }
      console.log(chalk.green("Line endings converted to Unix style."));
      sourceBashrc();
    });
  });
}

// Function to source the ~/.bashrc file
function sourceBashrc() {
  const bashrcPath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    ".bashrc"
  );
  exec(`bash -c 'source ${bashrcPath}'`, (err, stdout, stderr) => {
    if (err) {
      console.error(chalk.red(`Error sourcing ~/.bashrc: ${err.message}`));
      return;
    }
    console.log(chalk.green("~/.bashrc has been sourced."));
  });
}
