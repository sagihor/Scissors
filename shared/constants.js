const ROLES = {
  CUSTOMER: 'customer',
  BARBER: 'barber',
  OWNER: 'owner'
};

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// אנחנו מייצאים את זה בשיטה שהשרת (Node.js) מבין, 
// וה-React שלנו (Vite) חכם מספיק כדי להבין את זה גם.
module.exports = {
  ROLES,
  APPOINTMENT_STATUS
};