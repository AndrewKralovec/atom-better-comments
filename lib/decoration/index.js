"use babel";
import Parser from "./parser";

export default options => () => {
  // COMBAK: abstract atom away from this function later
  let editor;
  if (!(editor = atom.workspace.getActiveTextEditor())) return;
  new Parser(
    editor,
    atom.workspace
      .getActiveTextEditor()
      .getBuffer()
      .getRange(),
    options
  );
};
