"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const bcrypt = require("bcrypt");

const users = require("./users.json");
const filesData = require("./filesdata.json");

// regex for password validation (at least 8 characters, one letter and one number)
const passwordRegex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/);

// 11 11 00   (Read, Write rights for Admin, user (file owner), everyone else)

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
      if (!users[username]) {
        let createUser;
        while (createUser != "n" && createUser != "y") {
          createUser = await new Promise((resolve) => {
            this.rl.question("Do you want to add new user? (y/n): ", resolve);
          });
          console.log("val: " + createUser);
        }
        if (createUser == "y") {
          await this.addUser(username)
        } else {
          process.exit(1);
        }
        // users[username] = {
        //   passhash: "123",
        //   isAdmin: false,
        // };
        // fs.writeFileSync("./users.json", JSON.stringify(users));
      }
    }
    // Set prompt
    this.prompt = this.user + "@" + "/" + "> ";
    this.rl.setPrompt(this.prompt);

    // Start listening for input events
    await this.processLines();

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
      switch (command) {
        case "pwd":
          console.log("/" + path.relative(this.rootDir, this.currentPath));
          break;
        case "ls":
          this.listFiles();
          break;
        case "cd":
          this.changeDir(strArr[0]);
          break;
        case "mkdir":
          this.makeDir(strArr[0]);
          break;
        case "vi":
          if (strArr.length < 2) {
            console.log("Not enough arguments. vi [filename] [file content]");
            break;
          }
          const fileName = strArr.shift();
          const fileContent = strArr.join(" ").replace(/\\n/g, "\n");
          this.createAndEditFile(fileName, fileContent);
          break;

        case "rm":
          if (!strArr[0]) {
            console.log("rm [file]");
          }
          this.removeFile(strArr[0]);
          break;
        case "exit":
          process.exit(1);
        default:
          break;
      }

      // Re-display input field
      this.rl.prompt();
    });
  }

  listFiles() {
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
  }

  changeDir(dirName) {
    if (!dirName || dirName.length < 1) return;
    let newPath = path.join(this.currentPath, dirName) + "/";
    let filePath = path.relative(this.rootDir, newPath);
    if (!fs.existsSync(newPath) || !newPath.includes(this.rootDir)) {
      console.log(newPath);
      console.log("cd: no such file or directory:", filePath);
      return;
    }
    if (newPath == this.rootDir) {
      this.prompt = this.user + "@" + "/" + "> ";
      this.currentPath = this.rootDir;
      this.rl.setPrompt(this.prompt);
      return;
    }
    if (filesData[filePath]) {
      let { rights, owner } = filesData[filePath];
      if (
        (this.user == owner && rights.slice(2, 3) == "1") ||
        (users[this.user] && users[this.user]?.isAdmin) ||
        rights.slice(4, 5) == "1"
      ) {
        this.currentPath = newPath;
        this.prompt = this.user + "@" + path.basename(this.currentPath) + "> ";
        this.rl.setPrompt(this.prompt);
      } else {
        console.log("cd: you have no rights to view this folder:", filePath);
      }
    }
  }

  makeDir(dirName) {
    if (!dirName || dirName.length < 1) return;
    let newPath = path.join(this.currentPath, dirName) + "/";
    let filePath = path.relative(this.rootDir, newPath);
    if (filePath.length < 1) return;
    if (fs.existsSync(newPath)) {
      console.log(`mkdir: ${filePath}: File exists`);
      return;
    }
    fs.mkdirSync(newPath);
    filesData[filePath] = {
      "type ": "folder",
      owner: this.user,
      rights: "111110",
    };
    fs.writeFileSync("./filesdata.json", JSON.stringify(filesData));
  }

  createAndEditFile(filePath, fileText) {
    if (filePath.length < 1 || fileText.length < 1) return;
    let fileFullPath = path.join(this.currentPath, filePath);
    let relativePath = path.relative(this.rootDir, fileFullPath);
    if (!fs.existsSync(fileFullPath) || !filesData[relativePath]) {
      fs.writeFileSync(fileFullPath, fileText);
      filesData[relativePath] = {
        type: "file",
        owner: this.user,
        rights: "111100",
      };
      fs.writeFileSync("./filesdata.json", JSON.stringify(filesData));
      return;
    }
    let { rights, owner } = filesData[relativePath];
    if (
      (this.user == owner && rights.slice(2, 4) == "11") ||
      (users[this.user] && users[this.user]?.isAdmin) ||
      rights.slice(4, 6) == "11"
    ) {
      fs.writeFileSync(fileFullPath, fileText);
    } else {
      console.log(
        "cd: you have no rights to view and edit this file:",
        relativePath
      );
    }
  }

  removeFile(file) {
    let filePath = path.join(this.currentPath, file);
    let relativePath = path.relative(this.rootDir, filePath);
    if (!fs.existsSync(filePath) || !filesData[relativePath]) return;
    let { rights, owner, type } = filesData[relativePath];
    if (type == "drive") {
      console.log("You can't delete a drive");
      return;
    }
    if (
      (this.user == owner && rights.slice(3, 4) == "1") ||
      (users[this.user] && users[this.user]?.isAdmin) ||
      rights.slice(5, 6) == "1"
    ) {
      fs.rmSync(filePath, { recursive: true });
      delete filesData[relativePath];
      fs.writeFileSync("./filesdata.json", JSON.stringify(filesData));
    } else {
      console.log("You have no rights to delete this file or folder");
    }
  }

  async addUser(username) {
    let password = "";
    while (true){
      password = await new Promise((resolve) => {
        this.rl.question("Enter password for user " + username + ": ", resolve);
      });
      if(passwordRegex.test(password)){
        break;
      }
      console.log('Your password should be at leas 8 characters and contain at least one character and one number. Try again')
    }
    console.log('password\'s good')
  }
}

(async () => {
  const fileSys = new FileSystem();
  await fileSys.start();
})();
