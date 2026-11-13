import 'dotenv/config';
import mongoose from 'mongoose';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = mongoose.connection.collection('products');
  const docs = await products.find({}, { projection: { subcategory: 1 } }).toArray();
  let changed = 0;
  for (const doc of docs) {
    const normalized = String(doc.subcategory || '').trim().toLowerCase();
    if (normalized && normalized !== doc.subcategory) {
      await products.updateOne({ _id: doc._id }, { $set: { subcategory: normalized } });
      changed++;
    }
  }
  console.log(`Normalised ${changed} of ${docs.length} products.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
