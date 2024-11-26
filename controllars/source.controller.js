const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");
const Source = require("../models/sourceModel");


const addSource = async (req, res) => {
  try {
    const data = await Source.create({
      ...req.body
    })

    if (data) {
      res.status(200).json({
        status: true,
        message: "Source created successfully.",
        data
      })
    } else {
      res.status(400).json({
        status: false,
        message: "Failed to create the source. Please try again."
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
        message: "Source name already exists. Please choose a different name."
      });
    }

    // General server error for other types of errors
    res.status(500).json({
      status: false,
      message: error.message,
    })
  }
}

const getSource = async (req, res) => {
  try {
    if (req.user.role === "superadmin") {
      const source = await Source.find(); // Retrieve all documents from the collection

      if (source) {
        res.status(200).json({
          status: true,
          message: "Sources fetched successfully.",
          data: source
        });
      } else {
        res.status(404).json({
          status: false,
          message: "No source found."
        });
      }
    }else {
        const user = await NewUser.findById(req.user.role === "admin" ? req.user?._id : req.user?.companyId)

        if (user) {
            res.status(200).json({
                status: true,
                message: "Sources fetched successfully.",
                data: user.sources ?? []
            });
        } else {
            res.status(404).json({
                status: false,
                message: "User source not found."
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

const deleteSource = async (req, res) => {
  try {
    const { id } = req.params
    const data = await Source.findById(id)
    if (data) {
      await Source.findByIdAndDelete(id)
      res.status(200).json({
        status: true,
        message: "Source deleted successfully."
      })
    } else {
      res.status(404).json({
        status: false,
        message: "Source not found"
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

const editSource = async (req, res) => {
  try {
    const data = await Source.findByIdAndUpdate(req.params.id, {
      ...req.body
    }, { new: true })

    if (data) {
      res.status(200).json({
        status: true,
        message: 'Source updated successfully.',
        data
      })
    } else {
      res.status(404).json({
        status: false,
        message: "Source not found!"
      })
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}

// const editSourceAccessibility = async(req, res, next) => {
//   try {
//     if(req?.user?.role === "superadmin"){
//       const adminData = await NewUser.findById(req?.params?.id)
//       // console.log("adminData", adminData)
//       if(adminData){
//         adminData.source = req.body.source
//         const updatedAdminData = await adminData.save()
//         res.status(200).json({
//           status: true,
//           message: 'Module editted successfully.',
//           data: updatedAdminData
//         })
//       }else{
//         res.status(404).json({
//           status: false,
//           message: "Admin not found!"
//         })
//       }
//     }else {
//       res.status(400).json({
//         status: false,
//         message: "Unauthorized role for this action!"
//       })
//     }
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: error.message,
//       error: error,
//     })
//   }
// }

const editSourceAccessibility = async(req, res, next) => {
  try {
    // if(req?.user?.role === "superadmin"){
      const adminData = await NewUser.findById(req?.user?.role === "superadmin" ? req?.params?.id : req?.user?._id)
      // console.log("adminData", adminData)
      if(adminData){
        adminData.sources = req.body.sources
        const updatedAdminData = await adminData.save()
        res.status(200).json({
          status: true,
          message: 'Sources editted successfully.',
          data: updatedAdminData
        })
      }else{
        res.status(404).json({
          status: false,
          message: "Admin not found!"
        })
      }
    // }else if(req?.user?.role === "admin"){
    //   const adminData = await NewUser.findById(req?.user?._id)
    //   // console.log("employeeData", employeeData)
    //   if(employeeData){
    //     employeeData.moduleAccess = req.body.moduleAccess
    //     const updatedEmployeeData = await employeeData.save()
    //     res.status(200).json({
    //       status: true,
    //       message: 'Module editted successfully.',
    //       data: updatedEmployeeData
    //     })
    //   }else{
    //     res.status(404).json({
    //       status: false,
    //       message: "Employee not found!"
    //     })
    //   }
    // }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error: error,
    })
  }
}

module.exports = {
  addSource,
  getSource,
  deleteSource,
  editSource,
  editSourceAccessibility
}