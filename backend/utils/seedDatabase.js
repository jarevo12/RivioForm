/**
 * Database Seeder
 * Script to seed the database with sample data for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Applicant = require('../models/Applicant');
const logger = require('../config/logger');

const sampleApplicants = [
  {
    email: 'john.doe@acmecorp.com',
    firstName: 'John',
    lastName: 'Doe',
    organization: 'ACME Corporation',
    position: 'Chief Financial Officer',
    phone: '+1 (555) 123-4567',
    status: 'completed',
    giftCardSent: true,
  },
  {
    email: 'jane.smith@techstartup.io',
    firstName: 'Jane',
    lastName: 'Smith',
    organization: 'Tech Startup Inc.',
    position: 'Finance Manager',
    phone: '+1 (555) 234-5678',
    status: 'scheduled',
    interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  },
  {
    email: 'bob.johnson@globaltrading.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    organization: 'Global Trading LLC',
    position: 'Credit Manager',
    status: 'contacted',
  },
  {
    email: 'alice.williams@manufacturer.com',
    firstName: 'Alice',
    lastName: 'Williams',
    organization: 'Manufacturer Co.',
    position: 'Director of Finance',
    phone: '+1 (555) 456-7890',
    status: 'pending',
  },
  {
    email: 'charlie.brown@exporters.net',
    firstName: 'Charlie',
    lastName: 'Brown',
    organization: 'International Exporters',
    position: 'Risk Manager',
    status: 'pending',
  },
];

/**
 * Seed the database
 */
const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rivio');
    logger.info('✅ Connected to MongoDB');

    // Clear existing data
    await Applicant.deleteMany({});
    logger.info('🗑️  Cleared existing applicants');

    // Insert sample data
    const applicants = await Applicant.insertMany(sampleApplicants);
    logger.info(`✅ Inserted ${applicants.length} sample applicants`);

    // Display seeded data
    console.log('\n📊 Seeded Applicants:');
    applicants.forEach((app, index) => {
      console.log(`${index + 1}. ${app.fullName} (${app.email}) - ${app.status}`);
    });

    // Disconnect
    await mongoose.connection.close();
    logger.info('\n✅ Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
