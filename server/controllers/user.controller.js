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
    getAllUsers: (req, res) => {
        const users = userModel.findAll();
        return sendSuccess(res, 200, users);
    },

    // GET /users/:id - Returns a specific user by ID
    getUserById: (req, res) => {
        const { id } = req.params;
        const user = userModel.findById(id);
        
        if (!user) {
            return sendError(res, 404, "NOT_FOUND", `User with ID ${id} not found.`);
        }
        return sendSuccess(res, 200, user);
    },

    // POST /users - Creates a new user and returns their ID
    createUser: (req, res) => {
        const { firstName, lastName, userRole } = req.body;
        
        // Validation: Ensure all required fields exist
        if (!firstName || !lastName || !userRole) {
            return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields.", { 
                required: ["firstName", "lastName", "userRole"] 
            });
        }
        
        const newUser = userModel.create({ firstName, lastName, userRole });
        return sendSuccess(res, 201, { userId: newUser.userId }); 
    },

    // PUT /users/:id - Updates an existing user and returns their ID
    updateUser: (req, res) => {
        const { id } = req.params;
        const { firstName, lastName, userRole } = req.body;

        // Validation: Ensure all required fields exist for update
        if (!firstName || !lastName || !userRole) {
            return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields for update.", {
                required: ["firstName", "lastName", "userRole"]
            });
        }
        // Invalid ID
        const existingUser = userModel.findById(id);
        if (!existingUser) {
            return sendError(res, 404, "NOT_FOUND", `User with ID ${id} not found.`);
        }
        
        const updatedUser = userModel.updateById(id, { firstName, lastName, userRole });
        return sendSuccess(res, 200, { userId: updatedUser.userId });
    },

    // DELETE /users/:id - Deletes a user and returns their ID
    deleteUser: (req, res) => {
        const { id } = req.params;
        const isDeleted = userModel.deleteById(id);
        // Invalid ID
        if (!isDeleted) {
            return sendError(res, 404, "NOT_FOUND", `User with ID ${id} not found.`);
        }
    
        return sendSuccess(res, 200, { userId: parseInt(id) });
    }
};