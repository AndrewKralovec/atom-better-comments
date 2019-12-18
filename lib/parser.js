"use babel";
import config from "./config";

// TODO: Make regex, decoration classes, and languages configurable.
class Parser {
  constructor(editor, buffer) {
    // TODO: Move to config later.
    this.tags = [
      {
        tag: "todo",
        color: "#FF8C00",
        strikethrough: false,
        backgroundColor: "transparent",
        ranges: []
      }
    ];

    this.editor = editor;
    this.buffer = buffer;

    const singleLineEx = /(\/\/)+( |	)*(!|\?|\/\/|todo|\*)+(.*)/gi;
    const multiLineEx = /(^)+([ \t]*[ \t]*)(!|\?|\/\/|todo|\*)([ ]*|[:])+([^*\/][^\r\n]*)/gim;

    this.FindComments(singleLineEx);
    this.FindComments(multiLineEx);
    for (let tag of this.tags) {
      tag.ranges.forEach(this.decorateRange.bind(this));
    }
  }

  FindComments(regEx) {
    this.editor.backwardsScanInBufferRange(
      regEx,
      this.buffer,
      this.matchTag.bind(this)
    );
  }

  matchTag(m) {
    let { range, match } = m;
    let tag = this.tags.find(
      item => item.tag.toLowerCase() === match[3].toLowerCase()
    );

    if (tag) tag.ranges.push(range);
  }

  decorateRange(range) {
    let marker = this.editor.markBufferRange(range);
    let decoration = this.editor.decorateMarker(marker, {
      type: "line",
      class: "my-line-class"
    });
  }
}

export default Parser;
