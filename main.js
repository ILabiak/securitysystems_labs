"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const users = require("./users.json");
const filesData = require("./filesdata.json");

// 11 11 00   (Read, Write rights for Admin, user (file owner), everyone else)

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

class FileSystem {
  constructor() {
    this.user = "";
    this.rootDir = path.join(__dirname + "/fs/");
    this.currentPath = path.join(__dirname + "/fs/A");
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
        this.rl.prompt();
        return;
      }
      // pwd, ls, cd, mkdir, vi, rm
      let command = strArr.shift().toLocaleLowerCase();
      if (command == "pwd") {
        console.log("/" + path.relative(this.rootDir, this.currentPath));
        this.rl.prompt();
        return;
      }
      if (command == "ls") {
        fs.readdirSync(this.currentPath).forEach((file) => {
          let filePath = path.relative(
            this.rootDir,
            path.join(this.currentPath, file)
          );
          if (filesData[filePath]) {
            let { rights, owner } = filesData[filePath];
            if (
              (this.user == owner && rights.slice(2, 3) == "1") ||
              (users[this.user] && users[this.user]?.isAdmin) ||
              rights.slice(4, 5) == "1"
            ) {
              console.log(file);
            }
          }
        });
        this.rl.prompt();
        return;
      }
      if (command == "cd") {
        console.log("CD command");
        // return;
      }
      //   console.log("command: ", command);

      //   console.log(strArr);
      //   console.log(`Received input: ${input}`);

      // Re-display input field
    });
  }
}

(async () => {
  const fileSys = new FileSystem();
  await fileSys.start();
})();
