"use strict";

const { dir } = require("console");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

class FileSystem {
  constructor() {
    this.user = "";
    this.rootDir = path.join(__dirname + "/fs");
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
  }
}

(async () => {
  const fileSys = new FileSystem();
  await fileSys.start();
  console.log(fileSys.user)
  // console.log(fileSys.rootDir)
})();
