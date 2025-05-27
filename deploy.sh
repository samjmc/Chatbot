#!/bin/bash
# Deployment script for Tableau Dashboard Assistant

echo "Preparing Tableau Dashboard Assistant for deployment..."

# Ensure Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js 20.x or higher."
    exit 1
fi

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Warning: OPENAI_API_KEY environment variable is not set."
    echo "You will need to set this in your server environment."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Create deployment package
echo "Creating deployment package..."
PACKAGE_NAME="tableau-dashboard-assistant-$(date +%Y%m%d%H%M%S).zip"

# Files to include in the package
zip -r "$PACKAGE_NAME" \
    dist/ \
    node_modules/ \
    public/ \
    server/ \
    shared/ \
    package.json \
    package-lock.json \
    README.md \
    tableau-dashboard-assistant.trex

echo "Deployment package created: $PACKAGE_NAME"
echo ""
echo "=== DEPLOYMENT INSTRUCTIONS ==="
echo "1. Upload $PACKAGE_NAME to your server"
echo "2. Unzip the package: unzip $PACKAGE_NAME"
echo "3. Set your OpenAI API key: export OPENAI_API_KEY=your_api_key"
echo "4. Start the server: npm start"
echo "5. The application will be available at http://your-server-address:5000"
echo ""
echo "=== TABLEAU INTEGRATION ==="
echo "1. Update the URL in tableau-dashboard-assistant.trex to point to your server"
echo "2. In Tableau Desktop, go to Dashboard > Extensions > Add Extension"
echo "3. Browse to the modified .trex file"
echo "4. Position the extension in your dashboard"
echo ""
echo "Deployment preparation complete!"