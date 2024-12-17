export default class EventSourceBase {
    protected base_url: string = process.env.NEXT_PUBLIC_API_URL || '';
    protected url: string = '';

    buildUrl() {
        if (!this.base_url) {
            throw new Error('Base URL is not defined');
        }
        return `${this.base_url}/${this.url}`;
    }

    getEventSource() {
        const url = this.buildUrl();
        return new EventSource(url);
    }
}
