"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

class FileSystem {
  constructor() {
    this.user = "";
    this.rootDir = path.join(__dirname + "/fs/");
    this.currentPath = path.join(__dirname + "/fs/");
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
    this.prompt = this.user + "@" + "/" + "> ";
    this.rl.setPrompt(this.prompt);

    // Start listening for input events
    this.processLines();

    this.rl.prompt();
  }

  processLines() {
    // Listen for input events
    this.rl.on("line", (input) => {
      // Handle input here
      let strArr = input.split(" ");
      if (strArr[0].length < 1) {
        console.log("if works");
        this.rl.prompt();
        return;
      }
      // pwd, ls, cd, mkdir, vi, rm
      let command = strArr.shift().toLocaleLowerCase();
      if (command == "pwd") {
        console.log("/" + path.relative(this.rootDir, this.currentPath));
        // console.log("Current location: ", this.currentPath)
      }
      if (command == "cd") {
        console.log("CD command");
        // return;
      }
      if (command == "ls") {
        console.log("LS command");
        // return;
      }
      //   console.log("command: ", command);

      //   console.log(strArr);
      //   console.log(`Received input: ${input}`);

      // Re-display input field
      this.rl.prompt();
    });
  }
}

(async () => {
  const fileSys = new FileSystem();
  await fileSys.start();
})();
