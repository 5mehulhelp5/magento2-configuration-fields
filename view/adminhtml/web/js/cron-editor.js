/**
 * Copyright (c) 2025. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

define(['jquery', 'cronstrue'], function ($, cronstrue) {
    'use strict';
    return function (config) {
        var inputId = config.inputId;
        var value = config.value || '* * * * *';
        var $hiddenInput = $('#' + inputId);
        var $container = $('#cron-editor-ui-' + inputId);
        var fieldIds = [
            'minute', 'hour', 'day-of-month', 'month', 'day-of-week'
        ];
        var patternKeys = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
        var patterns = {
            minute: /^(\*|([0-9]|[1-5][0-9])(-([0-9]|[1-5][0-9]))?(,([0-9]|[1-5][0-9])(-([0-9]|[1-5][0-9]))?)*|\*\/([0-9]|[1-5][0-9]))$/,
            hour: /^(\*|([0-9]|1[0-9]|2[0-3])(-([0-9]|1[0-9]|2[0-3]))?(,([0-9]|1[0-9]|2[0-3])(-([0-9]|1[0-9]|2[0-3]))?)*|\*\/([0-9]|1[0-9]|2[0-3]))$/,
            dayOfMonth: /^(\*|([1-9]|[12][0-9]|3[01])(-([1-9]|[12][0-9]|3[01]))?(,([1-9]|[12][0-9]|3[01])(-([1-9]|[12][0-9]|3[01]))?)*|\*\/([1-9]|[12][0-9]|3[01]))$/,
            month: /^(\*|([1-9]|1[0-2])(-([1-9]|1[0-2]))?(,([1-9]|1[0-2])(-([1-9]|1[0-2]))?)*|\*\/([1-9]|1[0-2]))$/,
            dayOfWeek: /^(\*|[0-6](-[0-6])?(,[0-6](-[0-6])?)*|\*\/[0-6])$/
        };
        var $fields = fieldIds.map(function(id) {
            return $('#'+id+'-'+inputId);
        });
        // Set initial values from hidden input
        var initial = (value || '* * * * *').split(' ');
        $fields.forEach(function($f, i) {
            $f.val(initial[i] || '*');
        });
        // Track validation state
        var isExpressionInvalid = false;

        // Inherit checkbox logic
        var $inheritCheckbox = $('#' + inputId + '_inherit');
        function updateFieldsDisabledState() {
            var isInherited = $inheritCheckbox.is(':checked');
            // find the .cron-editor-row
            var $row = $container.find('.cron-editor-row');

            if (isInherited) {
                $row.addClass('cron-editor-row-disabled');
            } else {
                $row.removeClass('cron-editor-row-disabled');
            }
        }
        if ($inheritCheckbox.length) {
            $inheritCheckbox.on('change', updateFieldsDisabledState);
            updateFieldsDisabledState();
        }

        function validateField(val, key) {
            if (!val) return false;
            return patterns[key].test(val);
        }
        function updateCronExpression() {
            var cronValues = $fields.map(function($f) { return $f.val().trim() || '*'; });
            var cronExpr = cronValues.join(' ');
            $hiddenInput.val(cronExpr);
            var hasError = false;
            $fields.forEach(function($f, i) {
                var valid = validateField($f.val().trim(), patternKeys[i]);
                $f.toggleClass('invalid', !valid);
                $('#'+fieldIds[i]+'-'+inputId).siblings('label').toggleClass('invalid', !valid);
                if (!valid) hasError = true;
            });

            // Update error state
            isExpressionInvalid = hasError;

            if (hasError) {
                $('#summary-'+inputId).html('<span class="cron-editor-error">Invalid cron expression. Please check highlighted fields.</span>');
            } else {
                try {
                    var description = cronstrue.toString(cronExpr);
                    $('#summary-'+inputId).text(description);
                } catch (error) {
                    $('#summary-'+inputId).html('<span class="cron-editor-error">Invalid cron expression.</span>');
                }
            }
        }

        function showCronTableSection(idx) {
            // Hide all specific tbodies
            $('#cron-minute-tbody-'+inputId).hide();
            $('#cron-hour-tbody-'+inputId).hide();
            $('#cron-day-tbody-'+inputId).hide();
            $('#cron-month-tbody-'+inputId).hide();
            $('#cron-dow-tbody-'+inputId).hide();
            // Show the relevant tbody
            if(idx === 0) $('#cron-minute-tbody-'+inputId).show();
            else if(idx === 1) $('#cron-hour-tbody-'+inputId).show();
            else if(idx === 2) $('#cron-day-tbody-'+inputId).show();
            else if(idx === 3) $('#cron-month-tbody-'+inputId).show();
            else if(idx === 4) $('#cron-dow-tbody-'+inputId).show();
        }
        function hideAllCronTableSections() {
            $('#cron-minute-tbody-'+inputId).hide();
            $('#cron-hour-tbody-'+inputId).hide();
            $('#cron-day-tbody-'+inputId).hide();
            $('#cron-month-tbody-'+inputId).hide();
            $('#cron-dow-tbody-'+inputId).hide();
        }

        // Event listeners
        $fields.forEach(function($f, idx) {
            $f.on('input', updateCronExpression);
            $f.on('focus', function() {
                showCronTableSection(idx);
            });
            $f.on('blur', function() {
                hideAllCronTableSections();
            });
            $f.siblings('label').on('click', function() { $f.focus(); });
        });

        // Add custom jQuery validation rule for cron expression
        if ($.validator && $.validator.addMethod) {
            $.validator.addMethod('validate-cron-expression', function(value, element) {
                // Check if any field is invalid
                var isValid = true;
                $fields.forEach(function($f, i) {
                    if (!validateField($f.val().trim(), patternKeys[i])) {
                        isValid = false;
                    }
                });
                return isValid;
            }, $.mage.__('Invalid cron expression. Please check highlighted fields.'));
        }

        // Initialize
        updateCronExpression();
    };
});

