const NewLeads = require("../models/leadsModel");
const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");
const moment = require("moment");
const { publicUrl } = require("../utils/createNotefication");



// const autoLeadAssign = async (newLeadData) => {

//     let userId = '66a77fec5f8e7634012668a5'
//     const findUser = await NewUser.findById(userId)
//     const selectedEmployee = findUser?.selectedEmployee || []
//     if (selectedEmployee.length > 0) {
//         const getSecondLastLead = await NewLeads.find({ leadSource: "indiamart" }).sort({ queryTime: -1 }).skip(1).limit(1);

//         // let findEmployee = OtherUser.find({_id:{$in:selectedEmployee}})
//         let findEmployee = await OtherUser.find({ _id: { $in: selectedEmployee } });

//         let checkIsAssign = selectedEmployee.filter((item) => {
//             return item == getSecondLastLead?.leadAssignTo
//         })
//         if (checkIsAssign.length == 0) {
//             // const isLeadexist
//             // console.log("newLeadData" ,selectedEmployee);
//             findEmployee?.map(async (item, index) => {
//                 let isLeadexist = item.leadsAssign.find((lid) => { return lid == getSecondLastLead?._id })
//                 // console.log("asdfdasdfsf" ,isLeadexist);
//                 if (isLeadexist) {
//                     if (findEmployee.length == index + 1) {
//                         await NewLeads.findByIdAndUpdate(newLeadData?._id, {
//                             leadAssignTo: findEmployee[0]?._id || "",
//                             leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
//                         }, { new: true })
//                     } else {
//                         await NewLeads.findByIdAndUpdate(newLeadData?._id, {
//                             leadAssignTo: findEmployee[index + 1]?._id || "",
//                             leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
//                         }, { new: true })
//                     }

//                 } else {
//                     const upd = await NewLeads.findByIdAndUpdate(newLeadData?._id, {
//                         leadAssignTo: item?._id || "",
//                         leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
//                     }, { new: true })
//                     console.log(upd, "<<<<<<sdf");
//                     const userdata = await OtherUser.findById(item?._id);
//                     userdata.leadsAssign.push(newLeadData?._id);
//                     await userdata.save();

//                     const raw = JSON.stringify({
//                         "leadId": newLeadData?._id,
//                         "employeeId": item?._id
//                     });
//                     fetch(`${publicUrl}/auto-assign-lead`, raw).then((res) => res.json()).then((data) => {
//                     }).catch((er) => {
//                         console.log(er);
//                     })
//                 }
//             })



//         }

//         // console.log("getAllLeads", getSecondLastLead,checkIsAssign );


//     }
//     // console.log("newLeadData>>>>>", selectedEmployee);


// }

const autoLeadAssign = async (newLeadData) => {
    try {
        let userId = newLeadData?.userId;
        const findUser = await NewUser.findById(userId);
        const selectedEmployee = findUser?.selectedEmployee || [];
        
        // console.logployee, "<<<<<selectedEmployee");
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
                console.log(updatedLead, "<<<< Lead Assigned Successfully");
                const raw = JSON.stringify({
                    "leadId": newLeadData?._id,
                    "employeeId": item?._id
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