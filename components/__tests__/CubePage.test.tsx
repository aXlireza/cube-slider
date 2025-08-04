import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CubePage from '../CubePage';
import { useOptionalCube } from '../CubeProvider';

vi.mock('../CubeProvider');

describe('CubePage', () => {
  it('sets content on the specified face', async () => {
    const setFaceContent = vi.fn();
    const rotateToFace = vi.fn().mockResolvedValue(undefined);
    (useOptionalCube as unknown as vi.Mock).mockReturnValue({
      cubeRef: { current: { setFaceContent, rotateToFace } }
    });

    render(
      <CubePage face="right">
        <div>Hi</div>
      </CubePage>
    );

    await waitFor(() => {
      expect(setFaceContent).toHaveBeenCalled();
      expect(rotateToFace).toHaveBeenCalledWith('right');
    });
  });

  it('renders nothing when cube is unavailable', () => {
    (useOptionalCube as unknown as vi.Mock).mockReturnValue(undefined);
    const { container } = render(
      <CubePage>
        <div>Hi</div>
      </CubePage>
    );
    expect(container.firstChild).toBeNull();
  });
});
