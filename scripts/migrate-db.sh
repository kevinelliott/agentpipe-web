#!/bin/bash

# AgentPipe Web - Database Migration Script
# This script helps you run database migrations safely

set -e  # Exit on error

echo "🗄️  AgentPipe Web - Database Migration"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Please copy .env.example to .env and configure your database"
    exit 1
fi

# Source environment variables
set -a
source .env
set +a

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in .env"
    echo "   Please configure your database connection"
    exit 1
fi

# Detect database type
if [[ $DATABASE_URL == *"supabase"* ]]; then
    echo "🔍 Detected: Supabase database"
    DB_TYPE="supabase"
elif [[ $DATABASE_URL == *"localhost"* ]] || [[ $DATABASE_URL == *"127.0.0.1"* ]]; then
    echo "🔍 Detected: Local PostgreSQL"
    DB_TYPE="local"
else
    echo "🔍 Detected: External PostgreSQL"
    DB_TYPE="external"
fi

echo ""

# Show migration options
echo "Select migration type:"
echo "1) Create new migration (development)"
echo "2) Deploy migrations (production)"
echo "3) Push schema without migrations (quick setup)"
echo "4) Reset database (⚠️  DANGER: Deletes all data)"
echo "5) View migration status"
echo "6) Open Prisma Studio"
echo ""

read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo ""
        read -p "Enter migration name (e.g., 'add_user_table'): " migration_name
        echo "📝 Creating migration: $migration_name"
        npx prisma migrate dev --name "$migration_name"
        echo "✅ Migration created and applied"
        ;;
    2)
        echo ""
        echo "🚀 Deploying migrations to production..."

        if [ "$DB_TYPE" = "supabase" ]; then
            if [ -z "$DIRECT_URL" ]; then
                echo "⚠️  Warning: DIRECT_URL not set"
                echo "   Using DATABASE_URL for migration"
                echo "   For best results, set DIRECT_URL to session mode connection"
                echo ""
            fi
        fi

        npx prisma migrate deploy
        echo "✅ Migrations deployed successfully"
        ;;
    3)
        echo ""
        echo "⚡ Pushing schema to database..."
        echo "⚠️  This will modify your database without creating migration files"
        read -p "Continue? (y/n): " confirm

        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            npx prisma db push
            echo "✅ Schema pushed successfully"
        else
            echo "❌ Cancelled"
        fi
        ;;
    4)
        echo ""
        echo "⚠️  DANGER: This will delete ALL data in your database!"
        echo "   Database: $DATABASE_URL"
        echo ""
        read -p "Type 'RESET' to confirm: " confirm

        if [ "$confirm" = "RESET" ]; then
            echo "🗑️  Resetting database..."
            npx prisma migrate reset --force
            echo "✅ Database reset complete"
        else
            echo "❌ Cancelled"
        fi
        ;;
    5)
        echo ""
        echo "📊 Migration Status:"
        echo "===================="
        npx prisma migrate status
        ;;
    6)
        echo ""
        echo "🎨 Opening Prisma Studio..."
        echo "   View your database at http://localhost:5555"
        npx prisma studio
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Done!"
