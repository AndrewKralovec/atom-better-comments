"use babel";

// TODO: Make regex, decoration classes, and languages configurable.
class Parser {
  constructor(editor, buffer) {
    // TODO: Move to config later.
    // COMBAK: Store color instead of class name
    this.tags = [
      {
        tag: "todo",
        class: "my-line-class",
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
      tag.ranges.forEach(range => this.decorateRange(range, tag.class));
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

  decorateRange(range, style = "default") {
    let marker = this.editor.markBufferRange(range);
    let decoration = this.editor.decorateMarker(marker, {
      type: "line",
      class: style
    });
  }
}

export default Parser;
