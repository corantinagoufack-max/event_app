
_________________________________________________
|### Event Manager - TypeScript Web Application |
|_______________________________________________|

_______________________________________________
|1. Project Presentation                      |
|_____________________________________________|
A comprehensive web application for event management built entirely with TypeScript, HTML, and CSS. This application allows users to create, view, filter, and manage events, as well as register participants for those events. The project demonstrates professional TypeScript OOP implementation with a modern, responsive UI featuring dark mode support.

Functional Goals:
- Create and manage events with detailed information
- Display and filter events by category and date
- User registration system with comprehensive validation
- Real-time capacity tracking with instant UI updates
- Professional responsive interface with dark/light theme support

Tech Stack:
- TypeScript (strict typing, OOP principles, ES modules)
- HTML5 (semantic markup, accessibility)
- CSS3 (modern styling with CSS variables, flexbox/grid)
- Vanilla JavaScript (no frameworks/libraries as required)

________________________________________________________
|## 2. Implemented Features                           |
|_____________________________________________________|


______________________________________________________________________________________________________________
|                  Feature            |    Status    |              Notes                                    |
|-------------------------------------|--------------|-------------------------------------------------------|
| **Event Management**                | ✅ Complete | All requirements met                                   |
| - Create events with all fields     | ✅ Complete | Title, Description, Date, Location, Category, Capacity |
| - Display all created events        | ✅ Complete | Dynamic card-based display                             |
| - Filter events by category/date    | ✅ Complete | Real-time filtering system                             |
| - Event detail page                 | ✅ Complete | Modal with detailed view                               |
| **User Registration**               | ✅ Complete | All requirements met                                   |
| - Registration with name/email      | ✅ Complete | Form validation included                               |
| - Duplicate prevention              | ✅ Complete | Checks both email and name                             |
| - Capacity control                  | ✅ Complete | Real-time updates                                      |
| - Past event restriction            | ✅ Complete | Date validation                                        |
| **Technical Requirements**          | ✅ Complete | All constraints met                                    |
| - TypeScript only (no plain JS)     | ✅ Complete | 100% TypeScript codebase                               |
| - Modular architecture              | ✅ Complete | Separate files/models                                  |
| - Proper OOP implementation         | ✅ Complete | Classes for Event, User, Registration                  |
| - Arrays as primary storage         | ✅ Complete | In-memory arrays only                                  |
| - Registration validation           | ✅ Complete | Comprehensive validation                               |
| - Functional HTML/CSS UI            | ✅ Complete | Professional, responsive design                        |
| **Bonus Features**                  | ✅ Complete | Extra enhancements                                     |
| - Responsive design                 | ✅ Complete | Mobile-friendly (320px - 1920px)                       |
| - Dark mode                         | ✅ Complete | System preference + manual toggle                      |
| - Real-time capacity updates        | ✅ Complete | Instant UI feedback                                    |
| - Professional UI/UX                | ✅ Complete | Modern design with animations                          |
|_____________________________________|______________|_______________________________________________________|


___________________________________________
|## 3. Project Structure                  |
|_________________________________________|
event-app/
├── index.html # Main HTML entry point
├── styles/
│ └── main.css # Complete CSS styling with dark mode
├── tsconfig.json # TypeScript configuration
├── package.json # Project metadata + npm scripts
├── .gitignore # Git ignore file
├── README.md # Project documentation (this file)
├── dist/ # Compiled JavaScript output (auto-generated)
│ ├── models/
│ │ ├── Event.js
│ │ ├── User.js
│ │ └── Registration.js
│ ├── main.js
│ └── index.js
└── src/
├── models/ # TypeScript class definitions
│ ├── Event.ts # Event class with all properties/methods
│ ├── User.ts # User class with validation
│ └── Registration.ts # Registration class with status management
├── main.ts # Main application logic
└── index.ts # Application entry point

__________________________________________________
|## 4. Installation & Execution                  |
|________________________________________________|
Prerequisites:
- Node.js(version 14 or higher)
- npm (Node Package Manager)


