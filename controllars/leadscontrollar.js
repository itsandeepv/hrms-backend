const NewLeads = require("../models/leadsModel");


const createNewLead = async (req,res ,next)=>{
    let reqData = req.body
    try {
        let newLead =  new NewLeads({...reqData , userId: req.user?._id})
        // console.log("newLead" ,reqData ,req.user ,newLead);
       let createdLead =  await newLead.save()
        res.status(200).json({
            status:true,
            message:"Lead created succuss",
            createdLead
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status:false,
            message:"Lead not created",
            error:error
        })
    }
}
const getAllLead = async (req,res ,next)=>{
    try {
        let leads =  await NewLeads.find()
        res.status(200).json({
            status:true,
            message:" All Leads data",
            leads
        })
        
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status:false,
            message:"Server Error",
            error:error
        })
    }
}



module.exports = {createNewLead ,getAllLead }