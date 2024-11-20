#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import generateSSHKey from "./generateSSHKey/index.mjs";
import manageBashAliases from "./manageBashAliases/index.mjs";

async function main() {
  const questions = [
    {
      type: "list",
      name: "utility",
      message: "What task would you like to perform?",
      choices: [
        { name: "Manage Bash Aliases", value: "manageBashAliases" },
        { name: "Generate SSH Keys", value: "generateSSHKey" },
        { name: "Exit", value: "exit" },
      ],
      default: "exit",
    },
  ];

  const answers = await inquirer.prompt(questions);

  switch (answers.utility) {
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
}

main().catch((error) => {
  console.error(chalk.red(`An error occurred: ${error.message}`));
  process.exit(1);
});
