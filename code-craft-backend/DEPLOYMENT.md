# Backend Deployment Configuration for Render

## Important: Production Commands

This backend is configured to use:
- **Development**: `npm run dev` (uses nodemon with TypeScript)
- **Production**: `npm start` (runs compiled JavaScript)

## Render Configuration

When setting up your backend service on Render, use these settings:

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

This will:
1. Install dependencies
2. Compile TypeScript to JavaScript (`npm run build`)
3. Run the production server using `npm start` which executes `node dist/server.js`

## Environment Variables

Set these in your Render service:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

## Manual Setup in Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: code-craft-backend
   - **Root Directory**: code-craft-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Click "Create Web Service"

## Verifying the Deployment

After deployment, your backend will:
1. Install all dependencies
2. Compile TypeScript files to JavaScript in the `dist` folder
3. Start the server using `npm start` (which runs `node dist/server.js`)

## Common Issues

### If Render tries to use `npm run dev`:
- Double-check the Start Command is set to `npm start`
- Ensure you're not overriding it in any Render configuration files

### If TypeScript compilation fails:
- Make sure all TypeScript dependencies are in `dependencies` not `devDependencies`
- Or keep them in `devDependencies` but ensure the build command runs before start

### Port Configuration:
- Render automatically sets the PORT environment variable
- Your server should use `process.env.PORT || 5000`
