Users:
{
  _id: ObjectId,
  phone: String (required, unique, indexed),
  passwordHash: String (required),          // bcrypt, never plain
  name: String (required),
  role: String (enum: "customer" | "barber" | "owner"),
  profileImageUrl: String (nullable),
  email: String (nullable),
  
  // customer-only
  preferredBarberId: ObjectId (nullable, refs users),
  
  // barber-only
  barbershopId: ObjectId (nullable, refs barbershops),
  bio: String (nullable),
  specialties: [String],
  personalWorkingHours: Object (nullable),  // overrides shop hours
  
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date (nullable)
}

Barbershops:
{
  _id: ObjectId,
  name: String (required),
  ownerId: ObjectId (required, refs users),
  
  address: {
    street: String,
    city: String,
    country: String,
    fullText: String
  },
  
  location: {
    type: "Point",
    coordinates: [Number, Number]           // [longitude, latitude]
  },
  // ⚠ 2dsphere index on `location`
  
  phone: String,
  description: String,
  coverImageUrl: String,
  galleryImages: [String],
  
  workingHours: {
    sunday: { open: "09:00", close: "20:00", isClosed: Boolean },
    monday: { open, close, isClosed },
    // ... through saturday
  },
  
  rating: {
    average: Number,
    count: Number
  },
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Services:
{
  _id: ObjectId,
  barbershopId: ObjectId (required, indexed, refs barbershops),
  name: String (required),
  description: String,
  price: Number (required),
  durationMinutes: Number (required),
  category: String (enum: "hair" | "beard" | "combo" | "other"),
  isActive: Boolean (default true),
  createdAt: Date
}

Appointments:
{
  _id: ObjectId,
  customerId: ObjectId (required, indexed, refs users),
  barberId: ObjectId (required, indexed, refs users),
  barbershopId: ObjectId (required, refs barbershops),
  serviceId: ObjectId (required, refs services),
  
  startTime: Date (required, indexed),
  endTime: Date (required),
  // ⚠ compound index (barberId, startTime)
  
  status: String (enum: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"),
  
  // Snapshots (prices can change later)
  priceAtBooking: Number,
  serviceNameAtBooking: String,
  
  notes: String (nullable),
  
  createdAt: Date,
  confirmedAt: Date (nullable),
  cancelledAt: Date (nullable),
  cancellationReason: String (nullable),
  cancelledBy: String (enum: "customer" | "barber" | "system", nullable)
}

PortfolioItems:
{
  _id: ObjectId,
  barberId: ObjectId (required, indexed, refs users),
  barbershopId: ObjectId (refs barbershops),
  imageUrl: String (required),
  caption: String,
  tags: [String],
  uploadedAt: Date
}

haircutSimulations:
{
  _id: ObjectId,
  userId: ObjectId (required, indexed, refs users),
  inputImageUrl: String,
  resultImageUrl: String,
  prompt: String,
  styleCategory: String,
  createdAt: Date,
  shareableWithBarberId: ObjectId (nullable)
}

reviews:
{
  _id: ObjectId,
  appointmentId: ObjectId (required, unique, refs appointments),
  customerId: ObjectId (required, refs users),
  barbershopId: ObjectId (required, indexed, refs barbershops),
  barberId: ObjectId (required, indexed, refs users),
  rating: Number (1-5, required),
  comment: String,
  createdAt: Date
}

