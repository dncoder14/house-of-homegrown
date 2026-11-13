import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

const email = (process.argv[2] || '').trim().toLowerCase();

const run = async () => {
  if (!email) {
    console.error('Usage: npm run make-admin -- user@example.com');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) {
    console.error(`No user found with email ${email}. They must sign up first.`);
    process.exitCode = 1;
  } else {
    console.log(`${user.email} is now an admin.`);
  }
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
