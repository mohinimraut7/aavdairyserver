// Seeds the storefront with the starter catalogue (safe to run again — upserts by slug,
// and never overwrites price/stock that an admin has already changed unless --force).
//   node scripts/seedShop.js          -> insert missing products only
//   node scripts/seedShop.js --force  -> reset all starter products to these values
require("dotenv").config();
const mongoose = require("mongoose");
const ShopProduct = require("../shop/models/ShopProduct");
const ShopSettings = require("../shop/models/ShopSettings");

// Demo prices from the UI reference — change them from the admin panel before launch.
const PRODUCTS = [
  { slug: "a2-desi-cow-milk-1l", name: "A2 Desi Cow Milk", category: "milk", sku: "AAV-MLK-1000", packageSize: "1 Litre", price: 90, stockQuantity: 60, isFeatured: true, images: ["/images/a2-cow-milk.webp"], highlights: ["A2 Milk", "Desi cattle", "Farm Fresh"], description: "Fresh milk from the desi cattle raised at our Vasai Virar farm, chilled after milking and delivered to your doorstep.", storage: "Keep refrigerated below 4°C. Boil before use.", ingredients: "Cow milk" },
  { slug: "a2-desi-cow-milk-500ml", name: "A2 Desi Cow Milk", category: "milk", sku: "AAV-MLK-500", packageSize: "500 ml", price: 48, stockQuantity: 80, images: ["/images/fresh-milk-category.webp"], highlights: ["A2 Milk", "Desi cattle", "Farm Fresh"], description: "The same farm-fresh desi cow milk in a handy half-litre pack — ideal for small households.", storage: "Keep refrigerated below 4°C. Boil before use.", ingredients: "Cow milk" },
  { slug: "fresh-paneer-200g", name: "Fresh Paneer", category: "paneer", sku: "AAV-PNR-200", packageSize: "200 g", price: 120, stockQuantity: 40, isFeatured: true, images: ["/images/paneer-cubes.webp"], highlights: ["Soft & Fresh", "Made from farm milk", "Small batches"], description: "Soft, fresh paneer made in small batches from our own farm milk. Perfect for curries, tikka and bhurji.", storage: "Keep refrigerated. Best consumed within 2–3 days of delivery.", ingredients: "Cow milk, food-grade acidulant" },
  { slug: "fresh-paneer-500g", name: "Fresh Paneer", category: "paneer", sku: "AAV-PNR-500", packageSize: "500 g", price: 290, stockQuantity: 25, images: ["/images/paneer-cubes.webp"], highlights: ["Soft & Fresh", "Family pack", "Small batches"], description: "Family pack of our soft farm paneer — great value for weekly cooking.", storage: "Keep refrigerated. Best consumed within 2–3 days of delivery.", ingredients: "Cow milk, food-grade acidulant" },
  { slug: "farm-cheese-200g", name: "Farm Fresh Cheese", category: "paneer", sku: "AAV-CHS-200", packageSize: "200 g", price: 150, stockQuantity: 20, images: ["/images/fresh-paneer-category.webp"], highlights: ["Fresh cheese", "Made from farm milk", "Mild & creamy"], description: "Mild, creamy fresh cheese prepared from our farm milk. Lovely in sandwiches, salads and snacks.", storage: "Keep refrigerated.", ingredients: "Cow milk, salt, culture" },
  { slug: "pure-desi-ghee-500ml", name: "Pure Desi Ghee", category: "ghee", sku: "AAV-GHE-500", packageSize: "500 ml", price: 650, stockQuantity: 30, isFeatured: true, images: ["/images/pure-desi-ghee.webp"], highlights: ["Traditional Bilona", "Rich Aroma", "Glass jar"], description: "Golden desi ghee prepared the traditional way from cultured butter, slow-cooked for a rich, nutty aroma.", storage: "Store in a cool, dry place. Use a dry spoon.", ingredients: "Cow milk fat" },
  { slug: "pure-desi-ghee-1l", name: "Pure Desi Ghee", category: "ghee", sku: "AAV-GHE-1000", packageSize: "1 Litre", price: 1250, stockQuantity: 15, images: ["/images/desi-ghee-category.webp"], highlights: ["Traditional Bilona", "Rich Aroma", "Value pack"], description: "Our traditional desi ghee in a 1 litre value pack.", storage: "Store in a cool, dry place. Use a dry spoon.", ingredients: "Cow milk fat" },
  { slug: "farm-fresh-curd-400g", name: "Farm Fresh Curd", category: "curd", sku: "AAV-CRD-400", packageSize: "400 g", price: 55, stockQuantity: 50, isFeatured: true, images: ["/images/farm-fresh-curd.webp"], highlights: ["Thick & Creamy", "Set daily", "Natural Taste"], description: "Thick, creamy dahi set fresh every day from our farm milk.", storage: "Keep refrigerated.", ingredients: "Cow milk, curd culture" },
  { slug: "farm-fresh-dahi-1kg", name: "Farm Fresh Dahi", category: "curd", sku: "AAV-CRD-1000", packageSize: "1 kg", price: 130, stockQuantity: 0, images: ["/images/fresh-curd-category.webp"], highlights: ["Thick & Creamy", "Family pack", "Natural Taste"], description: "Family-size pack of our thick, home-style dahi.", storage: "Keep refrigerated.", ingredients: "Cow milk, curd culture" },
];

const run = async () => {
  const force = process.argv.includes("--force");
  await mongoose.connect(process.env.MONGO_URI);
  await ShopSettings.get();
  let created = 0;
  let updated = 0;
  for (const p of PRODUCTS) {
    const exists = await ShopProduct.findOne({ slug: p.slug });
    if (!exists) {
      await ShopProduct.create(p);
      created++;
    } else if (force) {
      Object.assign(exists, p);
      await exists.save();
      updated++;
    }
  }
  console.log(`Shop seed done: ${created} created, ${updated} reset, ${PRODUCTS.length - created - updated} left unchanged.`);
  await mongoose.disconnect();
};

if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
module.exports = { PRODUCTS };
