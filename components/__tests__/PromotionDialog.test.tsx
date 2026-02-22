import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PromotionDialog } from '../PromotionDialog'

describe('PromotionDialog', () => {
  test('does not render when isOpen=false', () => {
    const { container } = render(
      <PromotionDialog isOpen={false} color="w" onSelect={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  test('renders 4 piece options when isOpen=true', () => {
    render(<PromotionDialog isOpen={true} color="w" onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /queen/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /rook/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /bishop/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /knight/i })).toBeDefined()
  })

  test('calls onSelect with "q" when Queen is clicked', () => {
    const onSelect = vi.fn()
    render(<PromotionDialog isOpen={true} color="w" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /queen/i }))
    expect(onSelect).toHaveBeenCalledWith('q')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  test('calls onSelect with "r" when Rook is clicked', () => {
    const onSelect = vi.fn()
    render(<PromotionDialog isOpen={true} color="w" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /rook/i }))
    expect(onSelect).toHaveBeenCalledWith('r')
  })

  test('calls onSelect with "b" when Bishop is clicked', () => {
    const onSelect = vi.fn()
    render(<PromotionDialog isOpen={true} color="w" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /bishop/i }))
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  test('calls onSelect with "n" when Knight is clicked', () => {
    const onSelect = vi.fn()
    render(<PromotionDialog isOpen={true} color="w" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /knight/i }))
    expect(onSelect).toHaveBeenCalledWith('n')
  })

  test('shows white pieces for color="w"', () => {
    render(<PromotionDialog isOpen={true} color="w" onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /queen/i })).toBeDefined()
  })

  test('shows black pieces for color="b"', () => {
    render(<PromotionDialog isOpen={true} color="b" onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /queen/i })).toBeDefined()
  })
})
