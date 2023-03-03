"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

class FileSystem {
  constructor() {
    this.user = "";
    this.rootDir = path.join(__dirname + "/fs");
    this.currentPath = path.join(__dirname + "/fs");
    this.prompt = "> ";
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start() {
    let username = await new Promise((resolve) => {
      this.rl.question("Username: ", resolve);
    });
    if (username && username.length > 0) {
      this.user = username;
    }
    // Set prompt
    this.prompt = this.user + "@" + '/' + "> "
    this.rl.setPrompt(this.prompt)

    // Start listening for input events
    this.processLines();

    this.rl.prompt()
  }

  processLines() {
    // Listen for input events
    this.rl.on("line", (input) => {
      // Handle input here
      console.log(`Received input: ${input}`);

      // Print user and prompt
      process.stdout.write(`${this.user}@${this.prompt}`);

      // Re-display input field
      this.rl.prompt();
    });

  }
}

(async () => {
  const fileSys = new FileSystem();
  await fileSys.start();

})();
