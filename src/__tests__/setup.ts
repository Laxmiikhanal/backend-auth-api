import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

// ✅ Remove afterEach cleanup (this was breaking multi-step tests)
// afterEach(async () => { ... })

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});
