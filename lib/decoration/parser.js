"use babel";

// TODO: Make regex, decoration classes, and languages configurable.
class Parser {
  constructor(editor, buffer, options) {
    this.languageFlags = {
      blockCommentEnd: undefined,
      blockCommentStart: undefined,
      delimter: undefined,
      highlightJSDoc: false,
      isPlainText: false,
      supportedLanguage: true
    };

    this.editor = editor;
    this.buffer = buffer;
    this.tags = options.getTags().map(this.setTag);

    // Setup languageFlags
    this.setLanguage("javascript");
    // Find tags in buffer
    this.matchSingleLine();
    this.matchBlockLine();

    for (let tag of this.tags) {
      // COMBAK: Refactor clear out ranges array after a tag has been decorated
      tag.ranges.forEach(range => this.decorateRange(range, tag));
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
  blockLineRegExp() {
    const start = this.languageFlags.blockCommentStart;
    const end = this.languageFlags.blockCommentEnd;
    const regexString = `(^|[ \\t])(${start}[\\s])+([\\s\\S]*?)(${end})`;
    return new RegExp(regexString, "gm");
  }

  /**
   * Search for single line comments. Add tags for the comments in that matched range
   */
  matchSingleLine() {
    const regEx = this.singleLineRegExp();
    this.FindComments(regEx, this.buffer, m => {
      const { range, match } = m;
      if (match === null) return;

      this.apppendMatch(match[3], range);
    });
  }

  /**
   * Search for block comments. Once matched, scan that matched range
   * Add tags for the comments in that matched range
   */
  matchBlockLine() {
    const regExp = this.blockLineRegExp();
    const characters = this.escapeCharacters().join("|");
    const comments = `(^)+([ \\t]*[ \\t]*)(${characters})([ ]*|[:])+([^*/][^\\r\\n]*)`;
    let commentRegExp = new RegExp(comments, "igm");

    // First find the block comments in buffer
    this.FindComments(regExp, this.buffer, m => {
      this.FindComments(commentRegExp, m.range, c => {
        /* BUG: match is null for some tags, but a match is found.
           I need to find out why for some tags have a null match.
           This limits a shared function
        */
        const { range, match, matchText } = c;
        if (match === null && matchText === null) return;

        this.apppendMatch(
          match === null ? matchText : match[3] || matchText,
          range
        );
      });
    });
  }

  /**
   * Find matching tag, and append the matched range
   * @param match match found
   * @param range range of the matched text
   */
  apppendMatch(match, range) {
    const tag = this.searchTags(match);
    if (tag) tag.ranges.push(range);
  }

  /**
   * Scan the atom text editor for matching tags
   * @param regEx the regular expression used to find matching tags
   */
  FindComments(regExp, range, onMatch) {
    // Not supported, we can exit
    if (!this.languageFlags.supportedLanguage) return;

    this.editor.backwardsScanInBufferRange(regExp, range, onMatch);
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
      escapedTag: escapedSequence.replace(/\//gi, "\\/") // ! hardcoded to escape slashes
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

  /**
   * Search for tag
   * @param match tag name
   * @returns {Object} tag
   */
  searchTags(match) {
    return this.tags.find(
      item => item.tag.toLowerCase() === match.toLowerCase()
    );
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
   * Sets the lanague comment delimiter [//, #, --, '], & other language options ie flags.
   * @param languageCode The short-hand code of the current language
   */
  setLanguage(languageCode) {
    const flags = {};
    switch (languageCode) {
      case "apex":
      case "javascript":
      case "typescript":
        flags.delimter = "//";
        flags.blockCommentStart = this.escapeRegExp("/*");
        flags.blockCommentEnd = this.escapeRegExp("*/");
        flags.highlightJSDoc = true;
        break;
      case "c":
      case "cpp":
      case "csharp":
      case "go":
      case "java":
      case "less":
      case "php":
      case "rust":
      case "scala":
      case "scss":
      case "vue":
        flags.delimter = "//";
        flags.blockCommentStart = this.escapeRegExp("/*");
        flags.blockCommentEnd = this.escapeRegExp("*/");
        break;
      case "sql":
        flags.delimter = "--";
        break;
      case "coffeescript":
      case "dockerfile":
      case "r":
      case "ruby":
      case "shellscript":
      case "yaml":
      case "python":
        flags.delimter = "#";
        break;
      default:
        flags.supportedLanguage = false;
        break;
    }
    Object.assign(this.languageFlags, flags);
  }
}

export default Parser;
