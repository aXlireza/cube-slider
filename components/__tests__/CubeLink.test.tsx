import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CubeLink from '../CubeLink';

const pushStateMock = vi.spyOn(window.history, 'pushState');
const navigateMock = vi.fn(async (loader: () => Promise<unknown>) => {
  await loader();
});
vi.mock('../useCubeNavigation', () => ({
  useCubeNavigation: () => navigateMock,
}));

// mock dynamic import target
vi.mock(
  '@/components/test-pages/PageOne',
  () => ({ PageOneContent: () => null }),
  { virtual: true },
);

describe('CubeLink', () => {
  it('preloads and updates history on click', async () => {
    const { getByText } = render(<CubeLink href="/test1">Go</CubeLink>);
    fireEvent.click(getByText('Go'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalled();
      expect(pushStateMock).toHaveBeenCalledWith({}, '', '/test1');
    });
  });
});
