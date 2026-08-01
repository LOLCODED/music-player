import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login page for an unauthenticated visitor', async () => {
  render(<App />);
  expect(
    await screen.findByText(/connect to your subsonic server/i)
  ).toBeInTheDocument();
});
