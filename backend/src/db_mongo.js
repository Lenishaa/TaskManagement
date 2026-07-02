const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('❌ MONGO_URI environment variable is required! Set it in .env or system environment.');
}

let client = null;
let mongoDb = null;

async function connectMongo() {
  try {
    // MongoDB connection options for better compatibility
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
      tls: true, // Enable TLS for MongoDB Atlas
      tlsAllowInvalidCertificates: false, // Set to true only for testing
      tlsAllowInvalidHostnames: false
    };

    client = new MongoClient(MONGO_URI, options);
    
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    
    // Test the connection
    await client.db().admin().ping();
    
    mongoDb = client.db();
    console.log('✅ Connected to MongoDB successfully');
    return mongoDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

function closeMongo() {
  return client?.close();
}

function asTaskDoc(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description || '',
    completed: !!doc.completed,
    user_id: String(doc.user_id),
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

const db = {
  async connect() {
    await connectMongo();
  },

  // Users
  async getUserByUsername(username) {
    const u = await mongoDb.collection('users').findOne({ username });
    if (!u) return null;
    return { id: String(u._id), username: u.username, password_hash: u.password_hash };
  },

  async createUser(username, password_hash) {
    const r = await mongoDb.collection('users').insertOne({ username, password_hash });
    return { id: String(r.insertedId), username, password_hash };
  },

  async getUserById(id) {
    try {
      const _id = new ObjectId(id);
      const u = await mongoDb.collection('users').findOne({ _id });
      if (!u) return null;
      return { id: String(u._id), username: u.username, password_hash: u.password_hash };
    } catch (e) {
      return null;
    }
  },

  // Tasks
  async listTasksByUser(user_id) {
    try {
      const uid = new ObjectId(user_id);
      const cursor = mongoDb.collection('tasks').find({ user_id: uid }).sort({ created_at: -1 });
      const docs = await cursor.toArray();
      return docs.map(asTaskDoc);
    } catch (e) {
      return [];
    }
  },

  async createTask({ title, description, user_id }) {
    const now = new Date().toISOString();
    let uid;
    try {
      uid = new ObjectId(user_id);
    } catch (e) {
      throw new Error('Invalid user_id');
    }
    const doc = {
      title,
      description: description || '',
      completed: false,
      user_id: uid,
      created_at: now,
      updated_at: now
    };
    const r = await mongoDb.collection('tasks').insertOne(doc);
    doc._id = r.insertedId;
    return asTaskDoc(doc);
  },

  async getTaskByIdAndUser(id, user_id) {
    try {
      const _id = new ObjectId(id);
      const uid = new ObjectId(user_id);
      const t = await mongoDb.collection('tasks').findOne({ _id, user_id: uid });
      return asTaskDoc(t);
    } catch (e) {
      return null;
    }
  },

  async updateTask(id, updates) {
    try {
      const _id = new ObjectId(id);
      updates.updated_at = new Date().toISOString();
      await mongoDb.collection('tasks').updateOne({ _id }, { $set: updates });
      const t = await mongoDb.collection('tasks').findOne({ _id });
      return asTaskDoc(t);
    } catch (e) {
      return null;
    }
  },

  async deleteTask(id) {
    try {
      const _id = new ObjectId(id);
      const r = await mongoDb.collection('tasks').deleteOne({ _id });
      return r.deletedCount === 1;
    } catch (e) {
      return false;
    }
  },

  // Lifecycle
  _close: closeMongo,
  _mongoDb: () => mongoDb
};

module.exports = db;
