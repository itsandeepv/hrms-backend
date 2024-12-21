const NewLeads = require("../models/leadsModel");
const NewUser = require("../models/newUser");
const moment = require("moment");
const { publicUrl } = require("../utils/createNotefication");

const autoLeadAssign = async (newLeadData, io) => {
    console.log("autoLeadAssign")
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
        let lastAssignIndex = autoAssignTo.findIndex((item) => item?.empId === sourceArray?.lastAssignTo);
        let assignedTo = ""
        let nextAssignIndex = (lastAssignIndex + 1) % autoAssignTo.length;
        if(sourceArray?.haveState && sourceArray?.haveProduct){
            while(lastAssignIndex !== nextAssignIndex){
                if(lastAssignIndex === -1){
                    lastAssignIndex = 0
                }
                if(autoAssignTo[nextAssignIndex]?.states?.length > 0 && autoAssignTo[nextAssignIndex]?.products?.length > 0){
                    const isStateAllocated = autoAssignTo[nextAssignIndex]?.states?.some((state) => state?.label === newLeadData?.senderState)
                    const isProductAllocated = autoAssignTo[nextAssignIndex]?.products?.some((product) => product?.label?.toLowerCase()?.trim() === newLeadData?.queryProductName?.toLowerCase()?.trim())
                    if(isStateAllocated && isProductAllocated){
                        assignedTo = autoAssignTo[nextAssignIndex] || "";
                        break;
                    }else{
                        nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                        continue;
                    }
                }else if(autoAssignTo[nextAssignIndex]?.states?.length > 0){
                    const isStateAllocated = autoAssignTo[nextAssignIndex]?.states?.some((state) => state?.label === newLeadData?.senderState)
                    if(isStateAllocated){
                        assignedTo = autoAssignTo[nextAssignIndex] || "";
                        break;
                    }else{
                        nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                        continue;
                    }
                }else if(autoAssignTo[nextAssignIndex]?.products?.length > 0){
                    const isProductAllocated = autoAssignTo[nextAssignIndex]?.products?.some((product) => product?.label?.toLowerCase()?.trim() === newLeadData?.queryProductName?.toLowerCase()?.trim())
                    if(isProductAllocated){
                        assignedTo = autoAssignTo[nextAssignIndex] || "";
                        break;
                    }else{
                        nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                        continue;
                    }
                }else{
                    nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                    continue;
                }
            }
            
            if(assignedTo === ""){
                nextAssignIndex = (lastAssignIndex + 1) % autoAssignTo.length;
                assignedTo = autoAssignTo[nextAssignIndex] || "";
            }
            
        }else if(sourceArray?.haveState){
            while(lastAssignIndex !== nextAssignIndex){
                if(lastAssignIndex === -1){
                    lastAssignIndex = 0
                }
                if(autoAssignTo[nextAssignIndex]?.states?.length > 0){
                    const isStateAllocated = autoAssignTo[nextAssignIndex]?.states?.some((state) => state?.label === newLeadData?.senderState)
                    if(isStateAllocated){
                        assignedTo = autoAssignTo[nextAssignIndex] || "";
                        break;
                    }else{
                        nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                        continue;
                    }
                }else{
                    nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                    continue;
                }
            }
            
            if(assignedTo === ""){
                nextAssignIndex = (lastAssignIndex + 1) % autoAssignTo.length;
                assignedTo = autoAssignTo[nextAssignIndex] || "";
            }
        }else if(sourceArray?.haveProduct){
            while(lastAssignIndex !== nextAssignIndex){
                if(lastAssignIndex === -1){
                    lastAssignIndex = 0
                }
                if(autoAssignTo[nextAssignIndex]?.products?.length > 0){
                    const isProductAllocated = autoAssignTo[nextAssignIndex]?.products?.some((product) => product?.label?.toLowerCase()?.trim() === newLeadData?.queryProductName?.toLowerCase()?.trim())
                    if(isProductAllocated){
                        assignedTo = autoAssignTo[nextAssignIndex] || "";
                        break;
                    }else{
                        nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                        continue;
                    }
                }else{
                    nextAssignIndex = (nextAssignIndex + 1) % autoAssignTo.length;
                    continue;
                }
            }
            
            if(assignedTo === ""){
                nextAssignIndex = (lastAssignIndex + 1) % autoAssignTo.length;
                assignedTo = autoAssignTo[nextAssignIndex] || "";
            }
            
        }else{
            assignedTo = autoAssignTo[nextAssignIndex] || "";
        }
        
        // console.log("assignedTo", assignedTo, nextAssignIndex, lastAssignIndex)
        // Update the lead assignment
        await NewLeads.findByIdAndUpdate(
            newLeadData?._id,
            {
                leadAssignTo: assignedTo?.empId?.toString(),
                leadAssignAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { new: true }
        );

        // Update the user's source data
        sourceArray.lastAssignTo = assignedTo?.empId?.toString();
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