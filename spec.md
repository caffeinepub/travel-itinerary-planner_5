# Travel Itinerary Planner

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack travel itinerary planner app
- Backend: Motoko canister storing trips and itinerary items
- Frontend: React UI for creating, viewing, and managing trips and their daily activities

### Modify
- N/A

### Remove
- N/A

## Implementation Plan

### Backend
- `Trip` type: id, title, destination, startDate, endDate, description
- `ItineraryItem` type: id, tripId, day (Int), time, title, description, location, category (transport/accommodation/activity/food)
- CRUD operations for trips: createTrip, getTrips, getTrip, updateTrip, deleteTrip
- CRUD operations for itinerary items: addItem, getItemsByTrip, updateItem, deleteItem
- Stable storage for trips and items using HashMap

### Frontend
- Home/dashboard: list all trips with summary cards (destination, dates, item count)
- Create/Edit Trip modal: form with title, destination, start date, end date, description
- Trip Detail view: show trip info and day-by-day itinerary timeline
- Add/Edit Itinerary Item modal: form with day, time, title, description, location, category
- Category color coding and icons for item types
- Empty states for trips and itinerary days
- Responsive layout
