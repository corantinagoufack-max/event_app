import { EventManagerApp } from './main.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new EventManagerApp();
    
    // Add keyboard shortcut for closing modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('event-modal');
            if (modal && modal.style.display === 'block') {
                const closeBtn = modal.querySelector('.close-modal') as HTMLElement;
                if (closeBtn) closeBtn.click();
            }
        }
    });
});