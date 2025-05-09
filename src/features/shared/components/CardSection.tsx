import React, { ReactNode } from 'react';

import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';

import { stylePresets } from '../../../config/theme';

interface CardSectionProps extends CardProps {
  children: ReactNode;
  icon?: ReactNode;
}

/**
 * Consistent card component for page sections
 */
const CardSection: React.FC<CardSectionProps> = ({ children, icon, title, ...rest }) => {
  // If icon is provided, add it to the title
  const cardTitle = icon ? (
    <span>
      {icon} {title}
    </span>
  ) : (
    title
  );

  return (
    <Card
      title={cardTitle}
      className="content-section"
      style={{
        ...stylePresets.contentCard,
        ...(rest.style || {}),
      }}
      {...rest}
    >
      {children}
    </Card>
  );
};

export default CardSection;
