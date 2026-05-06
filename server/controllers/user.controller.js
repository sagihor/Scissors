const userModel = require('../models/user.model');

// Utility function to send formatted error responses
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

// Utility function to send formatted success responses
const sendSuccess = (res, status, data) => {
    return res.status(status).json({
        success: true,
        data: data,
        error: null
    });
};

module.exports = {
    // GET /users - Returns a list of all users
    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.findAll();
            return sendSuccess(res, 200, users);
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // GET /users/:id - Returns a specific user by ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await userModel.findById(id);
            
            if (!user) {
                return sendError(res, 404, "NOT_FOUND", `User with ID ${id} not found.`);
            }
            return sendSuccess(res, 200, user);
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // POST /users - Creates a new user and returns their ID
    createUser: async (req, res) => {
        try {
            const { firstName, lastName, userRole } = req.body;
            
            // Validation: Ensure all required fields exist
            if (!firstName || !lastName || !userRole) {
                return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields.", { 
                    required: ["firstName", "lastName", "userRole"] 
                });
            }
            
            const newUser = await userModel.create({ firstName, lastName, userRole });
            return sendSuccess(res, 201, { userId: newUser.userId }); 
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // PUT /users/:id - Updates an existing user and returns their ID
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { firstName, lastName, userRole } = req.body;

            // Validation: Ensure all required fields exist for update
            if (!firstName || !lastName || !userRole) {
                return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields for update.", {
                    required: ["firstName", "lastName", "userRole"]
                });
            }
            
            // Invalid ID check
            const existingUser = await userModel.findById(id);
            if (!existingUser) {
                return sendError(res, 404, "NOT_FOUND", `User with ID ${id} not found.`);
            }
            
            const updatedUser = await userModel.updateById(id, { firstName, lastName, userRole });
            return sendSuccess(res, 200, { userId: updatedUser.userId });
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // DELETE /users/:id - Deletes a user and returns their ID
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const isDeleted = await userModel.deleteById(id);
            
            // Invalid ID
            if (!isDeleted) {
                return sendError(res, 404, "NOT_FOUND", `User with ID ${id} not found.`);
            }
        
            return sendSuccess(res, 200, { userId: parseInt(id) });
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    }
};