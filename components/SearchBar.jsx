'use client';
import { SearchIcon } from './Icons';

export default function SearchBar({ searchTerm, onSearchChange, placeholder = 'Buscar templates...' }) {
  return (
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <SearchIcon className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
    </div>
  );
}

