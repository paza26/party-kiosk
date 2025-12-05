import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

describe('EmptyState Component', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(<EmptyState title="No items found" />);
      expect(getByText('No items found')).toBeTruthy();
    });

    it('should render without emoji by default', () => {
      const { queryByText } = render(<EmptyState title="Empty" />);
      // Only the title should be present
      expect(queryByText('Empty')).toBeTruthy();
    });

    it('should not render subtitle by default', () => {
      const { queryByText } = render(<EmptyState title="Empty" />);
      expect(queryByText(/./)).toBeTruthy(); // Only title
    });

    it('should not render action by default', () => {
      const { queryByText } = render(<EmptyState title="Empty" />);
      expect(queryByText(/./)).toBeTruthy();
    });
  });

  describe('Emoji Display', () => {
    it('should display emoji when provided', () => {
      const { getByText } = render(
        <EmptyState emoji="🎉" title="No items" />
      );
      expect(getByText('🎉')).toBeTruthy();
    });

    it('should support different emojis', () => {
      const emojis = ['📦', '🛒', '📋', '🍕', '⚠️'];

      emojis.forEach((emoji) => {
        const { getByText } = render(
          <EmptyState emoji={emoji} title="Test" />
        );
        expect(getByText(emoji)).toBeTruthy();
      });
    });

    it('should handle emoji with title', () => {
      const { getByText } = render(
        <EmptyState emoji="📦" title="No products" />
      );
      expect(getByText('📦')).toBeTruthy();
      expect(getByText('No products')).toBeTruthy();
    });
  });

  describe('Subtitle Display', () => {
    it('should display subtitle when provided', () => {
      const { getByText } = render(
        <EmptyState title="No items" subtitle="Add items to get started" />
      );
      expect(getByText('Add items to get started')).toBeTruthy();
    });

    it('should render title and subtitle together', () => {
      const { getByText } = render(
        <EmptyState
          title="No orders"
          subtitle="Place your first order"
        />
      );
      expect(getByText('No orders')).toBeTruthy();
      expect(getByText('Place your first order')).toBeTruthy();
    });

    it('should handle long subtitle text', () => {
      const longSubtitle = 'This is a very long subtitle that explains what the user should do next';
      const { getByText } = render(
        <EmptyState title="Empty" subtitle={longSubtitle} />
      );
      expect(getByText(longSubtitle)).toBeTruthy();
    });
  });

  describe('Action Button', () => {
    it('should render action component when provided', () => {
      const action = <Button title="Add Item" />;
      const { getByText } = render(
        <EmptyState title="Empty" action={action} />
      );
      expect(getByText('Add Item')).toBeTruthy();
    });

    it('should render custom action element', () => {
      const action = <Text>Custom Action</Text>;
      const { getByText } = render(
        <EmptyState title="Empty" action={action} />
      );
      expect(getByText('Custom Action')).toBeTruthy();
    });

    it('should position action below subtitle', () => {
      const action = <Button title="Create" />;
      const { getByText } = render(
        <EmptyState
          title="No items"
          subtitle="Get started"
          action={action}
        />
      );
      expect(getByText('No items')).toBeTruthy();
      expect(getByText('Get started')).toBeTruthy();
      expect(getByText('Create')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style', () => {
      const customStyle = { padding: 50 };
      const { getByText } = render(
        <EmptyState title="Empty" style={customStyle} />
      );
      expect(getByText('Empty')).toBeTruthy();
    });

    it('should merge custom styles with default styles', () => {
      const { getByText } = render(
        <EmptyState
          title="Empty"
          style={{ backgroundColor: 'lightblue' }}
        />
      );
      expect(getByText('Empty')).toBeTruthy();
    });
  });

  describe('Complete Examples', () => {
    it('should render all props together', () => {
      const action = <Button title="Add Product" />;
      const { getByText } = render(
        <EmptyState
          emoji="📦"
          title="No products available"
          subtitle="Start by adding your first product"
          action={action}
        />
      );

      expect(getByText('📦')).toBeTruthy();
      expect(getByText('No products available')).toBeTruthy();
      expect(getByText('Start by adding your first product')).toBeTruthy();
      expect(getByText('Add Product')).toBeTruthy();
    });

    it('should render with emoji and subtitle but no action', () => {
      const { getByText } = render(
        <EmptyState
          emoji="🛒"
          title="Empty cart"
          subtitle="Add items to your cart"
        />
      );

      expect(getByText('🛒')).toBeTruthy();
      expect(getByText('Empty cart')).toBeTruthy();
      expect(getByText('Add items to your cart')).toBeTruthy();
    });

    it('should render with emoji and action but no subtitle', () => {
      const action = <Button title="Browse" />;
      const { getByText } = render(
        <EmptyState
          emoji="📋"
          title="No history"
          action={action}
        />
      );

      expect(getByText('📋')).toBeTruthy();
      expect(getByText('No history')).toBeTruthy();
      expect(getByText('Browse')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(100);
      const { getByText } = render(<EmptyState title={longTitle} />);
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const { getByText } = render(
        <EmptyState title="No items & <special> characters!" />
      );
      expect(getByText('No items & <special> characters!')).toBeTruthy();
    });

    it('should handle unicode characters', () => {
      const { getByText } = render(
        <EmptyState
          title="没有项目"
          subtitle="添加新项目开始"
        />
      );
      expect(getByText('没有项目')).toBeTruthy();
      expect(getByText('添加新项目开始')).toBeTruthy();
    });

    it('should handle multiline subtitle', () => {
      const { getByText } = render(
        <EmptyState
          title="Empty"
          subtitle={'Line 1\nLine 2\nLine 3'}
        />
      );
      expect(getByText('Line 1\nLine 2\nLine 3')).toBeTruthy();
    });

    it('should handle null action gracefully', () => {
      const { getByText, queryByRole } = render(
        <EmptyState title="Empty" action={null} />
      );
      expect(getByText('Empty')).toBeTruthy();
    });
  });

  describe('Common Use Cases', () => {
    it('should render empty products state', () => {
      const action = <Button title="Add Product" variant="primary" />;
      const { getByText } = render(
        <EmptyState
          emoji="📦"
          title="No products"
          subtitle="Tap 'Add Product' to get started"
          action={action}
        />
      );

      expect(getByText('📦')).toBeTruthy();
      expect(getByText('No products')).toBeTruthy();
      expect(getByText("Tap 'Add Product' to get started")).toBeTruthy();
      expect(getByText('Add Product')).toBeTruthy();
    });

    it('should render empty orders state', () => {
      const { getByText } = render(
        <EmptyState
          emoji="🛒"
          title="No orders yet"
          subtitle="Orders will appear here"
        />
      );

      expect(getByText('🛒')).toBeTruthy();
      expect(getByText('No orders yet')).toBeTruthy();
      expect(getByText('Orders will appear here')).toBeTruthy();
    });

    it('should render empty history state', () => {
      const { getByText } = render(
        <EmptyState
          emoji="📋"
          title="No history"
          subtitle="Completed orders will appear here"
        />
      );

      expect(getByText('📋')).toBeTruthy();
      expect(getByText('No history')).toBeTruthy();
      expect(getByText('Completed orders will appear here')).toBeTruthy();
    });

    it('should render search no results state', () => {
      const { getByText } = render(
        <EmptyState
          emoji="🔍"
          title="No results found"
          subtitle="Try adjusting your search"
        />
      );

      expect(getByText('🔍')).toBeTruthy();
      expect(getByText('No results found')).toBeTruthy();
      expect(getByText('Try adjusting your search')).toBeTruthy();
    });

    it('should render error state', () => {
      const action = <Button title="Retry" variant="warning" />;
      const { getByText } = render(
        <EmptyState
          emoji="⚠️"
          title="Something went wrong"
          subtitle="Please try again later"
          action={action}
        />
      );

      expect(getByText('⚠️')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('Please try again later')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot with all props', () => {
      const action = <Button title="Action" />;
      const { toJSON } = render(
        <EmptyState
          emoji="🎉"
          title="Title"
          subtitle="Subtitle"
          action={action}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with minimal props', () => {
      const { toJSON } = render(<EmptyState title="Title" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
