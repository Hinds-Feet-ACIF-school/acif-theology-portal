export const handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }


  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;


  res.status(201).json({
    message: 'Image uploaded successfully',
    url: imageUrl
  });
};