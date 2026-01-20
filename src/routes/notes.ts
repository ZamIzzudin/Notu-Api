import { Router, Response } from 'express';
import { Note, INote } from '../models/Note';
import { uploadImage, deleteImage } from '../config/cloudinary';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all notes for authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ date: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, color, images } = req.body;

    const uploadedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.url.startsWith('data:')) {
          const uploaded = await uploadImage(img.url);
          uploadedImages.push({
            id: img.id || Date.now().toString(),
            url: uploaded.url,
            publicId: uploaded.publicId,
          });
        } else {
          uploadedImages.push(img);
        }
      }
    }

    const note = new Note({
      title: title || 'Tanpa Judul',
      content,
      color,
      images: uploadedImages,
      userId: req.userId,
      date: new Date(),
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, color, images } = req.body;
    const existingNote = await Note.findOne({ _id: req.params.id, userId: req.userId });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const uploadedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.url.startsWith('data:')) {
          const uploaded = await uploadImage(img.url);
          uploadedImages.push({
            id: img.id || Date.now().toString(),
            url: uploaded.url,
            publicId: uploaded.publicId,
          });
        } else {
          uploadedImages.push(img);
        }
      }
    }

    // Delete removed images from Cloudinary
    const newImageIds = images?.map((img: { id: string }) => img.id) || [];
    const removedImages = existingNote.images.filter(
      (img) => !newImageIds.includes(img.id)
    );

    for (const img of removedImages) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title || 'Tanpa Judul',
        content,
        color,
        images: uploadedImages,
        date: new Date(),
      },
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete images from Cloudinary
    for (const img of note.images) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Upload image only
router.post('/upload', async (req: AuthRequest, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const uploaded = await uploadImage(image);
    res.json({
      id: Date.now().toString(),
      url: uploaded.url,
      publicId: uploaded.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
