const FeedStock = require("../models/FeedStock");
const FeedSchedule = require("../models/FeedSchedule");

// ---------- Stock ----------

// GET /api/feed/stock
const getFeedStock = async (req, res) => {
  try {
    const stock = await FeedStock.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: stock.length, data: stock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/feed/stock/summary -> single weighted "Feed Stock %" used by HeroBanner.jsx
const getFeedStockSummary = async (req, res) => {
  try {
    const stock = await FeedStock.find({});
    const totalCapacity = stock.reduce((sum, s) => sum + (s.capacity || 0), 0);
    const totalCurrent = stock.reduce((sum, s) => sum + (s.currentStock || 0), 0);
    const pct = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;
    res.status(200).json({ success: true, data: { pct } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/feed/stock
// Body matches FeedManagement.jsx "Add Stock Item" form: name, unit, currentStock, capacity, dailyUsage
const createFeedStock = async (req, res) => {
  try {
    const item = await FeedStock.create(req.body);
    res.status(201).json({ success: true, message: "Feed stock item added successfully", data: item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "A feed item with that name already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/feed/stock/:id
const updateFeedStock = async (req, res) => {
  try {
    const updateData = {};
    ["name", "category", "unit", "currentStock", "capacity", "dailyUsage", "minStock", "color"].forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const item = await FeedStock.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Feed stock item not found" });
    res.status(200).json({ success: true, message: "Feed stock item updated successfully", data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/feed/stock/:id
const deleteFeedStock = async (req, res) => {
  try {
    const item = await FeedStock.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Feed stock item not found" });
    res.status(200).json({ success: true, message: "Feed stock item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- Schedule ----------

// GET /api/feed/schedule
const getFeedSchedule = async (req, res) => {
  try {
    const schedule = await FeedSchedule.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: schedule.length, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/feed/schedule
// Body matches FeedManagement.jsx "Add Feeding Schedule" form: group, feedType, quantity, time
const createFeedSchedule = async (req, res) => {
  try {
    const item = await FeedSchedule.create(req.body);
    res.status(201).json({ success: true, message: "Feeding schedule added successfully", data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/feed/schedule/:id
const updateFeedSchedule = async (req, res) => {
  try {
    const updateData = {};
    ["group", "feedType", "quantity", "time"].forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const item = await FeedSchedule.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Feed schedule not found" });
    res.status(200).json({ success: true, message: "Feeding schedule updated successfully", data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/feed/schedule/:id
const deleteFeedSchedule = async (req, res) => {
  try {
    const item = await FeedSchedule.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Feed schedule not found" });
    res.status(200).json({ success: true, message: "Feeding schedule deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFeedStock, getFeedStockSummary, createFeedStock, updateFeedStock, deleteFeedStock,
  getFeedSchedule, createFeedSchedule, updateFeedSchedule, deleteFeedSchedule,
};
