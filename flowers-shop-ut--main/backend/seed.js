const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const dummyProducts = [
  { name: 'Red Rose Bouquet', description: 'Classic red roses for your loved ones', price: 999, category: 'Bouquets', stock: 20, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Rosa_rubiginosa_1.jpg/500px-Rosa_rubiginosa_1.jpg' },
  { name: 'White Lily Arrangement', description: 'Elegant white lilies in a vase', price: 1499, category: 'Arrangements', stock: 15, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Lilium_candidum_1.jpg/500px-Lilium_candidum_1.jpg' },
  { name: 'Orchid Pot', description: 'Beautiful purple phalaenopsis orchid in a ceramic pot', price: 1999, category: 'Pots', stock: 10, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Phalaenopsis_amabilis.jpg/500px-Phalaenopsis_amabilis.jpg' },
  { name: 'Birthday Basket', description: 'Colorful mix of seasonal flowers in a wicker basket', price: 1299, category: 'Gifts', stock: 25, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Bouquet_of_flowers_%282%29.jpg/500px-Bouquet_of_flowers_%282%29.jpg' },
  { name: 'Valentine\'s Special', description: 'Premium long-stem red roses in a luxury box', price: 2999, category: 'Specials', stock: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Red_rose_in_the_garden.jpg/500px-Red_rose_in_the_garden.jpg' },
  { name: 'Sunflower Sunshine', description: 'Bright sunflowers to light up any room', price: 899, category: 'Bouquets', stock: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/500px-Sunflower_sky_backdrop.jpg' },
  { name: 'Wedding Combo', description: 'Bridal bouquet and matching boutonniere', price: 2499, category: 'Specials', stock: 8, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wedding_bouquet_of_flowers.jpg/500px-Wedding_bouquet_of_flowers.jpg' },
  { name: 'Tulip Treasure', description: 'Assorted colorful tulips from Holland', price: 1199, category: 'Bouquets', stock: 18, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tulipa_gesneriana.jpg/500px-Tulipa_gesneriana.jpg' },
  { name: 'Bonsai Tree Element', description: 'Small indoor bonsai tree suitable for gifts', price: 2199, category: 'Pots', stock: 12, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Bonsai_Trident_Maple.jpg/500px-Bonsai_Trident_Maple.jpg' },
  { name: 'Anniversary Flowers', description: 'Romantic mix of peonies and roses', price: 1799, category: 'Specials', stock: 15, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Peonies_in_a_vase.jpg/500px-Peonies_in_a_vase.jpg' },
  { name: 'Carnation Charm', description: 'Simple and elegant pink carnations', price: 799, category: 'Bouquets', stock: 40, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Dianthus_caryophyllus_1.jpg/500px-Dianthus_caryophyllus_1.jpg' },
  { name: 'Daisy Delight', description: 'Classic white daisies for a cheerful vibe', price: 699, category: 'Bouquets', stock: 50, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Bellis_perennis_macro.jpg/500px-Bellis_perennis_macro.jpg' },
  { name: 'Succulent Garden', description: 'Assortment of mini succulents in a concrete bowl', price: 1599, category: 'Pots', stock: 20, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Various_succulents.jpg/500px-Various_succulents.jpg' },
  { name: 'Funeral Wreath', description: 'Respectful white flower wreath', price: 2599, category: 'Specials', stock: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/White_flowers_wreath.jpg/500px-White_flowers_wreath.jpg' },
  { name: 'Baby Shower Bloom', description: 'Soft pastel flowers in a pretty vase', price: 1399, category: 'Arrangements', stock: 14, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pastel_flowers.jpg/500px-Pastel_flowers.jpg' },
  { name: 'Corporate Gift Flowers', description: 'Sophisticated minimalist arrangement', price: 1899, category: 'Gifts', stock: 10, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Minimal_flower_arrangement.jpg/500px-Minimal_flower_arrangement.jpg' },
  { name: 'Lavender Love', description: 'Fragrant lavender bundle', price: 899, category: 'Bouquets', stock: 25, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Lavandula_angustifolia_1.jpg/500px-Lavandula_angustifolia_1.jpg' },
  { name: 'Hydrangea Haven', description: 'Large blue and purple hydrangeas', price: 1399, category: 'Arrangements', stock: 12, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Hydrangea_macrophylla_blue.jpg/500px-Hydrangea_macrophylla_blue.jpg' },
  { name: 'Peony Perfection', description: 'Lush pink peonies in full bloom', price: 1699, category: 'Bouquets', stock: 8, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Paeonia_lactiflora.jpg/500px-Paeonia_lactiflora.jpg' },
  { name: 'Peace Lily Plant', description: 'Low maintenance indoor plant', price: 1099, category: 'Pots', stock: 22, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Spathiphyllum_wallisii.jpg/500px-Spathiphyllum_wallisii.jpg' }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flowers-hope';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@flowershope.com',
      password: adminPassword,
      role: 'admin'
    });

    // Create Seller
    const sellerPassword = await bcrypt.hash('seller123', salt);
    const seller = await User.create({
      name: 'Flower Seller',
      email: 'seller@flowershope.com',
      password: sellerPassword,
      role: 'seller'
    });

    // Create Normal User
    const userPassword = await bcrypt.hash('user123', salt);
    await User.create({
      name: 'Test Customer',
      email: 'user@flowershope.com',
      password: userPassword,
      role: 'user'
    });

    // Add sellerId to all products and use reliable loremflickr images
    const productsWithSeller = dummyProducts.map((p, index) => ({
      ...p,
      image: 'https://loremflickr.com/500/500/flower,bouquet,plant?lock=' + (index + 1),
      sellerId: seller._id
    }));

    await Product.insertMany(productsWithSeller);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
