import chalk from "chalk";
import readline from "readline";

export default function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(chalk.cyan(query), (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}
