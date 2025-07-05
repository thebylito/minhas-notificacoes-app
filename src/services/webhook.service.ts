export class WebhookService {
  private webhookUrl: string;

  constructor(url: string) {
    this.webhookUrl = url;
  }

  private async makeRequest(body: any): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
      throw error;
    }
  }

  async emit(data: any): Promise<void> {
    if (!data) {
      console.warn('Invalid data, skipping webhook emit');
      return Promise.reject()
    }
    await this.makeRequest(data);
  }
}
