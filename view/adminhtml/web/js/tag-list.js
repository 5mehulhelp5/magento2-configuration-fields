/**
 * Copyright (c) 2025. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

define(['jquery'], function ($) {
    'use strict';

    // Error types
    var ERROR_EMPTY = 'empty';
    var ERROR_INVALID = 'invalid';
    var ERROR_DUPLICATE = 'duplicate';

    return function (config) {
        var inputId = config.inputId;
        var values = config.values || [];
        var validationPattern = config.validation ? new RegExp(config.validation) : /^[A-Za-z0-9]+$/;
        var uppercase = config.uppercase !== false;
        var separator = config.separator || '\n';
        var errorTimeout = null;

        var $root = $('#tag-list-' + inputId);
        var $container = $('#tag-list-container-' + inputId);
        var $input = $('#tag-list-input-' + inputId);
        var $hidden = $('#' + inputId);
        var $inheritCheckbox = $('#' + inputId + '_inherit');
        var $errorMessage = $('<div>').addClass('tag-list-error-message').insertAfter($container);

        /**
         * Show error message with shake animation
         * @param {string} message
         */
        function showError(message) {
            // Clear any existing timeout
            if (errorTimeout) {
                clearTimeout(errorTimeout);
            }

            // Remove and re-add error class to restart animation
            $container.removeClass('tag-list-error');
            // Force reflow to restart animation
            void $container[0].offsetWidth;
            $container.addClass('tag-list-error');

            $errorMessage.text(message).addClass('visible');

            // Auto-hide after 3 seconds
            errorTimeout = setTimeout(function () {
                clearError();
            }, 3000);
        }

        /**
         * Clear error state
         */
        function clearError() {
            $container.removeClass('tag-list-error');
            $errorMessage.removeClass('visible').text('');
            if (errorTimeout) {
                clearTimeout(errorTimeout);
                errorTimeout = null;
            }
        }

        /**
         * Update disabled state based on inherit checkbox
         */
        function updateInheritState() {
            var isInherited = $inheritCheckbox.is(':checked');
            $container.toggleClass('tag-list-disabled', isInherited);
            $input.prop('disabled', isInherited);
        }

        /**
         * Uncheck inherit checkbox when user makes changes
         */
        function uncheckInherit() {
            if ($inheritCheckbox.is(':checked')) {
                $inheritCheckbox.prop('checked', false).trigger('change');
                updateInheritState();
            }
        }

        /**
         * Create a tag element
         * @param {string} value
         * @returns {jQuery}
         */
        function createTag(value) {
            var $tag = $('<span>')
                .addClass('tag-list-tag')
                .attr('data-value', value)
                .text(value);

            var $removeBtn = $('<span>')
                .addClass('tag-list-remove')
                .html('&times;')
                .on('click', function () {
                    uncheckInherit();
                    $tag.remove();
                    updateHidden();
                });

            $tag.append($removeBtn);
            return $tag;
        }

        /**
         * Update hidden input with current tag values
         */
        function updateHidden() {
            var tagValues = [];
            $container.find('.tag-list-tag').each(function () {
                tagValues.push($(this).attr('data-value'));
            });
            $hidden.val(tagValues.join(separator));
        }

        /**
         * Add a new tag
         * @param {string} value
         * @returns {string|null} Error type or null on success
         */
        function addTag(value) {
            if (uppercase) {
                value = value.toUpperCase();
            }
            value = value.trim();

            // Check empty
            if (!value) {
                return ERROR_EMPTY;
            }

            // Validate pattern
            if (!validationPattern.test(value)) {
                return ERROR_INVALID;
            }

            // Check for duplicates
            var exists = false;
            $container.find('.tag-list-tag').each(function () {
                if ($(this).attr('data-value') === value) {
                    exists = true;
                    return false;
                }
            });

            if (exists) {
                return ERROR_DUPLICATE;
            }

            uncheckInherit();
            var $tag = createTag(value);
            $tag.insertBefore($input);
            updateHidden();
            clearError();
            return null; // Success
        }

        // Initialize inherit checkbox handling
        if ($inheritCheckbox.length) {
            $inheritCheckbox.on('change', updateInheritState);
            updateInheritState();
        }

        // Initialize existing tags
        if (values && values.length > 0) {
            values.forEach(function (value) {
                if (value) {
                    var $tag = createTag(value);
                    $tag.insertBefore($input);
                }
            });
            updateHidden();
        }

        /**
         * Get error message for error type
         * @param {string} errorType
         * @returns {string}
         */
        function getErrorMessage(errorType) {
            switch (errorType) {
                case ERROR_EMPTY:
                    return 'Please enter a value.';
                case ERROR_INVALID:
                    return config.validationMessage || 'Invalid format. Please use only letters and numbers.';
                case ERROR_DUPLICATE:
                    return 'This value already exists.';
                default:
                    return 'Invalid value.';
            }
        }

        // Handle Enter key
        $input.on('keydown', function (e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                var value = $input.val();
                var error = addTag(value);

                if (error === null) {
                    // Success
                    $input.val('');
                } else if (error !== ERROR_EMPTY) {
                    // Show error (but not for empty - just ignore empty Enter)
                    showError(getErrorMessage(error));
                }
            }

            // Remove last tag on Backspace if input is empty
            if ((e.key === 'Backspace' || e.keyCode === 8) && !$input.val()) {
                var $lastTag = $container.find('.tag-list-tag').last();
                if ($lastTag.length) {
                    uncheckInherit();
                    $lastTag.remove();
                    updateHidden();
                    clearError();
                }
            }
        });

        // Clear error on input
        $input.on('input', function () {
            clearError();
        });

        // Handle paste (multiple values separated by newlines or commas)
        $input.on('paste', function (e) {
            e.preventDefault();
            var pasteData = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
            var pastedValues = pasteData.split(/[\r\n,]+/);

            pastedValues.forEach(function (value) {
                addTag(value);
            });

            $input.val('');
        });

        // Focus input when clicking container
        $container.on('click', function (e) {
            if (!$(e.target).hasClass('tag-list-tag') && !$(e.target).hasClass('tag-list-remove')) {
                $input.focus();
            }
        });
    };
});
