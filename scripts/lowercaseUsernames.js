// One-time fix: convert existing usernames/emails saved with capital letters to small letters.
//
//   node scripts/lowercaseUsernames.js           -> dry run, only prints what would change
//   node scripts/lowercaseUsernames.js --apply   -> actually updates the database
//
// If two accounts would become the same (e.g. "Ravi" and "ravi"), that pair is skipped
// and printed so you can decide manually. Nothing is deleted.

require("dotenv").config();
const mongoose = require("mongoose");

const APPLY = process.argv.includes("--apply");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = mongoose.connection.collection("users");

  const all = await users.find({}, { projection: { username: 1, email: 1 } }).toArray();
  const taken = new Map(); // lowercased value -> _id
  for (const u of all) {
    for (const f of ["username", "email"]) {
      if (typeof u[f] === "string") {
        const k = `${f}:${u[f].trim().toLowerCase()}`;
        if (!taken.has(k)) taken.set(k, []);
        taken.get(k).push(String(u._id));
      }
    }
  }

  let changed = 0;
  let skipped = 0;
  for (const u of all) {
    const update = {};
    for (const f of ["username", "email"]) {
      if (typeof u[f] !== "string") continue;
      const lower = u[f].trim().toLowerCase();
      if (lower === u[f]) continue;
      if (taken.get(`${f}:${lower}`).length > 1) {
        console.log(`SKIP  ${f} "${u[f]}" -> "${lower}" (another account already uses it)`);
        skipped++;
        continue;
      }
      update[f] = lower;
    }
    if (Object.keys(update).length) {
      console.log(`${APPLY ? "FIX " : "WOULD FIX"}  ${u._id}  ${JSON.stringify(update)}`);
      if (APPLY) await users.updateOne({ _id: u._id }, { $set: update });
      changed++;
    }
  }

  console.log(`\n${changed} account(s) ${APPLY ? "updated" : "to update"}, ${skipped} skipped.`);
  if (!APPLY && changed) console.log("Run again with --apply to save the changes.");
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});