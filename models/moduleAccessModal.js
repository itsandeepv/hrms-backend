const mongoose = require("mongoose");

// Role schema and model
const roleSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true, 
    },
    level: {
        type: Number,
        required: true,  
    }
});

// Module Access schema and model
const moduleAccessSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    isEnabled: {
        type: Boolean,
        default: false,
    },
    accessibleTo: [{
        roleLabel: String,
        roleLevel: String,
        hasAccess: {
            type: Boolean,
            default: false
        }
    }]
}, {timestamps: true});

const Role = mongoose.model("Role", roleSchema);

// Middleware to populate accessibleTo with all roles when a new ModuleAccess is created
moduleAccessSchema.pre("save", async function(next) {
    if (this.isNew) {  // Only run on new documents
        try {
            // Fetch all roles from the Role collection
            const roles = await Role.find({}, "label level");
            // Initialize accessibleTo with all roles and hasAccess set to false
            this.accessibleTo = roles.map(role => ({
                roleLabel: role.label,
                roleLevel: role.level,
                hasAccess: false
            }));
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const ModuleAccess = mongoose.model("ModuleAccess", moduleAccessSchema);

// Middleware to update ModuleAccess whenever a new Role is added
// roleSchema.post("save", async function(doc, next) {
//     console.log("Post-save middleware triggered for role:", doc)
//     try {
//         await ModuleAccess.updateMany(
//             {},  // update all documents
//             { 
//                 $addToSet: { 
//                     accessibleTo: { 
//                         roleLabel: doc.label, 
//                         hasAccess: false 
//                     }
//                 }
//             }
//         );
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = { Role, ModuleAccess };
