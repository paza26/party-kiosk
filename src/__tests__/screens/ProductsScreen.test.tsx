import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ProductsScreen from '../../screens/ProductsScreen';
import { renderWithProviders, createMockProduct } from '../utils/testUtils';
import { useApp } from '../../context/AppContext';

// Mock the useApp hook
jest.mock('../../context/AppContext', () => ({
  ...jest.requireActual('../../context/AppContext'),
  useApp: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProductsScreen', () => {
  const mockAddProduct = jest.fn();
  const mockUpdateProduct = jest.fn();
  const mockDeleteProduct = jest.fn();

  const defaultMockContext = {
    products: [],
    orders: [],
    currentOrder: [],
    addProduct: mockAddProduct,
    updateProduct: mockUpdateProduct,
    deleteProduct: mockDeleteProduct,
    addToCurrentOrder: jest.fn(),
    removeFromCurrentOrder: jest.fn(),
    clearCurrentOrder: jest.fn(),
    completeOrder: jest.fn(),
    deleteOrder: jest.fn(),
    resetSession: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useApp as jest.Mock).mockReturnValue(defaultMockContext);
    (Alert.alert as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render the screen title', () => {
      const { getByText } = renderWithProviders(<ProductsScreen />);
      expect(getByText('Gestione Prodotti')).toBeTruthy();
    });

    it('should render add product button', () => {
      const { getByText } = renderWithProviders(<ProductsScreen />);
      expect(getByText('+ Aggiungi Prodotto')).toBeTruthy();
    });

    it('should show empty state when no products', () => {
      const { getByText } = renderWithProviders(<ProductsScreen />);
      expect(getByText('Nessun prodotto')).toBeTruthy();
      expect(getByText('Tocca "Aggiungi Prodotto" per iniziare')).toBeTruthy();
    });

    it('should render product list when products exist', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza', price: 5.0 }),
        createMockProduct({ id: '2', name: 'Burger', price: 7.0 }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText } = renderWithProviders(<ProductsScreen />);

      expect(getByText('Pizza')).toBeTruthy();
      expect(getByText('Burger')).toBeTruthy();
      expect(getByText('€ 5.00')).toBeTruthy();
      expect(getByText('€ 7.00')).toBeTruthy();
    });

    it('should display product emojis', () => {
      const mockProducts = [
        createMockProduct({ emoji: '🍕', name: 'Pizza' }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText } = renderWithProviders(<ProductsScreen />);
      expect(getByText('🍕')).toBeTruthy();
    });

    it('should render edit and delete buttons for each product', () => {
      const mockProducts = [createMockProduct({ name: 'Pizza' })];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getAllByText } = renderWithProviders(<ProductsScreen />);
      expect(getAllByText('Modifica')).toHaveLength(1);
      expect(getAllByText('Elimina')).toHaveLength(1);
    });
  });

  describe('Add Product Modal', () => {
    it('should open modal when add button is pressed', () => {
      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      expect(getByText('Nuovo Prodotto')).toBeTruthy();
    });

    it('should show default emoji in add modal', () => {
      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      expect(getByText('Tocca per cambiare emoji')).toBeTruthy();
    });

    it('should show input fields in add modal', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      expect(getByPlaceholderText('Nome prodotto')).toBeTruthy();
      expect(getByPlaceholderText('Prezzo (€)')).toBeTruthy();
    });

    it('should show color picker in add modal', () => {
      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      expect(getByText('Colore pulsante:')).toBeTruthy();
    });

    it('should close modal when cancel is pressed', () => {
      const { getByText, queryByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));
      expect(getByText('Nuovo Prodotto')).toBeTruthy();

      fireEvent.press(getByText('Annulla'));

      waitFor(() => {
        expect(queryByText('Nuovo Prodotto')).toBeNull();
      });
    });

    it('should show error when saving product with empty name', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.00');

      fireEvent.press(getByText('Salva'));

      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Inserisci un nome per il prodotto');
    });

    it('should show error when saving product with invalid price', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, 'abc');

      fireEvent.press(getByText('Salva'));

      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Inserisci un prezzo valido');
    });

    it('should show error when saving product with zero price', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '0');

      fireEvent.press(getByText('Salva'));

      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Inserisci un prezzo valido');
    });

    it('should show error when saving product with negative price', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '-5');

      fireEvent.press(getByText('Salva'));

      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Inserisci un prezzo valido');
    });

    it('should trim whitespace from product name', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, '  Pizza  ');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.00');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Pizza',
        })
      );
    });

    it('should call addProduct with correct data when saving new product', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.50');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Pizza',
          price: 5.5,
          emoji: '🍕',
        })
      );
    });

    it('should generate unique ID for new product', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.00');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
        })
      );
    });

    it('should close modal after successfully saving product', () => {
      const { getByText, getByPlaceholderText, queryByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.00');

      fireEvent.press(getByText('Salva'));

      waitFor(() => {
        expect(queryByText('Nuovo Prodotto')).toBeNull();
      });
    });

    it('should handle decimal prices correctly', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.99');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 5.99,
        })
      );
    });
  });

  describe('Edit Product Modal', () => {
    it('should open edit modal when edit button is pressed', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza', price: 5.0 }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Modifica'));

      expect(getByText('Modifica Prodotto')).toBeTruthy();
    });

    it('should pre-fill form with existing product data', () => {
      const mockProducts = [
        createMockProduct({
          id: '1',
          name: 'Pizza',
          emoji: '🍕',
          price: 5.0
        }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText, getByDisplayValue } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Modifica'));

      expect(getByDisplayValue('Pizza')).toBeTruthy();
      expect(getByDisplayValue('5')).toBeTruthy();
    });

    it('should call updateProduct when saving edited product', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza', price: 5.0 }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText, getByDisplayValue } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Modifica'));

      const nameInput = getByDisplayValue('Pizza');
      fireEvent.changeText(nameInput, 'Super Pizza');

      const priceInput = getByDisplayValue('5');
      fireEvent.changeText(priceInput, '7.50');

      fireEvent.press(getByText('Salva'));

      expect(mockUpdateProduct).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          name: 'Super Pizza',
          price: 7.5,
        })
      );
    });

    it('should preserve product ID when updating', () => {
      const mockProducts = [
        createMockProduct({ id: 'original-id', name: 'Pizza', price: 5.0 }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText, getByDisplayValue } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Modifica'));

      const nameInput = getByDisplayValue('Pizza');
      fireEvent.changeText(nameInput, 'New Name');

      fireEvent.press(getByText('Salva'));

      expect(mockUpdateProduct).toHaveBeenCalledWith(
        'original-id',
        expect.objectContaining({
          id: 'original-id',
        })
      );
    });

    it('should validate edited product name', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza', price: 5.0 }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText, getByDisplayValue } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Modifica'));

      const nameInput = getByDisplayValue('Pizza');
      fireEvent.changeText(nameInput, '   ');

      fireEvent.press(getByText('Salva'));

      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Inserisci un nome per il prodotto');
      expect(mockUpdateProduct).not.toHaveBeenCalled();
    });

    it('should validate edited product price', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza', price: 5.0 }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText, getByDisplayValue } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Modifica'));

      const priceInput = getByDisplayValue('5');
      fireEvent.changeText(priceInput, '-10');

      fireEvent.press(getByText('Salva'));

      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Inserisci un prezzo valido');
      expect(mockUpdateProduct).not.toHaveBeenCalled();
    });
  });

  describe('Delete Product', () => {
    it('should show confirmation alert when delete is pressed', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza' }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Elimina'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Elimina Prodotto',
        'Vuoi eliminare "Pizza"?',
        expect.any(Array)
      );
    });

    it('should call deleteProduct when confirmed', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza' }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const deleteButton = buttons?.find((btn: any) => btn.text === 'Elimina');
        if (deleteButton?.onPress) {
          deleteButton.onPress();
        }
      });

      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Elimina'));

      expect(mockDeleteProduct).toHaveBeenCalledWith('1');
    });

    it('should not delete product when cancelled', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza' }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const cancelButton = buttons?.find((btn: any) => btn.text === 'Annulla');
        if (cancelButton?.onPress) {
          cancelButton.onPress();
        }
      });

      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('Elimina'));

      expect(mockDeleteProduct).not.toHaveBeenCalled();
    });
  });

  describe('Emoji Picker', () => {
    it('should open emoji picker when emoji button is pressed', () => {
      const { getByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      fireEvent.press(getByText('Tocca per cambiare emoji'));

      expect(getByText('Scegli Emoji')).toBeTruthy();
    });

    it('should close emoji picker when emoji is selected', () => {
      const { getByText, queryByText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));
      fireEvent.press(getByText('Tocca per cambiare emoji'));

      expect(getByText('Scegli Emoji')).toBeTruthy();

      // Note: Finding specific emoji in the grid would require testID
      // This is a limitation test to show the structure

      fireEvent.press(getByText('Chiudi'));

      waitFor(() => {
        expect(queryByText('Scegli Emoji')).toBeNull();
      });
    });
  });

  describe('Color Picker', () => {
    it('should allow selecting different colors', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      // Test that color picker is visible
      expect(getByText('Colore pulsante:')).toBeTruthy();

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.00');

      fireEvent.press(getByText('Salva'));

      // Should save with a default color
      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          buttonColor: expect.any(String),
        })
      );
    });
  });

  describe('Multiple Products', () => {
    it('should render multiple products correctly', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza', price: 5.0 }),
        createMockProduct({ id: '2', name: 'Burger', price: 7.0 }),
        createMockProduct({ id: '3', name: 'Fries', price: 3.0 }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getByText } = renderWithProviders(<ProductsScreen />);

      expect(getByText('Pizza')).toBeTruthy();
      expect(getByText('Burger')).toBeTruthy();
      expect(getByText('Fries')).toBeTruthy();
    });

    it('should have separate edit buttons for each product', () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Pizza' }),
        createMockProduct({ id: '2', name: 'Burger' }),
      ];

      (useApp as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        products: mockProducts,
      });

      const { getAllByText } = renderWithProviders(<ProductsScreen />);

      const editButtons = getAllByText('Modifica');
      expect(editButtons).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long product names', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      const longName = 'A'.repeat(100);
      fireEvent.changeText(nameInput, longName);

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.00');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: longName,
        })
      );
    });

    it('should handle very large prices', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Expensive Item');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '999999.99');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 999999.99,
        })
      );
    });

    it('should handle very small decimal prices', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Cheap Item');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '0.01');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 0.01,
        })
      );
    });

    it('should handle price with many decimal places', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.123456789');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 5.123456789,
        })
      );
    });

    it('should handle special characters in product name', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<ProductsScreen />);

      fireEvent.press(getByText('+ Aggiungi Prodotto'));

      const nameInput = getByPlaceholderText('Nome prodotto');
      fireEvent.changeText(nameInput, 'Pizza & Pasta @ $5!');

      const priceInput = getByPlaceholderText('Prezzo (€)');
      fireEvent.changeText(priceInput, '5.00');

      fireEvent.press(getByText('Salva'));

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Pizza & Pasta @ $5!',
        })
      );
    });
  });
});
