/**
 * @fileoverview helper to test config files.
 * Adapted from ESLint's RuleTester
 * and eslint-config-tester (https://www.npmjs.com/package/eslint-config-tester)
 * @author Agoric
 */

const assert = require('assert');
const eslint = require('eslint');

const configTester = (ruleName, configFile, testFile) => {
  const cli = new eslint.CLIEngine(configFile);

  /**
   * Check if the template is valid or not
   * all valid cases go through this
   * @param {string} text to run the rule against
   * @returns {void}
   * @private
   */
  const testValidTemplate = text => {
    const report = cli.executeOnText(text);
    const errorCount = report.results.reduce(
      (count, result) => count + result.errorCount,
      0,
    );

    assert.strictEqual(
      errorCount,
      0,
      `Should have no errors but had ${errorCount}:\n${report.results}`,
    );
  };

  const compareSingleErrorMessageToExpected = (
    actualErrorMsg,
    expectedErrorMsg,
  ) => {
    assert(
      typeof expectedErrorMsg === 'string',
      `Error should be a string, but found (${expectedErrorMsg})`,
    );
    assert(
      !actualErrorMsg.fatal,
      `A fatal parsing error occurred: ${actualErrorMsg.message}`,
    );
    assert.strictEqual(actualErrorMsg, expectedErrorMsg);
  };

  const compareErrorMessagesToExpected = (
    actualErrorMsgs,
    expectedErrorMsgs,
  ) => {
    assert.strictEqual(
      actualErrorMsgs.length,
      expectedErrorMsgs.length,
      `Should have ${expectedErrorMsgs.length} error${
        expectedErrorMsgs.length === 1 ? '' : 's'
      } but had ${actualErrorMsgs.length}: \n${actualErrorMsgs}`,
    );
    actualErrorMsgs.forEach((_, index) =>
      compareSingleErrorMessageToExpected(
        actualErrorMsgs[index].message,
        expectedErrorMsgs[index],
      ),
    );
  };

  /**
   * Check if the template is invalid or not
   * all invalid cases go through this.
   * @param {Object} item Item to run the rule against
   * @returns {void}
   * @private
   */
  const testInvalidTemplate = item => {
    assert.ok(
      item.errors || item.errors === 0,
      'Did not specify errors for an invalid test',
    );

    const report = cli.executeOnText(item.code);

    report.results.forEach(result => {
      compareErrorMessagesToExpected(result.messages, item.errors);
    });
  };

  // testFile should have valid and invalid examples

  describe(ruleName, () => {
    describe('valid', () => {
      testFile.valid.forEach(valid => {
        it(valid, () => {
          testValidTemplate(valid);
        });
      });
    });

    describe('invalid', () => {
      testFile.invalid.forEach(invalid => {
        it(invalid.code, () => {
          testInvalidTemplate(invalid);
        });
      });
    });
  });
};

module.exports = configTester;
