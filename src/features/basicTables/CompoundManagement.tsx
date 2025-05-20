import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, ExperimentOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Checkbox } from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';

import basicTableService from './basicTableService';
import { CompoundRs } from './types';

const { Text } = Typography;

const CompoundManagement: React.FC = () => {
  const [compounds, setCompounds] = useState<CompoundRs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCompounds, setFilteredCompounds] = useState<CompoundRs[]>([]);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Load compounds
  useEffect(() => {
    loadCompounds();
  }, []);

  const loadCompounds = async () => {
    try {
      setLoading(true);
      const compoundsData = await basicTableService.fetchCompounds();
      setCompounds(compoundsData);
      setFilteredCompounds(compoundsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load compounds');
      message.error('Failed to load compounds');
    } finally {
      setLoading(false);
    }
  };

  // Filter compounds based on search text and active status
  useEffect(() => {
    if (!compounds.length) return;

    let filtered = [...compounds];

    // Filter by active status if not showing inactive
    if (!showInactive) {
      filtered = filtered.filter(compound => compound.active !== false);
    }

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        compound =>
          compound.name.toLowerCase().includes(searchText.toLowerCase()) ||
          compound.cas.toLowerCase().includes(searchText.toLowerCase()) ||
          (compound.ccCompoundName &&
            compound.ccCompoundName.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFilteredCompounds(filtered);
  }, [searchText, compounds, showInactive]);

  // Handle saving a compound (single row edit in the table)
  const handleSaveCompound = (record: CompoundRs) => {
    // Use Promise to match the EditableTable's expected behavior
    return new Promise<void>((resolve, reject) => {
      // Relaxed CAS validation that allows:
      // 1. Standard CAS numbers (XXXXXXX-XX-X)
      // 2. Special identifiers like "TOTTHC"
      // 3. Composite CAS numbers for co-eluting compounds (e.g., with + signs)

      // We'll only do a basic validation to ensure the CAS field is not empty
      if (!record.cas.trim()) {
        message.error('CAS identifier cannot be empty');
        reject('CAS identifier is required');
        return;
      }

      // Validate the name is not empty
      if (!record.name.trim()) {
        message.error('Compound name cannot be empty');
        reject('Name is required');
        return;
      }

      // Validate uniqueness of CAS number
      const hasDuplicateCas = compounds.some(
        compound =>
          compound.analyteId !== record.analyteId && // Skip the current record
          compound.cas === record.cas // Check if CAS matches any other record
      );

      if (hasDuplicateCas) {
        message.error('This CAS identifier is already in use by another compound');
        reject('Duplicate CAS identifier');
        return;
      }

      // Update the compounds array
      setCompounds(prevCompounds => {
        const updatedCompounds = prevCompounds.map(compound =>
          compound.analyteId === record.analyteId ? record : compound
        );

        // If it's a new record (not found in the array), add it
        if (!prevCompounds.some(compound => compound.analyteId === record.analyteId)) {
          updatedCompounds.push(record);
        }

        return updatedCompounds;
      });

      // Mark that we have unsaved changes
      setHasChanges(true);

      // Show success message and resolve the promise
      message.success(`Updated compound: ${record.name}`);
      resolve();
    });
  };

  // Handle deleting a compound
  const handleDeleteCompound = (record: CompoundRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.analyteId >= 0) {
      message.info('Existing compounds cannot be deleted. You can mark them as inactive instead.');
      return;
    }

    // Remove from compounds array
    setCompounds(prevCompounds => prevCompounds.filter(c => c.analyteId !== record.analyteId));

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted compound: ${record.name}`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: CompoundRs) => {
    // Only show delete button for temporary records (negative IDs)
    return record.analyteId < 0;
  };

  // Handle adding a new compound
  const handleAddCompound = () => {
    // Create a new compound with default values and temporary negative ID
    const newCompound: CompoundRs = {
      analyteId: -Date.now(), // Temporary negative ID
      cas: '',
      name: '',
      ccCompoundName: '',
      active: true, // New compounds are active by default
    };

    // Add to the compounds array
    setCompounds(prevCompounds => [newCompound, ...prevCompounds]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all compounds
      // This follows the pattern of sending the complete dataset back to the server
      const savedCompounds = await basicTableService.upsertCompounds(compounds);

      // Update local state with saved data from server
      setCompounds(savedCompounds);

      // Reset changes flag
      setHasChanges(false);

      message.success('All compounds saved successfully');
    } catch (err: any) {
      console.error('Error saving compounds:', err);
      message.error(`Failed to save compounds: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle showing inactive compounds
  const handleShowInactiveChange = (checked: boolean) => {
    setShowInactive(checked);
  };

  // Table columns for the compounds list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string, record: CompoundRs) => (
        <Text strong style={{ opacity: record.active === false ? 0.5 : 1 }}>
          {text || 'New Compound'}
        </Text>
      ),
      sorter: (a: CompoundRs, b: CompoundRs) => a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the compound name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'CAS Number',
      dataIndex: 'cas',
      key: 'cas',
      editable: true,
      inputType: 'text',
      sorter: (a: CompoundRs, b: CompoundRs) => a.cas.localeCompare(b.cas),
      rules: [
        { required: true, message: 'Please enter the CAS number' },
        { max: 50, message: 'CAS number cannot exceed 50 characters' },
        // Allow non-standard CAS identifiers (like TOTTHC) to be entered
        // The cell validation will still provide warning for potential standard CAS numbers
      ],
    },
    {
      title: 'CC Compound Name',
      dataIndex: 'ccCompoundName',
      key: 'ccCompoundName',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [{ max: 150, message: 'CC compound name cannot exceed 150 characters' }],
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      editable: true,
      inputType: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      render: (active: boolean) =>
        active !== false ? (
          <Text type="success">Active</Text>
        ) : (
          <Text type="secondary">Inactive</Text>
        ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Compound Management"
        subtitle="Manage compounds used in laboratory analysis"
        extra={
          hasChanges && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAllChanges}
              loading={saving}
              disabled={loading}
            >
              Save All Changes
            </Button>
          )
        }
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button type="primary" onClick={loadCompounds}>
              Retry
            </Button>
          }
        />
      )}

      <CardSection
        icon={<ExperimentOutlined />}
        title="Compounds"
        extra={
          <Space>
            <Input
              placeholder="Search compounds"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Checkbox
              checked={showInactive}
              onChange={e => handleShowInactiveChange(e.target.checked)}
            >
              Show Inactive
            </Checkbox>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCompound}
              disabled={loading || saving}
            >
              Add Compound
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Spin spinning={loading || saving}>
          <EditableTable
            columns={columns}
            dataSource={filteredCompounds}
            rowKey="analyteId"
            onSave={handleSaveCompound}
            onDelete={handleDeleteCompound}
            editable={!saving}
            size="small"
            pagination={{ pageSize: 10 }}
            rowClassName={record => (record.active === false ? 'inactive-row' : '')}
            showDeleteButton={showDeleteButton}
          />
        </Spin>

        {hasChanges && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAllChanges}
              loading={saving}
              disabled={loading}
            >
              Save All Changes
            </Button>
          </div>
        )}
      </CardSection>
    </div>
  );
};

export default CompoundManagement;
