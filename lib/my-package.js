"use babel";

import MyPackageView from "./my-package-view";
import { CompositeDisposable, Point } from "atom";
import Parser from "./parser";

export default {
  myPackageView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.myPackageView = new MyPackageView(state.myPackageViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.myPackageView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "my-package:toggle": () => this.toggle()
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.myPackageView.destroy();
  },

  serialize() {
    return {
      myPackageViewState: this.myPackageView.serialize()
    };
  },

  toggle() {
    let editor;
    if (!(editor = atom.workspace.getActiveTextEditor())) return;

    let parser = new Parser(
      editor,
      atom.workspace
        .getActiveTextEditor()
        .getBuffer()
        .getRange()
    );
  }
};
