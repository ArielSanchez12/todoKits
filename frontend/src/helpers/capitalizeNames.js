export const capitalizeFirstLetter = (string) => {
  if (!string) return "";

  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}