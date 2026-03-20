#!/usr/bin/env node
/**
 * Database initialization script for Chat System
 * Usage: node scripts/init-db.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'db');
const dbPath = path.join(dbDir, 'chat.db');

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✅ Created directory: ${dbDir}`);
}

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log(`✅ Connected to database: ${dbPath}`);
  initializeSchema();
});

function initializeSchema() {
  db.serialize(() => {
    // Drop existing tables (optional - remove this line for production)
    // db.run('DROP TABLE IF EXISTS chat_message');
    // db.run('DROP TABLE IF EXISTS chat_session');

    // Create chat_session table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_session (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, function(err) {
      if (err) {
        console.error('❌ Error creating chat_session table:', err);
        process.exit(1);
      }
      console.log('✅ chat_session table created');
    });

    // Create chat_message table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_message (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT,
        role TEXT NOT NULL CHECK(role IN ('user', 'ai', 'system')),
        content TEXT,
        sources TEXT,
        status TEXT DEFAULT 'success' CHECK(status IN ('success', 'error', 'loading')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(session_id) REFERENCES chat_session(id) ON DELETE CASCADE
      )
    `, function(err) {
      if (err) {
        console.error('❌ Error creating chat_message table:', err);
        process.exit(1);
      }
      console.log('✅ chat_message table created');
    });

    // Create indices for performance
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_chat_message_session_id 
      ON chat_message(session_id)
    `, function(err) {
      if (err) console.error('❌ Error creating index:', err);
      else console.log('✅ Index created: idx_chat_message_session_id');
    });

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_chat_message_created_at 
      ON chat_message(created_at)
    `, function(err) {
      if (err) console.error('❌ Error creating index:', err);
      else console.log('✅ Index created: idx_chat_message_created_at');
    });

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_chat_session_updated_at 
      ON chat_session(updated_at)
    `, function(err) {
      if (err) console.error('❌ Error creating index:', err);
      else console.log('✅ Index created: idx_chat_session_updated_at');
      
      // Summary
      setTimeout(() => {
        console.log('\n╔════════════════════════════════════════════════╗');
        console.log('║          数据库初始化完成                        ║');
        console.log('║  Tables: chat_session, chat_message              ║');
        console.log('╚════════════════════════════════════════════════╝\n');
        db.close();
      }, 1000);
    });
  });
}
