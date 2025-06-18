import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user_id: string;
  order_id: string;
  content: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    user_id: { type: String, required: true },
    order_id: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
