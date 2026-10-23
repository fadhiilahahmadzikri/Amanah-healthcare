export function printDocument(title = 'Clinical-Form'): void {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  // Restore title after dialog closes
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}
