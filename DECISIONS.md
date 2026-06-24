# DECISIONS.md

This document outlines key architectural choices, resolutions for spec gaps, and future improvements for the Mini E-Commerce Web App.

---

## 1. Resolution of the Three Gaps (Open Questions)

### Gap A: Data Enrichment (API Limitations)
The Fake Store API provides a flat product object without brands, colors, sizes, multiple images, or stock levels. 
- **Decision**: We created a deterministic utility (`src/data/mockEnrichment.ts`) that maps a product ID to these attributes. Stock counts for each color/size combination are calculated using a string hashing function. This ensures that stock and variant availability remain perfectly consistent across page reloads and deep links.
- **Image Gallery**: Since only one image is returned, we defined three cropped/zoomed aspect views (Front, Detail, Top Focus) and applied color-shift CSS filters based on the selected swatch. This simulates a real product photo gallery and interactive color variant swapping purely in CSS.

### Gap B: State Management Choice
We chose the **React Context API** coupled with `useReducer` and a custom local storage hook for global state.
- **Justification**: For a mini e-commerce application, external state managers like Redux or Zustand introduce unnecessary bundle size and dependency overhead. The Context API is native, clean, and perfectly suited for this scale. To avoid unnecessary rendering, we kept the context focused strictly on the cart state, and localized UI states (like loading spinner feedback on cards) inside the individual components.

### Gap C: Deep-Linking & URL Rehydration
Variant selections (color + size) must reflect in the URL so that product pages are deep-linkable.
- **Decision**: We synchronized selection using URL Search Parameters (e.g., `?color=Matte%20Black&size=Standard`) using React Router's `useSearchParams`. On mount, the component reads these params. If they are missing or point to an invalid/non-existent variant, it automatically selects the first available *in-stock* combination and replaces the URL state.

---

## 2. Architectural Compromise (Either-Way Choice)

### Client-Side Filtering vs. API Queries
We could have fetched product categories individually from the Fake Store API as the user toggled tabs, or fetched the entire collection once and filtered in-memory.
- **Decision**: We chose **Client-Side Filtering** (fetching all products once on load).
- **Trade-offs**: Fetching the whole list up front increases initial page load slightly but enables instant search querying and tab switching with zero loading states or additional network requests. Given that the API dataset is small (20 items), client-side filtering offers a significantly faster, smoother user experience.

---

## 3. What I Would Do Differently with More Time

1. **Virtual Image Swaps**: If this were a real production app, we would query color-specific image assets rather than using CSS filter classes.
2. **Memoization & Selectors**: For a larger catalog, we would wrap the cart items in a custom selector pattern (e.g., using `useMemo` or a library like Zustand) to prevent Navbar and listing cards from re-rendering on unrelated cart additions.
3. **Skeleton Shimmer Details**: Add full SVG skeleton graphics instead of generic boxes to further elevate the first-load layout shift.
