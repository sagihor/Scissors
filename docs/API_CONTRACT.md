Authentication:

POST /api/auth/register
Auth: Public
Body: { phone, password, user_name, role: "customer"|"barber" }
200: { token, user: {id, phone, user_name, role} }
400: { error: "Phone already exists" | "Missing fields" }

POST /api/auth/login
Auth: Public
Body: { phone, password, user_name }
200: { token, user_name }
401: { error: "Invalid credentials" }


GET /api/auth/me
Auth: Bearer token
200: { user: {id, phone, name, role, profileImageUrl, ...} }
401: { error: "Invalid token" }


PATCH /api/auth/update-me
  Auth: Bearer token
  Body: { name, profileImageUrl, preferences }
  200: { user }



Users:
GET /api/users/:id
Auth: Bearer token
200: { id, name, role, profileImageUrl, bio (if barber) }

PATCH /api/users/:id
Auth: Bearer token (must be self)
Body: { name?, profileImageUrl?, preferredBarberId?, bio? }
200: { user }
403: { error: "Can only update own profile" }

GET /api/users/:id/appointments
Auth: Bearer token (must be self)
Query: ?status=upcoming|past|all
200: [{ appointment }, ...]

GET /api/users/:id/haircut-history
Auth: Bearer token
200: [{ appointmentId, serviceNameAtBooking, date, barberName, barbershopName }, ...]


Barbershops:

GET /api/barbershops/nearby
Auth: Bearer token
Query: ?lat=32.08&lng=34.78&radius=5000&serviceType=haircut&availableAt=ISO_DATETIME
200: [{ id, name, address, location, rating, distanceMeters, nextAvailableSlot }, ...]

GET /api/barbershops/:id
Auth: Bearer token
200: { id, name, address, location, workingHours, rating, description,
       coverImageUrl, galleryImages, barbers: [{id,name,imageUrl}], services: [...] }

POST /api/barbershops
Auth: Bearer token (role=owner)
Body: { name, address, location, workingHours, description }
201: { barbershop }

PATCH /api/barbershops/:id
Auth: Bearer token (must be owner)
Body: partial fields
200: { barbershop }

GET /api/barbershops/:id/portfolio
Auth: Bearer token
200: [{ id, imageUrl, caption, tags, barberId }, ...]

POST /api/barbershops/:id/portfolio
Auth: Bearer token (owner or barber at shop)
Body: { imageUrl, caption, tags, barberId }
201: { portfolioItem }


Barbers:

GET /api/barbershops/:id/barbers
Auth: Bearer token
200: [{ id, name, profileImageUrl, specialties, rating }, ...]

GET /api/barbers/:id
Auth: Bearer token
200: { id, name, bio, specialties, profileImageUrl, barbershopId, rating }

GET /api/barbers/:id/availability
Auth: Bearer token
Query: ?date=2026-04-25&serviceId=sv_12
200: { date, slots: ["09:00","09:30","10:00",...] }

GET /api/barbers/:id/calendar
Auth: Bearer token (must be self)
Query: ?from=2026-04-20&to=2026-04-27
200: [{ appointmentId, customerName, customerId, startTime, endTime, serviceName, status }, ...]

PATCH /api/barbers/:id/working-hours
Auth: Bearer token (must be self)
Body: { sunday: {open,close,isClosed}, monday: {...}, ... }
200: { workingHours }


Services:

GET /api/barbershops/:id/services
Auth: Bearer token
200: [{ id, name, description, price, durationMinutes, category }, ...]

POST /api/barbershops/:id/services
Auth: Bearer token (owner)
Body: { name, description, price, durationMinutes, category }
201: { service }

PATCH /api/services/:id
Auth: Bearer token (owner of service's shop)
Body: partial
200: { service }

DELETE /api/services/:id
Auth: Bearer token (owner)
204



Appointments:

POST /api/appointments
Auth: Bearer token
Body: { barberId, serviceId, startTime, notes? }
201: { appointment: {id, startTime, endTime, status:"confirmed", ...} }
409: { error: "Slot no longer available" }

GET /api/appointments/:id
Auth: Bearer token (customer or the barber)
200: { appointment with populated fields }

PATCH /api/appointments/:id
Auth: Bearer token (customer or barber)
Body: { startTime? , status?, notes? }
200: { appointment }
409: { error: "Cannot reschedule to taken slot" }

DELETE /api/appointments/:id
Auth: Bearer token
Body: { cancellationReason? }
204

POST /api/appointments/quick-book
Auth: Bearer token (customer)
Body: { barbershopId, serviceId }  // books the next available slot right now
201: { appointment }
409: { error: "No slots available today" }


Reviews:
POST /api/reviews
Auth: Bearer token (customer with completed appointment)
Body: { appointmentId, rating: 1-5, comment }
201: { review }

GET /api/barbershops/:id/reviews
Auth: Public
Query: ?page=1&limit=10
200: { reviews: [...], total, avgRating }

GET /api/barbers/:id/reviews
Auth: Public
200: { reviews: [...], total, avgRating }


AI:

POST /api/ai/simulate-haircut       [A]
Auth: Bearer token
Body: { imageBase64, stylePrompt, styleCategory? }
200: { resultImageUrl, simulationId }
500: { error: "AI generation failed" }

POST /api/ai/business-insights      [B]
Auth: Bearer token (owner)
Body: { barbershopId, dateRange: {from,to} }
200: { insights: "string", recommendations: [...], rawStats: {...} }

POST /api/ai/chatbot                [B, optional]
Auth: Bearer token
Body: { message, conversationId? }
200: { response, conversationId, suggestedActions?: [...] }


Dashboard: 

GET /api/barbershops/:id/stats/overview
Auth: Bearer token (owner)
Query: ?from=2026-04-01&to=2026-04-30
200: { totalRevenue, totalAppointments, uniqueCustomers, avgAppointmentValue, busiestDay, busiestHour }

GET /api/barbershops/:id/stats/services
Auth: Bearer token (owner)
200: [{ serviceName, count, revenue }, ...]

GET /api/barbershops/:id/stats/barbers
Auth: Bearer token (owner)
200: [{ barberName, appointmentCount, revenue, avgRating }, ...]

GET /api/barbershops/:id/stats/timeline
Auth: Bearer token (owner)
Query: ?granularity=day|week|month
200: [{ date, revenue, appointmentCount }, ...]


Utility:

GET /api/health
200: { status: "ok" }

POST /api/upload/image
Auth: Bearer token
Body: multipart/form-data with file
201: { imageUrl }