import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitConverter from './UnitConverter';

// -----------------------------------------------------------------------------
// Component tests with React Testing Library (RTL)
//
// RTL's philosophy: test what the *user* sees and does, not implementation
// details. So we find elements the way a user (or screen reader) would, by
// role and visible text, and interact through `userEvent`, which simulates
// real clicks/typing (pointer down -> up -> click, focus changes, ...).
// -----------------------------------------------------------------------------

describe('UnitConverter', () => {
  it('renders a button for each unit', () => {
    render(<UnitConverter currentUnit="C" setCurrentUnit={vi.fn()} theme="green" />);

    expect(screen.getByRole('button', { name: /celsius/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fahrenheit/i })).toBeInTheDocument();
  });

  it('calls setCurrentUnit("F") when the Fahrenheit button is clicked', async () => {
    // `vi.fn()` creates a "spy" function that records every call made to it,
    // so we can assert on how the component used its props.
    const setCurrentUnit = vi.fn();
    const user = userEvent.setup();
    render(<UnitConverter currentUnit="C" setCurrentUnit={setCurrentUnit} theme="green" />);

    await user.click(screen.getByRole('button', { name: /fahrenheit/i }));

    expect(setCurrentUnit).toHaveBeenCalledTimes(1);
    expect(setCurrentUnit).toHaveBeenCalledWith('F');
  });

  it('calls setCurrentUnit("C") when the Celsius button is clicked', async () => {
    const setCurrentUnit = vi.fn();
    const user = userEvent.setup();
    render(<UnitConverter currentUnit="F" setCurrentUnit={setCurrentUnit} theme="amber" />);

    await user.click(screen.getByRole('button', { name: /celsius/i }));

    expect(setCurrentUnit).toHaveBeenCalledWith('C');
  });

  it('highlights only the active unit (green theme)', () => {
    render(<UnitConverter currentUnit="C" setCurrentUnit={vi.fn()} theme="green" />);

    // Styling is a fair thing to check when it *is* the behavior: the active
    // button is how the user knows which unit is selected.
    expect(screen.getByRole('button', { name: /celsius/i })).toHaveClass('bg-crt-green/20');
    expect(screen.getByRole('button', { name: /fahrenheit/i })).not.toHaveClass('bg-crt-green/20');
  });

  it('uses amber classes for the amber theme', () => {
    render(<UnitConverter currentUnit="F" setCurrentUnit={vi.fn()} theme="amber" />);

    expect(screen.getByRole('button', { name: /fahrenheit/i })).toHaveClass('bg-crt-amber/20');
  });
});
