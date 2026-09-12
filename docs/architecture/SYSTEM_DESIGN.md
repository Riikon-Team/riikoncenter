# System Design

## Overview
RiikonCenter is a Multi-Purpose Web Platform consisting of multiple applications under a single ecosystem. It includes personal management tools (ZenTab, Study With Me), Webgames, and Standalone Utilities.

## C4 Model Diagrams

### 1. System Context Diagram
```mermaid
C4Context
  title System Context diagram for RiikonCenter
  
  Person(user, "User", "A user of the RiikonCenter platform.")
  System(riikon, "RiikonCenter", "Provides personal management tools, games, and utility applications.")
  
  System_Ext(google_search, "Search Engines", "Google, Bing, DuckDuckGo.")
  System_Ext(youtube, "Media Services", "YouTube, SoundCloud for background music.")
  
  Rel(user, riikon, "Uses")
  Rel(riikon, google_search, "Redirects search queries to")
  Rel(riikon, youtube, "Embeds media from")
```

### 2. Container Diagram
```mermaid
C4Container
  title Container diagram for RiikonCenter
  
  Person(user, "User", "A user of the platform.")
  
  System_Boundary(c1, "RiikonCenter") {
    Container(web_app, "Web Application", "Next.js 14, React", "Provides the shell and UI for all sub-apps.")
    Container(api_gateway, "API Server", "NestJS", "Handles core business logic, user auth, and preferences sync.")
    ContainerDb(database, "Primary Database", "PostgreSQL", "Stores user profiles, preferences, and platform data.")
    ContainerDb(cache, "Cache / Session", "Redis", "Stores sessions and transient data.")
  }
  
  Rel(user, web_app, "Visits using", "HTTPS")
  Rel(web_app, api_gateway, "Makes API calls to", "JSON/REST")
  Rel(api_gateway, database, "Reads from and writes to", "Prisma/TCP")
  Rel(api_gateway, cache, "Reads from and writes to", "TCP")
```
