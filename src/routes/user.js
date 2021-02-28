const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth  = require('../middleware/auth')

// Get all users
router.get('/users/getAll', async(req,res)=>{
    try{
        if(req.body.key!==process.env.key){
            return res.sendStatus(404)
        }
        const users = await User.find();
        res.status(201).send(users)
    }catch(e){
        res.status(400).send(e)
    }
    
})

// Dump all users
router.delete('/users/dumpAll', async(req,res)=>{
    try{
        if(req.body.key!==process.env.key){
            return res.sendStatus(404)
        }
         await User.deleteMany();
        res.status(201).send({"message":"Users Deleted"})
    }catch(e){
        console.log({"errors":e});
    }
    
})


// --------------------------Auth Routes--------------------------------
// Signup user
router.post('/users/signup',async (req, res)=>{
        const user =  new User(req.body)
        try{
            await user.save()
            const token = await user.generateToken()
            res.status(201).send({user,token})

        }
        catch(e){
            // Catch what kind of error thrown
            if(e.errors){
                let error = e.errors

                // Send error if duplicate username or email
                if(error.username){
                    res.status(400).send(error.username.message)    
                }
                if(error.email){
                    res.status(400).send(error.email.message)    
                }
            }
            res.status(400).send(e)    
        }

})


// Login user
router.post('/users/login', async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)

        const token = await user.generateToken()
        
        res.send({user,token} )
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
})


// Logout User
router.patch('/users/logout',auth, async(req,res)=>{
    try {
        // req.user.tokens = req.user.tokens.filter((token) => {
        //   return token.token !== req.token;
        // });
        // await req.user.save();
        await User.updateOne({email:req.user.email}, {tokens: req.user.tokens.filter((token) =>  token.token !== req.token)} )
        res.sendStatus(200);
      } catch (error) {
        console.log(error);
        res.sendStatus(404);
      }
}) 

// Logout User from everywhere
router.patch('/users/logoutAll',auth, async(req,res)=>{
    try {
        // req.user.tokens =[]
        // await req.user.save();
        await User.updateOne({email:req.user.email}, {tokens: [] })
        res.sendStatus(200);
      } catch (error) {
        console.log(error);
        res.sendStatus(404);
      }
})
// --------------------------Auth Routes ends--------------------------------



router.get('/users/me', auth, async(req, res)=>{
    try{
        res.send(req.user)
    }catch(e){
        res.sendStatus(404);
        console.log(e);
    }
})


// const checkforUniqueEmailorUsername=async(email,username)=>{
//     const emailUser = await User.findOne({email})

//     if(emailUser){
//         return {error: "Email already exists"}
//     }
//     const usernameUser = await User.findOne({username})
//     if(usernameUser){
//         return {error: "Username already exists"}
//     }
// }

module.exports = router