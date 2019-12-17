"use babel";

// Todo: Make regex, decoration classes, and languages configurable.
class Parser {
  constructor(editor, buffer) {
    this.editor = editor;
    this.buffer = buffer;
    this.FindBlockComments();
  }
  /**
   * Finds all single line comments delimted by a given delimter and matching tags specified in package.json
   */
  FindSingleLineComments() {
    const singleLineEx = /(\/\/)+( |	)*(!|\?|\/\/|todo|\*)+(.*)/gi;
    // Find multiline comments
    this.editor.backwardsScanInBufferRange(
      singleLineEx,
      this.buffer,
      this.decorate.bind(this)
    );
  }

  /**
   * Finds block comments as indicated by start and end delimiter
   */
  FindBlockComments() {
    const multiLineEx = /(^)+([ \t]*[ \t]*)(!|\?|\/\/|todo|\*)([ ]*|[:])+([^*\/][^\r\n]*)/gim;
    // Find multiline comments
    this.editor.backwardsScanInBufferRange(
      multiLineEx,
      this.buffer,
      this.decorate.bind(this)
    );
  }

  decorate(m) {
    let { range } = m;
    let marker = this.editor.markBufferRange(range);
    let decoration = this.editor.decorateMarker(marker, {
      type: "line",
      class: "my-line-class"
    });
  }
}

export default Parser;
