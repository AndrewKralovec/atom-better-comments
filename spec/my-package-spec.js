"use babel";

import MyPackage from "../lib/better-comments";

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe("MyPackage", () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage("atom-better-comments");
  });

  describe("when the better-comments:format event is triggered", () => {
    it("hides and shows the modal panel", () => {
      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, "better-comments:format");

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        atom.commands
          .dispatch(workspaceElement, "better-comments:format")
          .then(result => expect(result).toContain(undefined));
      });
    });
  });
});
