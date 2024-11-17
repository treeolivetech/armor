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
      ],
    },
  ];

  const answers = await inquirer.prompt(questions);

  switch (answers.utility) {
    case "manageBashAliases":
      manageBashAliases();
      break;

    case "generateSSHKey":
      generateSSHKey();
      break;

    default:
      console.log("Invalid choice.");
      break;
  }
}

main();
