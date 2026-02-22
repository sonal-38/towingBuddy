# ⏱️ Time-Based Location Reveal - Towing Map Feature

## Overview
Users now see a **progressive location disclosure system** when viewing their towed vehicle. The system reveals locations at specific time intervals with a countdown timer, alerts, and helpful guidance.

## Timeline System

### **Phase 1: 0-10 Minutes**
- **What User Sees:**
  - 📍 "Towed From" location only (where vehicle was picked up)
  - White marker on map
  - ⏱️ Timer counting from 0:00 onwards
  - Status: "Showing: Towed From"

- **User Can Do:**
  - View where vehicle was towed from
  - Enable location services
  - See their own location on map
  - NOT see the depot location yet

### **Phase 2: 10-15 Minutes**
- **What User Sees:**
  - 📍 Both "Towed From" AND "Towed To" locations
  - White marker for "Towed From"
  - Red marker for "Towed To" (Depot)
  - Status: "Transition: Both Locations"
  - Orange warning badge appears

- **User Can Do:**
  - See both locations
  - Start getting directions
  - Plan their route to the depot

### **Phase 3: After 15 Minutes**
- **What User Sees:**
  - 📍 "Towed To" location ONLY (the depot)
  - Red marker showing depot location
  - Blue line showing route to depot
  - 🚨 **IMPORTANT ALERT:** "Time's Up!"
  - Status: "Showing: Towed To"

- **Alert Message Appears:**
  ```
  ⚠️ IMPORTANT: Time's Up!
  
  Your vehicle has been at the depot for 15+ minutes.
  If you don't come to retrieve it, you must go to:
  
  📍 [Depot Address]
  
  Contact the depot for information or vehicle release procedures.
  ```

- **User Must:**
  - Go to the depot location shown
  - Contact for vehicle release
  - Act within acceptable timeframe

## Visual Elements

### Timer Display
```
📍 Location Status Indicator:
   ⏱️ Time Elapsed: 15:42

   For 0-10 min: "📍 Showing: Towed From"
   For 10-15 min: "📍 Transition: Both Locations" (orange)
   For 15+ min: "🚨 Showing: Towed To" (red)
```

### Corner Badge (Top Right of Map)
```
┌─────────────────┐
│  ⏱️ 05:32       │  ← Countdown timer
└─────────────────┘
     On Map
```

### Alert Box (After 15 minutes)
```
[Spinning animation]

⚠️ IMPORTANT: Time's Up!

Your vehicle has been at the depot for 17 minutes.
If you don't come to retrieve it, you must go to:

📍 City Central Depot, Gate No. 3, Parking Bay A-12

Contact the depot for information or vehicle 
release procedures.
```

## How It Works for Users

### Step 1: User Opens Map (0-10 min window)
```
User opens "Search Location" tab
↓
Map loads with WHITE marker showing "Towed From"
↓
Timer starts: ⏱️ 00:00
↓
User sees: "Showing: Towed From"
↓
Message: "Towed To location will be revealed after 15 minutes"
```

### Step 2: Between 10-15 Minutes
```
Time reaches 10:00
↓
RED marker appears for "Towed To"
↓
Blue line connects both locations
↓
User can now click "Directions" to get route
↓
Status changes: "Transition: Both Locations"
```

### Step 3: After 15 Minutes
```
Time reaches 15:00
↓
WHITE marker disappears (Towed From hidden)
↓
RED marker remains (Towed To visible)
↓
ALERT BOX POPS UP with:
  - "Time's Up!" message
  - Depot address
  - Instructions
↓
User must navigate to depot
↓
Status: "Showing: Towed To"
```

## Use Cases

### Example 1: Quick Response User
```
Scenario: User comes within 10 minutes

Timeline:
- 0:00 → User sees vehicle was towed from "Airport Road"
- 5:00 → Still only sees "Towed From" location
- 8:00 → Knows where to look, can navigate there
- 10:00 → "Towed To" location revealed as bonus
- Result: User understood the situation quickly
```

### Example 2: Delayed User
```
Scenario: User checks map after 12 minutes

Timeline:
- Sees both "Towed From" and "Towed To" locations
- Orange warning: "Transition: Both Locations"
- Can immediately click "Directions"
- Knows: "I'm running late, need to hurry to depot"
```

### Example 3: Very Late User
```
Scenario: User checks map after 20 minutes

Timeline:
- RED ALERT APPEARS: "Time's Up!"
- Only sees "Towed To" location (red marker)
- Clear instruction: Go to the depot immediately
- Knows: This is urgent, repo action may have started
```

## Information Display

### Bottom Panel Updates

**Status Cards (Change over time):**
```
Blue Card: ⏱️ Time Elapsed: MM:SS
Purple Card: 📍 Location Status (updates with time)
```

