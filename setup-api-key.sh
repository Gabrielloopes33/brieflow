#!/bin/bash

# Quick Setup Script for BriefFlow VPS with OpenAI API Key
echo "🔧 BriefFlow - Quick Setup with OpenAI API Key"
echo "============================================="

# OpenAI API Key - you will be prompted to enter it
echo "Please enter your OpenAI API key:"
read -s OPENAI_API_KEY
echo ""

echo "📝 Configuring OpenAI API Key..."

# Update .env file with API key
sed -i "s|OPENAI_API_KEY=your_openai_api_key_here|OPENAI_API_KEY=$OPENAI_API_KEY|g" .env

echo "✅ OpenAI API Key configured successfully!"

# Pull latest changes
echo ""
echo "📥 Pulling latest changes from GitHub..."
git pull github main

echo ""
echo "🚀 Now run the fix script:"
echo "   chmod +x fix-backend-v2.sh"
echo "   ./fix-backend-v2.sh"
echo ""
echo "🌐 Your API key will be automatically used!"