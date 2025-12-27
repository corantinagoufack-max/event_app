import { Event } from './Event.js';
import { User } from './User.js';

export class Registration {
    private static nextId: number = 1;
    
    public readonly id: number;
    public eventId: number;
    public userId: number;
    public registeredAt: Date;
    public status: 'confirmed' | 'waitlisted' | 'cancelled';

    constructor(eventId: number, userId: number) {
        this.id = Registration.nextId++;
        this.eventId = eventId;
        this.userId = userId;
        this.registeredAt = new Date();
        this.status = 'confirmed';
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

    cancel(): void {
        this.status = 'cancelled';
    }

    isActive(): boolean {
        return this.status === 'confirmed';
    }

    toJSON(): object {
        return {
            id: this.id,
            eventId: this.eventId,
            userId: this.userId,
            registeredAt: this.registeredAt.toISOString(),
            status: this.status
        };
    }
}