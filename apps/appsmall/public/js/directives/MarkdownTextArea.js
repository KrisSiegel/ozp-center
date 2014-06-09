/**
 * 
 *
 * @module directivesModule
 * @submodule MarkdownTextAreaModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class MarkdownTextAreaDirective
 * @static
 */ 

/**
 * @class MarkdownTextAreaDirective
 * @constructor
 */
var MarkdownTextAreaDirective = [function() {
    var converter = new Showdown.converter();

    // Markdown syntax patterns:
    // Header: "# Level 1 Header", "##### Level 5 Header", and everything in between
    // Bold: "**bold**" or "__bold__"
    // Emphasis: "*emphasized*" -- make sure it matches one "*" or "_", and not two of either pattern.  (The italic pattern below performs lookahead
    //           to ensure that only one of the "*" or "_" character type appears in the pattern, and that they can be combined such as "_**ItalicAndBold**_".)
    // (NOTE: Bold and Italic patterns recognize whitespace boundaries, and will always enclose non-whitespace characters on either end of the pattern.
    //        The '\s' parts of the bold and italic regexes below match the boundary whitespace.)
    // Bullet: line starting with "* "
    // Number: line starting with "# "
    var markdownToggleAddRegexes = {
        header: {pattern: /^\n*(.*)$/, replacement: '\n### $1\n'},
        bold:   {pattern: /^(\s*)(.*[^\s])(\s*)$/, replacement: '$1**$2**$3'},
        italic: {pattern: /^(\s*)(.*[^\s])(\s*)$/, replacement: '$1_$2_$3'},
        bullet: {pattern: /^\n*\s*(.*)\s*$/, replacement: '\n\n* $1\n\n'},
        number: {pattern: /^\n*\s*(.*)\s*$/, replacement: '\n\n1. $1\n\n'}
    };

    // Patterns to convert markdown syntax patterns (above) back to the original pre-pattern text.
    // (In some cases, such as the header pattern matcher, the pattern matches Markdown patterns that are not generated via this directive.)
    // The italic pattern is especially hairy because it specifically avoids matching the bold pattern.
    var markdownToggleRemovalRegexes = {
        header: {pattern: /\n*[\#]{1,5} ([^\n]+)\n*/g, replacement: "$1"},
        bold:   {pattern: /\*\*([^\*]+)\*\*|\_\_([^\_]+)\_\_/g, replacement: "$1$2"},
        italic: {pattern: /(^|[^*])\*([^*].*?[^*])\*(?=$|[^*])|(^|[^_])\_([^_].*?[^_])\_(?=$|[^_])/g, replacement: "$1$2$3$4"},
        bullet: {pattern: /^\* ([^\n]+)|\n+\* ([^\n]+)/g, replacement: "$1$2 "},
        number: {pattern: /^[0-9]+\. ([^\n]+)|\n+[0-9]+\. ([^\n]+)/g, replacement: "$1$2 "}
    };

    // other patterns for cleaning up unsightly spaces in description text.
    // Spaces in the beginning and end of the text are cleaned up, and any empty block of space more than 2 lines long is cleaned up.
    var miscPatterns = [
        {pattern: /^\n+/, replacement: ''},
        {pattern: /\n+$/, replacement: '\n'},
        {pattern: /\n\s*\n\s*\n*/g, replacement: '\n\n'},
    ]

    return {
        restrict: 'E',
        template: '<div><div class="paragraph-styling-bar"><span style="display:none;text-transform:uppercase;" class="markdown-text"></span>' +
                  '<button ng-click="editText(\'header\')" data-edittype="header" title="Header" class="btn-font-size"><span class="icon-font-size"></span></button>' +
                  '<button ng-click="editText(\'bold\')" data-edittype="bold"  title="Bold" class="btn-bold"><span class="icon-bold"></span></button>' +
                  '<button ng-click="editText(\'italic\')" data-edittype="italic" title="Italic" class="btn-italics"><span class="icon-italics"></span></button>' +
                  '<button ng-click="editText(\'bullet\')" data-edittype="bullet" title="Bullet" class="btn-bulleted-list"><span class="icon-bulleted-list"></span></button>' +
                  '<button ng-click="editText(\'number\')" data-edittype="number" title="Number" class="btn-numbered-list"><span class="icon-numbered-list"></span></button>' +
                  '<button ng-click="resetText()" class="reset-link"><span class="icon-reply"></span></button>' +
                  '<a ng-click="togglePreview()" class="preview-link" >{{previewtext}}</a></div>' +
                  '<div style="display:none" class="markdown-text"></div>' +
                  '<textarea step="any" name="markdownControl" class="input-medium" style="min-height:180px; width:100%;" ng-model="text" ng-mouseup="highlightButtons()" ng-mouseleave="highlightButtons()" required placeholder="Enter Full Description" tabindex="5"></textarea></div>',
        scope: {
            text: '='
        },
        link: function(scope, element, attrs) {
            var originalText = _.clone(scope.text);
            var $markdownPreview = $(element).find('div.markdown-text');
            var $markdownTextarea = $(element).find('textarea');
            var $buttons = $(element).find('.paragraph-styling-bar button');
            var lastHighlightedText = {text:''};

            scope.resetText = function() { scope.text = _.clone(originalText); }

            scope.selectUnselectButton = function(selected, button) {
                if (selected) {
                    $(button).addClass('selected-button').find('span').addClass('selected-button');
                    console.log('Selected: ' + $(button).data('edittype'));
                }
                else {
                    $(button).removeClass('selected-button').find('span').removeClass('selected-button');
                    console.log('Unselected: ' + $(button).data('edittype'));
                }
            }

            // fired when user highlights a section of text
            scope.highlightButtons = function() {
                var textSelectionObj = getSelectionObject($markdownTextarea[0]);
                // don't repeat highlight action if text did not change
                if (lastHighlightedText.text !== textSelectionObj.text) {
                    _.each($buttons, function(button) { return this.highlightButton(button, textSelectionObj.text); }, this);
                    lastHighlightedText = textSelectionObj;
                }
            }

            scope.highlightButton = function(button, textSelection) {
                var edit_type = $(button).data('edittype');
                var patternRegex = (markdownToggleRemovalRegexes[edit_type] || {}).pattern;
                if (!textSelection) {
                    textSelection = (getSelectionObject($markdownTextarea[0]) || {}).text;
                }
                this.selectUnselectButton(patternRegex.test(textSelection), button);
            }

            // fired when user clicks on edit button
            scope.editText = function(editButtonType) {
                var fullText = $markdownTextarea.val();
                var textSelectionObj = getSelectionObject($markdownTextarea[0]);
                var $button = $('.paragraph-styling-bar button[data-edittype="' + editButtonType + '"]');

                // Current toggle button functionality:
                // Check if one or more instances of markdown pattern already exists within user-selected text, and if it does then run
                //    removal regex to remove all instances of the pattern (bold, italic, etc.) within the user-selected text.
                // If pattern doesn't exist, then apply pattern to selection.
                // (This makes regex-based toggling easier, but doesn't match MSWord markup-toggle functionality: check whether the beginning of the user-selected text string
                //    contains the selected markup feature, and toggle based on that.)
                var patternRegex = (markdownToggleRemovalRegexes[editButtonType] || {}).pattern;

                if ((_.isString(textSelectionObj.text)) && (patternRegex instanceof RegExp)) {
                    var regexModifiedSelectedText;
                    var matches = textSelectionObj.text.match(patternRegex) || [];
                    if (matches.length > 0) {
                        regexModifiedSelectedText = textSelectionObj.text.replace(patternRegex, markdownToggleRemovalRegexes[editButtonType].replacement);
                    }
                    else {
                        var formatRegex = (markdownToggleAddRegexes[editButtonType] || {}).pattern;
                        regexModifiedSelectedText = textSelectionObj.text.replace(formatRegex, markdownToggleAddRegexes[editButtonType].replacement);
                    }
                    // make changes to selected text within entire text string, then copy new text string into control
                    var modifiedFullText = fullText.substring(0, textSelectionObj.startPos) + regexModifiedSelectedText + fullText.substring(textSelectionObj.endPos);

                    // make additional replacements, then assign to text string
                    _.each(miscPatterns, function(miscPattern) {
                        if (miscPattern.pattern.test(modifiedFullText)) {
                            modifiedFullText = modifiedFullText.replace(miscPattern.pattern, miscPattern.replacement);
                        }
                    });
                    // RWP TEMP: clicking an edit button causes selection to lose focus; code below is unnecessary if focus is lost on change.
                    scope.text = modifiedFullText;
                    scope.highlightButton($button, regexModifiedSelectedText);
                }

            }
            $markdownPreview.html(converter.makeHtml(scope.text || ''));
            scope.previewtext = 'Show Preview'
            scope.togglePreview = function() {
                if (scope.isPreview) {
                    $markdownPreview.hide();
                    $markdownTextarea.show();
                    scope.previewtext = 'Show Preview';
                }
                else {
                    $markdownPreview.html(converter.makeHtml(scope.text || '')).show();
                    $markdownTextarea.hide();
                    scope.previewtext = 'Edit';
                }
                scope.isPreview = !(scope.isPreview);
            }
        }
    };
}];

// gets selected (highlighted) text from textarea control and returns text and start/end location indexes
function getSelectionObject(textComponent) {
    var selectedText = '';
    var startPos = 0;
    var endPos = 0;
    // IE version
    if (document.selection != undefined) {
        textComponent.focus();
        var sel = document.selection.createRange();
        selectedText = sel.text;
        endPos = startPos + selectedText.length;
    }
    // Mozilla version
    else if (textComponent.selectionStart != undefined) {
        startPos = textComponent.selectionStart;
        endPos = textComponent.selectionEnd;
        selectedText = textComponent.value.substring(startPos, endPos);
    }
    return {startPos: startPos, endPos: endPos, text: selectedText};
}

directivesModule.directive('markdownTextArea', MarkdownTextAreaDirective);
