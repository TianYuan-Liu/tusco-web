# TUSCO Web Deployment Guide

This guide covers deploying the TUSCO Web application to an Ubuntu server with Apache and SSL certificates.

## Server Requirements

- Ubuntu server with sudo access
- User: `tian` with sudo permissions
- SSL certificates stored in `/etc/certificate/`
- Firewall configured for ports: HTTP (80), HTTPS (443), SSH (22), and 3001/tcp
- SSH access from UV domain network (147.156.*)

## Pre-deployment Steps

### 1. Push Code to GitHub

```bash
# Initialize git repository (if not done)
git init
git add .
git commit -m "Initial commit - TUSCO Web application"

# Add remote repository
git remote add origin https://github.com/yourusername/tusco-web.git
git push -u origin main
```

### 2. Generate SSH Key (Local Machine)

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key content
cat ~/.ssh/id_rsa.pub
```

Send the public key content to the server administrator to add to `/home/tian/.ssh/authorized_keys`.

## Server Deployment

### 1. Connect to Server

```bash
ssh tian@tusco.uv.es
```

### 2. Run Deployment Script

```bash
# Clone the repository
git clone https://github.com/yourusername/tusco-web.git
cd tusco-web

# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 3. Verify SSL Certificate Paths

Ensure your SSL certificates are correctly placed:

```bash
sudo ls -la /etc/certificate/
# Should show:
# tusco.uv.es.crt (public certificate)
# tusco.uv.es.key (private key)
```

### 4. Manual Steps (if needed)

If the deployment script encounters issues:

#### Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install PM2
```bash
sudo npm install -g pm2
```

#### Apache Configuration
```bash
# Copy Apache configuration
sudo cp apache-config/tusco-web.conf /etc/apache2/sites-available/

# Enable site and modules
sudo a2ensite tusco-web.conf
sudo a2enmod ssl rewrite headers proxy proxy_http deflate expires

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl reload apache2
```

#### Start Application
```bash
# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Application Management

### PM2 Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs tusco-web

# Monitor resources
pm2 monit

# Restart application
pm2 restart tusco-web

# Stop application
pm2 stop tusco-web

# Delete application
pm2 delete tusco-web
```

### Health Check

```bash
# Run health check
./healthcheck.sh

# Manual health check
curl http://localhost:3001/api/health
```

### Log Locations

- Application logs: `/home/tian/tusco-web/logs/`
- Apache logs: `/var/log/apache2/tusco-web_*.log`
- PM2 logs: `~/.pm2/logs/`

## Troubleshooting

### Common Issues

1. **Port 3001 not accessible externally**
   - Check firewall: `sudo ufw status`
   - Verify Apache proxy configuration

2. **SSL certificate errors**
   - Verify certificate paths in Apache config
   - Check certificate permissions: `sudo chmod 644 /etc/certificate/tusco.uv.es.crt`
   - Check key permissions: `sudo chmod 600 /etc/certificate/tusco.uv.es.key`

3. **Application won't start**
   - Check logs: `pm2 logs tusco-web`
   - Verify Node.js version: `node --version`
   - Check file permissions

4. **GTF files not loading**
   - Verify data directory exists: `ls -la data/`
   - Check file permissions: `chmod -R 755 data/`

### Service Commands

```bash
# Apache
sudo systemctl status apache2
sudo systemctl restart apache2
sudo systemctl reload apache2

# Check Apache configuration
sudo apache2ctl configtest

# PM2
pm2 status
pm2 restart all
pm2 reload all
```

## Security Considerations

- SSL certificates are properly configured with modern cipher suites
- Security headers are set in Apache configuration
- Application runs with limited permissions
- Log rotation is configured to prevent disk space issues
- CORS is configured for production domains only

## Backup Strategy

1. **Application Code**: Stored in GitHub repository
2. **Data Files**: GTF files in `data/` directory should be backed up regularly
3. **SSL Certificates**: Backup certificates from `/etc/certificate/`
4. **Configuration**: Apache configuration in `/etc/apache2/sites-available/`

## Updates

To update the application:

```bash
cd /home/tian/tusco-web
git pull origin main
npm ci --production
npm run build
pm2 restart tusco-web
```

For major updates, re-run the deployment script:

```bash
./deploy.sh
```