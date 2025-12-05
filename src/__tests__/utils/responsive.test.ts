import { Dimensions, Platform } from 'react-native';
import {
  getWindowDimensions,
  getScreenDimensions,
  isTablet,
  isPhone,
  getDeviceType,
  scaleSize,
  getGridColumns,
  isIOS,
  isAndroid,
  isWeb,
  getStatusBarHeight,
  hasNotch,
  scaleFontSize,
  calculateGridItemSize,
} from '../../utils/responsive';

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(),
}));

describe('Responsive Utilities', () => {
  const mockDimensions = (width: number, height: number) => {
    (Dimensions.get as jest.Mock).mockImplementation((type: string) => ({
      width,
      height,
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWindowDimensions', () => {
    it('should return window dimensions', () => {
      mockDimensions(375, 812);
      const result = getWindowDimensions();
      expect(result).toEqual({ width: 375, height: 812 });
    });

    it('should call Dimensions.get with "window"', () => {
      mockDimensions(375, 812);
      getWindowDimensions();
      expect(Dimensions.get).toHaveBeenCalledWith('window');
    });
  });

  describe('getScreenDimensions', () => {
    it('should return screen dimensions', () => {
      mockDimensions(375, 812);
      const result = getScreenDimensions();
      expect(result).toEqual({ width: 375, height: 812 });
    });

    it('should call Dimensions.get with "screen"', () => {
      mockDimensions(375, 812);
      getScreenDimensions();
      expect(Dimensions.get).toHaveBeenCalledWith('screen');
    });
  });

  describe('isTablet', () => {
    it('should return false for phone width (< 768)', () => {
      mockDimensions(375, 812);
      expect(isTablet()).toBe(false);
    });

    it('should return true for tablet width (>= 768)', () => {
      mockDimensions(768, 1024);
      expect(isTablet()).toBe(true);
    });

    it('should accept width parameter', () => {
      expect(isTablet(500)).toBe(false);
      expect(isTablet(800)).toBe(true);
    });

    it('should return true for exactly 768 pixels', () => {
      expect(isTablet(768)).toBe(true);
    });

    it('should return false for 767 pixels', () => {
      expect(isTablet(767)).toBe(false);
    });
  });

  describe('isPhone', () => {
    it('should return true for phone width', () => {
      mockDimensions(375, 812);
      expect(isPhone()).toBe(true);
    });

    it('should return false for tablet width', () => {
      mockDimensions(1024, 768);
      expect(isPhone()).toBe(false);
    });

    it('should accept width parameter', () => {
      expect(isPhone(500)).toBe(true);
      expect(isPhone(800)).toBe(false);
    });

    it('should be inverse of isTablet', () => {
      expect(isPhone(767)).toBe(!isTablet(767));
      expect(isPhone(768)).toBe(!isTablet(768));
    });
  });

  describe('getDeviceType', () => {
    it('should return "phone" for small screens', () => {
      mockDimensions(375, 812);
      expect(getDeviceType()).toBe('phone');
    });

    it('should return "tablet" for medium screens', () => {
      mockDimensions(800, 1024);
      expect(getDeviceType()).toBe('tablet');
    });

    it('should return "desktop" for large screens', () => {
      mockDimensions(1440, 900);
      expect(getDeviceType()).toBe('desktop');
    });

    it('should accept width parameter', () => {
      expect(getDeviceType(375)).toBe('phone');
      expect(getDeviceType(800)).toBe('tablet');
      expect(getDeviceType(1440)).toBe('desktop');
    });

    it('should handle breakpoint boundaries correctly', () => {
      expect(getDeviceType(767)).toBe('phone');
      expect(getDeviceType(768)).toBe('tablet');
      expect(getDeviceType(1023)).toBe('tablet');
      expect(getDeviceType(1024)).toBe('desktop');
    });
  });

  describe('scaleSize', () => {
    it('should scale size proportionally to device width', () => {
      mockDimensions(375, 812);
      expect(scaleSize(10)).toBe(10); // 375 is baseline
    });

    it('should scale up for larger screens', () => {
      mockDimensions(750, 1024);
      expect(scaleSize(10)).toBe(20); // 2x baseline
    });

    it('should scale down for smaller screens', () => {
      mockDimensions(188, 812); // Half of baseline
      expect(scaleSize(20)).toBe(10);
    });

    it('should accept width parameter', () => {
      expect(scaleSize(10, 750)).toBe(20);
      expect(scaleSize(10, 375)).toBe(10);
    });

    it('should round to nearest integer', () => {
      const result = scaleSize(10, 400); // 400/375 * 10 = 10.666...
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle zero size', () => {
      expect(scaleSize(0, 750)).toBe(0);
    });
  });

  describe('getGridColumns', () => {
    it('should return 2 columns for phone', () => {
      mockDimensions(375, 812);
      expect(getGridColumns()).toBe(2);
    });

    it('should return 4 columns for tablet', () => {
      mockDimensions(1024, 768);
      expect(getGridColumns()).toBe(4);
    });

    it('should accept width parameter', () => {
      expect(getGridColumns(500)).toBe(2);
      expect(getGridColumns(800)).toBe(4);
    });
  });

  describe('Platform detection', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: originalPlatform,
        writable: true,
      });
    });

    it('should detect iOS', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
      expect(isIOS).toBe(true);
      expect(isAndroid).toBe(false);
      expect(isWeb).toBe(false);
    });

    it('should detect Android', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });
      expect(isIOS).toBe(false);
      expect(isAndroid).toBe(true);
      expect(isWeb).toBe(false);
    });

    it('should detect Web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });
      expect(isIOS).toBe(false);
      expect(isAndroid).toBe(false);
      expect(isWeb).toBe(true);
    });
  });

  describe('getStatusBarHeight', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: originalPlatform,
        writable: true,
      });
    });

    it('should return 0 for iOS', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
      expect(getStatusBarHeight()).toBe(0);
    });

    it('should return 0 for non-Android platforms', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });
      expect(getStatusBarHeight()).toBe(0);
    });
  });

  describe('hasNotch', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: originalPlatform,
        writable: true,
      });
    });

    it('should return false for Android', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });
      expect(hasNotch()).toBe(false);
    });

    it('should detect iPhone X notch (812)', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
      mockDimensions(375, 812);
      expect(hasNotch()).toBe(true);
    });

    it('should detect iPhone XR notch (896)', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
      mockDimensions(414, 896);
      expect(hasNotch()).toBe(true);
    });

    it('should detect iPhone 12/13/14 notch (844)', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
      mockDimensions(390, 844);
      expect(hasNotch()).toBe(true);
    });

    it('should return false for iPhone 8 and older', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
      mockDimensions(375, 667);
      expect(hasNotch()).toBe(false);
    });

    it('should handle landscape orientation', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
      mockDimensions(812, 375); // Landscape
      expect(hasNotch()).toBe(true);
    });
  });

  describe('scaleFontSize', () => {
    it('should return same size for phone', () => {
      mockDimensions(375, 812);
      expect(scaleFontSize(16)).toBe(16);
    });

    it('should scale up font size for tablet', () => {
      mockDimensions(1024, 768);
      expect(scaleFontSize(16)).toBe(17.6); // 16 * 1.1
    });

    it('should accept width parameter', () => {
      expect(scaleFontSize(16, 500)).toBe(16);
      expect(scaleFontSize(16, 800)).toBe(17.6);
    });

    it('should handle decimal font sizes', () => {
      expect(scaleFontSize(14.5, 1024)).toBe(15.95);
    });
  });

  describe('calculateGridItemSize', () => {
    it('should calculate item size with default aspect ratio', () => {
      const result = calculateGridItemSize(375, 2);

      // Total spacing: 12 * (2 + 1) = 36
      // Available width: 375 - 36 = 339
      // Item width: 339 / 2 = 169.5, floored to 169
      expect(result.width).toBe(169);
      expect(result.height).toBe(169); // Same as width with aspect ratio 1
    });

    it('should calculate with custom spacing', () => {
      const result = calculateGridItemSize(375, 2, 16);

      // Total spacing: 16 * (2 + 1) = 48
      // Available width: 375 - 48 = 327
      // Item width: 327 / 2 = 163.5, floored to 163
      expect(result.width).toBe(163);
      expect(result.height).toBe(163);
    });

    it('should calculate with custom aspect ratio', () => {
      const result = calculateGridItemSize(375, 2, 12, 0.75);

      // Width calculation same as first test: 169
      // Height: 169 * 0.75 = 126.75, floored to 126
      expect(result.width).toBe(169);
      expect(result.height).toBe(126);
    });

    it('should handle 4 columns for tablet', () => {
      const result = calculateGridItemSize(1024, 4, 12);

      // Total spacing: 12 * (4 + 1) = 60
      // Available width: 1024 - 60 = 964
      // Item width: 964 / 4 = 241
      expect(result.width).toBe(241);
      expect(result.height).toBe(241);
    });

    it('should handle tall aspect ratio', () => {
      const result = calculateGridItemSize(375, 2, 12, 1.5);

      // Width: 169
      // Height: 169 * 1.5 = 253.5, floored to 253
      expect(result.width).toBe(169);
      expect(result.height).toBe(253);
    });

    it('should return integers', () => {
      const result = calculateGridItemSize(377, 3, 13, 1.33);
      expect(Number.isInteger(result.width)).toBe(true);
      expect(Number.isInteger(result.height)).toBe(true);
    });

    it('should handle single column', () => {
      const result = calculateGridItemSize(375, 1, 12);

      // Total spacing: 12 * (1 + 1) = 24
      // Available width: 375 - 24 = 351
      // Item width: 351 / 1 = 351
      expect(result.width).toBe(351);
      expect(result.height).toBe(351);
    });
  });
});
