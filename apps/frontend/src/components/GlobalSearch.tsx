"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      api.get(`/search?q=${encodeURIComponent(query)}`)
        .then(res => {
          setResults(res.data || []);
        })
        .catch(err => console.error("Search error", err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (url: string) => {
    setShow(false);
    setQuery('');
    router.push(url);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: "16px 16px 8px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#F3F4F6",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        color: "var(--text-primary)",
        border: show ? '1px solid var(--color-purple)' : '1px solid transparent',
        transition: 'all 0.2s ease'
      }}>
        <span style={{ color: "var(--text-muted)" }}>🔍</span>
        <input 
          type="text"
          placeholder="Type Here to Search (e.g. Horizon, Supplier...)"
          value={query}
          onChange={e => { setQuery(e.target.value); setShow(true); }}
          onFocus={() => { if (query.length > 0) setShow(true); }}
          style={{
            border: 'none', background: 'transparent', outline: 'none', width: '100%'
          }}
        />
        {loading && <div style={{ width: 14, height: 14, border: "2px solid var(--border-light)", borderTop: "2px solid var(--color-purple)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
      </div>

      {show && query.length >= 2 && (
        <div style={{
          position: 'absolute',
          top: '100%', left: '16px', right: '16px',
          background: 'var(--bg-card)',
          borderRadius: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          border: '1px solid var(--border-light)'
        }}>
          {results.length === 0 && !loading && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No results found for "{query}"
            </div>
          )}
          
          {results.map((r, i) => (
            <div 
              key={i} 
              onClick={() => handleResultClick(r.url)}
              style={{
                padding: '12px 16px',
                borderBottom: i === results.length - 1 ? 'none' : '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{r.title}</span>
                <span style={{ fontSize: 10, background: 'var(--color-purple-light)', color: 'var(--color-purple)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{r.type}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.subtitle}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
