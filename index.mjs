#!/usr/bin/env node

import chalk from "chalk";
import { select } from "@inquirer/prompts";
import generateSSHKey from "./generateSSHKey/index.mjs";
import manageBashAliases from "./manageBashAliases/index.mjs";

async function main() {
  try {
    const utility = await select({
      message: "What task would you like to perform?",
      choices: [
        { name: "Manage Bash Aliases", value: "manageBashAliases" },
        { name: "Generate SSH Keys", value: "generateSSHKey" },
        { name: "Exit", value: "exit" },
      ],
    });

    switch (utility) {
      case "manageBashAliases":
        await manageBashAliases();
        break;

      case "generateSSHKey":
        await generateSSHKey();
        break;

      case "exit":
        console.log(chalk.yellow("Exiting the utility. Goodbye!"));
        break;

      default:
        console.log(chalk.red("Invalid choice."));
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error(chalk.red(`An error occurred: ${error.message}`));
    process.exit(1);
  }
}

main();
