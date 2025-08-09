#!/usr/bin/env python3
"""
Test script to verify all FileAlchemy API endpoints are working correctly
"""

import requests
import json

def test_api():
    base_url = 'https://filealchemy-production.up.railway.app/api'
    
    print('🔍 Testing FileAlchemy API Endpoints...\n')
    
    # Test health endpoint
    try:
        response = requests.get(f'{base_url}/health')
        print(f'✅ Health Check: {response.status_code}')
        health_data = response.json()
        print(f'   Status: {health_data["status"]}')
        print(f'   Environment: {health_data["environment"]}')
        print(f'   Frontend Available: {health_data["frontend_available"]}')
        print(f'   Supported Formats: {health_data["supported_formats"]}')
    except Exception as e:
        print(f'❌ Health Check Failed: {e}')
    
    print()
    
    # Test formats endpoint
    try:
        response = requests.get(f'{base_url}/formats')
        print(f'✅ Formats Endpoint: {response.status_code}')
        formats_data = response.json()
        if formats_data["success"]:
            formats = formats_data["formats"]
            print(f'   Available Categories: {list(formats.keys())}')
            for category, data in formats.items():
                print(f'   {category.title()}: {len(data["input"])} input, {len(data["output"])} output formats')
    except Exception as e:
        print(f'❌ Formats Endpoint Failed: {e}')
    
    print('\n🎉 API Endpoints Test Complete!')

if __name__ == "__main__":
    test_api()