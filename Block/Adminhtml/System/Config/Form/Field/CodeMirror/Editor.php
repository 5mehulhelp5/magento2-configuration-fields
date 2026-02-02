<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\ConfigurationFields\Block\Adminhtml\System\Config\Form\Field\CodeMirror;

use Magento\Backend\Block\Template\Context;
use Magento\Config\Block\System\Config\Form\Field as MagentoField;
use Magento\Framework\Data\Form\Element\AbstractElement;
use Magento\Framework\View\Element\Template;

/**
 * Base CodeMirror editor field for system configuration.
 *
 * Provides a syntax-highlighted code editor using CodeMirror library.
 * Extend this class or use pre-built language-specific editors.
 */
class Editor extends MagentoField
{
    /**
     * @param Context $context
     * @param array<string, mixed> $editorConfig Configuration for CodeMirror editor
     * @param array<string, mixed> $data
     */
    public function __construct(
        Context $context,
        protected readonly array $editorConfig = [],
        array $data = []
    ) {
        parent::__construct($context, $data);
    }

    /**
     * {@inheritDoc}
     */
    protected function _getElementHtml(AbstractElement $element): string
    {
        $html = '';
        $htmlId = $element->getHtmlId();

        $beforeElementHtml = $element->getBeforeElementHtml();
        if ($beforeElementHtml) {
            $html .= '<label class="addbefore" for="' . $htmlId . '">' . $beforeElementHtml . '</label>';
        }

        $html .= $this->getLayout()->createBlock(Template::class)
            ->setTemplate('Hryvinskyi_ConfigurationFields::system/config/codemirror.phtml')
            ->setData('element', $element)
            ->setData('editor_config', $this->getEditorConfig())
            ->toHtml();

        $afterElementJs = $element->getAfterElementJs();
        if ($afterElementJs) {
            $html .= $afterElementJs;
        }

        $afterElementHtml = $element->getAfterElementHtml();
        if ($afterElementHtml) {
            $html .= '<label class="addafter" for="' . $htmlId . '">' . $afterElementHtml . '</label>';
        }

        return $html;
    }

    /**
     * Get editor configuration with defaults.
     *
     * @return array<string, mixed>
     */
    protected function getEditorConfig(): array
    {
        return [
            'mode' => $this->editorConfig['mode'] ?? 'htmlmixed',
            'theme' => $this->editorConfig['theme'] ?? 'default',
            'lineNumbers' => (bool)($this->editorConfig['line_numbers'] ?? true),
            'lineWrapping' => (bool)($this->editorConfig['line_wrapping'] ?? true),
        ];
    }
}
