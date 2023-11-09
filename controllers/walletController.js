const UserDB = require("../models/userModel").User;
const { localsAsTemplateData } = require("hbs");
const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productsModel").product;
const CategoryDB = require("../models/productsModel").category;
const OrderDB = require("../models/orderModel").Order;
const PaymentDB = require("../models/paymentModel").TransactionHistory;
const WalletDB = require("../models/paymentModel").Wallet;
const AnalyticsDB = require("../models/analyticModel");
const path = require("path");
const error500 = path.join(__dirname, 'views', 'error.html')

// wallet page localsAsTemplateData
// ---------------------------------
const walletPageLoader = async(req,res)=>{
    try {
        const wallet = await createUserWallet(req.session.user_id)
        const history = await PaymentDB.find({userId:req.session.user_id})
        console.log(wallet);
        const userData  =  await UserDB.findOne({_id:req.session.user_id})
        res.render("wallet",{user:req.session.user_id,history,userData,wallet})
    } catch (error) {
        console.log(error.message);
        res.status(500).sendFile(error500)
    }
}


// Function to create a user's wallet if it doesn't exist
// ---------------------------------------------------------
const createUserWallet = async(userId)=>{
    try {
        const existingWallet = await WalletDB.findOne({ user: userId });

        if (existingWallet) {
        //   console.log('User already has a wallet.');
          return existingWallet; 
        }
        const uniqueWalletId = generateUniqueWalletId(userId); 
    
        // Create a new wallet for the user
        const newWallet = new WalletDB({
          walletId: uniqueWalletId,
          user: userId,
          balance: 0, 
        });
    
        const createdWallet = await newWallet.save();
    
        console.log('User wallet created.');
        return createdWallet;
    } catch (error) {
        console.log(error.message);
    }
}

// Function to generate a unique  wallet id
// ----------------------------------------------
function generateUniqueWalletId(userId) {
    const randomPart = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    return randomPart;
  }
  

module.exports ={
    walletPageLoader,
    createUserWallet
}