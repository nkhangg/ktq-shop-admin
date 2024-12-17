import EventSourceBase from './event-source-base';

export default class ExpiredUseTimePasswordSSE extends EventSourceBase {
    public eventSource: EventSource | null = null;

    constructor(url: string) {
        super();
        this.url = `events-sse/use-time-password-expired/${url}`;

        try {
            this.eventSource = this.getEventSource();
            this.initializeEventSource();
        } catch (error) {
            console.error('Error initializing EventSource:', error);
        }
    }

    private initializeEventSource() {
        if (this.eventSource) {
            this.eventSource.onerror = this.onError;
        }
    }

    public onError(error: Event) {
        console.error('EventSource failed:', error);
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    public close() {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }
}
