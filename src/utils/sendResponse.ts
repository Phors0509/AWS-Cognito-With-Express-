interface IResponse {
  message: string;
  data?: any;
  status?: number;
}

export function sendResponse({ message, data, status = 200 }: IResponse) {
  return {
    status,
    message,
    data,
  };
}
