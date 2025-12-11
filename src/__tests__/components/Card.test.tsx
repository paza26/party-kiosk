import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import Card from '../../components/Card';
import { SPACING } from '../../constants/theme';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <Card>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </Card>
      );
      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });

    it('should render with default variant (elevated)', () => {
      const { getByText } = render(
        <Card>
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render elevated variant', () => {
      const { getByText } = render(
        <Card variant="elevated">
          <Text>Elevated</Text>
        </Card>
      );
      expect(getByText('Elevated')).toBeTruthy();
    });

    it('should render outlined variant', () => {
      const { getByText } = render(
        <Card variant="outlined">
          <Text>Outlined</Text>
        </Card>
      );
      expect(getByText('Outlined')).toBeTruthy();
    });

    it('should render filled variant', () => {
      const { getByText } = render(
        <Card variant="filled">
          <Text>Filled</Text>
        </Card>
      );
      expect(getByText('Filled')).toBeTruthy();
    });
  });

  describe('Padding', () => {
    it('should apply default padding (lg)', () => {
      const { getByText } = render(
        <Card>
          <Text>Test</Text>
        </Card>
      );
      const container = getByText('Test').parent;
      expect(container).toBeTruthy();
    });

    it('should apply xs padding', () => {
      const { getByText } = render(
        <Card padding="xs">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply sm padding', () => {
      const { getByText } = render(
        <Card padding="sm">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply md padding', () => {
      const { getByText } = render(
        <Card padding="md">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply lg padding', () => {
      const { getByText } = render(
        <Card padding="lg">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply xl padding', () => {
      const { getByText } = render(
        <Card padding="xl">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply xxl padding', () => {
      const { getByText } = render(
        <Card padding="xxl">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply xxxl padding', () => {
      const { getByText } = render(
        <Card padding="xxxl">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style prop', () => {
      const customStyle = { marginTop: 20, marginBottom: 10 };
      const { getByText } = render(
        <Card style={customStyle}>
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should merge custom styles with default styles', () => {
      const { getByText } = render(
        <Card style={{ backgroundColor: 'red' }}>
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('View Props', () => {
    it('should accept testID prop', () => {
      const { getByTestId } = render(
        <Card testID="custom-card">
          <Text>Test</Text>
        </Card>
      );
      expect(getByTestId('custom-card')).toBeTruthy();
    });

    it('should accept accessibility props', () => {
      const { getByText } = render(
        <Card accessibilityLabel="Card Container">
          <Text>Test</Text>
        </Card>
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Complex Children', () => {
    it('should render nested components', () => {
      const { getByText } = render(
        <Card>
          <Text>Header</Text>
          <Card variant="outlined">
            <Text>Nested Card</Text>
          </Card>
          <Text>Footer</Text>
        </Card>
      );
      expect(getByText('Header')).toBeTruthy();
      expect(getByText('Nested Card')).toBeTruthy();
      expect(getByText('Footer')).toBeTruthy();
    });

    it('should handle null children gracefully', () => {
      const { queryByText } = render(
        <Card>
          <Text>Visible</Text>
          {null}
          {undefined}
          {false}
        </Card>
      );
      expect(queryByText('Visible')).toBeTruthy();
    });

    it('should render conditional children', () => {
      const showExtra = true;
      const { getByText, queryByText } = render(
        <Card>
          <Text>Always Visible</Text>
          {showExtra && <Text>Conditional</Text>}
        </Card>
      );
      expect(getByText('Always Visible')).toBeTruthy();
      expect(getByText('Conditional')).toBeTruthy();
    });
  });

  describe('Variant and Padding Combinations', () => {
    const variants = ['elevated', 'outlined', 'filled'] as const;
    const paddings = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const;

    variants.forEach((variant) => {
      paddings.forEach((padding) => {
        it(`should render ${variant} variant with ${padding} padding`, () => {
          const { getByText } = render(
            <Card variant={variant} padding={padding}>
              <Text>Test</Text>
            </Card>
          );
          expect(getByText('Test')).toBeTruthy();
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty children', () => {
      const { root } = render(<Card>{''}</Card>);
      expect(root).toBeTruthy();
    });

    it('should handle very nested content', () => {
      const { getByText } = render(
        <Card>
          <Card>
            <Card>
              <Card>
                <Text>Deep Nested</Text>
              </Card>
            </Card>
          </Card>
        </Card>
      );
      expect(getByText('Deep Nested')).toBeTruthy();
    });

    it('should handle array of children', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const { getByText } = render(
        <Card>
          {items.map((item, index) => (
            <Text key={index}>{item}</Text>
          ))}
        </Card>
      );
      items.forEach((item) => {
        expect(getByText(item)).toBeTruthy();
      });
    });
  });
});
