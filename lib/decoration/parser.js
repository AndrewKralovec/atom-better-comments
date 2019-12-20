"use babel";

// TODO: Make regex, decoration classes, and languages configurable.
class Parser {
  constructor(editor, buffer, options) {
    this.isPlainText = false;
    this.editor = editor;
    this.buffer = buffer;
    this.onTagMatch = this.matchTag.bind(this);
    this.tags = options.getTags().map(this.setTag);

    // * this will allow plaintext files to show comment highlighting if switched on
    const singleLineEx = /(\/\/)+( |	)*(!|\?|\/\/|todo|\*)+(.*)/gi;
    const multiLineEx = /(^)+([ \t]*[ \t]*)(!|\?|\/\/|todo|\*)([ ]*|[:])+([^*\/][^\r\n]*)/gim;

    this.FindComments(singleLineEx);
    this.FindComments(multiLineEx);
    for (let tag of this.tags) {
      tag.ranges.forEach(range => this.decorateRange(range, tag));
    }
  }

  setTag(iterator) {
    let escapedSequence = iterator.tag.replace(/([()[{*+.$^\\|?])/g, "\\$1");

    // BUG: no spread operator
    return Object.assign(iterator, {
      ranges: [],
      escapedTag: escapedSequence.replace(/\//gi, "\\/") // ! hardcoded to escape slashes
    });
  }

  SetRegex(languageCode, singleLine) {
    let characters = this.tags.map(t => t.escapedTag);

    let regexFlags = this.isPlainText ? "igm" : "ig";
    let delimiter = singleLine ? this.escapeRegExp(singleLine) : "";
    // start by finding the delimiter (//, --, #, ') with optional spaces or tabs
    let expression =
      `(${delimiter.replace(/\//gi, "\\/")})+( |\t)*` +
      // Apply all configurable comment start tags
      `(${characters.join("|")})+(.*)`;

    return new RegExp(expression, regexFlags);
  }

  /**
   * Escapes a given string for use in a regular expression
   * @param input The input string to be escaped
   * @returns {string} The escaped string
   */
  escapeRegExp(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  FindComments(regEx) {
    this.editor.backwardsScanInBufferRange(regEx, this.buffer, this.onTagMatch);
  }

  matchTag(m) {
    let { range, match } = m;
    console.log(match);
    let tag = this.tags.find(
      item => item.tag.toLowerCase() === match[3].toLowerCase()
    );

    if (tag) tag.ranges.push(range);
  }

  decorateRange(range, tag) {
    let marker = this.editor.markBufferRange(range);
    // COMBAK: Find out how to store color instead of class name
    let decoration = this.editor.decorateMarker(marker, tag.decoration);
  }
}

export default Parser;
