import React from 'react';

import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Tabs, Button, Alert, Row, Col, Input, Popconfirm, message } from 'antd';

import { stylePresets } from '../../../config/theme';
import { SopProcedureRs, SopProcedureItemRs } from '../../shared/types/batchSops';
import CardSection from '../components/CardSection';
import EditableTable, { EditableColumn } from '../components/EditableTable';
import FormItem from '../components/FormItem';

const { TabPane } = Tabs;

// Create a generic SopData type that includes only the properties we need
interface SopData {
  batchSopId: number;
  sopProcedures: SopProcedureRs[];
}

interface SopProceduresTabProps {
  sopData: SopData;
  editing: boolean;
  onProceduresChange: (procedures: SopProcedureRs[]) => void;
}

/**
 * Component for displaying and editing SOP procedures and their steps
 */
const SopProceduresTab: React.FC<SopProceduresTabProps> = ({
  sopData,
  editing,
  onProceduresChange,
}) => {
  // Handle adding a new procedure
  const handleAddProcedure = () => {
    // Create new procedure with default values
    const newProcedure: SopProcedureRs = {
      sopProcedureId: -Date.now(), // Temporary negative ID
      batchSopId: sopData.batchSopId,
      section: 'New Section',
      procedureName: 'New Procedure',
      procedureItems: [],
    };

    // Update the procedures
    const updatedProcedures = [...sopData.sopProcedures, newProcedure];
    onProceduresChange(updatedProcedures);
  };

  // Handle deleting a procedure
  const handleDeleteProcedure = (procedureIndex: number) => {
    const updatedProcedures = [...sopData.sopProcedures];
    updatedProcedures.splice(procedureIndex, 1);
    onProceduresChange(updatedProcedures);
  };

  // Handle updating a procedure's metadata (section, name)
  const handleProcedureUpdate = (procedureIndex: number, field: string, value: string) => {
    const updatedProcedures = [...sopData.sopProcedures];
    updatedProcedures[procedureIndex] = {
      ...updatedProcedures[procedureIndex],
      [field]: value,
    };
    onProceduresChange(updatedProcedures);
  };

  // Handle adding a new procedure item (step)
  const handleAddProcedureItem = (procedureIndex: number) => {
    const procedure = sopData.sopProcedures[procedureIndex];

    // Create new procedure item
    const newItem: SopProcedureItemRs = {
      sopProcedurItemId: -Date.now(), // Temporary negative ID
      sopProcedureId: procedure.sopProcedureId,
      order: procedure.procedureItems.length + 1,
      itemNumber: `${procedure.procedureItems.length + 1}`,
      text: 'New procedure step',
      indentLevel: 0,
    };

    // Update the procedures
    const updatedProcedures = [...sopData.sopProcedures];
    updatedProcedures[procedureIndex] = {
      ...procedure,
      procedureItems: [...procedure.procedureItems, newItem],
    };

    onProceduresChange(updatedProcedures);
  };

  // Handle saving a procedure item
  const handleSaveProcedureItem = (procedureIndex: number, item: SopProcedureItemRs) => {
    const procedure = sopData.sopProcedures[procedureIndex];

    // Convert values that should be numbers
    item.order = Number(item.order) || 0;
    item.indentLevel = Number(item.indentLevel) || 0;

    // Find the item index
    const itemIndex = procedure.procedureItems.findIndex(
      pi => pi.sopProcedurItemId === item.sopProcedurItemId
    );

    // Update the procedures
    const updatedProcedures = [...sopData.sopProcedures];

    if (itemIndex !== -1) {
      // Update existing item
      updatedProcedures[procedureIndex] = {
        ...procedure,
        procedureItems: [
          ...procedure.procedureItems.slice(0, itemIndex),
          item,
          ...procedure.procedureItems.slice(itemIndex + 1),
        ],
      };
    } else {
      // Add new item
      updatedProcedures[procedureIndex] = {
        ...procedure,
        procedureItems: [...procedure.procedureItems, item],
      };
    }

    // Sort procedure items by order
    updatedProcedures[procedureIndex].procedureItems.sort((a, b) => a.order - b.order);

    onProceduresChange(updatedProcedures);
    message.success('Step updated successfully');

    return Promise.resolve();
  };

  // Handle deleting a procedure item
  const handleDeleteProcedureItem = (procedureIndex: number, item: SopProcedureItemRs) => {
    const procedure = sopData.sopProcedures[procedureIndex];

    // Filter out the deleted item
    const updatedItems = procedure.procedureItems.filter(
      pi => pi.sopProcedurItemId !== item.sopProcedurItemId
    );

    // Update the procedures
    const updatedProcedures = [...sopData.sopProcedures];
    updatedProcedures[procedureIndex] = {
      ...procedure,
      procedureItems: updatedItems,
    };

    onProceduresChange(updatedProcedures);
    message.success('Step deleted successfully');
  };

  // Define columns for the procedure items table
  const getProcedureItemColumns = (procedureIndex: number): EditableColumn[] => [
    {
      title: 'Item #',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      width: 80,
      editable: editing,
      inputType: 'text',
      render: (text: string) => text || '',
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      editable: editing,
      inputType: 'textarea',
      render: (text: string, record: any) => (
        <div style={{ paddingLeft: record.indentLevel * 20 }}>{text}</div>
      ),
    },
    {
      title: 'Indent',
      dataIndex: 'indentLevel',
      key: 'indentLevel',
      width: 100,
      editable: editing,
      inputType: 'number',
      render: (indentLevel: number) => indentLevel,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 100,
      editable: editing,
      inputType: 'number',
      render: (order: number) => order,
    },
  ];

  return (
    <CardSection
      title="SOP Procedures"
      style={stylePresets.contentCard}
      extra={
        editing ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProcedure}>
            Add Procedure
          </Button>
        ) : null
      }
    >
      {sopData.sopProcedures?.length === 0 ? (
        <Alert
          message="No Procedures Defined"
          description={
            editing
              ? "Click 'Add Procedure' to create a new procedure."
              : 'This SOP does not have any procedures defined.'
          }
          type="info"
          showIcon
        />
      ) : (
        <Tabs type="card">
          {sopData.sopProcedures?.map((procedure, procedureIndex) => (
            <TabPane
              tab={
                <span>
                  {procedure.procedureName}
                  {editing && (
                    <Popconfirm
                      title="Are you sure you want to delete this procedure?"
                      onConfirm={e => {
                        e?.stopPropagation();
                        handleDeleteProcedure(procedureIndex);
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <DeleteOutlined
                        style={{ marginLeft: 8, color: '#ff4d4f' }}
                        onClick={e => e.stopPropagation()}
                      />
                    </Popconfirm>
                  )}
                </span>
              }
              key={procedure.sopProcedureId}
            >
              <Card
                title={
                  editing ? (
                    <Row gutter={16}>
                      <Col span={12}>
                        <FormItem label="Section" style={{ marginBottom: 0 }}>
                          <Input
                            value={procedure.section}
                            onChange={e =>
                              handleProcedureUpdate(procedureIndex, 'section', e.target.value)
                            }
                            placeholder="Enter section name"
                          />
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem label="Procedure Name" style={{ marginBottom: 0 }}>
                          <Input
                            value={procedure.procedureName}
                            onChange={e =>
                              handleProcedureUpdate(procedureIndex, 'procedureName', e.target.value)
                            }
                            placeholder="Enter procedure name"
                          />
                        </FormItem>
                      </Col>
                    </Row>
                  ) : (
                    `${procedure.section}: ${procedure.procedureName}`
                  )
                }
                size="small"
                extra={
                  editing ? (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddProcedureItem(procedureIndex)}
                    >
                      Add Step
                    </Button>
                  ) : null
                }
              >
                <EditableTable
                  columns={getProcedureItemColumns(procedureIndex)}
                  dataSource={procedure.procedureItems}
                  rowKey="sopProcedurItemId"
                  pagination={false}
                  size="small"
                  editable={editing}
                  onSave={item => handleSaveProcedureItem(procedureIndex, item)}
                  onDelete={item => handleDeleteProcedureItem(procedureIndex, item)}
                />
              </Card>
            </TabPane>
          ))}
        </Tabs>
      )}
    </CardSection>
  );
};

export default SopProceduresTab;
