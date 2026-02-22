# 📍 User Location Tracking in Towing Map

## Overview
When users view their towing vehicle location on the map, they can now see their **real-time location** with a "My Location" button that fetches their GPS coordinates automatically.

## Features

### 🟢 Automatic Location Detection
- **On page load**: The app automatically requests your location permission
- **Real-time tracking**: Your location updates every 10 seconds
- **Blue "You" marker**: Shows your position on the map in real-time

### 📍 Manual Location Button
- **"My Location" button**: Tap to explicitly request your current location
- **Shows coordinates**: Displays your latitude and longitude on screen
- **Location badge**: Green status box shows your exact coordinates

### 🛣️ Directions to Depot
- **"Directions" button**: Get turn-by-turn route from your location to the vehicle depot
- **Route calculation**: Uses OSRM (OpenStreet Routing Machine)
- **Distance & time**: Shows estimated km and travel time
- **Live updates**: Recalculate route as you move

### ⚠️ Error Handling
- **Permission denied**: Clear message if you deny location access
- **Location unavailable**: Helpful error if GPS can't get position
- **Try again**: Button lets you retry if it fails

## How It Works for Users

### 1. **View Towing Location**
   - User logs in and views their towing vehicle details
   - Clicks on "Search Location" or "Map" tab
   - Map loads showing vehicle location (red marker)

### 2. **Map Appears**
   - Vehicle location shows as **red marker** (Towed To)
   - Original location shows as **white marker** (Towed From)
   - **Blue line** connects both locations

### 3. **Get Your Location**
   Option A: **Automatic**
   - App requests permission automatically
   - If allowed, your location loads when page appears
   - You see green badge with your coordinates

   Option B: **Manual**
   - Click **"📍 My Location"** button
   - Browser asks for permission (first time only)
   - Your location is fetched and displayed
   - Blue "You" marker appears on map

### 4. **Enable Location (Important!)**
   Browser will ask: *"Allow app to access your location?"*
   - **Allow**: You'll see your location on map
   - **Don't Allow**: You can still see vehicle location, but directions won't work
   - **Block**: Click button again to change permission in browser settings

### 5. **Get Directions**
   Once you have your location:
   - Click **"🛣️ Directions"** button
   - See route from you to the depot
   - View distance and estimated time
   - Blue route line shows the path

## Visual Guide

### Location Status Messages

**✅ Location Found**
```
Your Location: 19.0760°, 72.8777°
```
(Green background - location is active)

**⚠️ Permission Denied**
```
Location permission denied. Enable in browser settings.
```
(Amber background - need to enable permissions)

**⚠️ GPS Unavailable**
```
Unable to get your location. Try again.
```
(Amber background - try again later)

## Browser Permissions

### First Time?
Browser shows a prompt: *"Allow [app] to use your location?"*

### For Different Browsers:

**Chrome/Edge:**
1. Click button → Browser asks
2. Click "Allow" on the popup
3. Location enabled permanently

**Firefox:**
1. Click button → Browser asks
2. Click "Allow" on the bar at top
3. Location enabled permanently

**Safari (iOS/Mac):**
1. Settings → Privacy → Location Services
2. Find the app and select "While Using"
3. Refresh the page

### To Change Permissions Later:
1. Click address bar (Chrome/Edge)
2. See location icon on right
3. Click the icon
4. Change permission setting
5. Refresh page

## Privacy & Security

### What's Collected?
- Your latitude/longitude coordinates
- Only *you* can see your location
- Not shared with other users
- Not stored after you close the app

### What's NOT Collected?
- Your identity (unless you logged in)
- Your address or personal details
- Your browsing history
- Any other information

### How It's Used?
- Calculate directions to depot
- Show position on map
- Estimate travel time
- That's it!

## Technical Details

### Location API
- Uses **Geolocation API** (browser native)
- Watches position every 10 seconds
- Accuracy: ±5-20 meters (depends on GPS signal)

### Coordinates Format
- **Latitude** (N-S): -90 to +90 degrees
- **Longitude** (E-W): -180 to +180 degrees
- Example: `19.0760°, 72.8777°` (Mumbai)

### Routing Service
- **OSRM** (Open Source Routing Machine)
- Calculates driving routes
- Returns distance (meters) and time (seconds)
- Shows turn-by-turn path

## Troubleshooting

### Button doesn't work?
1. Check if location permission is granted
2. Ensure GPS/WiFi is on
3. Try moving outdoors for better signal
4. Refresh the page and try again

### Permission denied message?
1. Open browser settings
2. Find Location permissions
3. Change app permission to "Allow"
4. Refresh page

### Location says "Check permissions"?
- Browser location access is disabled
- Steps to enable:
  - Chrome: Settings → Privacy & Security → Site Settings → Location
  - Firefox: Preferences → Privacy → Permissions → Location
  - Click "Allow" when prompted next time

### Coordinates not updating?
1. Wait 10-30 seconds (refresh interval)
2. Move around to trigger update
3. Check if location permission is active
4. Try again with location button

## Examples

### Example 1: Finding Your Way to Depot
```
Scenario: Your car was towed to City Central Depot

Steps:
1. You open the app and see map
2. Red marker shows: "City Central Depot, Gate No. 3"
3. Click "📍 My Location" button
4. Your location appears: "19.0760°, 72.8777°" (Andheri)
5. Click "🛣️ Directions"
6. Route shows: 15 km, ~25 minutes drive
7. Follow the blue line on map
8. You reach the depot!
```

### Example 2: Automatic Location Detection
```
Scenario: You allow location permissions when first using app

What happens:
1. You open towing map
2. Browser asks "Allow location access?"
3. You click "Allow"
4. Your location automatically loads
5. Green badge shows your coordinates
6. Blue "You" marker appears on map
7. Next time, it loads automatically without asking
```

## FAQ

**Q: Will this drain my battery?**
A: Minimal impact. Real-time tracking uses low-power GPS, updates every 10 seconds.

**Q: Is my location being tracked after I leave?**
A: No. It only works while you have the page open. Closes when you leave.

**Q: Can other users see my location?**
A: No. Only you can see your location on your own map.

**Q: Does it work offline?**
A: No. Requires internet for map tiles and routing service.

**Q: How accurate is the GPS?**
A: Typically 5-20 meters accuracy. Can be less accurate indoors or in cities with tall buildings.

**Q: Can I share my location with someone?**
A: Not currently. Future version might allow sharing with admin.

---

## Future Enhancements

Possible improvements in future versions:
1. **Share location** with admin temporarily
2. **Save favorite depots** for quick access
3. **Offline map cache** for areas without internet
4. **Alternate routes** option
5. **Real-time traffic** information
6. **Parking location** recommendations

---

**Status:** ✅ Fully implemented
**Branch:** `development`
**Tested:** Yes
**Browser Support:** All modern browsers (Chrome, Firefox, Safari, Edge)
