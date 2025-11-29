# The AI Discovery Model

This document outlines the architecture of the "AI Discovery Engine" implemented in API Sorter. This model is designed to be domain-agnostic and can be replicated for other verticals (Finance, Real Estate, E-commerce, etc.).

## Core Architecture

The system consists of 4 main stages:

1.  **Sensing (Collection)**
2.  **Understanding (Analysis)**
3.  **Queueing (Human-in-the-loop)**
4.  **Action (Integration)**

### 1. Sensing (The "Eyes")
-   **Goal**: Cast a wide net to catch relevant signals from the web.
-   **Implementation**: `DiscoverySource` table + `NewsFetcher` class.
-   **Data Sources**: RSS Feeds, Sitemaps, API responses.
-   **Replication**:
    -   **Finance**: Replace tech feeds with Bloomberg, Reuters, SEC filings RSS.
    -   **Real Estate**: Monitor local government zoning boards, major real estate listing RSS.
    -   **E-commerce**: Monitor "New Arrivals" RSS from major retailers, competitor sitemaps.

### 2. Understanding (The "Brain")
-   **Goal**: Filter noise and extract structured data from unstructured text.
-   **Implementation**: `AIAnalyzer` class (wrapping LLM).
-   **Logic**:
    -   Input: Raw article title + content.
    -   Process: LLM Prompt ("Is this an X? If yes, extract Y, Z").
    -   Output: JSON object with confidence score.
-   **Replication**:
    -   **Finance**: Prompt: "Is this article about a stock merger? Extract companies involved."
    -   **Real Estate**: Prompt: "Is this about a new condo project? Extract location and developer."

### 3. Queueing (The "Gatekeeper")
-   **Goal**: Ensure data quality before it enters the main system.
-   **Implementation**: `DiscoveryLog` table + `PENDING` status in main tables.
-   **UI**: Admin Panel "Pending Review" filter.
-   **Replication**:
    -   Universal pattern. Always hold AI-generated data in a "Pending" state for human approval until confidence is extremely high (>99%).

### 4. Action (The "Value")
-   **Goal**: Turn approved data into platform value.
-   **Implementation**: `Api` and `Provider` tables.
-   **Replication**:
    -   **Finance**: Create `StockTicker` or `EventCard`.
    -   **Real Estate**: Create `PropertyListing`.

## Code Structure for Replication

To port this to a new project:

1.  **Copy Schema**:
    -   `DiscoverySource`
    -   `DiscoveryLog`
    -   Add `status` enum to your main entity (e.g., `ProductStatus.PENDING`).

2.  **Copy Libs**:
    -   `src/lib/discovery/newsFetcher.ts` (Standard RSS parser)
    -   `src/lib/discovery/aiAnalyzer.ts` (Standard LLM wrapper)

3.  **Adapt Script**:
    -   Copy `scripts/run-discovery.ts`.
    -   Modify the **Prompt** in `aiAnalyzer.ts` to match your new domain.
    -   Modify the **Database Insert** logic in `run-discovery.ts` to map to your new tables.

4.  **Seed Sources**:
    -   Create `scripts/seed-sources.ts` with your domain's top 10-20 RSS feeds.