**Info Message (Until 15 min):**
```
ℹ️ Towed To location will be revealed after 15 minutes.
   Current time: 08:15
```

**Alert (After 15 min):**
```
[Red spinning alert box]
⚠️ IMPORTANT: Time's Up!
[Depot address and instructions]
```

## Technical Details

### Time Calculation
- **Created At:** Stored from when admin added the vehicle
- **Elapsed Time:** Current time - Created At
- **Updates:** Every 1 second

### Thresholds
```javascript
const SHOW_FROM_UNTIL = 10 * 60;      // 600 seconds (10 min)
const SHOW_TO_AFTER = 15 * 60;        // 900 seconds (15 min)

// Logic:
if (elapsed < 600)        → Show only "From"
if (600 <= elapsed < 900) → Show both
if (elapsed >= 900)       → Show only "To" + Alert
```

### Location Visibility
```
Marker Display:
- "Towed From": Visible 0-14:59 min
- "Towed To":   Visible 10:00+ min
- "You":        Always visible (if location enabled)
```

### Directions Button
- **Disabled** if "Towed To" not yet visible
- **Shows warning** if user tries before 10 min: "Will be available in X minutes"
- **Enabled** from 10:00 onwards

## Alert Mechanism

### When Alert Triggers
- At exactly 15 minutes after vehicle was added
- Shows until user navigates away from page
- Cannot be dismissed (user must see it)

### Alert Content
```
- ⚠️ Visual warning icon
- Title: "IMPORTANT: Time's Up!"
- Message: Explains time elapsed
- Location: Shows exact depot address
- Action: "Contact the depot"
- Urgency: Animated red pulsing background
```

### User Action Needed
User must:
1. Note the depot location
2. Stop what they're doing
3. Go to the depot immediately
4. Retrieve vehicle or contact depot

## UI/UX Features

### Visual Cues
- **Blue Timer:** Information state (0-10 min)
- **Orange Status:** Warning state (10-15 min)
- **Red Alert:** Critical state (15+ min)
- **Animated Badge:** Timer location always visible

### Status Messages
- Clear, non-threatening for first 10 min
- Warning tone for 10-15 min phase
- Urgent tone after 15 min

### Mobile Friendly
- Timer visible on small screens
- Alert takes full width for visibility
- Touch-friendly button sizes
- Bottom controls stay accessible

## Browser Behavior

### Page Visibility
```
If user minimizes tab:
- Timer continues counting
- Alert shows when page re-opened
- No data is lost

If user closes browser:
- Timer resets on next visit
- Will show alert if > 15 min elapsed
```

### Real-Time Updates
- Timer updates every 1 second
- Smooth transitions between phases
- No page reload needed

## Error Handling

### What If CreatedAt Missing?
- System defaults to current time
- Timer starts from visit time
- No location reveal happens

### What If Locations Missing?
- Timer still shows
- Error message: "Could not load locations"
- User can retry with button

### What If User Denies Location?
- Timer still shows
- Location features disabled
- Can still see vehicle location

## Admin Perspective

### When Adding Vehicle
- Admin adds vehicle with timestamp
- Timestamp automatically recorded as `createdAt`
- User map automatically calculates from this time
- No admin action needed

### What Admin Sees
- Normal "Add Vehicle" form
- No timer setup needed
- System handles timing automatically

## Testing Checklist

### Test Scenarios

- [ ] Timer displays and counts continuously
- [ ] First 10 min: Only "Towed From" shown
- [ ] 10-15 min: Both locations shown
- [ ] After 15 min: Alert appears
- [ ] Status badge updates correctly
- [ ] Directions button disabled until 10 min
- [ ] Alert message shows correct time elapsed
- [ ] Alert shows correct depot address
- [ ] Marker colors correct (white/red/blue)
- [ ] Timer badge visible in map corner
- [ ] Mobile layout responsive

### Manual Testing
1. Create test vehicle with timestamp from past
2. Wait for time transitions
3. Verify UI updates match timeline
4. Check alert content accuracy
5. Test response after 15 min

## Future Enhancements

Possible improvements:
1. **Configurable Timings** - Admin can set reveal times
2. **Extension Request** - Allow user to request time extension
3. **Notification Sound** - Alert sound when 15 min reached
4. **SMS Reminder** - Send SMS at 15 minute mark
5. **Fine Calculation** - Auto-calculate daily storage fees
6. **Automated Release** - Process vehicle after X hours

---

**Status:** ✅ Fully implemented
**Branch:** `development`
**Tested:** Yes
**User Impact:** Moderate urgency messaging
**Mobile Support:** Full
**Browser Support:** All modern browsers
