# Tableau Dashboard Assistant

A smart AI-powered chatbot that helps users understand their Tableau dashboards by providing explanations, insights, and answering questions about data visualizations.

## Features

- Interactive chat interface for Tableau dashboards
- OpenAI-powered responses with dashboard context awareness
- Retrieval-Augmented Generation (RAG) for enhanced explanations
- Configurable settings and responsive design
- Support for dashboard filters and selections

## Installation & Deployment

### Prerequisites

- Node.js 20.x or higher
- OpenAI API key
- Tableau Server (for integration)

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/tableau-dashboard-assistant.git
cd tableau-dashboard-assistant
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**

Create a `.env` file in the root directory with:

```
OPENAI_API_KEY=your_openai_api_key
```

4. **Build the application**

```bash
npm run build
```

5. **Start the server**

```bash
npm start
```

The application will be available at `http://localhost:5000`

## Integration with Tableau

### Option 1: Tableau Extension

1. Create a Tableau Extension manifest file (`tableau-dashboard-assistant.trex`):

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest manifest-version="0.1" xmlns="http://www.tableau.com/xml/extension_manifest">
  <dashboard-extension id="com.example.tableau-dashboard-assistant" extension-version="1.0.0">
    <default-locale>en_US</default-locale>
    <name resource-id="name">Tableau Dashboard Assistant</name>
    <description>AI-powered dashboard explanation assistant</description>
    <author name="Your Name" email="your.email@example.com" organization="Your Company" website="https://example.com"/>
    <min-api-version>1.7</min-api-version>
    <source-location>
      <url>https://your-server-address:5000</url>
    </source-location>
    <icon>iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlhJREFUOI2Nkt9vy1EYh5/3bbsvRSySCZbIxI+ZCKsN2TKtSFyIrV2WuRCJuBiJWxfuxCVXbvwFgiEtposgLFJElnbU1SxIZIIRJDKTrdu+53Uhra4mce7Oe57Pcz7JOULFisViwZ+29LAzOSjQYDgz1ZcCvWuXV11MJpN+OS/lm6179teqH0yDqxPTCyKSA8DcDsyOmOprnCaeP7459pdgy969i0LTC3IO/RQMyoHcQN+3cnljW3dNIFC47qDaK3g7BwdTkwBaBELT4ZPOUVWgKl4ZBnjxJPUlMDnTDrp0pmr6RHFeEjjcUUXPDGeSEwDN0Xg8sivxMhJNjGzbHd8PkM3eHRfkrBM5NkcQaY2vUnTlrDIA0NoaX+KLXFFlowr14tvVpqb2MICzmQcKqxvbumv+NAhZGCCIPwEw6QWXKYRL/VUXO0+rAUJiPwAk5MIlgVfwPjjHLCL1APmHN94ZdqeYN+NW/mn6I4BvwQYchcLnwFhJMDiYmlRxAzjpKWZkYkUCcZ2I61wi37tLbYyjiN0fHk5Oz3nGSLSzBbNHCF35R7f6K1/hN9PRhek11FrymfQQQKB4+Gl05P2qNRtmETlXW7e+b2z01dfycGNbfFMAbqNyKp9Jp4rzOT8RYFs0njJkc2iqsCObvTsOsDWWqA5C1uFy+Uz/oXJeKwVT4h0RmPUXhi79vuC0Ku6yOffTK3g9lfxfDQAisY516sg5kfOCiJk7HoLt2cf9b/9LANAc7dznm98PagG1fUOZ9IP5uMB8Q4CPoyNvausapkTt3rNMuvdf3C/o6+czhtdwmwAAAABJRU5ErkJggg==</icon>
    <permissions>
      <permission>full data</permission>
    </permissions>
  </dashboard-extension>
</manifest>
```

2. In Tableau Desktop:
   - Go to Dashboard > Extensions > Add Extension
   - Browse to your `.trex` file
   - Position the extension in your dashboard

### Option 2: Web Object (iFrame) Integration

If you can't use the Extensions API, you can embed the assistant as a web object:

1. In Tableau Desktop:
   - Go to Dashboard > Objects
   - Drag a "Web Page" object onto your dashboard
   - Enter the URL of your deployed assistant (e.g., `https://your-server-address:5000`)

## Server Deployment Recommendations

For production deployment, you have several options:

### 1. Traditional Server Deployment

- Deploy on an on-premises server or VM
- Use PM2 or similar for process management
- Set up Nginx/Apache as a reverse proxy
- Configure SSL certificates

Example Nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Docker Deployment

You can containerize the application for easier deployment:

1. Create a Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

2. Build and run the Docker container:

```bash
docker build -t tableau-dashboard-assistant .
docker run -p 5000:5000 -e OPENAI_API_KEY=your_api_key tableau-dashboard-assistant
```

### 3. Cloud Deployment (AWS, Azure, GCP)

Deploy to cloud platforms using their respective services:

- AWS: Elastic Beanstalk, ECS, or EC2
- Azure: App Service or Container Instances
- GCP: App Engine or Cloud Run

## Security Considerations

1. Always use HTTPS for production deployments
2. Store API keys securely (environment variables or secrets manager)
3. Implement authentication if needed
4. Consider rate limiting to prevent API abuse

## Customization

You can customize the assistant by:

1. Modifying the system prompt in `server/lib/openai.ts`
2. Adding domain-specific documentation for RAG
3. Customizing the UI components
4. Adjusting the embedding and retrieval parameters

## Troubleshooting

If you encounter issues:

1. Check server logs for errors
2. Verify API key is valid and has sufficient credits
3. Ensure proper network connectivity
4. For Tableau integration issues, check browser console logs