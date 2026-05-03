import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  distance: { type: String, required: true },
  availableConnectors: { type: Number, required: true },
  totalConnectors: { type: Number, required: true },
  price: { type: String, required: true },
  isFast: { type: Boolean, required: true },
  status: { type: String, enum: ['available', 'in-use', 'offline'], required: true },
  image: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { timestamps: true });

// Convert _id to id in JSON response
stationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

export const Station = mongoose.model('Station', stationSchema);
