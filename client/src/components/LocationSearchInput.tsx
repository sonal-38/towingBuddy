import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
};

type LocationData = {
  address: string;
  lat: number;
  lon: number;
};

type LocationSearchInputProps = {
  label: string;
  value: string;
  onLocationSelect: (data: LocationData) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
};

export default function LocationSearchInput({
  label,
  value,
  onLocationSelect,
  placeholder = 'Type to search location...',
  required = false,
  id = 'location',
}: LocationSearchInputProps) {
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search text when value prop changes
  useEffect(() => {
    setSearchText(value);
  }, [value]);

  // Search locations using Nominatim
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Add country bias for India (you can change this or make it configurable)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Nominatim search failed', response.status);
        setSuggestions([]);
        return;
      }

      const data = await response.json() as NominatimResult[];
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change with debounce
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      searchLocation(text);
    }, 500); // 500ms debounce
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: NominatimResult) => {
    const locationData: LocationData = {
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    };
    
    setSearchText(suggestion.display_name);
    onLocationSelect(locationData);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <Label htmlFor={id} className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          className="h-12 pr-10"
          required={required}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {suggestion.display_name.split(',')[0]}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {suggestion.display_name}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {suggestion.lat}, {suggestion.lon}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isSearching && searchText.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
          No locations found. Try different search terms.
        </div>
      )}

      {/* Example locations hint */}
      {!searchText && (
        <p className="text-xs text-muted-foreground">
          Examples: "Mumbai Airport", "Pune Railway Station", "MG Road Bangalore"
        </p>
      )}
    </div>
  );
}
