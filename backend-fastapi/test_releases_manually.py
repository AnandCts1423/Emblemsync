"""Manual test script for releases API - Run this to get test data"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_releases():
    """Get release data for manual testing"""
    
    print("🔐 Step 1: Login to get token")
    login_data = {
        "email": "admin@emblemhealth.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Got token: {token[:20]}...")
    
    print("\n🚀 Step 2: Get all releases")
    response = requests.get(f"{BASE_URL}/api/releases/", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Get releases failed: {response.text}")
        return
    
    releases = response.json()
    print(f"✅ Found {len(releases)} releases")
    
    if not releases:
        print("⚠️ No releases found. Run seed.py first!")
        return
    
    # Get first release for testing
    release = releases[0]
    print(f"\n📋 Test Release Data:")
    print(f"   ID: {release['id']}")
    print(f"   Version: {release['version']}")
    print(f"   Component ID: {release['component_id']}")
    print(f"   Released At: {release['released_at']}")
    print(f"   Notes: {release['notes']}")
    
    print(f"\n🧪 Step 3: Test Update Release {release['id']}")
    update_data = {
        "version": "2.0.1-updated",
        "notes": "Updated via API test - bug fixes and improvements"
    }
    
    response = requests.put(
        f"{BASE_URL}/api/releases/{release['id']}", 
        headers=headers,
        json=update_data
    )
    
    if response.status_code == 200:
        updated = response.json()
        print("✅ Update successful!")
        print(f"   New Version: {updated['version']}")
        print(f"   New Notes: {updated['notes']}")
        print(f"   Updated At: {updated.get('created_at', 'N/A')}")
    else:
        print(f"❌ Update failed!")
        print(f"   Status: {response.status_code}")
        print(f"   Error: {response.text}")
        
        # Parse error details
        try:
            error_data = response.json()
            print(f"   Error Detail: {error_data.get('detail', 'Unknown')}")
        except:
            pass
    
    print(f"\n🎯 Manual Test Commands:")
    print(f"   POST /api/auth/login")
    print(f"   Body: {json.dumps(login_data, indent=2)}")
    print(f"\n   PUT /api/releases/{release['id']}")
    print(f"   Headers: Authorization: Bearer YOUR_TOKEN")
    print(f"   Body: {json.dumps(update_data, indent=2)}")

if __name__ == "__main__":
    try:
        test_releases()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("\n⚠️ Make sure:")
        print("   1. Backend server is running (python main.py)")
        print("   2. Database is seeded (python seed.py)")
        print("   3. Install requests: pip install requests")
