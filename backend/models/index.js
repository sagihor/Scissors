/**
 * Models Index (Associations Hub)
 * -------------------------------
 * Central file that imports every ORM model and defines the relationships
 * between them. Importing models from THIS file (instead of each model file
 * directly) guarantees that all associations are registered before use.
 *
 * Relationships defined here:
 *   - One-to-one:   User <-> Admin        (a user may have one admin profile)
 *   - One-to-one:   User <-> Setting      (a user has one settings row)
 *   - One-to-many:  Barbershop -> Service (a shop offers many services)
 *   - Many-to-many: User <-> Barbershop   (barbers work at shops, via junction)
 *
 * Assignment mapping: provides the required ORM relationships, including at
 * least one ONE-TO-MANY and one MANY-TO-MANY.
 */

const sequelize = require('../config/database');

// Import all models
const User = require('./user.model');
const Admin = require('./admin.model');
const Barbershop = require('./barbershop.model');
const Service = require('./service.model');
const BarbershopBarber = require('./barbershopBarber.model');
const Setting = require('./setting.model');
const Message = require('./message.model');
const Review = require('./review.model');

/* ------------------------------------------------------------------ */
/* One-to-one: a User may have one Admin profile                       */
/* ------------------------------------------------------------------ */
// User.userId is the source; Admin.userId is the foreign key pointing back.
User.hasOne(Admin, { foreignKey: 'userId', sourceKey: 'userId' });
Admin.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId' });

/* ------------------------------------------------------------------ */
/* One-to-one: a User has exactly one Setting row                      */
/* ------------------------------------------------------------------ */
User.hasOne(Setting, { foreignKey: 'userId', sourceKey: 'userId' });
Setting.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId' });

/* ------------------------------------------------------------------ */
/* One-to-many: a User can send many Messages                          */
/* ------------------------------------------------------------------ */
User.hasMany(Message, { foreignKey: 'userId', sourceKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId' });

/* ------------------------------------------------------------------ */
/* One-to-many: a Barbershop has many Services                         */
/* ------------------------------------------------------------------ */
// One shop -> many services; each service belongs to one shop.
Barbershop.hasMany(Service, { foreignKey: 'barbershopId', sourceKey: 'barbershopId' });
Service.belongsTo(Barbershop, { foreignKey: 'barbershopId', targetKey: 'barbershopId' });

/* ------------------------------------------------------------------ */
/* One-to-many: a Barbershop has many Reviews; a User writes many       */
/* ------------------------------------------------------------------ */
Barbershop.hasMany(Review, { foreignKey: 'barbershopId', sourceKey: 'barbershopId' });
Review.belongsTo(Barbershop, { foreignKey: 'barbershopId', targetKey: 'barbershopId' });

User.hasMany(Review, { foreignKey: 'userId', sourceKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId' });

/* ------------------------------------------------------------------ */
/* Many-to-many: Users (barbers) <-> Barbershops, via the junction     */
/* ------------------------------------------------------------------ */
// A barber can work at several shops; a shop employs several barbers.
// The BarbershopBarber table is the join (junction) table connecting them.
// The `as` aliases let us load related records with clear names in JOINs,
// e.g. Barbershop.findAll({ include: 'barbers' }).
User.belongsToMany(Barbershop, {
  through: BarbershopBarber,
  foreignKey: 'userId',
  otherKey: 'barbershopId',
  as: 'barbershops', // a barber's shops
});
Barbershop.belongsToMany(User, {
  through: BarbershopBarber,
  foreignKey: 'barbershopId',
  otherKey: 'userId',
  as: 'barbers', // a shop's barbers
});

/* ------------------------------------------------------------------ */
/* Export everything from one place                                    */
/* ------------------------------------------------------------------ */
module.exports = {
  sequelize,
  User, Admin, Barbershop, Service, BarbershopBarber, Setting, Message,
  Review, 
};