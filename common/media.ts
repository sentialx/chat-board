export interface Media {
  url?: string;
}

export const image = (url: string): Media => ({
  url,
});
