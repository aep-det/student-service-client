import { useEffect, useRef, useState } from 'react'
import { Skeleton } from './Skeleton'

export function Autocomplete({
  value,
  onChange,
  onSearch,
  getDisplayText,
  getValue,
  placeholder = 'Search...',
  disabled = false,
  required = false,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  // Reset query when value is cleared externally
  useEffect(() => {
    if (!value && query) {
      setQuery('')
      setIsOpen(false)
      setResults([])
    }
  }, [value])

  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setResults([])
      setIsOpen(false)
      setIsTyping(false)
      setLoading(false)
      return
    }

    setIsTyping(false)
    setLoading(true)
    try {
      const response = await onSearch(searchQuery)
      const items = response?.data?.content || response?.data || []
      setResults(items)
      setIsOpen(items.length > 0)
      setSelectedIndex(-1)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    // Show loading immediately when user types
    if (newQuery.trim().length >= 1) {
      setIsTyping(true)
      setIsOpen(true)
    } else {
      setIsTyping(false)
      setIsOpen(false)
      setResults([])
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      performSearch(newQuery)
    }, 300)
  }

  const handleSelect = (item) => {
    const selectedValue = getValue(item)
    const displayText = getDisplayText(item)
    setQuery(displayText)
    setIsOpen(false)
    onChange(selectedValue)
    setResults([])
  }

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  const handleBlur = (e) => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }, 200)
  }

  const handleFocus = () => {
    if (query.trim().length >= 1 && results.length > 0) {
      setIsOpen(true)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="autocomplete" style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />
      {isOpen && (results.length > 0 || loading || isTyping) && (
        <div ref={dropdownRef} className="autocomplete-dropdown">
          {(loading || isTyping) ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="autocomplete-item autocomplete-loading">
                  <Skeleton style={{ height: '16px', width: '100%' }} />
                </div>
              ))}
            </>
          ) : (
            results.map((item, index) => {
              const displayText = getDisplayText(item)
              const isSelected = index === selectedIndex
              return (
                <div
                  key={getValue(item)}
                  className={`autocomplete-item ${isSelected ? 'autocomplete-item-selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {displayText}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
