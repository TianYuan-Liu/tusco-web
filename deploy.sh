#!/bin/bash

# TUSCO Web Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting TUSCO Web deployment..."

# Configuration
APP_NAME="tusco-web"
APP_DIR="/home/tian/$APP_NAME"
SERVICE_NAME="tusco-web"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as correct user
if [ "$USER" != "tian" ]; then
    print_error "This script should be run as user 'tian'"
    exit 1
fi

print_status "Updating system packages..."
sudo apt update

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
else
    print_status "PM2 already installed: $(pm2 --version)"
fi

# Create application directory
if [ ! -d "$APP_DIR" ]; then
    print_status "Creating application directory..."
    mkdir -p "$APP_DIR"
fi

cd "$APP_DIR"

# Clone or update repository
if [ ! -d ".git" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/TianYuan-Liu/tusco-web.git .
else
    print_status "Updating repository..."
    git pull origin main
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production

# Build the React application
print_status "Building React application..."
npm run build

# Create logs directory
mkdir -p logs

# Copy Apache configuration
print_status "Setting up Apache configuration..."
sudo cp apache-config/tusco-web.conf /etc/apache2/sites-available/
sudo a2ensite tusco-web.conf

# Enable required Apache modules
sudo a2enmod ssl rewrite headers proxy proxy_http deflate expires

# Test Apache configuration
sudo apache2ctl configtest

# Stop existing PM2 process if running
if pm2 list | grep -q "$SERVICE_NAME"; then
    print_status "Stopping existing application..."
    pm2 stop "$SERVICE_NAME"
    pm2 delete "$SERVICE_NAME"
fi

# Start application with PM2
print_status "Starting application..."
pm2 start ecosystem.config.js

# Save PM2 configuration and setup startup
pm2 save
pm2 startup | tail -1 | sudo sh

# Restart Apache
print_status "Restarting Apache..."
sudo systemctl reload apache2

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/tusco-web > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create a simple health check script
cat > healthcheck.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ $response == "200" ]; then
    echo "✓ TUSCO Web is healthy"
    exit 0
else
    echo "✗ TUSCO Web health check failed (HTTP $response)"
    exit 1
fi
EOF

chmod +x healthcheck.sh

print_status "Deployment completed successfully!"
print_status "Application is running on: https://tusco.uv.es"
print_status "Health check: ./healthcheck.sh"
print_status "View logs: pm2 logs $SERVICE_NAME"
print_status "Monitor app: pm2 monit"

# Final health check
sleep 5
if ./healthcheck.sh; then
    print_status "✅ Deployment verification passed!"
else
    print_error "❌ Deployment verification failed. Check logs with: pm2 logs"
    exit 1
fi