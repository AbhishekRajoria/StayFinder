import mongoose from 'mongoose';
import User from '../models/User';
import Listing from '../models/Listing';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'host'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'host'
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'guest'
  },
  {
    name: 'Alice Brown',
    email: 'alice@example.com',
    password: 'password123',
    role: 'guest'
  }
];

const listings = [
  {
    title: 'Cozy Beach House',
    description: 'Beautiful beach house with ocean view',
    price: 150,
    location: 'Miami Beach, FL',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
    amenities: ['WiFi', 'Pool', 'Kitchen'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2
  },
  {
    title: 'Mountain Cabin',
    description: 'Rustic cabin in the mountains',
    price: 200,
    location: 'Aspen, CO',
    images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233'],
    amenities: ['WiFi', 'Fireplace', 'Hot Tub'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2
  },
  {
    title: 'City Apartment',
    description: 'Modern apartment in downtown',
    price: 100,
    location: 'New York, NY',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    amenities: ['WiFi', 'Gym', 'Doorman'],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log('Created users');

    // Create listings with host references
    const hostUsers = createdUsers.filter(user => user.role === 'host');
    const listingsWithHosts = listings.map((listing, index) => ({
      ...listing,
      host: hostUsers[index % hostUsers.length]._id
    }));

    await Listing.create(listingsWithHosts);
    console.log('Created listings');

    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 