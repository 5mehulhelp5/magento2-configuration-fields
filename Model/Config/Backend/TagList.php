<?php
/**
 * Copyright (c) 2025. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\ConfigurationFields\Model\Config\Backend;

use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Value;
use Magento\Framework\Data\Collection\AbstractDb;
use Magento\Framework\Model\Context;
use Magento\Framework\Model\ResourceModel\AbstractResource;
use Magento\Framework\Registry;

/**
 * Backend model for TagList configuration field
 *
 * Handles conversion of tag values to different storage formats:
 * - json: Store as JSON array ["value1", "value2"]
 * - serialized: Store as PHP serialized string a:2:{i:0;s:6:"value1";...}
 * - separator: Store with separator character (default)
 *
 * Usage with di.xml:
 *
 * 1. Create virtual type in di.xml:
 * <virtualType name="MyModule\Model\Config\Backend\MyTagList"
 *              type="Hryvinskyi\ConfigurationFields\Model\Config\Backend\TagList">
 *     <arguments>
 *         <argument name="tagListConfig" xsi:type="array">
 *             <item name="separator" xsi:type="string">\n</item>
 *             <item name="save_type" xsi:type="string">json</item>
 *         </argument>
 *     </arguments>
 * </virtualType>
 *
 * 2. Reference in system.xml:
 * <backend_model>MyModule\Model\Config\Backend\MyTagList</backend_model>
 */
class TagList extends Value
{
    public const SAVE_TYPE_JSON = 'json';
    public const SAVE_TYPE_SERIALIZED = 'serialized';
    public const SAVE_TYPE_SEPARATOR = 'separator';

    /**
     * @param Context $context
     * @param Registry $registry
     * @param ScopeConfigInterface $config
     * @param TypeListInterface $cacheTypeList
     * @param array<string, mixed> $tagListConfig
     * @param AbstractResource|null $resource
     * @param AbstractDb|null $resourceCollection
     * @param array<string, mixed> $data
     */
    public function __construct(
        Context $context,
        Registry $registry,
        ScopeConfigInterface $config,
        TypeListInterface $cacheTypeList,
        private readonly array $tagListConfig = [],
        ?AbstractResource $resource = null,
        ?AbstractDb $resourceCollection = null,
        array $data = []
    ) {
        parent::__construct($context, $registry, $config, $cacheTypeList, $resource, $resourceCollection, $data);
    }

    /**
     * Process value before saving to database
     *
     * @return $this
     */
    public function beforeSave(): self
    {
        $value = $this->getValue();

        if ($value === null || $value === '') {
            return parent::beforeSave();
        }

        $saveType = $this->getSaveType();
        $separator = $this->getSeparator();

        // Parse incoming value (separator-delimited from frontend)
        $values = $this->parseIncomingValue((string) $value, $separator);

        // Convert to target format
        $this->setValue($this->formatValues($values, $saveType, $separator));

        return parent::beforeSave();
    }

    /**
     * Get save type from DI configuration
     *
     * @return string
     */
    private function getSaveType(): string
    {
        return (string) ($this->tagListConfig['save_type'] ?? self::SAVE_TYPE_SEPARATOR);
    }

    /**
     * Get separator from DI configuration
     *
     * @return string
     */
    private function getSeparator(): string
    {
        $separator = (string) ($this->tagListConfig['separator'] ?? "\n");

        return $this->unescapeSeparator($separator);
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

    /**
     * Parse incoming value from frontend
     *
     * @param string $value
     * @param string $separator
     * @return array<int, string>
     */
    private function parseIncomingValue(string $value, string $separator): array
    {
        $values = explode($separator, $value);

        return array_values(array_filter(array_map('trim', $values)));
    }

    /**
     * Format values based on save type
     *
     * @param array<int, string> $values
     * @param string $saveType
     * @param string $separator
     * @return string
     */
    private function formatValues(array $values, string $saveType, string $separator): string
    {
        if (empty($values)) {
            return '';
        }

        switch ($saveType) {
            case self::SAVE_TYPE_JSON:
                return json_encode($values, JSON_UNESCAPED_UNICODE) ?: '';

            case self::SAVE_TYPE_SERIALIZED:
                return serialize($values);

            case self::SAVE_TYPE_SEPARATOR:
            default:
                return implode($separator, $values);
        }
    }
}
