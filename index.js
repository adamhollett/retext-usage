/**
 * @author Adam Hollett
 * @copyright 2016 Adam Hollett
 * @license MIT
 * @module retext:usage
 * @fileoverview Check for incorrect English usage.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var keys = require('object-keys');
var difference = require('array-differ');
var nlcstToString = require('nlcst-to-string');
var quotation = require('quotation');
var search = require('nlcst-search');
var patterns = require('./data/index.json');

/*
 * List of all phrases.
 */

var list = keys(patterns);

/**
 * Attacher.
 *
 * @param {Retext} processor
 *   - Instance.
 * @param {Object?} [options]
 *   - Configuration.
 * @param {Array.<string>?} [options.ignore]
 *   - List of phrases to *not* warn about.
 * @return {Function} - `transformer`.
 */
function attacher(processor, options) {
    var ignore = (options || {}).ignore || [];
    var phrases = difference(list, ignore);

    /**
     * Search `tree` for validations.
     *
     * @param {Node} tree - NLCST node.
     * @param {VFile} file - Virtual file.
     */
    function transformer(tree, file) {
        search(tree, phrases, function (match, position, parent, phrase) {
            var pattern = patterns[phrase];
            var replace = pattern.replace;
            var value = quotation(nlcstToString(match), '“', '”');
            var message;

            if (pattern.omit && !replace.length) {
                message = 'Remove ' + value;
            } else {
                message = 'Replace ' + value + ' with ' + quotation(replace, '“', '”');
                if ( message instanceof Array ){ message.join(', '); }
                
                if (pattern.omit) {
                    message += ', or remove it';
                }
            }

            message = file.warn(message, {
                'start': match[0].position.start,
                'end': match[match.length - 1].position.end
            });

            message.ruleId = phrase;
            message.source = 'retext-usage';
        });
    }

    return transformer;
}

/*
 * Expose.
 */

module.exports = attacher;
