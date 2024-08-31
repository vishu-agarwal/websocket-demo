import { render, screen } from '@testing-library/react';
import App from './App';
import TheaterSeates from './TheaterSeates';
import TheaterDebounce from './TheaterDebounce';

test('renders learn react link', () => {
  render(<TheaterDebounce />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
