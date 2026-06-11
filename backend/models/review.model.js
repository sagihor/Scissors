/**
 * Review Model
 * ------------
 * Defines the "reviews" table. Each review is written by a User about a
 * Barbershop, with a star rating (1–5) and a text comment.
 *
 * Turns the old reviews mock data into real, related DB records, and gives
 * the AI recommender real customer feedback to reason over.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  reviewId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rating: {
    type: DataTypes.INTEGER, // 1–5
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  // FK → the barbershop being reviewed
  barbershopId: { type: DataTypes.INTEGER, allowNull: false },
  // FK → the user who wrote it
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
});

module.exports = Review;