import mongoose, { Document, Schema } from 'mongoose';

export interface IDelivery extends Document {
  delivery_id: string;
  order_id: string;
  rider_id: string;
  status: 'pending' | 'accepted' | 'collected' | 'delivered' | 'cancelled';
  restaurant_location: {
    longitude: number;
    latitude: number;
  };
  customer_location: {
    longitude: number;
    latitude: number;
  };
  accepted_at?: Date;
  collected_at?: Date;
  delivered_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const DeliverySchema: Schema = new Schema<IDelivery>(
  {
    delivery_id: { type: String, required: true, unique: true },
    order_id: { type: String, required: true, unique: true },
    rider_id: { type: String, required: false },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'accepted', 'collected', 'delivered', 'cancelled'],
      default: 'pending'
    },
    restaurant_location: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true }
    },
    customer_location: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true }
    },
    accepted_at: { type: Date },
    collected_at: { type: Date },
    delivered_at: { type: Date }
  },
  { 
    timestamps: { 
      createdAt: 'created_at', 
      updatedAt: 'updated_at' 
    } 
  }
);

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
