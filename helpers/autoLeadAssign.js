const NewLeads = require("../models/leadsModel");
const NewUser = require("../models/newUser");
const moment = require("moment");
const { publicUrl } = require("../utils/createNotefication");

const autoLeadAssign = async (newLeadData, io) => {
    try {
        const userId = newLeadData?.userId;
        const findUser = await NewUser.findById(userId);

        if (!findUser) {
            console.log("User not found");
            return;
        }

        const sourceArray = findUser?.sources?.find(
            (item) =>
                item?.name?.toLowerCase() === newLeadData?.leadSource?.toLowerCase() &&
                item?.isIntegrated
        );

        if (!sourceArray) {
            console.log("No integrated source found");
            return;
        }

        const autoAssignTo = sourceArray?.autoAssignTo || [];
        const lastAssignIndex = autoAssignTo.findIndex((item) => item === sourceArray?.lastAssignTo);
        const nextAssignIndex = (lastAssignIndex + 1) % autoAssignTo.length;

        const assignedTo = autoAssignTo[nextAssignIndex] || "";

        // Update the lead assignment
        await NewLeads.findByIdAndUpdate(
            newLeadData?._id,
            {
                leadAssignTo: assignedTo,
                leadAssignAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { new: true }
        );

        // Update the user's source data
        sourceArray.lastAssignTo = assignedTo;
        await NewUser.findByIdAndUpdate(userId, {
            sources: findUser.sources,
        });

        // Create and send notification
        const notificationDetails = {
            title: "A new lead has been assigned to you!",
            isRead: false,
            userId: assignedTo,
            leadId: newLeadData?._id,
        };

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(notificationDetails),
        };

        await fetch(`${publicUrl}/save-notification`, requestOptions)
            .then((res) => res.json())
            .then(() => {
                io.emit("leadAssigned", notificationDetails);
            })
            .catch((err) => console.error("Notification error:", err));
    } catch (error) {
        console.error("Error in autoLeadAssign:", error);
    }
};

module.exports = { autoLeadAssign };