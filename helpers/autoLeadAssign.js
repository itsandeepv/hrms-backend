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



module.exports = { autoLeadAssign }