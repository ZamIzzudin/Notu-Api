import { Router, Request, Response } from 'express';
import { Note, INote } from '../models/Note';
import { uploadImage, deleteImage } from '../config/cloudinary';

const router = Router();

// Get all notes
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId: userId as string } : {};
    const notes = await Note.find(query).sort({ date: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, color, images, userId } = req.body;

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
      userId,
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, color, images } = req.body;
    const existingNote = await Note.findById(req.params.id);

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
    const existingImageIds = existingNote.images.map((img) => img.id);
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);
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
router.post('/upload', async (req: Request, res: Response) => {
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
