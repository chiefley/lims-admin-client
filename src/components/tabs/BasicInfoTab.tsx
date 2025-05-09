import React from 'react';

import { Input, InputNumber, Select, Row, Col } from 'antd';

import { stylePresets } from '../../config/theme';
import { ConfigurationMaintenanceSelectors } from '../../features/shared/types/common';
import { PrepBatchSopRs } from '../../models/types';
import CardSection from '../common/CardSection';
import FormItem from '../common/FormItem';

interface BasicInfoTabProps {
  sopData: PrepBatchSopRs;
  editing: boolean;
  selectors: ConfigurationMaintenanceSelectors;
  form: any; // Form instance passed from parent
  onDataChange?: (fieldName: string, value: any) => void;
}

/**
 * Component for displaying and editing basic SOP information
 */
const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  sopData,
  editing,
  selectors,
  form,
  onDataChange,
}) => {
  // Handle field change if needed
  const handleFieldChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange(field, value);
    }
  };

  return (
    <>
      <CardSection title="SOP Details" style={stylePresets.contentCard}>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              name="name"
              label="Name"
              tooltip="The name of the Prep Batch SOP"
              rules={[
                { required: true, message: 'Please enter the SOP name' },
                { max: 150, message: 'Name cannot exceed 150 characters' },
              ]}
            >
              <Input
                placeholder="Enter SOP name"
                disabled={!editing}
                onChange={e => handleFieldChange('name', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name="sop"
              label="SOP Identifier"
              tooltip="The unique identifier for this SOP"
              rules={[
                { required: true, message: 'Please enter the SOP identifier' },
                { max: 50, message: 'Identifier cannot exceed 50 characters' },
              ]}
            >
              <Input
                placeholder="Enter SOP ID"
                disabled={!editing}
                onChange={e => handleFieldChange('sop', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name="version"
              label="Version"
              tooltip="The version of this SOP"
              rules={[
                { required: true, message: 'Please enter the version' },
                { max: 10, message: 'Version cannot exceed 10 characters' },
              ]}
            >
              <Input
                placeholder="e.g., 1.0"
                disabled={!editing}
                onChange={e => handleFieldChange('version', e.target.value)}
              />
            </FormItem>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              name="sopGroup"
              label="SOP Group"
              tooltip="The group to which this SOP belongs"
              rules={[
                { required: true, message: 'Please enter the SOP group' },
                { max: 50, message: 'Group name cannot exceed 50 characters' },
              ]}
            >
              <Input
                placeholder="Enter SOP group"
                disabled={!editing}
                onChange={e => handleFieldChange('sopGroup', e.target.value)}
              />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name="decimalFormatType"
              label="Decimal Format Type"
              tooltip="The format to use for decimal values"
              rules={[{ required: true, message: 'Please select a decimal format type' }]}
            >
              <Select
                placeholder="Select decimal format type"
                disabled={!editing}
                options={selectors.decimalFormatTypes?.map((item: any) => ({
                  value: item.id,
                  label: item.label,
                }))}
                onChange={value => handleFieldChange('decimalFormatType', value)}
              />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name="significantDigits"
              label="Significant Digits"
              tooltip="Number of significant digits to display"
              rules={[
                { required: true, message: 'Please enter significant digits' },
                {
                  type: 'number',
                  min: 0,
                  max: 10,
                  message: 'Value must be between 0 and 10',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter digits"
                disabled={!editing}
                min={0}
                max={10}
                onChange={value => handleFieldChange('significantDigits', value)}
              />
            </FormItem>
          </Col>
        </Row>
      </CardSection>

      <CardSection title="Batch Parameters" style={stylePresets.contentCard}>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              name="maxSamplesPerBatch"
              label="Max Samples Per Batch"
              tooltip="Maximum number of samples allowed in a batch"
              rules={[
                { required: true, message: 'Please enter max samples per batch' },
                { type: 'number', min: 1, message: 'Value must be at least 1' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter max samples"
                disabled={!editing}
                min={1}
                onChange={value => handleFieldChange('maxSamplesPerBatch', value)}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="minWeightG"
              label="Min Weight (g)"
              tooltip="Minimum sample weight in grams"
              rules={[
                { required: true, message: 'Please enter minimum weight' },
                { type: 'number', min: 0, message: 'Value must be at least 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter min weight"
                disabled={!editing}
                min={0}
                step={0.001}
                onChange={value => handleFieldChange('minWeightG', value)}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="maxWeightG"
              label="Max Weight (g)"
              tooltip="Maximum sample weight in grams"
              rules={[
                { required: true, message: 'Please enter maximum weight' },
                { type: 'number', min: 0, message: 'Value must be at least 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter max weight"
                disabled={!editing}
                min={0}
                step={0.001}
                onChange={value => handleFieldChange('maxWeightG', value)}
              />
            </FormItem>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              name="defaultDilution"
              label="Default Dilution"
              tooltip="Default dilution factor"
              rules={[
                { required: true, message: 'Please enter default dilution' },
                { type: 'number', min: 0, message: 'Value must be at least 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter dilution"
                disabled={!editing}
                min={0}
                step={0.01}
                onChange={value => handleFieldChange('defaultDilution', value)}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="defaultExtractionVolumeMl"
              label="Default Extraction Volume (mL)"
              tooltip="Default extraction volume in milliliters"
              rules={[
                { required: true, message: 'Please enter default extraction volume' },
                { type: 'number', min: 0, message: 'Value must be at least 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter volume"
                disabled={!editing}
                min={0}
                step={0.1}
                onChange={value => handleFieldChange('defaultExtractionVolumeMl', value)}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="defaultInjectionVolumeUl"
              label="Default Injection Volume (µL)"
              tooltip="Default injection volume in microliters"
              rules={[
                { required: true, message: 'Please enter default injection volume' },
                { type: 'number', min: 0, message: 'Value must be at least 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter volume"
                disabled={!editing}
                min={0}
                step={0.1}
                onChange={value => handleFieldChange('defaultInjectionVolumeUl', value)}
              />
            </FormItem>
          </Col>
        </Row>
      </CardSection>
    </>
  );
};

export default BasicInfoTab;
