const barbershopModel = require('../models/barbershop.model');

//Utility function to send formatted error responses
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

//Utility function to send formatted success responses
const sendSuccess = (res, status, data) => {
    return res.status(status).json({
        success: true,
        data: data,
        error: null
    });
};

module.exports = {
    // GET /barbershops - Returns a list of all barbershops
    getAllBarbershops: async (req, res) => {
        try {
            const shops = await barbershopModel.findAll();
            return sendSuccess(res, 200, shops);
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // GET /barbershops/:id - Returns a specific barbershop by ID
    getBarbershopById: async (req, res) => {
        try {
            const { id } = req.params;
            const shop = await barbershopModel.findById(id);
            
            if (!shop) {
                return sendError(res, 404, "NOT_FOUND", "Barbershop not found.");
            }
            return sendSuccess(res, 200, shop);
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // POST /barbershops - Creates a new barbershop and returns its ID
    createBarbershop: async (req, res) => {
        try {
            const { name, address, phone } = req.body;

            // Validation: Ensure all required fields are provided
            if (!name || !address || !phone) {
                return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields.", { 
                    required: ["name", "address", "phone"] 
                });
            }

            const newShop = await barbershopModel.create({ name, address, phone });
            return sendSuccess(res, 201, { barbershopId: newShop.barbershopId });
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // PUT /barbershops/:id - Updates an existing barbershop and returns its ID
    updateBarbershop: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, address, phone } = req.body;

            // Validation: Ensure all required fields are provided for the update
            if (!name || !address || !phone) {
                return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields for update.", {
                    required: ["name", "address", "phone"]
                });
            }

            // Check Invalid ID
            const existingShop = await barbershopModel.findById(id);
            if (!existingShop) {
                return sendError(res, 404, "NOT_FOUND", `Barbershop with ID ${id} not found.`);
            }

            const updatedShop = await barbershopModel.updateById(id, { name, address, phone });
            return sendSuccess(res, 200, { barbershopId: updatedShop.barbershopId });
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    },

    // DELETE /barbershops/:id - Deletes a barbershop and returns its ID
    deleteBarbershop: async (req, res) => {
        try {
            const { id } = req.params;
            const isDeleted = await barbershopModel.deleteById(id);
            
            //Invalid ID
            if (!isDeleted) {
                return sendError(res, 404, "NOT_FOUND", "Barbershop not found.");
            }
            
            return sendSuccess(res, 200, { barbershopId: parseInt(id) });
        } catch (error) {
            return sendError(res, 500, "SERVER_ERROR", "Database error occurred.", error.message);
        }
    }
};