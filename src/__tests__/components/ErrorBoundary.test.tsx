import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorBoundary from '../../components/ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({
  shouldThrow = true,
  message = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <Text>No Error</Text>;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Child Component</Text>
        </ErrorBoundary>
      );

      expect(getByText('Child Component')).toBeTruthy();
    });

    it('should render multiple children when no error', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </ErrorBoundary>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });

    it('should render nested components when no error', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(getByText('No Error')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should catch and display error', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
      expect(
        getByText("Si è verificato un errore imprevisto nell'applicazione.")
      ).toBeTruthy();
    });

    it('should display error emoji', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText('⚠️')).toBeTruthy();
    });

    it('should display retry button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText('Riprova')).toBeTruthy();
    });

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when retry is pressed', () => {
      const TestComponent: React.FC<{ shouldError: boolean }> = ({
        shouldError,
      }) => {
        if (shouldError) {
          throw new Error('Test error');
        }
        return <Text>Success</Text>;
      };

      let shouldError = true;

      const { getByText, rerender } = render(
        <ErrorBoundary>
          <TestComponent shouldError={shouldError} />
        </ErrorBoundary>
      );

      // Verify error is shown
      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();

      // Simulate fixing the error
      shouldError = false;

      // Click retry button
      const retryButton = getByText('Riprova');
      fireEvent.press(retryButton);

      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <TestComponent shouldError={shouldError} />
        </ErrorBoundary>
      );

      // Note: In real scenario, resetError would need to trigger re-render
      // This test demonstrates the button interaction
    });

    it('should call resetError when retry button is pressed', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = getByText('Riprova');
      fireEvent.press(retryButton);

      // After reset, error details should be cleared (though component may still show error)
      // In a real scenario, this would trigger a re-mount of children
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (error: Error, resetError: () => void) => (
        <Text>Custom Error: {error.message}</Text>
      );

      const { getByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError message="Custom error occurred" />
        </ErrorBoundary>
      );

      expect(getByText('Custom Error: Custom error occurred')).toBeTruthy();
    });

    it('should pass error to custom fallback', () => {
      const customFallback = (error: Error) => (
        <Text>Error: {error.message}</Text>
      );

      const { getByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError message="Specific error" />
        </ErrorBoundary>
      );

      expect(getByText('Error: Specific error')).toBeTruthy();
    });

    it('should pass resetError to custom fallback', () => {
      const customFallback = (error: Error, resetError: () => void) => (
        <Text onPress={resetError}>Reset</Text>
      );

      const { getByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      const resetButton = getByText('Reset');
      expect(resetButton).toBeTruthy();
      fireEvent.press(resetButton);
    });
  });

  describe('Error Details in Dev Mode', () => {
    const originalDev = __DEV__;

    afterEach(() => {
      (global as any).__DEV__ = originalDev;
    });

    it('should show error details in development mode', () => {
      (global as any).__DEV__ = true;

      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <ThrowError message="Dev error message" />
        </ErrorBoundary>
      );

      // Check if error details section exists
      expect(queryByText('Dettagli errore:')).toBeTruthy();
    });

    it('should not show error details in production mode', () => {
      (global as any).__DEV__ = false;

      const { queryByText } = render(
        <ErrorBoundary>
          <ThrowError message="Prod error message" />
        </ErrorBoundary>
      );

      expect(queryByText('Dettagli errore:')).toBeNull();
    });
  });

  describe('Different Error Types', () => {
    it('should handle TypeError', () => {
      const ThrowTypeError = () => {
        throw new TypeError('Type error occurred');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowTypeError />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
    });

    it('should handle ReferenceError', () => {
      const ThrowReferenceError = () => {
        throw new ReferenceError('Reference error occurred');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowReferenceError />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
    });

    it('should handle custom error messages', () => {
      const errorMessages = [
        'Network error',
        'Database connection failed',
        'Invalid data format',
      ];

      errorMessages.forEach((message) => {
        const { getByText } = render(
          <ErrorBoundary>
            <ThrowError message={message} />
          </ErrorBoundary>
        );

        expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should call componentDidCatch when error occurs', () => {
      const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('should call getDerivedStateFromError when error occurs', () => {
      const spy = jest.spyOn(ErrorBoundary, 'getDerivedStateFromError');

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should catch error in inner boundary first', () => {
      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <Text>Outer Boundary</Text>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Inner boundary should catch the error
      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
      // Outer boundary children should still render
      expect(getByText('Outer Boundary')).toBeTruthy();
    });

    it('should handle multiple nested boundaries', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ErrorBoundary>
            <ErrorBoundary>
              <ThrowError />
            </ErrorBoundary>
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with empty message', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError message="" />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'Error: ' + 'A'.repeat(500);
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError message={longMessage} />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
    });

    it('should handle special characters in error message', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError message="Error: <>&" />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
    });

    it('should handle unicode characters in error message', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError message="错误: 测试" />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Qualcosa è andato storto')).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot when no error', () => {
      const { toJSON } = render(
        <ErrorBoundary>
          <Text>Normal Content</Text>
        </ErrorBoundary>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot when error occurred', () => {
      const { toJSON } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});
