require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const fallbackImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Nelumbo_nucifera1.jpg/500px-Nelumbo_nucifera1.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Red_Rose.jpg/500px-Red_Rose.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tulip_-_floriade_canberra.jpg/500px-Tulip_-_floriade_canberra.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Orchid_in_Singapore.jpg/500px-Orchid_in_Singapore.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Sunflowers_in_Fargo%2C_North_Dakota.jpg/500px-Sunflowers_in_Fargo%2C_North_Dakota.jpg"
];

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flowershop');
    console.log('Connected to DB');

    const products = await Product.find({});
    let updatedCount = 0;

    for (const p of products) {
      if (!p.image || p.image.includes('loremflickr.com') || p.image.includes('flower,bouquet,plant')) {
        p.image = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        await p.save();
        updatedCount++;
      }
    }

    console.log(`Successfully fixed ${updatedCount} broken product images.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixImages();
