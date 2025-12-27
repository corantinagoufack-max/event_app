export class Event {
    private static nextId: number = 1;
    
    public readonly id: number;
    public title: string;
    public description: string;
    public date: Date;
    public location: string;
    public category: 'conference' | 'sport' | 'workshop' | 'other';
    public maxCapacity: number;
    public currentRegistrations: number = 0;
    public createdAt: Date;
    public adminId: number;

    constructor(
        title: string,
        description: string,
        date: Date,
        location: string,
        category: 'conference' | 'sport' | 'workshop' | 'other',
        maxCapacity: number,
        adminId: number
    ) {
        this.id = Event.nextId++;
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.category = category;
        this.maxCapacity = maxCapacity;
        this.createdAt = new Date();
        this.adminId = adminId;
    }

    get isFull(): boolean {
        return this.currentRegistrations >= this.maxCapacity;
    }

    get isPast(): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(this.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
    }

    get capacityPercentage(): number {
        return Math.min((this.currentRegistrations / this.maxCapacity) * 100, 100);
    }

    get formattedDate(): string {
        return this.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    get status(): 'available' | 'full' | 'past' {
        if (this.isPast) return 'past';
        if (this.isFull) return 'full';
        return 'available';
    }

    incrementRegistrations(): void {
        if (!this.isFull) {
            this.currentRegistrations++;
        }
    }

    canRegister(): { can: boolean; reason?: string } {
        if (this.isPast) {
            return { can: false, reason: 'Cannot register for past events' };
        }
        if (this.isFull) {
            return { can: false, reason: 'Event is full' };
        }
        return { can: true };
    }

    toJSON(): object {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            date: this.date.toISOString(),
            location: this.location,
            category: this.category,
            maxCapacity: this.maxCapacity,
            currentRegistrations: this.currentRegistrations,
            createdAt: this.createdAt.toISOString(),
            adminId: this.adminId
        };
    }
}