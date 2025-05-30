"use client";

import React, { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  items: { id: number | string; name: string }[];
  placeholder: string;
  onSelect: (id: number | string) => void;
  noSelect?: boolean;
  className?: string;
  initialValue?: string;
}

export function Combobox({ items, placeholder, onSelect, noSelect, className, initialValue }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue ? initialValue : "");
  const [popoverWidth, setPopoverWidth] = useState(0);


  const [filteredItems, setFilteredItems] = useState(items);
  
  useEffect(() => {
    if (items.length > 0) {
      setFilteredItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue);
    }
  }, [initialValue]);
  
  const handleFilter = (data: any) => {
    const query = data.toLowerCase();
    const filtered = items.filter(item => item.name.toLowerCase().includes(query));
    setFilteredItems(filtered);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          ref={(element) => {
            if (element) {
              setPopoverWidth(element.offsetWidth);
            }
          }}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start"
        style={{ width: popoverWidth }}
      >
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`}  onValueChange={handleFilter} />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={(currentValue) => {
                    if (typeof item.id === "string") {
                      onSelect(item.id);
                    } else {
                      onSelect(Number(item.id));
                    }
                    setOpen(false);
                    if (noSelect) return;
                    setValue(item.name);
                  }}
                >
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
