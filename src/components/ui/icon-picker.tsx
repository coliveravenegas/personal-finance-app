'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown, icons as LucideIcons } from 'lucide-react'
import { useEffect, useState } from 'react'

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

type IconType = keyof typeof LucideIcons

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Reset search query when section closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  // Get all icon names from lucide-react
  const iconNames = Object.keys(LucideIcons)

  // Filter icons based on search query
  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get the current icon component
  const SelectedIcon = value ? LucideIcons[value as IconType] : undefined

  return (
    <div className="w-full space-y-2">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {value ? (
            <>
              {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
              {value}
            </>
          ) : (
            'Select icon...'
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-2">
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-[200px] overflow-auto p-2">
            {filteredIcons.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">No icons found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredIcons.map((iconName) => {
                  const Icon = LucideIcons[iconName as IconType]
                  return (
                    <Button
                      key={iconName}
                      variant="ghost"
                      role="option"
                      aria-selected={value === iconName}
                      className={`flex w-full items-center justify-start gap-2 px-2 py-1.5 text-sm ${
                        value === iconName ? 'bg-accent text-accent-foreground' : ''
                      }`}
                      onClick={() => {
                        onChange(iconName)
                        setOpen(false)
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{iconName}</span>
                      {value === iconName && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
