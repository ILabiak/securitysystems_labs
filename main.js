'use strict';

const { dir } = require("console");
const fs = require("fs");
const { basename, dirname } = require("path");
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


class FileSystem {
    constructor(){
        this.user = '';
        this.rootDir =  path.join(__dirname + '/fs')
    }
}

const fileSys = new FileSystem()
console.log(fileSys.rootDir)