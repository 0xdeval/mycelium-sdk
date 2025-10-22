export const checkValidUrl = (url: string): boolean => {
  return /^https?:\/\/.+$/.test(url);
};
