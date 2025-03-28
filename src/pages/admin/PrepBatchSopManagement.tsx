// Replace the columns definition in PrepBatchSopManagement.tsx with this properly typed version:

// Table columns for the main prep batch SOP list
const columns: EditableColumn[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    editable: true,
    inputType: 'text', // Using the specific allowed values
    editComponent: Input,
    render: (text: string) => <Text strong>{text}</Text>,
    sorter: (a: PrepBatchSopSelectionRs, b: PrepBatchSopSelectionRs) =>
      a.name.localeCompare(b.name),
    rules: [
      { required: true, message: 'Please enter the Prep SOP name' },
      { max: 150, message: 'Name cannot exceed 150 characters' },
    ],
  },
  {
    title: 'SOP',
    dataIndex: 'sop',
    key: 'sop',
    editable: true,
    inputType: 'text', // Using the specific allowed values
    editComponent: Input,
    render: (text: string) => (
      <Tag color="blue" icon={<ExperimentOutlined />}>
        {text}
      </Tag>
    ),
    rules: [
      { required: true, message: 'Please enter the SOP identifier' },
      { max: 50, message: 'SOP cannot exceed 50 characters' },
    ],
  },
  {
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
    editable: true,
    inputType: 'text', // Using the specific allowed values
    editComponent: Input,
    render: (text: string) => <Tag color="green">{text}</Tag>,
    rules: [
      { required: true, message: 'Please enter the version' },
      { max: 10, message: 'Version cannot exceed 10 characters' },
    ],
  },
  {
    title: 'SOP Group',
    dataIndex: 'sopGroup',
    key: 'sopGroup',
    editable: true,
    inputType: 'text', // Using the specific allowed values
    editComponent: Input,
    rules: [
      { required: true, message: 'Please enter the SOP group' },
      { max: 50, message: 'SOP Group cannot exceed 50 characters' },
    ],
  },
  {
    title: 'Sample Types',
    key: 'sampleTypes',
    editable: false, // Make sure to add this
    render: (_: any, record: PrepBatchSopSelectionRs) => {
      const count = record.manifestSamplePrepBatchSopRss.length;
      return (
        <Tooltip title={`${count} sample type(s) configured`}>
          <Tag color="volcano">{count}</Tag>
        </Tooltip>
      );
    },
  },
  {
    title: 'View',
    key: 'view',
    width: 80,
    editable: false, // Make sure to add this
    render: (_: any, record: PrepBatchSopSelectionRs) => (
      <Tooltip title="View Details">
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          onClick={() => handleViewDetails(record)}
        />
      </Tooltip>
    ),
  },
];
export default PrepBatchSopManagement;
