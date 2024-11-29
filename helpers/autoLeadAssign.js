const NewLeads = require("../models/leadsModel");
const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");
const moment = require("moment");
const { publicUrl } = require("../utils/createNotefication");




const autoLeadAssign = async (newLeadData) => {
    try {
        let userId = newLeadData?.userId;
        const findUser = await NewUser.findById(userId);
        const selectedEmployee = findUser?.selectedEmployee || [];
        if (selectedEmployee.length > 0 && findUser.autoAssigning) {
            const getSecondLastLead = await NewLeads.find({ leadSource: "indiamart" })
                .sort({ queryTime: -1 })
                .skip(1)
                .limit(1);

            if (getSecondLastLead.length > 0) {
                let employeeIndex = selectedEmployee.findIndex((item) => {
                    return item == getSecondLastLead[0]?.leadAssignTo;
                });

                const newIndex = employeeIndex != -1 && selectedEmployee?.length > employeeIndex + 1 ? employeeIndex + 1 : 0
                // console.log("checkIsAssign", checkIsAssign);
                const updatedLead = await NewLeads.findByIdAndUpdate(newLeadData?._id, {
                    leadAssignTo: selectedEmployee[newIndex] || "",
                    leadAssignAt: moment().format('YYYY-MM-DD HH:mm:ss')
                }, { new: true });

                // Update user's assigned leads
                const userdata = await OtherUser.findById(selectedEmployee[newIndex]);
                userdata.leadsAssign.push(newLeadData?._id);
                await userdata.save();
                // console.log(updatedLead, "<<<< Lead Assigned Successfully");
                const raw = JSON.stringify({
                    "leadId": newLeadData?._id,
                    "employeeId": userdata?._id
                });
                fetch(`${publicUrl}/auto-assign-lead`, raw).then((res) => res.json()).then((data) => {
                }).catch((er) => {
                    console.log(er);
                })
            }
        } else {
            console.log("No selected employees found.");
        }
    } catch (error) {
        console.error("Error in autoLeadAssign:", error);
    }
};



// module.exports = { autoLeadAssign }


// const NewLeads = require("../models/leadsModel");
// const NewUser = require("../models/newUser");
// const moment = require("moment");
// const { publicUrl } = require("../utils/createNotefication");

// const autoLeadAssign = async (newLeadData, io) => {
//     try {
//         const userId = newLeadData?.userId;
//         const findUser = await NewUser.findById(userId);

//         if (!findUser) {
//             console.log("User not found");
//             return;
//         }

//         const sourceArray = findUser?.sources?.find(
//             (item) =>
//                 item?.name?.toLowerCase() === newLeadData?.leadSource?.toLowerCase() &&
//                 item?.isIntegrated
//         );

//         if (!sourceArray) {
//             console.log("No integrated source found");
//             return;
//         }

//         const autoAssignTo = sourceArray?.autoAssignTo || [];
//         const lastAssignIndex = autoAssignTo.findIndex((item) => item === sourceArray?.lastAssignTo);
//         const nextAssignIndex = (lastAssignIndex + 1) % autoAssignTo.length;

//         const assignedTo = autoAssignTo[nextAssignIndex] || "";

//         // Update the lead assignment
//         await NewLeads.findByIdAndUpdate(
//             newLeadData?._id,
//             {
//                 leadAssignTo: assignedTo,
//                 leadAssignAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//             },
//             { new: true }
//         );

//         // Update the user's source data
//         sourceArray.lastAssignTo = assignedTo;
//         await NewUser.findByIdAndUpdate(userId, {
//             sources: findUser.sources,
//         });

//         // Create and send notification
//         const notificationDetails = {
//             title: "A new lead has been assigned to you!",
//             isRead: false,
//             userId: assignedTo,
//             leadId: newLeadData?._id,
//         };

//         const requestOptions = {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(notificationDetails),
//         };

//         await fetch(`${publicUrl}/save-notification`, requestOptions)
//             .then((res) => res.json())
//             .then(() => {
//                 io.emit("leadAssigned", notificationDetails);
//             })
//             .catch((err) => console.error("Notification error:", err));
//     } catch (error) {
//         console.error("Error in autoLeadAssign:", error);
//     }
// };

module.exports = { autoLeadAssign };
