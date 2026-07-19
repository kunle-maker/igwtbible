import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://oluwagbemiga183_db_user:GRErFg1miJMoz4le@igwtbible.u4ccf3v.mongodb.net/?appName=igwtbible";

async function test() {
  console.log('Attempting to connect to MongoDB...');
  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });
  try {
    await client.connect();
    console.log('SUCCESS: Connected to MongoDB!');
    const db = client.db('igwtbible');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
  } catch (err) {
    console.error('FAILURE: Could not connect:', err);
  } finally {
    await client.close();
  }
}

test();
