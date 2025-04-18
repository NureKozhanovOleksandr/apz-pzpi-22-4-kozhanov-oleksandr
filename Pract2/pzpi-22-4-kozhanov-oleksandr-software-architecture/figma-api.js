fetch('https://api.figma.com/v1/files/{file_key}/components', {
  headers: { 'X-Figma-Token': 'YOUR_TOKEN' }
})
  .then(res => res.json())
  .then(data => console.log(data.meta));