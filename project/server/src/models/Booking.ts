import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: string;
  parkingSpotId: string;
  parkingSpotName: string;
  date: string;
  fromTime: string;
  toTime: string;
  status: 'confirmed' | 'cancelled';
  createdAt: Date;
  price: number;
}

const BookingSchema: Schema = new Schema({
  userId: { type: String, required: true },
  parkingSpotId: { type: String, required: true },
  parkingSpotName: { type: String, required: true },
  date: { type: String, required: true },
  fromTime: { type: String, required: true },
  toTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  price: { type: Number, required: true }
});

export default mongoose.model<IBooking>('Booking', BookingSchema); 