import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value?: string;
}

const SearchBar = ({ onSearch, value = '' }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Update internal state when prop value changes
  if (value !== '' && value !== searchQuery) {
    setSearchQuery(value);
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm ứng dụng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-24 h-12 bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full"
        />
      </div>
      <Button 
        type="submit" 
        className="absolute right-0 top-0 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md px-5"
      >
        Tìm kiếm
      </Button>
    </form>
  );
};

export default SearchBar;