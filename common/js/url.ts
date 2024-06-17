export const urlPort = (url: string): number => {
  if (!url.match(/^[a-z]+:\/\//)) {
    url = `http://${url}`;
  }
  const port = new URL(url).port;
  if (port) {
    return parseInt(port);
  }
  return 80;
};

export const removeUrlPort = (url: string): string => {
  const port = urlPort(url);
  return url.replace(`:${port}`, "");
};

export const normalizeUrl = (url: string): string => {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

export const removeUrlParams = (url: string): string => {
  return url.split("?")[0];
};