Step-by-Step Setup:
1.Clone/Download the Project:
   ```bash
   #  If using git
   git clone <repository-url>
   cd event-app
   
   # OR extract the project folder to your computer


<!-- 2.Install Dependencies -->
   npm install
# TypeScripts(v5.3.0)
# Live Server(for development)

#  3.Build the TypeScript Project:
   npm run build <!--This compiles TypeScript files to JavaScript in the /dist folder.-->

#  4.Run the Application:
Option A: Using Live Server (Recommended)
   npm start #This automatically opens your browser at http://localhost:3000

Option B: Open Directly
Open index.html directly in your browser#Note: Some browsers may require a local server for ES modules

<!--Development Commands-->
# One-time build
npm run build

# Watch mode (auto-recompile on changes)
npm run build:watch

#Development server
npm start

_______________________________________
|<!--5. How to Use the Application-->  |
|______________________________________|

#Creating an Event:
1.Click on the "Create Event" tab
2.Fill in all required fields:
   -Title: Event name (e.g., "Tech Conference 2025")
   -Description: Detailed event description
   -Date: Select from date picker
   -Location: Physical/Virtual location
   -Category: Choose from: Conference, Sport, Workshop, Other
   -Maximum Capacity: Number of participants allowed
3.Click "Create Event"
  -✅ Success: Green alert appears, event is added to list
  -❌ Error: Red alert indicates missing/invalid fields

#Viewing and Filtering Events:
1.On the "Events List" tab:
  -All events are displayed as cards with status badges
  -Available (green): Open for registration
  -Full (red): Capacity reached
  -Past (gray): Event date has passed
2.Filter Events:
  -Use dropdown to filter by category (All, Conference, Sport, Workshop, Other)
  -Use date picker to filter by specific date
  -Click "Apply Filters" to filter, "Clear Filters" to reset

#Registering for an Event:
1.Click "View Details & Register" on any event card
2.Modal opens showing:
  -Event details (description, date, location)
  -Capacity meter showing current registrations
  -List of already registered participants (if any)
3.Fill the registration form:
  -Full Name: Your complete name
  -Institutional Email: Valid email format (e.g., student@institution.org)
4.Click "Register Now"
  -✅ Success: Green alert in modal, capacity updates immediately
  -❌ Errors:
    _"Event is full" - Red alert in modal
    _"You are already registered" - Prevents duplicates
    _"Please enter valid institutional email" - Format validation

#Using Dark Mode:
1.Automatic: App detects your system preference
2.Manual: Click the theme toggle button (🌙/☀️) in top-right corner
3.Persistent: Choice is saved in localStorage for future visits

#Important Validation Rules:
1.Capacity Control:
  -Registration blocked when event reaches maximum capacity
  -Button changes to "Event Full" (disabled state)
  -Real-time capacity meter updates
2.Duplicate Prevention:
  -Same email cannot register twice for same event
  -Same name cannot register twice for same event
  -Clear error messages in the registration modal
3.Date Validation:
  -Cannot register for past events
  -Clear "Cannot register for past events" message

______________________
|## 6. Screen Shots   |
|_____________________|
#1.Home page(Event List)
src\pages\images\event_1.png
src\pages\images\event_2.png

#2.Event detail page
src\pages\images\event_detail_1.png
src\pages\images\event_details_2.png
src\pages\images\event_details_3.png
src\pages\images\event_details_4.png

#3.Registration form
src\pages\images\registration_form.png #each event has a registration form allocated to it upon creation dynamically and when the button view details and register is click the user has two options that is to view the details of the event and also to register if the user doesn't want to register he will use the cross at the right uo left conner to exit.

//
#4.(Bonus)Mobile view
src\pages\images\mobile_view.mp4

#5.(Bonus)Dark Mode
src\pages\images\dark_mode_1.png
src\pages\images\dark_mode_2.png
src\pages\images\dark_mode_3.png
src\pages\images\dark_mode_4.png
src\pages\images\dark_mode_4.png


___________________________________
|## 7. Limitations and Conclusion |
|_________________________________|
1-Limitations 
#Current Limitations (Per Requirements):
A-In-Memory Storage: Data lost on page refresh (as required)
B-Single Session: No user authentication or profiles
C-No Backend: All logic runs in browser (as required)
D-Basic Features: Meets but doesn't exceed specified requirements

2-Potential Future Enhancements:
#Persistent Storage: Add LocalStorage/IndexedDB support
A-User Authentication: Login system with user profiles
B-Admin Features: Event editing, user management
C-Notifications: Email/SMS confirmation for registrations
D-Calendar Integration: Export events to Google/Outlook Calendar
E-Search Functionality: Full-text search across events
F-Export Data: CSV/PDF export of registrations
G-Social Features: Event sharing, comments, ratings


______________________________
|                            |
|## 8. Author Information   |
|____________________________|
Full Name: Agoufack Alapani Corantin Junior
Student ID:2425L001
Email:corantin.agoufack@institutsaintjeaningenieur.org

##Demo for Admin Accounts 
<!-- <div class="demo-accounts">
                        <p><strong>Demo Accounts:</strong></p>
                        <p>admin@eventmanager.com / Admin@123</p>
                        <p>manager@university.edu / Manager@2025</p>
                    </div> -->