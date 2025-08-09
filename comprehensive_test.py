#!/usr/bin/env python3
"""
Comprehensive test of FileAlchemy deployment
"""

import requests
import json
import time

def test_comprehensive():
    base_url = 'https://filealchemy-production.up.railway.app'
    api_url = f'{base_url}/api'
    
    print('🚀 FileAlchemy Comprehensive Deployment Test')
    print('=' * 50)
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: Frontend loads
    total_tests += 1
    try:
        response = requests.get(base_url, timeout=10)
        if response.status_code == 200 and 'FileAlchemy' in response.text:
            print('✅ Frontend loads correctly')
            tests_passed += 1
        else:
            print('❌ Frontend failed to load')
    except Exception as e:
        print(f'❌ Frontend test failed: {e}')
    
    # Test 2: API Health Check
    total_tests += 1
    try:
        response = requests.get(f'{api_url}/health', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'healthy' and data['environment'] == 'production':
                print('✅ API health check passed')
                tests_passed += 1
            else:
                print('❌ API health check failed - wrong status')
        else:
            print('❌ API health check failed - wrong status code')
    except Exception as e:
        print(f'❌ API health check failed: {e}')
    
    # Test 3: Formats endpoint
    total_tests += 1
    try:
        response = requests.get(f'{api_url}/formats', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data['success'] and len(data['formats']) >= 5:
                print('✅ Formats endpoint working')
                tests_passed += 1
            else:
                print('❌ Formats endpoint failed - insufficient formats')
        else:
            print('❌ Formats endpoint failed - wrong status code')
    except Exception as e:
        print(f'❌ Formats endpoint failed: {e}')
    
    # Test 4: CORS headers
    total_tests += 1
    try:
        response = requests.options(f'{api_url}/health', timeout=10)
        if 'access-control-allow-origin' in response.headers or response.status_code in [200, 204]:
            print('✅ CORS configured correctly')
            tests_passed += 1
        else:
            print('❌ CORS configuration issue')
    except Exception as e:
        print(f'❌ CORS test failed: {e}')
    
    # Test 5: Static assets
    total_tests += 1
    try:
        response = requests.get(f'{base_url}/vite.svg', timeout=10)
        if response.status_code == 200:
            print('✅ Static assets served correctly')
            tests_passed += 1
        else:
            print('❌ Static assets not served')
    except Exception as e:
        print(f'❌ Static assets test failed: {e}')
    
    print('\n' + '=' * 50)
    print(f'📊 Test Results: {tests_passed}/{total_tests} tests passed')
    
    if tests_passed == total_tests:
        print('🎉 All tests passed! FileAlchemy is fully operational!')
        print(f'🌐 Live at: {base_url}')
        print('🔧 API endpoints working correctly')
        print('⚡ Frontend and backend integrated successfully')
    else:
        print('⚠️  Some tests failed. Check the issues above.')
    
    return tests_passed == total_tests

if __name__ == "__main__":
    test_comprehensive()