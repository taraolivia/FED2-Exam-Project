# 🏨 Holidaze - Venue Booking Platform

A modern, full-stack booking platform built with Next.js, allowing users to discover and book accommodations while enabling venue managers to list and manage their properties.

## ✨ Features

### 🔐 **Authentication**
- User registration with @stud.noroff.no email validation
- Secure login/logout with JWT tokens
- Role-based access (Customer/Venue Manager)

### 🏠 **Venue Discovery**
- Browse all available venues with search and filtering
- Interactive venue cards with hover effects
- Detailed venue pages with image galleries
- Interactive maps showing venue locations
- Availability calendar with booking conflicts

### 📅 **Booking System**
- Date range selection with conflict prevention
- Guest count validation
- Real-time availability checking
- Booking management and cancellation

### 🏢 **Venue Management** (Managers Only)
- Create, edit, and delete venues
- Upload venue images and descriptions
- Set pricing and guest limits
- View and manage bookings
- Track venue performance

### 👤 **Profile Management**
- Update avatar and banner images
- Edit bio and personal information
- Toggle venue manager status
- View booking history

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Maps:** Leaflet with OpenStreetMap
- **API:** Noroff Holidaze API v2
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/taraolivia/FED2-Exam-Project.git
   cd FED2-Exam-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_NOROFF_API_KEY=your_noroff_api_key_here
   ```
   
   Get your API key from the [Noroff API documentation](https://docs.noroff.dev/docs/v2)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📱 Usage

### For Customers:
1. **Register** with your @stud.noroff.no email
2. **Browse venues** on the homepage
3. **Search and filter** to find perfect accommodations
4. **Select dates** using the availability calendar
5. **Book venues** and manage reservations in your profile

### For Venue Managers:
1. **Enable venue manager** status in your profile
2. **Create venues** with detailed descriptions and images
3. **Set pricing** and availability
4. **Manage bookings** and view guest information
5. **Edit or delete** your venues as needed

## 🎨 Design System

### Color Palette
- **Background:** Warm beige tones (#f0ebe5)
- **Primary:** Sage green (#a7b8a3)
- **Secondary:** Dusty rose (#c9a9a6)
- **Accent:** Charcoal (#534946)

### Typography
- **Headings:** Marcellus (serif)
- **Body:** Inter (sans-serif)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── components/         # Reusable UI components
│   ├── venues/            # Venue-related pages
│   ├── bookings/          # Booking management
│   ├── profile/           # User profile pages
│   └── manage-venues/     # Venue management (managers)
├── lib/
│   ├── api/               # API client functions
│   ├── contexts/          # React contexts
│   └── schemas/           # TypeScript type definitions
```

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run format       # Format code with Prettier
```

## 🌐 API Integration

This project integrates with the [Noroff Holidaze API v2](https://docs.noroff.dev/docs/v2/holidaze/venues) for:
- User authentication
- Venue data management
- Booking operations
- Profile management

## 📦 Key Dependencies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS v4** - Utility-first styling
- **React Leaflet** - Interactive maps
- **Zod** - Runtime type validation

## 🎯 Features Implemented

✅ User registration and authentication  
✅ Venue browsing with search/filter  
✅ Interactive booking calendar  
✅ Venue management (CRUD operations)  
✅ Profile management  
✅ Interactive maps with geocoding  
✅ Responsive design  
✅ Loading states and error handling  
✅ Role-based navigation  

## 🚀 Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

**Live Demo:** [https://your-app.vercel.app](https://your-app.vercel.app)

## 👩‍💻 Author

**Tara Olivia Bjørheim**  
Frontend Development Student at Noroff  
[GitHub](https://github.com/taraolivia) | [LinkedIn](https://linkedin.com/in/taraolivia)

## 📄 License

This project is part of the Frontend Development program at Noroff School of Technology and Digital Media.
