# MongoDB Setup Guide

## MongoDB Atlas (Cloud) Setup

### Step 1: Get Connection String from MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Login to your account
3. Click on "Connect" button for your cluster
4. Choose "Connect your application"
5. Copy the connection string (it will look like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/certificates_db?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database password

### Step 2: Update .env File

Add this line to your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:your_password@cluster0.xxxxx.mongodb.net/certificates_db?retryWrites=true&w=majority
```

**Important**: Replace:
- `username` with your MongoDB Atlas username
- `your_password` with your MongoDB Atlas password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

### Step 3: Allow Network Access

1. In MongoDB Atlas, go to "Network Access"
2. Add your IP address (or 0.0.0.0/0 for all IPs - less secure)
3. Click "Add IP Address"

## Local MongoDB Setup

If you prefer to use local MongoDB:

### Install MongoDB

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb
```

**Mac:**
```bash
brew install mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
```

### Start MongoDB

**Windows:**
```bash
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongodb
# or
brew services start mongodb-community
```

### Update .env File

```env
MONGODB_URI=mongodb://localhost:27017/certificates_db
```

## Verify Connection

After setting up, restart your server:

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB: mongodb://...
✅ Database initialized successfully
```

