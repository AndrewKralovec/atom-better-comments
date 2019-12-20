"use babel";

// TODO: Make regex, decoration classes, and languages configurable.
class Parser {
  constructor(editor, buffer, options) {
    this.isPlainText = false;
    this.languageCode = "javascript";
    this.editor = editor;
    this.buffer = buffer;
    this.onTagMatch = this.matchTag.bind(this);
    this.tags = options.getTags().map(this.setTag);

    // const singleLineEx = /(\/\/)+( |	)*(!|\?|\/\/|todo|\*)+(.*)/gi;
    const single = this.singleLineRegExp("//");
    // const multiLineEx = /(^)+([ \t]*[ \t]*)(!|\?|\/\/|todo|\*)([ ]*|[:])+([^*\/][^\r\n]*)/gim;
    const multi = this.multiLineRegExp();

    this.FindComments(single);
    this.FindComments(multi);
    for (let tag of this.tags) {
      tag.ranges.forEach(range => this.decorateRange(range, tag));
    }
  }

  setTag(iterator) {
    const escapedSequence = iterator.tag.replace(/([()[{*+.$^\\|?])/g, "\\$1");

    // BUG: no spread operator
    return Object.assign(iterator, {
      ranges: [],
      escapedTag: escapedSequence //.replace(/\//gi, "\\/") // ! hardcoded to escape slashes
    });
  }

  /**
   * Return single
   * NOTE: Going to be made configurable
   * @param input The input string to be escaped
   * @returns {RegExp}
   */
  singleLineRegExp(singleLine) {
    const characters = this.escapeCharacters();

    const regexFlags = this.isPlainText ? "igm" : "ig";
    const delimiter = singleLine ? this.escapeRegExp(singleLine) : "";
    // start by finding the delimiter (//, --, #, ') with optional spaces or tabs
    const expression =
      `(${delimiter.replace(/\//gi, "\\/")})+( |\t)*` +
      // Apply all configurable comment start tags
      `(${characters.join("|")})+(.*)`;
    return new RegExp(expression, regexFlags);
  }

  /**
   * Return regex matcher for custom delimter tags
   * @param input The input string to be escaped
   * @returns {RegExp}
   */
  multiLineRegExp() {
    const characters = this.escapeCharacters();

    // Combine custom delimiters and the rest of the comment block matcher
    const commentMatchString = `(^)+([ \\t]*[ \\t]*)(${characters.join(
      "|"
    )})([ ]*|[:])+([^*/][^\\r\\n]*)`;

    return new RegExp(commentMatchString, "igm");
  }

  /**
   * Return regex matcher for custom delimter tags
   * @param input The input string to be escaped
   * @returns {string} delimter regex
   */
  escapeCharacters() {
    return this.tags.map(t => t.escapedTag);
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

  /**
   * Matching Regex callback. Pushes the match ranges to the matched tag.
   * @param input The input string to be escaped
   */
  matchTag(m) {
    const { range, match } = m;
    if (match === null) return;

    let tag = this.tags.find(
      item => item.tag.toLowerCase() === match[3].toLowerCase()
    );

    if (tag) tag.ranges.push(range);
  }

  decorateRange(range, tag) {
    const marker = this.editor.markBufferRange(range);
    // COMBAK: Find out how to store color instead of class name
    const decoration = this.editor.decorateMarker(marker, tag.decoration);
  }
}

export default Parser;
