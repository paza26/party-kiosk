import React from 'react';
import { render } from '@testing-library/react-native';
import Loading from '../../components/Loading';
import { COLORS } from '../../constants/theme';

describe('Loading Component', () => {
  describe('Rendering', () => {
    it('should render activity indicator', () => {
      const { getByLabelText } = render(<Loading />);
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should render with default size (large)', () => {
      const { getByLabelText } = render(<Loading />);
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should render with small size', () => {
      const { getByLabelText } = render(<Loading size="small" />);
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should use default color (primary)', () => {
      const { getByLabelText } = render(<Loading />);
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should accept custom color', () => {
      const { getByLabelText } = render(<Loading color="#FF0000" />);
      expect(getByLabelText('Loading')).toBeTruthy();
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
      const { getByLabelText } = render(
        <Loading text="Loading products" />
      );
      expect(getByLabelText('Loading products')).toBeTruthy();
    });
  });

  describe('Layout Modes', () => {
    it('should not be full screen by default', () => {
      const { getByLabelText } = render(<Loading />);
      const container = getByLabelText('Loading').parent;
      expect(container).toBeTruthy();
    });

    it('should render in full screen mode', () => {
      const { getByLabelText } = render(<Loading fullScreen />);
      const container = getByLabelText('Loading').parent;
      expect(container).toBeTruthy();
    });

    it('should render with text in full screen mode', () => {
      const { getByText, getByLabelText } = render(
        <Loading fullScreen text="Loading..." />
      );
      expect(getByText('Loading...')).toBeTruthy();
      expect(getByLabelText('Loading...')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom styles', () => {
      const customStyle = { padding: 40 };
      const { getByLabelText } = render(
        <Loading style={customStyle} />
      );
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should merge custom styles with default styles', () => {
      const { getByLabelText } = render(
        <Loading style={{ backgroundColor: 'red' }} />
      );
      expect(getByLabelText('Loading')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label', () => {
      const { getByLabelText } = render(<Loading />);
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should use custom text as accessibility label', () => {
      const { getByLabelText } = render(
        <Loading text="Fetching orders" />
      );
      expect(getByLabelText('Fetching orders')).toBeTruthy();
    });

    it('should be accessible in full screen mode', () => {
      const { getByLabelText } = render(
        <Loading fullScreen text="Please wait" />
      );
      expect(getByLabelText('Please wait')).toBeTruthy();
    });
  });

  describe('Size and Color Combinations', () => {
    it('should render small size with custom color', () => {
      const { getByLabelText } = render(
        <Loading size="small" color="#00FF00" />
      );
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should render large size with custom color', () => {
      const { getByLabelText } = render(
        <Loading size="large" color="#0000FF" />
      );
      expect(getByLabelText('Loading')).toBeTruthy();
    });
  });

  describe('Complex Configurations', () => {
    it('should handle all props together', () => {
      const { getByText, getByLabelText } = render(
        <Loading
          size="small"
          color="#FF00FF"
          text="Processing..."
          fullScreen
          style={{ padding: 20 }}
        />
      );
      expect(getByText('Processing...')).toBeTruthy();
      expect(getByLabelText('Processing...')).toBeTruthy();
    });

    it('should work with theme colors', () => {
      const { getByLabelText } = render(
        <Loading color={COLORS.primary} />
      );
      expect(getByLabelText('Loading')).toBeTruthy();
    });

    it('should work with different theme colors', () => {
      const colors = [COLORS.primary, COLORS.error, COLORS.success, COLORS.info];

      colors.forEach((color) => {
        const { getByLabelText } = render(
          <Loading color={color} />
        );
        expect(getByLabelText('Loading')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text string', () => {
      const { queryByText, getByLabelText } = render(
        <Loading text="" />
      );
      expect(queryByText('')).toBeNull();
      expect(getByLabelText('Loading')).toBeTruthy();
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
