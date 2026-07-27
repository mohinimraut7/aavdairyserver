# AVV Dairy Farm - Backend API

Node + Express + Mongoose.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in `MONGO_URI` / `JWT_SECRET`
3. `npm run dev` (requires nodemon) or `npm start`

## Response convention
Every controller follows:
```js
res.status(200).json({ success: true, message, data });     // or count
res.status(404).json({ success: false, message: "..." });
res.status(400/500).json({ success: false, message: err.message });
```

## Notable endpoints beyond basic CRUD
- `GET /api/dashboard/summary` - single call powering the whole Dashboard
  page (6 stat cards + HeroBanner + RecentAnimals + VaccinationTable + MedicalTable)
- `GET /api/milk/chart?range=Daily|Weekly|Monthly` - MilkChart widget data
- `GET /api/feed/stock/summary` - farm-wide feed stock % for HeroBanner
- `POST /api/medicines/:id/dispense` - the only sanctioned way to reduce medicine stock

## Not yet implemented
Phase 20 (Reports) has no model/controller/routes yet - add a
`reportsController.js` + `reportsRoutes.js` following the same pattern
when ready.
