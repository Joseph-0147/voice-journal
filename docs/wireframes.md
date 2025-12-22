# Echo - Wireframe Documentation

This document provides detailed wireframe descriptions for the three main screens of the Echo application.

---

## Screen 1: Home Screen (Recording)

### Layout Description

```
┌─────────────────────────────────────┐
│  ☰                         👤 🔔    │  ← Header (60px)
├─────────────────────────────────────┤
│                                     │
│        Echo                         │  ← App Title (80px from top)
│        Your Social Audio Journal    │  ← Tagline (subtle, 14px)
│                                     │
│                                     │
│                                     │
│            ┌─────────┐              │
│            │         │              │
│            │    🎤   │              │  ← Large Circular Record Button
│            │         │              │     (180px diameter)
│            │  Tap to │              │     Gradient: soft blue → lavender
│            │  Record │              │     Pulsing glow animation
│            │         │              │
│            └─────────┘              │
│                                     │
│                                     │
│         "1 day streak 🔥"           │  ← Streak Display (below button)
│                                     │
│                                     │
│     ┌────────────────────────┐     │
│     │  Recent Soundscapes    │     │  ← Section Header
│     ├────────────────────────┤     │
│     │  ╱╲╱╲╱╲╱╲ Nov 24      │     │  ← Soundscape Card 1
│     │  "Morning clarity"     │     │     (Thumbnail waveform)
│     ├────────────────────────┤     │
│     │  ╱╲╱╲╱╲╱╲ Nov 23      │     │  ← Soundscape Card 2
│     │  "Evening thoughts"    │     │
│     └────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
│  🏠    📊    ⚙️                    │  ← Bottom Navigation (60px)
└─────────────────────────────────────┘
```

### Component Breakdown

#### 1. Header Bar (Top)
- **Height**: 60px
- **Left**: Hamburger menu (☰) - Opens navigation drawer
- **Right**: Profile icon (👤) and Notifications bell (🔔)
- **Background**: Transparent gradient to white

