import fs from "fs";
import path from "path";
import readline from "readline";

// Define the path to the aliases file
const aliasesFilePath = path.join(process.cwd(), "aliases.txt");

fs.readFile(aliasesFilePath, "utf8", (err, bashAliasesContent) => {
  if (err) {
    console.error(`Error reading aliases file: ${err.message}`);
    process.exit(1);
  }

  const filePath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    ".bash_aliases"
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, create it
      fs.writeFile(filePath, bashAliasesContent, (err) => {
        if (err) throw err;
        console.log("The ~/.bash_aliases file has been created.");
      });
    } else {
      // File exists, ask if it should be overwritten
      rl.question(
        "The ~/.bash_aliases file already exists. Do you want to overwrite it? (y (yes) / n (no)): ",
        (answer) => {
          if (
            answer.trim().toLowerCase() === "y" ||
            answer.trim().toLowerCase() === "yes"
          ) {
            fs.writeFile(filePath, bashAliasesContent, (err) => {
              if (err) throw err;
              console.log("The ~/.bash_aliases file has been overwritten.");
            });
          } else {
            console.log("The ~/.bash_aliases file was not overwritten.");
          }
          rl.close();
        }
      );
    }
  });
});
