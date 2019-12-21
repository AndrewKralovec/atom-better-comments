"use babel";

// TODO: Make regex, decoration classes, and languages configurable.
class Parser {
  constructor(editor, buffer, options) {
    this.languageFlags = {
      delimter: undefined,
      isPlainText: false,
      supportedLanguage: true,
      highlightJSDoc: false
    };

    this.editor = editor;
    this.buffer = buffer;
    this.tags = options.getTags().map(this.setTag);
    this.onTagMatch = this.matchTag.bind(this);

    // Setup languageFlags
    this.setLanguage("javascript");

    const single = this.singleLineRegExp();
    const multi = this.multiLineRegExp();

    this.FindComments(single);
    this.FindComments(multi);
    for (let tag of this.tags) {
      tag.ranges.forEach(range => this.decorateRange(range, tag));
    }
  }

  /**
   * Sets the lanague comment delimiter [//, #, --, '], & other language options ie flags.
   * @param languageCode The short-hand code of the current language
   */
  setLanguage(languageCode) {
    switch (languageCode) {
      case "apex":
      case "javascript":
      case "javascriptreact":
      case "typescript":
      case "typescriptreact":
        this.languageFlags.delimter = "//";
        this.languageFlags.highlightJSDoc = true;
        break;
      default:
        this.languageFlags.supportedLanguage = false;
        break;
    }
  }

  /**
   * Return single
   * NOTE: Going to be made configurable
   * @param input The input string to be escaped
   * @returns {RegExp}
   */
  singleLineRegExp() {
    const characters = this.escapeCharacters().join("|");

    const regexFlags = this.languageFlags.isPlainText ? "igm" : "ig";
    const delimiter = this.languageFlags.delimter
      ? this.escapeRegExp(this.languageFlags.delimter).replace(/\//gi, "\\/")
      : "";
    // start by finding the delimiter (//, --, #, ') with optional spaces or tabs
    // Apply all configurable comment start tags
    const expression = `(${delimiter})+( |\t)*(${characters})+(.*)`;
    return new RegExp(expression, regexFlags);
  }

  /**
   * Return regex matcher for custom delimter tags
   * @param input The input string to be escaped
   * @returns {RegExp}
   */
  multiLineRegExp() {
    const characters = this.escapeCharacters().join("|");

    // Combine custom delimiters and the rest of the comment block matcher
    const commentMatchString = `(^)+([ \\t]*[ \\t]*)(${characters})([ ]*|[:])+([^*/][^\\r\\n]*)`;
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

  /**
   * Scan the atom text editor for matching tags
   * @param regEx the regular expression used to find matching tags
   */
  FindComments(regEx) {
    // Not supported, we can exit
    if (!this.languageFlags.supportedLanguage) return;

    this.editor.backwardsScanInBufferRange(regEx, this.buffer, this.onTagMatch);
  }

  /**
   * Matching Regex callback. Pushes the match ranges to the matched tag.
   * @param input The input string to be escaped
   */
  matchTag(m) {
    const { range, match } = m;
    if (match === null) return;

    // Find matching tag
    let tag = this.tags.find(
      item => item.tag.toLowerCase() === match[3].toLowerCase()
    );

    if (tag) tag.ranges.push(range);
  }

  /**
   * Set tag properties
   * @param input The current tag
   */
  setTag(iterator) {
    const escapedSequence = iterator.tag.replace(/([()[{*+.$^\\|?])/g, "\\$1");

    // BUG: no spread operator
    return Object.assign(iterator, {
      ranges: [],
      escapedTag: escapedSequence //.replace(/\//gi, "\\/") // ! hardcoded to escape slashes
    });
  }

  /**
   * Set tag properties
   * @param range matched buffer range
   * @param tag matched tag
   */
  decorateRange(range, tag) {
    const marker = this.editor.markBufferRange(range);
    // COMBAK: Find out how to store color instead of class name
    const decoration = this.editor.decorateMarker(marker, tag.decoration);
  }
}

export default Parser;
