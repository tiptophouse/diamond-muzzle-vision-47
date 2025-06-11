
#!/bin/bash

echo "🐳 Docker Debug Script"
echo "====================="

echo "📋 Checking Docker containers status..."
docker-compose ps

echo ""
echo "📋 Checking backend container logs..."
docker-compose logs backend --tail=50

echo ""
echo "📋 Checking database container logs..."
docker-compose logs database --tail=20

echo ""
echo "📋 Testing database connection..."
docker-compose exec database pg_isready -U postgres

echo ""
echo "📋 Testing backend health (if running)..."
curl -f http://localhost:8000/health || echo "Backend health check failed"

echo ""
echo "📋 Checking network connectivity..."
docker network ls | grep release

echo ""
echo "🔧 Suggested fixes:"
echo "1. Check backend logs above for startup errors"
echo "2. Ensure all environment variables are set correctly"
echo "3. Verify database is healthy before starting backend"
echo "4. Check if ports 8000 and 5432 are available"
echo ""
echo "To restart containers: docker-compose down && docker-compose up -d"
echo "To rebuild: docker-compose build --no-cache"
