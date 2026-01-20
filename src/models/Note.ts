import mongoose, { Document, Schema } from 'mongoose';

export interface IImage {
  id: string;
  url: string;
  publicId: string;
}

export interface INote extends Document {
  title: string;
  content: string;
  color: string;
  images: IImage[];
  date: Date;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>({
  id: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
});

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, default: 'Tanpa Judul' },
    content: { type: String, default: '' },
    color: { type: String, default: '#E9D5FF' },
    images: { type: [ImageSchema], default: [] },
    date: { type: Date, default: Date.now },
    userId: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

export const Note = mongoose.model<INote>('Note', NoteSchema);
