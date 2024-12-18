const {Role, ModuleAccess} = require("../models/moduleAccessModal");
const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");

// const addRole = async (req, res) => {
//   return res.send("api hitted")
// }
const addRole = async (req, res) => {
  try {
    // Create a new role document in the Role collection
    const role = await Role.create({
      label: req.body.label,
      level: req.body.level,
    });
    // console.log("role created", role)
    // Check if role was successfully created
    if (role) {
          await ModuleAccess.updateMany(
            {},  // update all documents
            { 
                $addToSet: { 
                    accessibleTo: { 
                        roleLabel: role.label,
                        roleLevel: role.level,
                        hasAccess: false 
                    }
                }
            }
          );
      res.status(200).json({
        status: true,
        message: "Role created successfully.",
        data: role,
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Failed to create the role. Please try again.",
      });
    }
  } catch (error) {
    console.log("error", error)
    // Check if it's a Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Validation failed.",
        errors: error.errors, // Provides specific validation errors
      });
    }

    // Check for duplicate key error (e.g., unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Role label already exists. Please choose a different label.",
      });
    }

    // General server error for other types of errors
    res.status(500).json({
      status: false,
      message: "An unexpected error occurred.",
      error: error.message, // Consider removing this in production
    });
  }
};

const addModule = async (req, res, next) => {
  try {
    const data = await ModuleAccess.create({
      ...req.body
    })

    if (data) {
      res.status(200).json({
        status: true,
        message: "Module created successfully.",
        data
      })
    } else {
      res.status(400).json({
        status: false,
        message: "Failed to create the module. Please try again."
      });
    }
  } catch (error) {
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: false,
        message: "Validation failed.",
        errors: error.errors, // Provides specific validation errors
      });
    }

    // Check for duplicate key error (e.g., unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Module name already exists. Please choose a different name."
      });
    }

    // General server error for other types of errors
    res.status(500).json({
      status: false,
      message: error.message,
    })
  }
}

const getModule = async (req, res, next) => {
  try {
    if (req.user.role === "superadmin") {
      const modules = await ModuleAccess.find(); // Retrieve all documents from the collection

      if (modules) {
        res.status(200).json({
          status: true,
          message: "Modules fetched successfully.",
          data: modules
        });
      } else {
        res.status(404).json({
          status: false,
          message: "No modules found."
        });
      }
    }else {
        // Retrieve modules with IDs in the provided array
        const user = req.user.role === "admin" ? await NewUser.findById(req.user?._id) : await OtherUser.findById(req.user?._id);

        if (user) {
            res.status(200).json({
                status: true,
                message: "Modules fetched successfully.",
                data: user.moduleAccess
            });
        } else {
            res.status(404).json({
                status: false,
                message: "User modules not found."
            });
        }
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error: error,
    })
  }
}

const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params
    const data = await ModuleAccess.findById(id)
    if (data) {
      await ModuleAccess.findByIdAndDelete(id)
      res.status(200).json({
        status: true,
        message: "Module deleted successfully."
      })
    } else {
      res.status(404).json({
        status: false,
        message: "Module not found"
      })
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error: error,
    })
  }
}

const editModule = async (req, res, next) => {
  try {
    const data = await ModuleAccess.findByIdAndUpdate(req.params.id, {
      ...req.body
    }, { new: true })

    if (data) {
      res.status(200).json({
        status: true,
        message: 'Module updated successfully.',
        data
      })
    } else {
      res.status(404).json({
        status: false,
        message: "Module not found!"
      })
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}

const editModuleAccessibility = async(req, res, next) => {
  try {
    if(req?.user?.role === "superadmin"){
      const adminData = await NewUser.findById(req?.params?.id)
      // console.log("adminData", adminData)
      if(adminData){
        adminData.moduleAccess = req.body.moduleAccess
        const updatedAdminData = await adminData.save()
        res.status(200).json({
          status: true,
          message: 'Module editted successfully.',
          data: updatedAdminData
        })
      }else{
        res.status(404).json({
          status: false,
          message: "Admin not found!"
        })
      }
    }else if(req?.user?.role === "admin"){
      const employeeData = await OtherUser.findById(req?.params?.id)
      // console.log("employeeData", employeeData)
      if(employeeData){
        employeeData.moduleAccess = req.body.moduleAccess
        const updatedEmployeeData = await employeeData.save()
        res.status(200).json({
          status: true,
          message: 'Module editted successfully.',
          data: updatedEmployeeData
        })
      }else{
        res.status(404).json({
          status: false,
          message: "Employee not found!"
        })
      }
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error: error,
    })
  }
}

const getAllRoles = async (req, res) => {
  try {
     const roles = await Role.find()     
     res.status(200).json({
      status: true,
      message: 'All Roles.',
      data: roles
    })
  } catch (error) {
      res.status(500).json({
          message: "Something went Wrong ?", error
      });
  }
}

module.exports = { addRole,getAllRoles, addModule, getModule, deleteModule, editModule, editModuleAccessibility }