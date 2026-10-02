import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FallbackImage } from '@/components/common/FallbackImage';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    downloadBlob: vi.fn(),
  },
}));

describe('FallbackImage', () => {
  beforeEach(() => {
    vi.mocked(api.downloadBlob).mockReset();
    const NativeURL = URL;
    class TestURL extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:authenticated-profile-image');
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', TestURL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads protected profile images through authenticated API client', async () => {
    vi.mocked(api.downloadBlob).mockResolvedValue({
      blob: new Blob(['image'], { type: 'image/png' }),
      filename: 'profile.png',
      contentType: 'image/png',
    });

    const { unmount } = render(
      <FallbackImage
        src="http://127.0.0.1:8000/api/auth/me/profile-image/"
        alt="Profile"
        fallback={<span>Fallback</span>}
      />,
    );

    expect(screen.getByText('Fallback')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        'blob:authenticated-profile-image',
      ),
    );
    expect(api.downloadBlob).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/auth/me/profile-image/',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      'blob:authenticated-profile-image',
    );
  });

  it('uses public image URLs without authenticated download', () => {
    render(
      <FallbackImage
        src="https://example.com/logo.png"
        alt="Logo"
        fallback={<span>Fallback</span>}
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/logo.png',
    );
    expect(api.downloadBlob).not.toHaveBeenCalled();
  });

  it('renders the fallback when no image exists', () => {
    render(<FallbackImage src={null} alt="Profile" fallback={<span>Fallback</span>} />);

    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(api.downloadBlob).not.toHaveBeenCalled();
  });

  it('renders the fallback when the protected fetch fails', async () => {
    vi.mocked(api.downloadBlob).mockRejectedValue(new Error('403 Forbidden'));

    render(
      <FallbackImage
        src="/api/auth/me/profile-image/"
        alt="Profile"
        fallback={<span>Fallback</span>}
      />,
    );

    await waitFor(() => expect(screen.getByText('Fallback')).toBeInTheDocument());
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the fallback when the protected image request is unauthorized', async () => {
    vi.mocked(api.downloadBlob).mockRejectedValue(new Error('401 Unauthorized'));

    render(
      <FallbackImage
        src="/api/accounts/institution-users/abc/profile-image/"
        alt="Institution user"
        fallback={<span>Initials</span>}
      />,
    );

    await waitFor(() => expect(screen.getByText('Initials')).toBeInTheDocument());
  });

  it('re-fetches the protected image when the versioned URL changes', async () => {
    vi.mocked(api.downloadBlob).mockResolvedValue({
      blob: new Blob(['image'], { type: 'image/png' }),
      filename: 'profile.png',
      contentType: 'image/png',
    });

    // First load: version 1.
    const first = render(
      <FallbackImage
        src="/api/auth/me/profile-image/?v=1"
        alt="Profile"
        fallback={<span>Fallback</span>}
      />,
    );
    await waitFor(() => expect(api.downloadBlob).toHaveBeenCalledTimes(1));
    expect(vi.mocked(api.downloadBlob).mock.calls[0][0]).toBe(
      '/api/auth/me/profile-image/?v=1',
    );

    // Unmounting releases the object URL the browser was showing.
    first.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:authenticated-profile-image');

    // After an upload the version changes, so the image is fetched again instead
    // of showing the cached photo until logout.
    const second = render(
      <FallbackImage
        src="/api/auth/me/profile-image/?v=2"
        alt="Profile"
        fallback={<span>Fallback</span>}
      />,
    );
    await waitFor(() => expect(api.downloadBlob).toHaveBeenCalledTimes(2));
    expect(vi.mocked(api.downloadBlob).mock.calls[1][0]).toBe(
      '/api/auth/me/profile-image/?v=2',
    );
    second.unmount();
  });
});
