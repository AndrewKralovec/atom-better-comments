"use babel";
import { CompositeDisposable } from "atom";
import Parser from "./parser";
const config = require("./config-schema.json");

export default {
  config,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "better-comments:toggle": () => this.toggle()
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() {
    let editor;
    if (!(editor = atom.workspace.getActiveTextEditor())) return;
    new Parser(
      editor,
      atom.workspace
        .getActiveTextEditor()
        .getBuffer()
        .getRange()
    );
  }
};
