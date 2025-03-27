// src/config/theme.ts
import { theme } from 'antd';

// Define a custom theme for the LIMS admin application
export const limsTheme = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    borderRadius: 4,
    wireframe: false,
    fontSize: 14,
  },
  components: {
    Table: {
      headerBg: '#f5f5f5',
      headerColor: '#262626',
      rowHoverBg: '#e6f7ff',
      borderColor: '#f0f0f0',
    },
    Card: {
      headerBg: '#f5f5f5',
      headerFontSize: 16,
    },
    Form: {
      labelFontSize: 14,
      itemMarginBottom: 16,
    },
  },
  algorithm: theme.defaultAlgorithm,
};

// Define consistent layout spacing
export const layoutSpacing = {
  padding: {
    small: 8,
    medium: 16,
    large: 24,
  },
  margin: {
    small: 8,
    medium: 16,
    large: 24,
  },
  gutter: {
    small: [8, 8],
    medium: [16, 16],
    large: [24, 24],
  },
};

// Common style presets for components
export const stylePresets = {
  // Card styles
  contentCard: {
    marginBottom: layoutSpacing.margin.medium,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    borderRadius: '4px',
  },

  // Page section styles
  pageSection: {
    marginBottom: layoutSpacing.margin.large,
  },

  // Table styles
  tableStyles: {
    bordered: true,
    size: 'middle' as const,
    scroll: { x: 'max-content' },
  },

  // Typography styles
  titleText: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: layoutSpacing.margin.medium,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: layoutSpacing.margin.small,
  },

  // Form styles
  formStyles: {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  },
};
