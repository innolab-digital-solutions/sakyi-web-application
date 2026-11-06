// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OperationalLogMediaPreviewModal from '@/components/admin/modules/care-plans/OperationalLogMediaPreviewModal';

describe('OperationalLogMediaPreviewModal', () => {
  it('renders_nothing_when_closed_without_image_url', () => {
    render(
      <OperationalLogMediaPreviewModal
        imageUrl={null}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows_context_label_and_image_when_open', () => {
    render(
      <OperationalLogMediaPreviewModal
        imageUrl='https://example.com/evidence.jpg'
        contextLabel='Eat breakfast'
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Eat breakfast')).toBeTruthy();
    expect(
      screen.getByRole('img', { name: 'Evidence media for Eat breakfast' }),
    ).toBeTruthy();
    const openLink = screen.getByRole('link', { name: /open in new tab/i });
    expect(openLink.getAttribute('href')).toBe(
      'https://example.com/evidence.jpg',
    );
  });

  it('does_not_show_zoom_controls_when_open', () => {
    render(
      <OperationalLogMediaPreviewModal
        imageUrl='https://example.com/evidence.jpg'
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Fit to view' })).toBeNull();
  });

  it('calls_onOpenChange_false_when_dialog_closed', () => {
    const onOpenChange = vi.fn();
    render(
      <OperationalLogMediaPreviewModal
        imageUrl='https://example.com/evidence.jpg'
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
