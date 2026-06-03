#!/bin/bash

# Mobile POS System - Automated Setup Script
# This script sets up the entire development environment

set -e

echo "🚀 Mobile POS System - Automated Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo -e "${BLUE}📝 Creating .env file from template...${NC}"
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""

# Generate secrets if not set
echo -e "${BLUE}🔐 Checking environment secrets...${NC}"

if command -v openssl &> /dev/null; then
    # Check if NEXTAUTH_SECRET needs to be generated
    if grep -q "NEXTAUTH_SECRET=\"\"" .env || grep -q "NEXTAUTH_SECRET=\"generate" .env; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        sed -i.bak "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"|" .env
        echo -e "${GREEN}✓ Generated NEXTAUTH_SECRET${NC}"
    fi
    
    # Check if ENCRYPTION_KEY needs to be generated
    if grep -q "ENCRYPTION_KEY=\"\"" .env || grep -q "ENCRYPTION_KEY=\"your-32" .env; then
        ENCRYPTION_KEY=$(openssl rand -hex 16)
        sed -i.bak "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"|" .env
        echo -e "${GREEN}✓ Generated ENCRYPTION_KEY${NC}"
    fi
    
    # Clean up backup file
    rm -f .env.bak
else
    echo -e "${YELLOW}⚠ OpenSSL not found. Please manually set NEXTAUTH_SECRET and ENCRYPTION_KEY in .env${NC}"
fi

echo ""

# Check DATABASE_URL
if grep -q "DATABASE_URL=\"postgresql://user:password@localhost" .env; then
    echo -e "${YELLOW}⚠ Default DATABASE_URL detected${NC}"
    echo -e "${YELLOW}  Please update DATABASE_URL in .env with your PostgreSQL connection string${NC}"
    echo ""
    read -p "Do you want to continue with default database URL? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Please update .env and run this script again${NC}"
        exit 0
    fi
fi

echo ""

# Generate Prisma Client
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Ask if user wants to run migrations
echo -e "${YELLOW}⚠ Database migrations will be applied${NC}"
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"
    npx prisma migrate deploy
    echo -e "${GREEN}✓ Migrations applied${NC}"
    echo ""
    
    # Ask if user wants to seed data
    read -p "Do you want to seed demo data? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🌱 Seeding database...${NC}"
        npx prisma db seed
        echo -e "${GREEN}✓ Database seeded with demo data${NC}"
        echo ""
        echo -e "${GREEN}Demo Login Credentials:${NC}"
        echo -e "  Email: ${BLUE}owner@mobilepos.com${NC}"
        echo -e "  Password: ${BLUE}password123${NC}"
        echo -e "  Tenant: ${BLUE}demo-shop${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Review .env file and update DATABASE_URL if needed"
echo "  2. Run: ${GREEN}npm run dev${NC}"
echo "  3. Open: ${BLUE}http://localhost:3000${NC}"
echo "  4. Login with demo credentials above"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "  - Quick Start: ./QUICKSTART.md"
echo "  - Full README: ./README.md"
echo "  - Deployment: ./DEPLOYMENT.md"
echo ""
echo -e "${GREEN}Happy repairing! 🔧📱${NC}"
