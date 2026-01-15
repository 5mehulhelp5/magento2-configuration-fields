<?php
/**
 * Copyright (c) 2025. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\ConfigurationFields\Block\Adminhtml\System\Config\Form\Field;

use Magento\Backend\Block\Template\Context;
use Magento\Config\Block\System\Config\Form\Field as MagentoField;
use Magento\Framework\Data\Form\Element\AbstractElement;
use Magento\Framework\View\Element\Template;

/**
 * Tag List configuration field
 *
 * Renders a tag-style input for managing lists of values (e.g., postcodes, SKUs, keywords).
 * Users can add tags by typing and pressing Enter, remove tags with × button,
 * and paste multiple values at once.
 *
 * Usage in system.xml with di.xml configuration:
 *
 * 1. Create virtual type in di.xml:
 * <virtualType name="MyModule\Block\Adminhtml\MyTagList"
 *              type="Hryvinskyi\ConfigurationFields\Block\Adminhtml\System\Config\Form\Field\TagList">
 *     <arguments>
 *         <argument name="tagListConfig" xsi:type="array">
 *             <item name="placeholder" xsi:type="string">Enter value...</item>
 *             <item name="validation" xsi:type="string">^[A-Z0-9%]+$</item>
 *             <item name="uppercase" xsi:type="boolean">true</item>
 *             <item name="separator" xsi:type="string">\n</item>
 *             <item name="save_type" xsi:type="string">json</item>
 *         </argument>
 *     </arguments>
 * </virtualType>
 *
 * 2. Reference in system.xml:
 * <field id="my_field" translate="label" type="text" sortOrder="10" showInDefault="1">
 *     <label>My Tag List</label>
 *     <frontend_model>MyModule\Block\Adminhtml\MyTagList</frontend_model>
 *     <backend_model>MyModule\Model\Config\Backend\MyTagList</backend_model>
 * </field>
 *
 * Configuration options:
 * - placeholder: Custom placeholder text (default: "Type value and press Enter...")
 * - validation: Regex pattern for validation (default: ^[A-Za-z0-9]+$)
 * - uppercase: Whether to auto-uppercase values (default: true)
 * - separator: Separator for stored values (default: newline)
 * - save_type: Storage format - 'json', 'serialized', or 'separator' (default: separator)
 */
class TagList extends MagentoField
{
    /**
     * @param Context $context
     * @param array<string, mixed> $tagListConfig Configuration for tag list behavior
     * @param array<string, mixed> $data
     */
    public function __construct(
        Context $context,
        private readonly array $tagListConfig = [],
        array $data = []
    ) {
        parent::__construct($context, $data);
    }
    /**
     * Render element HTML
     *
     * @param AbstractElement $element
     * @return string
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
            ->setTemplate('Hryvinskyi_ConfigurationFields::system/config/tag_list.phtml')
            ->setData('element', $element)
            ->setData('config', $this->getTagListConfig($element))
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
     * Get tag list configuration from DI config with defaults
     *
     * @param AbstractElement $element
     * @return array<string, mixed>
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    private function getTagListConfig(AbstractElement $element): array
    {
        $separator = $this->tagListConfig['separator'] ?? "\n";
        $separator = $this->unescapeSeparator($separator);

        return [
            'placeholder' => $this->tagListConfig['placeholder'] ?? __('Type value and press Enter...'),
            'validation' => $this->tagListConfig['validation'] ?? '^[a-zA-Z0-9.!#$%&\'*+\/=?^_`"{|}~-]+$',
            'validation_message' => $this->tagListConfig['validation_message'] ?? '',
            'uppercase' => (bool) ($this->tagListConfig['uppercase'] ?? true),
            'separator' => $separator,
            'save_type' => $this->tagListConfig['save_type'] ?? 'separator',
        ];
    }

    /**
     * Convert escaped string sequences to actual characters
     *
     * @param string $separator
     * @return string
     */
    private function unescapeSeparator(string $separator): string
    {
        return str_replace(
            ['\\n', '\\t', '\\r'],
            ["\n", "\t", "\r"],
            $separator
        );
    }
}
