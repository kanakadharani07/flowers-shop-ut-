require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@flowershop.com';
const ADMIN_PASSWORD = '171205';
const ADMIN_NAME = 'Admin';

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://dharanikathir:balajidharani07@databasemongodb.1sruqrd.mongodb.net/test';

async function setAdmin() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      // Update existing user to admin with new password
      existing.role = 'admin';
      existing.isApproved = true;
      existing.password = passwordHash;
      existing.name = ADMIN_NAME;
      await existing.save();
      console.log(`✅ Updated existing user "${ADMIN_EMAIL}" to ADMIN role with new password.`);
    } else {
      // Create new admin user
      const admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: 'admin',
        isApproved: true,
      });
      await admin.save();
      console.log(`✅ Created new ADMIN user: ${ADMIN_EMAIL}`);
    }

    console.log('');
    console.log('🔐 Admin Credentials:');
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

setAdmin();
