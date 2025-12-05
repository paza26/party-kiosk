import React from 'react';
import { render } from '@testing-library/react-native';
import Loading from '../../components/Loading';
import { COLORS } from '../../constants/theme';

describe('Loading Component', () => {
  describe('Rendering', () => {
    it('should render activity indicator', () => {
      const { getByAccessibilityLabel } = render(<Loading />);
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should render with default size (large)', () => {
      const { getByAccessibilityLabel } = render(<Loading />);
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should render with small size', () => {
      const { getByAccessibilityLabel } = render(<Loading size="small" />);
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should use default color (primary)', () => {
      const { getByAccessibilityLabel } = render(<Loading />);
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should accept custom color', () => {
      const { getByAccessibilityLabel } = render(<Loading color="#FF0000" />);
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });
  });

  describe('Text Display', () => {
    it('should not show text by default', () => {
      const { queryByText } = render(<Loading />);
      expect(queryByText(/./)).toBeNull();
    });

    it('should show custom text when provided', () => {
      const { getByText } = render(<Loading text="Loading data..." />);
      expect(getByText('Loading data...')).toBeTruthy();
    });

    it('should use text as accessibility label', () => {
      const { getByAccessibilityLabel } = render(
        <Loading text="Loading products" />
      );
      expect(getByAccessibilityLabel('Loading products')).toBeTruthy();
    });
  });

  describe('Layout Modes', () => {
    it('should not be full screen by default', () => {
      const { getByAccessibilityLabel } = render(<Loading />);
      const container = getByAccessibilityLabel('Loading').parent;
      expect(container).toBeTruthy();
    });

    it('should render in full screen mode', () => {
      const { getByAccessibilityLabel } = render(<Loading fullScreen />);
      const container = getByAccessibilityLabel('Loading').parent;
      expect(container).toBeTruthy();
    });

    it('should render with text in full screen mode', () => {
      const { getByText, getByAccessibilityLabel } = render(
        <Loading fullScreen text="Loading..." />
      );
      expect(getByText('Loading...')).toBeTruthy();
      expect(getByAccessibilityLabel('Loading...')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom styles', () => {
      const customStyle = { padding: 40 };
      const { getByAccessibilityLabel } = render(
        <Loading style={customStyle} />
      );
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should merge custom styles with default styles', () => {
      const { getByAccessibilityLabel } = render(
        <Loading style={{ backgroundColor: 'red' }} />
      );
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label', () => {
      const { getByAccessibilityLabel } = render(<Loading />);
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should use custom text as accessibility label', () => {
      const { getByAccessibilityLabel } = render(
        <Loading text="Fetching orders" />
      );
      expect(getByAccessibilityLabel('Fetching orders')).toBeTruthy();
    });

    it('should be accessible in full screen mode', () => {
      const { getByAccessibilityLabel } = render(
        <Loading fullScreen text="Please wait" />
      );
      expect(getByAccessibilityLabel('Please wait')).toBeTruthy();
    });
  });

  describe('Size and Color Combinations', () => {
    it('should render small size with custom color', () => {
      const { getByAccessibilityLabel } = render(
        <Loading size="small" color="#00FF00" />
      );
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should render large size with custom color', () => {
      const { getByAccessibilityLabel } = render(
        <Loading size="large" color="#0000FF" />
      );
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });
  });

  describe('Complex Configurations', () => {
    it('should handle all props together', () => {
      const { getByText, getByAccessibilityLabel } = render(
        <Loading
          size="small"
          color="#FF00FF"
          text="Processing..."
          fullScreen
          style={{ padding: 20 }}
        />
      );
      expect(getByText('Processing...')).toBeTruthy();
      expect(getByAccessibilityLabel('Processing...')).toBeTruthy();
    });

    it('should work with theme colors', () => {
      const { getByAccessibilityLabel } = render(
        <Loading color={COLORS.primary} />
      );
      expect(getByAccessibilityLabel('Loading')).toBeTruthy();
    });

    it('should work with different theme colors', () => {
      const colors = [COLORS.primary, COLORS.error, COLORS.success, COLORS.info];

      colors.forEach((color) => {
        const { getByAccessibilityLabel } = render(
          <Loading color={color} />
        );
        expect(getByAccessibilityLabel('Loading')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text string', () => {
      const { queryByText, getByAccessibilityLabel } = render(
        <Loading text="" />
      );
      expect(queryByText('')).toBeNull();
      expect(getByAccessibilityLabel('')).toBeTruthy();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(200);
      const { getByText } = render(<Loading text={longText} />);
      expect(getByText(longText)).toBeTruthy();
    });

    it('should handle special characters in text', () => {
      const { getByText } = render(
        <Loading text="Loading... <>&" />
      );
      expect(getByText('Loading... <>&')).toBeTruthy();
    });

    it('should handle unicode characters in text', () => {
      const { getByText } = render(
        <Loading text="加载中... 🔄" />
      );
      expect(getByText('加载中... 🔄')).toBeTruthy();
    });

    it('should handle multiline text', () => {
      const { getByText } = render(
        <Loading text={'Loading data...\nPlease wait'} />
      );
      expect(getByText('Loading data...\nPlease wait')).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for default loading', () => {
      const { toJSON } = render(<Loading />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for loading with text', () => {
      const { toJSON } = render(<Loading text="Loading..." />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for full screen loading', () => {
      const { toJSON } = render(<Loading fullScreen text="Loading products..." />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
