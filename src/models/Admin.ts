import { User } from './User.js';

export class Admin extends User {
    public role: 'super' | 'event_manager' | 'viewer';
    public permissions: string[];

    constructor(
        fullName: string, 
        email: string, 
        role: 'super' | 'event_manager' | 'viewer' = 'event_manager',
        permissions: string[] = []
    ) {
        super(fullName, email, true);
        this.role = role;
        this.permissions = permissions.length > 0 ? permissions : this.getDefaultPermissions(role);
    }

    private getDefaultPermissions(role: 'super' | 'event_manager' | 'viewer'): string[] {
        switch (role) {
            case 'super':
                return ['create_events', 'edit_events', 'delete_events', 'view_registrations', 'manage_users'];
            case 'event_manager':
                return ['create_events', 'edit_events', 'view_registrations'];
            case 'viewer':
                return ['view_registrations'];
            default:
                return ['view_registrations'];
        }
    }

    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    canCreateEvents(): boolean {
        return this.hasPermission('create_events');
    }

    static validateAdminCredentials(email: string, password: string): boolean {
        // For demo purposes, we'll use simple validation
        // In a real system, passwords would be hashed and stored securely
        const adminCredentials = [
            { email: 'admin@eventmanager.com', password: 'Admin@123' },
            { email: 'manager@university.edu', password: 'Manager@2025' },
            { email: 'coordinator@events.org', password: 'Coord@2025' }
        ];
        
        return adminCredentials.some(cred => 
            cred.email === email.toLowerCase() && cred.password === password
        );
    }

    static getAdminByEmail(email: string): Admin | null {
        const admins = [
            new Admin('System Administrator', 'admin@eventmanager.com', 'super'),
            new Admin('University Manager', 'manager@university.edu', 'event_manager'),
            new Admin('Event Coordinator', 'coordinator@events.org', 'event_manager')
        ];
        
        return admins.find(admin => admin.email === email.toLowerCase()) || null;
    }

    toJSON(): object {
        return {
            ...super.toJSON(),
            role: this.role,
            permissions: this.permissions
        };
    }
}