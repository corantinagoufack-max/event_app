import { Event } from './models/Event.js';
import { User } from './models/User.js';
import { Registration } from './models/Registration.js';
import { Admin } from './models/Admin.js';

// Main Application Class
class EventManagerApp {
    private events: Event[] = [];
    private users: User[] = [];
    private registrations: Registration[] = [];
    private currentAdmin: Admin | null = null;
    private currentEventId: number | null = null;
    private alertTimeout: number | null = null;
    private currentParticipantsEventId: number | null = null;

    constructor() {
        this.initializeAdmins();
        this.initializeTheme();
        this.initializeApp();
        this.loadSampleData();
    }

    private initializeAdmins(): void {
        // Add default admins
        const admins = [
            new Admin('System Administrator', 'admin@eventmanager.com', 'super'),
            new Admin('University Manager', 'manager@university.edu', 'event_manager'),
            new Admin('Event Coordinator', 'coordinator@events.org', 'event_manager')
        ];
        
        admins.forEach(admin => {
            if (!this.users.some(u => u.email === admin.email)) {
                this.users.push(admin);
            }
        });
    }

    private initializeTheme(): void {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    private toggleTheme(): void {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.showBigAlert(`Switched to ${newTheme} mode`, 'success', 'theme-toggle');
    }

    private initializeApp(): void {
        this.setupEventListeners();
        this.renderEvents();
        this.setupModal();
        this.setupParticipantsModal();
        this.restoreAdminSession();
    }

    private restoreAdminSession(): void {
        const savedAdminEmail = localStorage.getItem('adminEmail');
        if (savedAdminEmail) {
            const admin = Admin.getAdminByEmail(savedAdminEmail);
            if (admin) {
                this.currentAdmin = admin;
                this.updateAdminUI();
            }
        }
    }

    private loadSampleData(): void {
        const defaultAdmin = this.users.find(u => u.isAdmin);
        const adminId = defaultAdmin?.id || 1;

        const sampleEvents = [
            new Event(
                'Tech Conference 2025',
                'Annual technology conference featuring latest innovations',
                new Date('2026-06-15'),
                'Convention Center, Yaoundé',
                'conference',
                10,
                adminId
            ),
            new Event(
                'University Sports Day',
                'Inter-department sports competition',
                new Date('2025-09-20'),
                'University Stadium',
                'sport',
                15,
                adminId
            ),
            new Event(
                'Web Development Workshop',
                'Hands-on workshop covering modern web development',
                new Date('2026-08-10'),
                'Computer Lab, Building A',
                'workshop',
                5,
                adminId
            )
        ];

        sampleEvents.forEach(event => {
            this.events.push(event);
        });

        this.renderEvents();
    }

    // Admin Authentication
    public adminLogin(email: string, password: string): boolean {
        if (!Admin.validateAdminCredentials(email, password)) {
            this.showBigAlert('Invalid admin credentials', 'error', 'admin-login-form');
            return false;
        }

        const admin = Admin.getAdminByEmail(email);
        if (!admin || !admin.canCreateEvents()) {
            this.showBigAlert('Admin does not have permission to create events', 'error', 'admin-login-form');
            return false;
        }

        this.currentAdmin = admin;
        localStorage.setItem('adminEmail', admin.email);
        this.showBigAlert(`Welcome, ${admin.fullName}!`, 'success', 'admin-login-form');
        this.updateAdminUI();
        
        setTimeout(() => this.switchTab('create'), 500);
        
        return true;
    }

    public adminLogout(): void {
        if (!this.currentAdmin) return;
        
        const adminName = this.currentAdmin.fullName;
        this.currentAdmin = null;
        localStorage.removeItem('adminEmail');
        this.showBigAlert(`Goodbye, ${adminName}!`, 'success', 'admin-panel');
        this.updateAdminUI();
        
        const activeTab = document.querySelector('.tab.active') as HTMLElement;
        if (activeTab && activeTab.getAttribute('data-tab') === 'create') {
            this.switchTab('events');
        }
    }

    private updateAdminUI(): void {
        const adminPanel = document.getElementById('admin-panel');
        const loginForm = document.getElementById('admin-login-form');
        const eventForm = document.getElementById('event-form');
        const adminNameSpan = document.getElementById('admin-name');
        const createTab = document.querySelector('.tab[data-tab="create"]') as HTMLButtonElement;
        const viewParticipantsTab = document.querySelector('.tab[data-tab="participants"]') as HTMLButtonElement;

        if (this.currentAdmin) {
            // Admin is logged in
            if (adminPanel) adminPanel.style.display = 'flex';
            if (loginForm) loginForm.style.display = 'none';
            if (eventForm) eventForm.style.display = 'block';
            if (adminNameSpan) adminNameSpan.textContent = this.currentAdmin.fullName;
            if (createTab) {
                createTab.disabled = false;
                createTab.classList.remove('disabled');
            }
            if (viewParticipantsTab) {
                viewParticipantsTab.disabled = false;
                viewParticipantsTab.classList.remove('disabled');
            }
        } else {
            // Admin is not logged in
            if (adminPanel) adminPanel.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
            if (eventForm) eventForm.style.display = 'none';
            if (adminNameSpan) adminNameSpan.textContent = '';
            if (createTab) {
                createTab.disabled = true;
                createTab.classList.add('disabled');
            }
            if (viewParticipantsTab) {
                viewParticipantsTab.disabled = true;
                viewParticipantsTab.classList.add('disabled');
            }
        }
    }

    // Event Management
    public createEvent(
        title: string,
        description: string,
        date: Date,
        location: string,
        category: 'conference' | 'sport' | 'workshop' | 'other',
        maxCapacity: number
    ): Event | null {
        if (!this.currentAdmin) {
            this.showBigAlert('Please login as admin to create events', 'error', 'create-section');
            return null;
        }

        const event = new Event(
            title,
            description,
            date,
            location,
            category,
            maxCapacity,
            this.currentAdmin.id
        );
        
        this.events.push(event);
        this.renderEvents();
        this.showBigAlert('Event created successfully!', 'success', 'create-section');
        return event;
    }

    public getEvents(): Event[] {
        return this.events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    public getEventById(id: number): Event | undefined {
        return this.events.find(event => event.id === id);
    }

    public filterEvents(category?: string, date?: Date): Event[] {
        let filtered = this.events;

        if (category && category !== 'all') {
            filtered = filtered.filter(event => event.category === category);
        }

        if (date) {
            const filterDate = new Date(date);
            filterDate.setHours(0, 0, 0, 0);
            
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === filterDate.getTime();
            });
        }

        return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // User Registration
    public registerUser(eventId: number, fullName: string, email: string): { success: boolean; message: string; registration?: Registration } {
        const event = this.getEventById(eventId);
        
        if (!event) {
            this.showBigAlert('Event not found', 'error', 'event-modal');
            return { success: false, message: 'Event not found' };
        }

        const canRegister = event.canRegister();
        if (!canRegister.can) {
            this.showBigAlert(canRegister.reason || 'Cannot register for this event', 'error', 'event-modal');
            return { success: false, message: canRegister.reason || 'Cannot register for this event' };
        }

        const tempUser = new User(fullName, email);
        if (!tempUser.validateEmail()) {
            this.showBigAlert('Please enter a valid email address', 'error', 'event-modal');
            return { success: false, message: 'Please enter a valid email address' };
        }

        // Check for duplicate registration by email
        const existingUser = this.users.find(u => u.email === email.toLowerCase());
        if (existingUser) {
            const existingRegistration = this.registrations.find(reg => 
                reg.eventId === eventId && reg.userId === existingUser.id && reg.isActive()
            );
            if (existingRegistration) {
                this.showBigAlert('You are already registered for this event', 'error', 'event-modal');
                return { success: false, message: 'You are already registered for this event' };
            }
        }

        // Create or find user
        let user = existingUser;
        if (!user) {
            user = new User(fullName, email);
            this.users.push(user);
        }

        // Create registration
        const registration = new Registration(eventId, user.id);
        this.registrations.push(registration);
        event.incrementRegistrations();

        this.updateEventCard(eventId);
        
        return { 
            success: true, 
            message: 'Registration successful!',
            registration 
        };
    }

    public getRegistrationsForEvent(eventId: number): { user: User, registration: Registration }[] {
        return this.registrations
            .filter(reg => reg.eventId === eventId && reg.isActive())
            .map(reg => ({
                user: this.users.find(u => u.id === reg.userId)!,
                registration: reg
            }))
            .sort((a, b) => a.user.fullName.localeCompare(b.user.fullName));
    }

    // UI Rendering
    private renderEvents(events?: Event[]): void {
        const eventsToRender = events || this.getEvents();
        const container = document.getElementById('events-container');
        
        if (!container) return;

        if (eventsToRender.length === 0) {
            container.innerHTML = `
                <div class="no-events">
                    <h3>No Events Found</h3>
                    <p>${this.currentAdmin ? 'Create your first event!' : 'Check back soon for upcoming events.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = eventsToRender.map(event => this.createEventCard(event)).join('');
        this.attachCardEventListeners();
    }

    private createEventCard(event: Event): string {
        const status = event.status;
        const statusClass = status === 'available' ? 'success' : 
                          status === 'full' ? 'danger' : 'secondary';
        
        const canRegister = event.canRegister();
        const buttonText = canRegister.can ? 'View Details & Register' : 
                          status === 'full' ? 'Event Full' : 'Past Event';
        const buttonClass = canRegister.can ? 'btn-primary' : 'btn-secondary';
        
        const adminControls = this.currentAdmin ? `
            <button class="btn btn-sm btn-outline view-participants" data-event-id="${event.id}" title="View Participants">
                👥 Participants (${event.currentRegistrations})
            </button>
        ` : '';
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="card-header">
                    <span class="category">${event.category.toUpperCase()}</span>
                    <h3>${event.title}</h3>
                </div>
                <div class="card-body">
                    <p>${event.description.substring(0, 120)}${event.description.length > 120 ? '...' : ''}</p>
                    <div class="card-info">
                        <span>📅 ${event.formattedDate}</span>
                    </div>
                    <div class="card-info">
                        <span>📍 ${event.location}</span>
                    </div>
                    <div class="capacity">
                        <div class="capacity-info">
                            <span>Capacity: ${event.currentRegistrations}/${event.maxCapacity}</span>
                            <div class="capacity-meter">
                                <div class="capacity-fill" style="width: ${event.capacityPercentage}%"></div>
                            </div>
                        </div>
                        <span class="badge badge-${statusClass}">${status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="card-actions">
                    ${adminControls}
                    <button class="btn ${buttonClass} view-details" 
                            data-event-id="${event.id}" 
                            ${!canRegister.can ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
    }

    private updateEventCard(eventId: number): void {
        const event = this.getEventById(eventId);
        if (!event) return;

        const eventCard = document.querySelector(`.event-card[data-event-id="${eventId}"]`);
        if (!eventCard) return;

        const status = event.status;
        const statusClass = status === 'available' ? 'success' : 
                          status === 'full' ? 'danger' : 'secondary';
        
        const capacityInfo = eventCard.querySelector('.capacity-info span');
        if (capacityInfo) {
            capacityInfo.textContent = `Capacity: ${event.currentRegistrations}/${event.maxCapacity}`;
        }
        
        const capacityFill = eventCard.querySelector('.capacity-fill') as HTMLElement;
        if (capacityFill) {
            capacityFill.style.width = `${event.capacityPercentage}%`;
        }
        
        const badge = eventCard.querySelector('.badge');
        if (badge) {
            badge.className = `badge badge-${statusClass}`;
            badge.textContent = status.toUpperCase();
        }
        
        const viewParticipantsBtn = eventCard.querySelector('.view-participants') as HTMLButtonElement;
        if (viewParticipantsBtn) {
            viewParticipantsBtn.textContent = `👥 Participants (${event.currentRegistrations})`;
        }
        
        const button = eventCard.querySelector('.view-details') as HTMLButtonElement;
        if (button) {
            const canRegister = event.canRegister();
            if (!canRegister.can) {
                button.textContent = status === 'full' ? 'Event Full' : 'Past Event';
                button.disabled = true;
                button.classList.remove('btn-primary');
                button.classList.add('btn-secondary');
            } else {
                button.textContent = 'View Details & Register';
                button.disabled = false;
                button.classList.add('btn-primary');
                button.classList.remove('btn-secondary');
            }
        }
    }

    private renderEventDetails(eventId: number): void {
        const event = this.getEventById(eventId);
        const modalContent = document.getElementById('modal-content');
        
        if (!event || !modalContent) return;

        const registrations = this.getRegistrationsForEvent(eventId);
        const canRegister = event.canRegister();
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${event.title}</h2>
                <span class="category">${event.category.toUpperCase()}</span>
            </div>
            <div class="modal-body">
                <p><strong>Description:</strong> ${event.description}</p>
                <div class="event-details">
                    <div class="detail-item">
                        <strong>Date:</strong> ${event.formattedDate}
                    </div>
                    <div class="detail-item">
                        <strong>Location:</strong> ${event.location}
                    </div>
                    <div class="detail-item">
                        <strong>Capacity:</strong> 
                        <span class="capacity-display">
                            ${event.currentRegistrations}/${event.maxCapacity}
                            <div class="capacity-meter small">
                                <div class="capacity-fill" style="width: ${event.capacityPercentage}%"></div>
                            </div>
                        </span>
                    </div>
                </div>
                
                <div class="registered-participants">
                    <h4>Registered Participants (${registrations.length})</h4>
                    ${this.currentAdmin && registrations.length > 0 ? `
                        <button class="btn btn-sm btn-outline" id="view-all-participants" data-event-id="${eventId}">
                            👥 View All Participants
                        </button>
                    ` : ''}
                    ${registrations.length > 0 ? `
                        <div class="participants-preview">
                            ${registrations.slice(0, 3).map(reg => `
                                <div class="participant-preview">
                                    <span class="participant-name">${reg.user.fullName}</span>
                                    <span class="participant-email">${reg.user.email}</span>
                                </div>
                            `).join('')}
                            ${registrations.length > 3 ? `
                                <div class="participant-preview more">
                                    +${registrations.length - 3} more participants
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <p class="no-participants">No participants yet. Be the first to register!</p>
                    `}
                    
                    ${!canRegister.can ? `
                        <div class="registration-closed">
                            <p><strong>Note:</strong> ${canRegister.reason}</p>
                        </div>
                    ` : ''}
                </div>
                
                ${canRegister.can ? `
                    <div class="registration-form">
                        <h4>Register for this Event</h4>
                        <form id="registration-form">
                            <div class="form-group">
                                <label for="user-name">Full Name *</label>
                                <input type="text" id="user-name" placeholder="Enter your full name" required>
                            </div>
                            <div class="form-group">
                                <label for="user-email">Email Address *</label>
                                <input type="email" id="user-email" placeholder="Enter your email" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Register Now</button>
                        </form>
                    </div>
                ` : ''}
            </div>
        `;

        this.currentEventId = eventId;
        this.showModal();
        
        // Add event listener for "View All Participants" button
        const viewAllBtn = document.getElementById('view-all-participants');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
                this.renderParticipantsView(eventId);
            });
        }
    }

    private renderParticipantsView(eventId: number): void {
        const event = this.getEventById(eventId);
        if (!event) return;

        this.currentParticipantsEventId = eventId;
        const participants = this.getRegistrationsForEvent(eventId);
        
        const participantsModal = document.getElementById('participants-modal');
        const participantsContent = document.getElementById('participants-content');
        
        if (!participantsModal || !participantsContent) return;

        participantsContent.innerHTML = `
            <div class="modal-header">
                <h2>Participants for: ${event.title}</h2>
                <span class="event-info">${event.formattedDate} • ${event.location}</span>
            </div>
            <div class="modal-body">
                <div class="participants-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Registered:</span>
                        <span class="summary-value">${participants.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Capacity:</span>
                        <span class="summary-value">${event.currentRegistrations}/${event.maxCapacity}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Remaining Spots:</span>
                        <span class="summary-value ${event.isFull ? 'text-danger' : 'text-success'}">
                            ${Math.max(0, event.maxCapacity - event.currentRegistrations)}
                        </span>
                    </div>
                </div>
                
                ${participants.length > 0 ? `
                    <div class="participants-table-container">
                        <table class="participants-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Registration Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${participants.map((reg, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${reg.user.fullName}</td>
                                        <td>${reg.user.email}</td>
                                        <td>${reg.registration.formattedRegistrationDate}</td>
                                        <td>
                                            <span class="status-badge status-${reg.registration.status}">
                                                ${reg.registration.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="participants-actions">
                        <button class="btn btn-outline" id="export-participants">
                            📄 Export to CSV
                        </button>
                        <button class="btn btn-outline" id="print-participants">
                            🖨️ Print List
                        </button>
                    </div>
                ` : `
                    <div class="no-participants-message">
                        <div class="empty-state">
                            <div class="empty-icon">👥</div>
                            <h3>No Participants Yet</h3>
                            <p>No one has registered for this event yet.</p>
                        </div>
                    </div>
                `}
            </div>
        `;

        participantsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add event listeners for export and print
        const exportBtn = document.getElementById('export-participants');
        const printBtn = document.getElementById('print-participants');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportParticipantsToCSV(eventId));
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printParticipants(eventId));
        }
    }

    private exportParticipantsToCSV(eventId: number): void {
        const event = this.getEventById(eventId);
        const participants = this.getRegistrationsForEvent(eventId);
        
        if (!event || participants.length === 0) {
            this.showBigAlert('No participants to export', 'warning', 'participants-modal');
            return;
        }

        const csvContent = [
            ['Name', 'Email', 'Registration Date', 'Status'],
            ...participants.map(reg => [
                `"${reg.user.fullName}"`,
                `"${reg.user.email}"`,
                `"${reg.registration.formattedRegistrationDate}"`,
                `"${reg.registration.status}"`
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `participants_${event.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showBigAlert('Participants exported successfully!', 'success', 'participants-modal');
    }

    private printParticipants(eventId: number): void {
        const event = this.getEventById(eventId);
        const participants = this.getRegistrationsForEvent(eventId);
        
        if (!event) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.showBigAlert('Please allow popups to print', 'warning', 'participants-modal');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Participants for ${event.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .event-info { color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .summary { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
                    .summary-item { margin-bottom: 5px; }
                    .print-date { color: #666; font-size: 14px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Participants List</h1>
                <div class="event-info">
                    <strong>Event:</strong> ${event.title}<br>
                    <strong>Date:</strong> ${event.formattedDate}<br>
                    <strong>Location:</strong> ${event.location}<br>
                    <strong>Total Participants:</strong> ${participants.length}<br>
                    <strong>Printed:</strong> ${new Date().toLocaleString()}
                </div>
                
                ${participants.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Registration Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${participants.map((reg, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${reg.user.fullName}</td>
                                    <td>${reg.user.email}</td>
                                    <td>${reg.registration.formattedRegistrationDate}</td>
                                    <td>${reg.registration.status.toUpperCase()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p>No participants registered for this event.</p>'}
                
                <div class="print-date">
                    Printed from Event Management System
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }

    // UI Event Handlers
    private setupEventListeners(): void {
        // Tab Navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                if (target.classList.contains('disabled')) {
                    this.showBigAlert('Please login as admin to access this feature', 'warning', 'tabs-container');
                    return;
                }
                const tabId = target.getAttribute('data-tab');
                if (tabId) {
                    this.switchTab(tabId);
                }
            });
        });

        // Create Event Form
        const eventForm = document.getElementById('event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateEvent();
            });
        }

        // Admin Login Form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }

        // Admin Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.adminLogout());
        }

        // Filters
        const applyFiltersBtn = document.getElementById('apply-filters');
        const clearFiltersBtn = document.getElementById('clear-filters');
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
    }

    private setupModal(): void {
        const modal = document.getElementById('event-modal');
        const closeBtn = document.querySelector('.close-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }

    private setupParticipantsModal(): void {
        const modal = document.getElementById('participants-modal');
        const closeBtn = document.querySelector('.close-participants-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideParticipantsModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideParticipantsModal();
                }
            });
        }
    }

    private hideParticipantsModal(): void {
        const modal = document.getElementById('participants-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentParticipantsEventId = null;
        }
    }

    private attachCardEventListeners(): void {
        document.getElementById('events-container')?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const button = target.closest('.view-details');
            const participantsButton = target.closest('.view-participants');
            
            if (button && !button.hasAttribute('disabled')) {
                const eventId = button.getAttribute('data-event-id');
                if (eventId) {
                    this.renderEventDetails(parseInt(eventId));
                }
            }
            
            if (participantsButton && this.currentAdmin) {
                const eventId = participantsButton.getAttribute('data-event-id');
                if (eventId) {
                    this.renderParticipantsView(parseInt(eventId));
                }
            }
        });
    }

    // Form Handlers
    private handleAdminLogin(): void {
        const email = (document.getElementById('admin-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('admin-password') as HTMLInputElement).value;

        if (!email || !password) {
            this.showBigAlert('Please enter both email and password', 'error', 'admin-login-form');
            return;
        }

        if (this.adminLogin(email, password)) {
            (document.getElementById('login-form') as HTMLFormElement).reset();
        }
    }

    private handleCreateEvent(): void {
        if (!this.currentAdmin) {
            this.showBigAlert('Please login as admin to create events', 'error', 'create-section');
            return;
        }

        const title = (document.getElementById('event-title') as HTMLInputElement).value.trim();
        const description = (document.getElementById('event-description') as HTMLTextAreaElement).value.trim();
        const date = (document.getElementById('event-date') as HTMLInputElement).value;
        const location = (document.getElementById('event-location') as HTMLInputElement).value.trim();
        const category = (document.getElementById('event-category') as HTMLSelectElement).value as 'conference' | 'sport' | 'workshop' | 'other';
        const capacity = parseInt((document.getElementById('event-capacity') as HTMLInputElement).value);

        if (!title || !description || !date || !location || !category || isNaN(capacity)) {
            this.showBigAlert('Please fill all required fields', 'error', 'create-section');
            return;
        }

        if (capacity < 1) {
            this.showBigAlert('Capacity must be at least 1', 'error', 'create-section');
            return;
        }

        const event = this.createEvent(
            title,
            description,
            new Date(date),
            location,
            category,
            capacity
        );

        if (event) {
            (document.getElementById('event-form') as HTMLFormElement).reset();
            this.switchTab('events');
        }
    }

    private handleRegistration(): void {
        if (!this.currentEventId) return;

        const fullName = (document.getElementById('user-name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('user-email') as HTMLInputElement).value.trim();

        if (!fullName || !email) {
            this.showBigAlert('Please fill all required fields', 'error', 'event-modal');
            return;
        }

        const result = this.registerUser(this.currentEventId, fullName, email);
        
        if (result.success) {
            this.showBigAlert(result.message, 'success', 'event-modal');
            (document.getElementById('registration-form') as HTMLFormElement).reset();
            
            setTimeout(() => {
                this.renderEventDetails(this.currentEventId!);
            }, 1500);
        }
    }

    // Filter Methods
    private applyFilters(): void {
        const category = (document.getElementById('category-filter') as HTMLSelectElement).value;
        const dateInput = (document.getElementById('date-filter') as HTMLInputElement).value;
        const date = dateInput ? new Date(dateInput) : undefined;

        const filteredEvents = this.filterEvents(category, date);
        this.renderEvents(filteredEvents);
    }

    private clearFilters(): void {
        (document.getElementById('category-filter') as HTMLSelectElement).value = 'all';
        (document.getElementById('date-filter') as HTMLInputElement).value = '';
        this.renderEvents();
    }

    // UI Helpers
    private switchTab(tabId: string): void {
        document.querySelectorAll('.tab').forEach(tab => {
            const htmlTab = tab as HTMLElement;
            htmlTab.classList.toggle('active', htmlTab.getAttribute('data-tab') === tabId);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-section`);
        });
    }

    private showModal(): void {
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Add event listener for registration form
            const registrationForm = document.getElementById('registration-form');
            if (registrationForm) {
                registrationForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegistration();
                });
            }
        }
    }

    private hideModal(): void {
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentEventId = null;
        }
    }

    // Enhanced Alert System
    private showBigAlert(message: string, type: 'success' | 'error' | 'warning', contextSelector?: string): void {
        // Clear any existing alerts
        const existingAlerts = document.querySelectorAll('.big-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Clear any existing timeout
        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
        }
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `big-alert alert-${type}`;
        alert.innerHTML = `
            <div class="big-alert-content">
                <span class="big-alert-icon">${this.getAlertIcon(type)}</span>
                <span class="big-alert-message">${message}</span>
                <button class="big-alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Style the alert
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getAlertColor(type)};
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
            animation: slideInDown 0.3s ease-out;
            font-size: 16px;
            font-weight: 500;
        `;
        
        // Add animation styles if not already present
        if (!document.querySelector('#big-alert-animations')) {
            const style = document.createElement('style');
            style.id = 'big-alert-animations';
            style.textContent = `
                @keyframes slideInDown {
                    from {
                        transform: translate(-50%, -100%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutUp {
                    from {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                    to {
                        transform: translate(-50%, -100%);
                        opacity: 0;
                    }
                }
                
                .big-alert-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                }
                
                .big-alert-icon {
                    font-size: 24px;
                }
                
                .big-alert-message {
                    flex: 1;
                    text-align: center;
                }
                
                .big-alert-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                }
                
                .big-alert-close:hover {
                    background-color: rgba(255,255,255,0.2);
                }
                
                .alert-success { background: linear-gradient(135deg, #2ecc71, #27ae60); }
                .alert-error { background: linear-gradient(135deg, #e74c3c, #c0392b); }
                .alert-warning { background: linear-gradient(135deg, #f39c12, #d35400); }
            `;
            document.head.appendChild(style);
        }
        
        // Append to the context or body
        let container = document.body;
        if (contextSelector) {
            const contextElement = document.getElementById(contextSelector);
            if (contextElement) {
                container = contextElement;
                alert.style.position = 'absolute';
                alert.style.top = '10px';
                alert.style.left = '50%';
                alert.style.transform = 'translateX(-50%)';
                alert.style.width = 'calc(100% - 20px)';
            }
        }
        
        container.appendChild(alert);
        
        // Auto-remove after 5 seconds
        this.alertTimeout = window.setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideOutUp 0.3s ease-out';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
    }
    
    private getAlertIcon(type: 'success' | 'error' | 'warning'): string {
        switch(type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }
    
    private getAlertColor(type: 'success' | 'error' | 'warning'): string {
        switch(type) {
            case 'success': return '#2ecc71';
            case 'error': return '#e74c3c';
            case 'warning': return '#f39c12';
            default: return '#3498db';
        }
    }
}

// Export for use in index.ts
export { EventManagerApp };