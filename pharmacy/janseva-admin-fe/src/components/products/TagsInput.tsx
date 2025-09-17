"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Search, Loader2 } from 'lucide-react'
import axiosInstance from "@/utils/API"

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagsInput({ value = [], onChange, placeholder = "Add tags..." }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchSuggestions = async (search?: string) => {
    try {
      setLoading(true)
      const url = search
        ? `/products/tags/suggestions?search=${encodeURIComponent(search)}&limit=5`
        : "/products/tags/suggestions"

      const response = await axiosInstance.get(url)
      const allSuggestions = response.data.data || []

      // Filter out already selected tags
      const filteredSuggestions = allSuggestions.filter((tag: string) => !value.includes(tag))
      setSuggestions(filteredSuggestions)
    } catch (error) {
      console.error("Error fetching tag suggestions:", error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (inputValue.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(inputValue.trim())
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      fetchSuggestions()
    }
  }, [inputValue, value])

  const addTag = (tagToAdd?: string) => {
    const trimmedValue = tagToAdd || inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
      setInputValue("")
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="space-y-3 relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              className="flex-1 pr-8"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2">
              <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                {loading && suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading suggestions...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
                      Suggested Tags
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors duration-150 text-sm border-b border-border/50 last:border-b-0 flex items-center gap-2"
                        onClick={() => addTag(suggestion)}
                      >
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        <span className="font-medium">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                ) : inputValue.trim() && !loading ? (
                  <div className="px-4 py-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">No suggestions found</div>
                    <div className="text-xs text-muted-foreground">
                      Press Enter to add "{inputValue.trim()}" as a new tag
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    Start typing to see suggestions...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={() => addTag()}
          size="sm"
          variant="outline"
          disabled={!inputValue.trim() || loading}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge 
              key={index} 
              variant="default" 
              className="flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 px-3 py-1"
            >
              <span className="text-sm font-medium">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors duration-150"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
