import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/Button';
import { COLORS } from '../../constants/theme';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(<Button title="Click Me" />);
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render with default props', () => {
      const { getByText } = render(<Button title="Test" />);
      const button = getByText('Test');
      expect(button).toBeTruthy();
    });

    it('should render with primary variant by default', () => {
      const { getByText } = render(<Button title="Test" />);
      const button = getByText('Test').parent?.parent;
      expect(button?.props.accessibilityRole).toBe('button');
    });

    it('should apply secondary variant styles', () => {
      const { getByText } = render(<Button title="Test" variant="secondary" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply danger variant styles', () => {
      const { getByText } = render(<Button title="Test" variant="danger" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply warning variant styles', () => {
      const { getByText } = render(<Button title="Test" variant="warning" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply ghost variant styles', () => {
      const { getByText } = render(<Button title="Test" variant="ghost" />);
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render with medium size by default', () => {
      const { getByText } = render(<Button title="Test" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should render with small size', () => {
      const { getByText } = render(<Button title="Test" size="small" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should render with large size', () => {
      const { getByText } = render(<Button title="Test" size="large" />);
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const { getByAccessibilityLabel, queryByText } = render(
        <Button title="Test" loading />
      );
      expect(getByAccessibilityLabel('Test, Loading')).toBeTruthy();
      expect(queryByText('Test')).toBeNull();
    });

    it('should be disabled when loading', () => {
      const onPress = jest.fn();
      const { getByAccessibilityLabel } = render(
        <Button title="Test" loading onPress={onPress} />
      );

      const button = getByAccessibilityLabel('Test, Loading');
      fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('should hide icons when loading', () => {
      const { queryByTestId } = render(
        <Button
          title="Test"
          loading
          leftIcon={<></>}
          rightIcon={<></>}
        />
      );
      expect(queryByTestId('left-icon')).toBeNull();
      expect(queryByTestId('right-icon')).toBeNull();
    });
  });

  describe('Disabled State', () => {
    it('should not trigger onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Test" disabled onPress={onPress} />
      );

      fireEvent.press(getByText('Test'));

      expect(onPress).not.toHaveBeenCalled();
    });

    it('should have disabled accessibility state', () => {
      const { getByAccessibilityLabel } = render(
        <Button title="Test" disabled />
      );

      const button = getByAccessibilityLabel('Test');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Interactions', () => {
    it('should trigger onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button title="Test" onPress={onPress} />);

      fireEvent.press(getByText('Test'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger onPress multiple times', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button title="Test" onPress={onPress} />);

      const button = getByText('Test');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(3);
    });

    it('should not trigger onPress when both disabled and loading', () => {
      const onPress = jest.fn();
      const { getByAccessibilityLabel } = render(
        <Button title="Test" disabled loading onPress={onPress} />
      );

      fireEvent.press(getByAccessibilityLabel('Test, Loading'));

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    it('should render left icon', () => {
      const LeftIcon = () => <></>;
      const { getByText } = render(
        <Button title="Test" leftIcon={<LeftIcon />} />
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should render right icon', () => {
      const RightIcon = () => <></>;
      const { getByText } = render(
        <Button title="Test" rightIcon={<RightIcon />} />
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should render both left and right icons', () => {
      const LeftIcon = () => <></>;
      const RightIcon = () => <></>;
      const { getByText } = render(
        <Button
          title="Test"
          leftIcon={<LeftIcon />}
          rightIcon={<RightIcon />}
        />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('should render full width when specified', () => {
      const { getByText } = render(<Button title="Test" fullWidth />);
      const button = getByText('Test').parent?.parent;
      expect(button).toBeTruthy();
    });

    it('should apply custom styles', () => {
      const customStyle = { marginTop: 20 };
      const { getByText } = render(
        <Button title="Test" style={customStyle} />
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply custom text styles', () => {
      const customTextStyle = { fontWeight: '800' as const };
      const { getByText } = render(
        <Button title="Test" textStyle={customTextStyle} />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      const { getByText } = render(<Button title="Test" />);
      const button = getByText('Test').parent?.parent;
      expect(button?.props.accessibilityRole).toBe('button');
    });

    it('should use title as accessibility label by default', () => {
      const { getByAccessibilityLabel } = render(<Button title="Click Me" />);
      expect(getByAccessibilityLabel('Click Me')).toBeTruthy();
    });

    it('should use custom accessibility label when provided', () => {
      const { getByAccessibilityLabel } = render(
        <Button title="Test" accessibilityLabel="Custom Label" />
      );
      expect(getByAccessibilityLabel('Custom Label')).toBeTruthy();
    });

    it('should append "Loading" to accessibility label when loading', () => {
      const { getByAccessibilityLabel } = render(
        <Button title="Submit" loading />
      );
      expect(getByAccessibilityLabel('Submit, Loading')).toBeTruthy();
    });

    it('should have correct accessibility state when enabled', () => {
      const { getByAccessibilityLabel } = render(<Button title="Test" />);
      const button = getByAccessibilityLabel('Test');
      expect(button.props.accessibilityState.disabled).toBeFalsy();
    });

    it('should have correct accessibility state when disabled', () => {
      const { getByAccessibilityLabel } = render(
        <Button title="Test" disabled />
      );
      const button = getByAccessibilityLabel('Test');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should have correct accessibility state when loading', () => {
      const { getByAccessibilityLabel } = render(
        <Button title="Test" loading />
      );
      const button = getByAccessibilityLabel('Test, Loading');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { getByAccessibilityLabel } = render(<Button title="" />);
      expect(getByAccessibilityLabel('')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(100);
      const { getByText } = render(<Button title={longTitle} />);
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const { getByText } = render(
        <Button title="Test & <Special> Characters!" />
      );
      expect(getByText('Test & <Special> Characters!')).toBeTruthy();
    });

    it('should handle unicode characters in title', () => {
      const { getByText } = render(<Button title="测试 Test 🎉" />);
      expect(getByText('测试 Test 🎉')).toBeTruthy();
    });
  });

  describe('Variants with Different States', () => {
    const variants = ['primary', 'secondary', 'danger', 'warning', 'ghost'] as const;

    variants.forEach((variant) => {
      it(`should render ${variant} variant when disabled`, () => {
        const { getByText } = render(
          <Button title="Test" variant={variant} disabled />
        );
        expect(getByText('Test')).toBeTruthy();
      });

      it(`should render ${variant} variant when loading`, () => {
        const { getByAccessibilityLabel } = render(
          <Button title="Test" variant={variant} loading />
        );
        expect(getByAccessibilityLabel('Test, Loading')).toBeTruthy();
      });

      it(`should render ${variant} variant with fullWidth`, () => {
        const { getByText } = render(
          <Button title="Test" variant={variant} fullWidth />
        );
        expect(getByText('Test')).toBeTruthy();
      });
    });
  });

  describe('Combined Props', () => {
    it('should handle all size and variant combinations', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      const variants = ['primary', 'secondary', 'danger', 'warning', 'ghost'] as const;

      sizes.forEach((size) => {
        variants.forEach((variant) => {
          const { getByText } = render(
            <Button title={`${size}-${variant}`} size={size} variant={variant} />
          );
          expect(getByText(`${size}-${variant}`)).toBeTruthy();
        });
      });
    });
  });
});
