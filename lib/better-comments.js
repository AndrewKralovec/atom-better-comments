"use babel";
import { CompositeDisposable } from "atom";
import decoration from "./decoration";
import options from "./options";
const config = require("./config-schema.json");

export default {
  config,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        console.log("Editor changed", editor);
      })
    );
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "better-comments:format": decoration(options)
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  }
};
