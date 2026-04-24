export interface SessionResponse {
    data: {
        accessToken: string;
        refreshToken: string;
    };
    statusCode: number;
    timestamp: string;
}