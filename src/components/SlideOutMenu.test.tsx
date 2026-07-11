import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SlideOutMenu } from './SlideOutMenu'

describe('SlideOutMenu', () => {
  it('exposes modal semantics and closes with Escape', () => {
    const onClose = vi.fn()
    render(
      <SlideOutMenu open onClose={onClose} label="Quick menu">
        <button type="button">Action</button>
      </SlideOutMenu>,
    )

    expect(screen.getByRole('dialog', { name: 'Quick menu' })).toHaveAttribute('aria-modal', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
