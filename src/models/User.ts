export class User {
    private static nextId: number = 1;
    
    public readonly id: number;
    public fullName: string;
    public email: string;
    public registeredAt: Date;
    public isAdmin: boolean = false;

    constructor(fullName: string, email: string, isAdmin: boolean = false) {
        this.id = User.nextId++;
        this.fullName = fullName;
        this.email = email.toLowerCase();
        this.registeredAt = new Date();
        this.isAdmin = isAdmin;
    }

    validateEmail(): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(this.email);
    }

    validateInstitutionalEmail(): boolean {
        // Check if email ends with .edu or contains institutional domains
        const institutionalDomains = ['.edu', '.ac.', '.school', '.college', '.university'];
        const emailLower = this.email.toLowerCase();
        return institutionalDomains.some(domain => emailLower.includes(domain));
    }

    get formattedRegistrationDate(): string {
        return this.registeredAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    toJSON(): object {
        return {
            id: this.id,
            fullName: this.fullName,
            email: this.email,
            registeredAt: this.registeredAt.toISOString(),
            isAdmin: this.isAdmin
        };
    }
}