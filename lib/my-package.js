"use babel";

import MyPackageView from "./my-package-view";
import { CompositeDisposable, Point } from "atom";

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

    let selection = editor.selectAll();
    // parser.SetRegex("javascript");
    // let result = parser.FindSingleLineComments(editor);
    // let tmp = editor.selectToBufferPosition(new Point(0, 8));

    // Find First Lines
    editor.backwardsScanInBufferRange(
      /(\/\/)+( |	)*(!|\?|\/\/|todo|\*)+(.*)/gi,
      atom.workspace
        .getActiveTextEditor()
        .getBuffer()
        .getRange(),
      function(m) {
        let { range } = m;
        let marker = editor.markBufferRange(range);
        let decoration = editor.decorateMarker(marker, {
          type: "line",
          class: "my-line-class"
        });

        console.log(m);
      }
    );
  }
  // toggle() {
  //   let editor
  //   if (editor = atom.workspace.getActiveTextEditor()) {
  //     let selection = editor.getSelectedText()
  //
  //     let range = editor.getSelectedBufferRange()
  //     let marker = editor.markBufferRange(range)
  //     let decoration = editor.decorateMarker(marker, {type: 'line', class: 'my-line-class'})
  //
  //     let reversed = selection.split('').reverse().join('')
  //     editor.insertText(reversed)
  //   }
  // }
};
