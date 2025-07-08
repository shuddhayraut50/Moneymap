const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 3001,
  UPDATE_INTERVAL: 10000000, // 2 minute
  MAX_VALUE_MULTIPLIER: 2,
  MIN_VALUE_MULTIPLIER: 0.1,
  BASE_UP_PROBABILITY: 0.75,
  BASE_DOWN_PROBABILITY: 0.25,
  MAX_PERCENT_CHANGE: 7
};

// Custom error class for asset operations
class AssetError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AssetError';
    this.code = code;
  }
}

// Asset Manager Class
class AssetManager {
  constructor(filename, type) {
    this.filename = filename;
    this.type = type; // asset type (stocks, crypto, etc.)
    this.data = this.load();
    this.startUpdateInterval();
  }

  load() {
    try {
      const raw = fs.readFileSync(this.filename, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Warning: Could not load ${this.filename}, creating new file`);
      return {};
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error(`Error saving to ${this.filename}:`, e);
      throw new AssetError(`Failed to save data to ${this.filename}`, 'SAVE_ERROR');
    }
  }

  getRandomPercentageChangeWithBounds(asset) {
    const { original, updated } = asset;
    const maxValue = original * CONFIG.MAX_VALUE_MULTIPLIER;
    const minValue = original * CONFIG.MIN_VALUE_MULTIPLIER;
    
    const upRoom = Math.max(0, (maxValue - updated) / (maxValue - original));
    const downRoom = Math.max(0, (updated - minValue) / (original - minValue));
    
    let upProb = CONFIG.BASE_UP_PROBABILITY * upRoom + 0.05 * (1 - upRoom);
    let downProb = CONFIG.BASE_DOWN_PROBABILITY * downRoom + 0.05 * (1 - downRoom);
    
    const total = upProb + downProb;
    upProb /= total;
    downProb /= total;
    
    const direction = Math.random() < upProb ? 1 : -1;
    const skewed = Math.pow(Math.random(), 4);
    const percent = CONFIG.MAX_PERCENT_CHANGE * skewed;
    
    return direction * percent;
  }

  startUpdateInterval() {
    setInterval(() => {
      try {
        for (let key in this.data) {
          const asset = this.data[key];
          let changePercent = this.getRandomPercentageChangeWithBounds(asset);
          let newValue = asset.updated * (1 + changePercent / 100);
          
          const maxValue = asset.original * CONFIG.MAX_VALUE_MULTIPLIER;
          const minValue = asset.original * CONFIG.MIN_VALUE_MULTIPLIER;
          
          newValue = Math.min(Math.max(newValue, minValue), maxValue);
          asset.updated = Math.round(newValue * 100) / 100;
        }
        this.save();
      } catch (e) {
        console.error('Error in update interval:', e);
      }
    }, CONFIG.UPDATE_INTERVAL);
  }

  get() {
    return this.data;
  }

  async set(name, value) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new AssetError('Invalid asset name', 'INVALID_NAME');
    }
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      throw new AssetError('Invalid asset value', 'INVALID_VALUE');
    }

    if (!this.data[name]) {
      this.data[name] = { original: value, updated: value };
    } else {
      this.data[name].updated = value;
    }
    this.save();
    await insertHistoryRecord(this.type, name, value);
  }
}

// Initialize Express app
const app = express();

// More flexible CORS configuration for development
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'http://127.0.0.1:5506',
            'http://localhost:5506',
            'http://127.0.0.1:5507',
            'http://localhost:5507',
            'http://127.0.0.1:5508',
            'http://localhost:5508',
            'http://127.0.0.1:5509',
            'http://localhost:5509',
            'http://127.0.0.1:5510',
            'http://localhost:5510',
            'http://127.0.0.1:5511',
            'http://localhost:5511',
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:3001',
            'http://localhost:3001'
        ];
        
        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // For development, allow all localhost origins
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                console.log(`Allowing development origin: ${origin}`);
                callback(null, true);
            } else {
                console.log(`Blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true, // Required for requests with credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Initialize managers
const managers = {
  stocks: new AssetManager('./data/stocks.json', 'stocks'),
  crypto: new AssetManager('./data/crypto.json', 'crypto'),
  etfs: new AssetManager('./data/etfs.json', 'etfs'),
  mutualfunds: new AssetManager('./data/mutualFunds.json', 'mutualfunds'),
  reits: new AssetManager('./data/reits.json', 'reits'),
  fd: new AssetManager('./data/fd.json', 'fd')
};

// --- MongoDB History Logic ---
const historyMongoUrl = 'mongodb://localhost:27017';
const historyDbName = 'teste';
const historyCollectionName = 'history';

async function insertHistoryRecord(type, name, value) {
  const client = new MongoClient(historyMongoUrl);
  try {
    await client.connect();
    const db = client.db(historyDbName);
    const collection = db.collection(historyCollectionName);
    const today = new Date().toISOString().slice(0, 10);
    await collection.insertOne({ type, name, value, date: today });
  } finally {
    await client.close();
  }
}

// Insert all asset values into history every 10 seconds
setInterval(async () => {
  for (const [type, manager] of Object.entries(managers)) {
    const data = manager.get();
    for (const [name, asset] of Object.entries(data)) {
      await insertHistoryRecord(type, name, asset.updated);
    }
  }
}, 10000); // 10 seconds

// API endpoint to get history for a type
app.get('/get-history', async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ error: 'Type is required' });
  const client = new MongoClient(historyMongoUrl);
  try {
    await client.connect();
    const db = client.db(historyDbName);
    const collection = db.collection(historyCollectionName);
    // Only select the required fields and exclude _id
    const docs = await collection.find({ type }, { projection: { _id: 0, type: 1, name: 1, value: 1, datetime: 1 } }).toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
});

// API Routes
const assetTypes = ['stocks', 'crypto', 'etfs', 'mutualfunds', 'reits', 'fd'];

assetTypes.forEach(type => {
  app.get(`/get-value-${type}`, (req, res) => {
    try {
      res.json(managers[type].get());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post(`/set-value-${type}`, (req, res) => {
    try {
      const { name, value } = req.body;
      managers[type].set(name, value);
      res.json({ status: 'Success', data: managers[type].get() });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
});

// Legacy endpoints for backward compatibility
app.get('/get-value', async (req, res) => {
  try {
    const stocks = await getStocksFromMongo();
    res.json(stocks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/set-value', (req, res) => {
  try {
    const { name, value } = req.body;
    managers.stocks.set(name, value);
    res.json({ status: 'Success', data: managers.stocks.get() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- MongoDB /save endpoint ---
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'teste';
const collectionName = 'teste';

app.post('/save', async (req, res) => {
    const { name, number } = req.body;
    if (!name || !number) {
        return res.status(400).json({ message: 'Name and number are required.' });
    }
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        await collection.insertOne({ name, number });
        await client.close();
        res.json({ message: 'Data saved successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error saving data.' });
    }
});

// --- Signup endpoint for MongoDB ---
app.post('/signup', async (req, res) => {
    const { _id, firstName, lastName, phone, email, username, password } = req.body;
    if (!_id || !firstName || !lastName || !phone || !email || !username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        // Try to insert, will fail if _id (phone) already exists
        await collection.insertOne({ _id, firstName, lastName, phone, email, username, password });
        await client.close();
        res.json({ message: 'Signup successful!' });
    } catch (err) {
        if (err.code === 11000) {
            res.status(409).json({ message: 'Mobile number already exists.' });
        } else {
            res.status(500).json({ message: 'Error saving user.' });
        }
    }
});

// --- Login endpoint for MongoDB ---
app.post('/login', async (req, res) => {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
        return res.status(400).json({ message: 'Login ID and password are required.' });
    }
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        // Find by phone (_id), username, or email
        const user = await collection.findOne({
            $or: [
                { _id: loginId },
                { phone: loginId },
                { username: loginId },
                { email: loginId }
            ]
        });
        await client.close();
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password.' });
        }
        res.json({ message: 'Login successful!', username: user.username, phone: user.phone, email: user.email });
    } catch (err) {
        res.status(500).json({ message: 'Error during login.' });
    }
});

// MongoDB connection config for stocks
const stocksMongoUrl = 'mongodb://localhost:27017';
const stocksDbName = 'teste';
const stocksCollectionName = 'stocks';

// Helper: Update all stocks in MongoDB
defaultUpdateStocksInMongo = async (stocksData) => {
  const client = new MongoClient(stocksMongoUrl);
  try {
    await client.connect();
    const db = client.db(stocksDbName);
    const collection = db.collection(stocksCollectionName);
    // Upsert each stock
    for (const [name, { original, updated }] of Object.entries(stocksData)) {
      await collection.updateOne(
        { name },
        { $set: { name, original, updated } },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
};

// Helper: Get all stocks from MongoDB as { name: { original, updated } }
const getStocksFromMongo = async () => {
  const client = new MongoClient(stocksMongoUrl);
  try {
    await client.connect();
    const db = client.db(stocksDbName);
    const collection = db.collection(stocksCollectionName);
    const docs = await collection.find({}).toArray();
    const result = {};
    docs.forEach(doc => {
      result[doc.name] = { original: doc.original, updated: doc.updated };
    });
    return result;
  } finally {
    await client.close();
  }
};

// Patch AssetManager for stocks to update MongoDB after each update
const originalStocksManager = managers.stocks;
const originalStocksSave = originalStocksManager.save.bind(originalStocksManager);
originalStocksManager.save = async function() {
  originalStocksSave(); // still save to file for backup
  await defaultUpdateStocksInMongo(this.data);
};

// Patch set as well (for manual updates)
const originalStocksSet = originalStocksManager.set.bind(originalStocksManager);
originalStocksManager.set = async function(name, value) {
  originalStocksSet(name, value);
  await defaultUpdateStocksInMongo(this.data);
};

// MongoDB connection config for etfs
const etfsMongoUrl = 'mongodb://localhost:27017';
const etfsDbName = 'teste';
const etfsCollectionName = 'etfs';

// Helper: Update all etfs in MongoDB
const updateEtfsInMongo = async (etfsData) => {
  const client = new MongoClient(etfsMongoUrl);
  try {
    await client.connect();
    const db = client.db(etfsDbName);
    const collection = db.collection(etfsCollectionName);
    for (const [name, { original, updated }] of Object.entries(etfsData)) {
      await collection.updateOne(
        { name },
        { $set: { name, original, updated } },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
};

// Helper: Get all etfs from MongoDB as { name: { original, updated } }
const getEtfsFromMongo = async () => {
  const client = new MongoClient(etfsMongoUrl);
  try {
    await client.connect();
    const db = client.db(etfsDbName);
    const collection = db.collection(etfsCollectionName);
    const docs = await collection.find({}).toArray();
    const result = {};
    docs.forEach(doc => {
      result[doc.name] = { original: doc.original, updated: doc.updated };
    });
    return result;
  } finally {
    await client.close();
  }
};

// Patch AssetManager for etfs to update MongoDB after each update
const originalEtfsManager = managers.etfs;
const originalEtfsSave = originalEtfsManager.save.bind(originalEtfsManager);
originalEtfsManager.save = async function() {
  originalEtfsSave(); // still save to file for backup
  await updateEtfsInMongo(this.data);
};

const originalEtfsSet = originalEtfsManager.set.bind(originalEtfsManager);
originalEtfsManager.set = async function(name, value) {
  originalEtfsSet(name, value);
  await updateEtfsInMongo(this.data);
};

// MongoDB connection config for crypto
const cryptoMongoUrl = 'mongodb://localhost:27017';
const cryptoDbName = 'teste';
const cryptoCollectionName = 'crypto';

// Helper: Update all crypto in MongoDB
const updateCryptoInMongo = async (cryptoData) => {
  const client = new MongoClient(cryptoMongoUrl);
  try {
    await client.connect();
    const db = client.db(cryptoDbName);
    const collection = db.collection(cryptoCollectionName);
    for (const [name, { original, updated }] of Object.entries(cryptoData)) {
      await collection.updateOne(
        { name },
        { $set: { name, original, updated } },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
};

// Helper: Get all crypto from MongoDB as { name: { original, updated } }
const getCryptoFromMongo = async () => {
  const client = new MongoClient(cryptoMongoUrl);
  try {
    await client.connect();
    const db = client.db(cryptoDbName);
    const collection = db.collection(cryptoCollectionName);
    const docs = await collection.find({}).toArray();
    const result = {};
    docs.forEach(doc => {
      result[doc.name] = { original: doc.original, updated: doc.updated };
    });
    return result;
  } finally {
    await client.close();
  }
};

// Patch AssetManager for crypto to update MongoDB after each update
const originalCryptoManager = managers.crypto;
const originalCryptoSave = originalCryptoManager.save.bind(originalCryptoManager);
originalCryptoManager.save = async function() {
  originalCryptoSave(); // still save to file for backup
  await updateCryptoInMongo(this.data);
};

const originalCryptoSet = originalCryptoManager.set.bind(originalCryptoManager);
originalCryptoManager.set = async function(name, value) {
  originalCryptoSet(name, value);
  await updateCryptoInMongo(this.data);
};

// MongoDB connection config for fd
const fdMongoUrl = 'mongodb://localhost:27017';
const fdDbName = 'teste';
const fdCollectionName = 'fd';

// Helper: Update all fd in MongoDB
const updateFdInMongo = async (fdData) => {
  const client = new MongoClient(fdMongoUrl);
  try {
    await client.connect();
    const db = client.db(fdDbName);
    const collection = db.collection(fdCollectionName);
    for (const [name, { original, updated }] of Object.entries(fdData)) {
      await collection.updateOne(
        { name },
        { $set: { name, original, updated } },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
};

// Helper: Get all fd from MongoDB as { name: { original, updated } }
const getFdFromMongo = async () => {
  const client = new MongoClient(fdMongoUrl);
  try {
    await client.connect();
    const db = client.db(fdDbName);
    const collection = db.collection(fdCollectionName);
    const docs = await collection.find({}).toArray();
    const result = {};
    docs.forEach(doc => {
      result[doc.name] = { original: doc.original, updated: doc.updated };
    });
    return result;
  } finally {
    await client.close();
  }
};

// Patch AssetManager for fd to update MongoDB after each update
if (managers.fd) {
  const originalFdManager = managers.fd;
  const originalFdSave = originalFdManager.save.bind(originalFdManager);
  originalFdManager.save = async function() {
    originalFdSave();
    await updateFdInMongo(this.data);
  };
  const originalFdSet = originalFdManager.set.bind(originalFdManager);
  originalFdManager.set = async function(name, value) {
    originalFdSet(name, value);
    await updateFdInMongo(this.data);
  };
}

// Serve fd from MongoDB in /get-value-fd
app.get('/get-value-fd', async (req, res) => {
  try {
    const fd = await getFdFromMongo();
    res.json(fd);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// MongoDB connection config for mutualfunds
const mutualfundsMongoUrl = 'mongodb://localhost:27017';
const mutualfundsDbName = 'teste';
const mutualfundsCollectionName = 'mutualfunds';

// Helper: Update all mutualfunds in MongoDB
const updateMutualFundsInMongo = async (mutualfundsData) => {
  const client = new MongoClient(mutualfundsMongoUrl);
  try {
    await client.connect();
    const db = client.db(mutualfundsDbName);
    const collection = db.collection(mutualfundsCollectionName);
    for (const [name, { original, updated }] of Object.entries(mutualfundsData)) {
      await collection.updateOne(
        { name },
        { $set: { name, original, updated } },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
};

// Helper: Get all mutualfunds from MongoDB as { name: { original, updated } }
const getMutualFundsFromMongo = async () => {
  const client = new MongoClient(mutualfundsMongoUrl);
  try {
    await client.connect();
    const db = client.db(mutualfundsDbName);
    const collection = db.collection(mutualfundsCollectionName);
    const docs = await collection.find({}).toArray();
    const result = {};
    docs.forEach(doc => {
      result[doc.name] = { original: doc.original, updated: doc.updated };
    });
    return result;
  } finally {
    await client.close();
  }
};

// Patch AssetManager for mutualfunds to update MongoDB after each update
const originalMutualFundsManager = managers.mutualfunds;
const originalMutualFundsSave = originalMutualFundsManager.save.bind(originalMutualFundsManager);
originalMutualFundsManager.save = async function() {
  originalMutualFundsSave();
  await updateMutualFundsInMongo(this.data);
};
const originalMutualFundsSet = originalMutualFundsManager.set.bind(originalMutualFundsManager);
originalMutualFundsManager.set = async function(name, value) {
  originalMutualFundsSet(name, value);
  await updateMutualFundsInMongo(this.data);
};

// Serve mutualfunds from MongoDB in /get-value-mutualfunds
app.get('/get-value-mutualfunds', async (req, res) => {
  try {
    const mutualfunds = await getMutualFundsFromMongo();
    res.json(mutualfunds);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// MongoDB connection config for reits
const reitsMongoUrl = 'mongodb://localhost:27017';
const reitsDbName = 'teste';
const reitsCollectionName = 'reits';

// Helper: Update all reits in MongoDB
const updateReitsInMongo = async (reitsData) => {
  const client = new MongoClient(reitsMongoUrl);
  try {
    await client.connect();
    const db = client.db(reitsDbName);
    const collection = db.collection(reitsCollectionName);
    for (const [name, { original, updated }] of Object.entries(reitsData)) {
      await collection.updateOne(
        { name },
        { $set: { name, original, updated } },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
};

// Helper: Get all reits from MongoDB as { name: { original, updated } }
const getReitsFromMongo = async () => {
  const client = new MongoClient(reitsMongoUrl);
  try {
    await client.connect();
    const db = client.db(reitsDbName);
    const collection = db.collection(reitsCollectionName);
    const docs = await collection.find({}).toArray();
    const result = {};
    docs.forEach(doc => {
      result[doc.name] = { original: doc.original, updated: doc.updated };
    });
    return result;
  } finally {
    await client.close();
  }
};

// Patch AssetManager for reits to update MongoDB after each update
const originalReitsManager = managers.reits;
const originalReitsSave = originalReitsManager.save.bind(originalReitsManager);
originalReitsManager.save = async function() {
  originalReitsSave();
  await updateReitsInMongo(this.data);
};
const originalReitsSet = originalReitsManager.set.bind(originalReitsManager);
originalReitsManager.set = async function(name, value) {
  originalReitsSet(name, value);
  await updateReitsInMongo(this.data);
};

// Serve reits from MongoDB in /get-value-reits
app.get('/get-value-reits', async (req, res) => {
  try {
    const reits = await getReitsFromMongo();
    res.json(reits);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Save SelectionData endpoint ---
app.post('/api/saveSelection', async (req, res) => {
    const selectionData = req.body;
    if (!selectionData || !selectionData.username || !selectionData.planId) {
        return res.status(400).json({ message: 'Invalid selection data.' });
    }
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('teste');
        const collection = db.collection('selections');
        await collection.insertOne(selectionData);
        res.json({ message: 'Selection data saved successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error saving selection data.' });
    } finally {
        await client.close();
    }
});

// --- Wallet CRUD API (MongoDB only, no JSON file) ---
const walletMongoUrl = 'mongodb://localhost:27017';
const walletDbName = 'teste';
const walletCollectionName = 'wallet';

// GET all wallet entries
app.get('/api/wallet', async (req, res) => {
  const client = new MongoClient(walletMongoUrl);
  try {
    await client.connect();
    const db = client.db(walletDbName);
    const collection = db.collection(walletCollectionName);
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wallet data.' });
  } finally {
    await client.close();
  }
});

// CREATE a new wallet entry
app.post('/api/wallet', async (req, res) => {
  const entry = req.body;
  if (!entry || !entry.name || typeof entry.balance !== 'number') {
    return res.status(400).json({ message: 'Invalid wallet entry.' });
  }
  const client = new MongoClient(walletMongoUrl);
  try {
    await client.connect();
    const db = client.db(walletDbName);
    const collection = db.collection(walletCollectionName);
    const result = await collection.insertOne(entry);
    res.json({ ...entry, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating wallet entry.' });
  } finally {
    await client.close();
  }
});

// UPDATE a wallet entry by _id
app.put('/api/wallet/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  if (!update || (!update.name && typeof update.balance !== 'number')) {
    return res.status(400).json({ message: 'Invalid update data.' });
  }
  const client = new MongoClient(walletMongoUrl);
  try {
    await client.connect();
    const db = client.db(walletDbName);
    const collection = db.collection(walletCollectionName);
    const { ObjectId } = require('mongodb');
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return res.status(404).json({ message: 'Wallet entry not found.' });
    }
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ message: 'Error updating wallet entry.' });
  } finally {
    await client.close();
  }
});

// DELETE a wallet entry by _id
app.delete('/api/wallet/:id', async (req, res) => {
  const { id } = req.params;
  const client = new MongoClient(walletMongoUrl);
  try {
    await client.connect();
    const db = client.db(walletDbName);
    const collection = db.collection(walletCollectionName);
    const { ObjectId } = require('mongodb');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Wallet entry not found.' });
    }
    res.json({ message: 'Wallet entry deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting wallet entry.' });
  } finally {
    await client.close();
  }
});

// Get latest selection/portfolio for a user
app.get('/api/portfolio', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('teste');
        const collection = db.collection('selections');
        // Get the latest selection for this user (by timestamp descending)
        const selection = await collection.find({ username }).sort({ timestamp: -1 }).limit(1).toArray();
        if (!selection.length) {
            return res.status(404).json({ message: 'No portfolio found for this user.' });
        }
        // Only return the purchases object for frontend processing
        res.json(selection[0].purchases || {});
    } catch (err) {
        res.status(500).json({ message: 'Error fetching portfolio.' });
    } finally {
        await client.close();
    }
});

// New endpoint: Get unified portfolio items for a user (with current prices and profit)
app.get('/api/portfolio-items', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('teste');
        const collection = db.collection('selections');
        // Get the latest selection for this user (by timestamp descending)
        const selection = await collection.find({ username }).sort({ timestamp: -1 }).limit(1).toArray();
        if (!selection.length) {
            // Instead of 404, return empty portfolio
            return res.json({ portfolioItems: [] });
        }
        const purchases = selection[0].purchases || {};
        // Load current asset prices from managers
        const stocksDB = managers.stocks.get();
        const mutualFundsDB = managers.mutualfunds.get();
        const etfsDB = managers.etfs.get();
        // Helper to get current price
        function getCurrentPrice(type, name) {
            if (type === "stocks" && stocksDB[name]) return stocksDB[name].updated;
            if (type === "mutualFunds" && mutualFundsDB[name]) return mutualFundsDB[name].updated;
            if (type === "goldETFs" && etfsDB[name]) return etfsDB[name].updated;
            return null;
        }
        // Transform purchases to portfolioItems
        function buildPortfolioItems(purchases) {
            const items = [];
            for (const [type, arr] of Object.entries(purchases)) {
                arr.forEach(item => {
                    let purchasePrice, quantity, name, currentPrice;
                    if (type === "stocks" || type === "goldETFs") {
                        name = item.name;
                        purchasePrice = item.price;
                        quantity = item.units;
                    } else if (type === "mutualFunds") {
                        name = item.name;
                        purchasePrice = item.nav;
                        quantity = item.units;
                    } else if (type === "fd") {
                        name = item.name;
                        purchasePrice = item.amount;
                        quantity = 1;
                    } else {
                        return;
                    }
                    currentPrice = getCurrentPrice(type, name);
                    if (currentPrice === null) return;
                    const currentValue = currentPrice * quantity;
                    const profit = (currentPrice - purchasePrice) * quantity;
                    items.push({
                        name,
                        type,
                        quantity,
                        purchasePrice,
                        currentPrice,
                        currentValue,
                        profit: parseFloat(profit.toFixed(2)),
                        profitPercent: parseFloat(((profit / (purchasePrice * quantity)) * 100).toFixed(2))
                    });
                });
            }
            return items;
        }
        const portfolioItems = buildPortfolioItems(purchases);
        // Map FD items to portfolioItems with exact string "Fixed Deposits" and correct logic
        const fdPurchases = purchases.fd || [];
        fdPurchases.forEach(fd => {
            const principal = typeof fd.amount === "number" ? fd.amount : 0;
            const rate = typeof fd.rate === "number" ? fd.rate : 0;
            const duration = typeof fd.duration === "number" ? fd.duration : 0;
            // Use maturity if available, else calculate simple interest
            const maturity = typeof fd.maturity === "number" ? fd.maturity : (principal + (principal * rate * duration / 100));
            const currentValue = maturity;
            const profit = currentValue - principal;
            portfolioItems.push({
                name: fd.name || "Unknown FD",
                type: "Fixed Deposits",
                quantity: 1,
                purchasePrice: principal,
                currentPrice: currentValue, // For FDs, currentPrice = currentValue
                currentValue: currentValue,
                profit: parseFloat(profit.toFixed(2)),
                profitPercent: principal > 0 ? parseFloat(((profit / principal) * 100).toFixed(2)) : 0,
                rate,
                duration,
                maturity: fd.maturity,
                isSmallFinance: fd.isSmallFinance
            });
        });
        res.json({ portfolioItems });
    } catch (err) {
        res.status(500).json({ message: 'Error building portfolio items.' });
    } finally {
        await client.close();
    }
});

// Place this function in your server.js
function mergePlans(plans) {
    const merged = {};
    const result = [];
    // Load current asset prices from managers
    const stocksDB = managers.stocks.get();
    const mutualFundsDB = managers.mutualfunds.get();
    const etfsDB = managers.etfs.get();
    const cryptoDB = managers.crypto.get();
    // Helper to get current price
    function getCurrentPrice(type, name) {
        if (!name) return 0;
        if (type === "stocks" && stocksDB[name]) return stocksDB[name].updated;
        if (type === "mutualFunds" && mutualFundsDB[name]) return mutualFundsDB[name].updated;
        if (type === "etfs" && etfsDB[name]) return etfsDB[name].updated;
        if (type === "crypto" && cryptoDB[name]) return cryptoDB[name].updated;
        return 0;
    }
    for (const plan of plans) {
        const purchases = plan.purchases || {};
        for (const [type, assets] of Object.entries(purchases)) {
            if (type === "fd") {
                // For FDs, do NOT merge, push each FD as a separate entry
                for (const asset of assets) {
                    const principal = typeof asset.amount === "number" ? asset.amount : 0;
                    const rate = typeof asset.rate === "number" ? asset.rate : 0;
                    const duration = typeof asset.duration === "number" ? asset.duration : 0;
                    const maturity = typeof asset.maturity === "number" ? asset.maturity : (principal + (principal * rate * duration / 100));
                    const profit = maturity - principal;
                    result.push({
                        name: asset.name || "Unknown FD",
                        type: "Fixed Deposits",
                        quantity: 1, // Always set quantity to 1 for FD
                        purchasePrice: principal,
                        currentPrice: maturity, // For FDs, currentPrice = maturity
                        currentValue: maturity,
                        profit: parseFloat(profit.toFixed(2)),
                        profitPercent: principal > 0 ? parseFloat(((profit / principal) * 100).toFixed(2)) : 0,
                        rate,
                        duration,
                        maturity: asset.maturity,
                        isSmallFinance: asset.isSmallFinance
                    });
                }
            } else {
                for (const asset of assets) {
                    const key = `${type}|${asset.name}`;
                    if (!merged[key]) {
                        merged[key] = {
                            name: asset.name,
                            type: type,
                            totalUnits: 0,
                            totalCost: 0
                        };
                    }
                    const units = asset.units || 0;
                    const price = asset.price || asset.nav || 0;
                    const total = units * price;
                    merged[key].totalUnits += units;
                    merged[key].totalCost += total;
                }
            }
        }
    }
    for (const key in merged) {
        const item = merged[key];
        const avgPrice = item.totalUnits ? (item.totalCost / item.totalUnits) : 0;
        // Determine asset type for price lookup and normalization
        let typeKey = item.type;
        let displayType = item.type;
        if (typeKey === 'goldETFs' || typeKey === 'etfs') {
            typeKey = 'etfs';
            displayType = 'ETFs';
        } else if (typeKey === 'stocks') {
            displayType = 'Stocks';
        } else if (typeKey === 'mutualFunds') {
            displayType = 'Mutual Funds';
        } else if (typeKey === 'crypto') {
            displayType = 'Crypto';
        }
        const currentPrice = getCurrentPrice(typeKey, item.name);
        const currentValue = item.totalUnits * currentPrice;
        // Set a default sector/category for each asset type
        let sector = 'Others';
        if (displayType === 'Stocks') sector = 'Equity';
        if (displayType === 'Mutual Funds') sector = 'MF';
        if (displayType === 'ETFs') sector = 'ETF';
        if (displayType === 'Crypto') sector = 'Crypto';
        result.push({
            name: item.name,
            type: displayType,
            quantity: item.totalUnits,
            purchasePrice: avgPrice, // Show as average purchase price
            currentPrice: currentPrice,
            currentValue: currentValue,
            profit: parseFloat((currentValue - (avgPrice * item.totalUnits)).toFixed(2)),
            profitPercent: avgPrice > 0 ? parseFloat((((currentValue - (avgPrice * item.totalUnits)) / (avgPrice * item.totalUnits)) * 100).toFixed(2)) : 0,
            sector: sector
        });
    }
    return result;
}

// Add this endpoint to your server.js
app.get('/api/portfolio-items-combined', async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('teste');
        const collection = db.collection('selections');
        const plans = await collection.find({ username }).toArray();
        const mergedPortfolio = mergePlans(plans);
        res.json({ portfolioItems: mergedPortfolio });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch portfolio data' });
    } finally {
        await client.close();
    }
});

// --- Logic for Sell Recommendations (ported from frontend) ---
const ASSET_CONSTRAINTS = {
    Cryptocurrency: {
        fractional: true,
        minUnits: 0.00000001,
        validateSale: (amount, item) => {
            const units = amount / item.currentPrice;
            return {
                valid: units >= 0.00000001 && amount <= item.currentValue,
                units: units
            };
        }
    },
    'Fixed Deposits': {
        wholeOnly: true,
        validateSale: (amount, item) => ({
            valid: amount >= item.currentValue,
            units: amount >= item.currentValue ? item.quantity : 0,
        })
    },
    Stocks: {
        wholeUnits: true,
        minUnits: 1,
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units,
            };
        }
    },
    'Mutual Funds': {
        wholeUnits: true,
        minUnits: 1,
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units
            };
        }
    },
    ETF: {
        wholeUnits: true,
        minUnits: 1,
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units
            };
        }
    },
    'Real Estate': {
        wholeUnits: true,
        minUnits: 1,
        validateSale: (amount, item) => {
            const units = Math.floor(amount / item.currentPrice);
            return {
                valid: units >= 1 && units <= item.quantity,
                units: units
            };
        }
    }
};
ASSET_CONSTRAINTS.ETFs = ASSET_CONSTRAINTS.ETF;
ASSET_CONSTRAINTS.Crypto = ASSET_CONSTRAINTS.Cryptocurrency;

function sortItemsByStrategy(items, strategy) {
    switch (strategy) {
        case 'tax-efficient': // Prioritize selling assets with the lowest profit margin
            items.sort((a, b) => a.profit - b.profit);
            break;
        case 'maximize-profit': // Prioritize selling assets with highest percentage gain
            items.sort((a, b) => b.profitPercent - a.profitPercent);
            break;
        case 'minimize-loss': // Prioritize selling assets with the smallest loss or smallest gain
             items.sort((a, b) => {
                const changeA = Math.abs(a.profitPercent);
                const changeB = Math.abs(b.profitPercent);
                return changeA - changeB;
            });
            break;
    }
    return items;
}

// --- Generate Recommendations Endpoint ---
app.post('/api/generate-recommendations', (req, res) => {
    const { portfolioItems, amountToSell, strategy } = req.body;

    if (!portfolioItems || !amountToSell || !strategy) {
        return res.status(400).json({ message: 'Missing required parameters: portfolioItems, amountToSell, strategy' });
    }

    let items = [...portfolioItems];
    let recommendations = [];

    // Apply strategy
    sortItemsByStrategy(items, strategy);
    
    if (strategy === 'minimize-impact') {
        // Proportional selling
        const totalSellable = items.reduce((total, item) => total + item.currentValue, 0);
        const sellRatio = amountToSell / totalSellable;
        
        items.forEach(item => {
            if (!ASSET_CONSTRAINTS[item.type]) return;
            const desiredAmount = item.currentValue * sellRatio;
            const validation = ASSET_CONSTRAINTS[item.type].validateSale(desiredAmount, item);

            if (validation.valid && validation.units > 0) {
                const actualAmount = validation.units * item.currentPrice;
                 recommendations.push({
                    investment: item.name,
                    type: item.type,
                    amount: actualAmount,
                    units: validation.units,
                    percent: (actualAmount / item.currentValue) * 100,
                });
            }
        });
    } else {
        // Prioritized selling
        let remainingAmount = amountToSell;
        for (const item of items) {
            if (remainingAmount <= 0) break;
            if (!ASSET_CONSTRAINTS[item.type]) continue;

            const validation = ASSET_CONSTRAINTS[item.type].validateSale(
                Math.min(remainingAmount, item.currentValue),
                item
            );
            
            if (validation.valid && validation.units > 0) {
                const actualAmount = validation.units * item.currentPrice;
                recommendations.push({
                    investment: item.name,
                    type: item.type,
                    amount: actualAmount,
                    units: validation.units,
                    percent: (actualAmount / item.currentValue) * 100
                });
                remainingAmount -= actualAmount;
            }
        }
    }

    res.json({ recommendations });
});

function getLotKeyFromDisplayType(displayType, allLots) {
    const normalizedType = displayType.toLowerCase().replace(/\s+/g, '');

    // Handle special cases like ETFs first
    if (normalizedType === 'etfs') {
        if (allLots['etfs']) return 'etfs';
        if (allLots['goldETFs']) return 'goldETFs';
    }

    if (normalizedType === 'fixeddeposits') {
        if (allLots['fd']) return 'fd';
    }

    // General case: find a key that matches the normalized display type
    const key = Object.keys(allLots).find(k => k.toLowerCase() === normalizedType);
    if (key) return key;

    return null; // Return null if no match is found
}

// --- Sell Assets Endpoint (Database Version) ---
app.post('/api/sell-assets', async (req, res) => {
    const { username, itemsToSell } = req.body;
    if (!username || !itemsToSell || !Array.isArray(itemsToSell)) {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    const client = new MongoClient('mongodb://localhost:27017');

    try {
        await client.connect();
        const db = client.db('teste');
        const selectionsCollection = db.collection('selections');
        const transactionsCollection = db.collection('transactions');

        // 1. Get all purchase lots for the user
        const allPlans = await selectionsCollection.find({ username }).sort({ timestamp: 'asc' }).toArray();
        if (!allPlans.length) {
            return res.status(404).json({ message: 'No portfolio found for this user.' });
        }

        // Aggregate all lots from all plans into a single structure
        let allLots = {};
        allPlans.forEach(plan => {
            if (!plan.purchases) return;
            for (const [type, assets] of Object.entries(plan.purchases)) {
                if (!allLots[type]) allLots[type] = [];
                assets.forEach(asset => allLots[type].push({ ...asset, timestamp: plan.timestamp }));
            }
        });
        
        const transactionId = new (require('mongodb').ObjectId)();
        let totalRealizedGain = 0;

        // 2. Process each item to sell using FIFO
        for (const item of itemsToSell) {
            let unitsToSell = item.units;
            const lotKey = getLotKeyFromDisplayType(item.type, allLots);
            
            if (!lotKey || !allLots[lotKey]) {
                console.warn(`No lots found for asset type: ${item.type}`);
                continue;
            }

            const assetLots = allLots[lotKey]
                .filter(lot => lot.name === item.name)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            for (const lot of assetLots) {
                if (unitsToSell <= 0) break;
                
                const availableUnits = lot.units || 0;
                const sellableUnits = Math.min(unitsToSell, availableUnits);
                
                if (sellableUnits > 0) {
                    const purchasePrice = lot.price || lot.nav || 0;
                    const currentPrice = item.amount / item.units;
                    totalRealizedGain += (currentPrice - purchasePrice) * sellableUnits;
                    lot.units -= sellableUnits;
                    unitsToSell -= sellableUnits;
                }
            }
        }
        
        // 3. Create the new portfolio state from remaining lots
        // --- FIX: Always preserve all original purchase types and structure, including FDs ---
        const originalPurchases = allPlans.length > 0 ? allPlans[allPlans.length - 1].purchases || {} : {};
        const newPurchases = {};
        // For each type in original purchases, preserve structure
        for (const type of Object.keys(originalPurchases)) {
            const lots = allLots[type] || [];
            const remainingLots = lots.filter(lot => {
                // For FD, keep all original FDs unless they were sold (units===0 or missing fields)
                if (type === 'fd') return lot.amount > 0 || lot.maturity > 0;
                // For others, keep if units > 1e-8
                return (lot.units || 0) > 1e-8;
            });
            // If nothing left, keep as empty array to preserve type
            newPurchases[type] = remainingLots.length > 0 ? remainingLots.map(lot => {
                // Remove the timestamp field added for FIFO logic
                const { timestamp, ...rest } = lot;
                return rest;
            }) : [];
        }
        
        // 4. Atomically replace the user's portfolio
        await selectionsCollection.deleteMany({ username });
        
        // --- FIX: Copy all fields from the latest plan except _id, purchases, timestamp, and source ---
        const latestPlan = allPlans[allPlans.length - 1] || {};
        const newPortfolioState = {
            ...latestPlan,
            purchases: newPurchases,
            timestamp: new Date(),
            source: 'consolidated-portfolio-state',
        };
        delete newPortfolioState._id; // Let MongoDB generate a new _id
        
        if (Object.keys(newPurchases).length > 0) {
            await selectionsCollection.insertOne(newPortfolioState);
        }

        // 5. Log the sell transaction separately
        const transactionRecord = {
            _id: transactionId,
            username,
            type: 'sell',
            items: itemsToSell,
            realizedGain: totalRealizedGain,
            timestamp: newPortfolioState.timestamp
        };
        await transactionsCollection.insertOne(transactionRecord);

        // --- NEW: Force reload of asset manager data from DB after sale ---
        // Helper to reload asset manager data from DB
        async function reloadAssetManagerFromDB(type) {
            if (!managers[type]) return;
            let dbData = {};
            if (type === 'stocks') dbData = await getStocksFromMongo();
            else if (type === 'mutualfunds') dbData = await getMutualFundsFromMongo();
            else if (type === 'etfs') dbData = await getEtfsFromMongo();
            else if (type === 'crypto') dbData = await getCryptoFromMongo();
            else if (type === 'fd') dbData = await getFdFromMongo();
            else if (type === 'reits') dbData = await getReitsFromMongo();
            managers[type].data = dbData;
        }
        // Reload all asset managers
        await Promise.all([
            reloadAssetManagerFromDB('stocks'),
            reloadAssetManagerFromDB('mutualfunds'),
            reloadAssetManagerFromDB('etfs'),
            reloadAssetManagerFromDB('crypto'),
            reloadAssetManagerFromDB('fd'),
            reloadAssetManagerFromDB('reits')
        ]);

        res.json({ success: true, message: 'Sell transaction completed successfully.', transactionId: transactionId.toHexString() });

    } catch (error) {
        console.error('Error during sell transaction:', error);
        res.status(500).json({ message: error.message || 'Server error during sell transaction.' });
    } finally {
        await client.close();
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running at http://localhost:${CONFIG.PORT}`);
  
  // Add countdown timer
  let timeLeft = CONFIG.UPDATE_INTERVAL / 1000; // Convert to seconds
  console.log(`⏰ Next update in: ${timeLeft} seconds`);
  
  setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      timeLeft = CONFIG.UPDATE_INTERVAL / 1000;
    }
    process.stdout.write(`\r⏰ Next update in: ${timeLeft} seconds`);
  }, 1000);
});

// Dummy target allocation data (replace with DB lookup if needed)
const defaultTargetAllocation = {
  "Stocks": 40,
  "Mutual Funds": 30,
  "ETFs": 10,
  "Crypto": 5,
  "Fixed Deposits": 10,
  "REITs": 5
};

app.get('/api/target-allocation', (req, res) => {
  const username = req.query.username;
  // TODO: Lookup user-specific allocation from DB if available
  // For now, always return the default
  res.json(defaultTargetAllocation);
});

// --- Get user profile by username/phone/email ---
app.get('/api/user-profile', async (req, res) => {
    const { loginId } = req.query;
    if (!loginId) {
        return res.status(400).json({ message: 'loginId is required.' });
    }
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        // Find by phone (_id), username, or email
        const user = await collection.findOne({
            $or: [
                { _id: loginId },
                { phone: loginId },
                { username: loginId },
                { email: loginId }
            ]
        });
        await client.close();
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Do not return password
        const { firstName, lastName, phone, email, username } = user;
        res.json({ firstName, lastName, phone, email, username });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user profile.' });
    }
});

// --- Change user password ---
app.post('/api/change-password', async (req, res) => {
    const { loginId, currentPassword, newPassword } = req.body;
    if (!loginId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        // Find user by loginId
        const user = await collection.findOne({
            $or: [
                { _id: loginId },
                { phone: loginId },
                { username: loginId },
                { email: loginId }
            ]
        });
        if (!user) {
            await client.close();
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.password !== currentPassword) {
            await client.close();
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }
        // Update password
        await collection.updateOne(
            { _id: user._id },
            { $set: { password: newPassword } }
        );
        await client.close();
        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating password.' });
    }
});

// --- API endpoint to get recent transactions for a user ---
app.get('/api/recent-transactions', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('teste');
        const collection = db.collection('wallet');
        // Find the latest 5 transactions for this user, sorted by date descending
        const transactions = await collection.find({ username })
            .sort({ date: -1 })
            .limit(5)
            .toArray();
        res.json({ transactions });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recent transactions.' });
    } finally {
        await client.close();
    }
});
