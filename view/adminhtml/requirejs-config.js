/**
 * Copyright (c) 2025-2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

var config = {
    map: {
        '*': {
            'cron-editor': 'Hryvinskyi_ConfigurationFields/js/cron-editor',
            'cronstrue': 'Hryvinskyi_ConfigurationFields/js/cronstrue',
            'tag-list': 'Hryvinskyi_ConfigurationFields/js/tag-list',
            'codemirror-editor': 'Hryvinskyi_ConfigurationFields/js/codemirror-editor'
        }
    },
    shim: {
        'Hryvinskyi_ConfigurationFields/js/cronstrue': {
            exports: 'cronstrue'
        },
        'Hryvinskyi_ConfigurationFields/js/codemirror/lib/codemirror': {
            exports: 'CodeMirror'
        }
    }
};

