"use strict";
/// <reference path="../../typings/main/ambient/node/index.d.ts" />
/// <reference path="../../typings/main/ambient/moment/index.d.ts" />
var fs = require("fs");
var path = require("path");
var moment = require("moment");
/**
 * Instance is an App controller. Automatically creates
 * model. Creates view if none given.
 */
var Controller = (function () {
    function Controller(view) {
        this.view = (view || new View());
    }
    Controller.prototype.fixFiles = function (rootpath) {
        var _this = this;
        this.files = [];
        this.rootpath = rootpath;
        var dirs = fs.readdirSync(rootpath).sort(function (a, b) { return a.localeCompare(b); });
        dirs.forEach(function (dir) {
            var fullpath = path.join(rootpath, dir);
            var stats = fs.statSync(fullpath);
            if (stats.isDirectory())
                _this.getDirectoryFiles(fullpath);
        });
        //this.files.filter(f => !f.ok).forEach(f => console.log(f.getMoveCommand()));
    };
    Controller.prototype.getDirectoryFiles = function (directory) {
        var self = this;
        var ftList = [".jpg", ".jpeg", ".mov", ".avi", ".iso", ".png", ".mkv", ".mp3", ".mp4"];
        var list = fs.readdirSync(directory).sort(function (a, b) { return a.localeCompare(b); });
        for (var i = 0; i < list.length; i++) {
            var fullpath = path.join(directory, list[i]);
            var stats = fs.statSync(fullpath);
            if (!stats.isDirectory() && ftList.some(function (ext) { return path.extname(fullpath).toLowerCase() == ext; })) {
                self.files.push(new Model(directory, list[i]));
            }
        }
    };
    return Controller;
}());
exports.Controller = Controller;
/**
 * Private class. Instance represents a greeting to the world.
 */
var Model = (function () {
    function Model(rootpath, filename) {
        this.rootpath = rootpath;
        this.filename = filename;
        this.dirname = path.basename(rootpath);
        this.ok = false;
        var creationdate = moment(fs.statSync(path.join(rootpath, filename)).birthtime);
        this.filedate = creationdate.toDate();
        if (this.dirname.length >= 10) {
            var dirDate = moment(this.dirname.substring(0, 10), "YYYY-MM-DD");
            this.dirdate = dirDate.toDate();
            this.dif = dirDate.diff(creationdate, "days");
            if (Math.abs(this.dif) < 21) {
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
    Model.prototype.getMoveCommand = function () {
        return "mkdir -p " + this.correctDir.replace(" ", "\\ ") + "; mv -i " + path.join(this.rootpath, this.filename).replace(" ", "\\ ") + " $_ "; //|| " + 
        //moment(this.dirdate).format("YYYY-MM-DD") + " - " + moment(this.filedate).format("YYYY-MM-DD") + " - " + this.dif;
    };
    return Model;
}());
/**
 * Instance is a message logger; outputs messages to console.
 */
var View = (function () {
    function View() {
    }
    View.prototype.display = function (msg) {
        console.log(msg);
    };
    return View;
}());
exports.View = View;
/*
 * Factory function. Returns a default first app.
 */
function defaultGreeter(view) {
    return new Controller();
}
exports.defaultGreeter = defaultGreeter;
