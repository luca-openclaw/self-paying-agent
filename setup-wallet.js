#!/usr/bin/env node
/**
 * Wallet Setup Script
 * 
 * Creates a Sui wallet for the agent
 * Usage: node setup-wallet.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_FILE = path.join(__dirname, 'config', 'wallet.json');

console.log('🔐 Self-Paying Agent - Wallet Setup\n');

// Check if Sui CLI is installed
try {
  const version = execSync('sui --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Sui CLI found: ${version}`);
} catch (err) {
  console.error('❌ Sui CLI not found. Please install first:');
  console.error('   curl -fsSL https://install.sui.io | sh');
  process.exit(1);
}

// Check if wallet already exists
if (fs.existsSync(CONFIG_FILE)) {
  console.log('⚠️  Wallet already exists at:', CONFIG_FILE);
  console.log('   Delete it first if you want to create a new one.\n');
  
  const existing = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  console.log('📋 Existing wallet:');
  console.log('   Address:', existing.address);
  console.log('   Network:', existing.network);
  process.exit(0);
}

// Create config directory
if (!fs.existsSync(path.dirname(CONFIG_FILE))) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
}

console.log('\n📝 Creating new wallet...\n');

// For now, create a placeholder that the user fills in
// In production, this would use Sui SDK to generate keys
const walletConfig = {
  network: 'testnet',
  address: null, // User fills this in
  privateKey: null, // User fills this in (or use keyfile)
  createdAt: new Date().toISOString(),
  funded: false,
  fundTransaction: null
};

fs.writeFileSync(CONFIG_FILE, JSON.stringify(walletConfig, null, 2));

console.log('✅ Wallet config created at:', CONFIG_FILE);
console.log('\n⚠️  IMPORTANT: You need to:');
console.log('   1. Create a Sui wallet using the CLI or Sui Wallet browser extension');
console.log('   2. Get testnet SUI from the faucet:');
console.log('      sui client faucet');
console.log('   3. Update config/wallet.json with your address');
console.log('   4. Never commit private keys to git!');
console.log('\n🚀 After funding, start the agent with:');
console.log('   npm run start');
