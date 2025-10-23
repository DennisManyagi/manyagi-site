'use client';
import React from 'react';

export default function SectionCard({ title, className = '', children }) {
  return (
    <section className={`glass p-6 rounded ${className}`}>
      {title ? <h2 className="text-2xl font-bold mb-4">{title}</h2> : null}
      {children}
    </section>
  );
}
