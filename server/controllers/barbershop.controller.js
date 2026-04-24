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
    getAllBarbershops: (req, res) => {
        return sendSuccess(res, 200, barbershopModel.findAll());
    },

    // GET /barbershops/:id - Returns a specific barbershop by ID
    getBarbershopById: (req, res) => {
        const { id } = req.params;
        const shop = barbershopModel.findById(id);
        
        if (!shop) {
            return sendError(res, 404, "NOT_FOUND", "Barbershop not found.");
        }
        return sendSuccess(res, 200, shop);
    },

    // POST /barbershops - Creates a new barbershop and returns its ID
    createBarbershop: (req, res) => {
        const { name, address, phone } = req.body;

        // Validation: Ensure all required fields are provided
        if (!name || !address || !phone) {
            return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields.", { 
                required: ["name", "address", "phone"] 
            });
        }

        const newShop = barbershopModel.create({ name, address, phone });
        return sendSuccess(res, 201, { barbershopId: newShop.barbershopId });
    },

    // PUT /barbershops/:id - Updates an existing barbershop and returns its ID
    updateBarbershop: (req, res) => {
        const { id } = req.params;
        const { name, address, phone } = req.body;

        // Validation: Ensure all required fields are provided for the update
        if (!name || !address || !phone) {
            return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields for update.", {
                required: ["name", "address", "phone"]
            });
        }

        // Check Invalid ID
        const existingShop = barbershopModel.findById(id);
        if (!existingShop) {
            return sendError(res, 404, "NOT_FOUND", `Barbershop with ID ${id} not found.`);
        }

        const updatedShop = barbershopModel.updateById(id, { name, address, phone });
        return sendSuccess(res, 200, { barbershopId: updatedShop.barbershopId });
    },

    // DELETE /barbershops/:id - Deletes a barbershop and returns its ID
    deleteBarbershop: (req, res) => {
        const { id } = req.params;
        const isDeleted = barbershopModel.deleteById(id);
        
        //Invalid ID
        if (!isDeleted) {
            return sendError(res, 404, "NOT_FOUND", "Barbershop not found.");
        }
        
        return sendSuccess(res, 200, { barbershopId: parseInt(id) });
    }
};