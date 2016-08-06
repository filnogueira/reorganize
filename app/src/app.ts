
/// <reference path="../../typings/main/ambient/node/index.d.ts" />
/// <reference path="../../typings/main/ambient/moment/index.d.ts" />
import fs = require("fs");
import path = require("path");
import moment = require("moment");

/**
 * An output capable of recieving a string message for display.
 */
export interface StringDisplay {
  display(msg: string): void;
}

/**
 * Instance is an App controller. Automatically creates 
 * model. Creates view if none given.
 */
export class Controller {
  private rootpath: string;
  private view: View;
  private files: Model[];

  constructor(view?: View) {
    this.view = (view || new View());
  }

  public fixFiles(rootpath: string) {
    this.files = [];
    this.rootpath = rootpath;
    var dirs = fs.readdirSync(rootpath).sort((a,b) => a.localeCompare(b) );
    dirs.forEach(dir => {

      var fullpath = path.join(rootpath, dir);
      var stats = fs.statSync(fullpath);
      if (stats.isDirectory())
        this.getDirectoryFiles(fullpath);
    })
    //this.files.filter(f => !f.ok).forEach(f => console.log(f.getMoveCommand()));
  }

  private getDirectoryFiles(directory: string) {
    var self = this;

    var ftList = [".jpg", ".jpeg", ".mov", ".avi", ".iso", ".png", ".mkv", ".mp3", ".mp4"];

    var list = fs.readdirSync(directory).sort((a,b) => a.localeCompare(b) );
    for (var i = 0; i < list.length; i++) {

      var fullpath = path.join(directory, list[i]);
      var stats = fs.statSync(fullpath);

      if (!stats.isDirectory() && ftList.some(ext => path.extname(fullpath).toLowerCase() == ext)) {
        self.files.push(new Model(directory, list[i]));
      }
    }
  }

}

/**
 * Private class. Instance represents a greeting to the world.
 */
class Model {
  public rootpath: string;
  public filename: string;
  public dirname: string;
  public correctDir: string;
  public ok: boolean;
  public dirdate : Date;
  public filedate : Date;
  public dif : number;


  constructor(rootpath: string, filename: string) {
    this.rootpath = rootpath;
    this.filename = filename;

    this.dirname = path.basename(rootpath);

    this.ok = false;

    var creationdate = moment(fs.statSync(path.join(rootpath, filename)).birthtime);
    this.filedate = creationdate.toDate();

    if(this.dirname.length >= 10){
      var dirDate = moment(this.dirname.substring(0,10), "YYYY-MM-DD");
      this.dirdate = dirDate.toDate();
      this.dif = dirDate.diff(creationdate, "days");
      if(Math.abs(this.dif) < 21){
        this.ok = true;
      }
    }
    //console.log(this.dirname.indexOf(creationdate.format("YYYY-MM-DD")) + " - " + this.dirname + " - " + creationdate.format("YYYY-MM-DD"))

    if (!this.ok) {
      var newdir = creationdate.format("YYYY-MM-DD");
      this.correctDir = path.join(path.dirname(rootpath), newdir);
      console.log(this.getMoveCommand());
    }
    else {
      this.correctDir = rootpath;
    }

  }

  public getMoveCommand(): string {
    return "mv " + path.join(this.rootpath, this.filename) + " " + path.join(this.correctDir, this.filename) + " - " + 
          moment(this.dirdate).format("YYYY-MM-DD") + " - " + moment(this.filedate).format("YYYY-MM-DD") + " - " + this.dif;
  }
}

/**
 * Instance is a message logger; outputs messages to console.
 */
export class View implements StringDisplay {
  public display(msg: string): void {
    console.log(msg);
  }
}

/*
 * Factory function. Returns a default first app.
 */
export function defaultGreeter(view?: StringDisplay) {
  return new Controller();
}
