"use client";

import React, { useState, useCallback } from "react";
import { formatCents } from "@/lib/format-currency";

interface ProductCardProps {
  produkt: {
    id?: string;
    produkttyp?: string;
    material?: string;
    profil?: string;
    masse_breite?: number;
    masse_hoehe?: number;
    fluegelanzahl?: number;
    farbe_aussen?: string;
    farbe_innen?: string;
    verglasung?: string;
    weitere_optionen?: string;
    einzelpreis?: number;
    stueckzahl?: number;
  };
}

/** Parse `weitere_optionen` string into flat list of individual items. */
function parseExtras(raw: string): string[] {
  const items: string[] = [];
  const lines = raw.split("\n").filter(Boolean);
  for (const line of lines) {
    const colonIdx = line.indexOf(": ");
    if (colonIdx === -1) {
      items.push(line.trim());
      continue;
    }
    const values = line.slice(colonIdx + 2);
    for (const v of values.split(", ")) {
      const trimmed = v.trim();
      if (trimmed) items.push(trimmed);
    }
  }
  return items;
}

/** Clickable spec cell with copy-to-clipboard feedback. */
function SpecCell({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 800);
    } catch {
      // Clipboard API not available
    }
  }, [value]);

  return (
    <button
      type="button"
      className="product-card__spec-cell"
      onClick={handleCopy}
      title={`${label}: ${value} — Klick zum Kopieren`}
    >
      <span className="product-card__spec-label">{label}</span>
      <span className="product-card__spec-value">{value}</span>
      {copied && <span className="product-card__copy-toast">Kopiert</span>}
    </button>
  );
}

/** Clickable extra tag with copy-to-clipboard. */
function ExtraTag({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 800);
    } catch {
      // Clipboard API not available
    }
  }, [text]);

  return (
    <button
      type="button"
      className="product-card__extras-tag"
      onClick={handleCopy}
      title={`${text} — Klick zum Kopieren`}
    >
      {text}
      {copied && <span className="product-card__copy-toast">Kopiert</span>}
    </button>
  );
}

export function ProductCard({ produkt }: ProductCardProps) {
  const p = produkt;
  const stueckzahl = p.stueckzahl || 1;

  // Identity segments: Typ · Material · Profil
  const segments: string[] = [];
  if (p.produkttyp) segments.push(p.produkttyp);
  if (p.material) segments.push(p.material);
  if (p.profil) segments.push(p.profil);
  if (segments.length === 0) segments.push("Produkt");

  // Parse extras
  const extras = p.weitere_optionen ? parseExtras(p.weitere_optionen) : [];

  // Build flügel display
  const fluegelDisplay = p.fluegelanzahl
    ? typeof p.fluegelanzahl === "number"
      ? `${p.fluegelanzahl}-flügelig`
      : String(p.fluegelanzahl)
    : null;

  return (
    <div className="product-card">
      {/* Header: Identity Breadcrumb + Quantity */}
      <div className="product-card__header">
        <div className="product-card__identity">
          {segments.map((seg, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="product-card__identity-dot">·</span>}
              <span className="product-card__identity-segment">{seg}</span>
            </React.Fragment>
          ))}
        </div>
        {stueckzahl > 1 && (
          <div className="quantity-badge">×{stueckzahl}</div>
        )}
      </div>

      {/* Maße Grid: Breite | Höhe | Flügel */}
      {(p.masse_breite || p.masse_hoehe || fluegelDisplay) && (
        <div className="product-card__spec-grid product-card__spec-grid--3col">
          <SpecCell
            label="Breite"
            value={p.masse_breite ? `${p.masse_breite} mm` : "—"}
          />
          <SpecCell
            label="Höhe"
            value={p.masse_hoehe ? `${p.masse_hoehe} mm` : "—"}
          />
          <SpecCell
            label="Flügel"
            value={fluegelDisplay || "—"}
          />
        </div>
      )}

      {/* Farben Grid: Außen | Innen */}
      {(p.farbe_aussen || p.farbe_innen) && (
        <div className="product-card__spec-grid product-card__spec-grid--2col">
          <SpecCell
            label="Farbe Außen"
            value={p.farbe_aussen || "—"}
          />
          <SpecCell
            label="Farbe Innen"
            value={p.farbe_innen || "—"}
          />
        </div>
      )}

      {/* Verglasung: volle Breite */}
      {p.verglasung && (
        <div className="product-card__spec-grid product-card__spec-grid--1col">
          <SpecCell label="Verglasung" value={p.verglasung} />
        </div>
      )}

      {/* Extras: Tags */}
      {extras.length > 0 && (
        <div className="product-card__extras">
          <div className="product-card__extras-header">
            <span className="product-card__extras-heading">Extras</span>
            <span className="product-card__extras-count">
              {extras.length} {extras.length === 1 ? "Option" : "Optionen"}
            </span>
          </div>
          <div className="product-card__extras-tags">
            {extras.map((item, i) => (
              <ExtraTag key={i} text={item} />
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      {p.einzelpreis != null && (
        <div className="product-card__price">
          {stueckzahl === 1 ? (
            <span className="price-single">
              {formatCents(p.einzelpreis)}
              <span className="product-card__price-netto"> netto</span>
            </span>
          ) : (
            <>
              <span className="price-unit">{formatCents(p.einzelpreis)}</span>
              <span className="price-multiplier"> × {stueckzahl} = </span>
              <span className="price-total">
                {formatCents(p.einzelpreis * stueckzahl)}
                <span className="product-card__price-netto"> netto</span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