#### 2. Title Section
- **Position**: 80px from top, centered
- **App Name**: "Echo" in large, light serif font (36px)
- **Tagline**: "Your Social Audio Journal" in 14px, gray (#8E8E93)
- **Spacing**: 20px margin on sides

#### 3. Recording Button (Center Focus)
- **Type**: Large circular button
- **Size**: 180px diameter
- **Icon**: Microphone (🎤) - 48px
- **Label**: "Tap to Record" below icon (16px)
- **Gradient**: Linear gradient from #A8C5DD (soft blue) to #C5B3D9 (lavender)
- **Animation**: 
  - Idle: Gentle pulsing glow (opacity 0.6 → 1.0, 2s loop)
  - Recording: Red pulsing ring (#FF3B30)
  - Recording Label changes to: "Recording... Tap to Stop"
- **Shadow**: Soft shadow (0px 8px 24px rgba(0,0,0,0.12))
- **Position**: Vertically centered in upper 60% of screen

#### 4. Streak Display
- **Position**: 20px below record button, centered
- **Text**: "{X} day streak 🔥"
- **Font**: 18px, medium weight
- **Color**: #FF9500 (warm orange)
- **Animation**: Slight bounce on update

#### 5. Recent Soundscapes Section
- **Position**: Bottom 30% of screen (above nav bar)
- **Header**: "Recent Soundscapes" (20px, semi-bold, #1C1C1E)
- **Card Style**:
  - Height: 80px per card
  - Background: White with subtle border (#E5E5EA)
  - Waveform thumbnail on left (60px × 40px)
  - Date on right side (14px, #8E8E93)
  - Custom tagline below waveform (16px, #1C1C1E)
  - Corner radius: 12px
  - Spacing: 12px between cards
- **Scroll**: Horizontal scroll if more than 2 entries
- **Interaction**: Tap to view full soundscape and insights

#### 6. Bottom Navigation
- **Height**: 60px + safe area
- **Background**: White with top border (#E5E5EA)
- **Items**:
  - Home (🏠) - Active state
  - Insights (📊)
  - Settings (⚙️)
- **Active Color**: #007AFF (system blue)
- **Inactive Color**: #8E8E93

### Interaction States

1. **Default State**: Pulsing record button, streak visible, recent entries scrollable
2. **Recording State**: 
   - Button turns red with pulsing ring
   - Timer appears above button showing duration (MM:SS)
   - Animated waveform visualization appears around button
3. **Post-Record**: Smooth transition to Post-Recording screen

---

## Screen 2: Post-Recording (Soundscape View)

### Layout Description

```
┌─────────────────────────────────────┐
│  ←                          ⋮       │  ← Header (60px)
│                                     │     Back button | More options
├─────────────────────────────────────┤
│                                     │
│    November 25, 2025                │  ← Date Header (80px from top)
│    3:42 PM                          │
│                                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │     ┌─────────────────┐       │ │
│  │     │                 │       │ │
│  │     │   ╱╲╱╲╱╲╱╲╱╲   │       │ │  ← Animated Soundscape
│  │     │  ╱  ╲  ╱  ╲  ╱ │       │ │     (Card, 300px height)
│  │     │ ╱    ╲╱    ╲╱  │       │ │     Gradient background
│  │     │╱              ╲│       │ │     Flowing waveform
│  │     └─────────────────┘       │ │     Auto-playing animation
│  │                               │ │
│  │    "A moment of clarity"      │ │  ← Custom Tagline (editable)
│  │          ✏️                   │ │
│  └───────────────────────────────┘ │
│                                     │
│    🎨 Themes    💾 Save    📤 Share │  ← Action Buttons
│                                     │
│  ┌───────────────────────────────┐ │
│  │  📝 Quick Insights            │ │  ← Insights Panel (Collapsible)
│  ├───────────────────────────────┤ │
│  │  💡 2 Action Items Found      │ │
│  │  🎯 1 Goal Mentioned          │ │
│  │  😊 Positive Tone Detected    │ │
│  │                               │ │
│  │  [View Full Analysis →]      │ │
│  └───────────────────────────────┘ │
│                                     │
│    [🗑️ Delete]  [✅ Save Entry]   │  ← Bottom Actions
│                                     │
└─────────────────────────────────────┘
```

### Component Breakdown

#### 1. Header Bar
- **Height**: 60px
- **Left**: Back arrow (←) - Returns to Home
- **Right**: More options (⋮) - Menu for delete, duplicate, etc.
- **Background**: White with subtle bottom border

#### 2. Date/Time Header
- **Position**: 80px from top
- **Date**: "November 25, 2025" (18px, semi-bold, #1C1C1E)
- **Time**: "3:42 PM" (14px, regular, #8E8E93)
- **Alignment**: Left-aligned, 20px margin

#### 3. Soundscape Card (Primary Focus)
- **Size**: Full width (minus 40px margins), 300px height
- **Background**: Animated gradient
  - Default: Soft blue (#A8C5DD) → Lavender (#C5B3D9)
  - User can select from palette
- **Waveform**:
  - Style: Flowing, organic waveform
  - Color: White with 80% opacity
  - Animation: Continuous flow from left to right (4s duration)
  - Bars: 50-60 vertical bars with varying heights
  - Responsive to audio amplitude data
- **Corner Radius**: 24px
- **Shadow**: 0px 12px 40px rgba(0,0,0,0.15)
- **Padding**: 30px internal

#### 4. Custom Tagline
- **Position**: Centered below waveform (inside card)
- **Text**: User's custom text or default "A moment of clarity"
- **Font**: 20px, light italic serif
- **Color**: White
- **Edit Icon**: Pencil (✏️) on right - Tap to edit
- **Max Length**: 40 characters

#### 5. Action Buttons Row
- **Position**: 20px below soundscape card
- **Buttons**:
  1. **Themes (🎨)**:
     - Opens color palette modal
     - 8 gradient presets + custom picker
  2. **Save (💾)**:
     - Saves current theme and tagline
     - Quick action without leaving screen
  3. **Share (📤)**:
     - Opens native share sheet
     - Exports soundscape as image/video
- **Style**: Text buttons with icons, 16px font
- **Color**: #007AFF
- **Spacing**: Even distribution across width

#### 6. Quick Insights Panel
- **Type**: Collapsible card
- **Height**: Auto (collapsed: 60px, expanded: 200px)
- **Background**: Light gray (#F2F2F7)
- **Border**: 1px solid #E5E5EA
- **Corner Radius**: 16px
- **Content**:
  - Header: "📝 Quick Insights" (18px, semi-bold)
  - Summary stats (3 key metrics)
  - "View Full Analysis" button → Navigates to Insights Dashboard
- **Icons**: Emoji-based for quick visual scanning
- **Padding**: 20px

#### 7. Bottom Action Buttons
- **Position**: Fixed at bottom, 20px from edge
- **Buttons**:
  1. **Delete (🗑️)**: Outline button, red text (#FF3B30)
  2. **Save Entry (✅)**: Primary button, blue background (#007AFF)
- **Layout**: Side-by-side, equal width
- **Height**: 50px
- **Corner Radius**: 12px

### Animation Details

1. **On Load**: 
   - Soundscape card fades in with scale animation (0.9 → 1.0, 400ms)
   - Waveform starts animating immediately
2. **Theme Change**: 
   - Background gradient smoothly transitions (600ms ease-in-out)
3. **Save Action**: 
   - Checkmark icon briefly appears over soundscape
   - Success haptic feedback

---

## Screen 3: Insights Dashboard

### Layout Description

```
┌─────────────────────────────────────┐
│         Insights                    │  ← Header (60px)
│  📅 This Week  🔍                  │  ← Date filter & Search
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │  📊 Weekly Summary            │ │  ← Summary Card
│  ├───────────────────────────────┤ │
│  │  5 Entries  •  23 min total   │ │
│  │  😊 Mostly Positive Tone      │ │
│  │  🏆 5 day streak!             │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ✅ Action Items (3)          │ │  ← Action Items Section
│  ├───────────────────────────────┤ │
│  │  □ Review project proposal    │ │
│  │    From: Nov 25, 3:42 PM      │ │
│  │  ☑ Call Mom                   │ │  ← Completed item (strikethrough)
│  │    From: Nov 24, 8:20 AM      │ │
│  │  □ Book dentist appointment   │ │
│  │    From: Nov 23, 7:15 PM      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🌟 Audio Milestones          │ │  ← Milestones Section
│  ├───────────────────────────────┤ │
│  │  💡 Insight                   │ │
│  │  "I need to prioritize..."    │ │
│  │  Nov 25, 3:42 PM • 0:34       │ │  ← Date and timestamp in audio
│  │                               │ │
│  │  🎯 Goal                      │ │
│  │  "I'll exercise 3x weekly"    │ │
│  │  Nov 24, 8:20 AM • 1:12       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  📈 Patterns & Themes         │ │  ← Analytics Section
│  ├───────────────────────────────┤ │
│  │  Top Topics This Week:        │ │
│  │  • Work (45%)                 │ │  ← Bar visualization
│  │  • Relationships (30%)        │ │
│  │  • Health (25%)               │ │
│  │                               │ │
│  │  Emotional Trend: ↗️          │ │  ← Trend indicator
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
│  🏠    📊    ⚙️                    │  ← Bottom Navigation
└─────────────────────────────────────┘
```

### Component Breakdown

#### 1. Header Section
- **Height**: 100px (including filter bar)
- **Title**: "Insights" (28px, bold, #1C1C1E)
- **Controls**:
  - Date Filter: "📅 This Week" - Dropdown to select: Today, This Week, This Month, All Time
  - Search: "🔍" - Opens search overlay for transcript search
- **Background**: White
- **Bottom Border**: #E5E5EA

#### 2. Weekly Summary Card
- **Height**: 120px
- **Background**: Gradient (#007AFF → #5856D6, subtle)
- **Text Color**: White
- **Corner Radius**: 16px
- **Metrics**:
  1. Entry count + total duration
  2. Overall sentiment (emoji + text)
  3. Current streak with celebration emoji
- **Font**: 16px regular, 24px for numbers
- **Icon Size**: 24px

#### 3. Action Items Section
- **Type**: Expandable list
- **Header**: "✅ Action Items (3)" - Count badge
- **Item Structure**:
  - Checkbox (interactive)
  - Task text (18px, #1C1C1E)
  - Metadata: "From: [Date, Time]" (14px, #8E8E93)
  - Tap item to jump to source audio
- **States**:
  - Uncompleted: White background, open checkbox
  - Completed: Gray background (#F2F2F7), strikethrough text, checked box
- **Sorting**: Uncompleted first, then by date
- **Padding**: 16px per item
- **Divider**: Thin line (#E5E5EA)

#### 4. Audio Milestones Section
- **Type**: Card-based list
- **Header**: "🌟 Audio Milestones"
- **Card Types**:
  1. 💡 Insight (yellow accent)
  2. 🎯 Goal (green accent)
  3. ❤️ Strong Emotion (red/pink accent)
- **Card Structure**:
  - Icon with colored background (32px circle)
  - Excerpt/summary (16px, 2 lines max with ellipsis)
  - Date + timestamp in audio (14px, #8E8E93)
  - Play button overlay on tap
- **Height**: 90px per card
- **Corner Radius**: 12px
- **Shadow**: Subtle (0px 2px 8px rgba(0,0,0,0.08))
- **Spacing**: 12px between cards
- **Interaction**: Tap to open modal with full context + audio player at timestamp

#### 5. Patterns & Themes Section
- **Height**: 240px
- **Background**: White card
- **Corner Radius**: 16px
- **Content**:
  - **Top Topics**:
    - Horizontal bar chart
    - Category name + percentage
    - Color-coded bars (different pastel color per category)
    - Max 5 topics shown
  - **Emotional Trend**:
    - Simple arrow indicator (↗️ improving, → stable, ↘️ declining)
    - Based on sentiment analysis over time
    - Tap for detailed graph view
- **Padding**: 20px

#### 6. Empty States
- **No Action Items**: 
  - Illustration: Checkmark icon
  - Text: "No action items yet. Keep journaling!"
- **No Milestones**:
  - Illustration: Star icon
  - Text: "Your key moments will appear here"

#### 7. Search Overlay (When activated)
- **Type**: Full-screen modal with dimmed background
- **Header**: Search bar (auto-focused)
- **Search Scope**: All transcripts
- **Results**: List of matching entries
  - Highlighted matching text
  - Date and preview
  - Tap to view full entry
- **Filter**: By date range, sentiment, or tags

### Interaction Details

1. **Checkbox Interaction**:
   - Tap checkbox: Toggle completion state
   - Haptic feedback on toggle
   - Smooth animation (strikethrough + gray background)

2. **Milestone Tap**:
   - Opens modal overlay (80% screen height)
   - Shows full transcript context (highlighted)
   - Audio player at specific timestamp
   - "Jump to Full Entry" button at bottom

3. **Date Filter Change**:
   - All sections update with loading skeleton
   - Smooth content transition (fade out → fade in, 300ms)

4. **Pull to Refresh**:
   - Available at top of scroll view
   - Refreshes all analytics and pulls latest entries

---

## Design System Specifications

### Color Palette

**Primary Colors:**
- Primary Blue: `#007AFF`
- Primary Purple: `#5856D6`
- Soft Blue: `#A8C5DD`
- Lavender: `#C5B3D9`

**Semantic Colors:**
- Success Green: `#34C759`
- Warning Orange: `#FF9500`
- Error Red: `#FF3B30`
- Insight Yellow: `#FFCC00`

**Neutral Colors:**
- Text Primary: `#1C1C1E`
- Text Secondary: `#8E8E93`
- Background: `#FFFFFF`
- Background Secondary: `#F2F2F7`
- Border: `#E5E5EA`

### Typography

**Font Family:**
- Primary: SF Pro (iOS) / Roboto (Android)
- Accent: Serif for titles/taglines

**Sizes:**
- H1: 28px (bold)
- H2: 22px (semi-bold)
- H3: 18px (semi-bold)
- Body: 16px (regular)
- Caption: 14px (regular)
- Label: 12px (medium)

### Spacing System
- XS: 4px
- S: 8px
- M: 12px
- L: 16px
- XL: 20px
- XXL: 24px
- Container Margin: 20px

### Border Radius
- Small: 8px (buttons)
- Medium: 12px (cards)
- Large: 16px (main cards)
- XLarge: 24px (soundscape card)
- Circle: 50% (profile, record button)

### Shadow System
- Light: `0px 2px 8px rgba(0,0,0,0.08)`
- Medium: `0px 4px 16px rgba(0,0,0,0.12)`
- Heavy: `0px 8px 24px rgba(0,0,0,0.15)`

---

## Accessibility Considerations

1. **Color Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
2. **Touch Targets**: Minimum 44×44pt for all interactive elements
3. **Voice Over**: All elements properly labeled
4. **Dynamic Type**: Supports system text size preferences
5. **Reduced Motion**: Alternative animations for users with motion sensitivity
6. **Haptic Feedback**: Tactile confirmation for key actions

---

## Responsive Behavior

### Small Devices (< 375px width)
- Record button reduced to 160px diameter
- Recent soundscapes: 1 column
- Insights cards: Full width with more padding reduction

### Large Devices (> 428px width)
- Increased margins (24px instead of 20px)
- Soundscape card max-width: 500px (centered)
- Two-column layout for action items on tablets

### Tablet Considerations
- Side-by-side layout for Home + Insights
- Larger soundscape visualizations
- Enhanced navigation with sidebar

---

This wireframe documentation provides a comprehensive blueprint for implementing the Echo application UI. Each screen focuses on simplicity, visual appeal, and seamless user experience while maintaining the calm, mindful aesthetic central to the app's identity.
