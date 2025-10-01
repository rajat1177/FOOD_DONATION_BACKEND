import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path'; // Import path module
// import FoodListing from '../../models/foodListing.js';
import Donation from '../../models/Donation.js'
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB connection successful!'))
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

// Get current directory in ES module
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the JSON file
const filePath ='/Users/rajat/Downloads/Dinesh_MERN_App-main/Server/dev-data/data/donation.json';

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found at ${filePath}`);
  process.exit(1);
}

const tours = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Import data into DB
const importData = async () => {
  try {
    await Donation.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.error('Error importing data:', err);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await FoodListing.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.error('Error deleting data:', err);
  }
  process.exit();
};

// Run based on arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Invalid command. Use --import to import data or --delete to delete data.');
  process.exit(1);
}


// node FileNAme --import
// node FileaNAme --delete