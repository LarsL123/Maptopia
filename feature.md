# Leaflet Drawing & Area Management – Planning Document

## 1. Purpose

This document outlines the **planned architecture and design decisions** for adding _drawn areas_ (boxes / polygons) to a Leaflet-based map application. The goal is to allow users to:

- Draw rectangles or polygons on a map
- Store these geometries persistently
- Categorize and describe each marked area
- Toggle visibility of areas as map layers

The project is implemented as a **Next.js application**, using **Leaflet.pm** for drawing and **MongoDB** for persistence. This document focuses on **planning and concepts**, not implementation details.

---

## 2. High-Level Architecture

```
Browser (Leaflet + UI)
        ↓
Next.js API Routes
        ↓
MongoDB (GeoJSON storage)
```

### Key principles

- Frontend is responsible for **interaction and visualization**
- Backend API is **stateless** and only manages data
- Database is the **single source of truth**
- Geometry and metadata are always handled together

---

## 3. Mapping & Drawing Strategy

### Mapping Library

- **Leaflet** is used as the base map library

### Drawing & Editing

- **Leaflet.pm** is used for:

  - Drawing polygons and rectangles
  - Editing existing shapes
  - Deleting shapes

Reasons for choosing Leaflet.pm:

- Modern UX
- Active maintenance
- Strong editing capabilities
- Good mobile support

---

## 4. Geometry & Data Format

### GeoJSON as the Standard

All drawn areas are stored and transmitted as **GeoJSON Features**.

Each area consists of:

- `geometry` – Polygon or Rectangle
- `properties` – Application-specific metadata

Example (conceptual):

- Geometry: Polygon coordinates
- Properties: title, description, category, timestamps

Why GeoJSON:

- Native Leaflet support
- Database-friendly
- Portable and exportable
- Future-proof for GIS features

---

## 5. Categorization & Metadata

Each drawn area can have associated metadata, including:

- Category (used for grouping and toggling layers)
- Title or name
- Free-text description
- Optional future fields (status, tags, ownership)

Metadata is stored alongside geometry in the database and is editable after creation.

---

## 6. Layer Management & Visibility

### Conceptual Approach

- Areas are grouped logically by **category**
- Categories are represented as toggleable layers in the UI

Possible internal strategies:

- One logical layer per category
- Or a single GeoJSON source with dynamic filtering

Key requirement:

- Users can turn categories on/off without modifying the underlying data

---

## 7. Backend API (Next.js)

### Role of the API

The API provides a controlled interface for managing areas:

- Create new areas
- Read existing areas
- Update geometry or metadata
- Delete areas

The API:

- Does not store state in memory
- Does not write to local disk
- Acts only as a bridge between frontend and database

---

## 8. Persistence Strategy

### Why Not File Storage

- Serverless environments do not guarantee disk persistence
- Redeploys and scaling can delete files
- Not suitable for user-generated content

### Database Choice: MongoDB

MongoDB is chosen because:

- Free-tier availability
- Native GeoJSON support
- Flexible schema for evolving metadata
- Good fit for personal and small-scale applications

MongoDB will store each area as a document containing geometry and metadata.

---

## 9. Data Safety & Longevity

Planned safeguards:

- Database is the authoritative data source
- Client-side GeoJSON export for backups
- No reliance on deployment environment for persistence

This ensures:

- No data loss on redeploys
- Safe iteration on frontend and backend

---

## 10. Future Extensions (Out of Scope)

Potential future improvements:

- User authentication and ownership of areas
- Version history for edits
- Spatial queries (intersection, containment)
- Import/export of external GeoJSON
- Permissions per category

---

## 11. Summary of Key Decisions

| Area            | Decision           |
| --------------- | ------------------ |
| Map library     | Leaflet            |
| Drawing/editing | Leaflet.pm         |
| Geometry format | GeoJSON            |
| Frontend        | Next.js            |
| Backend         | Next.js API routes |
| Persistence     | MongoDB            |
| Layer toggling  | Category-based     |
| File storage    | Not used           |

---

This document serves as a **planning reference** and can be refined as implementation begins.
